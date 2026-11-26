// AbtinOS: the desktop behaviour shared by every page. Without JavaScript every window is open,
// every link works and nothing animates.
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k: string, s: Storage = localStorage) { try { return s.getItem(k); } catch { return null; } },
  set(k: string, v: string, s: Storage = localStorage) { try { s.setItem(k, v); } catch { /* private mode */ } },
};
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => [...el.querySelectorAll<T>(sel)] as T[];

/* ---------- sound effects: off by default, made in the browser ---------- */
let sfxOn = store.get('sfx') === 'on';
let ctx: AudioContext | null = null;
const SFX: Record<string, [number, number, OscillatorType, number]> = {
  press: [1800, 0.035, 'square', 0.05], release: [1200, 0.03, 'square', 0.035],
  switch: [600, 0.06, 'square', 0.06], open: [880, 0.09, 'triangle', 0.08],
};
function sfx(kind: keyof typeof SFX) {
  if (!sfxOn) return;
  try {
    ctx ??= new AudioContext();
    const [hz, len, type, vol] = SFX[kind];
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
    o.type = type; o.frequency.setValueAtTime(hz, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + len + 0.02);
  } catch { /* no audio */ }
}
const paintSfx = () => $$('[data-sfx-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(sfxOn)));
paintSfx();
const pressable = 'button, .btn, .icon-link';
document.addEventListener('pointerdown', (e) => { if ((e.target as Element).closest(pressable)) sfx('press'); });
document.addEventListener('pointerup', (e) => { if ((e.target as Element).closest(pressable)) sfx('release'); });

/* ---------- theme ---------- */
const setTheme = (t: string) => {
  root.dataset.theme = t;
  $$('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(t === 'dark')));
};
setTheme(root.dataset.theme || 'light');
const toggleTheme = () => { const t = root.dataset.theme === 'dark' ? 'light' : 'dark'; store.set('theme', t); setTheme(t); sfx('switch'); };

document.addEventListener('click', (e) => {
  const el = e.target as Element;
  if (el.closest('[data-theme-toggle]')) toggleTheme();
  if (el.closest('[data-sfx-toggle]')) { sfxOn = !sfxOn; store.set('sfx', sfxOn ? 'on' : 'off'); paintSfx(); sfx('switch'); }
});

/* ---------- boot: once per tab, any key or tap skips ---------- */
const boot = document.getElementById('boot');
if (boot) {
  if (root.classList.contains('no-boot')) boot.remove();
  else {
    store.set('booted', '1', sessionStorage);
    const segs = $$('[data-seg]', boot);
    const status = boot.querySelector('[data-boot-status]');
    const total = 1950, t0 = performance.now();
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      boot.classList.add('out');
      boot.addEventListener('transitionend', () => boot.remove(), { once: true });
      setTimeout(() => boot.remove(), 250);
      removeEventListener('keydown', finish); removeEventListener('pointerdown', finish);
    };
    addEventListener('keydown', finish); addEventListener('pointerdown', finish);
    const tick = (now: number) => {
      if (done) return;
      const p = Math.min(1, (now - t0) / total);
      const n = Math.round(p * segs.length);
      segs.forEach((s, i) => s.classList.toggle('on', i < n));
      if (status) status.textContent = p < 0.25 ? 'Checking memory…' : p < 0.9 ? 'Loading…' : 'Ready';
      if (p < 1) requestAnimationFrame(tick); else finish();
    };
    requestAnimationFrame(tick);
  }
}

/* ---------- copy email ---------- */
const copyLive = document.querySelector('[data-copy-status]');
$$<HTMLAnchorElement>('[data-copy]').forEach((a) => {
  let t = 0;
  a.addEventListener('click', async (e) => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    try { await navigator.clipboard.writeText(a.dataset.copy!); } catch { location.href = a.href; return; }
    a.classList.add('copied');
    if (copyLive) copyLive.textContent = 'Email address copied to the clipboard';
    clearTimeout(t);
    t = window.setTimeout(() => { a.classList.remove('copied'); if (copyLive) copyLive.textContent = ''; }, 2200);
  });
});

/* ---------- windows: focus and minimize ---------- */
const wins = $$('[data-win]');
const tabs = $$<HTMLAnchorElement>('[data-tab]');
const featuredTabs = tabs.filter((tab) => tab.dataset.open);
const watched = wins.filter((w) => featuredTabs.some((tab) => tab.dataset.tab === w.id));
const inView = new Map<Element, number>();
let hoveredWin: HTMLElement | undefined;
let activeWin: Element | null | undefined;

const paintTaskbar = () => {
  let visibleWin: Element | undefined;
  let highestRatio = 0;
  for (const w of watched) {
    const ratio = inView.get(w) ?? 0;
    if (ratio > highestRatio) { highestRatio = ratio; visibleWin = w; }
  }
  const highlighted = hoveredWin ?? (activeWin && inView.has(activeWin) ? activeWin : visibleWin);
  featuredTabs.forEach((tab) => tab.classList.toggle('in-view', tab.dataset.tab === highlighted?.id));
};

