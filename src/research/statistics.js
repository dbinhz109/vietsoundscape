/**
 * Kiểm định thống kê cho H1 và H2 (BA §10.1).
 *
 * ## Vì sao module này tồn tại
 *
 * Thuyết minh gốc nói sẽ dùng *"thống kê mô tả, so sánh tỉ lệ và điểm trung
 * bình"*. Nhưng **thống kê mô tả không chứng minh được ý nghĩa thống kê**, mà H1
 * lại phát biểu là "cao hơn **có ý nghĩa**". Nói cách khác: làm theo đúng thuyết
 * minh gốc thì không kiểm được chính giả thuyết của nó.
 *
 * | Giả thuyết | Dữ liệu | Kiểm định |
 * |---|---|---|
 * | H1 — tỉ lệ nhận diện đúng | nhị phân, cùng người nghe cả hai điều kiện | **McNemar** |
 * | H2 — điểm cảm nhận | thứ bậc (Likert) | **Wilcoxon signed-rank** |
 *
 * Không dùng t-test cho Likert đơn mục: thang thứ bậc không có khoảng cách đều,
 * nên "trung bình" của nó không mang nghĩa số học.
 *
 * ## Hai chỗ dễ báo sai "có ý nghĩa"
 *
 * 1. **Xấp xỉ chi bình phương khi quá ít cặp bất đồng.** Bản không hiệu chỉnh cho
 *    p nhỏ nhất, nên là bản dễ dùng nhất để tự lừa mình. Module tự chọn kiểm định
 *    **chính xác** khi `b + c < 25`.
 * 2. **Bỏ cặp không chênh lệch trong Wilcoxon rồi báo n như cũ.** Số bị bỏ được
 *    trả về ở trường `dropped` để bắt buộc phải nêu trong báo cáo.
 */

const EXACT_THRESHOLD_DISCORDANT = 25;
const EXACT_THRESHOLD_N = 25;
const DEFAULT_ALPHA = 0.05;

/**
 * Hàm sai số bù — dùng để lấy p từ phân vị chuẩn.
 * Xấp xỉ của Numerical Recipes, sai số tương đối < 1,2e-7. Đủ chính xác cho việc
 * báo p ở mức ba chữ số.
 */
export function erfc(x) {
  const z = Math.abs(x);
  const t = 2 / (2 + z);
  const ty = 4 * t - 2;
  const coefficients = [
    -1.3026537197817094, 6.4196979235649026e-1, 1.9476473204185836e-2, -9.561514786808631e-3,
    -9.46595344482036e-4, 3.66839497852761e-4, 4.2523324806907e-5, -2.0278578112534e-5,
    -1.624290004647e-6, 1.303655835580e-6, 1.5626441722e-8, -8.5238095915e-8,
    6.529054439e-9, 5.059343495e-9, -9.91364156e-10, -2.27365122e-10,
    9.6467911e-11, 2.394038e-12, -6.886027e-12, 8.94487e-13, 3.13092e-13,
    -1.12708e-13, 3.81e-16, 7.106e-15,
  ];
  let d = 0;
  let dd = 0;
  for (let j = coefficients.length - 1; j > 0; j -= 1) {
    const tmp = d;
    d = ty * d - dd + coefficients[j];
    dd = tmp;
  }
  const result = t * Math.exp(-z * z + 0.5 * (coefficients[0] + ty * d) - dd);
  return x >= 0 ? result : 2 - result;
}

/** p hai phía từ phân vị chuẩn z. */
const normalTwoSidedP = (z) => Math.min(1, erfc(Math.abs(z) / Math.SQRT2));

/**
 * p hai phía của kiểm định nhị thức với p = 0,5 — nền của McNemar chính xác.
 *
 * @param {number} k số lần thành công
 * @param {number} n số phép thử
 * @returns {number}
 */
export function binomialTwoSidedP(k, n) {
  if (n <= 0) return 1;

  // Tính theo logarit để C(n, i) không tràn số khi n lớn.
  const logFactorial = [0];
  for (let i = 1; i <= n; i += 1) logFactorial[i] = logFactorial[i - 1] + Math.log(i);
  const logChoose = (a, b) => logFactorial[a] - logFactorial[b] - logFactorial[a - b];

  const tail = Math.min(k, n - k);
  let cumulative = 0;
  for (let i = 0; i <= tail; i += 1) {
    cumulative += Math.exp(logChoose(n, i) - n * Math.LN2);
  }
  return Math.min(1, 2 * cumulative);
}

/**
 * Kiểm định McNemar cho H1.
 *
 * Chỉ **cặp bất đồng** mang thông tin: người đoán đúng ở cả hai điều kiện, hay
 * sai ở cả hai, đều không phân biệt được hai điều kiện. Đây cũng chính là lý do
 * "so sánh tỉ lệ đúng" của thuyết minh gốc không thay thế được — nó trộn lẫn
 * người phân biệt được với người không.
 *
 * @param {{a: boolean, b: boolean}[]} pairs
 * @param {{method?: 'auto'|'exact'|'chi-square'|'chi-square-corrected', alpha?: number}} [options]
 */
