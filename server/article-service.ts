import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { Article } from '../src/types';
import { renderArticleHtml, renderHomeHtml, generateSitemapXml, generateRobotsTxt, SITE_URL } from './ssr-renderer';
import { autoPingSearchEngines, IndexingResult } from './indexing';

let dbInstance: Firestore | null = null;

export function getServerFirestore(): Firestore | null {
  if (!dbInstance) {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      try {
        const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const fbApp = initializeApp(cfg, 'server-db-app');
        dbInstance = getFirestore(fbApp, cfg.firestoreDatabaseId);
      } catch (e) {
        console.error('[ArticleService] Failed to initialize Firestore:', e);
      }
    }
  }
  return dbInstance;
}

/**
 * Fetch all articles directly from Firestore
 */
export async function getAllArticles(): Promise<Article[]> {
  const db = getServerFirestore();
  if (!db) return [];

  try {
    const snap = await getDocs(collection(db, 'articles'));
    const list: Article[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        categoryId: data.categoryId || 'society',
        categoryName: data.categoryName || '社會事件',
        author: data.author || {
          name: '莫忘舊聞特約筆者',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
          title: '專題特約研究員',
        },
        createdAt: data.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        readTimeMinutes: Number(data.readTimeMinutes) || Math.max(2, Math.ceil((data.content?.length || 0) / 300)),
        views: Number(data.views) || 0,
        likes: Number(data.likes) || 0,
        isBookmarked: false,
        tags: Array.isArray(data.tags) ? data.tags : [],
        coverImage: data.coverImage || '',
        location: data.location || '',
        facts5W1H: data.facts5W1H || undefined,
        faqs: Array.isArray(data.faqs) ? data.faqs : undefined,
        sources: Array.isArray(data.sources) ? data.sources : undefined,
      });
    });

    // Sort by createdAt descending
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('[ArticleService] Error fetching all articles:', err);
    return [];
  }
}

/**
 * Fetch a single article by ID
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const db = getServerFirestore();
  if (!db) return null;

  try {
    const docRef = doc(db, 'articles', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      id: snap.id,
      title: data.title || '',
      subtitle: data.subtitle || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      categoryId: data.categoryId || 'society',
      categoryName: data.categoryName || '社會事件',
      author: data.author || {
        name: '莫忘舊聞特約筆者',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
        title: '專題特約研究員',
      },
      createdAt: data.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      readTimeMinutes: Number(data.readTimeMinutes) || Math.max(2, Math.ceil((data.content?.length || 0) / 300)),
      views: Number(data.views) || 0,
      likes: Number(data.likes) || 0,
      isBookmarked: false,
      tags: Array.isArray(data.tags) ? data.tags : [],
      coverImage: data.coverImage || '',
      location: data.location || '',
      facts5W1H: data.facts5W1H || undefined,
      faqs: Array.isArray(data.faqs) ? data.faqs : undefined,
      sources: Array.isArray(data.sources) ? data.sources : undefined,
    };
  } catch (err) {
    console.error(`[ArticleService] Error fetching article ${id}:`, err);
    return null;
  }
}

/**
 * Write on-disk ISR files and update Sitemap + Robots + Home
 */
export async function regenerateStaticAssets(targetArticle?: Article): Promise<void> {
  try {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    const allArticles = await getAllArticles();

    // 1. If target article specified, generate its static HTML page
    if (targetArticle) {
      const articleDir = path.join(distPath, 'article', targetArticle.id);
      if (!fs.existsSync(articleDir)) {
        fs.mkdirSync(articleDir, { recursive: true });
      }
      const articleHtml = renderArticleHtml(targetArticle);
      fs.writeFileSync(path.join(articleDir, 'index.html'), articleHtml, 'utf8');
      console.log(`[ISR] Static SSR page written to: dist/article/${targetArticle.id}/index.html`);
    }

    // 2. Regenerate dist/sitemap.xml
    const sitemapContent = generateSitemapXml(allArticles);
    fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapContent, 'utf8');

    // 3. Regenerate dist/robots.txt
    const robotsContent = generateRobotsTxt();
    fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsContent, 'utf8');

    // 4. Regenerate dist/index.html with pre-rendered list
    const homeHtml = renderHomeHtml(allArticles);
    fs.writeFileSync(path.join(distPath, 'index.html'), homeHtml, 'utf8');
    console.log('[ISR] Updated dist/index.html and dist/sitemap.xml with latest articles.');
  } catch (err) {
    console.error('[ArticleService] Error regenerating static assets:', err);
  }
}

