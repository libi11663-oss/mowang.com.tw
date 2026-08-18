import React from 'react';

export function LogoIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <rect x="24" y="24" width="464" height="464" rx="100" fill="#1C1917" stroke="#292524" strokeWidth="8"/>
      <path d="M80 120 L380 420 M120 80 L420 380" stroke="#44403C" strokeWidth="6" opacity="0.35" strokeDasharray="16 20"/>
      <path d="M 128 256 C 128 170 192 106 280 106 C 352 106 405 160 405 235" stroke="url(#goldGrad)" strokeWidth="26" strokeLinecap="round" fill="none"/>
      <path d="M140 340 V 212 L 225 288 L 310 212 V 340" stroke="#78716C" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" fill="none"/>
      <path d="M170 360 V 192 L 256 268 L 342 192 V 360" stroke="#FAFAF9" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="352" cy="150" r="32" fill="#F59E0B"/>
      <circle cx="352" cy="150" r="12" fill="#FFFFFF"/>
      <rect x="170" y="405" width="172" height="20" rx="10" fill="url(#goldGrad)"/>
    </svg>
  );
}

export const Logo: React.FC<{
  className?: string;
  iconClassName?: string;
  showBadge?: boolean;
}> = ({ className = '', iconClassName = 'w-10 h-10', showBadge = true }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LogoIcon className={`${iconClassName} shrink-0 transition-transform duration-300 hover:scale-105`} />
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="font-editorial-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917]">
            莫忘舊聞
          </span>
          {showBadge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-stone-950 shadow-xs">
              經典
            </span>
          )}
        </div>
        <span className="text-[11px] tracking-wider text-stone-500 font-editorial-serif font-medium hidden sm:inline-block">
          複習舊聞 · 挖掘深處記憶
        </span>
      </div>
    </div>
  );
};
