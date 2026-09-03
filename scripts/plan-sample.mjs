#!/usr/bin/env node
/**
 * Tính cỡ mẫu cho thiết kế trong-người (việc C1.2, sửa đổi S1.2).
 *
 *   npm run plan:sample                    — bảng cỡ mẫu theo các giả định
 *   npm run plan:sample -- --power 0.9     — đổi mức lực mong muốn
 *   npm run plan:sample -- --quick         — ít lượt mô phỏng hơn, chạy nhanh
 *
 * **Phải chạy trước khi thu dữ liệu.** Tính lực sau khi đã thấy p ("post-hoc
 * power") chỉ là viết lại p bằng chữ khác, không cho biết thêm gì.
 *
 * Với thiết kế đã chốt (4 địa điểm × 3 điều kiện, mỗi người nghe mỗi địa điểm
 * đúng một lần), **mỗi người tham gia đóng góp đúng 1 cặp cho mỗi phép so sánh**:
 * bốn bước liên tiếp trong vòng xoay 3 điều kiện luôn phủ đủ cả ba. Nên số cặp
 * bằng số người, và cỡ mẫu tính ra đọc thẳng là số người cần tuyển.
 *
 * ## Vì sao kịch bản khai bằng "biết", không khai thẳng p01/p10 (S1.2)
 *
 * Bản đầu khai thẳng ba cặp p01/p10. Khi phát hiện lỗi danh sách trả lời (S1.1:
 * 4 ô → lượt cuối chắc chắn đúng) thì không biết phải sửa ba cặp đó thế nào, vì
 * chúng không nói mức đoán mò là bao nhiêu. Nay kịch bản khai **tỉ lệ người thật
 * sự nhận ra nơi đó** ở từng điều kiện; mức đoán mò do thiết kế danh sách quyết
 * định; p01/p10 suy ra bằng `src/research/guessing-model.js`. Đổi thiết kế thì
 * chỉ đổi một số.
 */

import {
  mcnemarPower,
  mcnemarSampleSize,
  mcnemarSampleSizeBySimulation,
  simulateMcnemarPower,
  simulateWilcoxonPower,
  wilcoxonSampleSize,
} from '../src/research/power.js';
import { chanceLevel, discordantRates } from '../src/research/guessing-model.js';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? Number(args[index + 1]) : fallback;
};

const POWER = flag('power', 0.8);
const ALPHA = flag('alpha', 0.05);
const RUNS = args.includes('--quick') ? 800 : 4000;
const SEED = 20260807;
const MAX_N = 1000;

const pct = (x) => `${(x * 100).toFixed(1)}%`;

console.log(
  `Cỡ mẫu cho thiết kế trong-người · α = ${ALPHA} (hai phía) · lực mong muốn ${pct(POWER)}\n` +
    `Mô phỏng ${RUNS} lượt mỗi ô, seed ${SEED} — chạy lại cho ra đúng số cũ.\n`,
);

// ────────────────────────────────────────────────────────── H1: tỉ lệ nhận đúng

/**
 * Hai thiết kế danh sách trả lời. Mức đoán mò tính với giả định người tham gia
 * **nhớ và loại trừ** các nơi đã nghe — giả định tệ nhất về phía thiết kế.
 */
const DESIGNS = [
  { key: 'cũ ', label: 'trước S1.1 — danh sách = 4 vùng sẽ nghe', chance: chanceLevel({ trials: 4, options: 4 }) },
  { key: 'mới', label: 'sau S1.1 — 4 vùng + 4 phương án nhiễu', chance: chanceLevel({ trials: 4, options: 8 }) },
];

/**
 * Ba kịch bản về **mức "biết"**: tỉ lệ người thật sự nhận ra nơi đó (không đoán).
 * `knowIsolated` giữ 35% cho cả ba; kịch bản khác nhau ở phần phân lớp giúp thêm.
 *
 * Đây là chỗ duy nhất của cả bài tính có phần chủ quan, nên nói thẳng: chưa có
 * số liệu mồi từ pilot (việc C4.1). Ba kịch bản là để thấy cỡ mẫu nhạy đến đâu
 * với giả định — chứ không phải để chọn cái nào cho ra con số dễ chịu nhất.
 */