/**
 * Save Article, trigger ISR on-disk generation, and ping Search Engines
 */
export async function saveArticleAndTriggerISR(
  payload: Partial<Article> & { title: string; content: string },
  shouldPingIndexing: boolean = true
): Promise<{
  success: boolean;
  article: Article;
  url: string;
  isrGenerated: boolean;
  indexingPings: IndexingResult[];
}> {
  const db = getServerFirestore();
  if (!db) {
    throw new Error('Firestore database is not initialized on the server.');
  }

  // Generate or preserve ID
  const articleId = payload.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, 'articles', articleId);

  // Normalize tags
  let normalizedTags: string[] = [];
  if (Array.isArray(payload.tags)) {
    normalizedTags = payload.tags;
  } else if (typeof (payload as any).tags === 'string') {
    normalizedTags = (payload as any).tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  // Category mapping
  const categoryNames: Record<string, string> = {
    history: '歷史檔案',
    society: '社會事件',
    gender: '男女議題',
    economy: '經濟民生',
    culture: '文化思想',
    disaster: '天災人禍',
  };

  const categoryId = payload.categoryId || 'society';
  const categoryName = payload.categoryName || categoryNames[categoryId] || '社會事件';

  const plainExcerpt = payload.excerpt || payload.content.slice(0, 150).replace(/[#*`\n]/g, ' ').trim();
  const readTime = payload.readTimeMinutes || Math.max(2, Math.ceil(payload.content.length / 300));
  const createdAt = payload.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/');

  const articleRecord: Article = {
    id: articleId,
    title: payload.title.trim(),
    subtitle: payload.subtitle?.trim() || '',
    excerpt: plainExcerpt,
    content: payload.content,
    categoryId: categoryId,
    categoryName: categoryName,
    author: payload.author || {
      name: '莫忘舊聞特約筆者',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
      title: '專題特約研究員',
    },
    createdAt: createdAt,
    readTimeMinutes: readTime,
    views: payload.views || 0,
    likes: payload.likes || 0,
    isBookmarked: false,
    tags: normalizedTags,
    coverImage: payload.coverImage || '',
    location: payload.location || '',
    facts5W1H: payload.facts5W1H || undefined,
    faqs: payload.faqs || undefined,
    sources: payload.sources || undefined,
  };

  // 1. Write to Firestore
  const firestoreData: any = {
    title: articleRecord.title,
    subtitle: articleRecord.subtitle,
    excerpt: articleRecord.excerpt,
    content: articleRecord.content,
    categoryId: articleRecord.categoryId,
    categoryName: articleRecord.categoryName,
    author: articleRecord.author,
    createdAt: articleRecord.createdAt,
    readTimeMinutes: articleRecord.readTimeMinutes,
    views: articleRecord.views,
    likes: articleRecord.likes,
    tags: articleRecord.tags,
    coverImage: articleRecord.coverImage,
    location: articleRecord.location,
    facts5W1H: articleRecord.facts5W1H || null,
    faqs: articleRecord.faqs || null,
    sources: articleRecord.sources || null,
  };

  await setDoc(docRef, firestoreData, { merge: true });
  console.log(`[ArticleService] Saved article "${articleRecord.title}" (${articleId}) to Firestore.`);

  // 2. Trigger ISR Asset Regeneration
  await regenerateStaticAssets(articleRecord);

  // 3. Automated Search Engine & IndexNow Ping
  const articleUrl = `${SITE_URL}/article/${articleId}`;
  let indexingPings: IndexingResult[] = [];

  if (shouldPingIndexing) {
    try {
      indexingPings = await autoPingSearchEngines(articleUrl);
    } catch (pingErr) {
      console.warn('[ArticleService] Indexing ping failed non-critically:', pingErr);
    }
  }

  return {
    success: true,
    article: articleRecord,
    url: articleUrl,
    isrGenerated: true,
    indexingPings,
  };
}

/**
 * Delete an article and update sitemap
 */
export async function deleteArticleAndRegenerate(id: string): Promise<boolean> {
  const db = getServerFirestore();
  if (!db) return false;

  try {
    await deleteDoc(doc(db, 'articles', id));
    
    // Remove static folder if exists
    const distArticleDir = path.resolve(process.cwd(), 'dist/article', id);
    if (fs.existsSync(distArticleDir)) {
      fs.rmSync(distArticleDir, { recursive: true, force: true });
    }

    await regenerateStaticAssets();
    return true;
  } catch (err) {
    console.error(`[ArticleService] Error deleting article ${id}:`, err);
    return false;
  }
}
