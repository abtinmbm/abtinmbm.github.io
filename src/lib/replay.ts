// The Andon replay chart, drawn as SVG at the size it's shown, so its text stays real
// text at the site's sizes. The data is the trace the Andon repo's demo builds
// (andon/demo.py, configs/phase5_demo.yaml): fan id_06, model seed 0.

export interface Trace {
  t: number[];      // seconds, when each window's score is ready
  s: number[];      // anomaly score per window
  warn: number;
  control: number;
  faultStart: number;
  faultEnd: number;
  light: string[];  // 'G' | 'Y' | 'R' after each window
}

export const LAMP = { G: '#2e9d4f', Y: '#f2b705', R: '#d62828' } as const;
export const STATE_TEXT = { G: 'Running normally', Y: 'Warning: sounds unusual', R: 'Stop: fault detected' } as const;

export function redDelay(tr: Trace): number {
  const k = tr.light.indexOf('R');
  return k < 0 ? NaN : tr.t[k] - tr.faultStart;
}

/** SVG markup for the chart after the first n windows. */
export function chartSvg(tr: Trace, n: number, W: number, H: number): string {
  const small = W < 520;
  // On wide screens the y labels hang left of the plot, so the plot, the axis title,
  // the button and the caption share one left edge.
  const pad = { l: small ? 40 : 0, r: small ? 8 : 12, t: 34, b: 28 };
  const lo = Math.log10(Math.max(Math.min(...tr.s), 1e-4) / 2);
  const hi = Math.log10(Math.max(Math.max(...tr.s), tr.control) * 3);
  const tEnd = tr.t[tr.t.length - 1];
  const x = (t: number) => pad.l + (t / tEnd) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (Math.log10(v) - lo) / (hi - lo)) * (H - pad.t - pad.b);
  const f = (v: number) => v.toFixed(1);
  const out: string[] = [];

  // axes
  for (const v of [0.01, 0.1, 1, 10]) {
    out.push(`<line class="rp-grid" x1="${pad.l}" x2="${W - pad.r}" y1="${f(y(v))}" y2="${f(y(v))}"/>`);
    out.push(`<text class="rp-tick" x="${pad.l - 8}" y="${f(y(v) + 4)}" text-anchor="end">${v}</text>`);
  }
  const step = small ? 60 : 30;
  for (let s = 0; s <= tEnd; s += step) {
    out.push(`<text class="rp-tick" x="${f(x(s))}" y="${H - 6}" text-anchor="${s === 0 ? 'start' : 'middle'}">${s === 0 ? '0 s' : s}</text>`);
  }

  out.push(`<text class="rp-note" x="0" y="14">Anomaly score, log scale</text>`);

  // limits, labelled at the left: warning under its line, control over it
  out.push(`<line class="rp-limit" x1="${pad.l}" x2="${W - pad.r}" y1="${f(y(tr.warn))}" y2="${f(y(tr.warn))}" stroke="${LAMP.Y}"/>`);
  out.push(`<line class="rp-limit" x1="${pad.l}" x2="${W - pad.r}" y1="${f(y(tr.control))}" y2="${f(y(tr.control))}" stroke="${LAMP.R}"/>`);
  out.push(`<text class="rp-note" x="${pad.l + 6}" y="${f(y(tr.control) - 7)}">Control limit</text>`);
  out.push(`<text class="rp-note" x="${pad.l + 6}" y="${f(y(tr.warn) + 16)}">Warning limit</text>`);

  // when the fault audio starts
  const xf = x(tr.faultStart);
  out.push(`<line class="rp-fault" x1="${f(xf)}" x2="${f(xf)}" y1="${pad.t - 6}" y2="${H - pad.b}"/>`);
  out.push(`<text class="rp-note" x="${f(xf - 8)}" y="${pad.t - 20}" text-anchor="end">Fault starts</text>`);
  const last = n > 0 ? tr.light[n - 1] : 'G';
  if (last === 'R') {
    out.push(`<text class="rp-note rp-strong" x="${f(xf - 8)}" y="${pad.t - 4}" text-anchor="end">Red ${redDelay(tr).toFixed(1)} s later</text>`);
  }

  // the score so far
  if (n > 0) {
    const pts = tr.t.slice(0, n).map((t, i) => `${f(x(t))},${f(y(tr.s[i]))}`).join(' ');
    out.push(`<polyline class="rp-score" points="${pts}"/>`);
    out.push(`<circle cx="${f(x(tr.t[n - 1]))}" cy="${f(y(tr.s[n - 1]))}" r="4.5" fill="${LAMP[last as keyof typeof LAMP]}"/>`);
  }
  return out.join('');
}
