// AddTON static page builder.
// Wraps each body in tools/pages/*.html with the shared head, nav, footer and scripts,
// and writes <name>.html to the site root. No dependencies: run `node tools/build.mjs`.
// The shared SVG defs (logo + icons) are read from index.html so there is one source of truth.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './seo.mjs';
import { seoHead, sitemap, robots, llms, manifest } from './seo-head.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const between = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return s.slice(i, j); };
const DEFS = between(index, '<!-- shared svg defs -->', '<!-- structural grid overlay -->').trim();

const PRODUCTS = [
  ['staking', 'i-stake', 'Staking', 'XLM, TON & 45+ coins in compounding vaults'],
  ['arbiex', 'i-arb', 'ArbiEx', 'AI arbitrage between DEX and tier-1 CEX'],
  ['gram-chain', 'i-chain', 'Gram Chain & GCC', 'Proof of Authority Layer 1, 0.8s blocks'],
  ['grampe', 'i-card', 'GramPe', 'Wallet app with RuPay debit card'],
];
const EARN = [
  ['helping', 'i-users', 'Helping', 'Help-to-earn community programme'],
  ['airdrop', 'i-star', 'Airdrop', 'Rewards for social tasks & content'],
  ['play-to-earn', 'i-game', 'Play to Earn', 'Coming soon · games with crypto rewards'],
];
const cur = (page, id) => (page === id ? ' aria-current="page"' : '');
const mega = (list, page) => list.map(([id, ic, name, sub]) =>
  `<a href="${id}.html" class="mega-link"${cur(page, id)}><span class="ico"><svg><use href="#${ic}"/></svg></span><span><b>${name}</b><small>${sub}</small></span></a>`).join('\n          ');
const mob = (list, page, n0) => list.map(([id, , name], i) =>
  `<a href="${id}.html"${cur(page, id)}><span>${String(n0 + i).padStart(2, '0')}</span>${name}</a>`).join('\n      ');

