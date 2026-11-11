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
  // results/phase4_mcu.md: the Phase 4 estimate, since measured below. Multiply-adds at 0.5 per cycle on a 150 MHz Cortex-M33.
  estComputeMs: '3.27 ms',
  // results/phase4_mcu.md: compute budget per 32 ms audio frame, and the estimated time per CNN score.
  computeBudgetMs: '20 ms',
  frameMs: '32 ms',
  estCnnMsPerScore: '98.32 ms',
  // results/h5_bench_pico2.md: measured on the Pico 2, one core, 150 MHz, mean of 3 runs.
  computeMsPerFrame: '29.16 ms',
  cnnMsPerScore: '886.44 ms',
  cnnVsEstimate: '9.0×',
  // results/h5_bench_pico2.md: C against Python on the exported test vectors, on the board.
  int8InputDiffs: '0 of 24,576',
  selfTestRuns: '3',
  // Totals over results/h1_fan_latency.md, h1_fan_latency_50.md and h1_fan_latency_kick.md: fan-off commands, 20 + 10 + 10.
  killSwitchTrials: '40 of 40',
  // results/h1_fan_latency_kick.md: the worst PC round trip of the three runs, against the 100 ms limit stated there.
  killSwitchWorstRtt: '3.35 ms',
  killSwitchLimit: '100 ms',
  // results/h2_mic_tone.md: 1 kHz test tone as the microphone measured it.
  micToneHz: '1000.02 Hz',
  // docs/recording_protocol.md: 3 sessions planned. results/h2_dataset.md: session s1 rows only.
  sessionsRecorded: '1 of 3',
  // configs/h2_recording.yaml and results/h2_dataset.md (s1): per fan, per session.
  fans: '3',
  normalMinutes: '30 min',
  faultMinutes: '3 min',
  faultTypes: '2',
  // results/h2_dataset.md (s1): 9 rows summed.
  sessionMinutes: '108 min',
  sessionClips: '648',
  clipSeconds: '10 s',
  // results/h2_dataset.md (s1): stream table for breaks, missing and corrupt; clip table for clipped samples.
  streamBreaks: '0',
  framesMissing: '0',
  framesCorrupt: '0',
  clippedSamples: '0',
  // docs/recording_protocol.md, Faults table.
  tapeSize: '5 × 5 mm',
  // results/h2_dataset.md (s1): largest band change of each fault take against that fan's normal clips, mean over the take.
  bandChange: [
    { fan: 'Sunon', imbalance: '+6.6 dB', imbalanceBand: '0–125 Hz', obstruction: '+14.0 dB', obstructionBand: '250–500 Hz' },
    // imbalanceRange: results/h2_dataset.md (s1), per clip, biggest band. The take was uneven (Abtin, 2026-11-09).
    { fan: 'ANVISION A', imbalance: '+5.3 dB', imbalanceBand: '0–125 Hz', imbalanceRange: '−1.0 to +8.2 dB', obstruction: '+11.4 dB', obstructionBand: '500–1000 Hz' },
    { fan: 'ANVISION B', imbalance: '+6.2 dB', imbalanceBand: '0–125 Hz', obstruction: '+11.1 dB', obstructionBand: '500–1000 Hz' },
  ] as { fan: string; imbalance: string; imbalanceBand: string; imbalanceRange?: string; obstruction: string; obstructionBand: string }[],
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
  // All simulated: 10 missions, 91 photos each, 3 drones, shuffled arrival, flown east-west,
  // 5° simulated yaw error. Round 3 of PR #215, image_stitcher/README.md Accuracy table (public).
  missions: '10 of 10',
  photos: '91',
  // README Accuracy table: per-mission averages, 4.0–7.3 cm at 1 m GPS error and 4.3–8.3 cm at 3 m.
  alignment: '4.0–8.3 cm',
  // Same missions with refinement off and on: Abtin's rerun of 2026-11-09 on the round 3 code, published with his OK.
  refineBefore: '13.6–69.8 cm',
  refineAfter: '4.0–8.3 cm',
  // Map position vs truth, split by simulated GPS error (README Accuracy table, round 3).
  mapError1: '0.16–0.31 m',
  mapError3: '0.47–0.94 m',
  // README: no photo rejected in the evaluation (10 × 91). Blur limit check (resume PDF): 2,730 photos × 9 conditions,
  // 5 sharp (clean, JPEG 75, noise σ2 and σ4, dim) and 4 blurred (Gaussian 0.7 px, 5 px motion at 0/45/90°).
  rejectedGood: '0 of 910',
  blurWrong: '0 of 2,730 photos under 9 conditions (5 sharp, 4 slightly blurred; none combine noise and blur)',
  // Per photo on a laptop CPU, simulated. Now: README Accuracy section, round 3. Before: the same README before yaw.
  speed: '0.12–0.19 s',
  speedBefore: '0.42–0.75 s',
  // Stitcher tests in PR #215, round 3. Abtin, 2026-11-09.
  tests: '112',
  // Constant yaw offsets of 0, 90 and 180°, simulated at 3 m GPS error: Abtin's rerun of 2026-11-09, published with his OK.
  yawOffsetRuns: '12 of 12',
  // One simulated pair across a row turn, from the worked example run on 2026-11-04. Measured before yaw was added.
  rowCandidates: 612,
  rowKept: 10,
  rowKeptTurned: 317,
  // candidates at the 180° turn (rerun 2026-11-06). Measured before yaw was added.
  rowCandidatesTurned: 714,
  // Simulator setup, PR #215 round 3: image_stitcher/README.md Accuracy section (120 x 90 m, 25 m,
  // 5 random fields each at 1 m and 3 m GPS error) and camera_info.yaml (Arducam 640 x 480).
  // Blur tests use seeds 3 and 4 (test_stitcher_quality.py); evaluate.py scores seeds 0-4.
  simField: '120 by 90 m',
  simAltitude: '25 m',
  simCamera: '640 × 480',
  simFields: '5',
};

export const lloyd = {
  // All simulated. C:/warg/portfolio/eval_219_results_2026-11-06.txt (lloyd_219_eval.py): 3 regions
  // (200 m square, 200 m L-shape, made-up irregular field) x 4/6/10 drones x seeds 0-9, starting
  // bunched within 15 m of a launch point. Published with Abtin's OK, 2026-11-06.
  runs: '90 of 90',
  cvStart: '0.46',
  cvEnd: '0.06',
  // PR #247 README: cells can still differ in area, largest up to about 1.8x the smallest.
  areaRatio: 'about 1.8×',
  // PR #247 description: 27 new tests in tests/test_lloyd.py.
  tests: '27',
  // portfolio/219-lloyds-algorithm.md: fuzz of random starts, drones up to 20 m outside the region.
  fuzzStarts: '600',
};

export const awards = {
  // CNLC (Canadian National Leadership Conference) is the competition. FBLA Canada ran it in 2024;
  // in 2025 it was run by FBLC (Future Business Leaders of Canada), which branched off FBLA. Abtin, 2026-11-06.
  fblc2025: '1st of 32 teams, Coding & Programming, CNLC 2025 (run by FBLC, Future Business Leaders of Canada)',
  fbla2024: '4th of 32 teams, Coding & Programming, CNLC 2024 (run by FBLA Canada)',
};
