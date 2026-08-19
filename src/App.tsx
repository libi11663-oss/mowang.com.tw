import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EmptyState } from './components/EmptyState';
import { ArticleCard } from './components/ArticleCard';
import { ArticleDetailView } from './components/ArticleDetailView';
import { BookmarksView } from './components/BookmarksView';
import { NewsletterBox } from './components/NewsletterBox';
import { PublishModal } from './components/PublishModal';
import { Article, CategoryId, ViewMode, CATEGORIES } from './types';
import { INITIAL_DEMO_ARTICLES } from './data/mockArticles';
import { subscribeToArticles, incrementViews, incrementLikes } from './lib/firebase';
import { Sparkles, Clock, Flame, Heart, Star, Layers } from 'lucide-react';

const STORAGE_KEY = 'mowang_articles_prod_v3';
const BOOKMARKS_STORAGE_KEY = 'mowang_bookmarks_clean_v3';

export function App() {
  // Articles state initialized from LocalStorage or INITIAL_DEMO_ARTICLES
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      // Clean up any legacy test cache keys
      localStorage.removeItem('mowang_articles_v1');
      localStorage.removeItem('mowang_articles_clean_v1');
      localStorage.removeItem('mowang_articles_clean_v2');
      localStorage.removeItem('mowang_articles_demo');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load articles from localStorage:', e);
    }
    return INITIAL_DEMO_ARTICLES;
  });

  // Real-time Firestore synchronization for articles
  useEffect(() => {
    const unsubscribe = subscribeToArticles((firestoreArticles) => {
      if (firestoreArticles && firestoreArticles.length > 0) {
        setArticles(firestoreArticles);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreArticles));
        } catch (e) {
          console.error('Failed to save firestore articles to local cache:', e);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      localStorage.removeItem('mowang_bookmarks_v1');
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
    }
    return [];
  });

  // Navigation & Category states
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Sorting & Filter states matching top control panel
  const [sortBy, setSortBy] = useState<'newest' | 'hot' | 'likes'>('newest');
  const [filterFeatured, setFilterFeatured] = useState<boolean>(false);
  const [filterLongRead, setFilterLongRead] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);

  // Handle URL deep linking on initial load and popstate
  useEffect(() => {
    const parseUrlAndNavigate = () => {
      const urlParams = new URLSearchParams(window.location.search);
      let articleId = urlParams.get('article');

      // Check pathname (e.g. /article/some-id or /?/article/some-id)
      const pathname = window.location.pathname;
      if (!articleId && pathname.includes('/article/')) {
        const parts = pathname.split('/article/');
        if (parts[1]) {
          articleId = parts[1].replace(/\.html$/, '').replace(/\/$/, '');
        }
      }

      // Check SPA redirect query (/?/article/some-id)
      if (!articleId && window.location.search.startsWith('?/')) {
        const cleanPath = window.location.search.substring(2);
        if (cleanPath.includes('article/')) {
          const parts = cleanPath.split('article/');
          if (parts[1]) {
            articleId = parts[1].split('&')[0].replace(/\.html$/, '').replace(/\/$/, '');
          }
        }
      }

      if (articleId && articles.length > 0) {
        const found = articles.find((a) => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
          setCurrentView('detail');
          return;
        }
      }

      // Check category in URL
      const catParam = urlParams.get('category');
      if (catParam && CATEGORIES.some((c) => c.id === catParam)) {
        setSelectedCategory(catParam as CategoryId);
        setCurrentView('list');
      }
    };

    parseUrlAndNavigate();
    window.addEventListener('popstate', parseUrlAndNavigate);
    return () => window.removeEventListener('popstate', parseUrlAndNavigate);
  }, [articles]);

  // Dynamic SEO & Document Title Updates
  useEffect(() => {
    // Helper to safely set/update meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.startsWith('meta[name=')) {
          const nameMatch = selector.match(/name="([^"]+)"/);
          if (nameMatch) el.setAttribute('name', nameMatch[1]);
        } else if (selector.startsWith('meta[property=')) {
          const propMatch = selector.match(/property="([^"]+)"/);
          if (propMatch) el.setAttribute('property', propMatch[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setCanonical = (href: string) => {
      let el = document.querySelector('link[rel="canonical"]');
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const setJsonLd = (schema: object) => {
      let el = document.getElementById('dynamic-jsonld') as HTMLScriptElement | null;
      if (!el) {
        el = document.createElement('script');
        el.id = 'dynamic-jsonld';
        el.type = 'application/ld+json';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(schema);
    };

    if (currentView === 'detail' && selectedArticle) {
      document.title = `${selectedArticle.title} | 莫忘舊聞`;
      
      const excerpt = selectedArticle.excerpt || selectedArticle.title;
      const canonicalUrl = `https://mowang.com.tw/article/${selectedArticle.id}`;
      const coverImg = selectedArticle.coverImage || 'https://mowang.com.tw/favicon.ico';
      const isoDate = `${selectedArticle.createdAt.replace(/\//g, '-')}T08:00:00+08:00`;

      setMeta('meta[name="description"]', 'content', excerpt);
      setMeta('meta[name="keywords"]', 'content', `${(selectedArticle.tags || []).join(', ')}, 莫忘舊聞, 時代舊聞, 專題報導`);
      
      // Open Graph
      setMeta('meta[property="og:title"]', 'content', `${selectedArticle.title} | 莫忘舊聞`);
      setMeta('meta[property="og:description"]', 'content', excerpt);
      setMeta('meta[property="og:type"]', 'content', 'article');
      setMeta('meta[property="og:url"]', 'content', canonicalUrl);
      setMeta('meta[property="og:image"]', 'content', coverImg);
      setMeta('meta[property="article:published_time"]', 'content', isoDate);
      setMeta('meta[property="article:modified_time"]', 'content', isoDate);
      setMeta('meta[property="article:section"]', 'content', selectedArticle.categoryName);
      setMeta('meta[property="article:author"]', 'content', selectedArticle.author.name);

      // Twitter
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', `${selectedArticle.title} | 莫忘舊聞`);
      setMeta('meta[name="twitter:description"]', 'content', excerpt);
      setMeta('meta[name="twitter:image"]', 'content', coverImg);

      setCanonical(canonicalUrl);

      // Dynamic JSON-LD for single article
      const newsArticleSchema: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "headline": selectedArticle.title,
        "description": excerpt,
        "articleBody": selectedArticle.content.slice(0, 3500),
        "image": coverImg,
        "datePublished": isoDate,
        "dateModified": isoDate,
        "author": {
          "@type": "Person",
          "name": selectedArticle.author.name,
          "jobTitle": selectedArticle.author.title
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "莫忘舊聞",
          "url": "https://mowang.com.tw",
          "logo": {
            "@type": "ImageObject",
            "url": "https://mowang.com.tw/favicon.ico"
          }
        },
        "articleSection": selectedArticle.categoryName,
        "keywords": (selectedArticle.tags || []).join(', '),
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", "article"]
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
            "item": "https://mowang.com.tw/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": selectedArticle.categoryName,
            "item": `https://mowang.com.tw/?category=${selectedArticle.categoryId}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": selectedArticle.title,
            "item": canonicalUrl
          }
        ]
      };

      const schemasToInject = selectedArticle.faqs && selectedArticle.faqs.length > 0
        ? [
            newsArticleSchema,
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": selectedArticle.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            },
            breadcrumbSchema
          ]
        : [newsArticleSchema, breadcrumbSchema];

      setJsonLd(schemasToInject);
    } else {
      document.title = '莫忘舊聞 | 沉澱時光記憶 · 解讀時代舊聞';
      
      const defaultDesc = '莫忘舊聞 (mowang.com.tw) — 深度歷史檔案與時代舊聞典藏專題平台，沉澱時光記憶，解讀時代轉折與歷史回響。';
      
      setMeta('meta[name="description"]', 'content', defaultDesc);
      setMeta('meta[name="keywords"]', 'content', '莫忘舊聞, 莫忘, 時代舊聞, 歷史專題, 社會事件, 男女議題, 歷史檔案, mowang, mowang.com.tw');
      setMeta('meta[property="og:title"]', 'content', '莫忘舊聞 | 沉澱時光記憶 · 解讀時代舊聞');
      setMeta('meta[property="og:description"]', 'content', defaultDesc);
      setMeta('meta[property="og:type"]', 'content', 'website');
      setMeta('meta[property="og:url"]', 'content', 'https://mowang.com.tw/');
      setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
      setMeta('meta[name="twitter:title"]', 'content', '莫忘舊聞 | 沉澱時光記憶 · 解讀時代舊聞');
      setMeta('meta[name="twitter:description"]', 'content', defaultDesc);

      setCanonical('https://mowang.com.tw/');

      // Homepage ItemList JSON-LD
      const homeSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": "https://mowang.com.tw/#website",
            "url": "https://mowang.com.tw/",
            "name": "莫忘舊聞",
            "description": defaultDesc,
            "inLanguage": "zh-TW"
          },
          {
            "@type": "NewsMediaOrganization",
            "@id": "https://mowang.com.tw/#organization",
            "name": "莫忘舊聞",
            "url": "https://mowang.com.tw/",
            "logo": "https://mowang.com.tw/favicon.ico",
            "description": defaultDesc
          },
          {
            "@type": "ItemList",
            "name": "莫忘舊聞專題列表",
            "itemListElement": articles.map((art, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "name": art.title,
              "description": art.excerpt,
              "url": `https://mowang.com.tw/article/${art.id}`
            }))
          }
        ]
      };
      setJsonLd(homeSchema);
    }
  }, [currentView, selectedArticle, articles]);

  // Save Bookmarks to LocalStorage
  const saveBookmarks = (newBookmarksList: string[]) => {
    setBookmarks(newBookmarksList);
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(newBookmarksList));
    } catch (e) {
      console.error('Failed to persist bookmarks:', e);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    let updated: string[];
    if (bookmarks.includes(articleId)) {
      updated = bookmarks.filter((id) => id !== articleId);
    } else {
      updated = [articleId, ...bookmarks];
    }
    saveBookmarks(updated);
  };

  // Clear all bookmarks
  const handleClearAllBookmarks = () => {
    if (window.confirm('確定要清空所有收藏的專題文章嗎？')) {
      saveBookmarks([]);
    }
  };

  // Like Article (syncs to Firestore & local state)
  const handleLikeArticle = (articleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setArticles((prev) =>
      prev.map((art) => (art.id === articleId ? { ...art, likes: (art.likes || 0) + 1 } : art))
    );
    incrementLikes(articleId);
  };

  // Open Article Detail (syncs view increment to Firestore & updates URL)
  const handleSelectArticle = (article: Article) => {
    const updatedViews = (article.views || 0) + 1;
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, views: updatedViews } : a))
    );
    setSelectedArticle({ ...article, views: updatedViews });
    incrementViews(article.id);
    setCurrentView('detail');

    // Update URL history for deep linking
    try {
      window.history.pushState(null, '', `/article/${article.id}`);
    } catch (e) {
      // Fallback
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to home / list view
  const handleBackToHome = () => {
    setSelectedArticle(null);
    setCurrentView('list');
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch category
  const handleSelectCategory = (catId: CategoryId) => {
    setSelectedCategory(catId);
    if (currentView !== 'list') {
      setCurrentView('list');
      setSelectedArticle(null);
      try {
        window.history.pushState(null, '', catId === 'all' ? '/' : `/?category=${catId}`);
      } catch (e) {}
    }
  };

  // Filtered & Sorted articles calculation
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.categoryId === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.subtitle && a.subtitle.toLowerCase().includes(q)) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.author.name.toLowerCase().includes(q)
      );
    }

    // Feature Filters
    if (filterFeatured) {
      list = list.filter((a) => a.likes >= 50 || a.views >= 400 || a.tags.includes('重大歷史') || a.tags.includes('深度專題'));
    }

    if (filterLongRead) {
      list = list.filter((a) => a.readTimeMinutes >= 5 || a.content.length > 800);
    }

    // Sorting
    if (sortBy === 'hot') {
      list.sort((a, b) => (b.views * 1.5 + b.likes * 3) - (a.views * 1.5 + a.likes * 3));
    } else if (sortBy === 'likes') {
      list.sort((a, b) => b.likes - a.likes);
    } else {
      // Default: newest first
      list.sort((a, b) => b.id.localeCompare(a.id));
    }

    return list;
  }, [articles, selectedCategory, searchQuery, sortBy, filterFeatured, filterLongRead]);

  // Current category info object
  const currentCategoryInfo = useMemo(() => {
    return CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  }, [selectedCategory]);

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#F9F7F2] text-[#1C1917] flex flex-col selection:bg-amber-200 selection:text-stone-900 w-full">
      {/* Top Navbar & Category Sub-bar */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setCurrentView('bookmarks')}
        onOpenPublish={() => setIsPublishModalOpen(true)}
        onGoHome={() => {
          handleBackToHome();
          setSelectedCategory('all');
          setSearchQuery('');
          setFilterFeatured(false);
          setFilterLongRead(false);
        }}
        isBookmarksView={currentView === 'bookmarks'}
      />

      {/* Main View Router */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        {currentView === 'detail' && selectedArticle ? (
          <ArticleDetailView
            article={selectedArticle}
            onBack={handleBackToHome}
            isBookmarked={bookmarks.includes(selectedArticle.id)}
            onToggleBookmark={(id) => handleToggleBookmark(id)}
            onLikeArticle={(id) => handleLikeArticle(id)}
            onSelectArticle={handleSelectArticle}
            allArticles={articles}
          />
        ) : currentView === 'bookmarks' ? (
          <BookmarksView
            bookmarks={bookmarks}
            allArticles={articles}
            onSelectArticle={handleSelectArticle}
            onToggleBookmark={handleToggleBookmark}
            onClearAllBookmarks={handleClearAllBookmarks}
            onBackToFeed={handleBackToHome}
          />
        ) : (
          /* List / Feed View */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fadeIn w-full box-border overflow-hidden">
            {/* Top Editorial Highlight & Sorting Section */}
            <section className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8">
                {/* Left: Editorial Highlight Banner */}
                <div className="border-l-4 sm:border-l-[5px] border-amber-500 pl-4 sm:pl-7 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs sm:text-[13px] tracking-wider uppercase mb-2 sm:mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      EDITORIAL HIGHLIGHT · {selectedCategory === 'all' ? '全站文章' : currentCategoryInfo.name}
                    </span>
                  </div>

                  <h1 className="font-editorial-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.15]">
                    有些事情不能<br />忘記！
                  </h1>

                  <p className="font-editorial-serif italic text-stone-600 text-sm sm:text-base lg:text-lg mt-3 sm:mt-4 max-w-2xl leading-relaxed">
                    匯聚論壇所有精選文章、熱門議題與社會焦點討論
                  </p>
                </div>

                {/* Right: Sorting & Feature Filters Card */}
                <div className="bg-stone-50/60 sm:bg-stone-100/40 border border-[#E7E5E4] p-4 sm:p-5 w-full lg:w-auto min-w-0 lg:min-w-[420px] box-border self-start lg:self-end">
                  {/* Row 1: Sorting buttons */}
                  <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                    <span className="text-stone-500 font-medium mr-1 select-none">
                      排序：
                    </span>

                    {/* 最新發布 */}
                    <button
                      onClick={() => setSortBy('newest')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-bold transition-all cursor-pointer select-none ${
                        sortBy === 'newest'
                          ? 'bg-amber-500 text-stone-950 shadow-2xs'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>最新發布</span>
                    </button>

                    {/* 熱門發燒 */}
                    <button
                      onClick={() => setSortBy('hot')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-all cursor-pointer select-none ${
                        sortBy === 'hot'
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>熱門發燒</span>
                    </button>

                    {/* 最高迴響 */}
                    <button
                      onClick={() => setSortBy('likes')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-medium transition-all cursor-pointer select-none ${
                        sortBy === 'likes'
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-2xs'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>最高迴響</span>
                    </button>
                  </div>

                  {/* Row 2: Secondary Quick Filter Toggles */}
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#E7E5E4]/80 text-xs sm:text-sm">
                    {/* 編輯精選 */}
                    <button
                      onClick={() => setFilterFeatured(!filterFeatured)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 transition-all cursor-pointer select-none ${
                        filterFeatured
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${filterFeatured ? 'fill-amber-500 text-amber-600' : 'text-stone-500'}`} />
                      <span>編輯精選</span>
                    </button>

                    {/* 深度長文 */}
                    <button
                      onClick={() => setFilterLongRead(!filterLongRead)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 transition-all cursor-pointer select-none ${
                        filterLongRead
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-500" />
                      <span>深度長文</span>
                    </button>

                    {(filterFeatured || filterLongRead) && (
                      <button
                        onClick={() => {
                          setFilterFeatured(false);
                          setFilterLongRead(false);
                        }}
                        className="text-[11px] text-stone-400 hover:text-stone-700 ml-auto underline cursor-pointer"
                      >
                        重設篩選
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Horizontal Divider Line */}
              <hr className="border-t border-[#E7E5E4] mt-8" />
            </section>

            {/* Articles Feed Content */}
            {articles.length === 0 ? (
              <EmptyState />
            ) : filteredArticles.length === 0 ? (
              <EmptyState
                isFiltered={true}
                onClearFilter={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setFilterFeatured(false);
                  setFilterLongRead(false);
                }}
              />
            ) : (
              <div className="space-y-8">
                {/* Active Filter Info Badge (if searched or filtered) */}
                {(searchQuery || filterFeatured || filterLongRead || selectedCategory !== 'all') && (
                  <div className="flex items-center justify-between gap-2 text-xs text-stone-500 bg-stone-100/80 px-4 py-2 border border-[#E7E5E4]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>篩選結果：</span>
                      {selectedCategory !== 'all' && (
                        <span className="bg-amber-500 text-stone-950 font-bold px-2 py-0.5">
                          {currentCategoryInfo.name}
                        </span>
                      )}
                      {searchQuery && (
                        <span className="bg-white px-2 py-0.5 border border-stone-200">
                          關鍵字: "{searchQuery}"
                        </span>
                      )}
                      {filterFeatured && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5">
                          編輯精選
                        </span>
                      )}
                      {filterLongRead && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5">
                          深度長文
                        </span>
                      )}
                    </div>
                    <span className="font-semibold text-stone-700">共 {filteredArticles.length} 篇</span>
                  </div>
                )}

                {/* Lead Headline Featured Card (First Article) if on All view and has 2+ articles */}
                {selectedCategory === 'all' && !searchQuery && !filterFeatured && !filterLongRead && filteredArticles.length >= 2 && (
                  <ArticleCard
                    article={filteredArticles[0]}
                    onSelect={handleSelectArticle}
                    onToggleBookmark={handleToggleBookmark}
                    onLike={handleLikeArticle}
                    isBookmarked={bookmarks.includes(filteredArticles[0].id)}
                    featured={true}
                  />
                )}

                {/* Regular Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                  {(selectedCategory === 'all' && !searchQuery && !filterFeatured && !filterLongRead && filteredArticles.length >= 2
                    ? filteredArticles.slice(1)
                    : filteredArticles
                  ).map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onSelect={handleSelectArticle}
                      onToggleBookmark={handleToggleBookmark}
                      onLike={handleLikeArticle}
                      isBookmarked={bookmarks.includes(article.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Subscription Block */}
            <div className="mt-14 pt-10 border-t border-[#E7E5E4] flex justify-center">
              <NewsletterBox className="w-full max-w-lg" />
            </div>
          </main>
        )}
      </div>

      {/* Dark Footer */}
      <Footer onSelectCategory={handleSelectCategory} />

      {/* Admin / AI Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onSuccess={(newArticleId) => {
          setIsPublishModalOpen(false);
          const found = articles.find((a) => a.id === newArticleId);
          if (found) {
            handleSelectArticle(found);
          }
        }}
      />
    </div>
  );
}
export default App;