const focusWin = (w?: Element | null) => {
  activeWin = w;
  wins.forEach((x) => x.classList.toggle('active', x === w));
  featuredTabs.forEach((tab) => tab.setAttribute('aria-current', tab.dataset.tab === w?.id ? 'location' : 'false'));
  paintTaskbar();
};
const setMin = (w: HTMLElement, min: boolean) => {
  w.classList.toggle('min', min);
  const b = w.querySelector('[data-min]');
  if (b) { b.setAttribute('aria-expanded', String(!min)); b.setAttribute('aria-label', `${min ? 'Restore' : 'Minimize'} ${w.dataset.win}`); }
  tabs.find((t) => t.dataset.tab === w.id)?.classList.toggle('is-min', min);
};
wins.forEach((w) => {
  w.addEventListener('pointerdown', () => focusWin(w));
  w.addEventListener('focusin', () => focusWin(w));
  w.querySelector('[data-min]')?.addEventListener('click', (e) => { e.stopPropagation(); setMin(w, !w.classList.contains('min')); sfx('switch'); });
  w.querySelector('.tb')?.addEventListener('dblclick', (e) => {
    if (!(e.target as Element).closest('[data-min]')) setMin(w, !w.classList.contains('min'));
  });
});
const openWin = (id: string) => {
  const w = document.getElementById(id);
  if (!w || !w.matches('[data-win]')) return false;
  setMin(w, false); focusWin(w);
  w.querySelector<HTMLButtonElement>('[data-min]')?.focus({ preventScroll: true });
  w.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  w.classList.remove('flash'); void w.offsetWidth; w.classList.add('flash');
  history.replaceState(null, '', '#' + id);
  return true;
};
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLElement>('[data-open]');
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (openWin(a.dataset.open!)) { e.preventDefault(); closeStart(); }
});
for (const w of watched) {
  w.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    hoveredWin = w;
    paintTaskbar();
  });
  w.addEventListener('pointerleave', () => {
    if (hoveredWin !== w) return;
    hoveredWin = undefined;
    paintTaskbar();
  });
}
if (watched.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) inView.set(entry.target, entry.intersectionRatio);
      else inView.delete(entry.target);
    }
    paintTaskbar();
  }, { threshold: [0, 0.15, 0.35, 0.6] });
  watched.forEach((w) => io.observe(w));
}
focusWin((location.hash && document.getElementById(location.hash.slice(1))?.closest('[data-win]')) || wins[0]);

/* ---------- start menu ---------- */
const sb = document.querySelector<HTMLButtonElement>('[data-start]');
const sm = document.getElementById('start-menu');
function closeStart() { if (!sm || sm.hidden) return; sm.hidden = true; sb?.setAttribute('aria-expanded', 'false'); }
sb?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!sm) return;
  const show = sm.hidden; sm.hidden = !show; sb.setAttribute('aria-expanded', String(show));
  if (show) { sm.querySelector<HTMLElement>('a, button')?.focus(); sfx('open'); }
});
document.addEventListener('click', (e) => { if (sm && !sm.hidden && !(e.target as Element).closest('#start-menu')) closeStart(); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && sm && !sm.hidden) { closeStart(); sb?.focus(); } });
sm?.addEventListener('keydown', (e) => {
  const items = $$<HTMLElement>('a, button', sm); const i = items.indexOf(document.activeElement as HTMLElement);
  if (e.key === 'ArrowDown') { items[(i + 1) % items.length].focus(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { items[(i - 1 + items.length) % items.length].focus(); e.preventDefault(); }
});

/* ---------- clock: Waterloo time ---------- */
const clock = document.querySelector('[data-time]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto' });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);
}

/* ---------- Ctrl+K / Cmd+K quick jump ---------- */
interface Item { k: string; d: string; h?: string; act?: 'copy' | 'theme' }
const dlg = document.getElementById('cmdk') as HTMLDialogElement | null;
if (dlg) {
  const items: Item[] = JSON.parse(document.getElementById('cmdk-items')?.textContent || '[]');
  const input = dlg.querySelector('input')!; const list = dlg.querySelector('ul')!;
  let sel = 0, shown = items;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = items.filter((i) => !q || `${i.k} ${i.d}`.toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.map((i, n) => `<li role="option" id="ck-${n}" aria-selected="${n === sel}"><span>${esc(i.k)}</span><small>${esc(i.d)}</small></li>`).join('') || '<li class="none" role="option" aria-selected="false">Nothing matches</li>';
    input.setAttribute('aria-activedescendant', shown.length ? `ck-${sel}` : '');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const run = (i?: Item) => {
    if (!i) return;
    dlg.close();
    if (i.act === 'copy') {
      const report = (message: string) => { if (copyLive) copyLive.textContent = message; };
      navigator.clipboard?.writeText(i.d).then(
        () => report('Email address copied to the clipboard'),
        () => report('Could not copy the email address'),
      ) ?? report('Could not copy the email address');
    }
    else if (i.act === 'theme') toggleTheme();
    else if (i.h) {
      const u = new URL(i.h, location.href);
      if (u.pathname === location.pathname && u.hash && openWin(u.hash.slice(1))) return;
      location.href = i.h;
    }
  };
  const open = () => { closeStart(); input.value = ''; sel = 0; render(); dlg.showModal(); input.focus(); sfx('open'); };
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (dlg.open) dlg.close(); else open(); }
  });
  $$('[data-cmdk]').forEach((b) => b.addEventListener('click', open));
  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (!shown.length) return;
    if (e.key === 'ArrowDown') { sel = (sel + 1) % shown.length; render(); e.preventDefault(); }
    if (e.key === 'ArrowUp') { sel = (sel - 1 + shown.length) % shown.length; render(); e.preventDefault(); }
    if (e.key === 'Enter') { e.preventDefault(); run(shown[sel]); }
  });
  list.addEventListener('click', (e) => { const li = (e.target as Element).closest('li[id]'); if (li) run(shown[Number(li.id.slice(3))]); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
}

/* ---------- windows power on as they scroll in ---------- */
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('power-on');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  for (const el of $$('[data-reveal]')) {
    if (el.getBoundingClientRect().top >= innerHeight) io.observe(el);
  }
}
