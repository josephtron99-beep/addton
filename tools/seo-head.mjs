// Builds the <head> SEO block, JSON-LD structured data and the site-level SEO files.
import { SITE, BRAND, SOCIAL, PAGES, url, ogImage } from './seo.mjs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').trim();

// FAQ pairs read straight from the page's <details> markup, so schema always matches visible content.
export const faqs = html => [...html.matchAll(/<summary>(?:<span class="qn">[^<]*<\/span>)?([\s\S]*?)<i><\/i><\/summary>\s*<p>([\s\S]*?)<\/p>/g)]
  .map(m => [text(m[1]), text(m[2])]);

const ORG = {
  '@type': 'Organization', '@id': `${SITE}/#org`, name: BRAND, alternateName: 'AddTON', url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/assets/img/icon-512.png`, width: 512, height: 512 },
  image: `${SITE}/assets/img/og/index.png`,
  description: 'AddTON is one account for crypto staking, AI arbitrage trading (ArbiEx), the Gram Chain Layer 1 blockchain with its GCC coin, and the GramPe wallet.',
  sameAs: [SOCIAL.x, SOCIAL.telegram, SOCIAL.medium],
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: BRAND, alternateName: 'AddTON', inLanguage: 'en', publisher: { '@id': `${SITE}/#org` } };

const crumbs = page => {
  const chain = []; let p = page;
  while (p && p !== 'index') { chain.unshift(p); p = PAGES[p].parent; }
  return ['index', ...chain];
};

export const jsonLd = (page, html) => {
  const P = PAGES[page], u = url(page);
  const graph = [ORG, WEBSITE];
  const trail = crumbs(page);
  const web = {
    '@type': page === 'index' ? 'WebPage' : (page === 'products' || page === 'opportunities' ? 'CollectionPage' : 'WebPage'),
    '@id': `${u}#webpage`, url: u, name: P.title, description: P.desc, inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#org` },
    primaryImageOfPage: { '@type': 'ImageObject', url: ogImage(page), width: 1200, height: 630 },
  };
  if (trail.length > 1) {
    web.breadcrumb = { '@id': `${u}#breadcrumb` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${u}#breadcrumb`, itemListElement: trail.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: PAGES[p].name, item: url(p) })) });
  }
  graph.push(web);
  const qa = faqs(html);
  if (qa.length) graph.push({ '@type': 'FAQPage', '@id': `${u}#faq`, mainEntity: qa.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
  if (page === 'gram-chain') graph.push({ '@type': 'Thing', '@id': `${SITE}/#gcc`, name: 'GCC', alternateName: ['Gram Chain Coin', 'wGCC'], description: 'GCC is the native coin of Gram Chain, a Proof of Authority Layer 1 blockchain with 0.8 second blocks. wGCC is wrapped GCC on BNB Smart Chain.' });
  if (page === 'grampe') graph.push({ '@type': 'SoftwareApplication', '@id': `${SITE}/#grampe`, name: 'GramPe', applicationCategory: 'FinanceApplication', operatingSystem: 'Android, iOS', description: P.desc, publisher: { '@id': `${SITE}/#org` } });
  if (page === 'arbiex') graph.push({ '@type': 'Service', '@id': `${SITE}/#arbiex`, name: 'ArbiEx', serviceType: 'Automated crypto arbitrage trading', provider: { '@id': `${SITE}/#org` }, description: P.desc });
  if (page === 'staking') graph.push({ '@type': 'Service', '@id': `${SITE}/#staking`, name: 'AddTON Staking', serviceType: 'Crypto staking', provider: { '@id': `${SITE}/#org` }, description: P.desc });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>`;
};

export const seoHead = (page, html) => {
  const P = PAGES[page], u = url(page), img = ogImage(page), indexable = P.index !== false;
  const alt = `${P.og ? P.og.lines.join(' ') : BRAND} · AddTON`;
  return `<title>${esc(P.title)}</title>
<meta name="description" content="${esc(P.desc)}">
${P.keywords ? `<meta name="keywords" content="${esc(P.keywords)}">\n` : ''}<meta name="robots" content="${indexable ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : 'noindex, follow'}">
<link rel="canonical" href="${u}">
<link rel="alternate" hreflang="en" href="${u}">
<link rel="alternate" hreflang="x-default" href="${u}">
<meta name="author" content="${BRAND}">
<meta name="application-name" content="AddTON">
<meta name="apple-mobile-web-app-title" content="AddTON">
<meta name="format-detection" content="telephone=no">
<meta name="theme-color" content="#08080D">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:locale" content="en_US">
<meta property="og:title" content="${esc(P.title)}">
<meta property="og:description" content="${esc(P.desc)}">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${img}">
<meta property="og:image:secure_url" content="${img}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="${SOCIAL.xHandle}">
<meta name="twitter:creator" content="${SOCIAL.xHandle}">
<meta name="twitter:title" content="${esc(P.title)}">
<meta name="twitter:description" content="${esc(P.desc)}">
<meta name="twitter:image" content="${img}">
<meta name="twitter:image:alt" content="${esc(alt)}">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
${jsonLd(page, html)}`;
};

export const sitemap = (lastmod) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${Object.entries(PAGES).filter(([, p]) => p.index !== false).map(([page, p]) => `  <url>
    <loc>${url(page)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority.toFixed(1)}</priority>
    <image:image><image:loc>${ogImage(page)}</image:loc></image:image>
  </url>`).join('\n')}
</urlset>
`;

const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'DuckAssistBot', 'meta-externalagent', 'CCBot'];
export const robots = () => `# AddTON DAO: search engines and AI assistants are welcome.
User-agent: *
Allow: /
Disallow: /tools/

# AI search and answer engines (explicitly allowed for AI visibility)
${AI_BOTS.map(b => `User-agent: ${b}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE}/sitemap.xml
`;

// llms.txt: a plain-language map of the site for AI assistants (https://llmstxt.org)
export const llms = () => {
  const line = p => `- [${PAGES[p].name}](${url(p)}): ${PAGES[p].desc}`;
  return `# AddTON DAO

> AddTON is one account for crypto staking, AI arbitrage trading, payments and tokenized real-world assets across Stellar (XLM), TON, Gram Chain and more. Registration requires a Sponsor ID from an existing member.

Key facts:
- Staking: XLM (featured), TON, Rental Wallet Coin and 45+ coins across 6+ blockchains. Advertised XLM vault APY up to 250%+; rates vary, can change and are not guaranteed.
- ArbiEx: an AI staking bot that trades price gaps between DEX liquidity pools and tier-1 exchanges 24/7, only when the spread beats fees and slippage. Historical average around +5%; not guaranteed.
- Gram Chain: AddTON's Layer 1 blockchain, Proof of Authority consensus, a new block about every 0.8 seconds. GCC is the native coin (33.8B total supply); wGCC is wrapped GCC on BNB Smart Chain. GCC exchange listing is coming soon; dates are announced only on official Telegram and X.
- GramPe: a crypto wallet app to send, receive and swap TON, XLM, GCC, USDT and more, with a RuPay debit card. App store links are coming soon.
- Earn: Helping (help-to-earn), the AddTON Airdrop (social tasks, YouTube videos, articles) and Play to Earn (coming soon).
- Safety: AddTON never asks for passwords, private keys or seed phrases by message or email.

## Products
${['products', 'staking', 'arbiex', 'gram-chain', 'grampe'].map(line).join('\n')}

## Earn
${['opportunities', 'helping', 'airdrop', 'play-to-earn'].map(line).join('\n')}

## Account
${line('signup')}
- [Log in](${url('login')}): Sign in to the AddTON dashboard.

## Official channels
- [Telegram](${SOCIAL.telegram})
- [X (Twitter)](${SOCIAL.x})
- [Medium](${SOCIAL.medium})

## Optional
- [Home](${url('index')}): Overview of every AddTON product.
- Risk notice: crypto assets are volatile. APY, ArbiEx profit and other figures are advertised or past rates and are not guaranteed.
`;
};

export const manifest = () => JSON.stringify({
  name: BRAND, short_name: 'AddTON', description: PAGES.index.desc, start_url: '/', scope: '/', display: 'standalone',
  background_color: '#08080D', theme_color: '#08080D', lang: 'en',
  icons: [
    { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    { src: '/assets/img/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
  ],
}, null, 2) + '\n';
