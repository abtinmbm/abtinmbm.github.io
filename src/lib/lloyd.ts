// Draws one step of the Lloyd's algorithm showcase run as SVG markup.
// Data: src/data/lloyd-run.json, exported from the PR #247 module through the private eval
// script (10 drones, 200 m L-shaped region, seed 0, simulated). Metres east/north, origin at
// the region's south-west corner; SVG y runs down, so north is flipped.

export interface LloydRun {
  region: number[][];
  iterations: number;
  converged: boolean;
  frames: { p: Record<string, number[]>; cells: Record<string, number[][][]>; cost: number }[];
}

export const SIZE = 200;
export const PAD = 4;
const y = (n: number) => SIZE - n;
const pts = (ring: number[][]) => ring.map(([e, n]) => `${e},${y(n)}`).join(' ');

/** Trail of one drone from the first step up to step k, as path data. */
export const trail = (run: LloydRun, id: string, k: number) =>
  run.frames.slice(0, k + 1).map((f, i) => `${i ? 'L' : 'M'}${f.p[id][0]} ${y(f.p[id][1])}`).join('');

export function stepMarkup(run: LloydRun, k: number, withTrails = true): string {
  const f = run.frames[k];
  const ids = Object.keys(f.p);
  const cells = ids.map((id, i) => f.cells[id].map((ring) => `<polygon class="ly-cell c${i % 5}" points="${pts(ring)}"/>`).join('')).join('');
  const trails = withTrails ? ids.map((id) => `<path class="ly-trail" d="${trail(run, id, k)}"/>`).join('') : '';
  const start = run.frames[0];
  const ghosts = withTrails ? ids.map((id) => `<circle class="ly-ghost" cx="${start.p[id][0]}" cy="${y(start.p[id][1])}" r="1.6"/>`).join('') : '';
  const dots = ids.map((id) => `<circle class="ly-dot" cx="${f.p[id][0]}" cy="${y(f.p[id][1])}" r="3.2"/>`).join('');
  return `<g class="ly-cells">${cells}</g><polygon class="ly-region" points="${pts(run.region)}"/><g>${trails}${ghosts}</g><g>${dots}</g>`;
}

export const viewBox = `${-PAD} ${-PAD} ${SIZE + PAD * 2} ${SIZE + PAD * 2}`;

/** Coverage cost per step on a log scale, as path data in a w x h box. */
export function costPath(run: LloydRun, w: number, h: number) {
  const c = run.frames.map((f) => f.cost);
  const lo = Math.log10(Math.min(...c)), hi = Math.log10(Math.max(...c));
  const n = c.length - 1;
  const at = (i: number) => [(i / n) * w, h - ((Math.log10(c[i]) - lo) / (hi - lo)) * h] as const;
  return { d: c.map((_, i) => `${i ? 'L' : 'M'}${at(i)[0].toFixed(1)} ${at(i)[1].toFixed(1)}`).join(''), at };
}
