/**
 * Chấm máy bản nghe thử kho âm — vòng lọc **trước** tai người (A0.1b).
 *
 * Máy không nghe được "có giống Hà Nội không"; việc đó của người. Nhưng máy đo
 * được những thứ khách quan làm một tệp không dùng được bất kể nội dung: quá
 * ngắn để loop, cắt đỉnh, im lặng quá nửa, quá nhỏ. Lọc bớt những cái đó thì
 * người chỉ còn nghe những bản đáng nghe, và nghe theo thứ tự có lý.
 *
 * Ba mức: `qua` (không có gì để chê về mặt đo), `canh-bao` (nghe được nhưng
 * biết trước điểm yếu), `loai` (đo đã đủ để bỏ). `chua-do` khi thiếu số đo —
 * không đoán.
 */

import { LOUDNESS_TARGET_LUFS } from './loudness.js';
import { LOOPING_ROLES } from '../domain/taxonomy.js';

/** Nền ngắn hơn thế này thì loop nghe ra ngay là lặp (BA §5.4.1 quy tắc 5). */
export const KEYNOTE_MIN_DURATION_S = 60;
/** Dưới mức này nền vẫn dùng được nhưng nên tìm bản dài hơn. */
export const KEYNOTE_GOOD_DURATION_S = 120;
/** Tín hiệu/dấu ấn ngắn hơn thế này thường là một cú click, không phải một âm. */
export const SIGNAL_MIN_DURATION_S = 1;
/** Dài hơn thế này phải cắt trước khi dùng làm tín hiệu. */
export const SIGNAL_MAX_DURATION_S = 600;
/** Đỉnh thật sát 0 dBTP là dấu hiệu bản gốc đã cắt đỉnh. */
export const CLIPPING_PEAK_DBTP = -0.3;
export const SILENCE_WARN_FRACTION = 0.3;
export const SILENCE_REJECT_FRACTION = 0.5;
/** Dải độ to rộng ở bản nền thường là giọng nói hay nhạc chen vào. */
export const KEYNOTE_LRA_WARN_LU = 20;
/** Khuếch đại nhiều hơn thế này thì nhiễu nền của bản gốc nổi lên. */
export const MAX_GAIN_DB = 17;
export const MIN_SAMPLE_RATE = 44100;

const PENALTY = { canhBao: 15 };

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);

/**
 * @param {object} m số đo của một bản nghe thử
 * @param {string} m.role vai Schafer của mẫu mà bản này ứng tuyển
 * @param {number} m.durationS
 * @param {number} [m.lufs] độ to tích hợp
 * @param {number} [m.lra] dải độ to, LU
 * @param {number} [m.truePeakDbtp]
 * @param {number} [m.silenceFraction] 0…1
 * @param {number} [m.sampleRate]
 * @returns {{ verdict: 'qua' | 'canh-bao' | 'loai' | 'chua-do', reasons: string[], score: number }}
 */
export function prescreenCandidate(m) {
  const required = [m.durationS, m.lufs, m.lra, m.truePeakDbtp, m.silenceFraction, m.sampleRate];
  if (!required.every(isNumber)) return { verdict: 'chua-do', reasons: ['thiếu số đo'], score: 0 };

  const reject = [];
  const warn = [];
  const isBed = LOOPING_ROLES.includes(m.role);

  if (isBed) {
    if (m.durationS < KEYNOTE_MIN_DURATION_S) {
      reject.push(`nền chỉ ${fmt(m.durationS)} s, dưới ${KEYNOTE_MIN_DURATION_S} s — loop sẽ nghe ra lặp`);
    } else if (m.durationS < KEYNOTE_GOOD_DURATION_S) {
      warn.push(`nền ${fmt(m.durationS)} s, nên tìm bản ≥ ${KEYNOTE_GOOD_DURATION_S} s`);
    }
    if (m.lra > KEYNOTE_LRA_WARN_LU) {
      warn.push(`LRA ${fmt(m.lra)} LU quá rộng cho nền — có thể lẫn giọng nói hoặc nhạc`);
    }
  } else {
    if (m.durationS < SIGNAL_MIN_DURATION_S) reject.push(`chỉ ${fmt(m.durationS)} s — quá ngắn cho một âm`);
    if (m.durationS > SIGNAL_MAX_DURATION_S) {
      warn.push(`${fmt(m.durationS)} s — phải cắt lấy đoạn dùng làm tín hiệu`);
    }
  }

  if (m.truePeakDbtp > CLIPPING_PEAK_DBTP) {
    warn.push(`đỉnh thật ${fmt(m.truePeakDbtp)} dBTP — có thể đã cắt đỉnh, nghe kỹ chỗ to nhất`);
  }
  if (m.silenceFraction > SILENCE_REJECT_FRACTION) {
    reject.push(`im lặng ${Math.round(m.silenceFraction * 100)}% thời lượng`);
  } else if (m.silenceFraction > SILENCE_WARN_FRACTION) {
    warn.push(`im lặng ${Math.round(m.silenceFraction * 100)}% thời lượng — sẽ phải cắt`);
  }
  const gain = LOUDNESS_TARGET_LUFS - m.lufs;
  if (gain > MAX_GAIN_DB) {
    warn.push(`${fmt(m.lufs)} LUFS, cần khuếch đại +${fmt(gain)} dB — nhiễu nền bản gốc sẽ lộ`);
  }
  if (m.sampleRate < MIN_SAMPLE_RATE) warn.push(`${m.sampleRate} Hz, dưới ${MIN_SAMPLE_RATE} Hz`);

  if (reject.length > 0) return { verdict: 'loai', reasons: [...reject, ...warn], score: 0 };
  if (warn.length > 0) {
    return { verdict: 'canh-bao', reasons: warn, score: Math.max(1, 100 - PENALTY.canhBao * warn.length) };
  }
  return { verdict: 'qua', reasons: [], score: 100 };
}

const VERDICT_ORDER = { qua: 0, 'canh-bao': 1, 'chua-do': 2, loai: 3 };

/**
 * Xếp thứ tự nghe: qua → cảnh báo → loại; cùng hạng thì bản khớp mô tả (⭐)
 * lên trước, rồi điểm cao hơn. Không đổi mảng đầu vào.
 * @param {Array<object>} items mỗi phần tử có số đo + `star`
 */
export function rankCandidates(items) {
  return items
    .map((item) => ({ ...item, ...prescreenCandidate(item) }))
    .sort(
      (a, b) =>
        VERDICT_ORDER[a.verdict] - VERDICT_ORDER[b.verdict] ||
        Number(Boolean(b.star)) - Number(Boolean(a.star)) ||
        b.score - a.score,
    );
}

/**
 * Tỉ lệ im lặng từ đầu ra `silencedetect` của ffmpeg. Đoạn chưa đóng ở cuối
 * tệp tính tới hết thời lượng.
 * @param {string} stderr
 * @param {number} durationS
 */
export function parseSilenceDetect(stderr, durationS) {
  if (!(durationS > 0)) return 0;
  let total = 0;
  for (const match of stderr.matchAll(/silence_duration:\s*([\d.]+)/g)) total += Number(match[1]);
  const starts = [...stderr.matchAll(/silence_start:\s*([\d.]+)/g)].length;
  const ends = [...stderr.matchAll(/silence_end:/g)].length;
  if (starts > ends) {
    const lastStart = Number([...stderr.matchAll(/silence_start:\s*([\d.]+)/g)].at(-1)[1]);
    total += Math.max(0, durationS - lastStart);
  }
  return Math.min(1, total / durationS);
}

const fmt = (value) => String(Math.round(value * 10) / 10).replace('.', ',');
