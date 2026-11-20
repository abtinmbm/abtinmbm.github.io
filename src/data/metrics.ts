// Every number on the site lives here, with where it came from.
// Sources: docs/02_PROJECTS.md (checked 2026-11-17) and the public Andon README
// and model card (github.com/abtinmbm/andon, read 2026-11-04;
// results/h5_bench_pico2.md and DECISIONS.md read 2026-11-14; real-fan recordings read 2026-11-17 at 4703322;
// d3, the real-fan model, its C port and the board stopping the fans read 2026-11-20 at 392266b). If a repo changes,
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
  // results/h5_bench_pico2.md (2026-11-14): measured on the Pico 2 (RP2350), one core, 150 MHz, mean of 3 runs.
  computeMsPerFrame: '10.82 ms',
  logmelMsPerFrame: '1.456 ms',
  cnnMsPerFrame: '9.365 ms',
  scoreWindow: '2 s',
  cnnMsPerScore: '299.68 ms',
  cnnVsEstimate: '3.0 times',
  // DECISIONS.md 2026-11-10/14: the first C convolution kernel, timed on the board, and the rewrite's speed-up.
  oldCnnMsPerScore: '886.44 ms',
  oldComputeMsPerFrame: '29.16 ms',
  kernelSpeedup: '3.0 times',
  // results/h5_bench_pico2.md: C against Python on the exported test vectors, on the board.
  int8InputDiffs: '0 of 24,576',
  // Totals over results/h1_fan_latency.md, h1_fan_latency_50.md and h1_fan_latency_kick.md: fan-off commands, 20 + 10 + 10.
  killSwitchTrials: '40 of 40',
  // results/h1_fan_latency_kick.md: the worst PC round trip of the three runs, against the 100 ms limit stated there.
  killSwitchWorstRtt: '3.35 ms',
  killSwitchLimit: '100 ms',
  // results/h2_mic_tone.md: 1 kHz test tone as the microphone measured it.
  micToneHz: '1000.02 Hz',
  // Real-fan recordings: github.com/abtinmbm/andon at 4703322 (read 2026-11-17): results/h2_dataset.md,
  // docs/recording_protocol.md, configs/h2_recording.yaml, PLAN.md H6/H7 and DECISIONS.md 2026-11-14 to 2026-11-17.
  // DECISIONS 2026-11-14: dev sessions d1 and d2 and eval session d3, all in one room. The first session, s1,
  // was recorded at home and moved to `other`: never used for training or scoring.
  // configs/h2_recording.yaml `fans`: id_00 Sunon, id_01 ANVISION A, id_02 ANVISION B.
  fans: '3',
  faultTypes: '2',
  // DECISIONS 2026-11-16 and configs `fault_speed_pct`: underspeed runs the fan at 85 % duty. Protocol: PWM at 25 kHz.
  underspeedDuty: '85%',
  pwmKhz: '25,000',
  // results/h2_dataset.md clip table, d1 and d2, per fan: normal 198 clips / 33.0 min (30 min take + 3 min control
  // take; d1 id_02 has 197 / 32.8 after one excluded clip), each fault 18 clips / 3.0 min.
  normalClips: '198',
  normalMinutes: '33 min',
  faultClips: '18',
  faultMinutes: '3 min',
  clipSeconds: '10 s',
  // DECISIONS 2026-11-16 (rules fixed before d2): the first 3 clips (30 s) of every underspeed take are never used.
  underspeedSkip: '30 s',
  // results/h2_dataset.md stream table and excluded clips/takes; dates from the protocol's session notes and the
  // README timeline (d3: 2026-11-18, takes stamped 2026-11-19 02:00–04:00 UTC).
  sessions: [
    { name: 'd1', date: 'Nov 16, 2026', takes: '14', frames: '461,322', breaks: '0', missing: '0', corrupt: '0', note: 'One normal clip is left out, because of a knock, not the fan.' },
    { name: 'd2', date: 'Nov 17, 2026', takes: '12', frames: '438,813', breaks: '0', missing: '0', corrupt: '0', note: 'No clips were left out.' },
    { name: 'd3', date: 'Nov 18, 2026', takes: '13', frames: '450,068', breaks: '0', missing: '0', corrupt: '0', note: 'One take was saved under the wrong fan’s name, so it’s left out whole and was recorded again. Two normal clips are left out because of a door thud, not the fan.' },
  ],
  // DECISIONS 2026-11-16/17 and results/h2_dataset.md repeatability table: id_00 underspeed, 4000–8000 Hz,
  // tolerance fixed before d2.
  repeatFan: 'Sunon',
  repeatBand: '4000–8000 Hz',
  repeatD1: '−14.2 dB',
  repeatD2: '−11.9 dB',
  repeatDiff: '+2.3 dB',
  // results/h2_dataset.md repeatability table, d3 against d1.
  repeatD3: '−13.7 dB',
  repeatDiffD3: '+0.4 dB',
  repeatTolerance: '±3 dB',
  // results/h2_dataset.md band table, d1 and d2: change in the biggest band of each fault take against the same
  // fan's normal clips in the same session, mean over the take. Pairs are [d1, d2].
  bandChange: [
    { fan: 'Sunon', under: ['−14.2', '−11.9'], underBand: '4000–8000 Hz', obs: ['+14.0', '+13.7'], obsBand: ['500–1000 Hz', '250–500 Hz'] },
    { fan: 'ANVISION A', under: ['−8.8', '−8.3'], underBand: '2000–4000 Hz', obs: ['+10.8', '+11.9'], obsBand: ['500–1000 Hz', '500–1000 Hz'] },
    { fan: 'ANVISION B', under: ['−9.7', '−8.4'], underBand: '2000–4000 Hz', obs: ['+8.8', '+9.3'], obsBand: ['500–1000 Hz', '500–1000 Hz'] },
  ] as { fan: string; under: [string, string]; underBand: string; obs: [string, string]; obsBand: [string, string] }[],
  // Real fans (H3). results/h3_eval.md: h3_gmm (seeds 0-2) and h3_level, trained on d1+d2, d3 scored once.
  // AUC 100.00 ± 0.00 in all 6 fan x fault cells for both; light 0.00 false reds/h on same-mount normals, 6 of 6
  // fault takes red. README: normal running in d3 is about an hour over the three fans. Limits: first 10 min
  // (limit_clips: 60) of the tested session's main take. configs/h3_gmm.yaml: 4-component full-covariance GMM per
  // fan on each 64-frame (2.05 s) window's mean log-mel, scored by negative log-likelihood.
  realAuc: '100%',
  realCells: 'six',
  realTakesCaught: '6 of 6',
  realFalseReds: '0',
  realNormalTime: 'about an hour',
  limitMinutes: '10 minutes',
  // results/h3_dev.md: the Stage 1 CNN scored 0.00 AUC on id_02 obstruction and id_00 underspeed (dev).
  cnnFailedCells: 'two of the six',
  // results/h5_gmm_bench_pico2.md (runs 3-4): end-to-end score error 2.51e-06 relative, 1.684 ms per 32 ms frame.
  gmmRelErr: 'a relative error of 2.51e-06',
  // README "On the device (H5)": the three fans' float32 mixtures.
  gmmFlash: '402,480 B',
  gmmMsPerFrame: '1.684 ms',
  // results/h6_jidoka.md (board run at 55cd2cf, one trial per fan): 5 s hold-off, limits on the first 584 windows
  // (10 min), 60 s watched, then 100 % to 85 % by serial command. Switch to fan off (gate pin low), board clock.
  jidokaHoldoff: '5-second',
  jidokaWatch: 'a minute',
  jidokaStops: [
    { fan: 'Sunon (id_00)', s: '11.661 s' },
    { fan: 'ANVISION A (id_01)', s: '3.471 s' },
    { fan: 'ANVISION B (id_02)', s: '3.461 s' },
  ],
  // Loudness check, dev only (Andon 46fff0d). results/level_check_fans.md: h3_gmm_levelmatched, every test window
  // shifted to the fan's normal level, 100.00 ± 0.00 in every cell of both dev folds, seeds 0-2.
  levelMatchedAuc: '100.00 ± 0.00%',
  // results/level_check_dcase.md, dev test: phase2_level_id (meter per machine ID) vs phase2_gmm_id and phase3_idcnn_mixup.
  levelDcaseMean: '63.34%',
  gmmDevAuc: '83.25 ± 0.22%',
  cnnDevAuc: '86.64 ± 0.57%',
  levelToyCar: '50.98%',
  levelToyConveyor: '48.66%',
  levelValve: '54.28%',
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
  // 5° simulated yaw error. PR #215 round 4 (head 1c76f7d, 2026-11-17): 3ds_groundside/src/image_stitcher/README.md
  // Accuracy table (public), and Abtin's `python -m tests.image_stitcher.evaluate` run on 1c76f7d
  // (portfolio/eval_179_results_2026-11-17_first_photos_final.txt). Accuracy unchanged from round 3.
  missions: '10 of 10',
  photos: '91',
  // README Accuracy table: per-mission averages, 4.0–7.3 cm at 1 m GPS error and 4.3–8.3 cm at 3 m.
  alignment: '4.0–8.3 cm',
  // Same missions with refinement off and on: Abtin's rerun of 2026-11-09 on 4a9bbdf (round 3), published with his OK.
  // Not rerun on round 4; change only after rerunning portfolio/tools/eval_179_stitcher.py on the current code.
  refineBefore: '13.6–69.8 cm',
  refineAfter: '4.0–8.3 cm',
  // Map position vs truth, split by simulated GPS error (README Accuracy table, round 4).
  mapError1: '0.162–0.307 m',
  mapError3: '0.472–0.935 m',
  // README: no photo rejected in the evaluation (10 × 91). Blur limit check (resume PDF): 2,730 photos × 9 conditions,
  // 5 sharp (clean, JPEG 75, noise σ2 and σ4, dim) and 4 blurred (Gaussian 0.7 px, 5 px motion at 0/45/90°).
  rejectedGood: '0 of 910',
  blurWrong: '0 of 2,730 photos under 9 conditions (5 sharp, 4 slightly blurred; none combine noise and blur)',
  // Per photo on a laptop CPU, simulated. Now: the round 4 evaluate run on 1c76f7d (0.133–0.186 s over the 10 missions).
  // Before: the PR README before yaw.
  speed: '0.13–0.19 s',
  speedFrom: 0.13,
  speedTo: 0.19,
  speedBefore: '0.42–0.75 s',
  // Stitcher tests at 1c76f7d: 130 collected in tests/unit/test_stitcher_*.py and tests/integration/test_image_stitcher.py
  // (259 in 3ds_groundside), all passing in CI run 44230696092. Checked with pytest --collect-only, 2026-11-17.
  tests: '130',
  // Round 4: a per-point cut of conflicting matches in refinement, measured before it was rejected (simulated,
  // same 10 missions). portfolio/179-image-stitcher.md, refine_conflict_residuals_179.py. Correct matches sit up to
  // 30.6 px off before refinement; wrong repeating-ground matches about 880 px.
  strictCutAlignment: '4.9–14.6 cm',
  // Constant yaw offsets of 0, 90 and 180°, simulated at 3 m GPS error: Abtin's rerun of 2026-11-09, published with his OK.
  yawOffsetRuns: '12 of 12',
  // One simulated pair across a row turn, from the worked example run on 2026-11-04. Measured before yaw was added.
  rowCandidates: 612,
  rowKept: 10,
  rowKeptTurned: 317,
  // candidates at the 180° turn (rerun 2026-11-06). Measured before yaw was added.
  rowCandidatesTurned: 714,
  // Simulator setup, PR #215: 3ds_groundside/src/image_stitcher/README.md Accuracy section (120 x 90 m, 25 m,
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
  // PR #247 description (head 6bf6e52, after review): 28 tests in tests/test_lloyd.py.
  // runs, cvStart and cvEnd rerun on 6bf6e52 on 2026-11-19 (eval_219_results_2026-11-19.txt): identical.
  tests: '28',
  // portfolio/219-lloyds-algorithm.md: fuzz of random starts, drones up to 20 m outside the region.
  fuzzStarts: '600',
};

export const awards = {
  // CNLC (Canadian National Leadership Conference) is the competition. FBLA Canada ran it in 2024;
  // in 2025 it was run by FBLC (Future Business Leaders of Canada), which branched off FBLA. Abtin, 2026-11-06.
  fblc2025: '1st of 32 teams, Coding & Programming, CNLC 2025 (run by FBLC, Future Business Leaders of Canada)',
  fbla2024: '4th of 32 teams, Coding & Programming, CNLC 2024 (run by FBLA Canada)',
};
