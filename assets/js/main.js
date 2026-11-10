/* AddTON v3: interactions & motion
   GSAP + ScrollTrigger + Lenis are optional; content is visible without them. */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  // Always start at the top so the intro plays in order (unless a #section link was opened).
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  const whenVisible = (el, start, stop, th = 0.1) => el && new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: th }).observe(el);

  /* ---------- scramble text (decode effect) ---------- */
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+<>/';
  const scramble = (el, dur = 700) => {
    const final = el.dataset.final || (el.dataset.final = el.textContent);
    if (RM) { el.textContent = final; return; }
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), reveal = Math.floor(p * final.length);
      el.textContent = final.split('').map((ch, i) => (i < reveal || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };
  const sio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { scramble(e.target); sio.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-scramble]').forEach(el => sio.observe(el));
  $$('.rail li').forEach(li => li.addEventListener('pointerenter', () => scramble(li.querySelector('[data-scramble]'), 450)));

  /* ---------- 3D coin edges ---------- */
  $$('.coin-edge').forEach(edge => {
    let html = '';
    for (let z = -13; z <= 13; z += 2) html += `<i style="transform:translateZ(${z}px)"></i>`;
    edge.innerHTML = html;
  });
  // mouse tilt on coins
  if (FINE && !RM) addEventListener('pointermove', e => {
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    $$('.coin-tilt').forEach(t => { if (!t.classList.contains('flip')) t.style.transform = `rotateY(${x * 30}deg) rotateX(${-y * 20}deg)`; });
  }, { passive: true });

  /* ---------- preloader ---------- */
  const runIntro = () => document.dispatchEvent(new Event('intro'));
  if (!RM && !sessionStorage.getItem('addton-loaded')) {
    const pl = document.createElement('div');
    pl.className = 'preload';
    pl.innerHTML = '<span class="pl-c c1"></span><span class="pl-c c2"></span><span class="pl-c c3"></span><span class="pl-c c4"></span><div class="pl-row"><span>LOADING</span><span id="plN">000</span><i class="pl-bar"></i></div>';
    document.body.appendChild(pl); document.body.classList.add('loading');
    const bar = pl.querySelector('.pl-bar'), n = pl.querySelector('#plN'), t0 = performance.now(), D = 1100;
    const tick = t => {
      const p = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - p, 3);
      bar.style.width = e * 100 + '%'; n.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (p < 1) return requestAnimationFrame(tick);
      pl.style.transition = 'clip-path .8s cubic-bezier(.16,1,.3,1)'; pl.style.clipPath = 'inset(0 0 100% 0)';
      document.body.classList.remove('loading'); runIntro();
      setTimeout(() => pl.remove(), 900);
      try { sessionStorage.setItem('addton-loaded', '1'); } catch (_) {}
    };
    requestAnimationFrame(tick);
  } else requestAnimationFrame(runIntro);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!RM && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGSAP) { lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return;
    e.preventDefault(); closeMenu();
    lenis ? lenis.scrollTo(t, { offset: id === '#top' ? -200 : -70 }) : t.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }));

  /* ---------- nav ---------- */
  const nav = $('#nav'), burger = $('#burger');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (!nav.classList.contains('open')) { if (y > 500 && y > lastY + 4) nav.classList.add('hide'); else if (y < lastY - 4) nav.classList.remove('hide'); }
    lastY = y;
  }, { passive: true });
  function closeMenu() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; lenis && lenis.start(); }
  burger.addEventListener('click', () => {
    const o = !nav.classList.contains('open');
    nav.classList.toggle('open', o); burger.setAttribute('aria-expanded', String(o));
    document.body.style.overflow = o ? 'hidden' : ''; lenis && (o ? lenis.stop() : lenis.start());
  });
  $$('#mobile a').forEach(a => a.addEventListener('click', closeMenu));
  $$('.has-mega > .menu-link').forEach(b => b.addEventListener('click', () => {
    const it = b.parentElement, o = !it.classList.contains('open');
    $$('.menu-item.open').forEach(m => m.classList.remove('open'));
    it.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o));
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.has-mega')) $$('.menu-item.open').forEach(m => m.classList.remove('open')); });
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); $$('.menu-item.open').forEach(m => m.classList.remove('open')); } });

  /* ---------- side navigator ---------- */
  const sideLinks = $$('.sidenav a');
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) sideLinks.forEach(a => a.classList.toggle('on', a.dataset.target === e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-nav]').forEach(s => navIO.observe(s));

  /* ---------- command HUD typing ---------- */
  const cmds = [
    ['stake 250 xlm --vault', 'Vault APY 250%+ · compounding', 'STAKING'],
    ['arbiex activate', 'Trade #12853 closed · +5.2% net', 'ARBIEX AI'],
    ['send 120 xlm --to alex', 'Settled in 4s', 'GRAMPE'],
    ['gram block --latest', '#8,412,206 confirmed · 0.8s', 'GRAM CHAIN'],
    ['swap xlm ton', 'Swapped inside GramPe', 'GRAMPE']
  ];
  const cmdT = $('#cmdText'), cmdO = $('#cmdOut'), cmdTag = $('#cmdTag');
  let ci = 0;
  const typeCmd = () => {
    const [c, o, tag] = cmds[ci++ % cmds.length];
    cmdO.style.opacity = 0; cmdTag.textContent = tag;
    if (RM) { cmdT.textContent = c; cmdO.textContent = '✓ ' + o; cmdO.style.opacity = 1; return setTimeout(typeCmd, 4000); }
    let i = 0;
    const tw = setInterval(() => {
      cmdT.textContent = c.slice(0, ++i);
      if (i >= c.length) { clearInterval(tw); setTimeout(() => { cmdO.textContent = '✓ ' + o; cmdO.style.opacity = 1; }, 350); setTimeout(typeCmd, 3200); }
    }, 45);
  };
  document.addEventListener('intro', () => setTimeout(typeCmd, 600), { once: true });

  /* ---------- counters ---------- */
  const countUp = el => {
    const end = +el.dataset.count, dec = +(el.dataset.dec || 0), pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const out = v => (el.textContent = pre + fmt(v, dec) + suf);
    if (RM) return out(end);
    const t0 = performance.now();
    const tick = t => { const p = Math.min(1, (t - t0) / 1800); out(end * (1 - Math.pow(1 - p, 4))); if (p < 1) requestAnimationFrame(tick); };
    out(0); requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: 0.6 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- coins marquee ---------- */
  const coins = [['XLM','Stellar','#2A2A35'],['TON','Toncoin','#0098EA'],['GCC','Gram Chain','#6C5CFF'],['wGCC','wGCC','#C99A06'],['RWC','Rental Wallet Coin','#6B5B3E'],['₿','Bitcoin','#F7931A'],['Ξ','Ethereum','#627EEA'],['$','Tether','#26A17B'],['BNB','BNB','#C99A06'],['SOL','Solana','#9945FF'],['Ł','Litecoin','#345D9D'],['XRP','XRP','#23292F'],['TRX','TRON','#EB0029'],['$','USDC','#2775CA']];
  const ch = coins.map(([s, n, c]) => `<span class="coin"><i style="--c:${c}">${s}</i>${n}</span>`).join('');
  $('#coins').innerHTML = ch + ch;

  /* ---------- announcement: dismissible, remembered per announcement id ---------- */
  const ann = $('#announce'), ANN_KEY = 'addton-ann-gcc-listing';
  if (ann) {
    let dismissed = false; try { dismissed = localStorage.getItem(ANN_KEY) === '1'; } catch (_) {}
    if (dismissed) ann.remove();
    else ann.querySelector('.ann-close').addEventListener('click', () => {
      ann.classList.add('closed'); try { localStorage.setItem(ANN_KEY, '1'); } catch (_) {}
      setTimeout(() => { ann.remove(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }, 500);
    });
  }

  /* ---------- mobile sticky CTA: visible after hero, hidden near final CTA/footer ---------- */
  const mcta = $('#mcta'), heroEl = $('.hero'), ctaEl = $('.cta-sec');
  let pastHero = false, nearEnd = false;
  const syncCta = () => mcta.classList.toggle('show', pastHero && !nearEnd && !nav.classList.contains('open'));
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; syncCta(); }).observe(heroEl);
  new IntersectionObserver(([e]) => { nearEnd = e.isIntersecting || e.boundingClientRect.top < 0; syncCta(); }).observe(ctaEl);
  burger.addEventListener('click', syncCta);

  /* ---------- products: mobile meta row (icon + index), desktop uses the pinned coin ---------- */
  $$('.pitem').forEach((it, i, all) => {
    const m = document.createElement('div'); m.className = 'pmeta'; m.setAttribute('aria-hidden', 'true');
    m.innerHTML = `<span class="nbox"><svg><use href="#${it.dataset.icon}"/></svg></span><span><b>${String(i + 1).padStart(2, '0')}</b> / ${String(all.length).padStart(2, '0')}</span>`;
    it.prepend(m);
  });

  /* ---------- products: active item drives pinned coin ---------- */
  const items = $$('.pitem'), pTilt = $('#prodCoin .coin-tilt'), pIco = $('#prodIco use'), pName = $('#prodName'), pIdx = $('#prodIdx');
  let cur = 0;
  const setProduct = i => {
    if (i === cur) return; cur = i;
    items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    pIdx.textContent = String(i + 1).padStart(2, '0');
    const it = items[i];
    if (RM) { pIco.setAttribute('href', '#' + it.dataset.icon); pName.textContent = it.dataset.name; return; }
    pTilt.classList.remove('flip'); void pTilt.offsetWidth; pTilt.style.transform = ''; pTilt.classList.add('flip');
    setTimeout(() => { pIco.setAttribute('href', '#' + it.dataset.icon); pName.textContent = it.dataset.name; }, 280);
    setTimeout(() => pTilt.classList.remove('flip'), 1000);
  };
  const pio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setProduct(+e.target.dataset.i); }), { rootMargin: '-48% 0px -48% 0px' });
  items.forEach(it => pio.observe(it));

  /* ---------- SIMULATOR CONSOLE: tabs (auto-advance, pause on hover/interaction) ---------- */
  const conTabs = $$('.con-tab'), panes = $$('.pane'), conEl = $('#console');
  const TAB_MS = 12000;
  let activeTab = 0, autoplay = !RM, conInView = false, conHover = false, tabStart = performance.now(), tabRaf = 0;
  const showTab = (i, focus) => {
    if (i === activeTab && panes[i] && !panes[i].hidden) return;
    activeTab = i;
    conTabs.forEach((t, k) => { const on = k === i; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; t.querySelector('.ct-bar i').style.transform = 'scaleX(0)'; });
    panes.forEach((p, k) => { const on = k === i; p.hidden = !on; p.classList.toggle('on', on); if (on && !RM) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); } });
    $('#conPath').textContent = conTabs[i].dataset.path; $('#conStatus').textContent = conTabs[i].dataset.status;
    const row = $('.con-tabs');   // horizontal tab row on tablet/mobile: bring active tab into view (row only, never the page)
    if (row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: conTabs[i].offsetLeft - 12, behavior: RM ? 'auto' : 'smooth' });
    if (focus) conTabs[i].focus();
    tabStart = performance.now();
  };
  const stopAuto = () => { autoplay = false; conTabs.forEach(t => (t.querySelector('.ct-bar i').style.transform = 'scaleX(1)')); };
  conTabs.forEach((t, i) => {
    t.addEventListener('click', () => { stopAuto(); showTab(i); });
    t.addEventListener('keydown', e => {
      const k = e.key, n = conTabs.length;
      if (['ArrowDown', 'ArrowRight'].includes(k)) { e.preventDefault(); stopAuto(); showTab((activeTab + 1) % n, true); }
      if (['ArrowUp', 'ArrowLeft'].includes(k)) { e.preventDefault(); stopAuto(); showTab((activeTab - 1 + n) % n, true); }
    });
  });
  conEl.addEventListener('pointerenter', () => (conHover = true));
  conEl.addEventListener('pointerleave', () => { conHover = false; tabStart = performance.now() - (tabStart ? 0 : 0); });
  $$('.pane input, .pane button').forEach(c => c.addEventListener('input', stopAuto));
  $$('.pane button').forEach(c => c.addEventListener('click', stopAuto));
  let pausedAt = 0;
  const tabLoop = t => {
    if (autoplay && conInView) {
      if (conHover) { if (!pausedAt) pausedAt = t; }
      else {
        if (pausedAt) { tabStart += t - pausedAt; pausedAt = 0; }
        const p = Math.min(1, (t - tabStart) / TAB_MS);
        conTabs[activeTab].querySelector('.ct-bar i').style.transform = `scaleX(${p})`;
        if (p >= 1) showTab((activeTab + 1) % conTabs.length);
      }
    }
    tabRaf = requestAnimationFrame(tabLoop);
  };
  new IntersectionObserver(([e]) => {
    conInView = e.isIntersecting;
    if (conInView && !tabRaf) { tabStart = performance.now(); tabRaf = requestAnimationFrame(tabLoop); }
    if (!conInView && tabRaf) { cancelAnimationFrame(tabRaf); tabRaf = 0; }
  }, { threshold: 0.35 }).observe(conEl);
  if (RM) stopAuto();

  /* ---------- 01 staking projection ---------- */
  const APY = { XLM: 2.5, TON: 2.5 };
  let coin = 'XLM', shown = 0, raf = 0;
  const amt = $('#amt'), mo = $('#mo');
  const fill = r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%');
  const tweenBig = to => {
    cancelAnimationFrame(raf);
    const from = shown, t0 = performance.now();
    const st = t => { const p = RM ? 1 : Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - p, 3); shown = from + (to - from) * e; $('#big').textContent = fmt(shown) + ' ' + coin; if (p < 1) raf = requestAnimationFrame(st); };
    raf = requestAnimationFrame(st);
  };
  const short = v => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
  const calc = () => {
    const P = +amt.value, m = +mo.value, g = 1 + APY[coin];
    const val = mm => P * Math.pow(g, mm / 12);
    fill(amt); fill(mo);
    $('#amtL').textContent = fmt(P) + ' ' + coin;
    $('#moL').textContent = m + (m > 1 ? ' months' : ' month');
    const final = val(m), gain = final - P;
    tweenBig(final); $('#gain').textContent = '+' + fmt(gain) + ' ' + coin;
    $('#pL').textContent = fmt(P); $('#rL').textContent = '+' + fmt(gain);
    $('#pBar').style.width = (P / final) * 100 + '%'; $('#rBar').style.width = (gain / final) * 100 + '%';
    $('#lastM').textContent = '+' + fmt(val(m) - val(m - 1)) + ' ' + coin;
    $$('.presets button').forEach(b => b.classList.toggle('on', +b.dataset.amt === P));
    // chart: x = full 12 months, y = principal → 12-month value; solid up to chosen month, dashed ghost after
    const W = 520, top = 14, bot = 186, lo = P, hi = val(12);
    const y = v => bot - ((v - lo) / (hi - lo)) * (bot - top), x = mm => (mm / 12) * W;
    const path = (a, b) => { const pts = []; for (let i = 0; i <= 48; i++) { const mm = a + ((b - a) * i) / 48; pts.push(x(mm).toFixed(1) + ' ' + y(val(mm)).toFixed(1)); } return 'M' + pts.join(' L'); };
    const d = path(0, m);
    $('#cLine').setAttribute('d', d);
    $('#cArea').setAttribute('d', `${d} L${x(m).toFixed(1)} 200 L0 200 Z`);
    $('#cGhost').setAttribute('d', m < 12 ? path(m, 12) : '');
    $('#cRest').setAttribute('x', x(m)); $('#cRest').setAttribute('width', Math.max(0, W - x(m)));
    $('#cDot').setAttribute('cx', Math.min(x(m), W - 6)); $('#cDot').setAttribute('cy', y(final));
    $('#yax').innerHTML = [hi, (hi + lo) / 2, lo].map((v, i) => `<span style="top:${[top, (top + bot) / 2, bot][i] / 200 * 100}%">${short(v)}</span>`).join('');
  };
  amt.addEventListener('input', calc); mo.addEventListener('input', calc);
  $$('.presets button').forEach(b => b.addEventListener('click', () => { amt.value = b.dataset.amt; calc(); }));
  $$('#pane-stake .seg button').forEach(b => b.addEventListener('click', () => { $$('#pane-stake .seg button').forEach(x => x.classList.toggle('on', x === b)); coin = b.dataset.coin; calc(); }));
  calc();

  /* ---------- 02 ArbiEx spread monitor ---------- */
  const TH = 0.6, GMAX = 1.2;
  let spreads = Array.from({ length: 40 }, () => (Math.random() < .2 ? .65 + Math.random() * .45 : Math.random() * .5)), arbT = null, tn = 12853, base = 3.41, scans = 0, trades = 0, net = 0;
  const thY = 90 - (TH / GMAX) * 80, thL = $('.spark .th'); thL.setAttribute('y1', thY); thL.setAttribute('y2', thY);
  const drawSpark = () => $('#aSpark').setAttribute('d', spreads.map((s, i) => (i ? 'L' : 'M') + ((i / (spreads.length - 1)) * 400).toFixed(1) + ' ' + (90 - (Math.min(GMAX, s) / GMAX) * 80).toFixed(1)).join(' '));
  const logRow = (sp, v) => { const li = document.createElement('li'); li.innerHTML = `<b>#${++tn}</b><span>+${sp.toFixed(2)}% spread</span><span class="p">+$${v.toFixed(2)}</span>`; const l = $('#aLog'); l.prepend(li); while (l.children.length > 4) l.lastChild.remove(); };
  for (let i = 0; i < 4; i++) logRow(.7 + Math.random() * .4, 80 + Math.random() * 120);
  const arbTick = () => {
    base += (Math.random() - .5) * .01;
    const sp = Math.random() < .22 ? .65 + Math.random() * .5 : Math.random() * .5, dex = base, cex = base * (1 + sp / 100), hot = sp > TH;
    $('#aDex').textContent = dex.toFixed(4); $('#aCex').textContent = cex.toFixed(4);
    const s = $('#aSp'); s.textContent = '+' + sp.toFixed(2) + '%'; s.classList.toggle('hot', hot);
    const st = $('#aState'); st.textContent = hot ? 'Gap beats costs · trading' : 'Below costs · skipped'; st.classList.toggle('hot', hot);
    const nd = $('#aNeedle'); nd.style.left = Math.min(sp / GMAX, 1) * 100 + '%'; nd.classList.toggle('hot', hot);
    spreads.push(sp); spreads.shift(); drawSpark();
    $('#aScan').textContent = fmt(++scans);
    if (hot) {
      const v = (2000 + Math.random() * 4000) * (sp - TH * .5) / 100; trades++; net += v;
      ['#aDex', '#aCex'].forEach(id => { const e = $(id); e.classList.add('flash'); setTimeout(() => e.classList.remove('flash'), 450); });
      logRow(sp, v); $('#aTrades').textContent = fmt(trades); $('#aNet').textContent = '+$' + fmt(net, 2);
    }
  };
  drawSpark();
  whenVisible($('#arb'), () => { if (!arbT && !RM) arbT = setInterval(arbTick, 1100); }, () => { clearInterval(arbT); arbT = null; });

  /* ---------- 03 Gram block stream (real 0.8s) ----------
     Conveyor: every block keeps an index (--i); a new block enters at -1 as "pending",
     all blocks glide one slot right together, then the new head confirms. */
  let h = 8412206, gT = null, prevStr = '', gCount = 0, gTx = 0;
  const gB = $('#gB'), timer = $('#gT'), gH = $('#gH'), MAX = 7;
  const chain = [];
  const renderHeight = () => {
    const s = '#' + fmt(h);
    gH.innerHTML = s.split('').map((c, i) => `<span class="dg${!RM && prevStr && prevStr[i] !== c ? ' roll' : ''}">${c}</span>`).join('');
    prevStr = s;
  };
  const bars = () => Array.from({ length: 8 }, () => `<span style="transform:scaleY(${(0.25 + Math.random() * 0.75).toFixed(2)})"></span>`).join('');
  const makeBlock = (num, pending) => {
    const b = document.createElement('div');
    b.className = 'blk' + (pending ? ' pending' : '');
    b.innerHTML = `<b>#${String(num).slice(-5)}</b><div class="bars">${bars()}</div><span class="st"><i></i><em class="stt">${pending ? 'validating' : (3 + ((Math.random() * 40) | 0)) + ' tx'}</em></span>`;
    return b;
  };
  const place = () => chain.forEach((b, i) => { b.style.setProperty('--i', i); b.style.opacity = i >= MAX - 1 ? 0 : 1; b.classList.toggle('head', i === 0 && !b.classList.contains('pending')); });
  const mk = () => {
    h++; renderHeight();
    const b = makeBlock(h, true);
    b.style.setProperty('--i', -1); b.style.opacity = 0;
    gB.appendChild(b); chain.unshift(b);
    void b.offsetWidth;            // commit start position before gliding
    place();
    setTimeout(() => {             // confirm after it lands
      const tx = 3 + ((Math.random() * 40) | 0);
      b.classList.remove('pending'); b.querySelector('.stt').textContent = tx + ' tx';
      b.querySelectorAll('.bars span').forEach(s => (s.style.transform = `scaleY(${(0.25 + Math.random() * 0.75).toFixed(2)})`));
      place();
      gCount++; gTx += tx; $('#gCount').textContent = fmt(gCount); $('#gAvg').textContent = (gTx / gCount).toFixed(1);
    }, 420);
    while (chain.length > MAX) chain.pop().remove();
    if (!RM && timer.animate) timer.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 800, easing: 'linear' });
  };
  for (let i = MAX - 2; i >= 0; i--) { const b = makeBlock(h - i, false); gB.appendChild(b); chain.unshift(b); }
  renderHeight(); place();
  whenVisible($('#chain'), () => { if (!gT && !RM) gT = setInterval(mk, 800); }, () => { clearInterval(gT); gT = null; });

  /* ---------- LIVE MARKETS (TON + XLM) ----------
     Single source of truth: CoinGecko public API (Binance's TONUSDT did not match Toncoin).
     Polls every 60s only while the cards are on screen and the tab is visible. Never shows invented numbers. */
  const MKT_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=the-open-network,stellar&sparkline=true&price_change_percentage=1h,24h,7d,30d';
  const mktCards = $$('.mkt');
  const usd = v => '$' + (v >= 100 ? fmt(v, 2) : v >= 1 ? v.toFixed(3) : v.toFixed(4));
  const compact = (v, pre = '$') => pre + new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(v);
  const pct = v => (v == null ? '—' : (v >= 0 ? '+' : '') + v.toFixed(2) + '%');
  const dir = v => (v == null ? '' : v >= 0 ? 'up' : 'down');
  const mstate = new Map();   // id -> { prevPrice, prevStr, updated }

  const shell = card => {
    const { sym, name, color } = card.dataset;
    card.classList.add('loading');
    card.innerHTML = `
      <header class="mkt-head"><span class="mkt-badge" style="--c:${color}">${sym}</span>
        <div class="mkt-name"><b>${name}</b><span>${sym} · <span data-f="rank">Rank —</span></span></div>
        <span class="live-pill" data-f="live"><i></i>Live</span></header>
      <div class="mkt-price"><p class="mkt-p" data-f="price">$0.0000</p><span class="chg" data-f="ch24">—</span></div>
      <p class="mkt-sub">Price in USD · 24h change</p>
      <div class="mkt-chart" data-f="chart">
        <svg viewBox="0 0 600 150" preserveAspectRatio="none" aria-label="${name} 7-day price chart" role="img">
          <defs><linearGradient id="g-${sym}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".28"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
          <path class="ar" fill="url(#g-${sym})"/><path class="ln" stroke="currentColor"/>
          <line class="cur" y1="0" y2="150"/><circle class="dot" r="4" fill="currentColor"/>
        </svg><div class="tip"></div></div>
      <div class="mkt-tf"><span>7 days ago</span><span>Now</span></div>
      <dl class="trend">${['1h', '24h', '7d', '30d'].map(k => `<div data-t="${k}"><dt>${k.toUpperCase()}</dt><dd>—</dd><span class="bar"><i></i></span></div>`).join('')}</dl>
      <dl class="mkt-stats">
        <div><dt>Market cap</dt><dd data-f="mc">—</dd></div>
        <div><dt>24h volume</dt><dd data-f="vol">—</dd></div>
        <div><dt>Circulating supply</dt><dd data-f="sup">—</dd></div>
        <div><dt>Volume / Market cap</dt><dd data-f="vmc">—</dd></div>
        <div><dt>All-time high</dt><dd data-f="ath">—</dd></div>
        <div><dt>From all-time high</dt><dd data-f="athd">—</dd></div>
      </dl>
      <div class="rng"><div class="rng-top"><span>24h range</span><span data-f="rngpos"></span></div>
        <div class="rng-bar"><b></b><i></i></div><div class="rng-lh"><span data-f="lo">—</span><span data-f="hi">—</span></div></div>
      <footer class="mkt-foot"><span data-f="ago">Connecting…</span><span>Source: CoinGecko</span></footer>`;
  };
  mktCards.forEach(shell);
  const f = (card, k) => card.querySelector(`[data-f="${k}"]`);

  const rollPrice = (el, str, prev) => {
    el.innerHTML = str.split('').map((c, i) => `<span class="dg${!RM && prev && prev.length === str.length && prev[i] !== c ? ' roll' : ''}">${c}</span>`).join('');
  };

  const drawChart = (card, prices, color) => {
    const box = f(card, 'chart'), svg = box.querySelector('svg');
    const min = Math.min(...prices), max = Math.max(...prices), W = 600, H = 150, pad = 10;
    const pts = prices.map((p, i) => [(i / (prices.length - 1)) * W, H - pad - ((p - min) / (max - min || 1)) * (H - pad * 2)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    box.style.color = color;
    svg.querySelector('.ln').setAttribute('d', d);
    svg.querySelector('.ar').setAttribute('d', `${d} L${W} ${H} L0 ${H} Z`);
    if (!RM && hasGSAP && !box.dataset.drawn) {
      const ln = svg.querySelector('.ln'), L = ln.getTotalLength();
      gsap.fromTo(ln, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset' });
      box.dataset.drawn = '1';
    }
    // interactive crosshair + tooltip
    const cur = svg.querySelector('.cur'), dot = svg.querySelector('.dot'), tip = box.querySelector('.tip');
    const hours = prices.length - 1;
    box.onpointermove = e => {
      const r = box.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const i = Math.round(x * hours), [px, py] = pts[i];
      cur.setAttribute('x1', px); cur.setAttribute('x2', px); dot.setAttribute('cx', px); dot.setAttribute('cy', py);
      const t = new Date(Date.now() - (hours - i) * 3600e3);
      tip.innerHTML = `${usd(prices[i])}<small>${t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</small>`;
      tip.style.left = Math.max(48, Math.min(r.width - 48, x * r.width)) + 'px';
      box.classList.add('hover');
    };
    box.onpointerleave = () => box.classList.remove('hover');
  };

  const renderCoin = (card, c) => {
    const st = mstate.get(c.id) || {};
    const priceStr = usd(c.current_price);
    rollPrice(f(card, 'price'), priceStr, st.prevStr);
    if (st.prevPrice != null && c.current_price !== st.prevPrice) {
      const p = f(card, 'price'), cls = c.current_price > st.prevPrice ? 'up-flash' : 'down-flash';
      p.classList.add(cls); setTimeout(() => p.classList.remove(cls), 1200);
    }
    const ch = f(card, 'ch24'); ch.textContent = pct(c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h); ch.className = 'chg ' + dir(c.price_change_percentage_24h);
    f(card, 'rank').textContent = 'Rank #' + c.market_cap_rank;
    // trend cells
    const tr = { '1h': c.price_change_percentage_1h_in_currency, '24h': c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h, '7d': c.price_change_percentage_7d_in_currency, '30d': c.price_change_percentage_30d_in_currency };
    Object.entries(tr).forEach(([k, v]) => {
      const cell = card.querySelector(`[data-t="${k}"]`), dd = cell.querySelector('dd'), bar = cell.querySelector('.bar i');
      dd.textContent = pct(v); cell.className = dir(v);
      const w = Math.min(Math.abs(v || 0) / 25, 1) * 50;
      bar.style.width = w + '%'; bar.style.left = (v >= 0 ? 50 : 50 - w) + '%';
    });
    // stats
    f(card, 'mc').innerHTML = compact(c.market_cap);
    f(card, 'vol').textContent = compact(c.total_volume);
    f(card, 'sup').textContent = compact(c.circulating_supply, '') + ' ' + card.dataset.sym;
    f(card, 'vmc').textContent = ((c.total_volume / c.market_cap) * 100).toFixed(2) + '%';
    f(card, 'ath').textContent = usd(c.ath);
    f(card, 'athd').textContent = pct(c.ath_change_percentage);
    // 24h range
    const lo = c.low_24h, hi = c.high_24h, pos = Math.max(0, Math.min(1, (c.current_price - lo) / (hi - lo || 1)));
    f(card, 'lo').textContent = 'L ' + usd(lo); f(card, 'hi').textContent = 'H ' + usd(hi);
    card.querySelector('.rng-bar b').style.width = pos * 100 + '%';
    card.querySelector('.rng-bar i').style.left = pos * 100 + '%';
    f(card, 'rngpos').textContent = Math.round(pos * 100) + '% of range';
    // chart (7d hourly), coloured by 7d direction
    const spark = c.sparkline_in_7d && c.sparkline_in_7d.price;
    if (spark && spark.length > 2) drawChart(card, spark, (tr['7d'] ?? 0) >= 0 ? '#22D39A' : '#FF6B6B');
    card.classList.remove('loading');
    mstate.set(c.id, { prevPrice: c.current_price, prevStr: priceStr, updated: Date.now() });
  };

  let mktTimer = null, mktVisible = false, mktFails = 0;
  const showError = () => mktCards.forEach(card => {
    if (!mstate.has(card.dataset.id)) {
      card.classList.remove('loading');
      card.innerHTML = `<div class="mkt-err"><p>Live ${card.dataset.name} data is unavailable right now.</p><button type="button" data-retry>Retry</button></div>`;
      card.querySelector('[data-retry]').onclick = () => { shell(card); loadMarkets(); };
    }
  });
  async function loadMarkets() {
    try {
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 10000);
      const r = await fetch(MKT_URL, { signal: ctl.signal, headers: { accept: 'application/json' } });
      clearTimeout(to);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      data.forEach(c => { const card = mktCards.find(k => k.dataset.id === c.id); if (card && card.querySelector('.mkt-head')) renderCoin(card, c); });
      mktFails = 0;
    } catch (_) { mktFails++; showError(); }
  }
  const schedule = () => { clearTimeout(mktTimer); if (mktVisible && !document.hidden) mktTimer = setTimeout(async () => { await loadMarkets(); schedule(); }, mktFails ? Math.min(60000 * 2 ** mktFails, 300000) : 60000); };
  if (mktCards.length) {
    new IntersectionObserver(([e]) => {
      mktVisible = e.isIntersecting;
      if (mktVisible) { const last = Math.max(0, ...[...mstate.values()].map(s => s.updated)); if (Date.now() - last > 55000) loadMarkets().then(schedule); else schedule(); }
      else clearTimeout(mktTimer);
    }, { rootMargin: '200px 0px' }).observe($('.markets'));
    document.addEventListener('visibilitychange', () => { if (!document.hidden && mktVisible) loadMarkets().then(schedule); });
    // freshness counter ticks every second so users can see the data is live
    setInterval(() => mktCards.forEach(card => {
      const s = mstate.get(card.dataset.id), ago = f(card, 'ago'), live = f(card, 'live'); if (!s || !ago) return;
      const sec = Math.round((Date.now() - s.updated) / 1000);
      ago.textContent = 'Updated ' + (sec < 60 ? sec + 's' : Math.floor(sec / 60) + 'm') + ' ago';
      if (live) { live.lastChild.textContent = sec > 180 ? 'Delayed' : 'Live'; live.style.opacity = sec > 180 ? .6 : 1; }
    }), 1000);
  }

  /* ---------- Gram pipeline: stages light in sequence, whole trip = one 0.8s block ---------- */
  const stages = $$('.stage'), vals = $$('.vals i');
  let pipeT = null, pn = 0;
  const pipeTick = () => {
    const s = pn % 4; stages.forEach((st, i) => st.classList.toggle('on', i === s));
    vals.forEach(v => v.classList.toggle('on', s === 1 || s === 2));   // validators sign, then stay lit while the block seals
    pn++;
  };
  whenVisible($('#pipe'), () => { if (!pipeT && !RM) pipeT = setInterval(pipeTick, 200); }, () => { clearInterval(pipeT); pipeT = null; });

  /* ---------- card tilt + magnetic ---------- */
  const card = $('#pcard'), stage = $('#cardStage');
  if (FINE && !RM) {
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `rotateY(${(x - .5) * 24}deg) rotateX(${(.5 - y) * 16}deg)`;
      card.style.setProperty('--sx', x * 100 + '%'); card.style.setProperty('--sy', y * 100 + '%');
    });
    stage.addEventListener('pointerleave', () => (card.style.transform = ''));
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }

  /* ==========================================================
     GSAP motion
     ========================================================== */
  if (!hasGSAP || RM) return;
  gsap.registerPlugin(ScrollTrigger);

  // split section headings into masked words
  $$('[data-split]').forEach(hd => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) return f.appendChild(document.createTextNode(w));
          const o = document.createElement('span'); o.className = 'word'; const i = document.createElement('span'); i.textContent = w; o.appendChild(i); f.appendChild(o);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
    walk(hd);
  });

  // initial hidden states for intro (set now, played on 'intro')
  gsap.set('.fg-in i', { scaleY: 0 });
  gsap.set('.hero [data-intro]', { opacity: 0, y: 24 });
  gsap.set('.hero .tline', { yPercent: 110 });
  gsap.set('.hero .tframe', { clipPath: 'inset(0 100% 0 0)' });
  document.addEventListener('intro', () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to('.fg-in i', { scaleY: 1, duration: 1.4, stagger: .06, ease: 'power3.inOut' })
      .to('.hero .tframe', { clipPath: 'inset(0 0% 0 0)', duration: 1.1, stagger: .15 }, .2)
      .to('.hero .tline', { yPercent: 0, duration: 1.2, stagger: .15 }, .45)
      .to('.hero [data-intro]', { opacity: 1, y: 0, duration: 1.1, stagger: .1 }, .5)
      .from('#heroCoin .coin-spin', { scale: .6, rotateY: -200, duration: 1.8, ease: 'expo.out' }, .4)
      .from('.metrics .cell', { opacity: 0, y: 20, duration: .9, stagger: .07 }, .9);
  }, { once: true });
  // hero tline needs overflow clip
  $$('.hero .tframe').forEach(f => (f.style.overflow = 'hidden'));

  // hero coin drifts up and shrinks on scroll
  ScrollTrigger.matchMedia({
    '(min-width: 1025px)': () => {
      gsap.to('#heroCoin', { yPercent: -25, scale: .85, opacity: .4, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 } });
      gsap.to('.hero-glow', { yPercent: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  });

  // section heading reveals
  $$('.section [data-split], .cta h2').forEach(hd => {
    const w = hd.querySelectorAll('.word>span'); if (!w.length) return;
    gsap.from(w, { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: hd, start: 'top 86%', toggleActions: 'play none none none' } });
  });
  $$('.sec-tag, .layer-tag').forEach(t => gsap.from(t, { clipPath: 'inset(0 100% 0 0)', duration: 1, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 90%', toggleActions: 'play none none none' } }));
  $$('.ptags li').forEach(li => gsap.from(li, { opacity: 0, x: 24, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: li, start: 'top 92%', toggleActions: 'play none none none' } }));

  // grouped reveals
  gsap.set('.reveal', { opacity: 0, y: 40 });
  ScrollTrigger.batch('.reveal', { start: 'top 88%', onEnter: els => { els = els.filter(e => !e.dataset.shown); els.forEach(e => (e.dataset.shown = '1')); if (els.length) gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .09, clearProps: 'transform' }); } });

  // stack layers: heads, chips, tokens, pipeline stages
  $$('.layer').forEach(l => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: l, start: 'top 78%', toggleActions: 'play none none none' }, defaults: { ease: 'expo.out' } });
    const add = (sel, vars, at) => { const els = l.querySelectorAll(sel); if (els.length) tl.from(els, vars, at); };
    add('.layer-head > *', { y: 30, opacity: 0, duration: 1, stagger: .1 }, 0);
    add('.lchips li', { opacity: 0, x: -10, duration: .6, stagger: .06 }, .3);
    add('.tokens li', { opacity: 0, y: 16, duration: .7, stagger: .06 }, .35);
    add('.mkt', { opacity: 0, y: 40, duration: 1, stagger: .12 }, .45);
    add('.stage', { opacity: 0, y: 24, duration: .8, stagger: .1 }, .35);
    if (innerWidth > 640) add('.pipe-track', { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'power2.inOut' }, .3);
    add('.chain-cells > div', { opacity: 0, y: 16, duration: .7, stagger: .06 }, .6);
  });

  // steps progress line
  gsap.to('#stepsLine', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 45%', scrub: .5 } });

  // wallet card entrance
  gsap.from('#pcard', { rotateY: -35, rotateX: 14, y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '#cardStage', start: 'top 80%', toggleActions: 'play none none none' } });

  // CTA frames
  gsap.from('.cta .tframe', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.cta', start: 'top 75%', toggleActions: 'play none none none' } });

  // footer giant word
  gsap.from('.giant', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.giant', start: 'top 95%', toggleActions: 'play none none none' } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
