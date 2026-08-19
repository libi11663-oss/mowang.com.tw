import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Article,
  ReaderTheme,
  ReaderFont,
  ReaderFontSize,
  ReaderAccentColor,
  ReaderPreferences,
} from '../types';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Share2,
  Clock,
  Eye,
  Type,
  Volume2,
  VolumeX,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Copy,
  ExternalLink,
  BookOpen,
  HelpCircle,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Sparkles,
  Palette,
  Minus,
  Plus,
  Tag,
} from 'lucide-react';

export interface AccentStyle {
  id: ReaderAccentColor;
  name: string;
  badge: string;
  dotColor: string;
  titleColor: string;
  h2Color: string;
  h3Color: string;
  tagBg: string;
  tagText: string;
  tagBorder: string;
  blockquoteBorder: string;
  blockquoteBg: string;
  highlightText: string;
  buttonActive: string;
}

export const ACCENT_STYLES: Record<ReaderAccentColor, AccentStyle> = {
  amber: {
    id: 'amber',
    name: '經典琥珀金',
    badge: '👑',
    dotColor: '#D97706',
    titleColor: 'text-[#92400E] dark:text-[#FBBF24]',
    h2Color: 'text-[#92400E] dark:text-[#FBBF24]',
    h3Color: 'text-[#B45309] dark:text-[#FCD34D]',
    tagBg: 'bg-amber-100/90 dark:bg-amber-950/60',
    tagText: 'text-amber-900 dark:text-amber-300 font-bold',
    tagBorder: 'border-amber-300 dark:border-amber-700/60',
    blockquoteBorder: 'border-amber-500',
    blockquoteBg: 'bg-amber-50/70 dark:bg-amber-950/30',
    highlightText: 'text-amber-800 dark:text-amber-300',
    buttonActive: 'border-amber-500 bg-amber-500/15 text-amber-800 font-bold',
  },
  crimson: {
    id: 'crimson',
    name: '朱砂歷史紅',
    badge: '🧧',
    dotColor: '#DC2626',
    titleColor: 'text-[#991B1B] dark:text-[#F87171]',
    h2Color: 'text-[#991B1B] dark:text-[#F87171]',
    h3Color: 'text-[#B91C1C] dark:text-[#FCA5A5]',
    tagBg: 'bg-rose-100/90 dark:bg-rose-950/60',
    tagText: 'text-rose-900 dark:text-rose-300 font-bold',
    tagBorder: 'border-rose-300 dark:border-rose-700/60',
    blockquoteBorder: 'border-rose-600',
    blockquoteBg: 'bg-rose-50/70 dark:bg-rose-950/30',
    highlightText: 'text-rose-800 dark:text-rose-300',
    buttonActive: 'border-rose-500 bg-rose-500/15 text-rose-800 font-bold',
  },
  emerald: {
    id: 'emerald',
    name: '翡翠典藏綠',
    badge: '🌲',
    dotColor: '#059669',
    titleColor: 'text-[#065F46] dark:text-[#34D399]',
    h2Color: 'text-[#065F46] dark:text-[#34D399]',
    h3Color: 'text-[#047857] dark:text-[#6EE7B7]',
    tagBg: 'bg-emerald-100/90 dark:bg-emerald-950/60',
    tagText: 'text-emerald-900 dark:text-emerald-300 font-bold',
    tagBorder: 'border-emerald-300 dark:border-emerald-700/60',
    blockquoteBorder: 'border-emerald-600',
    blockquoteBg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    highlightText: 'text-emerald-800 dark:text-emerald-300',
    buttonActive: 'border-emerald-500 bg-emerald-500/15 text-emerald-800 font-bold',
  },
  indigo: {
    id: 'indigo',
    name: '沉穩靛青藍',
    badge: '🌌',
    dotColor: '#2563EB',
    titleColor: 'text-[#1E40AF] dark:text-[#60A5FA]',
    h2Color: 'text-[#1E40AF] dark:text-[#60A5FA]',
    h3Color: 'text-[#1D4ED8] dark:text-[#93C5FD]',
    tagBg: 'bg-blue-100/90 dark:bg-blue-950/60',
    tagText: 'text-blue-900 dark:text-blue-300 font-bold',
    tagBorder: 'border-blue-300 dark:border-blue-700/60',
    blockquoteBorder: 'border-blue-600',
    blockquoteBg: 'bg-blue-50/70 dark:bg-blue-950/30',
    highlightText: 'text-blue-800 dark:text-blue-300',
    buttonActive: 'border-blue-500 bg-blue-500/15 text-blue-800 font-bold',
  },
  slate: {
    id: 'slate',
    name: '典雅曜石黑',
    badge: '🖋️',
    dotColor: '#1C1917',
    titleColor: 'text-stone-950 dark:text-stone-100',
    h2Color: 'text-stone-900 dark:text-stone-200',
    h3Color: 'text-stone-800 dark:text-stone-300',
    tagBg: 'bg-stone-200/90 dark:bg-stone-800',
    tagText: 'text-stone-900 dark:text-stone-100 font-bold',
    tagBorder: 'border-stone-400 dark:border-stone-600',
    blockquoteBorder: 'border-stone-700',
    blockquoteBg: 'bg-stone-100/70 dark:bg-stone-800/40',
    highlightText: 'text-stone-900 dark:text-stone-100',
    buttonActive: 'border-stone-600 bg-stone-500/15 text-stone-900 dark:text-stone-100 font-bold',
  },
};

