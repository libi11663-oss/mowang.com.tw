import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { saveNewsletterSubscription } from '../lib/firebase';

interface NewsletterBoxProps {
  className?: string;
}

export const NewsletterBox: React.FC<NewsletterBoxProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsLoading(true);
    try {
      await saveNewsletterSubscription(email.trim());
      setIsSubscribed(true);
    } catch (err) {
      console.error(err);
      setIsSubscribed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-5 sm:p-7 bg-[#F5F2EA] border border-[#E7E5E4] w-full max-w-lg mx-auto box-border overflow-hidden ${className}`}>
      {/* Title */}
      <h3 className="text-stone-500 font-bold text-sm sm:text-base font-editorial-serif tracking-wide mb-2 sm:mb-3">
        訂閱週電子報
      </h3>

      {/* Description */}
      <p className="text-[#1C1917] font-editorial-serif text-sm sm:text-base leading-relaxed mb-5 font-medium">
        每週直接將精選論壇議題與深度專題發送至您的信箱。
      </p>

      {/* Form / State */}
      {isSubscribed ? (
        <div className="flex items-center gap-2 text-stone-800 bg-white/90 p-3.5 border border-[#E7E5E4] font-editorial-serif text-xs sm:text-sm">
          <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>已成功訂閱！感謝您關注莫忘舊聞專題週報。</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-stretch gap-2 sm:gap-3 w-full max-w-full">
          <input
            type="email"
            required
            placeholder="輸入您的 Email 地址..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-w-0 flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#E0DCD3] text-stone-900 text-xs sm:text-sm placeholder-stone-400 focus:outline-none focus:border-stone-800 font-editorial-serif transition-colors rounded-none shadow-2xs"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-black hover:bg-stone-800 active:bg-stone-950 disabled:opacity-50 text-white font-bold px-3.5 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm tracking-wider flex items-center justify-center cursor-pointer transition-all shrink-0 rounded-none shadow-2xs select-none min-w-[56px] sm:min-w-[68px]"
          >
            <span>{isLoading ? '...' : '訂閱'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
