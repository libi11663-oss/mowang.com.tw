import React, { useState } from 'react';
import { X, Send, Bot, Code, CheckCircle, AlertCircle, Sparkles, HelpCircle, Layers, FileText, Globe } from 'lucide-react';
import { CATEGORIES } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (articleId: string) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'api-docs'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [categoryId, setCategoryId] = useState('society');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [location, setLocation] = useState('台灣');
  const [tags, setTags] = useState('莫忘舊聞, 深度調查, 時代記憶');
  const [authorName, setAuthorName] = useState('莫忘舊聞特約筆者');
  const [authorTitle, setAuthorTitle] = useState('專題特約研究員');

  // 5W1H State
  const [show5W1H, setShow5W1H] = useState(true);
  const [who, setWho] = useState('');
  const [what, setWhat] = useState('');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [why, setWhy] = useState('');
  const [how, setHow] = useState('');

  // FAQ State
  const [showFAQ, setShowFAQ] = useState(true);
  const [q1, setQ1] = useState('');
  const [a1, setA1] = useState('');
  const [q2, setQ2] = useState('');
  const [a2, setA2] = useState('');

  if (!isOpen) return null;

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('請填寫專題標題與內文。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setPublishResult(null);

    try {
      const selectedCat = CATEGORIES.find(c => c.id === categoryId);
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      const facts = (who || what || when || where || why || how) ? {
        who: who.trim() || undefined,
        what: what.trim() || undefined,
        when: when.trim() || undefined,
        where: where.trim() || undefined,
        why: why.trim() || undefined,
        how: how.trim() || undefined,
      } : undefined;

      const faqsList: Array<{ question: string; answer: string }> = [];
      if (q1.trim() && a1.trim()) faqsList.push({ question: q1.trim(), answer: a1.trim() });
      if (q2.trim() && a2.trim()) faqsList.push({ question: q2.trim(), answer: a2.trim() });

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: excerpt.trim() || content.trim().slice(0, 150),
        content: content.trim(),
        categoryId,
        categoryName: selectedCat?.name || '社會事件',
        coverImage: coverImage.trim() || undefined,
        location: location.trim() || undefined,
        tags: tagArray,
        author: {
          name: authorName.trim() || '莫忘舊聞特約筆者',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(authorName)}`,
          title: authorTitle.trim() || '專題特約研究員',
        },
        facts5W1H: facts,
        faqs: faqsList.length > 0 ? faqsList : undefined,
      };

      const res = await fetch('/api/v1/articles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mowang_ai_publisher_2026',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || '發布失敗，請檢查伺服器狀態。');
      }

      setPublishResult(data);
      onSuccess(data.articleId);
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrorMsg(err.message || '發布失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const curlExample = `curl -X POST https://mowang.com.tw/api/v1/articles/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: mowang_ai_publisher_2026" \\
  -d '{
    "title": "新發布專題標題",
    "subtitle": "副標題或一句話摘要",
    "categoryId": "history",
    "content": "## 事件緣起\\n這裡是完整的 Markdown 內文...",
    "coverImage": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200",
    "tags": ["歷史", "重大事件", "莫忘舊聞"],
    "location": "台北市",
    "facts5W1H": {
      "who": "關鍵當事人",
      "what": "重大事件核心內容",
      "when": "1998年",
      "where": "台灣",
      "why": "事件爆發歷史脈絡",
      "how": "後續社會制度改革"
    },
    "faqs": [
      {
        "question": "該事件造成的最大制度影響為何？",
        "answer": "推動了相關法案的全面修訂。"
      }
    ]
  }'`;

  const pythonExample = `import requests

API_URL = "https://mowang.com.tw/api/v1/articles/create"
API_KEY = "mowang_ai_publisher_2026"

payload = {
    "title": "AI 自動生成之歷史專題分析",
    "subtitle": "深度剖析重大社會事件轉折點",
    "categoryId": "society",
    "content": """## 事件全貌\\n\\n透過 AI 蒐集整理之權威史料與文獻...""",
    "tags": ["社會事件", "歷史檔案", "AI發文"],
    "facts5W1H": {
        "who": "事件相關人物與單位",
        "what": "事件本體概述",
        "when": "2010年秋天",
        "where": "台灣",
        "why": "結構性原因分析",
        "how": "後續發展"
    },
    "faqs": [
        {"question": "為什麼要回顧這起舊聞？", "answer": "鑑古知今，避免歷史重蹈覆轍。"}
    ]
}

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

response = requests.post(API_URL, json=payload, headers=headers)
data = response.json()

if data.get("success"):
    print(f"發布成功！文章網址: {data['url']}")
    print(f"SSR 生成狀態: {data.get('isrGenerated')}")
    print(f"搜尋引擎推播結果: {data.get('indexingPings')}")
else:
    print(f"發布失敗: {data.get('error')}")`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FAF8F5] w-full max-w-4xl rounded-2xl border border-stone-300 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-stone-100 px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-100 flex items-center gap-2">
                <span>專題發布與 AI 自動發文系統</span>
                <span className="text-xs bg-amber-500 text-stone-950 font-sans font-bold px-2 py-0.5 rounded-full">GEO 2.0</span>
              </h2>
              <p className="text-xs text-stone-400">一鍵寫入資料庫 · 自動生成 SSR 原始碼 · 即時通知 AI 爬蟲與搜尋引擎</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-100/80 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'editor'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>發表新專題 (Web 介面)</span>
          </button>
          <button
            onClick={() => setActiveTab('api-docs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'api-docs'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>AI 自動發文 API 串接指南</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-stone-800 text-sm">
          {activeTab === 'editor' && (
            <>
              {publishResult ? (
                <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 text-emerald-800">
                    <CheckCircle className="w-6 h-6 shrink-0" />
                    <div>
                      <h3 className="text-base font-bold">專題發布成功！SSR 靜態網頁已即時就緒</h3>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        文章已寫入資料庫，靜態 HTML / Schema.org JSON-LD 已即時生成，並已派發搜尋引擎推播。
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-lg border border-emerald-200 text-xs space-y-2 text-stone-700">
                    <div><strong>文章標題：</strong> {publishResult.article?.title}</div>
                    <div><strong>永久網址：</strong> <a href={publishResult.url} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline font-mono">{publishResult.url}</a></div>
                    <div><strong>ISR 渲染：</strong> <span className="text-emerald-600 font-bold">✓ 即時生成完成 (檢視原始碼可直接抓取完整內文)</span></div>
                    <div><strong>IndexNow 推播：</strong> 已通知 Bing / IndexNow / Google Sitemap API</div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a
                      href={`/article/${publishResult.articleId}`}
                      className="px-4 py-2 bg-stone-900 text-stone-100 rounded-lg text-xs font-bold hover:bg-stone-800 transition-colors"
                    >
                      前往查看文章 →
                    </a>
                    <button
                      onClick={() => {
                        setPublishResult(null);
                        setTitle('');
                        setContent('');
                        setExcerpt('');
                        setSubtitle('');
                      }}
                      className="px-4 py-2 bg-stone-200 text-stone-800 rounded-lg text-xs font-medium hover:bg-stone-300 transition-colors"
                    >
                      再發布一篇
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Top Bar: Title & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        文章主標題 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="請輸入新聞/專題標題..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">文章專題分類</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subtitle & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">副標題 / 摘要一句話</label>
                      <input
                        type="text"
                        placeholder="選填，簡要補充標題核心背景..."
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">發生地點 / 城市</label>
                      <input
                        type="text"
                        placeholder="例如：台北市、台中沙鹿"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Content (Markdown) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-stone-700">
                        專題內文 (支援 Markdown 標題、表格、引用) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-stone-400">支援 ## 二級標題、- 清單、| 表格 |</span>
                    </div>
                    <textarea
                      required
                      rows={8}
                      placeholder="請輸入詳細調查與報導內文..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-3.5 bg-white border border-stone-300 rounded-lg text-sm font-sans focus:outline-none focus:ring-1 focus:ring-amber-500 leading-relaxed"
                    />
                  </div>

                  {/* Cover Image & Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">封面圖片網址 (Cover Image URL)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">主題標籤 (以逗號分隔)</label>
                      <input
                        type="text"
                        placeholder="歷史檔案, 社會事件, 莫忘舊聞"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* GEO Module 1: 5W1H Facts */}
                  <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-950">GEO 關鍵事實 5W1H (強烈建議填寫，大幅提升 AI 引用率)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShow5W1H(!show5W1H)}
                        className="text-xs text-amber-800 hover:underline"
                      >
                        {show5W1H ? '收合' : '展開'}
                      </button>
                    </div>

                    {show5W1H && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-stone-700">人物 (Who)</label>
                          <input
                            type="text"
                            placeholder="例如：林姓老婦、地方社會局"
                            value={who}
                            onChange={(e) => setWho(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-700">核心事件 (What)</label>
                          <input
                            type="text"
                            placeholder="例如：86歲阿嬤喪子後仍帶病出攤"
                            value={what}
                            onChange={(e) => setWhat(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-700">發生時間 (When)</label>
                          <input
                            type="text"
                            placeholder="例如：2026年初、1998年春"
                            value={when}
                            onChange={(e) => setWhen(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-700">地點 (Where)</label>
                          <input
                            type="text"
                            placeholder="例如：台中市沙鹿區市場"
                            value={where}
                            onChange={(e) => setWhere(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-stone-700">背景起因 (Why)</label>
                          <input
                            type="text"
                            placeholder="例如：獨力負擔家庭生計與醫療支出"
                            value={why}
                            onChange={(e) => setWhy(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GEO Module 2: FAQ */}
                  <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-stone-600" />
                        <span className="text-xs font-bold text-stone-800">FAQ 常見問題 (自動生成 FAQPage 結構化標籤)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFAQ(!showFAQ)}
                        className="text-xs text-stone-600 hover:underline"
                      >
                        {showFAQ ? '收合' : '展開'}
                      </button>
                    </div>

                    {showFAQ && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-stone-700">問題 1</label>
                          <input
                            type="text"
                            placeholder="例如：該事件對後續有何影響？"
                            value={q1}
                            onChange={(e) => setQ1(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-0.5"
                          />
                          <input
                            type="text"
                            placeholder="簡潔扼要回答..."
                            value={a1}
                            onChange={(e) => setA1(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded text-xs mt-1"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end gap-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>正在發布並生成 SSR...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>即時發布專題 (含 SSR & IndexNow)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === 'api-docs' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-serif">
                  🚀 AI 自動發文標準 REST API 接口
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  任何外部自動化流程（如 Python 爬蟲、Gemini / ChatGPT 定時任務、n8n、Zapier 或後端排程）皆可透過此接口直接發布專題。
                  伺服器會在寫入資料庫的同時，<strong>毫秒級動態完成 SSR 靜態頁面生成、Schema.org JSON-LD 注入、以及搜尋引擎推播</strong>。
                </p>
              </div>

              {/* Endpoint Specs */}
              <div className="p-4 bg-stone-900 text-stone-100 rounded-xl space-y-2 text-xs font-mono">
                <div className="text-amber-400 font-bold">POST /api/v1/articles/create</div>
                <div className="text-stone-300">Content-Type: application/json</div>
                <div className="text-stone-300">x-api-key: mowang_ai_publisher_2026</div>
              </div>

              {/* cURL Example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">1. cURL 指令範例</span>
                  <button
                    onClick={() => handleCopy(curlExample, 'curl')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'curl' ? '✓ 已複製' : '複製 cURL'}
                  </button>
                </div>
                <pre className="p-4 bg-stone-100 text-stone-900 rounded-xl text-xs overflow-x-auto border border-stone-300 font-mono leading-relaxed">
                  {curlExample}
                </pre>
              </div>

              {/* Python Example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">2. Python 自動發文腳本範例</span>
                  <button
                    onClick={() => handleCopy(pythonExample, 'python')}
                    className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    {copiedKey === 'python' ? '✓ 已複製' : '複製 Python 腳本'}
                  </button>
                </div>
                <pre className="p-4 bg-stone-100 text-stone-900 rounded-xl text-xs overflow-x-auto border border-stone-300 font-mono leading-relaxed">
                  {pythonExample}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
