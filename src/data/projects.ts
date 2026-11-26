// Every project on the site, oldest first.
// Featured projects get a window on the homepage, a row in the Featured index, a taskbar tab
// and a desktop icon. Everything else (high school and smaller work) is a row in the Archive
// table. Adding a project here with `featured: false` puts it in the Archive automatically.
//
// Dates: first commit on GitHub, in UTC. End dates are the last-commit day, padded to 23:59 UTC.
// - School Partner Directory and CyberShield end dates skip later README tidy-ups (2026-10-16, 2026-11-04).
// - Image Stitcher starts at the first commit of UWARG/autonomy-monorepo PR #215.
// Checked with `gh` on 2026-11-04.

export type Status = 'finished' | 'in review' | 'merged' | 'in progress';

export interface Project {
  slug: string;
  name: string;
  /** Short description for the homepage directory. */
  line: string;
  /** Short name for the taskbar on a phone. */
  short?: string;
  /** Main or current work: gets a homepage window. False: a row in the Archive. */
  featured: boolean;
  /** Archive rows: what it is, the year, and any recognition. */
  what?: string;
  year?: string;
  note?: string;
  status: Status;
  start: string;
  /** Last commit for finished work. Leave empty while it's still going. */
  end?: string;
  /** Page on this site, if it has one. */
  href?: string;
  repo: string;
  /** A design team's task. */
  team?: 'warg';
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
    featured: false,
    what: 'A Django directory linking a school with local partners',
    year: '2024',
    // awards.fbla2024 in metrics.ts
    note: '4th of 32 teams, Coding & Programming, CNLC 2024',
  },
  {
    slug: 'cybershield',
    name: 'CyberShield',
    line: 'A cybersecurity forum',
    status: 'finished',
    start: '2025-02-28T23:08:57Z',
    end: '2025-03-02T23:59:00Z',
    repo: 'https://github.com/abtinmbm/cybershield',
    featured: false,
    what: 'A Django cybersecurity forum',
    year: '2025',
    // awards.fblc2025 in metrics.ts
    note: '1st of 32 teams, Coding & Programming, CNLC 2025',
  },
  {
    slug: 'image-stitcher',
    name: 'Image Stitcher',
    line: 'Combines GPS-tagged photos from multiple drones into one top-down map. Tested in simulation for WARG.',
    status: 'merged',
    start: '2026-10-16T03:04:43Z',
    // last commit 1c76f7d (2026-11-18 03:28 UTC); squash-merged as ce37d8d on 2026-11-19 00:29 UTC.
    end: '2026-11-18T23:59:00Z',
    href: '/projects/image-stitcher/',
    repo: 'https://github.com/UWARG/autonomy-monorepo/pull/215',
    team: 'warg',
    featured: true,
    short: 'Stitch',
  },
  {
    slug: 'lloyd',
    name: 'Lloyd’s algorithm',
    line: 'Finds positions that spread a drone swarm evenly across a GPS-bounded field. Tested in simulation for WARG.',
    status: 'in review',
    // first commit of UWARG/autonomy-monorepo PR #247
    start: '2026-11-06T23:39:57Z',
    href: '/projects/lloyd/',
    repo: 'https://github.com/UWARG/autonomy-monorepo/pull/247',
    team: 'warg',
    featured: true,
    short: 'Lloyd',
  },
  {
    slug: 'andon',
    name: 'Andon',
    line: 'Learns what a healthy machine sounds like. On a Raspberry Pi Pico, it detects a fan fault and cuts the power.',
    status: 'in progress',
    start: '2026-10-17T06:14:06Z',
    href: '/projects/andon/',
    repo: 'https://github.com/abtinmbm/andon',
    featured: true,
  },
  {
    slug: 'dose-coach',
    name: 'Dose Coach',
    line: 'Guides a rehab workout and uses a wrist sensor to check the height and speed of each bicep curl.',
    status: 'finished',
    // github.com/abtinmbm/ece198: first commit 373b8dc, last f1c5d36 (2026-11-22 04:47 UTC).
    start: '2026-11-08T04:23:58Z',
    end: '2026-11-22T23:59:00Z',
    href: '/projects/dose-coach/',
    repo: 'https://github.com/abtinmbm/ece198',
    featured: true,
    short: 'Dose',
  },
];

/** The homepage order of featured work, and the Archive (newest first). */
export const featuredOrder = ['andon', 'image-stitcher', 'lloyd', 'dose-coach'];
export const featured = (): Project[] => {
  const f = projects.filter((p) => p.featured);
  const rank = (p: Project) => { const i = featuredOrder.indexOf(p.slug); return i < 0 ? 99 : i; };
  return f.sort((a, b) => rank(a) - rank(b) || b.start.localeCompare(a.start));
};
export const archive = (): Project[] => projects.filter((p) => !p.featured).sort((a, b) => b.start.localeCompare(a.start));

export const statusText: Record<Status, string> = {
  finished: 'Finished',
  'in review': 'In review',
  merged: 'Merged',
  'in progress': 'In progress',
};
