#!/usr/bin/env node
/**
 * Tính cỡ mẫu cho thiết kế trong-người (việc C1.2).
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
 */

import {
  mcnemarPower,
  mcnemarSampleSize,
  mcnemarSampleSizeBySimulation,
  simulateMcnemarPower,
  simulateWilcoxonPower,
  wilcoxonSampleSize,
} from '../src/research/power.js';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] ? Number(args[index + 1]) : fallback;
};

const POWER = flag('power', 0.8);
const ALPHA = flag('alpha', 0.05);
const RUNS = args.includes('--quick') ? 800 : 4000;
const SEED = 20260807;

const pct = (x) => `${(x * 100).toFixed(1)}%`;

console.log(
  `Cỡ mẫu cho thiết kế trong-người · α = ${ALPHA} (hai phía) · lực mong muốn ${pct(POWER)}\n` +
    `Mô phỏng ${RUNS} lượt mỗi ô, seed ${SEED} — chạy lại cho ra đúng số cũ.\n`,
);

// ────────────────────────────────────────────────────────── H1: tỉ lệ nhận đúng

/**
 * Ba kịch bản giả định, từ dè dặt đến lạc quan. `p01` là tỉ lệ người đoán **đúng
 * ở `layered` mà sai ở `isolated`**; `p10` là chiều ngược lại.
 *
 * Đây là chỗ duy nhất của cả bài tính có phần chủ quan, nên nói thẳng: chưa có
 * số liệu mồi từ pilot (việc C4.1). Ba kịch bản là để thấy cỡ mẫu nhạy đến đâu
 * với giả định — chứ không phải để chọn cái nào cho ra con số dễ chịu nhất.
 */
const SCENARIOS = [
  { name: 'dè dặt', p01: 0.25, p10: 0.15, note: 'chênh 10 điểm phần trăm' },
  { name: 'vừa phải', p01: 0.30, p10: 0.10, note: 'chênh 20 điểm phần trăm' },
  { name: 'lạc quan', p01: 0.35, p10: 0.05, note: 'chênh 30 điểm phần trăm' },
];

console.log('H1 / FR-58 — tỉ lệ nhận diện đúng (McNemar)');
console.log(
  '  kịch bản    p01   p10   chênh   công thức   MÔ PHỎNG   ghi chú',
);
for (const scenario of SCENARIOS) {
  const byFormula = mcnemarSampleSize({ ...scenario, alpha: ALPHA, power: POWER });
  const bySimulation = mcnemarSampleSizeBySimulation({
    ...scenario, alpha: ALPHA, power: POWER, runs: RUNS, seed: SEED,
  });
  console.log(
    `  ${scenario.name.padEnd(10)} ${scenario.p01.toFixed(2)}  ${scenario.p10.toFixed(2)}  ` +
      `${pct(scenario.p01 - scenario.p10).padStart(6)}   ${String(byFormula).padStart(9)}   ` +
      `${String(bySimulation).padStart(8)}   ${scenario.note}`,
  );
}

console.log(
  '\n  ⚠ Hai cột KHÔNG bằng nhau, và chênh có hướng cố định. Công thức khép kín\n' +
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

console.log('\nNếu chỉ tuyển được n người thì phát hiện được đến đâu?');
console.log('  n     H1 (vừa phải)   H2 (d = 0,5)');
for (const n of [30, 40, 48, 60, 80, 100]) {
  const h1 = simulateMcnemarPower({
    n, p01: 0.3, p10: 0.1, alpha: ALPHA, runs: RUNS, seed: SEED,
  });
  const h2 = simulateWilcoxonPower({
    n, effectSize: 0.5, alpha: ALPHA, runs: RUNS, seed: SEED,
  });
  const mark = (p) => `${pct(p).padStart(6)}${p >= POWER ? ' ✓' : '  '}`;
  console.log(`  ${String(n).padStart(4)}  ${mark(h1)}        ${mark(h2)}`);
}

console.log(
  '\nHai điều phải ghi vào kế hoạch phân tích TRƯỚC khi thu:\n' +
    '  · Cỡ mẫu chốt và kịch bản giả định đã dùng để ra con số đó.\n' +
    '  · Phép kiểm cho từng giả thuyết. Chốt sau khi thấy dữ liệu thì bị coi là\n' +
    '    chọn kiểm định cho vừa kết quả, dù thật lòng không có ý đó.\n' +
    '\nCon số ở đây là cho MỖI phép so sánh (layered–isolated và layered–scrambled).\n' +
    'Cùng một nhóm người phục vụ cả hai, vì mỗi người đóng góp 1 cặp cho mỗi phép.',
);

console.log(
  `\nĐối chiếu nhanh: lực của công thức tại n = 77 là ${pct(mcnemarPower({ n: 77, p01: 0.3, p10: 0.1, alpha: ALPHA }))}, ` +
    `lực thật là ${pct(simulateMcnemarPower({ n: 77, p01: 0.3, p10: 0.1, alpha: ALPHA, runs: RUNS, seed: SEED }))}.`,
);
