---
name: addton-web-design
description: AddTON website design system (v3 "Grid HUD") and senior UI/UX + motion playbook. Load before designing, building or reviewing ANY page of the AddTON site (home, staking, arbiex, gram-chain, grampe, products, helping, play-to-earn, opportunities, airdrop, login, signup, forgot-password) so every page shares one type scale, colour system, section grammar, motion language and QA checklist.
---

# AddTON Web Design System: v3 "Grid HUD"

The approved direction combines three sources:
- **ChainGPT-style HUD grid** (reference: chaingpt.org): near-black canvas, visible structural column lines, HUD corner brackets, chamfered (cut-corner) frames, spectrum-gradient strokes, monospace uppercase labels, scramble/decode text, a pinned central object while content scrolls past, layer diagrams with circuit lines and travelling pulses, side section navigator, preloader.
- **v2 corporate structure:** trust-first content, mega-menu, security section, FAQ, risk notes beside every number, Manrope + Geist Mono, GSAP + Lenis.
- **v1 meaningful demos:** live demos that prove a fact (blocks at the real 0.8s pace, ArbiEx spread vs fee threshold, compounding calculator), and the 3D card tilt.

Do not reuse the "Sui" light-blue water concept or the cream/serif editorial concept.

## Tokens
```
--bg #08080D  --bg-2 #0D0D14  --raise #12121B
--line rgba(255,255,255,.08) / .14 / .28
--text #F2F2F7 / .66 / .42 alpha
--brand #6C5CFF  --brand-2 #9D93FF  --cyan #2EE6D6  --lime #C6F432  --orange #FF6A2B  --up #22D39A
--spec  linear-gradient(90deg,#9D93FF,#5B8CFF,#2EE6D6,#C6F432,#FF6A2B)   (strokes, frames, progress lines only, never large fills)
Container 1320px, gutter clamp(20px,3.4vw,40px); section padding clamp(96px,12vw,160px)
Chamfer: clip-path polygon with --c (6/8/10px). No rounded corners except coin and card.
```

## Logo
Official file: `assets/img/logo.svg` (white wordmark + circular "A" mark + DAO pill, 440×95). It is inlined once as `<path id="logo-path">`, with two symbols: `#logo-full` (viewBox 0 0 440 95) for the nav and footer, and `#logo-mark` (viewBox 0 0 95.2 95) for coin faces and icons. Fill comes from CSS (`.logo{fill:var(--text)}`, coin uses `url(#specMark)`, a userSpaceOnUse gradient). The favicon is the mark on a dark tile. Never redraw the logo or use the old "+" placeholder mark.

## Type
- Manrope: H1 400 weight, -0.045em, inside spectrum `.tframe` frames; H2 500, -0.03em, with a `.muted` second phrase; H3 600.
- Geist Mono uppercase, .12–.14em tracking for labels, tags, rails, numbers, buttons in HUD style.
- `font-variant-numeric: tabular-nums` on every changing number.
- Minimum sizes (user feedback: text was too small): body 17px, lead 1.1–1.25rem, card copy 1.04rem, mono labels and tags at least 0.76rem, buttons 1rem/54px tall. The "readability scale" block in styles.css is the source of truth.
- Live counters change only the digits that differ, with a short odometer roll (`.dg.roll`). Lists of live items move as a conveyor: each item has an index `--i` and all glide one slot together. Never insert-and-push with width animations.

## Mobile rules
- Hero order: title → copy → CTAs → coin → command HUD → feature chips (2 columns).
- Pinned visuals are hidden under 1024px. Each card shows its own icon and "01 / 05" index instead.
- Sticky bottom bar (Log in + Create account) appears after the hero and hides at the final CTA.
- Section padding 76px, gutter 20px, tap targets at least 44px.

## Components (in assets/css/styles.css)
`.sec-tag` (label + number cell), `.layer-tag`, `.pnum`, `.nbox` (chamfered icon box), `.hud` (corner brackets), `.tframe` (spectrum frame), `.ptags` (right-aligned mono feature rails), `.panel`, `.metrics .cell`, `.btn-primary` (spectrum fill on hover), `.btn-line`, `.btn-hud`, `.coin3d` (CSS 3D coin: edge layers + faces), `.diagram` (SVG circuits + absolutely-placed nodes; becomes a list under 760px), `.sidenav`, preloader.

## Section grammar (home)
Announcement → Nav (ecosystem cell + mega menus + HUD CTA) → Hero (cmd HUD · coin · rail / framed title · copy+CTAs) → Metric cells → Coin marquee → 01 Products (pinned coin flips per product) → 02 Stack (3 layer diagrams) → 03 Live demos → 04 Get started → 05 Security → 06 GramPe → 07 Earn → 08 FAQ → CTA → Footer (cells + giant outline wordmark).
Inner pages: Hero (framed title + pinned visual) → numbered feature sections → live demo → FAQ → CTA. Each section opens with a `.sec-tag` and number.

## Motion
GSAP 3 + ScrollTrigger (cdnjs 3.12.5) and Lenis 1.1.13 (jsdelivr), driven by gsap.ticker.
- Intro: grid lines draw down, frames wipe open, title lines rise, coin spins in. Preloader shows once per session.
- Headings: masked word rise. Tags: clip-path wipe. Rails: slide in from the right. Labels: scramble/decode on enter and on hover.
- Pinned product coin: an IntersectionObserver picks the active item; the coin flips 360° and swaps its face icon halfway through.
- Diagrams: circuits draw with stroke-dashoffset, then nodes pop in. Pulses use SVG animateMotion, and the Gram layer pulses at the real 0.8s.
- Scrub limited to: hero coin drift, steps progress line.
- Demos run only while visible. Reduced motion: no preloader, no Lenis, no loops; all content visible.
- Content must be visible if GSAP/CDN fails (hide only via JS).

