import fs from 'fs';
import path from 'path';
import { Article } from '../src/types';

export const SITE_URL = 'https://mowang.com.tw';
export const SITE_NAME = '莫忘舊聞';
export const SITE_DESCRIPTION = '莫忘舊聞 (mowang.com.tw) — 深度歷史檔案與時代舊聞典藏專題平台，沉澱時光記憶，解讀時代轉折與歷史回響。';

/**
 * Lightweight Markdown to clean semantic HTML converter for SSR/SSG
 */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  
  let html = md
    // Escape special HTML chars
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
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-stone-900 mt-6 mb-3 font-serif">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-stone-900 mt-8 mb-4 pb-2 border-b border-stone-200 font-serif">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-stone-950 mt-8 mb-6 font-serif">$1</h1>');

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
 * Get base template HTML (either from dist/index.html or root index.html)
 */
export function getBaseTemplateHtml(): string {
  const distTemplate = path.resolve(process.cwd(), 'dist/index.html');
  if (fs.existsSync(distTemplate)) {
    return fs.readFileSync(distTemplate, 'utf8');
  }
  const rootTemplate = path.resolve(process.cwd(), 'index.html');
  return fs.readFileSync(rootTemplate, 'utf8');
}

/**
 * Render Complete SSR/SSG HTML for Single Article
 */
