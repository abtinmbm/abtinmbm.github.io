// Every project on the site, oldest first. The star trails are drawn from this list,
// so adding a project here adds a trail.
//
// Dates: first commit on GitHub, in UTC. End dates are the last-commit day, padded to 23:59 UTC.
// - School Partner Directory and CyberShield end dates skip later README tidy-ups (2026-10-16, 2026-11-04).
// - Image Stitcher starts at the first commit of UWARG/autonomy-monorepo PR #215.
// Checked with `gh` on 2026-11-04.

export type Status = 'finished' | 'in review' | 'in progress';

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
  },
  {
    slug: 'image-stitcher',
    name: 'Image Stitcher',
    line: 'Turns drone photos into one map',
    status: 'in review',
    start: '2026-10-16T03:04:43Z',
    href: '/projects/image-stitcher/',
    repo: 'https://github.com/UWARG/autonomy-monorepo/pull/215',
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

export const statusText: Record<Status, string> = {
  finished: 'Finished',
  'in review': 'In review',
  'in progress': 'In progress',
};
