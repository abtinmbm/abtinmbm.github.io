// Every project on the site, oldest first. The star trails are drawn from this list,
// so adding a project here adds a trail.
//
// Dates: first commit on GitHub, in UTC. End dates are the last-commit day, padded to 23:59 UTC.
// - School Partner Directory and CyberShield end dates skip later README tidy-ups (2026-10-16, 2026-11-04).
// - Image Stitcher starts at the first commit of UWARG/autonomy-monorepo PR #215.
// Checked with `gh` on 2026-11-04.

// To mark a pull request as merged, change its status to 'merged' (and add `end`).
export type Status = 'finished' | 'in review' | 'merged' | 'in progress';

export interface Project {
  slug: string;
  name: string;
  /** Few words for the star-trail label. */
  line: string;
  status: Status;
  start: string;
  /** Last commit for finished work. Leave empty while it's still going. */
  end?: string;
  /** Page on this site, if it has one. */
  href?: string;
  repo: string;
  earlier?: boolean;
  /** Work shown as one star trail with others: a design team's tasks, or older projects. */
  team?: 'warg' | 'earlier';
}

export const projects: Project[] = [
  {
    slug: 'school-partner-directory',
    name: 'School Partner Directory',
    line: 'A directory linking a school with local partners',
    status: 'finished',
    start: '2024-02-11T01:56:16Z',
    end: '2024-02-25T23:59:00Z',
    repo: 'https://github.com/abtinmbm/FBLA2024',
    earlier: true,
    team: 'earlier',
  },
  {
    slug: 'cybershield',
    name: 'CyberShield',
    line: 'A cybersecurity forum',
    status: 'finished',
    start: '2025-02-28T23:08:57Z',
    end: '2025-03-02T23:59:00Z',
    repo: 'https://github.com/abtinmbm/cybershield',
    earlier: true,
    team: 'earlier',
  },
  {
    slug: 'image-stitcher',
    name: 'Image Stitcher',
    line: 'Turns drone photos into one map',
    status: 'in review',
    start: '2026-10-16T03:04:43Z',
    href: '/projects/image-stitcher/',
    repo: 'https://github.com/UWARG/autonomy-monorepo/pull/215',
    team: 'warg',
  },
  {
    slug: 'lloyd',
    name: 'Lloyd’s algorithm',
    line: 'Spreads a drone swarm evenly',
    status: 'in review',
    // first commit of UWARG/autonomy-monorepo PR #247
    start: '2026-11-06T23:39:57Z',
    href: '/projects/lloyd/',
    repo: 'https://github.com/UWARG/autonomy-monorepo/pull/247',
    team: 'warg',
  },
  {
    slug: 'andon',
    name: 'Andon',
    line: 'Hears when a machine starts to sound wrong',
    status: 'in progress',
    start: '2026-10-17T06:14:06Z',
    href: '/projects/andon/',
    repo: 'https://github.com/abtinmbm/andon',
  },
];

/** Teams draw one star trail, with their tasks listed under its label. */
export const teams = {
  earlier: { name: 'High School Projects', line: 'CyberShield and School Partner Directory', link: '/#earlier' },
  warg: { name: 'WARG', line: 'Drone software for the Waterloo Aerial Robotics Group', link: '/#warg' },
};

export interface SkyEntry {
  name: string;
  line: string;
  link: string;
  start: string;
  end?: string;
  /** The projects this trail stands for (one, or a team's tasks). */
  slugs: string[];
  subs?: { name: string; line: string; link: string }[];
}

/** The star trails, oldest first: one per project, and one per team for all its tasks. */
export function skyEntries(): SkyEntry[] {
  const out: SkyEntry[] = [];
  for (const p of projects) {
    const link = p.href ?? `/#${p.slug}`;
    if (!p.team) { out.push({ name: p.name, line: p.line, link, start: p.start, end: p.end, slugs: [p.slug] }); continue; }
    let g = out.find((e) => e.slugs.length && projects.find((x) => x.slug === e.slugs[0])?.team === p.team);
    if (!g) { g = { ...teams[p.team], start: p.start, slugs: [], subs: [] }; out.push(g); }
    g.slugs.push(p.slug);
    g.subs!.push({ name: p.name, line: p.line, link });
    if (p.start < g.start) g.start = p.start;
  }
  // A team's trail is still going while any of its tasks is.
  for (const g of out.filter((e) => e.subs)) {
    const members = g.slugs.map((s) => projects.find((x) => x.slug === s)!);
    if (!members.every((m) => m.end)) continue;
    // Finished groups: the trail is as long as the time worked on them, not the gap between them.
    const worked = members.reduce((t, m) => t + (Date.parse(m.end!) - Date.parse(m.start)), 0);
    g.end = members.map((m) => m.end!).sort().at(-1);
    g.start = new Date(Date.parse(g.end!) - worked).toISOString();
  }
  return out.sort((a, b) => a.start.localeCompare(b.start));
}

export const statusText: Record<Status, string> = {
  finished: 'Finished',
  'in review': 'In review',
  merged: 'Merged',
  'in progress': 'In progress',
};
