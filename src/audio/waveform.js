/**
 * Đường bao dạng sóng để **nhìn thấy sự phân lớp** (A5.1).
 *
 * Đây không phải trang trí. Luận điểm trung tâm của đề tài là soundscape phân
 * lớp **có chủ đích** khác với một đống âm rời rạc — nhưng lập luận đó chỉ nghe
 * được, không thấy được. Xếp chồng đường bao của từng lớp theo nhóm Krause cho
 * người xem (và hội đồng) thấy đúng cấu trúc mà H1 nói tới: một nền liên tục,
 * vài tín hiệu nổi lên có nhịp, một dấu ấn.
 *
 * Hàm thuần, không đụng canvas hay DOM: vẽ là việc của `layer-waveform.js`.
 */

import { KRAUSE_CLASSES } from '../domain/taxonomy.js';

/**
 * Số thùng mặc định. Đủ để thấy nhịp của tín hiệu âm, đủ nhỏ để vẽ lại 60 lần
 * mỗi giây không tốn gì — mỗi thùng là một nét dọc trên canvas.
 */
export const PEAK_BUCKETS = 240;

/** @param {Float32Array | {length: number, getChannelData(i: number): Float32Array}} source */
const samplesOf = (source) =>
  typeof source?.getChannelData === 'function' ? source.getChannelData(0) : source;

/**
 * Đường bao đỉnh: chia mẫu thành `buckets` thùng đều nhau, mỗi thùng lấy giá
 * trị nhỏ nhất và lớn nhất.
 *
 * Lấy min/max chứ không lấy trung bình: trung bình của một sóng cân bằng là 0,
 * nên vẽ ra một đường thẳng — đúng kỹ thuật, vô dụng với mắt. Min/max giữ được
 * biên độ, tức là giữ được thứ người xem cần so sánh giữa các lớp.
 *
 * @param {Float32Array | AudioBuffer} source
 * @param {{ buckets?: number }} [options]
 * @returns {{ min: number[], max: number[] }}
 */
export function peakEnvelope(source, { buckets = PEAK_BUCKETS } = {}) {
  const samples = samplesOf(source);
  const min = new Array(buckets).fill(0);
  const max = new Array(buckets).fill(0);
  const length = samples?.length ?? 0;
  if (length === 0) return { min, max };

  for (let bucket = 0; bucket < buckets; bucket += 1) {
    // Biên tính từ tỉ lệ để thùng cuối chạm đúng mẫu cuối — làm tròn theo
    // bước cố định sẽ bỏ sót phần đuôi khi số mẫu không chia hết.
    const start = Math.floor((bucket * length) / buckets);
    const end = Math.max(start + 1, Math.floor(((bucket + 1) * length) / buckets));

    let lo = 0;
    let hi = 0;
    for (let i = start; i < end && i < length; i += 1) {
      const value = samples[i];
      if (value < lo) lo = value;
      if (value > hi) hi = value;
    }
    min[bucket] = lo;
    max[bucket] = hi;
  }
  return { min, max };
}

/**
 * Mức hiệu dụng (RMS) của cả mẫu — dùng để chuẩn hoá chiều cao vẽ giữa các lớp
 * có độ to rất khác nhau.
 * @param {Float32Array | AudioBuffer} source
 */
export function rmsLevel(source) {
  const samples = samplesOf(source);
  const length = samples?.length ?? 0;
  if (length === 0) return 0;

  let sum = 0;
  for (let i = 0; i < length; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / length);
}

/**
 * Thứ tự xếp chồng, **từ dưới lên**: âm tự nhiên → âm sinh vật → âm do con
 * người. Đúng thứ tự Krause dùng khi mô tả một cảnh quan âm thanh, và cũng là
 * thứ tự trực giác: nền đất, rồi sự sống, rồi hoạt động người. Người vẽ chịu
 * trách nhiệm lật trục dọc — hàm này chỉ trả thứ tự.
 *
 * Cùng nhóm thì giữ nguyên thứ tự khai trong bản trộn; nhóm lạ xếp cuối thay vì
 * biến mất. Không đổi mảng đầu vào.
 *
 * @template {{ krauseClass?: string }} T
 * @param {T[]} layers
 * @returns {T[]}
 */
export function stackOrder(layers) {
  const rank = (layer) => {
    const index = KRAUSE_CLASSES.indexOf(layer.krauseClass);
    return index === -1 ? KRAUSE_CLASSES.length : index;
  };
  return layers
    .map((layer, index) => ({ layer, index }))
    .sort((a, b) => rank(a.layer) - rank(b.layer) || a.index - b.index)
    .map(({ layer }) => layer);
}
