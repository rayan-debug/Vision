import type { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

// Explicit allowlist for AI crawlers so the site can be indexed and cited by
// AI search engines (Answer Engine Optimisation). Each engine has its own
// crawler — listing them keeps us robust even when a host adds a default deny.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/preview/'] },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      // OpenAI
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      // Anthropic
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      // Perplexity
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      // Apple
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      // Common Crawl (powers many AI training corpora)
      { userAgent: 'CCBot', allow: '/' },
      // Mistral, Meta, You.com, Cohere
      { userAgent: 'MistralAI-User', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
      { userAgent: 'YouBot', allow: '/' },
      { userAgent: 'cohere-ai', allow: '/' },
      // Yandex, Baidu — for international reach
      { userAgent: 'YandexBot', allow: '/' },
      { userAgent: 'Baiduspider', allow: '/' },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
