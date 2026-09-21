/**
 * Tính cỡ mẫu và lực thống kê cho thiết kế trong-người (việc C1.2).
 *
 * **Phải chạy trước khi thu dữ liệu, không phải sau.** Tính lực sau khi đã thấy
 * kết quả ("post-hoc power") là phép tính vô nghĩa: nó chỉ là hàm của p vừa đo
 * được, nên luôn nói "không có ý nghĩa vì mẫu nhỏ" khi p lớn. Cái đáng biết là
 * *trước khi thu*: với bằng này người, hiệu ứng nhỏ đến đâu thì còn phát hiện được.
 *
 * Hai đường tính, cố ý không thay thế nhau:
 *
 *  1. **Công thức khép kín** (Connor 1987) cho McNemar — nhanh, tra lại được
 *     bằng tay, đối chiếu được với bảng in trong sách.
 *  2. **Mô phỏng chạy chính hàm kiểm định** mà `npm run analyse` sẽ dùng. Công
 *     thức là xấp xỉ chuẩn, còn phép kiểm thật tự chuyển sang bản chính xác khi
 *     ít cặp bất đồng. Chỉ mô phỏng mới cho biết hai thứ đó có khớp nhau không.
 *
 * Với Wilcoxon thì không có công thức khép kín nào đáng tin cho dữ liệu không
 * chuẩn, nên chỉ dùng mô phỏng — và mô phỏng chạy đúng hàm sẽ dùng thật.
 *
 * @see `scripts/plan-sample.mjs` · `nghien-cuu/ke-hoach-phan-tich.md`
 */

import { createRng } from '../audio/trigger.js';
import { erfc, mcnemarTest, wilcoxonSignedRankTest } from './statistics.js';

const DEFAULT_ALPHA = 0.05;
const DEFAULT_POWER = 0.8;
const DEFAULT_RUNS = 2000;

/** Φ(z) — hàm phân phối tích luỹ chuẩn. */
const normalCdf = (z) => 0.5 * erfc(-z / Math.SQRT2);

// Hệ số của thuật toán AS241 (PPND16, Wichura 1988). Dùng bản này thay vì đảo
// ngược `erfc` bằng lặp: nó cho đủ 16 chữ số trực tiếp, mà cỡ mẫu thì nhân bình
// phương lên nên sai số ở đây bị khuếch đại.
const A = [3.3871328727963666080e0, 1.3314166789178437745e2, 1.9715909503065514427e3,
  1.3731693765509461125e4, 4.5921953931549871457e4, 6.7265770927008700853e4,
  3.3430575583588128105e4, 2.5090809287301226727e3];
const B = [1, 4.2313330701600911252e1, 6.8718700749205790830e2, 5.3941960214247511077e3,
  2.1213794301586595867e4, 3.9307895800092710610e4, 2.8729085735721942674e4,
  5.2264952788528545610e3];
const C = [1.42343711074968357734e0, 4.63033784615654529590e0, 5.76949722146069140550e0,
  3.64784832476320460504e0, 1.27045825245236838258e0, 2.41780725177450611770e-1,
  2.27238449892691845833e-2, 7.74545014278341407640e-4];
const D = [1, 2.05319162663775882187e0, 1.67638483018380384940e0, 6.89767334985100004550e-1,
  1.48103976427480074590e-1, 1.51986665636164571966e-2, 5.47593808499534494600e-4,
  1.05075007164441684324e-9];
const E = [6.65790464350110377720e0, 5.46378491116411436990e0, 1.78482653991729133580e0,
  2.96560571828504891230e-1, 2.65321895265761230930e-2, 1.24266094738807843860e-3,
  2.71155556874348757815e-5, 2.01033439929228813265e-7];
const F = [1, 5.99832206555887937690e-1, 1.36929880922735805310e-1, 1.48753612908506148525e-2,
  7.86869131145613259100e-4, 1.84631831751005468180e-5, 1.42151175831644588870e-7,
  2.04426310338993978564e-15];

/** Đa thức Horner. */
const poly = (coefficients, x) =>
  coefficients.reduceRight((accumulated, coefficient) => accumulated * x + coefficient);

/**
 * Φ⁻¹(p) — phân vị chuẩn nghịch đảo.
 *
 * @param {number} p trong khoảng mở (0, 1)
 * @returns {number}
 */
export function inverseNormalCdf(p) {
  if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0 || p >= 1) {
    throw new Error(`Φ⁻¹ chỉ nhận xác suất trong khoảng mở (0, 1), nhận được ${p}.`);
  }
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return (q * poly(A, r)) / poly(B, r);
  }
  const r = Math.sqrt(-Math.log(q < 0 ? p : 1 - p));
  const value =
    r <= 5 ? poly(C, r - 1.6) / poly(D, r - 1.6) : poly(E, r - 5) / poly(F, r - 5);
  return q < 0 ? -value : value;
}

