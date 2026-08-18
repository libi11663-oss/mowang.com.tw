import React, { useState } from 'react';
import { Article } from '../types';
import { ArticleCard } from './ArticleCard';
import { Bookmark, ArrowLeft, Trash2, Search } from 'lucide-react';

interface BookmarksViewProps {
  bookmarks: string[];
  allArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onToggleBookmark: (articleId: string, e: React.MouseEvent) => void;
  onClearAllBookmarks: () => void;
  onBackToFeed: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  allArticles,
  onSelectArticle,
  onToggleBookmark,
  onClearAllBookmarks,
  onBackToFeed,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const bookmarkedArticles = allArticles.filter((a) =>
    bookmarks.includes(a.id)
  );

  const filteredArticles = bookmarkedArticles.filter((a) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E5E4] pb-6">
        <div className="space-y-1">
          <button
            onClick={onBackToFeed}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#1C1917] font-semibold mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回專題列表</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-700">
              <Bookmark className="w-6 h-6 fill-amber-500 text-amber-600" />
            </div>
            <div>
              <h1 className="font-editorial-serif text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
                我的專題典藏書籤
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                已收藏 {bookmarkedArticles.length} 篇值得反覆重溫與深研的深度紀錄
              </p>
            </div>
          </div>
        </div>

        {bookmarkedArticles.length > 0 && (
          <div className="flex items-center gap-3">
            {/* Search inside bookmarks */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="在書籤中搜尋..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#E7E5E4] text-xs text-[#1C1917] focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <button
              onClick={onClearAllBookmarks}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空收藏</span>
            </button>
          </div>
        )}
      </div>

      {/* Bookmarks list or empty */}
      {bookmarkedArticles.length === 0 ? (
        <div className="py-20 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-600">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
            尚無任何收藏篇章
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-editorial-serif">
            在瀏覽專題舊聞時，點擊篇章卡片或閱讀頁的「收藏」按鈕，即可將值得研讀的文章收納於此。
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToFeed}
              className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-amber-400 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              探索深度專題文章
            </button>
          </div>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="py-12 text-center text-stone-500 text-sm">
          沒有符合「{filterQuery}」的收藏文章
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSelect={onSelectArticle}
              onToggleBookmark={onToggleBookmark}
              isBookmarked={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};
