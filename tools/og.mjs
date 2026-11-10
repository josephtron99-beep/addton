// Renders the social share (Open Graph) images and app icons with headless Chrome.
// Run: node tools/og.mjs   → assets/img/og/<page>.png (1200×630) + assets/img/icon-*.png
// Text comes from SEO in tools/seo.mjs, the logo from index.html, so images stay on-brand.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PAGES } from './seo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, 'tools', '.og-tmp');
const outDir = path.join(root, 'assets', 'img', 'og');
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find(p => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome or Edge not found');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const LOGO = index.match(/<path id="logo-path" d="([^"]+)"/)[1];
const SPEC = 'linear-gradient(90deg,#9D93FF 0%,#5B8CFF 30%,#2EE6D6 55%,#C6F432 78%,#FF6A2B 100%)';
const CONIC = 'conic-gradient(from 0deg,#9D93FF,#5B8CFF,#2EE6D6,#C6F432,#FF6A2B,#9D93FF)';

const fonts = `<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&family=Geist+Mono:wght@400;500&display=block" rel="stylesheet">`;
const defs = `<svg width="0" height="0" style="position:absolute"><defs>
  <path id="lp" d="${LOGO}"/>
  <linearGradient id="sm" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="95" y2="95"><stop offset="0" stop-color="#9D93FF"/><stop offset=".35" stop-color="#5B8CFF"/><stop offset=".6" stop-color="#2EE6D6"/><stop offset=".8" stop-color="#C6F432"/><stop offset="1" stop-color="#FF6A2B"/></linearGradient>
</defs></svg>`;

const card = p => `<!doctype html><html><head><meta charset="utf-8">${fonts}<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#08080D;color:#F2F2F7;font-family:Manrope,sans-serif}
.c{position:relative;width:1200px;height:630px;padding:56px 64px;display:flex;flex-direction:column}
.c::before{content:"";position:absolute;inset:0;background:
  radial-gradient(520px 420px at 930px 330px,rgba(108,92,255,.38),transparent 70%),
  radial-gradient(400px 300px at 120px 640px,rgba(46,230,214,.12),transparent 70%)}
.g{position:absolute;inset:0;background-image:linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:240px 100%;background-position:64px 0}
.bar{position:absolute;left:0;right:0;top:0;height:5px;background:${SPEC}}
.top,.mid,.bot{position:relative}
.top{display:flex;justify-content:space-between;align-items:center}
.logo{height:46px;width:auto;fill:#F2F2F7}
.url{font-family:"Geist Mono";font-size:20px;letter-spacing:.14em;color:rgba(242,242,247,.55)}
.mid{margin-top:auto;max-width:760px}
.tag{display:inline-flex;border:1px solid rgba(255,255,255,.18);font-family:"Geist Mono";font-size:20px;letter-spacing:.14em;text-transform:uppercase;background:#0D0D14}
.tag span{padding:10px 16px;color:rgba(242,242,247,.75)}.tag b{padding:10px 14px;border-left:1px solid rgba(255,255,255,.18);font-weight:500;color:#2EE6D6}
h1{margin-top:26px;display:flex;flex-direction:column;align-items:flex-start;gap:12px;font-weight:400;font-size:${p.og.size || 74}px;line-height:1.04;letter-spacing:-.045em}
h1 span{position:relative;padding:2px 18px 8px;white-space:nowrap}
h1 span::before{content:"";position:absolute;inset:0;padding:2px;background:${SPEC};-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
h1 span::after{content:"";position:absolute;inset:2px;background:linear-gradient(90deg,rgba(157,147,255,.12),transparent 60%);z-index:-1}
.bot{display:flex;margin-top:40px;border:1px solid rgba(255,255,255,.12);background:rgba(8,8,13,.7);width:max-content}
.bot div{padding:16px 28px}.bot div+div{border-left:1px solid rgba(255,255,255,.12)}
.bot b{display:block;font-size:34px;font-weight:400;letter-spacing:-.03em}
.bot small{font-family:"Geist Mono";font-size:15px;letter-spacing:.12em;text-transform:uppercase;color:rgba(242,242,247,.5)}
.coin{position:absolute;right:70px;top:150px;width:300px;height:300px;border-radius:50%;padding:12px;background:${CONIC};box-shadow:0 0 120px rgba(108,92,255,.45)}
.coin i{display:grid;place-items:center;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 34% 28%,#2B2945,#141320 45%,#0A0A10)}
.coin i::before{content:"";position:absolute;inset:34px;border-radius:50%;border:1px dashed rgba(255,255,255,.16)}
.coin svg{width:120px;height:120px;fill:url(#sm)}
.coin em{position:absolute;left:0;right:0;bottom:70px;text-align:center;font-style:normal;font-family:"Geist Mono";font-size:16px;letter-spacing:.3em;color:rgba(242,242,247,.6)}
.coin .t{font-size:78px;font-weight:600;letter-spacing:-.04em;background:${SPEC};-webkit-background-clip:text;color:transparent}
</style></head><body>${defs}<div class="c"><div class="g"></div><div class="bar"></div>
<div class="top"><svg class="logo" viewBox="0 0 440 95"><use href="#lp"/></svg><span class="url">ADDTON.IO</span></div>
<div class="coin"><i>${p.og.coin ? `<span class="t">${p.og.coin}</span>` : '<svg viewBox="0 0 95.2 95"><use href="#lp"/></svg>'}</i><em>${p.og.coinLabel || 'ADDTON'}</em></div>
<div class="mid"><span class="tag"><span>${p.og.label}</span><b>${p.og.num}</b></span>
<h1>${p.og.lines.map(l => `<span>${l}</span>`).join('')}</h1></div>
<div class="bot">${p.og.stats.map(([v, k]) => `<div><b>${v}</b><small>${k}</small></div>`).join('')}</div>
</div></body></html>`;

const icon = (size, pad) => `<!doctype html><html><head><meta charset="utf-8"><style>*{margin:0}html,body{width:${size}px;height:${size}px;overflow:hidden;background:#08080D}
div{width:${size}px;height:${size}px;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,#1A1830,#08080D 70%)}
svg{width:${size - pad * 2}px;height:${size - pad * 2}px;fill:url(#sm)}</style></head><body>${defs}<div><svg viewBox="0 0 95.2 95"><use href="#lp"/></svg></div></body></html>`;

const shot = (html, name, w, h, out) => {
  const f = path.join(tmp, name + '.html');
  fs.writeFileSync(f, html);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${w},${h}`,
    '--virtual-time-budget=6000', `--screenshot=${out}`, pathToFileURL(f).href], { stdio: 'ignore' });
  console.log('✓', path.relative(root, out));
};

for (const [page, p] of Object.entries(PAGES)) if (p.og) shot(card(p), page, 1200, 630, path.join(outDir, page + '.png'));
shot(icon(180, 26), 'apple', 180, 180, path.join(root, 'assets', 'img', 'apple-touch-icon.png'));
shot(icon(192, 28), 'i192', 192, 192, path.join(root, 'assets', 'img', 'icon-192.png'));
shot(icon(512, 80), 'i512', 512, 512, path.join(root, 'assets', 'img', 'icon-512.png'));
fs.rmSync(tmp, { recursive: true, force: true });