/**
 * Kiểm hai tỉ lệ bất đồng có dùng được không.
 *
 * `requireEffect` chỉ bật cho phép tính cỡ mẫu và lực. Mô phỏng thì **phải chạy
 * được với p01 = p10**: đó chính là giả thuyết không, và mô phỏng ở đó là phép
 * kiểm sai số loại I — thứ đáng đo nhất trong cả module này.
 */
function checkDiscordant(p01, p10, { requireEffect = true } = {}) {
  for (const [name, value] of [['p01', p01], ['p10', p10]]) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value >= 1) {
      throw new Error(`${name} phải là tỉ lệ trong khoảng mở (0, 1), nhận được ${value}.`);
    }
  }
  const discordantRate = p01 + p10;
  if (discordantRate >= 1) {
    throw new Error(
      `p01 + p10 = ${discordantRate.toFixed(3)} ≥ 1 — hai tỉ lệ bất đồng cộng lại không thể ` +
        'vượt quá toàn bộ mẫu.',
    );
  }
  const difference = Math.abs(p01 - p10);
  if (requireEffect && difference === 0) {
    throw new Error(
      'p01 = p10 nghĩa là giả định KHÔNG có hiệu ứng nào. Không cỡ mẫu nào phát hiện được ' +
        'một hiệu ứng bằng 0 — phải giả định một mức chênh nhỏ nhất còn đáng quan tâm.',
    );
  }
  return { discordantRate, difference };
}

/**
 * Cỡ mẫu McNemar theo Connor (1987).
 *
 * `p01`, `p10` là tỉ lệ **cặp bất đồng** theo hai chiều — không phải tỉ lệ đúng
 * của từng điều kiện. McNemar chỉ dùng các cặp bất đồng, nên cặp nào cùng đúng
 * hoặc cùng sai ở hai điều kiện đều không đóng góp gì; giả định sai chỗ này là
 * chỗ hay hỏng nhất của một bài tính cỡ mẫu.
 *
 * @returns {number} số **cặp** cần có, đã làm tròn lên
 */
export function mcnemarSampleSize({
  p01,
  p10,
  alpha = DEFAULT_ALPHA,
  power = DEFAULT_POWER,
} = {}) {
  const { discordantRate, difference } = checkDiscordant(p01, p10);
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const zBeta = inverseNormalCdf(power);
  const numerator =
    zAlpha * Math.sqrt(discordantRate) +
    zBeta * Math.sqrt(discordantRate - difference * difference);
  return Math.ceil((numerator * numerator) / (difference * difference));
}

/** Chiều ngược của `mcnemarSampleSize`: có sẵn n thì lực bằng bao nhiêu. */
export function mcnemarPower({ n, p01, p10, alpha = DEFAULT_ALPHA } = {}) {
  const { discordantRate, difference } = checkDiscordant(p01, p10);
  const zAlpha = inverseNormalCdf(1 - alpha / 2);
  const zBeta =
    (Math.sqrt(n) * difference - zAlpha * Math.sqrt(discordantRate)) /
    Math.sqrt(discordantRate - difference * difference);
  return normalCdf(zBeta);
}

/**
 * Lực của McNemar bằng mô phỏng, chạy **chính** `mcnemarTest`.
 *
 * Phần còn lại của mẫu (1 − p01 − p10) là các cặp cùng đúng hoặc cùng sai; chia
 * đôi thế nào cũng không ảnh hưởng kết quả vì McNemar bỏ qua chúng — nhưng vẫn
 * sinh ra cho đủ n cặp, để `pairs` truyền vào giống hệt dữ liệu thật.
 */
export function simulateMcnemarPower({
  n,
  p01,
  p10,
  alpha = DEFAULT_ALPHA,
  runs = DEFAULT_RUNS,
  seed = 20260807,
} = {}) {
  checkDiscordant(p01, p10, { requireEffect: false });
  const rng = createRng(seed);
  let significant = 0;

  for (let run = 0; run < runs; run += 1) {
    const pairs = [];
    for (let i = 0; i < n; i += 1) {
      const u = rng();
      if (u < p01) pairs.push({ a: false, b: true });
      else if (u < p01 + p10) pairs.push({ a: true, b: false });
      else if (u < p01 + p10 + (1 - p01 - p10) / 2) pairs.push({ a: true, b: true });
      else pairs.push({ a: false, b: false });
    }
    if (mcnemarTest(pairs, { alpha }).significant) significant += 1;
  }
  return significant / runs;
}

/**
 * Cỡ mẫu McNemar bằng mô phỏng — **con số dùng để tuyển người**.
 *
 * Lớn hơn `mcnemarSampleSize` một cách có hệ thống ở quy mô của đề tài, vì phép
 * kiểm thật thận trọng hơn xấp xỉ chuẩn mà công thức giả định (đo được: sai số
 * loại I thực tế 0,024–0,032 chứ không phải 0,05). Lấy theo công thức là tuyển
 * thiếu người, và chỉ biết điều đó sau khi đã thu xong.
 */