const head = (m, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${seoHead(m.page, body)}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
</head>
<body${m.auth ? ' class="auth-page"' : ''}>
<a class="skip" href="#main">Skip to content</a>

${DEFS}

<!-- structural grid overlay -->
<div class="frame-grid" aria-hidden="true"><div class="fg-in"><i></i><i></i><i></i><i></i><i></i></div></div>
`;

const announce = `
<!-- ANNOUNCEMENT -->
<div class="announce" id="announce" role="region" aria-label="Announcement">
  <div class="announce-in">
    <span class="ann-ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 10a6 6 0 0112 0v4l2 3H4l2-3z"/><path d="M10 20a2 2 0 004 0"/></svg></span>
    <span class="ann-badge">New</span>
    <p class="ann-text"><b>GCC exchange listing is coming soon.</b> <span>wGCC is already live on BNB Smart Chain.</span></p>
    <a class="ann-cta" href="gram-chain.html">Learn more <span aria-hidden="true">→</span></a>
    <button class="ann-close" type="button" aria-label="Dismiss announcement"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </div>
</div>
`;

const sidenav = (sections) => !sections || !sections.length ? '' : `
<!-- side section navigator -->
<nav class="sidenav" aria-label="Sections">
  ${sections.map(([id, label]) => `<a href="#${id}" data-target="${id}"><span>${label}</span></a>`).join('\n  ')}
</nav>
`;

const nav = (m) => `
<!-- NAV -->
<header class="nav" id="nav">
  <div class="container nav-in">
    <a href="index.html" class="brand" aria-label="AddTON home">
      <svg class="logo" viewBox="0 0 440 95" role="img" aria-label="AddTON DAO"><use href="#logo-full"/></svg>
    </a>
    <a href="products.html" class="eco-cell spec-top"${cur(m.page, 'products')}><span class="eco-dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Our ecosystem</a>
    <nav class="menu" aria-label="Primary">
      <div class="menu-item has-mega">
        <button class="menu-link" aria-expanded="false">Products <span class="caret" aria-hidden="true">▾</span></button>
        <div class="mega">
          ${mega(PRODUCTS, m.page)}
        </div>
      </div>
      <div class="menu-item has-mega">
        <button class="menu-link" aria-expanded="false">Earn <span class="caret" aria-hidden="true">▾</span></button>
        <div class="mega mega-sm">
          ${mega(EARN, m.page)}
        </div>
      </div>
      <a class="menu-link" href="opportunities.html"${cur(m.page, 'opportunities')}>Opportunities</a>
      ${m.faq ? '<a class="menu-link" href="#faq">FAQ</a>' : '<a class="menu-link" href="index.html#security">Security</a>'}
    </nav>
    <div class="nav-actions">
      <a class="nav-login" href="login.html">Log in</a>
      <a class="btn-hud" href="signup.html"><span class="hud-dots" aria-hidden="true">••</span>Create account</a>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="mobile"><span></span><span></span></button>
    </div>
  </div>
  <div class="mobile" id="mobile">
    <div class="mobile-in">
      <p class="label">Products</p>
      ${mob(PRODUCTS, m.page, 1)}
      <p class="label">Earn</p>
      ${mob(EARN, m.page, 5)}
      <a href="opportunities.html"${cur(m.page, 'opportunities')}><span>08</span>Opportunities</a>
      <div class="mobile-cta">
        <a class="btn btn-line" href="login.html">Log in</a>
        <a class="btn btn-primary" href="signup.html">Create account</a>
      </div>
    </div>
  </div>
</header>
`;

const footer = `
<footer class="footer">
  <div class="container">
    <div class="foot-grid">
      <div class="fcell brandcell">
        <a href="index.html" class="brand"><svg class="logo" viewBox="0 0 440 95" role="img" aria-label="AddTON DAO"><use href="#logo-full"/></svg></a>
        <p>The inclusive finance layer where real-world assets meet on-chain liquidity.</p>
        <div class="socials">
          <a href="https://t.me/add_toncoin" target="_blank" rel="noopener" aria-label="Telegram">TG</a>
          <a href="https://x.com/addtoncoin" target="_blank" rel="noopener" aria-label="X">X</a>
          <a href="https://medium.com/@addtondao" target="_blank" rel="noopener" aria-label="Medium">M</a>
        </div>
      </div>
      <div class="fcell"><p class="label">Products</p><ul><li><a href="staking.html">Staking</a></li><li><a href="arbiex.html">ArbiEx</a></li><li><a href="gram-chain.html">Gram Chain</a></li><li><a href="grampe.html">GramPe</a></li></ul></div>
      <div class="fcell"><p class="label">Earn</p><ul><li><a href="helping.html">Helping</a></li><li><a href="airdrop.html">Airdrop</a></li><li><a href="play-to-earn.html">Play to Earn</a></li><li><a href="opportunities.html">Opportunities</a></li></ul></div>
      <div class="fcell"><p class="label">Account</p><ul><li><a href="login.html">Log in</a></li><li><a href="signup.html">Create account</a></li><li><a href="forgot-password.html">Reset password</a></li></ul></div>
    </div>
    <div class="foot-legal">
      <p><b>Risk notice:</b> Crypto assets are volatile. APY, ArbiEx profit and other figures are advertised or past rates, can change, and are not guaranteed. Only stake what you can afford to hold through market changes.</p>
      <p>© 2026 AddTON DAO</p>
    </div>
    <p class="giant" aria-hidden="true">ADDTON</p>
  </div>
</footer>

<!-- mobile sticky CTA -->
<div class="mcta" id="mcta" aria-label="Quick actions">
  <a class="btn btn-line" href="login.html">Log in</a>
  <a class="btn btn-primary" href="signup.html">Create account <span class="arr" aria-hidden="true">→</span></a>
</div>
`;

const authFooter = `
<footer class="auth-foot">
  <p>© 2026 AddTON DAO · AddTON will never ask for your password, private keys or seed phrase.</p>
  <p><a href="index.html">Home</a> · <a href="products.html">Products</a> · <a href="https://t.me/add_toncoin" target="_blank" rel="noopener">Telegram</a></p>
</footer>
`;

const scripts = `
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="assets/js/main.js" defer></script>
<script src="assets/js/pages.js" defer></script>
</body>
</html>
`;

const dir = path.join(root, 'tools', 'pages');
let n = 0;
for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.html'))) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const m = src.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error('missing meta block in ' + file);
  const meta = JSON.parse(m[1]);
  meta.page = file.replace(/\.html$/, '');
  const body = src.slice(m[0].length).trim();
  const html = meta.auth
    ? head(meta, body) + nav(meta) + `\n<main id="main">\n${body}\n</main>\n` + authFooter + scripts
    : head(meta, body) + sidenav(meta.sections) + announce + nav(meta) + `\n<main id="main">\n${body}\n</main>\n` + footer + scripts;
  fs.writeFileSync(path.join(root, meta.page + '.html'), html);
  n++;
}
// home page: refresh its SEO block in place
const SEO_A = '<!-- seo:start -->', SEO_B = '<!-- seo:end -->';
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const i = home.indexOf(SEO_A), j = home.indexOf(SEO_B);
if (i < 0 || j < 0) throw new Error('index.html is missing the seo:start / seo:end markers');
fs.writeFileSync(path.join(root, 'index.html'), home.slice(0, i + SEO_A.length) + '\n' + seoHead('index', home) + '\n' + home.slice(j));

// site-level SEO + AI visibility files
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap(today));
fs.writeFileSync(path.join(root, 'robots.txt'), robots());
fs.writeFileSync(path.join(root, 'llms.txt'), llms());
fs.writeFileSync(path.join(root, 'site.webmanifest'), manifest());
const missing = Object.keys(PAGES).filter(p => p !== 'index' && !fs.existsSync(path.join(dir, p + '.html')));
if (missing.length) throw new Error('SEO entries without a page: ' + missing.join(', '));
console.log(`built ${n} pages + index SEO, sitemap.xml, robots.txt, llms.txt, site.webmanifest`);