## Stack layers: each layer gets its own visual
Every layer has a `.layer-head` (mono label + H3 on the left, description paragraph + `.lchips` on the right). Never repeat one diagram style across layers.
- L01 Applications: `.apps` cards wired with `.wire` pulses into a spectrum `.bus` (the AddTON account).
- L02 Assets: `.tokens` strip plus live `.mkt` market cards.
- L03 Gram Chain: `.pipe` transaction pipeline. Stages light every 200ms, so one full trip equals one 0.8s block. Followed by `.chain-cells`.

## Notification bar (announcement)
Use a tinted brand band (indigo → teal gradient with a slow sheen), not the page background, so it reads as a message. It contains a bell icon with a pulse, a lime chamfered NEW badge, a bold headline plus a secondary line, a "Learn more" chip, and a dismiss ×. Dismissal is stored in localStorage under a key unique to each announcement (`addton-ann-<slug>`), so changing the announcement means changing the key. On mobile, hide the icon and secondary line.

## Hero grid rule
Use `repeat(3, minmax(0,1fr))`, never bare `1fr` columns, because nowrap titles inflate `1fr`. The title spans 2 columns in its own row, so the coin stays exactly centred. Coin faces centre the mark; the label is absolutely positioned at 19% from the bottom.

## Simulator console (interactive demos)
Demos live in one `.console`: a vertical tab rail (number, title, "what you're seeing" line, progress bar) plus a terminal window (dots, `addton://simulator/...` path, status pill, a SIMULATION badge in the rail). Tabs auto-advance every 12s while in view, pause on hover, and stop for good after any user interaction. Arrow keys switch tabs (ARIA tablist). Below 1024px the rail becomes a horizontal swipe row that scrolls the active tab into view. Each pane needs a visual answer to "why does this matter": the staking split bar and remaining-year ghost line, the ArbiEx fee-threshold gauge, the block legend and session stats.

## GSAP gotcha
Never use `once: true` on ScrollTriggers. With GSAP 3.12, self-killing triggers throw "reading 'pin'" when the page loads already scrolled. Use `toggleActions: 'play none none none'`, and in `ScrollTrigger.batch` guard with a `data-shown` flag. Set `history.scrollRestoration = 'manual'`.

## Live market data
- Single source: CoinGecko `/coins/markets` (price, 1h/24h/7d/30d change, mcap, volume, supply, ATH, 24h high/low, 7d hourly sparkline). Binance TONUSDT did not match Toncoin, so never mix sources.
- Poll every 60s only while visible. Back off on errors. Show an "Updated Xs ago" counter, and switch "Live" to "Delayed" after 3 min. Show a skeleton while loading and an error with Retry. Never show placeholder or invented prices.
- Do not add price predictions or "growth forecasts". Show factual trend (1h/24h/7d/30d, distance from ATH, 24h range position) with an "information only, not investment advice" note.

## Content rules
Only facts from addton.io. No invented partners, users, audits or testimonials. Every APY/profit figure gets a "not guaranteed" note. Every CTA area mentions that a Sponsor ID is required.

## Multi-page build (v4)
- Home is hand-written in `index.html`. All other pages are generated: edit the body in `tools/pages/<name>.html` (a JSON meta comment at the top: title, desc, `faq`, `sections` for the sidenav, `auth` for account pages), then run `node tools/build.mjs`. The script adds the shared head, SVG defs (read from index.html), announcement, nav with `aria-current`, footer, sticky mobile CTA and scripts. Never edit generated root `.html` files by hand; commit them, because Vercel serves them as-is.
- Internal links are relative (`staking.html`), so the site works on Vercel and locally.
- `assets/js/main.js` modules each check for their own elements, so demos (staking calc `#amt`, ArbiEx `#arb`, blocks `#gB`, markets `.mkt`, pipeline `#pipe`, card `#pcard`) can be reused on any page with the same markup. Page-only interactions live in `assets/js/pages.js`.
- Gotcha: when patching JS with `String.replace`, `$$` in the replacement becomes `$`. Use a function replacement.
- Inner page grammar: `.hero.phero` (crumbs, sec-tag, `.ptitle` with two `.tframe` lines, lead, CTAs, a unique visual in `.phero-vis`) → `.metrics.m3/.m4` → numbered sections → FAQ → CTA. Each page has its own hero visual: staking coin + orbit, ArbiEx trade ticket + flow, Gram coin, GramPe phone + card, Helping network, Airdrop notification feed, Play-to-Earn game card.
- Components: `.cells` (gap-line grid, set `--cols`; `.c3` keeps 3 columns on tablet), `.cel`, `.tile`, `.vault`, `.split2`, `.checks`, `.olist`, `.note` / `.note.safe`, `.console.solo` + `.demo-foot`, `.stable`, `.bridge`, `.plat`, `.vmock` / `.amock`.
- Never put a padding shorthand on an element that also has `.container`: it wipes the side gutter. Use padding-top / padding-bottom.
- Forms (login, sign-up, forgot password, airdrop submit) are front-end only: client validation, show/hide password, strength meter, 3-step sign-up. A valid submit sends nothing and shows a `.form-msg` linking to the current page on addton.io, until the backend (session, anti-forgery token, captcha) is wired in.

## QA before showing the user
360/390/768/1024/1280/1440 widths: no horizontal scroll, no overlaps (watch the sidenav against right rails), tap targets at least 44px, zero console errors, visible focus, reduced-motion pass. Files: index.html, assets/css/styles.css, assets/js/main.js, assets/img/. These deploy unchanged to Vercel.