export function mcnemarSampleSizeBySimulation({
  p01,
  p10,
  alpha = DEFAULT_ALPHA,
  power = DEFAULT_POWER,
  runs = DEFAULT_RUNS,
  seed = 20260807,
  maxN = 1000,
} = {}) {
  checkDiscordant(p01, p10);
  // Khởi đầu từ đáp số của công thức: nó là cận dưới đáng tin, nên không cần dò
  // từ 6 lên.
  const start = mcnemarSampleSize({ p01, p10, alpha, power });
  for (let n = start; n <= maxN; n += 1) {
    if (simulateMcnemarPower({ n, p01, p10, alpha, runs, seed }) >= power) return n;
  }
  throw new Error(
    `Không đạt lực ${power} với n ≤ ${maxN}. Hiệu ứng giả định quá nhỏ so với quy mô đề tài.`,
  );
}

/** Một cặp số chuẩn độc lập theo phép biến đổi Box–Muller. */
function normalPair(rng) {
  // `Math.log(0)` là −∞; đẩy u1 ra khỏi 0 thay vì bỏ mẫu, để chuỗi số vẫn xác định.
  const u1 = Math.max(rng(), Number.EPSILON);
  const u2 = rng();
  const radius = Math.sqrt(-2 * Math.log(u1));
  const angle = 2 * Math.PI * u2;
  return [radius * Math.cos(angle), radius * Math.sin(angle)];
}

/**
 * Lực của Wilcoxon bằng mô phỏng, chạy **chính** `wilcoxonSignedRankTest`.
 *
 * `effectSize` là d của Cohen trên **chênh lệch từng cặp**: trung bình chênh lệch
 * chia độ lệch chuẩn của chênh lệch. Chọn cách phát biểu này vì nó không phụ
 * thuộc đơn vị, nên áp được cho cả hai chiều ISO dù chúng nằm trong [−1, 1] còn
 * điểm thô nằm trong 1–5.
 *
 * Giả định chênh lệch phân phối chuẩn. Đó là giả định **có lợi cho Wilcoxon một
 * cách khiêm tốn nhất**: với dữ liệu chuẩn, Wilcoxon kém t-test khoảng 4,5% hiệu
 * suất; dữ liệu lệch chuẩn thì Wilcoxon thường mạnh hơn, không yếu đi. Nên con
 * số ở đây là cận dưới thận trọng.
 */
export function simulateWilcoxonPower({
  n,
  effectSize,
  alpha = DEFAULT_ALPHA,
  runs = DEFAULT_RUNS,
  seed = 20260807,
} = {}) {
  const rng = createRng(seed);
  let significant = 0;

  for (let run = 0; run < runs; run += 1) {
    const pairs = [];
    while (pairs.length < n) {
      for (const z of normalPair(rng)) {
        if (pairs.length < n) pairs.push({ a: effectSize + z, b: 0 });
      }
    }
    if (wilcoxonSignedRankTest(pairs, { alpha }).significant) significant += 1;
  }
  return significant / runs;
}

/**
 * Cỡ mẫu nhỏ nhất đạt lực mong muốn cho Wilcoxon — dò tăng dần bằng mô phỏng.
 *
 * Dò tăng dần chứ không chia đôi: lực mô phỏng có nhiễu Monte Carlo nên không
 * đơn điệu tuyệt đối, mà chia đôi thì giả định đơn điệu. Dò tăng dần chậm hơn
 * nhưng cho đúng cái cần: **n nhỏ nhất** đạt ngưỡng.
 */
export function wilcoxonSampleSize({
  effectSize,
  alpha = DEFAULT_ALPHA,
  power = DEFAULT_POWER,
  runs = DEFAULT_RUNS,
  seed = 20260807,
  maxN = 500,
} = {}) {
  if (typeof effectSize !== 'number' || !Number.isFinite(effectSize) || effectSize === 0) {
    throw new Error(
      `effectSize = ${effectSize}: không cỡ mẫu nào phát hiện được một hiệu ứng bằng 0. ` +
        'Phải giả định mức chênh nhỏ nhất còn đáng quan tâm.',
    );
  }
  for (let n = 6; n <= maxN; n += 1) {
    if (simulateWilcoxonPower({ n, effectSize, alpha, runs, seed }) >= power) return n;
  }
  throw new Error(
    `Không đạt lực ${power} với n ≤ ${maxN} khi d = ${effectSize}. Hiệu ứng giả định quá nhỏ ` +
      'so với quy mô đề tài — cần xem lại mức chênh nhỏ nhất còn đáng quan tâm.',
  );
}