export function mcnemarTest(pairs, options = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('Không có cặp nào để kiểm định McNemar.');
  }
  const alpha = options.alpha ?? DEFAULT_ALPHA;

  const b = pairs.filter((pair) => pair.a === true && pair.b === false).length;
  const c = pairs.filter((pair) => pair.a === false && pair.b === true).length;
  const discordant = b + c;

  const base = {
    pairs: pairs.length,
    b,
    c,
    n: discordant,
    favours: b === c ? null : b > c ? 'a' : 'b',
    alpha,
  };

  if (discordant === 0) {
    return {
      ...base,
      chiSquare: 0,
      p: 1,
      method: 'none',
      significant: false,
      note:
        `Không có cặp bất đồng nào trong ${pairs.length} cặp: mọi người tham gia cho cùng kết ` +
        'quả ở hai điều kiện. McNemar không có gì để kiểm — hai điều kiện không phân biệt được ' +
        'bằng dữ liệu này. Đây là kết quả thật, không phải lỗi.',
    };
  }

  const requested = options.method ?? 'auto';
  const method =
    requested === 'auto'
      ? discordant < EXACT_THRESHOLD_DISCORDANT
        ? 'exact'
        : 'chi-square-corrected'
      : requested;

  let chiSquare;
  let p;
  if (method === 'exact') {
    chiSquare = (b - c) ** 2 / discordant;
    p = binomialTwoSidedP(Math.min(b, c), discordant);
  } else {
    const numerator =
      method === 'chi-square-corrected' ? (Math.abs(b - c) - 1) ** 2 : (b - c) ** 2;
    chiSquare = Math.max(0, numerator) / discordant;
    // Chi bình phương với 1 bậc tự do là bình phương của phân vị chuẩn.
    p = normalTwoSidedP(Math.sqrt(chiSquare));
  }

  return { ...base, chiSquare, p, method, significant: p < alpha };
}

/**
 * Số cách chọn tập con của {1..n} có tổng hạng bằng s — **phân bố chính xác của
 * W⁺ dưới giả thuyết không**. Quy hoạch động, tránh liệt kê 2^n tập con.
 *
 * Xuất ra ngoài vì `effect-size.js` cần chính phân bố này để dựng khoảng tin cậy
 * Hodges–Lehmann bằng công thức cắt đuôi. Dựng lại ở đó là mở đường cho hai bản
 * lệch nhau.
 *
 * @param {number} n số chênh lệch khác 0
 * @returns {Float64Array} `counts[s]` = số tập con có tổng hạng bằng s
 */
export function signedRankCounts(n) {
  const max = (n * (n + 1)) / 2;
  const counts = new Float64Array(max + 1);
  counts[0] = 1;
  for (let rank = 1; rank <= n; rank += 1) {
    for (let s = max; s >= rank; s -= 1) counts[s] += counts[s - rank];
  }
  return counts;
}

/**
 * Kiểm định Wilcoxon signed-rank cho H2.
 *
 * @param {{a: number, b: number}[]} pairs
 * @param {{method?: 'auto'|'exact'|'normal-approximation', alpha?: number}} [options]
 */
