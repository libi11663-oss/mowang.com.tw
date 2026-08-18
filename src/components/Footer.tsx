import React from 'react';
import { LogoIcon } from './Logo';
import { CategoryId, CATEGORIES } from '../types';
import { ArrowUp, BookOpen, Shield, Heart } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1C1917] text-stone-300 border-t border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          {/* Brand and Mission */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3.5 select-none">
              <LogoIcon className="w-10 h-10 shrink-0" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-editorial-serif text-2xl font-bold text-[#FAFAF9] tracking-tight">
                    莫忘舊聞
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
                    經典
                  </span>
                </div>
                <span className="text-xs text-amber-500/90 font-editorial-serif font-medium">
                  複習舊聞 · 挖掘深處記憶
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 font-editorial-serif leading-relaxed pr-4">
              在大數據與資訊洪流的時代，我們致力於翻出被數據掩埋的重要舊聞、社會事件與憤恨記憶。以嚴謹客觀之筆，為當代讀者建立大洪流上的唯一平台。
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={scrollToTop}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="回到頂部"
              >
                <ArrowUp className="w-4 h-4" />
                <span>回到頂部</span>
              </button>
            </div>
          </div>

          {/* Quick Category Links */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              專題分類導航
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    scrollToTop();
                  }}
                  className="text-left py-1 text-stone-400 hover:text-amber-400 transition-colors font-editorial-serif"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Editorial Ethics & Standards */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              編採準則
            </h3>
            <ul className="space-y-2 text-xs text-stone-400 font-editorial-serif">
              <li className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>客觀考據 · 尊重事實</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>開放典藏 · 共同記憶</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>人文關懷 · 啟發思辨</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-editorial-serif">
          <p>© 2026 莫忘舊聞. All rights reserved. 複習舊聞 · 挖掘深處記憶</p>
          <div className="flex items-center gap-4">
            <span>隱私政策</span>
            <span>·</span>
            <span>典藏規範</span>
            <span>·</span>
            <span>聯絡主編部</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
