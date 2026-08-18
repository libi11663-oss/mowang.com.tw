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
    <div className={`p-6 sm:p-8 bg-[#F5F2EA] border border-[#E7E5E4] max-w-md ${className}`}>
      {/* Title */}
      <h3 className="text-stone-500 font-bold text-base sm:text-lg font-editorial-serif tracking-wide mb-3">
        訂閱週電子報
      </h3>

      {/* Description */}
      <p className="text-[#1C1917] font-editorial-serif text-base sm:text-[17px] leading-relaxed mb-6 font-medium">
        每週直接將精選論壇議題與深度專題發送至您的信箱。
      </p>

      {/* Form / State */}
      {isSubscribed ? (
        <div className="flex items-center gap-2 text-stone-800 bg-white/90 p-3.5 border border-[#E7E5E4] font-editorial-serif text-sm">
          <div className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span>已成功訂閱！感謝您關注莫忘舊聞專題週報。</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-stretch gap-3">
          <input
            type="email"
            required
            placeholder="輸入您的 Email 地址..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-white border border-[#E0DCD3] text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-800 font-editorial-serif transition-colors rounded-none shadow-2xs"
          />
          <button
            type="submit"
            className="bg-black hover:bg-stone-800 active:bg-stone-950 text-white font-bold px-4 py-3 text-sm tracking-wider flex items-center justify-center cursor-pointer transition-all shrink-0 rounded-none shadow-2xs leading-tight select-none min-w-[58px]"
          >
            <span className="flex flex-col items-center leading-none gap-0.5 text-xs sm:text-sm font-semibold">
              <span>訂</span>
              <span>閱</span>
            </span>
          </button>
        </form>
      )}
    </div>
  );
};
