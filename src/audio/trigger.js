/**
 * Lịch phát cho lớp "tín hiệu âm" (sound signal) — tiếng rao, chuông, còi.
 *
 * Vì sao phải có seed: lớp tín hiệu phát lặp lại không đều để nghe tự nhiên
 * (FR-15). Nhưng nếu dùng Math.random thì mỗi người tham gia thực nghiệm nghe
 * một chuỗi khác nhau, và thực nghiệm mất tính kiểm soát. Có seed thì
 * `recipe + seed` luôn cho ra đúng một chuỗi thời điểm, và kích thích thực
 * nghiệm kết xuất được thành tệp cố định (FR-52).
 */

/**
 * Bộ sinh số giả ngẫu nhiên mulberry32 — nhỏ, xác định, đủ đều cho việc này.
 * @param {number} seed
 * @returns {() => number} hàm trả về số trong nửa khoảng [0, 1)
 */
export function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Sinh lịch thời điểm phát cho một lớp tín hiệu âm.
 *
 * @param {object} config
 * @param {number} config.seed
 * @param {number} config.meanIntervalS khoảng cách trung bình giữa hai lần phát, giây
 * @param {number} config.jitterS biên xê dịch quanh khoảng cách trung bình, giây
 * @param {number} config.durationS tổng thời lượng cần lấp, giây
 * @returns {number[]} danh sách thời điểm phát, tính từ 0, tăng dần
 */
export function scheduleTriggers({ seed, meanIntervalS, jitterS, durationS }) {
  const rng = createRng(seed);
  const times = [];
  let cursor = 0;

  while (cursor < durationS) {
    const offset = jitterS === 0 ? 0 : (rng() * 2 - 1) * jitterS;
    cursor += meanIntervalS + offset;
    if (cursor < durationS) times.push(cursor);
  }

  return times;
}