const KNOW_ISOLATED = 0.35;
const SCENARIOS = [
  { name: 'dè dặt', knowLayered: 0.45, note: 'phân lớp giúp thêm 10 đpt người nhận ra nơi' },
  { name: 'vừa phải', knowLayered: 0.55, note: 'thêm 20 đpt' },
  { name: 'lạc quan', knowLayered: 0.65, note: 'thêm 30 đpt' },
];

const sampleSizes = (p01, p10) => {
  let byFormula;
  let bySimulation;
  try {
    byFormula = String(mcnemarSampleSize({ p01, p10, alpha: ALPHA, power: POWER }));
  } catch {
    byFormula = '—';
  }
  try {
    bySimulation = String(
      mcnemarSampleSizeBySimulation({ p01, p10, alpha: ALPHA, power: POWER, runs: RUNS, seed: SEED, maxN: MAX_N }),
    );
  } catch {
    bySimulation = `> ${MAX_N}`;
  }
  return { byFormula, bySimulation };
};

console.log('H1 / FR-58 — tỉ lệ nhận diện đúng (McNemar)');
console.log(`  "biết" ở isolated cố định ${pct(KNOW_ISOLATED)}; mức đoán mò theo thiết kế danh sách trả lời:`);
for (const design of DESIGNS) console.log(`    ${design.key}  ${pct(design.chance).padStart(6)}  ${design.label}`);
console.log('');
console.log('  kịch bản    thiết kế   biết L   đúng L   đúng I    p01    p10   chênh   công thức   MÔ PHỎNG');
for (const scenario of SCENARIOS) {
  for (const design of DESIGNS) {
    const rates = discordantRates({
      knowLayered: scenario.knowLayered,
      knowIsolated: KNOW_ISOLATED,
      chance: design.chance,
    });
    const { byFormula, bySimulation } = sampleSizes(rates.p01, rates.p10);
    console.log(
      `  ${scenario.name.padEnd(10)}  ${design.key}      ${pct(scenario.knowLayered).padStart(6)}  ` +
        `${pct(rates.accuracyLayered).padStart(6)}   ${pct(rates.accuracyIsolated).padStart(6)}  ` +
        `${rates.p01.toFixed(3)}  ${rates.p10.toFixed(3)}  ${pct(rates.p01 - rates.p10).padStart(6)}   ` +
        `${byFormula.padStart(9)}   ${bySimulation.padStart(8)}`,
    );
  }
}

console.log(
  '\n  Đọc bảng: cùng một mức "biết", thiết kế cũ cho chênh p01 − p10 nhỏ hơn hẳn —\n' +
    '    dạng đóng chênh = (biết L − biết I) × (1 − đoán mò). Đoán mò 52% bào mất nửa\n' +
    '    hiệu ứng; 16% chỉ bào mất một phần sáu. Đây là cái giá bằng số của lỗi S1.1.\n' +
    '\n  ⚠ Hai cột cuối KHÔNG bằng nhau, và chênh có hướng cố định. Công thức khép kín\n' +
    '    (Connor 1987) giả định xấp xỉ chuẩn không hiệu chỉnh, còn `mcnemarTest` dùng\n' +
    '    bản CHÍNH XÁC khi ít cặp bất đồng và bản chi bình phương CÓ hiệu chỉnh khi\n' +
    '    nhiều — cả hai đều thận trọng hơn. Đo được: sai số loại I thực tế chỉ\n' +
    `    ${pct(simulateMcnemarPower({ n: 48, p01: 0.2, p10: 0.2, alpha: ALPHA, runs: RUNS, seed: SEED }))}` +
    ` chứ không phải ${pct(ALPHA)}.\n` +
    '    ⇒ Tuyển theo cột MÔ PHỎNG. Tuyển theo công thức là thiếu người, và chỉ\n' +
    '      biết điều đó sau khi đã thu xong.',
);

