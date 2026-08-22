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

// Custom SVG Icons for Social Media Platforms
const FacebookIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LineIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.607.391.084.922.258 1.057.592.121.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.589-3.864 2.589-5.992zm-14.869 3.013h-2.197a.78.78 0 0 1-.78-.78v-4.468a.78.78 0 0 1 .78-.78h2.197a.78.78 0 0 1 0 1.56h-1.417v.674h1.417a.78.78 0 0 1 0 1.56h-1.417v.674h1.417a.78.78 0 0 1 0 1.56zm3.326 0a.78.78 0 0 1-.78-.78v-4.468a.78.78 0 1 1 1.56 0v4.468a.78.78 0 0 1-.78.78zm5.556 0a.78.78 0 0 1-.606-.293l-2.029-2.735v2.248a.78.78 0 1 1-1.56 0v-4.468a.78.78 0 0 1 1.386-.487l2.029 2.735v-2.248a.78.78 0 1 1 1.56 0v4.468a.78.78 0 0 1-.78.78zm3.326-3.688a.78.78 0 1 1 0-1.56h1.417v-.674h-1.417a.78.78 0 1 1 0-1.56h2.197a.78.78 0 0 1 .78.78v4.468a.78.78 0 0 1-.78.78h-2.197a.78.78 0 0 1 0-1.56h1.417v-.674h-1.417z"/>
  </svg>
);

const ThreadsIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007C5.463 24 0 18.537 0 11.814 0 5.09 5.463 0 12.179 0c6.716 0 12.179 5.09 12.179 11.814 0 4.148-2.073 7.822-5.462 9.778-.45.257-.996.115-1.253-.335-.258-.45-.115-.996.335-1.253 2.96-1.71 4.78-4.918 4.78-8.19 0-5.836-4.764-10.214-10.579-10.214-5.815 0-10.579 4.378-10.579 10.214 0 5.836 4.764 10.214 10.579 10.214.004 0 .01 0 .015 0 3.197-.02 5.926-1.42 7.683-3.943.31-.446.931-.555 1.377-.245.446.31.555.931.245 1.377-2.059 2.956-5.26 4.597-9.008 4.62zm4.01-14.773c-.45-.257-.996-.115-1.253.335-.98 1.706-2.82 2.766-4.78 2.766-2.58 0-4.68-1.95-4.68-4.35 0-2.4 2.1-4.35 4.68-4.35 2.19 0 4.08 1.44 4.57 3.44.11.45.56.73 1.01.62.45-.11.73-.56.62-1.01-.64-2.61-3.1-4.65-6.2-4.65-3.46 0-6.28 2.62-6.28 5.95 0 3.33 2.82 5.95 6.28 5.95 2.65 0 5.12-1.43 6.44-3.73.26-.45.12-.996-.33-1.253z"/>
  </svg>
);

