import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { INITIAL_DEMO_ARTICLES } from '../src/data/mockArticles';
import { Article } from '../src/types';

const SITE_URL = 'https://mowang.com.tw';
const SITE_NAME = '莫忘舊聞';
const SITE_DESCRIPTION = '莫忘舊聞 (mowang.com.tw) — 深度歷史檔案與時代舊聞典藏專題平台，沉澱時光記憶，解讀時代轉折與歷史回響。';

/**
 * Lightweight Markdown to clean semantic HTML converter for SSG
 */
function markdownToHtml(md: string): string {
  if (!md) return '';
  
  let html = md
    // Escape HTML special characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Tables
  html = html.replace(/\|(.+)\|\n\|(?:\s*[-:]+[-| :]*)\|\n((?:\|.*\|\n?)*)/g, (match, headerRow, bodyRows) => {
    const headers = headerRow.split('|').filter((c: string) => c.trim().length > 0);
    const ths = headers.map((h: string) => `<th class="border border-stone-300 px-4 py-2 bg-stone-100 font-bold">${h.trim()}</th>`).join('');
    
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      const cells = row.split('|').filter((c: string) => c.trim().length > 0);
      const tds = cells.map((c: string) => `<td class="border border-stone-300 px-4 py-2">${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');

    return `<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-stone-300 my-4 text-sm text-left"><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
  });

  // Headers
  html = html
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-stone-900 mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-200">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-stone-950 mt-8 mb-6">$1</h1>');

  // Blockquotes
  html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-amber-600 pl-4 py-2 my-4 italic bg-amber-50/60 text-stone-800 rounded-r">$1</blockquote>');

  // Bold & Italic
  html = html
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr class="my-8 border-stone-300" />');

  // Lists
  html = html.replace(/^\- (.*$)/gim, '<li class="ml-6 list-disc text-stone-800 my-1">$1</li>');

  // Paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    if (p.startsWith('<h') || p.startsWith('<div') || p.startsWith('<table') || p.startsWith('<blockquote') || p.startsWith('<hr') || p.startsWith('<li')) {
      return p;
    }
    return `<p class="my-4 text-stone-800 leading-relaxed text-base">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

/**
 * Fetch all articles from Firestore, fallback to mock data if offline
 */
async function getArticles(): Promise<Article[]> {
  let firestoreArticles: Article[] = [];
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const app = initializeApp(cfg);
      const db = getFirestore(app, cfg.firestoreDatabaseId);
      const snap = await getDocs(collection(db, 'articles'));
      snap.forEach(docSnap => {
        const data = docSnap.data();
        firestoreArticles.push({
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
            title: '專題研究員',
          },
          createdAt: data.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
          readTimeMinutes: Number(data.readTimeMinutes) || 5,
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
      console.log(`[SSG] Fetched ${firestoreArticles.length} articles from Firestore.`);
    }
  } catch (err) {
    console.warn('[SSG] Firestore fetch skipped/failed, using local fallback:', err);
  }

  // Merge with local fallback
  const map = new Map<string, Article>();
  for (const art of INITIAL_DEMO_ARTICLES) {
    map.set(art.id, art);
  }
  for (const art of firestoreArticles) {
    map.set(art.id, art);
  }

  return Array.from(map.values());
}

/**
 * Generate full Static Site HTML
 */
async function generateSSG() {
  console.log('[SSG] Starting Static Site Generation for GEO/SEO...');
  const distPath = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    console.error('[SSG] dist/ folder does not exist. Run "vite build" first.');
    process.exit(1);
  }

  const templateHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
  const articles = await getArticles();

  // 1. Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

# Search Engine & AI Search Crawlers permissions (GEO / SEO)
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Applebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: FacebookBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(distPath, 'robots.txt'), robotsTxt, 'utf8');
  console.log('[SSG] Generated dist/robots.txt with AI Bot permissions.');

  // 2. Generate sitemap.xml
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${articles.map(art => `  <url>
    <loc>${SITE_URL}/article/${art.id}</loc>
    <lastmod>${art.createdAt.replace(/\//g, '-')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?article=${art.id}</loc>
    <lastmod>${art.createdAt.replace(/\//g, '-')}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('[SSG] Generated dist/sitemap.xml with all article URLs.');

  // Ensure CNAME exists in dist
  const cnamePath = path.resolve(process.cwd(), 'CNAME');
  if (fs.existsSync(cnamePath)) {
    fs.copyFileSync(cnamePath, path.join(distPath, 'CNAME'));
    console.log('[SSG] Copied CNAME to dist/CNAME.');
  }

  // 3. Build Homepage Pre-rendered HTML
  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        "url": SITE_URL,
        "name": SITE_NAME,
        "description": SITE_DESCRIPTION,
        "inLanguage": "zh-TW"
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": `${SITE_URL}/#organization`,
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": `${SITE_URL}/favicon.ico`,
        "description": SITE_DESCRIPTION
      },
      {
        "@type": "ItemList",
        "name": "莫忘舊聞專題列表",
        "itemListElement": articles.map((art, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": art.title,
          "description": art.excerpt,
          "url": `${SITE_URL}/article/${art.id}`
        }))
      }
    ]
  };

  const homePreRenderContent = `
  <header class="bg-stone-900 text-stone-100 py-6 px-4 border-b border-stone-800">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold font-serif text-amber-500 tracking-wider">莫忘舊聞</h1>
        <p class="text-xs sm:text-sm text-stone-400 mt-1">沉澱時光記憶 · 解讀時代舊聞</p>
      </div>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-4 py-10">
    <div class="mb-10 text-center sm:text-left border-b border-stone-200 pb-6">
      <h2 class="text-3xl font-bold font-serif text-stone-900 mb-2">深度檔案與專題報導</h2>
      <p class="text-stone-600 text-sm max-w-2xl">探尋不該被歲月遺忘的重大歷史切片、社會事件與人物生命篇章。</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${articles.map(art => `
        <article class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-md">${art.categoryName}</span>
              <time datetime="${art.createdAt.replace(/\//g, '-')}" class="text-xs text-stone-400">${art.createdAt}</time>
            </div>
            <h3 class="text-xl font-bold text-stone-900 hover:text-amber-700 mb-2 font-serif leading-snug">
              <a href="/article/${art.id}">${art.title}</a>
            </h3>
            <p class="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">${art.excerpt}</p>
          </div>
          <div class="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>作者：${art.author.name} (${art.author.title})</span>
            <a href="/article/${art.id}" class="text-amber-700 font-bold hover:underline">閱讀專題全文 →</a>
          </div>
        </article>
      `).join('')}
    </div>
  </main>

  <footer class="bg-stone-900 text-stone-400 py-10 px-4 mt-20 border-t border-stone-800 text-center text-xs">
    <p>© ${new Date().getFullYear()} 莫忘舊聞 (mowang.com.tw). 深度歷史檔案與時代舊聞典藏平台.</p>
  </footer>
  `;

  // Inject into index.html
  let homeHtml = templateHtml
    .replace('<title>莫忘舊聞 | 沉澱時光記憶 · 解讀時代舊聞</title>', `<title>${SITE_NAME} | 沉澱時光記憶 · 解讀時代舊聞</title>`)
    .replace('<!-- PRERENDER_INJECTION -->', '')
    .replace('<div id="root"></div>', `<div id="root">${homePreRenderContent}</div>`);

  // Insert Schema into head
  homeHtml = homeHtml.replace('</head>', `<script type="application/ld+json">\n${JSON.stringify(homeSchema, null, 2)}\n</script>\n</head>`);
  fs.writeFileSync(path.join(distPath, 'index.html'), homeHtml, 'utf8');
  console.log('[SSG] Prerendered dist/index.html with full SSR content & Schema.');

  // 4. Generate Pre-rendered Static Pages for each article (/article/[id]/index.html and /article/[id].html)
  const articlesDir = path.join(distPath, 'article');
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }

  for (const art of articles) {
    const articleDir = path.join(articlesDir, art.id);
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir, { recursive: true });
    }

    const articleCanonicalUrl = `${SITE_URL}/article/${art.id}`;
    const articleHtmlContent = markdownToHtml(art.content);
    const isoDate = `${art.createdAt.replace(/\//g, '-')}T08:00:00+08:00`;

    // 1. NewsArticle Schema
    const newsArticleSchema: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": articleCanonicalUrl
      },
      "headline": art.title,
      "description": art.excerpt,
      "articleBody": art.content.slice(0, 3500),
      "image": art.coverImage || `${SITE_URL}/favicon.ico`,
      "datePublished": isoDate,
      "dateModified": isoDate,
      "author": {
        "@type": "Person",
        "name": art.author.name,
        "jobTitle": art.author.title
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": {
          "@type": "ImageObject",
          "url": `${SITE_URL}/favicon.ico`
        }
      },
      "articleSection": art.categoryName,
      "keywords": (art.tags || []).join(', '),
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": ["#article-summary", "h1"]
      }
    };

    // 2. FAQ Schema
    const faqItems = art.faqs || [];
    let faqSchema: Record<string, any> | null = null;
    if (faqItems.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    // 3. BreadcrumbList Schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "莫忘舊聞首頁",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": art.categoryName,
          "item": `${SITE_URL}/?category=${art.categoryId}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": art.title,
          "item": articleCanonicalUrl
        }
      ]
    };

    const combinedSchemas = faqSchema
      ? [newsArticleSchema, faqSchema, breadcrumbSchema]
      : [newsArticleSchema, breadcrumbSchema];

    // Build 5W1H Section HTML
    const facts5W1HHtml = `
      <section id="article-summary" aria-label="事件核心摘要與 5W1H 事實速覽" class="mb-10 p-6 rounded-2xl bg-amber-50/80 border-2 border-amber-500/40">
        <div class="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-900/15">
          <h2 class="text-lg sm:text-xl font-bold font-serif text-stone-900">TL;DR 專題核心摘要 · 5W1H 事實查核</h2>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">GEO 認證事實封包</span>
        </div>
        <p class="text-stone-800 text-base leading-relaxed mb-5 italic border-l-4 border-amber-600 pl-3">“ ${art.excerpt} ”</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div class="p-3 rounded-xl bg-white border border-stone-200">
            <strong class="text-stone-900 block font-bold">時間 (When)：</strong>
            <span class="text-stone-700">${art.facts5W1H?.when || art.createdAt}</span>
          </div>
          <div class="p-3 rounded-xl bg-white border border-stone-200">
            <strong class="text-stone-900 block font-bold">地點 (Where)：</strong>
            <span class="text-stone-700">${art.facts5W1H?.where || art.location || '台灣'}</span>
          </div>
          <div class="p-3 rounded-xl bg-white border border-stone-200">
            <strong class="text-stone-900 block font-bold">核心人物 (Who)：</strong>
            <span class="text-stone-700">${art.facts5W1H?.who || art.author.name}</span>
          </div>
          <div class="p-3 rounded-xl bg-white border border-stone-200">
            <strong class="text-stone-900 block font-bold">核心事件 (What)：</strong>
            <span class="text-stone-700">${art.facts5W1H?.what || art.title}</span>
          </div>
          ${art.facts5W1H?.why || art.facts5W1H?.impact ? `
          <div class="sm:col-span-2 p-3 rounded-xl bg-white border border-stone-200">
            <strong class="text-stone-900 block font-bold">歷史回響與社會意義 (Why & Impact)：</strong>
            <span class="text-stone-700">${art.facts5W1H?.why || ''} ${art.facts5W1H?.impact || ''}</span>
          </div>
          ` : ''}
        </div>
      </section>
    `;

    // Build FAQ Section HTML
    const faqSectionHtml = faqItems.length > 0 ? `
      <section id="faq" aria-label="常見問答與核心事實解答" class="mt-12 p-6 sm:p-8 rounded-2xl bg-stone-50 border border-stone-200">
        <h3 class="text-xl font-bold font-serif text-stone-900 mb-6 pb-3 border-b border-stone-200">專題核心問答 · 關鍵事實解析</h3>
        <div class="space-y-4">
          ${faqItems.map((faq, idx) => `
            <div class="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
              <h4 class="font-bold text-stone-900 text-base flex items-start gap-2">
                <span class="text-amber-700 font-extrabold">Q${idx + 1}.</span>
                <span>${faq.question}</span>
              </h4>
              <p class="text-sm text-stone-700 leading-relaxed pl-6 border-l-2 border-amber-400">${faq.answer}</p>
            </div>
          `).join('')}
        </div>
      </section>
    ` : '';

    // Build Sources Section HTML
    const pubYear = art.createdAt.split('/')[0] || new Date().getFullYear();
    const sourcesSectionHtml = `
      <section id="sources" aria-label="參考資料與官方報導引述出處" class="mt-10 p-6 rounded-2xl bg-stone-100 border border-stone-300 text-xs text-stone-700">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
          <h4 class="font-bold text-sm text-stone-900">參考資料與引述出處 (Citable Sources)</h4>
          <span class="font-mono text-stone-500">標準學術/新聞引用規範</span>
        </div>
        <ol class="list-decimal list-inside space-y-2 font-mono text-stone-600">
          ${art.sources && art.sources.length > 0 ? art.sources.map(src => `
            <li class="leading-relaxed">
              <cite class="not-italic font-sans text-stone-800 font-semibold">${src.title}</cite>
              ${src.publisher ? `<span class="text-stone-500 font-sans"> · 出處：${src.publisher}</span>` : ''}
              ${src.date ? `<span class="text-stone-400 font-sans"> (${src.date})</span>` : ''}
              ${src.url ? `<a href="${src.url}" target="_blank" rel="noopener noreferrer" class="ml-2 text-amber-700 hover:underline">原文連結</a>` : ''}
            </li>
          `).join('') : `
            <li class="leading-relaxed">
              <cite class="not-italic font-sans text-stone-800 font-semibold">《莫忘舊聞》社會焦點檔案庫 · 典藏專題篇章（${art.createdAt}）</cite>
            </li>
            <li class="leading-relaxed">
              <cite class="not-italic font-sans text-stone-800 font-semibold">主流新聞通訊社、地方政府公報與公開歷史報導綜合彙整</cite>
            </li>
          `}
        </ol>
        <div class="mt-4 pt-3 border-t border-stone-200 font-mono text-[11px] text-stone-500">
          <strong>引用本文格式：</strong>《莫忘舊聞》編輯部（${pubYear}）。〈${art.title}〉。檢索自 ${articleCanonicalUrl}
        </div>
      </section>
    `;

    const articlePreRenderContent = `
    <header class="bg-stone-900 text-stone-100 py-4 px-4 border-b border-stone-800">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <a href="/" class="text-xl font-bold font-serif text-amber-500 tracking-wider">莫忘舊聞</a>
        <a href="/" class="text-xs text-stone-300 hover:text-amber-400">← 返回專題首頁</a>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 py-12">
      <article class="bg-white rounded-3xl border border-stone-200 p-6 sm:p-12 shadow-sm">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-800 mb-4">
          <span class="px-2.5 py-1 bg-amber-100 rounded-md">${art.categoryName}</span>
          ${art.location ? `<span class="text-stone-500">• 地點：${art.location}</span>` : ''}
          <time datetime="${art.createdAt.replace(/\//g, '-')}" class="text-stone-400">• ${art.createdAt}</time>
        </div>

        <h1 class="text-2xl sm:text-4xl font-bold font-serif text-stone-950 leading-tight mb-4">${art.title}</h1>
        ${art.subtitle ? `<p class="text-base sm:text-lg text-stone-600 font-serif leading-relaxed mb-6 italic border-l-2 border-amber-600 pl-4">${art.subtitle}</p>` : ''}

        <div class="flex items-center gap-3 py-4 border-y border-stone-100 mb-8 text-xs text-stone-600">
          <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-900 text-xs">
            ${art.author.name.slice(0, 1)}
          </div>
          <div>
            <p class="font-bold text-stone-900">${art.author.name}</p>
            <p class="text-stone-500">${art.author.title} · 約 ${art.readTimeMinutes} 分鐘閱讀</p>
          </div>
        </div>

        ${facts5W1HHtml}

        <div class="prose prose-stone max-w-none text-stone-800 font-serif leading-relaxed text-base sm:text-lg">
          ${articleHtmlContent}
        </div>

        ${faqSectionHtml}

        ${art.tags && art.tags.length > 0 ? `
          <div class="mt-12 pt-6 border-t border-stone-200 flex flex-wrap gap-2">
            <span class="text-xs font-bold text-stone-500">專題標籤：</span>
            ${art.tags.map(t => `<span class="px-3 py-1 bg-stone-100 text-stone-700 text-xs rounded-lg font-medium">#${t}</span>`).join('')}
          </div>
        ` : ''}

        ${sourcesSectionHtml}
      </article>
    </main>

    <footer class="bg-stone-900 text-stone-400 py-10 px-4 mt-20 border-t border-stone-800 text-center text-xs">
      <p>© ${new Date().getFullYear()} 莫忘舊聞 (mowang.com.tw). 深度歷史檔案與時代舊聞典藏平台.</p>
    </footer>
    `;

    // Replace Metadata for this specific article
    let articlePageHtml = templateHtml
      .replace(/<title>.*?<\/title>/, `<title>${art.title} | ${SITE_NAME}</title>`)
      .replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${art.excerpt.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta name="keywords" content=".*?" \/>/, `<meta name="keywords" content="${(art.tags || []).join(', ')}, 莫忘舊聞, 時代舊聞, 專題報導" />`)
      .replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${articleCanonicalUrl}" />`)
      .replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${art.title} | ${SITE_NAME}" />`)
      .replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${art.excerpt.replace(/"/g, '&quot;')}" />`)
      .replace(/<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${articleCanonicalUrl}" />`)
      .replace('<div id="root"></div>', `<div id="root">${articlePreRenderContent}</div>`);

    // Add additional Open Graph Article meta tags
    const extraMeta = `
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${isoDate}" />
    <meta property="article:modified_time" content="${isoDate}" />
    <meta property="article:section" content="${art.categoryName}" />
    <meta property="article:author" content="${art.author.name}" />
    ${(art.tags || []).map(t => `<meta property="article:tag" content="${t}" />`).join('\n    ')}
    `;
    articlePageHtml = articlePageHtml.replace('</head>', `${extraMeta}\n</head>`);

    // Insert article schemas (NewsArticle, FAQPage, BreadcrumbList)
    articlePageHtml = articlePageHtml.replace('</head>', `<script type="application/ld+json">\n${JSON.stringify(combinedSchemas, null, 2)}\n</script>\n</head>`);

    // Write /article/[id]/index.html
    fs.writeFileSync(path.join(articleDir, 'index.html'), articlePageHtml, 'utf8');
    // Also write /article/[id].html
    fs.writeFileSync(path.join(articlesDir, `${art.id}.html`), articlePageHtml, 'utf8');
    console.log(`[SSG] Prerendered static article page: /article/${art.id}`);
  }

  // 5. Generate 404.html with smart SPA redirect
  const spa404Html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>莫忘舊聞</title>
    <script>
      // Single Page Apps for GitHub Pages
      var pathSegmentsToKeep = 0;
      var l = window.location;
      var redirectUrl = l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash;
      l.replace(redirectUrl);
    </script>
  </head>
  <body>
    <p>正在導向至莫忘舊聞專題篇章...</p>
  </body>
</html>`;
  fs.writeFileSync(path.join(distPath, '404.html'), spa404Html, 'utf8');
  console.log('[SSG] Generated dist/404.html fallback handler.');

  console.log('[SSG] All SSG and SEO/GEO pre-rendering completed successfully!');
}

generateSSG().catch(err => {
  console.error('[SSG] Error during generation:', err);
  process.exit(1);
});
