// Every number on the site lives here, with where it came from.
// Sources: docs/02_PROJECTS.md (checked 2026-11-03) and the public Andon README
// and model card (github.com/abtinmbm/andon, read 2026-11-04). If a repo changes,
// change the number here and every page follows.

export const andon = {
  // README "At a glance" and results/phase3_comparison.md: evaluation set, mean of 3 seeds.
  meanAuc: '92.13%',
  baselineAuc: '79.70%',
  // README "At a glance": mean ± std over the 3 seeds.
  meanAucSpread: '92.13 ± 0.16%',
  baselineAucSpread: '79.70 ± 0.39%',
  // README: PyTorch reproduction of the DCASE 2020 baseline, dev set, vs the published 73.51.
  reproducedBaselineDev: '73.80',
  publishedBaselineDev: '73.51',
  // docs/02: within 0.88 AUC points of the published result on all 6 machine types.
  reproductionGap: '0.88',
  // README "The andon light on a continuous stream", evaluation set.
  faultsCaught: '65.57%',
  secondsToRed: '10.57 s',
  falseAlarmsPerHour: '5.53',
  valveCaught: '21.75%',
  // README "Small enough for a microcontroller".
  int8Size: '98.7 KB',
  floatSize: '383.0 KB',
  int8Auc: '92.08%',
  weights: 'about 98k',
  // Estimated, not measured: multiply-adds at 0.5 per cycle on a 150 MHz Cortex-M33.
  estComputeMs: '3.27 ms',
  // docs/02 "Hard problems": mean dev AUC without and with mixup.
  devAucNoMixup: '84.33%',
  devAucMixup: '86.64%',
  // docs/02: valve AUC, reference autoencoder vs CNN.
  valveAe: '57.93%',
  valveCnn: '94.64%',
  // docs/02: NumPy fixed-point reference implementation.
  quantRefLines: 'about 400',
  // docs/02: Gaussian mixture beats the CNN on 3 of 6 types (ToyCar, ToyConveyor, fan).
  gmmWins: '3 of 6',
  // Evaluation AUC (%) by machine type: CNN, then the reference autoencoder. docs/02 table.
  byType: [
    { type: 'ToyCar', cnn: 90.29, ae: 79.65 },
    { type: 'ToyConveyor', cnn: 80.38, ae: 88.31 },
    { type: 'fan', cnn: 94.47, ae: 86.1 },
    { type: 'pump', cnn: 94.73, ae: 84.51 },
    { type: 'slider', cnn: 98.25, ae: 81.73 },
    { type: 'valve', cnn: 94.64, ae: 57.93 },
  ],
};

export const stitcher = {
  // All simulated: 10 missions, 91 photos each, 3 drones, shuffled arrival, heading unknown.
  missions: '10 of 10',
  photos: '91',
  alignment: '4.2–6.9 cm',
  // Rerun of portfolio/tools/eval_179_stitcher.py on 2026-11-04 (after the Nov 3 changes) matches.
  refineBefore: '13–41 cm',
  refineAfter: '4–7 cm',
  // Map position vs truth, split by simulated GPS error (README Accuracy table).
  mapError1: '0.16–0.31 m',
  mapError3: '0.47–0.94 m',
  // README: no photo rejected in the evaluation (10 × 91). Blur limit check (resume PDF): 2,730 photos × 9 conditions,
  // 5 sharp (clean, JPEG 75, noise σ2 and σ4, dim) and 4 blurred (Gaussian 0.7 px, 5 px motion at 0/45/90°).
  rejectedGood: '0 of 910',
  blurWrong: '0 of 2,730 photos under 9 conditions (5 sharp, 4 slightly blurred; none combine noise and blur)',
  // PR #215 image_stitcher/README.md (public), same as docs/02.
  speed: '0.42–0.75 s',
  tests: '80',
  // portfolio/tools/guide_worked_example_179.py, one pair across a row turn (rerun 2026-11-04).
  rowCandidates: 612,
  rowKept: 10,
  rowKeptTurned: 317,
  // candidates at the 180° turn (rerun 2026-11-06)
  rowCandidatesTurned: 714,
};

export const awards = {
  // CNLC (Canadian National Leadership Conference) is the competition. FBLA Canada ran it in 2024;
  // in 2025 it was run by FBLC (Future Business Leaders of Canada), which branched off FBLA. Abtin, 2026-11-06.
  fblc2025: '1st of 32 teams, Coding & Programming, CNLC 2025 (run by FBLC, Future Business Leaders of Canada)',
  fbla2024: '4th of 32 teams, Coding & Programming, CNLC 2024 (run by FBLA Canada)',
};
