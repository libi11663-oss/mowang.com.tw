import React from 'react';
import { LogoIcon } from './Logo';
import { Search, Bookmark, X, Layers } from 'lucide-react';
import { CategoryId, CATEGORIES } from '../types';

interface HeaderProps {
  currentCategory: CategoryId;
  onSelectCategory: (categoryId: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onGoHome: () => void;
  isBookmarksView?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  bookmarkCount,
  onOpenBookmarks,
  onGoHome,
  isBookmarksView = false,
}) => {
  return (
    <header className="w-full bg-[#F9F7F2] border-b border-[#E7E5E4]">
      {/* Top Amber Stripe */}
      <div className="h-1.5 bg-amber-500 w-full" />

      {/* Main Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Brand Logo & Title */}
          <div
            onClick={onGoHome}
            className="flex items-center gap-3.5 cursor-pointer select-none shrink-0 group"
          >
            <LogoIcon className="w-12 h-12 shrink-0 rounded-2xl shadow-xs transition-transform duration-200 group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-editorial-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1C1917]">
                  莫忘舊聞
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-bold bg-amber-500 text-stone-950 shadow-2xs">
                  經典
                </span>
              </div>
              <span className="text-xs sm:text-[13px] tracking-wide text-stone-500 font-editorial-serif mt-0.5">
                複習舊聞 - 挖掘深處記憶
              </span>
            </div>
          </div>

          {/* Right: Search Box and Bookmark Button */}
          <div className="flex items-center gap-3 flex-1 sm:max-w-md lg:max-w-lg justify-end">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="搜尋文章標題、關鍵字或作者..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-stone-100/70 hover:bg-stone-100/90 focus:bg-white border border-[#E7E5E4] rounded-none text-xs sm:text-sm text-[#1C1917] placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-editorial-serif"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bookmarks Toggle Button */}
            <button
              onClick={onOpenBookmarks}
              className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-none text-xs sm:text-sm font-semibold transition-all cursor-pointer border shrink-0 ${
                isBookmarksView
                  ? 'bg-[#1C1917] text-amber-400 border-[#1C1917]'
                  : 'bg-white hover:bg-stone-100 text-[#1C1917] border-[#E7E5E4]'
              }`}
              title="查看收藏文章"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarksView ? 'fill-amber-400 text-amber-400' : 'text-stone-600'}`} />
              <span className="hidden md:inline">收藏</span>
              {bookmarkCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                  isBookmarksView
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-amber-100 text-amber-900 border border-amber-300/60'
                }`}>
                  {bookmarkCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Topics Sub-bar */}
      <div className="border-t border-[#E7E5E4] bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-1 overflow-x-auto no-scrollbar scroll-smooth gap-1 sm:gap-2">
            {/* Label */}
            <div className="flex items-center gap-1.5 text-stone-500 font-bold text-xs sm:text-sm shrink-0 pr-2 select-none">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>主題專題：</span>
            </div>

            {/* Category tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {CATEGORIES.map((cat) => {
                const isActive = currentCategory === cat.id && !isBookmarksView;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3.5 py-2 text-xs sm:text-sm whitespace-nowrap font-medium transition-all cursor-pointer select-none rounded-none ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                        : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
