import https from 'https';
import http from 'http';
import { SITE_URL } from './ssr-renderer';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'mowang-geo-indexing-key';
const INDEXNOW_HOST = 'mowang.com.tw';

export interface IndexingResult {
  engine: string;
  url: string;
  status: number | string;
  success: boolean;
  message?: string;
}

/**
 * Send HTTP/HTTPS request helper
 */
function sendRequest(targetUrl: string, method: string = 'GET', data?: any, headers?: Record<string, string>): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(targetUrl);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: headers || {},
        timeout: 8000,
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 200, body });
        });
      });

      req.on('error', (err) => {
        resolve({ statusCode: 500, body: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ statusCode: 408, body: 'Request timeout' });
      });

      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
      req.end();
    } catch (e: any) {
      resolve({ statusCode: 500, body: e?.message || 'Unknown request error' });
    }
  });
}

/**
 * Notify IndexNow (Bing, Yandex, Naver, Seznam, etc.)
 */
export async function notifyIndexNow(urls: string[]): Promise<IndexingResult[]> {
  const results: IndexingResult[] = [];
  const validUrls = urls.map(u => u.startsWith('http') ? u : `${SITE_URL}${u}`);

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: validUrls,
  };

  const endpoints = [
    { name: 'IndexNow (api.indexnow.org)', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Bing IndexNow (bing.com)', url: 'https://www.bing.com/indexnow' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await sendRequest(ep.url, 'POST', payload, {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Mowang-Auto-Publisher/1.0',
      });
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
      results.push({
        engine: ep.name,
        url: ep.url,
        status: res.statusCode,
        success: isSuccess,
        message: isSuccess ? 'URL successfully submitted to IndexNow' : res.body,
      });
      console.log(`[Indexing] ${ep.name} -> Status ${res.statusCode} for ${validUrls.length} URLs`);
    } catch (err: any) {
      results.push({
        engine: ep.name,
        url: ep.url,
        status: 'error',
        success: false,
        message: err.message,
      });
    }
  }

  return results;
}

/**
 * Ping Google & Bing Sitemaps
 */
export async function pingSitemaps(): Promise<IndexingResult[]> {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const results: IndexingResult[] = [];

  const pings = [
    { name: 'Google Sitemap Ping', url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
    { name: 'Bing Sitemap Ping', url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
  ];

  for (const p of pings) {
    try {
      const res = await sendRequest(p.url, 'GET');
      results.push({
        engine: p.name,
        url: p.url,
        status: res.statusCode,
        success: res.statusCode >= 200 && res.statusCode < 400,
        message: `Sitemap ping returned code ${res.statusCode}`,
      });
      console.log(`[Indexing] ${p.name} -> Status ${res.statusCode}`);
    } catch (err: any) {
      results.push({
        engine: p.name,
        url: p.url,
        status: 'error',
        success: false,
        message: err.message,
      });
    }
  }

  return results;
}

/**
 * Main dispatcher: Ping all indexing endpoints for an article
 */
export async function autoPingSearchEngines(articleUrl: string): Promise<IndexingResult[]> {
  console.log(`[Indexing] Automatically dispatching indexing pings for: ${articleUrl}...`);
  
  const [indexNowRes, sitemapRes] = await Promise.all([
    notifyIndexNow([articleUrl, `${SITE_URL}/`]),
    pingSitemaps(),
  ]);

  return [...indexNowRes, ...sitemapRes];
}
