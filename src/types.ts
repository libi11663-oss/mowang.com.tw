export type CategoryId =
  | 'all'
  | 'gender'
  | 'society'
  | 'hot'
  | 'remember'
  | 'tech_ai'
  | 'design_culture'
  | 'career';

export interface CategoryItem {
  id: CategoryId;
  name: string;
  description: string;
  iconName?: string;
}

export const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: '全站文章', description: '匯聚所有專題深度報導與歷史舊聞' },
  { id: 'gender', name: '男女議題', description: '性別平等、情感關係、時代婚姻與兩性思潮' },
  { id: 'society', name: '社會事件', description: '重大社會案件、體制改革與公義省思' },
  { id: 'hot', name: '熱門發燒', description: '近期公眾矚目焦點與發燒專題討論' },
  { id: 'remember', name: '莫忘事件', description: '不該被歲月遺忘的重大歷史切片與轉折' },
  { id: 'tech_ai', name: '科技與AI', description: '科技浪潮、人工智慧變革與未來社會衝擊' },
  { id: 'design_culture', name: '設計與文化', description: '美學設計、文化傳承、城市風貌與生活肌理' },
  { id: 'career', name: '職涯思考', description: '職場生態、個人成長、世代選擇與職涯洞察' },
];

export interface Author {
  name: string;
  avatar: string;
  title: string;
}

export interface Facts5W1H {
  when?: string;
  where?: string;
  who?: string;
  what?: string;
  why?: string;
  impact?: string;
}

export interface ArticleSource {
  title: string;
  url?: string;
  publisher?: string;
  date?: string;
}

export interface ArticleFAQ {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  categoryId: CategoryId;
  categoryName: string;
  author: Author;
  createdAt: string;
  readTimeMinutes: number;
  views: number;
  likes: number;
  isBookmarked: boolean;
  tags: string[];
  coverImage?: string;
  location?: string;
  facts5W1H?: Facts5W1H;
  sources?: ArticleSource[];
  faqs?: ArticleFAQ[];
}

export type ViewMode = 'list' | 'detail' | 'bookmarks';

export type ReaderTheme = 'paper' | 'light' | 'dark' | 'sepia';
export type ReaderFont = 'serif' | 'sans';
export type ReaderFontSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ReaderPreferences {
  theme: ReaderTheme;
  font: ReaderFont;
  fontSize: ReaderFontSize;
  lineSpacing: 'normal' | 'relaxed';
}

export interface CommentItem {
  id: string;
  articleId: string;
  author: string;
  avatar: string;
  date: string;
  content: string;
  likes: number;
}