export function renderArticleHtml(article: Article, templateHtml?: string): string {
  const base = templateHtml || getBaseTemplateHtml();
  const articleUrl = `${SITE_URL}/article/${article.id}`;
  const isoDate = `${article.createdAt.replace(/\//g, '-')}T08:00:00+08:00`;
  const plainExcerpt = article.excerpt || article.content.slice(0, 150).replace(/[#*`]/g, '');
  const coverImage = article.coverImage || `${SITE_URL}/favicon.ico`;
  const renderedBodyHtml = markdownToHtml(article.content);

  // 1. JSON-LD Schemas (NewsArticle, FAQPage, BreadcrumbList)
  const newsArticleSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "headline": article.title,
    "description": plainExcerpt,
    "image": [coverImage],
    "datePublished": isoDate,
    "dateModified": isoDate,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "莫忘舊聞特約筆者",
      "jobTitle": article.author?.title || "專題研究員"
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
    "articleSection": article.categoryName,
    "keywords": (article.tags || []).join(', '),
    "articleBody": article.content.slice(0, 3500),
    "inLanguage": "zh-TW",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["#article-summary", "h1", "#facts-5w1h"]
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "莫忘舊聞首頁",
        "item": `${SITE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": article.categoryName,
        "item": `${SITE_URL}/?category=${article.categoryId}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": articleUrl
      }
    ]
  };

  const schemaGraph: any[] = [newsArticleSchema, breadcrumbSchema];

  if (article.faqs && article.faqs.length > 0) {
    schemaGraph.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": article.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // 2. Pre-rendered HTML Semantic Layout for View Source / AI Crawlers
  const preRenderedContent = `
  <header class="bg-stone-900 text-stone-100 py-6 px-4 border-b border-stone-800">
    <div class="max-w-4xl mx-auto flex justify-between items-center">
      <a href="/" class="text-xl sm:text-2xl font-bold font-serif text-amber-500 tracking-wider hover:text-amber-400">莫忘舊聞</a>
      <a href="/" class="text-xs text-stone-400 hover:text-stone-200">← 返回專題典藏庫</a>
    </div>
  </header>

  <article class="max-w-4xl mx-auto px-4 py-8 sm:py-12 bg-white" itemscope itemtype="https://schema.org/NewsArticle">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-stone-500 mb-6" aria-label="Breadcrumb">
      <a href="/" class="hover:underline">首頁</a>
      <span>›</span>
      <a href="/?category=${article.categoryId}" class="hover:underline">${article.categoryName}</a>
      <span>›</span>
      <span class="text-stone-800 font-medium truncate">${article.title}</span>
    </nav>

    <!-- Header & Meta -->
    <header class="mb-8 border-b border-stone-200 pb-6">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-md" itemprop="articleSection">${article.categoryName}</span>
        <time itemprop="datePublished" datetime="${isoDate}" class="text-xs text-stone-500">${article.createdAt}</time>
        ${article.location ? `<span class="text-xs text-stone-500">📍 ${article.location}</span>` : ''}
        <span class="text-xs text-stone-400">約 ${article.readTimeMinutes || 3} 分鐘閱讀</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-bold font-serif text-stone-950 leading-tight mb-4" itemprop="headline">${article.title}</h1>
      ${article.subtitle ? `<p class="text-lg text-stone-600 font-serif leading-relaxed mb-4">${article.subtitle}</p>` : ''}

      <div class="flex items-center gap-3 pt-4 border-t border-stone-100 text-xs text-stone-600">
        <span itemprop="author" itemscope itemtype="https://schema.org/Person">
          特約筆者：<strong itemprop="name" class="text-stone-900">${article.author?.name || '莫忘舊聞特約筆者'}</strong>
          (${article.author?.title || '專題研究員'})
        </span>
      </div>
    </header>

    <!-- Cover Image -->
    ${article.coverImage ? `
    <div class="my-8">
      <img src="${article.coverImage}" alt="${article.title}" class="w-full max-h-96 object-cover rounded-xl border border-stone-200 shadow-sm" itemprop="image" />
    </div>
    ` : ''}

    <!-- Main Article Body -->
    <div class="prose prose-stone max-w-none text-stone-800 leading-relaxed font-sans text-base sm:text-lg my-8" itemprop="articleBody">
      ${renderedBodyHtml}
    </div>

    <!-- GEO: Structured FAQ Section -->
    ${article.faqs && article.faqs.length > 0 ? `
    <section class="my-12 p-6 bg-stone-50 border border-stone-200 rounded-2xl">
      <h2 class="text-xl font-bold font-serif text-stone-900 mb-6 flex items-center gap-2">
        <span>❓ 常見疑問與事實查核 (FAQ & Fact-Check)</span>
      </h2>
      <div class="space-y-4">
        ${article.faqs.map((faq, idx) => `
        <div class="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <h3 class="text-base font-bold text-stone-900 mb-2">Q${idx + 1}：${faq.question}</h3>
          <p class="text-sm text-stone-700 leading-relaxed">A：${faq.answer}</p>
        </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <!-- GEO: Citation & Sources Section -->
    ${article.sources && article.sources.length > 0 ? `
    <section class="my-8 p-6 bg-amber-50/40 border border-amber-200/80 rounded-2xl text-xs text-stone-600">
      <h3 class="font-bold text-stone-900 text-sm mb-3">📚 資料來源與事實文獻引用 (Sources & References)</h3>
      <ul class="space-y-1.5 list-disc ml-5">
        ${article.sources.map(s => `
        <li>
          <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="text-amber-800 hover:underline font-medium">${s.title}</a>
          ${s.sourceName ? `<span class="text-stone-400"> (${s.sourceName})</span>` : ''}
          ${s.date ? `<span class="text-stone-400"> - ${s.date}</span>` : ''}
        </li>
        `).join('')}
      </ul>
    </section>
    ` : ''}

    <!-- Tags -->
    ${article.tags && article.tags.length > 0 ? `
    <div class="mt-8 pt-6 border-t border-stone-200 flex flex-wrap gap-2 items-center">
      <span class="text-xs text-stone-500 font-bold">主題標籤：</span>
      ${article.tags.map(t => `<a href="/?search=${encodeURIComponent(t)}" class="px-2.5 py-1 text-xs bg-stone-100 text-stone-700 rounded-md hover:bg-amber-100 hover:text-amber-900 transition-colors">#${t}</a>`).join('')}
    </div>
    ` : ''}
  </article>

  <footer class="bg-stone-900 text-stone-400 py-10 px-4 mt-20 border-t border-stone-800 text-center text-xs">
    <p>© ${new Date().getFullYear()} 莫忘舊聞 (mowang.com.tw). 深度歷史檔案與時代舊聞典藏平台.</p>
  </footer>
  `;

  // 3. Inject Meta Tags, Title and Schema into Base Template
  let result = base;

  // Replace Title
  result = result.replace(/<title>.*?<\/title>/i, `<title>${article.title} | ${SITE_NAME}</title>`);

  // Replace / Inject Meta Tags
  const metaTags = `
    <!-- GEO & SEO Dynamic SSR Meta -->
    <meta name="description" content="${plainExcerpt.replace(/"/g, '&quot;')}" />
    <meta name="keywords" content="${(article.tags || []).join(', ')}, ${article.categoryName}, 莫忘舊聞, 歷史新聞, 深度專題" />
    <meta name="author" content="${article.author?.name || '莫忘舊聞特約筆者'}" />
    <link rel="canonical" href="${articleUrl}" />
    
    <!-- Open Graph (Facebook / AI Crawlers) -->
    <meta property="og:title" content="${article.title} | ${SITE_NAME}" />
    <meta property="og:description" content="${plainExcerpt.replace(/"/g, '&quot;')}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${articleUrl}" />
    <meta property="og:image" content="${coverImage}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="article:published_time" content="${isoDate}" />
    <meta property="article:modified_time" content="${isoDate}" />
    <meta property="article:section" content="${article.categoryName}" />
    <meta property="article:author" content="${article.author?.name || '莫忘舊聞特約筆者'}" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${article.title} | ${SITE_NAME}" />
    <meta name="twitter:description" content="${plainExcerpt.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${coverImage}" />

    <!-- Schema.org JSON-LD (NewsArticle, FAQPage, Breadcrumbs) -->
    <script type="application/ld+json" id="schema-ld-json">
${JSON.stringify(schemaGraph, null, 2)}
    </script>
  `;

  // Clean up any old description or og:title in template head
  result = result
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace(/<meta property="og:title"[^>]*>/i, '')
    .replace(/<meta property="og:description"[^>]*>/i, '')
    .replace(/<meta property="og:url"[^>]*>/i, '')
    .replace(/<link rel="canonical"[^>]*>/i, '');

  result = result.replace('</head>', `${metaTags}\n</head>`);

  // Inject content into #root
  result = result.replace('<div id="root"></div>', `<div id="root">${preRenderedContent}</div>`);

  return result;
}

/**
 * Render Complete SSR/SSG HTML for Homepage
 */
export function renderHomeHtml(articles: Article[], templateHtml?: string): string {
  const base = templateHtml || getBaseTemplateHtml();

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
        <article class="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
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
            <span>作者：${art.author?.name || '莫忘舊聞特約筆者'}</span>
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

  let result = base;
  result = result.replace(/<title>.*?<\/title>/i, `<title>${SITE_NAME} | 沉澱時光記憶 · 解讀時代舊聞</title>`);

  const metaTags = `
    <meta name="description" content="${SITE_DESCRIPTION}" />
    <meta name="keywords" content="莫忘舊聞, 莫忘, 時代舊聞, 歷史專題, 社會事件, 男女議題, 歷史檔案, mowang, mowang.com.tw" />
    <link rel="canonical" href="${SITE_URL}/" />
    
    <meta property="og:title" content="${SITE_NAME} | 沉澱時光記憶 · 解讀時代舊聞" />
    <meta property="og:description" content="${SITE_DESCRIPTION}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:site_name" content="${SITE_NAME}" />

    <script type="application/ld+json" id="schema-ld-json">
${JSON.stringify(homeSchema, null, 2)}
    </script>
  `;

  result = result
    .replace(/<meta name="description"[^>]*>/i, '')
    .replace(/<meta property="og:title"[^>]*>/i, '')
    .replace(/<meta property="og:description"[^>]*>/i, '')
    .replace(/<meta property="og:url"[^>]*>/i, '')
    .replace(/<link rel="canonical"[^>]*>/i, '');

  result = result.replace('</head>', `${metaTags}\n</head>`);
  result = result.replace('<div id="root"></div>', `<div id="root">${homePreRenderContent}</div>`);

  return result;
}

/**
 * Generate XML Sitemap Content
 */
export function generateSitemapXml(articles: Article[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${articles.map(art => `  <url>
    <loc>${SITE_URL}/article/${art.id}</loc>
    <lastmod>${(art.createdAt || new Date().toISOString()).replace(/\//g, '-').split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/?article=${art.id}</loc>
    <lastmod>${(art.createdAt || new Date().toISOString()).replace(/\//g, '-').split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
}

/**
 * Generate robots.txt
 */
export function generateRobotsTxt(): string {
  return `# Robots.txt for mowang.com.tw
# Open for all Search Engines and Generative AI Bots
User-agent: *
Allow: /

# Dedicated AI Crawlers
User-agent: Googlebot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
