import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Article,
  ReaderTheme,
  ReaderFont,
  ReaderFontSize,
  ReaderPreferences,
  CommentItem,
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
  MessageSquare,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Sliders,
} from 'lucide-react';

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
  });

  const [showSettings, setShowSettings] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(article.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentItem[]>([
    {
      id: 'c-1',
      articleId: article.id,
      author: '讀史省思者',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=reader1',
      date: '剛剛',
      content: '這篇專題寫得非常深刻，將當時的背景與今日的脈絡串聯得十分清晰！莫忘舊聞確實需要更多這類有分量的篇章。',
      likes: 4,
    },
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState('');

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

    const textToRead = `${article.title}。${article.subtitle || ''}。${article.content}`;
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
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: 'c-' + Date.now(),
      articleId: article.id,
      author: newCommentAuthor.trim() || '匿名讀者',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        newCommentAuthor || 'guest'
      )}`,
      date: '剛剛',
      content: newCommentText.trim(),
      likes: 0,
    };

    setComments([newComment, ...comments]);
    setNewCommentText('');
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
  };

  const fontSizeClasses: Record<ReaderFontSize, string> = {
    sm: 'text-sm sm:text-base leading-relaxed',
    md: 'text-base sm:text-lg leading-loose',
    lg: 'text-lg sm:text-xl leading-loose',
    xl: 'text-xl sm:text-2xl leading-loose',
  };

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
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E5E4] hover:border-stone-400 text-xs sm:text-sm font-semibold transition-all hover:bg-stone-100/50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回專題列表</span>
          </button>

          {/* Right reader controls */}
          <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">{isPlayingAudio ? '停止朗讀' : '語音聽報'}</span>
            </button>

            {/* Reader Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showSettings
                  ? 'bg-[#1C1917] text-amber-400 border-[#1C1917]'
                  : 'border-[#E7E5E4] hover:bg-stone-100/50'
              }`}
              title="閱讀版面設定"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
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
          <div className="max-w-4xl mx-auto mt-3 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-[#E7E5E4] shadow-lg flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Theme */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-500">背景色調：</span>
              {(['paper', 'light', 'sepia', 'dark'] as ReaderTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => setPreferences({ ...preferences, theme: thm })}
                  className={`px-3 py-1 rounded-lg font-medium border capitalize ${
                    preferences.theme === thm
                      ? 'border-amber-500 bg-amber-500/15 text-amber-700 font-bold'
                      : 'border-stone-300 bg-stone-100 text-stone-600'
                  }`}
                >
                  {thm === 'paper'
                    ? '羊皮紙'
                    : thm === 'light'
                    ? '極簡白'
                    : thm === 'sepia'
                    ? '復古黃'
                    : '夜間深灰'}
                </button>
              ))}
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-500">字級大小：</span>
              {(['sm', 'md', 'lg', 'xl'] as ReaderFontSize[]).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPreferences({ ...preferences, fontSize: sz })}
                  className={`px-2.5 py-1 rounded-lg border font-medium ${
                    preferences.fontSize === sz
                      ? 'border-amber-500 bg-amber-500/15 text-amber-700 font-bold'
                      : 'border-stone-300 bg-stone-100 text-stone-600'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Font Family */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-500">字型：</span>
              <button
                onClick={() => setPreferences({ ...preferences, font: 'serif' })}
                className={`px-3 py-1 rounded-lg border font-editorial-serif ${
                  preferences.font === 'serif'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-700 font-bold'
                    : 'border-stone-300 bg-stone-100 text-stone-600'
                }`}
              >
                典雅襯線
              </button>
              <button
                onClick={() => setPreferences({ ...preferences, font: 'sans' })}
                className={`px-3 py-1 rounded-lg border font-sans ${
                  preferences.font === 'sans'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-700 font-bold'
                    : 'border-stone-300 bg-stone-100 text-stone-600'
                }`}
              >
                簡潔黑體
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Article Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        {/* Article Header */}
        <header className="space-y-4 mb-8 sm:mb-12 border-b border-[#E7E5E4] pb-8">
          {/* Category & Date */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-amber-700">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
              {article.categoryName}
            </span>
            <span>·</span>
            <span className="text-stone-500 font-normal">{article.createdAt}</span>
          </div>

          {/* Title */}
          <h1 className="font-editorial-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="font-editorial-serif text-base sm:text-xl text-stone-600 leading-relaxed font-medium">
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

        {/* Lead Excerpt Callout */}
        <div className={`p-6 rounded-2xl border mb-10 ${containerBgClasses[preferences.theme]} font-editorial-serif italic text-base sm:text-lg leading-relaxed shadow-2xs`}>
          “ {article.excerpt} ”
        </div>

        {/* Body Text with Markdown & Table Support */}
        <article className={`${fontClasses[preferences.font]} ${fontSizeClasses[preferences.fontSize]} article-markdown-content`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-extrabold mt-10 mb-4 border-b border-[#E7E5E4] pb-2 text-[#1C1917]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold mt-8 mb-3 text-amber-800">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="leading-relaxed mb-5 text-[#1C1917]/90">{children}</p>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-amber-500 bg-amber-50/50 p-4 sm:p-5 my-6 text-stone-800 italic font-editorial-serif text-base sm:text-lg rounded-r-sm">
                  {children}
                </blockquote>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 my-5 text-stone-800 font-editorial-serif pl-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 my-5 text-stone-800 font-editorial-serif pl-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              hr: () => (
                <hr className="my-8 border-t border-[#E7E5E4]" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 border border-[#E7E5E4] bg-white shadow-2xs">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[320px]">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#F5F2EA] border-b border-[#E7E5E4] text-[#1C1917] font-editorial-serif font-bold">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-[#E7E5E4]">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-amber-50/40 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-bold tracking-wide text-stone-900 border-r border-[#E7E5E4] last:border-r-0 whitespace-nowrap bg-stone-100/60">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-stone-800 border-r border-[#E7E5E4] last:border-r-0 align-top leading-relaxed">{children}</td>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-stone-950">{children}</strong>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#E7E5E4] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-500">專題標籤：</span>
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg text-xs bg-stone-200/70 text-stone-700 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

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

        {/* Reader Comments Section */}
        <section className="mt-16 pt-10 border-t border-[#E7E5E4] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial-serif text-xl font-bold flex items-center gap-2 text-[#1C1917]">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              <span>讀者思潮迴響 ({comments.length})</span>
            </h3>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleAddComment} className="p-5 rounded-2xl bg-white border border-[#E7E5E4] space-y-3 shadow-xs">
            <input
              type="text"
              placeholder="您的稱呼（例如：文史同好）"
              value={newCommentAuthor}
              onChange={(e) => setNewCommentAuthor(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#F9F7F2] border border-[#E7E5E4] text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <textarea
              required
              rows={3}
              placeholder="留下您對這篇舊聞的見解或記憶微光..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#F9F7F2] border border-[#E7E5E4] text-xs sm:text-sm text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-editorial-serif"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>發表迴響</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-white border border-[#E7E5E4] space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-amber-900 text-[10px]">
                      {comment.author.slice(0, 1)}
                    </div>
                    <span className="font-bold text-[#1C1917]">{comment.author}</span>
                  </div>
                  <span className="text-[11px] text-stone-400">{comment.date}</span>
                </div>
                <p className="text-stone-700 font-editorial-serif leading-relaxed pl-8">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>

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
