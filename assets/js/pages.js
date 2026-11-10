/* AddTON v4: inner-page interactions (loaded after main.js on every inner page).
   Every module checks for its own elements, so this file is safe on any page. */
(() => {
  'use strict';
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const rnd = (a, b) => a + Math.random() * (b - a);
  const whenVisible = (el, start, stop) => el && new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0.15 }).observe(el);

  /* ---------- staking hero: compounding reward ticker ---------- */
  const tick = $('#rewardTick');
  if (tick && !RM) {
    let v = 12.4, t = null;
    whenVisible(tick, () => { t = t || setInterval(() => { v += rnd(0.04, 0.12); tick.textContent = '+' + v.toFixed(2) + ' XLM'; }, 1600); }, () => { clearInterval(t); t = null; });
  }

  /* ---------- ArbiEx hero: trade ticket plays scan → buy → sell → net ---------- */
  const tk = $('#ticket');
  if (tk) {
    const rows = $$('.tk-rows > div', tk), st = $('.tk-state', tk), id = $('#tkId'), net = $('#tkNet'), flow = $$('.flow span');
    const F = { buy: $('#tkBuy'), sell: $('#tkSell'), sp: $('#tkSp'), fee: $('#tkFee') };
    let n = 12853, timers = [], running = false;
    const setFlow = i => flow.forEach((f, k) => f.classList.toggle('on', k === i));
    const play = () => {
      const buy = rnd(3.36, 3.46), sp = rnd(1.2, 5.6), sell = buy * (1 + sp / 100), size = rnd(2400, 3800), fee = rnd(0.14, 0.32), profit = (size * sp) / 100 - fee;
      id.textContent = 'Trade #' + fmt(++n).replace(/,/g, '');
      F.buy.textContent = '$' + buy.toFixed(3); F.sell.textContent = '$' + sell.toFixed(3);
      F.sp.textContent = '+' + sp.toFixed(1) + '%'; F.fee.textContent = '−$' + fee.toFixed(2);
      st.textContent = 'Scanning'; st.classList.remove('done'); net.style.opacity = .15; net.textContent = '+$' + fmt(profit, 2);
      rows.forEach(r => { r.classList.add('dim'); r.classList.remove('hit'); });
      setFlow(0);
      const step = (i, fl) => timers.push(setTimeout(() => { rows.forEach((r, k) => { r.classList.toggle('dim', k > i); r.classList.toggle('hit', k === i); }); if (fl != null) setFlow(fl); }, 700 + i * 650));
      step(0, 0); step(1, 2); step(2, 1); step(3, 1);
      timers.push(setTimeout(() => { rows.forEach(r => r.classList.remove('hit')); st.textContent = 'Executed'; st.classList.add('done'); net.style.opacity = 1; setFlow(3); }, 700 + 4 * 650));
      timers.push(setTimeout(play, 700 + 4 * 650 + 2600));
    };
    if (!RM) whenVisible(tk, () => { if (!running) { running = true; play(); } }, () => { running = false; timers.forEach(clearTimeout); timers = []; });
  }

  /* ---------- ArbiEx: spread table re-scores rows after fees ---------- */
  const tbl = $('#stable');
  if (tbl && !RM) {
    const base = $$('tbody tr', tbl).map(tr => ({ tr, dex: +tr.dataset.dex, d: +tr.dataset.dec }));
    let t = null;
    const upd = () => base.forEach(r => {
      const sp = r.tr.dataset.pair.startsWith('TON') ? rnd(2.5, 6) : r.tr.dataset.pair.startsWith('XLM') ? rnd(0.4, 2.4) : rnd(-0.15, 0.12);
      const dex = r.dex * (1 + rnd(-0.002, 0.002)), cex = dex * (1 + sp / 100), go = sp > 0.6;
      const c = r.tr.children;
      c[1].textContent = fmt(dex, r.d); c[2].textContent = fmt(cex, r.d);
      c[3].textContent = (sp >= 0 ? '+' : '−') + Math.abs(sp).toFixed(2) + '%'; c[3].className = 'r ' + (sp >= 0 ? 'sp-up' : 'sp-dn');
      c[4].innerHTML = go ? '<span class="tag go">Trade</span>' : '<span class="tag">Skip</span>';
      r.tr.classList.toggle('go', go);
    });
    whenVisible(tbl, () => { t = t || setInterval(upd, 2200); }, () => { clearInterval(t); t = null; });
  }

  /* ---------- Airdrop hero: notification feed ---------- */
  const feed = $('#feed');
  if (feed && !RM) {
    const items = [
      ['▶', '#E5383B', 'Video approved', 'Creator reward credited', 'Reward'],
      ['TG', '#2AABEE', 'Task verified', 'Joined Telegram channel', 'Verified'],
      ['X', '#2A2A35', 'Task verified', 'Followed @addtoncoin', 'Verified'],
      ['M', '#3D3D3D', 'Article approved', 'Writer reward credited', 'Reward'],
      ['FB', '#1877F2', 'Task submitted', 'Liked our latest update', 'In review'],
      ['TG', '#2AABEE', 'Task verified', 'Commented in the community chat', 'Verified'],
    ];
    let i = 0, t = null;
    const push = () => {
      const [ic, c, b, s, tag] = items[i++ % items.length];
      const el = document.createElement('div'); el.className = 'ntf in';
      el.innerHTML = `<i style="--c:${c}">${ic}</i><span><b>${b}</b><small>${s}</small></span><em>${tag}</em>`;
      feed.prepend(el); while (feed.children.length > 4) feed.lastElementChild.remove();
    };
    whenVisible(feed, () => { t = t || setInterval(push, 2600); }, () => { clearInterval(t); t = null; });
  }

  /* ==========================================================
     Forms. These pages are the redesigned front end only: nothing is sent anywhere.
     On a valid submit we explain that and link to the current secure page on addton.io,
     until the AddTON backend (session, anti-forgery token, captcha) is connected.
     ========================================================== */
  const rules = {
    required: v => v.trim().length > 0,
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
    url: v => /^https?:\/\/\S+\.\S+/.test(v.trim()),
    phone: v => /^\+?[0-9 ()-]{8,18}$/.test(v.trim()),
    password: v => v.length >= 8 && v.length <= 20,
  };
  const checkField = el => {
    const f = el.closest('.field') || el.closest('.check');
    let ok = true;
    if (el.type === 'checkbox') ok = !el.required || el.checked;
    else if (el.required && !rules.required(el.value)) ok = false;
    else if (el.value && el.dataset.rule && rules[el.dataset.rule]) ok = rules[el.dataset.rule](el.value);
    if (ok && el.dataset.match) ok = el.value === $(el.dataset.match).value;
    if (f) f.classList.toggle('err', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  };
  const checkAll = scope => { const els = $$('input,select,textarea', scope).filter(e => e.type !== 'hidden' && !e.closest('[hidden]')); const bad = els.filter(e => !checkField(e)); if (bad[0]) bad[0].focus(); return !bad.length; };
  $$('form[data-form]').forEach(form => {
    $$('input,select,textarea', form).forEach(el => {
      el.addEventListener('blur', () => { if (el.value || el.type === 'checkbox') checkField(el); });
      el.addEventListener('input', () => { const f = el.closest('.field,.check'); if (f && f.classList.contains('err')) checkField(el); });
      el.addEventListener('change', () => { if (el.type === 'checkbox') checkField(el); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!checkAll(form)) return;
      const msg = $('.form-msg', form);
      if (msg) { msg.classList.add('show'); msg.focus(); }
    });
  });

  // show / hide password
  $$('.pw-tog').forEach(b => b.addEventListener('click', () => {
    const i = b.parentElement.querySelector('input'), show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show'; b.setAttribute('aria-pressed', String(show));
  }));

  // password strength
  const pw = $('#pw'), meter = $('#pwMeter');
  if (pw && meter) {
    const lis = $$('#pwRules li');
    pw.addEventListener('input', () => {
      const v = pw.value, t = [v.length >= 8 && v.length <= 20, /\d/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)];
      t.forEach((ok, k) => lis[k] && lis[k].classList.toggle('ok', ok));
      meter.dataset.s = v ? t.filter(Boolean).length : 0;
    });
  }

  // airdrop: "Submit a video/article" buttons preselect the task type
  $$('[data-task]').forEach(a => a.addEventListener('click', () => { const s = $('#task'); if (s) { s.value = a.dataset.task; s.dispatchEvent(new Event('input')); } }));

  // sponsor id: uppercase as you type
  const sp = $('#sponsor');
  if (sp) sp.addEventListener('input', () => { const p = sp.selectionStart; sp.value = sp.value.toUpperCase().replace(/\s/g, ''); sp.setSelectionRange(p, p); });

  // signup stepper
  const steps = $$('.fstep'), dots = $$('.stepper li');
  if (steps.length > 1) {
    let cur = 0;
    const go = i => {
      cur = i;
      steps.forEach((s, k) => { s.hidden = k !== i; if (k === i && !RM) { s.classList.remove('enter'); void s.offsetWidth; s.classList.add('enter'); } });
      dots.forEach((d, k) => { d.classList.toggle('on', k === i); d.classList.toggle('done', k < i); d.setAttribute('aria-current', k === i ? 'step' : 'false'); });
      const first = $('input:not([type=radio]),select', steps[i]); if (first) first.focus({ preventScroll: true });
      const top = $('.auth-main'); if (top && top.getBoundingClientRect().top < 0) top.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    };
    $$('[data-next]').forEach(b => b.addEventListener('click', () => { if (checkAll(steps[cur])) go(cur + 1); }));
    $$('[data-back]').forEach(b => b.addEventListener('click', () => go(cur - 1)));
  }
})();