// ─────────────────────────────────────────────── H2: hai chiều cảm nhận ISO

console.log('\nH2 — hai chiều cảm nhận ISO/TS 12913-3 (Wilcoxon dấu-hạng)');
console.log('  d Cohen   diễn giải        cỡ mẫu');
for (const [effectSize, label] of [[0.3, 'nhỏ'], [0.5, 'vừa'], [0.8, 'lớn']]) {
  const n = wilcoxonSampleSize({
    effectSize, alpha: ALPHA, power: POWER, runs: RUNS, seed: SEED,
  });
  console.log(`  ${effectSize.toFixed(1)}       ${label.padEnd(15)} ${String(n).padStart(6)}`);
}
console.log(
  '\n  d tính trên CHÊNH LỆCH TỪNG CẶP (trung bình chia độ lệch chuẩn của chênh\n' +
    '  lệch), nên không phụ thuộc đơn vị — áp được cho hai chiều ISO trong [−1, 1]\n' +
    '  lẫn điểm thô 1–5. Giả định chênh lệch phân phối chuẩn là giả định KHIÊM TỐN\n' +
    '  nhất cho Wilcoxon: dữ liệu lệch chuẩn thì nó thường mạnh hơn, không yếu đi.',
);

// ───────────────────────────────────────────────────── Với n đã có thì sao

const moderate = Object.fromEntries(
  DESIGNS.map((design) => [
    design.key.trim(),
    discordantRates({ knowLayered: 0.55, knowIsolated: KNOW_ISOLATED, chance: design.chance }),
  ]),
);

console.log('\nNếu chỉ tuyển được n người thì phát hiện được đến đâu? (kịch bản vừa phải)');
console.log('  n     H1 thiết kế cũ   H1 thiết kế MỚI   H2 (d = 0,5)');
for (const n of [30, 40, 48, 60, 72, 84, 96, 108]) {
  const h1 = (rates) =>
    simulateMcnemarPower({ n, p01: rates.p01, p10: rates.p10, alpha: ALPHA, runs: RUNS, seed: SEED });
  const h2 = simulateWilcoxonPower({ n, effectSize: 0.5, alpha: ALPHA, runs: RUNS, seed: SEED });
  const mark = (p) => `${pct(p).padStart(6)}${p >= POWER ? ' ✓' : '  '}`;
  console.log(
    `  ${String(n).padStart(4)}  ${mark(h1(moderate['cũ']))}         ${mark(h1(moderate['mới']))}          ${mark(h2)}`,
  );
}

console.log(
  '\nHai điều phải ghi vào kế hoạch phân tích TRƯỚC khi thu:\n' +
    '  · Cỡ mẫu chốt và kịch bản giả định đã dùng để ra con số đó.\n' +
    '  · Phép kiểm cho từng giả thuyết. Chốt sau khi thấy dữ liệu thì bị coi là\n' +
    '    chọn kiểm định cho vừa kết quả, dù thật lòng không có ý đó.\n' +
    '\nCon số ở đây là cho MỖI phép so sánh (layered–isolated và layered–scrambled).\n' +
    'Cùng một nhóm người phục vụ cả hai, vì mỗi người đóng góp 1 cặp cho mỗi phép.',
);

const { p01, p10 } = moderate['mới'];
console.log(
  `\nĐối chiếu nhanh (thiết kế mới, vừa phải, p01 = ${p01.toFixed(3)}, p10 = ${p10.toFixed(3)}): ` +
    `lực của công thức tại n = 96 là ${pct(mcnemarPower({ n: 96, p01, p10, alpha: ALPHA }))}, ` +
    `lực thật là ${pct(simulateMcnemarPower({ n: 96, p01, p10, alpha: ALPHA, runs: RUNS, seed: SEED }))}.`,
);
