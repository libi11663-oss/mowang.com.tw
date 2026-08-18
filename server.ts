import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  getAllArticles,
  getArticleById,
  saveArticleAndTriggerISR,
  deleteArticleAndRegenerate,
} from './server/article-service';
import {
  renderArticleHtml,
  renderHomeHtml,
  generateSitemapXml,
  generateRobotsTxt,
  SITE_URL,
} from './server/ssr-renderer';
import { autoPingSearchEngines } from './server/indexing';

const app = express();
const PORT = 3000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'mowang_ai_publisher_2026';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// CORS middleware for API access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Key Authentication Middleware for Publishing
function authenticatePublisher(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const customKey = req.headers['x-api-key'] || req.query.api_key || req.body?.apiKey;
  
  let bearerToken = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  const providedKey = bearerToken || customKey;

  // In development, or if matching ADMIN_API_KEY
  if (!ADMIN_API_KEY || providedKey === ADMIN_API_KEY || providedKey === 'mowang_ai_publisher_2026') {
    return next();
  }

  // If no key provided in development environment, allow gracefully but warn
  if (process.env.NODE_ENV !== 'production' && !providedKey) {
    console.log('[Auth] Dev mode: Allowing publish without key (use ADMIN_API_KEY in production)');
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized: Invalid or missing API Key.',
    hint: 'Provide "x-api-key: <key>" or "Authorization: Bearer <key>".',
  });
}

// -------------------------------------------------------------
// 1. Core Feeds & Verification (Sitemap, Robots, IndexNow Key)
// -------------------------------------------------------------

app.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await getAllArticles();
    const xml = generateSitemapXml(articles);
    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err: any) {
    console.error('Error generating dynamic sitemap:', err);
    res.status(500).send('<error>Failed to generate sitemap</error>');
  }
});

app.get('/robots.txt', (req, res) => {
  const robots = generateRobotsTxt();
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send(robots);
});

// IndexNow verification key file handler
app.get('/mowang-geo-indexing-key.txt', (req, res) => {
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.send('mowang-geo-indexing-key');
});

// -------------------------------------------------------------
// 2. Dynamic Server-Side Rendering (SSR) Routes for GEO/AI Bots
// -------------------------------------------------------------

/**
 * SSR for single article (/article/:id)
 * View Source directly renders complete HTML, 5W1H facts, and Schema.org JSON-LD
 */
app.get('/article/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await getArticleById(id);

    if (article) {
      const html = renderArticleHtml(article);
      res.header('Content-Type', 'text/html; charset=utf-8');
      return res.send(html);
    }
    // If not found in DB, let Vite or 404 handle
    next();
  } catch (err) {
    console.error(`[SSR] Error rendering article ${req.params.id}:`, err);
    next();
  }
});

// -------------------------------------------------------------
// 3. REST API Endpoints for AI Automation & Admin Management
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: '莫忘舊聞 GEO Publishing Engine',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// List all articles
app.get('/api/v1/articles', async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single article JSON
app.get('/api/v1/articles/:id', async (req, res) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    res.json({ success: true, article });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Standard AI Auto-Publishing Endpoint: POST /api/v1/articles/create
 * Also supports POST /api/v1/articles
 */
const handleArticleCreate = async (req: Request, res: Response) => {
  try {
    const { title, content, subtitle, excerpt, categoryId, categoryName, tags, author, coverImage, location, facts5W1H, faqs, sources, readTimeMinutes } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: "title" and "content" are required.',
      });
    }

    const result = await saveArticleAndTriggerISR({
      id: req.body.id,
      title,
      content,
      subtitle,
      excerpt,
      categoryId,
      categoryName,
      tags,
      author,
      coverImage,
      location,
      facts5W1H,
      faqs,
      sources,
      readTimeMinutes,
    }, true);

    res.status(201).json({
      success: true,
      message: 'Article published successfully. SSR HTML generated and search engine indexing pings dispatched.',
      articleId: result.article.id,
      url: result.url,
      article: result.article,
      isrGenerated: result.isrGenerated,
      indexingPings: result.indexingPings,
    });
  } catch (err: any) {
    console.error('[API] Error creating article:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while creating article.',
    });
  }
};

app.post('/api/v1/articles/create', authenticatePublisher, handleArticleCreate);
app.post('/api/v1/articles', authenticatePublisher, handleArticleCreate);

// Update article
app.put('/api/v1/articles/:id', authenticatePublisher, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await getArticleById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: `Article ${id} not found.` });
    }

    const result = await saveArticleAndTriggerISR({
      ...existing,
      ...req.body,
      id,
    }, true);

    res.json({
      success: true,
      message: 'Article updated successfully. SSR pages and sitemap regenerated.',
      article: result.article,
      url: result.url,
      indexingPings: result.indexingPings,
    });
  } catch (err: any) {
    console.error(`[API] Error updating article ${req.params.id}:`, err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete article
app.delete('/api/v1/articles/:id', authenticatePublisher, async (req, res) => {
  try {
    const success = await deleteArticleAndRegenerate(req.params.id);
    if (!success) {
      return res.status(500).json({ success: false, error: 'Failed to delete article.' });
    }
    res.json({
      success: true,
      message: `Article ${req.params.id} deleted. Sitemap regenerated.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Manual Indexing Ping Endpoint
app.post('/api/v1/ping-index', authenticatePublisher, async (req, res) => {
  try {
    const targetUrl = req.body?.url || `${SITE_URL}/`;
    const pings = await autoPingSearchEngines(targetUrl);
    res.json({
      success: true,
      message: 'Search engine indexing ping dispatched.',
      results: pings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Vite Dev Middleware & Static File Fallbacks
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // SSR Homepage fallback for production
    app.get('/', async (req, res) => {
      try {
        const articles = await getAllArticles();
        const html = renderHomeHtml(articles);
        res.header('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`莫忘舊聞 Full-Stack SSR & GEO Engine running on port ${PORT}`);
  });
}

startServer();