export function wilcoxonSignedRankTest(pairs, options = {}) {
  if (!Array.isArray(pairs) || pairs.length === 0) {
    throw new Error('Không có cặp nào để kiểm định Wilcoxon.');
  }
  const alpha = options.alpha ?? DEFAULT_ALPHA;

  const differences = pairs.map((pair) => pair.a - pair.b);
  const nonZero = differences.filter((d) => d !== 0);
  const dropped = differences.length - nonZero.length;
  const n = nonZero.length;

  if (n === 0) {
    return {
      pairs: pairs.length,
      n: 0,
      dropped,
      wPlus: 0,
      wMinus: 0,
      w: 0,
      p: 1,
      method: 'none',
      favours: null,
      significant: false,
      tiedGroups: [],
      alpha,
      note:
        `Cả ${pairs.length} cặp đều không có chênh lệch. Wilcoxon bỏ hết, không còn gì để ` +
        'kiểm. Nếu điều này xảy ra thật thì thang đo không phân biệt được hai điều kiện — ' +
        'nên xem lại bộ câu hỏi trước khi kết luận về H2.',
    };
  }

  // Hạng của |d|, chênh lệch bằng nhau thì chia hạng trung bình. Bỏ qua bước này
  // thì W lệch và p sai theo, nhất là với Likert vì thang chỉ có 5 mức nên rất
  // nhiều giá trị trùng nhau.
  const indexed = nonZero
    .map((d, index) => ({ d, abs: Math.abs(d), index }))
    .sort((x, y) => x.abs - y.abs);

  const ranks = new Array(n);
  const tiedGroups = [];
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && indexed[j + 1].abs === indexed[i].abs) j += 1;
    const averageRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) ranks[indexed[k].index] = averageRank;
    if (j > i) tiedGroups.push(j - i + 1);
    i = j + 1;
  }

  let wPlus = 0;
  let wMinus = 0;
  nonZero.forEach((d, index) => {
    if (d > 0) wPlus += ranks[index];
    else wMinus += ranks[index];
  });
  const w = Math.min(wPlus, wMinus);

  const requested = options.method ?? 'auto';
  const canUseExact = tiedGroups.length === 0 || requested === 'exact';
  const method =
    requested === 'auto'
      ? n < EXACT_THRESHOLD_N && tiedGroups.length === 0
        ? 'exact'
        : 'normal-approximation'
      : requested;

  let p;
  let note;
  if (method === 'exact' && canUseExact) {
    const counts = signedRankCounts(n);
    const total = 2 ** n;
    let cumulative = 0;
    for (let s = 0; s <= Math.floor(w); s += 1) cumulative += counts[s];
    p = Math.min(1, (2 * cumulative) / total);

    // Phân bố chính xác của W+ dựng trên hạng 1..n **không trùng nhau**. Có
    // chênh lệch trùng thì phân bố thật khác đi, nên p ở đây chỉ là xấp xỉ. Im
    // lặng chỗ này là báo một con số chắc chắn hơn thực tế — với Likert 5 mức
    // thì trùng nhau là chuyện thường, không phải ngoại lệ.
    if (tiedGroups.length > 0) {
      note =
        `Có ${tiedGroups.length} nhóm chênh lệch trùng nhau (${tiedGroups.join(', ')} giá trị). ` +
        'Phân bố chính xác được dựng trên hạng không trùng, nên p này là xấp xỉ chứ không ' +
        'chính xác. Với thang Likert nên dùng xấp xỉ chuẩn — nó có hiệu chỉnh phương sai cho ' +
        'phần trùng nhau.';
    }
  } else {
    const mean = (n * (n + 1)) / 4;
    // Hiệu chỉnh phương sai cho các nhóm chênh lệch bằng nhau.
    const tieCorrection = tiedGroups.reduce((sum, t) => sum + (t ** 3 - t), 0) / 48;
    const variance = (n * (n + 1) * (2 * n + 1)) / 24 - tieCorrection;
    const z = variance > 0 ? (Math.abs(wPlus - mean) - 0.5) / Math.sqrt(variance) : 0;
    p = normalTwoSidedP(Math.max(0, z));
  }

  return {
    pairs: pairs.length,
    n,
    dropped,
    wPlus,
    wMinus,
    w,
    p,
    method,
    favours: wPlus === wMinus ? null : wPlus > wMinus ? 'a' : 'b',
    significant: p < alpha,
    tiedGroups,
    alpha,
    ...(note ? { note } : {}),
  };
}

/**
 * Biến log lượt nghe thành danh sách cặp cho kiểm định trong-người.
 *
 * **Quyết định phương pháp được ghi thẳng ở đây:** thiết kế trong-người với 4 địa
 * điểm và 3 điều kiện thì mỗi người có **một điều kiện xuất hiện hai lần** (xem
 * `assignment.js`). Cặp lấy **lượt đầu** của mỗi điều kiện, để hiệu ứng luyện tập
 * rơi đều lên hai điều kiện đang so sánh. Lượt thừa không bị bỏ đi — nó vẫn dùng
 * được cho phân tích không ghép cặp, nhưng không được đưa vào McNemar vì làm thế
 * là đếm một người hai lần.
 *
 * @param {object[]} trials
 * @param {{conditionA: string, conditionB: string, field: string, withReport?: boolean}} options
 */
export function pairResponses(trials, { conditionA, conditionB, field, withReport = false }) {
  /** @type {Map<number|string, Record<string, object>>} */
  const firstByParticipant = new Map();

  for (const trial of trials) {
    if (trial.condition !== conditionA && trial.condition !== conditionB) continue;

    const key = trial.participant_index;
    if (!firstByParticipant.has(key)) firstByParticipant.set(key, {});
    const seen = firstByParticipant.get(key);

    const existing = seen[trial.condition];
    if (!existing || (trial.order ?? 0) < (existing.order ?? 0)) seen[trial.condition] = trial;
  }

  const pairs = [];
  const incomplete = [];

  for (const [participant, seen] of firstByParticipant) {
    const first = seen[conditionA];
    const second = seen[conditionB];
    if (!first || !second) {
      incomplete.push(participant);
      continue;
    }
    for (const trial of [first, second]) {
      if (!(field in trial)) {
        throw new Error(
          `Lượt nghe của người ${participant} điều kiện "${trial.condition}" không có trường ` +
            `"${field}". Không suy ra được giá trị thiếu — kiểm lại phần ghi log của chế độ thực nghiệm.`,
        );
      }
    }
    pairs.push({ participant_index: participant, a: first[field], b: second[field] });
  }

  pairs.sort((x, y) => (x.participant_index > y.participant_index ? 1 : -1));
  return withReport ? { pairs, incomplete: incomplete.sort() } : pairs;
}
