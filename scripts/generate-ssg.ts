import fs from 'fs';
import path from 'path';
import { getAllArticles } from '../server/article-service';
import { renderArticleHtml, renderHomeHtml, generateSitemapXml, generateRobotsTxt } from '../server/ssr-renderer';

async function generateSSG() {
  console.log('[SSG] Starting Static Site Generation for GEO/SEO...');

  const distPath = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('[SSG] Error: dist/ directory not found. Please run "vite build" first.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  const articles = await getAllArticles();
  console.log(`[SSG] Fetched ${articles.length} real articles from Firestore.`);

  // 1. Generate robots.txt
  const robotsTxt = generateRobotsTxt();
  fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsTxt, 'utf8');
  console.log('[SSG] Generated dist/robots.txt with AI Bot permissions.');

  // 2. Generate sitemap.xml
  const sitemapXml = generateSitemapXml(articles);
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('[SSG] Generated dist/sitemap.xml with all article URLs.');

  // Ensure CNAME exists in dist
  const cnamePath = path.resolve(process.cwd(), 'CNAME');
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(distPath, 'CNAME'));
    console.log('[SSG] Copied CNAME to dist/CNAME.');
  }

  // 3. Build Homepage Pre-rendered HTML
  const homeHtml = renderHomeHtml(articles, templateHtml);
  fs.writeFileSync(path.join(distPath, 'index.html'), homeHtml, 'utf8');
  console.log('[SSG] Successfully pre-rendered dist/index.html with real database articles.');

  // 4. Generate Pre-rendered Static Pages for Every Single Article
  for (const article of articles) {
    const articleDir = path.join(distPath, 'article', article.id);
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true });
    }

    const articleHtml = renderArticleHtml(article, templateHtml);
    fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf8');
    console.log(`[SSG] Pre-rendered: dist/article/${article.id}/index.html (${article.title})`);
  }

  console.log('[SSG] Static Site Generation completed successfully with full GEO compliance!');
}

generateSSG().catch((err) => {
  console.error('[SSG] Fatal error during SSG:', err);
  process.exit(1);
});
