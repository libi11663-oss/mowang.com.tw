import React from 'react';
import { Feather, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onLoadDemoArticles?: () => void;
  isFiltered?: boolean;
  onClearFilter?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isFiltered = false,
  onClearFilter,
}) => {
  if (isFiltered) {
    return (
      <div className="py-20 px-6 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#B45309]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="font-editorial-serif text-xl font-bold text-[#1C1917]">
          未找到符合篩選條件的篇章
        </h3>
        <p className="text-sm text-stone-500 leading-relaxed">
          目前該分類或搜尋條件下尚無記錄，您可以嘗試更換分類或清除搜尋關鍵字。
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="px-5 py-2.5 bg-white border border-[#E7E5E4] text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-all cursor-pointer shadow-xs"
            >
              查看全部分類
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24 px-6 text-center max-w-2xl mx-auto">
      {/* Classical Archive Scroll / Quill Emblem */}
      <div className="relative inline-block mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#1C1917] border-2 border-amber-500/40 flex items-center justify-center mx-auto shadow-xl relative z-10">
          <Feather className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 stroke-[1.75]" />
        </div>
        {/* Decorative ambient aura */}
        <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500/20 to-amber-600/10 blur-md -z-0" />
      </div>

      {/* Main Title & Description */}
      <h2 className="font-editorial-serif text-2xl sm:text-3xl font-extrabold text-[#1C1917] mb-3 tracking-tight">
        檔案庫目前尚無文章紀錄
      </h2>
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-editorial-serif max-w-lg mx-auto mb-8">
        在大數據與資訊洪流的時代，我們致力於翻出被數據掩埋的重要舊聞、社會事件與憤恨記憶。目前檔案庫已完成清零重置。
      </p>

      {/* Archive Feature Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-[#E7E5E4]/80 text-left">
        <div className="p-4 bg-white/70 border border-[#E7E5E4] space-y-1">
          <span className="text-xs font-bold text-[#1C1917] font-editorial-serif block">
            📜 專題分類典藏
          </span>
          <p className="text-[11px] text-stone-500">
            支援全站男女議題、社會事件、熱門發燒與莫忘事件等多維專題分類。
          </p>
        </div>
        <div className="p-4 bg-white/70 border border-[#E7E5E4] space-y-1">
          <span className="text-xs font-bold text-[#1C1917] font-editorial-serif block">
            🔍 精準檢索與排序
          </span>
          <p className="text-[11px] text-stone-500">
            即時關鍵字查詢、最新/熱門/最高迴響排序與編輯精選快速過濾。
          </p>
        </div>
        <div className="p-4 bg-white/70 border border-[#E7E5E4] space-y-1">
          <span className="text-xs font-bold text-[#1C1917] font-editorial-serif block">
            🔖 個人化書籤收藏
          </span>
          <p className="text-[11px] text-stone-500">
            一鍵收藏重要專題舊聞，支援本地保存與多裝置閱讀排版。
          </p>
        </div>
      </div>
    </div>
  );
};
