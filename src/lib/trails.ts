// Star-trail geometry, shared by the build-time SVG and the in-browser redraw.
// Each project is one bright trail circling a pole. Its sweep grows with the square
// root of the days worked, so a long project never wraps all the way round.

export interface TrailProject {
  name: string;
  line: string;
  link: string;
  start: string;
  end?: string;
}

export interface Arc { r: number; a0: number; a1: number; }
export interface BgArc extends Arc { w: number; o: number; }
export interface ProjectTrail extends Arc {
  i: number;
  live: boolean;
  head: { x: number; y: number };
  label?: { side: 'left' | 'right' };
}
export interface Layout {
  W: number; H: number;
  cx: number; cy: number;
  background: BgArc[];
  trails: ProjectTrail[];
}

const DEG_PER_ROOT_DAY = 26;
const MAX_SWEEP = 300;
const MIN_SWEEP = 10;
const BG_SWEEP = 34;

export function sweepFor(days: number): number {
  return Math.min(MAX_SWEEP, Math.max(MIN_SWEEP, Math.sqrt(Math.max(0, days)) * DEG_PER_ROOT_DAY));
}

function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Where trail heads may sit, as fractions of the height. The homepage uses the defaults. */
export interface LayoutOptions { yTop?: number; yBottom?: number; }

export function layout(projects: TrailProject[], W: number, H: number, now: Date, opts: LayoutOptions = {}): Layout {
  const mobile = W < 760;
  const cx = W * (mobile ? 0.82 : 0.74);
  const cy = H * (mobile ? 0.08 : 0.16);
  const S = Math.hypot(W, H) * 0.5;
  const reach = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));

  const rand = rng(42);
  const background: BgArc[] = [];
  const count = mobile ? 120 : 220;
  for (let k = 0; k < count; k++) {
    const r = 6 + Math.pow(rand(), 0.8) * reach;
    const a0 = rand() * 360;
    background.push({ r, a0, a1: a0 + BG_SWEEP, w: 0.5 + rand() * 1.1, o: 0.1 + Math.pow(rand(), 2) * 0.45 });
  }

  const n = projects.length;
  const rMin = S * (mobile ? 0.3 : 0.3);
  const rMax = S * (mobile ? 0.95 : 1.0);
  const yTop = H * (opts.yTop ?? 0.2);
  const yBottom = H * (opts.yBottom ?? (mobile ? 0.7 : 0.48));
  const labelled = mobile ? 4 : 6;

  const trails: ProjectTrail[] = projects.map((p, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const r = rMin + (rMax - rMin) * t;
    // Put each head at its own height, on the left of the pole, so labels never stack.
    const targetY = yTop + (yBottom - yTop) * t;
    const s = Math.max(-0.97, Math.min(0.97, (targetY - cy) / r));
    const a1 = 180 - (Math.asin(s) * 180) / Math.PI;
    const end = p.end ? new Date(p.end) : now;
    const days = (end.getTime() - new Date(p.start).getTime()) / 864e5;
    const a0 = a1 - sweepFor(days);
    const head = { x: cx + r * Math.cos((a1 * Math.PI) / 180), y: cy + r * Math.sin((a1 * Math.PI) / 180) };
    const trail: ProjectTrail = { i, r, a0, a1, live: !p.end, head };
    if (i >= n - labelled) trail.label = { side: head.x > W * (mobile ? 0.5 : 0.62) ? 'left' : 'right' };
    return trail;
  });

  return { W, H, cx, cy, background, trails };
}

export function arcPath(cx: number, cy: number, { r, a0, a1 }: Arc): string {
  const rad = Math.PI / 180;
  const x0 = cx + r * Math.cos(a0 * rad), y0 = cy + r * Math.sin(a0 * rad);
  const x1 = cx + r * Math.cos(a1 * rad), y1 = cy + r * Math.sin(a1 * rad);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

/** The whole sky as SVG markup, without labels. */
export function svgMarkup(L: Layout): string {
  const bg = L.background
    .map((b) => `<path class="t-bg" d="${arcPath(L.cx, L.cy, b)}" stroke-width="${b.w.toFixed(2)}" stroke-opacity="${b.o.toFixed(2)}"/>`)
    .join('');
  const fg = L.trails
    .map((t) => {
      const d = arcPath(L.cx, L.cy, t);
      // An unlabelled trail gets no head, so it never looks like a missing label.
      const head = !t.label ? ''
        : t.live
        ? `<circle class="t-halo" cx="${t.head.x.toFixed(1)}" cy="${t.head.y.toFixed(1)}" r="16"/><circle class="t-head live" cx="${t.head.x.toFixed(1)}" cy="${t.head.y.toFixed(1)}" r="3.6"/>`
        : `<circle class="t-head" cx="${t.head.x.toFixed(1)}" cy="${t.head.y.toFixed(1)}" r="2.6"/>`;
      return `<g class="t-proj${t.live ? ' live' : ''}" data-i="${t.i}"><path class="t-line" d="${d}"/>${head}</g>`;
    })
    .join('');
  return `<defs><radialGradient id="t-halo"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#9fb4ff" stop-opacity="0"/></radialGradient></defs>${bg}${fg}`;
}

/** Heads on project pages sit higher than on the homepage, clear of the title. */
export const PAGE_SKY: LayoutOptions = { yTop: 0.1, yBottom: 0.28 };

/** The sky behind a project page: every trail faint, the page's own trail bright.
 *  With cur = -1 (the 404) only the background exposure is drawn. */
export function pageSkyMarkup(L: Layout, cur: number): string {
  const f = (v: number) => v.toFixed(1);
  const bg = L.background
    .map((b) => `<path class="t-bg" d="${arcPath(L.cx, L.cy, b)}" stroke-width="${b.w.toFixed(2)}" stroke-opacity="${(b.o * 0.8).toFixed(2)}"/>`)
    .join('');
  if (cur < 0) return bg;
  const fg = L.trails
    .map((t) => {
      const on = t.i === cur;
      const head = !on ? ''
        : (t.live ? `<circle class="pt-halo" cx="${f(t.head.x)}" cy="${f(t.head.y)}" r="18"/>` : '')
          + `<circle class="pt-head${t.live ? ' live' : ''}" cx="${f(t.head.x)}" cy="${f(t.head.y)}" r="${t.live ? 4 : 2.8}"/>`;
      return `<path class="pt-line${on ? ' on' : ''}" d="${arcPath(L.cx, L.cy, t)}"/>${head}`;
    })
    .join('');
  return `<defs><radialGradient id="pt-halo-g"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#9fb4ff" stop-opacity="0"/></radialGradient></defs>${bg}${fg}`;
}
