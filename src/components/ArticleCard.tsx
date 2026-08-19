import React, { useState } from 'react';
import { Article } from '../types';
import { Bookmark, Check, Clock, Eye, Heart, Share2 } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onToggleBookmark: (articleId: string, e: React.MouseEvent) => void;
  onLike?: (articleId: string, e: React.MouseEvent) => void;
  isBookmarked: boolean;
  featured?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onSelect,
  onToggleBookmark,
  onLike,
  isBookmarked,
  featured = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `https://mowang.com.tw/article/${article.id}`;
    if (navigator.share) {
      navigator.share({
        title: `【莫忘舊聞】${article.title}`,
        text: article.excerpt,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (featured) {
    return (
      <div
        onClick={() => onSelect(article)}
        className="group relative bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-0"
      >
        {/* Featured Image */}
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] bg-stone-900 overflow-hidden">
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-stone-900 text-stone-600 font-editorial-serif text-lg">
              莫忘舊聞 · 專題焦點
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-md">
              {article.categoryName}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 text-stone-200 backdrop-blur-xs">
              頭條推薦
            </span>
          </div>
        </div>

        {/* Featured Content */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-amber-700 font-bold">
              <span>{article.categoryName}</span>
              <span>·</span>
              <span>{article.createdAt}</span>
            </div>

            <h2 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#1C1917] group-hover:text-[#B45309] transition-colors leading-snug">
              {article.title}
            </h2>

            {article.subtitle && (
              <p className="text-xs sm:text-sm font-editorial-serif font-medium text-stone-600 line-clamp-2">
                {article.subtitle}
              </p>
            )}

            <p className="text-xs sm:text-sm text-stone-500 font-editorial-serif line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Metadata & Actions */}
          <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-700 overflow-hidden shrink-0">
                {article.author.name.slice(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#1C1917]">{article.author.name}</span>
                <span className="text-[10px] text-stone-400 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {article.readTimeMinutes} 分鐘
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    {article.views} 次閱讀
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-[#E7E5E4] bg-white text-stone-400 hover:text-amber-600 hover:border-amber-300 transition-all cursor-pointer"
                title="分享專題"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              </button>

              <button
                onClick={(e) => onToggleBookmark(article.id, e)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-600'
                    : 'bg-white border-[#E7E5E4] text-stone-400 hover:text-stone-700 hover:border-stone-300'
                }`}
                title={isBookmarked ? '取消收藏' : '加入收藏'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(article)}
      className="group bg-white rounded-2xl border border-[#E7E5E4] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Article Cover */}
      {article.coverImage && (
        <div className="relative h-48 sm:h-52 bg-stone-900 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-0.8 rounded-full text-[11px] font-bold bg-[#1C1917]/80 text-amber-400 backdrop-blur-xs border border-amber-500/30">
              {article.categoryName}
            </span>
          </div>
        </div>
      )}

      {/* Article Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {!article.coverImage && (
            <div className="flex items-center gap-2 text-[11px] font-bold text-amber-700">
              <span>{article.categoryName}</span>
              <span>·</span>
              <span className="text-stone-400 font-normal">{article.createdAt}</span>
            </div>
          )}

          <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#1C1917] group-hover:text-[#B45309] transition-colors leading-snug line-clamp-2">
            {article.title}
          </h3>

          <p className="text-xs sm:text-sm text-stone-500 font-editorial-serif line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {article.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] bg-stone-100 text-stone-600 font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Meta & Bookmark */}
        <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-[11px] font-bold text-stone-700 overflow-hidden shrink-0">
              {article.author.name.slice(0, 1)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#1C1917] line-clamp-1">{article.author.name}</span>
              <span className="text-[10px] text-stone-400 flex items-center gap-1.5">
                <span>{article.createdAt}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  {article.readTimeMinutes}分
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 transition-colors cursor-pointer"
              title="分享專題"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>

            {onLike && (
              <button
                onClick={(e) => onLike(article.id, e)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="讚好"
              >
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[10px]">{article.likes}</span>
              </button>
            )}

            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                isBookmarked
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title={isBookmarked ? '取消收藏' : '加入收藏'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