const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterXIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [citationCopied, setCitationCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

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

  // Social Media Sharing & Link helpers
  const getCanonicalShareUrl = () => {
    return `https://mowang.com.tw/article/${article.id}`;
  };

  const handleShareFacebook = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = encodeURIComponent(getCanonicalShareUrl());
    const quote = encodeURIComponent(`【莫忘舊聞】${article.title} — 複習舊聞 · 挖掘深處記憶`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank', 'noopener,noreferrer,width=620,height=580');
    showToast('已開啟 Facebook 發文視窗');
    setShowShareMenu(false);
  };

  const handleShareLine = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getCanonicalShareUrl();
    const message = `【莫忘舊聞】${article.title}\n\n複習舊聞 · 挖掘深處記憶\n👉 閱讀全文：${url}`;
    // LINE Official Universal Link scheme for direct chat selection and message sending
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
    showToast('已開啟 LINE！請選擇要發送的聊天室或好友');
    setShowShareMenu(false);
  };

  const handleShareThreads = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getCanonicalShareUrl();
    const message = `【莫忘舊聞】${article.title}\n\n${article.excerpt ? article.excerpt.slice(0, 100) + '...\n\n' : ''}複習舊聞 · 挖掘深處記憶\n${url}`;
    try {
      navigator.clipboard.writeText(message);
    } catch (_) {}
    const threadsUrl = `https://www.threads.net/intent/post?text=${encodeURIComponent(message)}`;
    window.open(threadsUrl, '_blank', 'noopener,noreferrer');
    showToast('已開啟 Threads 發文視窗並填入專題內容');
    setShowShareMenu(false);
  };

  const handleShareInstagram = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = getCanonicalShareUrl();
    const text = `【莫忘舊聞】${article.title}\n\n複習舊聞 · 挖掘深處記憶\n${url}`;

    // On mobile devices supporting navigator.share (iOS Safari / Android Chrome),
    // invoking native share triggers Instagram Stories / Chats directly!
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `【莫忘舊聞】${article.title}`,
          text: `【莫忘舊聞】${article.title}\n${article.excerpt}`,
          url: url,
        })
        .then(() => {
          setShowShareMenu(false);
        })
        .catch(() => {});
    } else {
      // Desktop fallback: copy content to clipboard and guide user
      try {
        navigator.clipboard.writeText(text);
      } catch (_) {}
      showToast('已複製專題標題與網址！可至 Instagram 貼文或限動貼上');
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      setShowShareMenu(false);
    }
  };

  const handleShareTwitter = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = encodeURIComponent(getCanonicalShareUrl());
    const text = encodeURIComponent(`【莫忘舊聞】${article.title}\n\n複習舊聞 · 挖掘深處記憶\n`);
    const hashtags = encodeURIComponent((article.tags || ['莫忘舊聞', '歷史專題']).slice(0, 3).join(','));
    window.open(`https://x.com/intent/post?text=${text}&url=${url}&hashtags=${hashtags}`, '_blank', 'noopener,noreferrer,width=620,height=580');
    showToast('已開啟 X (Twitter) 貼文發布編輯器');
    setShowShareMenu(false);
  };

  const handleCopyArticleLink = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(getCanonicalShareUrl());
    setCopied(true);
    showToast('已成功複製專題完整網址！');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      navigator
        .share({
          title: `【莫忘舊聞】${article.title}`,
          text: `【莫忘舊聞】${article.title}\n\n${article.excerpt}`,
          url: getCanonicalShareUrl(),
        })
        .then(() => setShowShareMenu(false))
        .catch(() => {});
    } else {
      handleCopyArticleLink();
    }
  };

  // Generic share trigger
  const handleShare = () => {
    setShowShareMenu((prev) => !prev);
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

  // Comprehensive Theme styling configuration
  const THEME_CONFIG: Record<ReaderTheme, {
    wrapperBg: string;
    bodyText: string;
    secondaryText: string;
    mutedText: string;
    borderColor: string;
    cardBg: string;
    tableHeaderBg: string;
    sourceBg: string;
    faqBg: string;
  }> = {
    paper: {
      wrapperBg: 'bg-[#F9F7F2]',
      bodyText: 'text-[#181615]',
      secondaryText: 'text-[#44403C]',
      mutedText: 'text-stone-500',
      borderColor: 'border-[#E7E5E4]',
      cardBg: 'bg-white',
      tableHeaderBg: 'bg-[#F5F2EA]',
      sourceBg: 'bg-stone-100/90',
      faqBg: 'bg-stone-50',
    },
    light: {
      wrapperBg: 'bg-[#FFFFFF]',
      bodyText: 'text-[#111827]',
      secondaryText: 'text-[#374151]',
      mutedText: 'text-stone-500',
      borderColor: 'border-stone-200',
      cardBg: 'bg-stone-50',
      tableHeaderBg: 'bg-stone-100',
      sourceBg: 'bg-stone-100',
      faqBg: 'bg-stone-50',
    },
    sepia: {
      wrapperBg: 'bg-[#F4ECD8]',
      bodyText: 'text-[#2D2013]',
      secondaryText: 'text-[#4A3828]',
      mutedText: 'text-[#7D6B58]',
      borderColor: 'border-[#D9CDB0]',
      cardBg: 'bg-[#ECE2C6]',
      tableHeaderBg: 'bg-[#E4D9BD]',
      sourceBg: 'bg-[#ECE2C6]',
      faqBg: 'bg-[#ECE2C6]',
    },
    dark: {
      wrapperBg: 'bg-[#181615]',
      bodyText: 'text-[#F5F5F4]',
      secondaryText: 'text-[#D6D3D1]',
      mutedText: 'text-stone-400',
      borderColor: 'border-stone-800',
      cardBg: 'bg-[#24211E]',
      tableHeaderBg: 'bg-stone-800',
      sourceBg: 'bg-stone-900',
      faqBg: 'bg-[#24211E]',
    },
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

  // Active theme and accent style
  const currentTheme = THEME_CONFIG[preferences.theme] || THEME_CONFIG.paper;
  const accentStyle = ACCENT_STYLES[preferences.accentColor] || ACCENT_STYLES.amber;

  return (
    <div className={`min-h-screen max-w-full overflow-x-hidden transition-colors duration-300 w-full ${currentTheme.wrapperBg} ${currentTheme.bodyText}`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-stone-200/50 pointer-events-none">
        <div
          className="h-full bg-amber-500 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Floating Sticky Actions Bar */}
      <div className={`sticky top-0 z-30 backdrop-blur-md ${currentTheme.wrapperBg}/95 border-b ${currentTheme.borderColor} px-2 sm:px-6 lg:px-8 py-2 sm:py-3 transition-colors w-full max-w-full overflow-hidden`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 w-full">
          <button
            onClick={onBack}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border ${currentTheme.borderColor} hover:border-stone-400 text-xs sm:text-sm font-semibold transition-all hover:bg-stone-200/40 cursor-pointer shrink-0 ${currentTheme.bodyText}`}
            title="返回專題列表"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回專題列表</span>
            <span className="sm:hidden text-xs">返回</span>
          </button>

          {/* Center/Right reader controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Quick Font Size Adjuster (A- / A+) */}
            <div className={`flex items-center ${currentTheme.cardBg} border ${currentTheme.borderColor} rounded-xl p-0.5 shadow-2xs`}>
              <button
                onClick={handleDecreaseFontSize}
                disabled={currentFontSizeIndex <= 0}
                className={`p-1 sm:p-1.5 rounded-lg text-xs font-bold hover:bg-stone-200/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all ${currentTheme.bodyText}`}
                title="縮小字級 (A-)"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className={`px-1.5 sm:px-2 text-[10px] sm:text-[11px] font-mono font-bold select-none ${currentTheme.secondaryText}`}>
                {FONT_SIZES[currentFontSizeIndex]?.px || '17px'}
              </span>
              <button
                onClick={handleIncreaseFontSize}
                disabled={currentFontSizeIndex >= fontSizeOrder.length - 1}
                className={`p-1 sm:p-1.5 rounded-lg text-xs font-bold hover:bg-stone-200/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all ${currentTheme.bodyText}`}
                title="放大字級 (A+)"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>

            {/* Audio Reader */}
            <button
              onClick={handleToggleAudio}
              className={`flex items-center gap-1 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold animate-pulse'
                  : `${currentTheme.borderColor} hover:bg-stone-200/40 ${currentTheme.bodyText}`
              }`}
              title="語音朗讀專題"
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              <span className="hidden md:inline">{isPlayingAudio ? '停止朗讀' : '語音聽報'}</span>
            </button>

            {/* Reader Settings Toggle (Font & Color Palette) */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                showSettings
                  ? 'bg-[#1C1917] text-amber-400 border-[#1C1917]'
                  : `${currentTheme.borderColor} hover:bg-stone-200/40 ${currentTheme.bodyText}`
              }`}
              title="字體與標題顏色調整"
            >
              <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              <span className="hidden md:inline text-xs font-semibold">排版色彩</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-50 border-rose-300 text-rose-600 font-bold'
                  : `${currentTheme.borderColor} hover:bg-stone-200/40 ${currentTheme.bodyText}`
              }`}
              title="按讚"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="text-[11px] sm:text-xs">{likesCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : `${currentTheme.borderColor} hover:bg-stone-200/40 ${currentTheme.bodyText}`
              }`}
              title={isBookmarked ? '已收藏' : '加入收藏'}
            >
              <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Share with Social Popover */}
            <div className="relative">
              <button
                onClick={handleShare}
                className={`flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all cursor-pointer ${
                  showShareMenu
                    ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold'
                    : `${currentTheme.borderColor} hover:bg-stone-200/40 ${currentTheme.bodyText}`
                }`}
                title="分享至社群媒體 (Threads, IG, FB, LINE, X)"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline text-xs font-semibold">分享</span>
              </button>

              {/* Floating Share Menu Popover */}
              {showShareMenu && (
                <div className={`absolute right-0 top-full mt-2 w-60 p-2 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.borderColor} shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1`}>
                  <div className={`px-2.5 py-1.5 text-[11px] font-bold ${currentTheme.mutedText} border-b ${currentTheme.borderColor}`}>
                    分享專題文章至：
                  </div>
                  
                  <button
                    onClick={handleShareFacebook}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#1877F2]/10 hover:text-[#1877F2] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <FacebookIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Facebook 分享</span>
                  </button>

                  <button
                    onClick={handleShareLine}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#06C755]/10 hover:text-[#06C755] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <LineIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>LINE 好友 / 群組</span>
                  </button>

                  <button
                    onClick={handleShareThreads}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-stone-500/10 hover:text-stone-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <ThreadsIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Threads 串文</span>
                  </button>

                  <button
                    onClick={handleShareInstagram}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-pink-500/10 hover:text-[#E1306C] transition-colors text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <InstagramIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Instagram (限動/貼文)</span>
                  </button>

                  <button
                    onClick={handleShareTwitter}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-stone-500/10 hover:text-stone-900 dark:hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <TwitterXIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>X (Twitter) 分享</span>
                  </button>

                  <div className={`my-1 border-t ${currentTheme.borderColor}`} />

                  <button
                    onClick={handleCopyArticleLink}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-amber-500/10 hover:text-amber-700 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shrink-0">
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </div>
                      <span>{copied ? '已複製文章網址！' : '複製專題連結'}</span>
                    </div>
                    {copied && <span className="text-[10px] text-emerald-600 font-bold">OK</span>}
                  </button>

                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center shrink-0 border border-stone-300">
                        <Share2 className="w-3.5 h-3.5" />
                      </div>
                      <span>手機原生分享...</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reader Settings Drawer */}
        {showSettings && (
          <div className={`max-w-4xl mx-auto mt-3 p-4 sm:p-5 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.borderColor} shadow-xl space-y-4 text-xs transition-all animate-in fade-in slide-in-from-top-2 duration-200`}>
            {/* 1. Title & Keyword Accent Colors */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b ${currentTheme.borderColor}`}>
              <div className={`flex items-center gap-1.5 font-bold ${currentTheme.bodyText}`}>
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
                          : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.bodyText} hover:bg-stone-200/40`
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
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b ${currentTheme.borderColor}`}>
              <div className={`flex items-center gap-1.5 font-bold ${currentTheme.bodyText}`}>
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
                          : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.bodyText} hover:bg-stone-200/40`
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Font Size & Spacing */}
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${currentTheme.borderColor}`}>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${currentTheme.bodyText}`}>字級大小：</span>
                <div className="flex items-center gap-1">
                  {FONT_SIZES.map((sz) => (
                    <button
                      key={sz.id}
                      onClick={() => setPreferences({ ...preferences, fontSize: sz.id })}
                      className={`px-2.5 py-1 rounded-lg border font-medium ${
                        preferences.fontSize === sz.id
                          ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                          : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.secondaryText} hover:bg-stone-200/40`
                      }`}
                    >
                      {sz.label} ({sz.px})
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`font-bold ${currentTheme.bodyText}`}>排版行距：</span>
                <button
                  onClick={() => setPreferences({ ...preferences, lineSpacing: 'normal' })}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    preferences.lineSpacing === 'normal'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                      : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.secondaryText}`
                  }`}
                >
                  標準
                </button>
                <button
                  onClick={() => setPreferences({ ...preferences, lineSpacing: 'relaxed' })}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    preferences.lineSpacing === 'relaxed'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold'
                      : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.secondaryText}`
                  }`}
                >
                  舒適寬鬆
                </button>
              </div>
            </div>

            {/* 4. Reader Theme Background */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <span className={`font-bold ${currentTheme.bodyText}`}>背景紙張色調：</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(['paper', 'light', 'sepia', 'dark'] as ReaderTheme[]).map((thm) => (
                  <button
                    key={thm}
                    onClick={() => setPreferences({ ...preferences, theme: thm })}
                    className={`px-3 py-1.5 rounded-lg font-medium border capitalize ${
                      preferences.theme === thm
                        ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                        : `${currentTheme.borderColor} ${currentTheme.cardBg} ${currentTheme.secondaryText} hover:bg-stone-200/40`
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
        <header className={`space-y-4 mb-8 sm:mb-12 border-b ${currentTheme.borderColor} pb-8`}>
          {/* Category & Date */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
            <span className={`px-3 py-1 rounded-full border ${accentStyle.tagBg} ${accentStyle.tagText} ${accentStyle.tagBorder} transition-colors shadow-2xs`}>
              {article.categoryName}
            </span>
            <span>·</span>
            <span className={`${currentTheme.mutedText} font-normal`}>{article.createdAt}</span>
          </div>

          {/* Title */}
          <h1 className={`${fontClasses[preferences.font]} ${accentStyle.titleColor} text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight transition-colors duration-200`}>
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className={`${fontClasses[preferences.font]} text-base sm:text-xl ${currentTheme.secondaryText} leading-relaxed font-medium`}>
              {article.subtitle}
            </p>
          )}

          {/* Author info & Read statistics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-300 border border-stone-400 flex items-center justify-center font-bold text-stone-900 text-sm overflow-hidden shrink-0">
                {article.author.name.slice(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${currentTheme.bodyText}`}>{article.author.name}</span>
                <span className={`text-xs ${currentTheme.mutedText}`}>{article.author.title}</span>
              </div>
            </div>

            <div className={`flex items-center gap-4 text-xs ${currentTheme.mutedText}`}>
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

          {/* Social Share Quick Bar */}
          <div className={`pt-4 border-t ${currentTheme.borderColor} flex flex-wrap items-center justify-between gap-3 text-xs`}>
            <div className={`flex items-center gap-1.5 font-bold ${currentTheme.secondaryText}`}>
              <Share2 className="w-3.5 h-3.5 text-amber-600" />
              <span>分享專題：</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="分享至 Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </button>
              <button
                onClick={handleShareLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#06C755] hover:bg-[#05b34c] text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="分享至 LINE"
              >
                <LineIcon className="w-3.5 h-3.5" />
                <span>LINE</span>
              </button>
              <button
                onClick={handleShareThreads}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="發布至 Threads"
              >
                <ThreadsIcon className="w-3.5 h-3.5" />
                <span>Threads</span>
              </button>
              <button
                onClick={handleShareInstagram}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="分享至 Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </button>
              <button
                onClick={handleShareTwitter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-stone-800 text-white font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-95"
                title="分享至 X (Twitter)"
              >
                <TwitterXIcon className="w-3.5 h-3.5" />
                <span>X (Twitter)</span>
              </button>
              <button
                onClick={handleCopyArticleLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${currentTheme.borderColor} ${currentTheme.cardBg} hover:border-amber-500 ${currentTheme.bodyText} font-medium text-xs transition-all shadow-2xs cursor-pointer active:scale-95`}
                title="複製專題網址"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">已複製！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>複製連結</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className={`mb-10 rounded-2xl overflow-hidden border ${currentTheme.borderColor} shadow-md bg-stone-900`}>
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
        <article className={`${fontClasses[preferences.font]} ${fontSizeClasses[preferences.fontSize]} ${lineSpacingClasses} article-markdown-content transition-all ${currentTheme.bodyText}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className={`${fontClasses[preferences.font]} ${accentStyle.h2Color} text-2xl sm:text-3xl font-extrabold mt-10 mb-4 border-b ${currentTheme.borderColor} pb-2 transition-colors`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`${fontClasses[preferences.font]} ${accentStyle.h3Color} text-xl sm:text-2xl font-bold mt-8 mb-3 transition-colors`}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className={`mb-5 ${currentTheme.bodyText} font-normal leading-relaxed`}>{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 ${accentStyle.blockquoteBorder} ${accentStyle.blockquoteBg} p-4 sm:p-5 my-6 ${currentTheme.bodyText} italic rounded-r-md transition-colors shadow-2xs`}>
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className={`list-disc list-inside space-y-2 my-5 ${currentTheme.bodyText} pl-2`}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className={`list-decimal list-inside space-y-2 my-5 ${currentTheme.bodyText} pl-2`}>{children}</ol>
              ),
              li: ({ children }) => (
                <li className={`${currentTheme.bodyText} leading-relaxed my-1.5`}>{children}</li>
              ),
              hr: () => (
                <hr className={`my-8 border-t ${currentTheme.borderColor}`} />
              ),
              table: ({ children }) => (
                <div className={`overflow-x-auto my-6 border ${currentTheme.borderColor} ${currentTheme.cardBg} shadow-2xs rounded-xl`}>
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className={`${currentTheme.tableHeaderBg} border-b ${currentTheme.borderColor} ${currentTheme.bodyText} font-bold`}>{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className={`divide-y ${currentTheme.borderColor}`}>{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-amber-500/10 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className={`px-4 py-3 font-bold tracking-wide border-r ${currentTheme.borderColor} last:border-r-0 whitespace-nowrap ${currentTheme.tableHeaderBg} ${currentTheme.bodyText}`}>{children}</th>
              ),
              td: ({ children }) => (
                <td className={`px-4 py-3 border-r ${currentTheme.borderColor} last:border-r-0 align-top ${currentTheme.bodyText}`}>{children}</td>
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
            className={`mt-12 p-6 sm:p-8 rounded-2xl ${currentTheme.faqBg} border ${currentTheme.borderColor}`}
          >
            <div className={`flex items-center gap-2 mb-6 pb-3 border-b ${currentTheme.borderColor}`}>
              <HelpCircle className={`w-5 h-5 ${accentStyle.highlightText}`} />
              <h3 className={`text-xl font-bold ${accentStyle.h3Color}`}>
                專題核心問答 · 關鍵事實解析
              </h3>
            </div>
            <div className="space-y-4">
              {article.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.borderColor} shadow-2xs space-y-2`}
                >
                  <h4 className={`font-bold text-sm sm:text-base flex items-start gap-2 ${currentTheme.bodyText}`}>
                    <span className={`font-extrabold ${accentStyle.highlightText}`}>Q{idx + 1}.</span>
                    <span>{faq.question}</span>
                  </h4>
                  <p className={`text-xs sm:text-sm ${currentTheme.secondaryText} leading-relaxed pl-6 border-l-2 ${accentStyle.blockquoteBorder}`}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags / Keywords (Thematic Color Accent) */}
        {article.tags && article.tags.length > 0 && (
          <div className={`mt-10 pt-6 border-t ${currentTheme.borderColor} flex flex-wrap items-center gap-2.5`}>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${currentTheme.mutedText}`}>
              <Tag className="w-3.5 h-3.5" />
              <span>專題關鍵字標籤：</span>
            </div>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-lg text-xs border ${accentStyle.tagBg} ${accentStyle.tagText} ${accentStyle.tagBorder} transition-all duration-200 shadow-2xs font-medium`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Dedicated Social Media Share Section */}
        <section
          aria-label="分享至社群媒體"
          className={`mt-10 p-6 sm:p-8 rounded-2xl ${currentTheme.cardBg} border ${currentTheme.borderColor} shadow-xs space-y-4`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-md">
              <div className="flex items-center gap-2">
                <Share2 className={`w-5 h-5 ${accentStyle.highlightText}`} />
                <h3 className={`text-base sm:text-lg font-bold ${currentTheme.bodyText}`}>
                  分享此篇專題 · 擴大複習人數
                </h3>
              </div>
              <p className={`text-xs sm:text-sm ${currentTheme.secondaryText} leading-relaxed`}>
                喜歡這篇深度專題嗎？快速分享至社群平台，讓更多人重溫時代舊聞、發掘深處記憶。
              </p>
            </div>

            {/* Social Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="分享專題至 Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              <button
                onClick={handleShareLine}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="傳送專題至 LINE"
              >
                <LineIcon className="w-4 h-4" />
                <span>LINE</span>
              </button>

              <button
                onClick={handleShareThreads}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="發布至 Threads 串文"
              >
                <ThreadsIcon className="w-4 h-4" />
                <span>Threads</span>
              </button>

              <button
                onClick={handleShareInstagram}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="分享至 Instagram (限時動態 / 貼文)"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>Instagram</span>
              </button>

              <button
                onClick={handleShareTwitter}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                title="發布至 X (Twitter)"
              >
                <TwitterXIcon className="w-4 h-4" />
                <span>X (Twitter)</span>
              </button>

              <button
                onClick={handleCopyArticleLink}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border ${currentTheme.borderColor} ${currentTheme.cardBg} hover:border-amber-500 ${currentTheme.bodyText} font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]`}
                title="複製專題完整網址"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">已複製網址！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-stone-500" />
                    <span>複製連結</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* GEO 關鍵區塊 3: 參考資料與出處列表 (Citable Sources & References) */}
        <section
          id="sources"
          aria-label="參考資料與官方報導引述出處"
          className={`mt-10 p-6 rounded-2xl ${currentTheme.sourceBg} border ${currentTheme.borderColor} text-xs ${currentTheme.secondaryText}`}
        >
          <div className={`flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b ${currentTheme.borderColor}`}>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <h4 className={`font-bold text-sm ${currentTheme.bodyText}`}>參考資料與引述出處 (Citable Sources)</h4>
            </div>
            <button
              onClick={handleCopyCitation}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${currentTheme.cardBg} border ${currentTheme.borderColor} hover:border-amber-600 ${currentTheme.bodyText} hover:text-amber-800 text-xs font-medium transition-all cursor-pointer shadow-2xs`}
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

          <ol className={`list-decimal list-inside space-y-2 font-mono ${currentTheme.secondaryText}`}>
            {article.sources && article.sources.length > 0 ? (
              article.sources.map((src, idx) => (
                <li key={idx} className="leading-relaxed">
                  <cite className={`not-italic font-sans font-semibold ${currentTheme.bodyText}`}>{src.title}</cite>
                  {src.publisher && <span className={`${currentTheme.mutedText} font-sans`}> · 出處：{src.publisher}</span>}
                  {src.date && <span className={`${currentTheme.mutedText} font-sans`}> ({src.date})</span>}
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
                  <cite className={`not-italic font-sans font-semibold ${currentTheme.bodyText}`}>
                    《莫忘舊聞》社會焦點檔案庫 · 典藏專題篇章（{article.createdAt}）
                  </cite>
                </li>
                <li className="leading-relaxed">
                  <cite className={`not-italic font-sans font-semibold ${currentTheme.bodyText}`}>
                    主流新聞通訊社、地方政府公報與公開歷史報導綜合彙整
                  </cite>
                </li>
              </>
            )}
          </ol>
        </section>

        {/* Bottom Pagination (Prev / Next Article) */}
        <div className={`mt-12 pt-8 border-t ${currentTheme.borderColor} grid grid-cols-1 sm:grid-cols-2 gap-4`}>
          {prevArticle ? (
            <button
              onClick={() => {
                onSelectArticle(prevArticle);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`p-4 rounded-xl border ${currentTheme.borderColor} hover:border-amber-500 ${currentTheme.cardBg} hover:bg-stone-200/30 text-left transition-all group cursor-pointer`}
            >
              <span className={`text-xs ${currentTheme.mutedText} flex items-center gap-1 mb-1`}>
                <ChevronLeft className="w-3.5 h-3.5" /> 上一篇篇章
              </span>
              <p className={`font-editorial-serif font-bold text-sm ${currentTheme.bodyText} group-hover:text-[#B45309] line-clamp-1`}>
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
              className={`p-4 rounded-xl border ${currentTheme.borderColor} hover:border-amber-500 ${currentTheme.cardBg} hover:bg-stone-200/30 text-right transition-all group cursor-pointer`}
            >
              <span className={`text-xs ${currentTheme.mutedText} flex items-center justify-end gap-1 mb-1`}>
                下一篇篇章 <ChevronRight className="w-3.5 h-3.5" />
              </span>
              <p className={`font-editorial-serif font-bold text-sm ${currentTheme.bodyText} group-hover:text-[#B45309] line-clamp-1`}>
                {nextArticle.title}
              </p>
            </button>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className={`mt-16 pt-10 border-t ${currentTheme.borderColor} space-y-6`}>
            <h3 className={`font-editorial-serif text-xl font-bold ${currentTheme.bodyText}`}>
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
                  className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.borderColor} hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2`}
                >
                  <span className="text-[11px] font-bold text-amber-700">
                    {relArt.categoryName}
                  </span>
                  <h4 className={`font-editorial-serif font-bold text-sm ${currentTheme.bodyText} group-hover:text-[#B45309] line-clamp-2`}>
                    {relArt.title}
                  </h4>
                  <p className={`text-[11px] ${currentTheme.mutedText} font-editorial-serif line-clamp-2`}>
                    {relArt.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Dynamic Share & Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-[#1C1917] text-white rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[92vw] text-xs sm:text-sm font-medium backdrop-blur-md">
          <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

