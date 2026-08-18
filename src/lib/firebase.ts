import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { Article } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId,
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore (using databaseId if specified)
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const ARTICLES_COLLECTION = 'articles';
const NEWSLETTER_COLLECTION = 'newsletter_subscribers';

/**
 * Fetch all articles from Firestore
 */
export async function fetchArticles(): Promise<Article[]> {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION));
    const snapshot = await getDocs(q);
    const articles: Article[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      articles.push({
        id: docSnap.id,
        title: data.title || '',
        subtitle: data.subtitle || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        categoryId: data.categoryId || 'society',
        categoryName: data.categoryName || '社會事件',
        author: data.author || {
          name: '莫忘舊聞特約筆者',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
          title: '專題研究員',
        },
        createdAt: data.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
        readTimeMinutes: Number(data.readTimeMinutes) || 5,
        views: Number(data.views) || 0,
        likes: Number(data.likes) || 0,
        isBookmarked: false,
        tags: Array.isArray(data.tags) ? data.tags : [],
        coverImage: data.coverImage || '',
        location: data.location || '',
      });
    });
    return articles;
  } catch (error) {
    console.error('Error fetching articles from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for articles collection
 */
export function subscribeToArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const q = query(collection(db, ARTICLES_COLLECTION));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Article[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title || '',
            subtitle: data.subtitle || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            categoryId: data.categoryId || 'society',
            categoryName: data.categoryName || '社會事件',
            author: data.author || {
              name: '莫忘舊聞特約筆者',
              avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
              title: '專題研究員',
            },
            createdAt: data.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
            readTimeMinutes: Number(data.readTimeMinutes) || 5,
            views: Number(data.views) || 0,
            likes: Number(data.likes) || 0,
            isBookmarked: false,
            tags: Array.isArray(data.tags) ? data.tags : [],
            coverImage: data.coverImage || '',
            location: data.location || '',
          });
        });
        onUpdate(list);
      },
      (err) => {
        console.error('Firestore onSnapshot error:', err);
        if (onError) onError(err);
      }
    );
  } catch (error) {
    console.error('Error setting up articles subscription:', error);
    return () => {};
  }
}

/**
 * Create or overwrite an article in Firestore
 */
export async function saveArticle(article: Partial<Article> & { title: string; content: string }): Promise<string> {
  const articleId = article.id || `art_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  
  const payload = {
    title: article.title,
    subtitle: article.subtitle || '',
    excerpt: article.excerpt || article.content.slice(0, 120),
    content: article.content,
    categoryId: article.categoryId || 'society',
    categoryName: article.categoryName || '社會事件',
    author: article.author || {
      name: '莫忘舊聞特約筆者',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer',
      title: '專題特約研究員',
    },
    createdAt: article.createdAt || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
    readTimeMinutes: article.readTimeMinutes || Math.max(2, Math.ceil(article.content.length / 300)),
    views: article.views || 0,
    likes: article.likes || 0,
    tags: article.tags || [],
    coverImage: article.coverImage || '',
    location: article.location || '',
  };

  await setDoc(docRef, payload, { merge: true });
  return articleId;
}

/**
 * Increment view count in Firestore
 */
export async function incrementViews(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, {
      views: increment(1),
    });
  } catch (e) {
    console.warn('Failed to increment views on Firestore:', e);
  }
}

/**
 * Increment like count in Firestore
 */
export async function incrementLikes(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, {
      likes: increment(1),
    });
  } catch (e) {
    console.warn('Failed to increment likes on Firestore:', e);
  }
}

/**
 * Delete an article from Firestore
 */
export async function deleteArticle(articleId: string): Promise<void> {
  const docRef = doc(db, ARTICLES_COLLECTION, articleId);
  await deleteDoc(docRef);
}

/**
 * Save Newsletter subscriber email
 */
export async function saveNewsletterSubscription(email: string): Promise<void> {
  try {
    const cleanId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, NEWSLETTER_COLLECTION, cleanId);
    await setDoc(docRef, {
      email,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Failed to save newsletter subscription:', error);
  }
}