const FONT_OPTIONS: { id: ReaderFont; name: string; desc: string; className: string }[] = [
  { id: 'serif', name: '典雅宋體', desc: '人文襯線', className: 'font-editorial-serif' },
  { id: 'sans', name: '現代黑體', desc: '清晰簡約', className: 'font-sans' },
  { id: 'display', name: '報章展示體', desc: '古典氣派', className: 'font-serif tracking-tight font-medium' },
  { id: 'kai', name: '書法楷體', desc: '人文雅韻', className: 'font-serif italic font-medium' },
];

const FONT_SIZES: { id: ReaderFontSize; label: string; px: string; className: string }[] = [
  { id: 'sm', label: '小', px: '15px', className: 'text-sm sm:text-base' },
  { id: 'md', label: '中', px: '17px', className: 'text-base sm:text-lg' },
  { id: 'lg', label: '大', px: '19px', className: 'text-lg sm:text-xl' },
  { id: 'xl', label: '特大', px: '22px', className: 'text-xl sm:text-2xl' },
  { id: '2xl', label: '超大', px: '25px', className: 'text-2xl sm:text-3xl' },
];

interface ArticleDetailViewProps {
  article: Article;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onLikeArticle?: (id: string) => void;
  onSelectArticle: (article: Article) => void;
  allArticles: Article[];
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  onBack,
  isBookmarked,
  onToggleBookmark,
  onLikeArticle,
  onSelectArticle,
  allArticles,
}) => {
  // Reading preferences
  const [preferences, setPreferences] = useState<ReaderPreferences>({
    theme: 'paper',
    font: 'serif',
    fontSize: 'md',
    lineSpacing: 'relaxed',
    accentColor: 'amber',
  });

  // Font size step helper
  const fontSizeOrder: ReaderFontSize[] = ['sm', 'md', 'lg', 'xl', '2xl'];
  const currentFontSizeIndex = fontSizeOrder.indexOf(preferences.fontSize);
  
  const handleDecreaseFontSize = () => {
    if (currentFontSizeIndex > 0) {
      setPreferences((prev) => ({ ...prev, fontSize: fontSizeOrder[currentFontSizeIndex - 1] }));
    }
  };

  const handleIncreaseFontSize = () => {
    if (currentFontSizeIndex < fontSizeOrder.length - 1) {
      setPreferences((prev) => ({ ...prev, fontSize: fontSizeOrder[currentFontSizeIndex + 1] }));
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  // Dynamic JSON-LD (NewsArticle + FAQPage + BreadcrumbList) injection
  useEffect(() => {
    const siteUrl = 'https://mowang.com.tw';
    const canonicalUrl = `${siteUrl}/article/${article.id}`;
    const isoDate = `${article.createdAt.replace(/\//g, '-')}T08:00:00+08:00`;

    // 1. NewsArticle Schema
    const newsArticleSchema: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      headline: article.title,
      description: article.excerpt,
      articleBody: article.content.slice(0, 3500),
      image: article.coverImage || `${siteUrl}/favicon.ico`,
      datePublished: isoDate,
      dateModified: isoDate,
      author: {
        '@type': 'Person',
        name: article.author.name,
        jobTitle: article.author.title,
      },
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: '莫忘舊聞',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon.ico`,
        },
      },
      articleSection: article.categoryName,
      keywords: (article.tags || []).join(', '),
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', '.article-markdown-content'],
      },
    };

    // 2. FAQ Schema if FAQs present or parsed from headings
    const faqItems = article.faqs || [];
    let faqSchema: Record<string, any> | null = null;
    if (faqItems.length > 0) {
      faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
    }

    // 3. BreadcrumbList Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '莫忘舊聞首頁',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: article.categoryName,
          item: `${siteUrl}/?category=${article.categoryId}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: article.title,
          item: canonicalUrl,
        },
      ],
    };

    // Create or update script tags in document head
    const scriptId = 'geo-article-schema-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const combinedSchemas = faqSchema
      ? [newsArticleSchema, faqSchema, breadcrumbSchema]
      : [newsArticleSchema, breadcrumbSchema];
    script.text = JSON.stringify(combinedSchemas, null, 2);

    // Meta tags for Open Graph & Article specifications
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('property', 'og:type', 'article');
    setMeta('property', 'article:published_time', isoDate);
    setMeta('property', 'article:modified_time', isoDate);
    setMeta('property', 'article:section', article.categoryName);
    setMeta('property', 'article:author', article.author.name);
    if (article.tags && article.tags.length > 0) {
      setMeta('property', 'article:tag', article.tags.join(','));
    }

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [article]);

  // Scroll Progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setReadingProgress(Math.min(100, Math.max(0, scrollPercent)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Speech synthesis
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('您的瀏覽器不支援語音合成功能');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${article.title}。${article.subtitle || ''}。${article.excerpt}。${article.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'zh-TW';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Like interaction
  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      if (onLikeArticle) onLikeArticle(article.id);
    }
  };

  // Share interaction
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Citation copy handler
  const handleCopyCitation = () => {
    const pubYear = article.createdAt.split('/')[0] || new Date().getFullYear();
    const citationText = `《莫忘舊聞》編輯部（${pubYear}）。〈${article.title}〉。檢索自 https://mowang.com.tw/article/${article.id}`;
    navigator.clipboard.writeText(citationText);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2500);
  };

  // Related articles (same category or recent, excluding current)
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  // Find previous and next articles
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allArticles.length - 1
      ? allArticles[currentIndex + 1]
      : null;

  // Theme styling map
  const themeClasses: Record<ReaderTheme, string> = {
    paper: 'bg-[#F9F7F2] text-[#1C1917]',
    light: 'bg-[#FFFFFF] text-[#1C1917]',
    sepia: 'bg-[#F4ECD8] text-[#332A1C]',
    dark: 'bg-[#1C1917] text-stone-200',
  };

  const containerBgClasses: Record<ReaderTheme, string> = {
    paper: 'bg-white border-[#E7E5E4]',
    light: 'bg-stone-50/70 border-stone-200',
    sepia: 'bg-[#ECE2C6] border-[#D9CDB0]',
    dark: 'bg-[#292524] border-stone-850',
  };

  const fontClasses: Record<ReaderFont, string> = {
    serif: 'font-editorial-serif',
    sans: 'font-sans',
    display: 'font-serif tracking-tight',
    kai: 'font-serif italic font-medium',
  };

  const fontSizeClasses: Record<ReaderFontSize, string> = {
    sm: 'text-[15px] leading-relaxed',
    md: 'text-[17px] leading-loose',
    lg: 'text-[19px] leading-loose',
    xl: 'text-[22px] leading-loose',
    '2xl': 'text-[25px] leading-loose',
  };

  const lineSpacingClasses = preferences.lineSpacing === 'relaxed' ? 'leading-loose tracking-wide' : 'leading-relaxed';

  // Active accent style for Title, Headings & Keywords
  const accentStyle = ACCENT_STYLES[preferences.accentColor] || ACCENT_STYLES.amber;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses[preferences.theme]}`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-stone-200/50">
        <div
          className="h-full bg-amber-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Sticky Actions Bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-inherit/90 border-b border-[#E7E5E4]/80 px-4 sm:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E5E4] hover:border-stone-400 text-xs sm:text-sm font-semibold transition-all hover:bg-stone-100/50 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回專題列表</span>
            <span className="sm:hidden">返回</span>
          </button>

          {/* Center/Right reader controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Font Size Adjuster (A- / A+) */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 border border-[#E7E5E4] dark:border-stone-700 rounded-xl p-0.5">
              <button
                onClick={handleDecreaseFontSize}
                disabled={currentFontSizeIndex <= 0}
                className="p-1.5 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="縮小字級 (A-)"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono font-bold text-stone-600 dark:text-stone-300 select-none">
                {FONT_SIZES[currentFontSizeIndex]?.px || '17px'}
              </span>
              <button
                onClick={handleIncreaseFontSize}
                disabled={currentFontSizeIndex >= fontSizeOrder.length - 1}
                className="p-1.5 rounded-lg text-xs font-bold hover:bg-white dark:hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="放大字級 (A+)"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Audio Reader */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold animate-pulse'
                  : 'border-[#E7E5E4] hover:bg-stone-100/50'
              }`}
              title="語音朗讀專題"
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden md:inline">{isPlayingAudio ? '停止朗讀' : '語音聽報'}</span>
            </button>

            {/* Reader Settings Toggle (Font & Color Palette) */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                showSettings
                  ? 'bg-[#1C1917] text-amber-400 border-[#1C1917]'
                  : 'border-[#E7E5E4] hover:bg-stone-100/50'
              }`}
              title="字體與標題顏色調整"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline text-xs font-semibold">排版色彩</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                  : 'border-[#E7E5E4] hover:bg-stone-100/50'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-xs">{likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'border-[#E7E5E4] hover:bg-stone-100/50'
              }`}
              title={isBookmarked ? '已收藏' : '加入收藏'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-[#E7E5E4] hover:bg-stone-100/50 transition-all cursor-pointer relative"
              title="分享文章"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Reader Settings Drawer */}
        {showSettings && (
          <div className="max-w-4xl mx-auto mt-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-[#E7E5E4] dark:border-stone-800 shadow-xl space-y-4 text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            {/* 1. Title & Keyword Accent Colors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>標題與關鍵字顏色：</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {(Object.keys(ACCENT_STYLES) as ReaderAccentColor[]).map((key) => {
                  const style = ACCENT_STYLES[key];
                  const isActive = preferences.accentColor === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setPreferences({ ...preferences, accentColor: key })}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
                        isActive
                          ? style.buttonActive + ' shadow-xs ring-1 ring-amber-500/50'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: style.dotColor }}
                      />
                      <span>{style.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Font Family Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-1.5 font-bold text-stone-700 dark:text-stone-300">
                <Type className="w-4 h-4 text-amber-600" />
                <span>字型家族風格：</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {FONT_OPTIONS.map((f) => {
                  const isActive = preferences.font === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setPreferences({ ...preferences, font: f.id })}
                      className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${f.className} ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Font Size & Spacing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-700 dark:text-stone-300">字級大小：</span>
                <div className="flex items-center gap-1">
                  {FONT_SIZES.map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => setPreferences({ ...preferences, fontSize: sz.id })}
                      className={`px-2.5 py-1 rounded-lg border font-medium ${
                        preferences.fontSize === sz.id
                          ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {sz.label} ({sz.px})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-700 dark:text-stone-300">排版行距：</span>
                <button
                  onClick={() => setPreferences({ ...preferences, lineSpacing: 'normal' })}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    preferences.lineSpacing === 'normal'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                  }`}
                >
                  標準
                </button>
                <button
                  onClick={() => setPreferences({ ...preferences, lineSpacing: 'relaxed' })}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    preferences.lineSpacing === 'relaxed'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600'
                  }`}
                >
                  舒適寬鬆
                </button>
              </div>
            </div>

            {/* 4. Reader Theme Background */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className="font-bold text-stone-700 dark:text-stone-300">背景紙張色調：</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['paper', 'light', 'sepia', 'dark'] as ReaderTheme[]).map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setPreferences({ ...preferences, theme: thm })}
                    className={`px-3 py-1.5 rounded-lg font-medium border capitalize ${
                      preferences.theme === thm
                        ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {thm === 'paper'
                      ? '📜 羊皮紙'
                      : thm === 'light'
                      ? '⚪ 極簡白'
                      : thm === 'sepia'
                      ? '📜 復古黃'
                      : '🌙 夜間深灰'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Article Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Article Header */}
        <header className="space-y-4 mb-8 sm:mb-12 border-b border-[#E7E5E4] pb-8">
          {/* Category & Date */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
            <span className={`px-3 py-1 rounded-full border ${accentStyle.tagBg} ${accentStyle.tagText} ${accentStyle.tagBorder} transition-colors shadow-2xs`}>
              {article.categoryName}
            </span>
            <span>·</span>
            <span className="text-stone-500 font-normal">{article.createdAt}</span>
          </div>

          {/* Title */}
          <h1 className={`${fontClasses[preferences.font]} ${accentStyle.titleColor} text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight transition-colors duration-200`}>
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className={`${fontClasses[preferences.font]} text-base sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed font-medium`}>
              {article.subtitle}
            </p>
          )}

          {/* Author info & Read statistics */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-300 border border-stone-400 flex items-center justify-center font-bold text-stone-800 text-sm overflow-hidden shrink-0">
                {article.author.name.slice(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{article.author.name}</span>
                <span className="text-xs text-stone-500">{article.author.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                預估閱讀 {article.readTimeMinutes} 分鐘
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views} 次閱讀
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="mb-10 rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-md bg-stone-900">
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[480px] object-cover"
            />
            <div className="p-3 bg-stone-900 text-stone-400 text-xs font-editorial-serif text-center">
              《莫忘舊聞》專題圖輯 · {article.title}
            </div>
          </div>
        )}

        {/* Body Text with Markdown & Table Support */}
        <article className={`${fontClasses[preferences.font]} ${fontSizeClasses[preferences.fontSize]} ${lineSpacingClasses} article-markdown-content transition-all`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className={`${fontClasses[preferences.font]} ${accentStyle.h2Color} text-2xl sm:text-3xl font-extrabold mt-10 mb-4 border-b border-[#E7E5E4] pb-2 transition-colors`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`${fontClasses[preferences.font]} ${accentStyle.h3Color} text-xl sm:text-2xl font-bold mt-8 mb-3 transition-colors`}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 text-[#1C1917]/90 dark:text-stone-200/90">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 ${accentStyle.blockquoteBorder} ${accentStyle.blockquoteBg} p-4 sm:p-5 my-6 text-stone-800 dark:text-stone-200 italic rounded-r-md transition-colors shadow-2xs`}>
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 my-5 text-stone-800 dark:text-stone-200 pl-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 my-5 text-stone-800 dark:text-stone-200 pl-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              hr: () => (
                <hr className="my-8 border-t border-[#E7E5E4]" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 border border-[#E7E5E4] bg-white dark:bg-stone-850 shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#F5F2EA] dark:bg-stone-800 border-b border-[#E7E5E4] font-bold">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-[#E7E5E4] dark:divide-stone-700">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-amber-50/40 dark:hover:bg-stone-700/40 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-bold tracking-wide border-r border-[#E7E5E4] dark:border-stone-700 last:border-r-0 whitespace-nowrap bg-stone-100/60 dark:bg-stone-800/60">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 border-r border-[#E7E5E4] dark:border-stone-700 last:border-r-0 align-top">{children}</td>
              ),
              strong: ({ children }) => (
                <strong className={`font-bold ${accentStyle.highlightText}`}>{children}</strong>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* GEO 關鍵區塊 2: 常見問答與核心 FAQ (FAQPage 結構呈現) */}
        {article.faqs && article.faqs.length > 0 && (
          <section
            id="faq"
            aria-label="常見問答與核心事實解答"
            className="mt-12 p-6 sm:p-8 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800"
          >
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-stone-200 dark:border-stone-750">
              <HelpCircle className={`w-5 h-5 ${accentStyle.highlightText}`} />
              <h3 className={`text-xl font-bold ${accentStyle.h3Color}`}>
                專題核心問答 · 關鍵事實解析
              </h3>
            </div>
            <div className="space-y-4">
              {article.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/90 dark:border-stone-700 shadow-2xs space-y-2"
                >
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base flex items-start gap-2">
                    <span className={`font-extrabold ${accentStyle.highlightText}`}>Q{idx + 1}.</span>
                    <span>{faq.question}</span>
                  </h4>
                  <p className={`text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-6 border-l-2 ${accentStyle.blockquoteBorder}`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags / Keywords (Thematic Color Accent) */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[#E7E5E4] flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500">
              <Tag className="w-3.5 h-3.5" />
              <span>專題關鍵字標籤：</span>
            </div>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-lg text-xs border ${accentStyle.tagBg} ${accentStyle.tagText} ${accentStyle.tagBorder} transition-all duration-200 shadow-2xs`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* GEO 關鍵區塊 3: 參考資料與出處列表 (Citable Sources & References) */}
        <section
          id="sources"
          aria-label="參考資料與官方報導引述出處"
          className="mt-10 p-6 rounded-2xl bg-stone-100/80 border border-stone-300/80 text-xs text-stone-700"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-sm text-stone-900">參考資料與引述出處 (Citable Sources)</h4>
            </div>
            <button
              onClick={handleCopyCitation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-300 hover:border-amber-600 text-stone-700 hover:text-amber-800 text-xs font-medium transition-all cursor-pointer shadow-2xs"
            >
              {citationCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">已複製學術/報導引用格式</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製引用格式 (Cite)</span>
                </>
              )}
            </button>
          </div>

          <ol className="list-decimal list-inside space-y-2 font-mono text-stone-600">
            {article.sources && article.sources.length > 0 ? (
              article.sources.map((src, idx) => (
                <li key={idx} className="leading-relaxed">
                  <cite className="not-italic font-sans text-stone-800 font-semibold">{src.title}</cite>
                  {src.publisher && <span className="text-stone-500 font-sans"> · 出處：{src.publisher}</span>}
                  {src.date && <span className="text-stone-400 font-sans"> ({src.date})</span>}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-amber-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>原文</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))
            ) : (
              <>
                <li className="leading-relaxed">
                  <cite className="not-italic font-sans text-stone-800 font-semibold">
                    《莫忘舊聞》社會焦點檔案庫 · 典藏專題篇章（{article.createdAt}）
                  </cite>
                </li>
                <li className="leading-relaxed">
                  <cite className="not-italic font-sans text-stone-800 font-semibold">
                    主流新聞通訊社、地方政府公報與公開歷史報導綜合彙整
                  </cite>
                </li>
              </>
            )}
          </ol>
        </section>

        {/* Bottom Pagination (Prev / Next Article) */}
        <div className="mt-12 pt-8 border-t border-[#E7E5E4] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevArticle ? (
            <button
              onClick={() => {
                onSelectArticle(prevArticle);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 rounded-xl border border-[#E7E5E4] hover:border-amber-500 bg-white hover:bg-stone-50 text-left transition-all group cursor-pointer"
            >
              <span className="text-xs text-stone-400 flex items-center gap-1 mb-1">
                <ChevronLeft className="w-3.5 h-3.5" /> 上一篇篇章
              </span>
              <p className="font-editorial-serif font-bold text-sm text-[#1C1917] group-hover:text-[#B45309] line-clamp-1">
                {prevArticle.title}
              </p>
            </button>
          ) : <div />}

          {nextArticle && (
            <button
              onClick={() => {
                onSelectArticle(nextArticle);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-4 rounded-xl border border-[#E7E5E4] hover:border-amber-500 bg-white hover:bg-stone-50 text-right transition-all group cursor-pointer"
            >
              <span className="text-xs text-stone-400 flex items-center justify-end gap-1 mb-1">
                下一篇篇章 <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <p className="font-editorial-serif font-bold text-sm text-[#1C1917] group-hover:text-[#B45309] line-clamp-1">
                {nextArticle.title}
              </p>
            </button>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#E7E5E4] space-y-6">
            <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
              更多深度專題篇章
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedArticles.map((relArt) => (
                <div
                  key={relArt.id}
                  onClick={() => {
                    onSelectArticle(relArt);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-4 rounded-xl bg-white border border-[#E7E5E4] hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
                >
                  <span className="text-[11px] font-bold text-amber-700">
                    {relArt.categoryName}
                  </span>
                  <h4 className="font-editorial-serif font-bold text-sm text-[#1C1917] group-hover:text-[#B45309] line-clamp-2">
                    {relArt.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-editorial-serif line-clamp-2">
                    {relArt.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

