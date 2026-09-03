/**
 * Tìm điểm loop liền mạch cho lớp âm nền (keynote).
 *
 * Vì sao cần: âm nền phải lặp vô hạn mà người nghe không phát hiện chỗ nối.
 * Hai nguyên nhân gây tiếng "cụp" ở chỗ nối:
 *   1. Biên độ ở hai đầu khác 0 → nhảy bậc đột ngột.
 *   2. Hai đầu cắt không ngược chiều nhau → đảo pha ngay tại chỗ nối.
 * Module này khử cả hai bằng cách chốt hai đầu vào điểm cắt không **cùng chiều
 * đi lên**. Riêng khoảng đệm của bộ mã hoá MP3 thì phải xử lý ở tầng đóng gói
 * tệp, không xử lý được ở đây (xem NFR-33).
 */

const DEFAULT_SILENCE_THRESHOLD = 0.005;
const MIN_LOOP_SAMPLES = 2;

/** Điểm cắt không đi lên: mẫu này ≤ 0 và mẫu kế tiếp > 0. */
function isAscendingZeroCrossing(samples, index) {
  return samples[index] <= 0 && samples[index + 1] > 0;
}

/**
 * Vị trí mẫu kiểu số thực nơi tín hiệu thật sự cắt qua 0, nội suy tuyến tính
 * giữa hai mẫu kề nhau. Chốt vào chỉ số nguyên để lại dư tới ~0.046 ở
 * 440 Hz/48 kHz — đủ lớn để nghe thành tiếng "cụp" mỗi vòng lặp.
 */
function interpolateCrossing(samples, index) {
  const before = samples[index];
  const after = samples[index + 1];
  const rise = after - before;
  if (rise === 0) return index;
  return index + -before / rise;
}

/** Điểm cắt không đi lên đầu tiên tính từ `from` trở đi. */
function nextAscendingCrossing(samples, from, until) {
  for (let i = from; i < until - 1; i += 1) {
    if (isAscendingZeroCrossing(samples, i)) return i;
  }
  return -1;
}

/** Điểm cắt không đi lên cuối cùng tính từ `from` trở về trước. */
function previousAscendingCrossing(samples, from, until) {
  for (let i = from; i > until; i -= 1) {
    if (isAscendingZeroCrossing(samples, i)) return i;
  }
  return -1;
}

/**
 * @typedef {object} LoopPoints
 * @property {number} startSample chỉ số mẫu bắt đầu loop
 * @property {number} endSample chỉ số mẫu kết thúc loop (không phát mẫu này)
 * @property {number} startS thời điểm bắt đầu, giây
 * @property {number} endS thời điểm kết thúc, giây
 */

/**
 * @param {Float32Array} samples dữ liệu một kênh
 * @param {number} sampleRate tần số lấy mẫu
 * @param {object} [options]
 * @param {number} [options.silenceThreshold] biên độ dưới mức này coi là im lặng
 * @param {number} [options.maxDurationS] giới hạn độ dài loop, giây
 * @returns {LoopPoints | null} null khi bản ghi im lặng hoặc quá ngắn
 */
export function findLoopPoints(samples, sampleRate, options = {}) {
  const { silenceThreshold = DEFAULT_SILENCE_THRESHOLD, maxDurationS } = options;

  if (samples.length < MIN_LOOP_SAMPLES) return null;

  let firstSound = -1;
  let lastSound = -1;
  for (let i = 0; i < samples.length; i += 1) {
    if (Math.abs(samples[i]) > silenceThreshold) {
      if (firstSound === -1) firstSound = i;
      lastSound = i;
    }
  }
  if (firstSound === -1) return null;

  const startSample = nextAscendingCrossing(samples, firstSound, lastSound);
  if (startSample === -1) return null;

  // Muốn loop ngắn hơn thì phải LÙI về điểm cắt không gần nhất, không được cắt
  // cứng ở mốc thời gian: mốc tuỳ ý thường rơi vào giữa dốc sóng và tạo bước
  // nhảy nghe rõ (đo thực tế: 1.13e-2 so với 1e-12 khi chốt đúng).
  const cap =
    maxDurationS === undefined
      ? lastSound
      : Math.min(lastSound, startSample + Math.floor(maxDurationS * sampleRate));

  const endSample = previousAscendingCrossing(samples, cap, startSample);
  if (endSample === -1 || endSample - startSample < MIN_LOOP_SAMPLES) return null;

  return {
    startSample,
    endSample,
    startS: interpolateCrossing(samples, startSample) / sampleRate,
    endS: interpolateCrossing(samples, endSample) / sampleRate,
  };
}

/** Ngưỡng đạt cho hai phép đo chất lượng loop. */
export const SEAM_JUMP_LIMIT = 0.001;
export const TAIL_SILENCE_LIMIT_MS = 5;

/** Biên độ tại thời điểm phân số — đúng cách trình duyệt nội suy loopStart/loopEnd. */
function amplitudeAt(samples, sampleRate, timeS) {
  const position = timeS * sampleRate;
  const index = Math.min(Math.floor(position), samples.length - 1);
  const next = Math.min(index + 1, samples.length - 1);
  const fraction = position - index;
  return samples[index] * (1 - fraction) + samples[next] * fraction;
}

/**
 * Chấm chất lượng một điểm loop bằng **hai** phép đo cho **hai** kiểu lỗi khác nhau.
 *
 *   1. `seamJump` — bước nhảy biên độ tại chỗ nối. Gây tiếng "cụp".
 *   2. `tailSilenceMs` — quãng im lặng ngay trước điểm kết. Gây khe hở nghe rõ
 *      mỗi vòng lặp, thường do khoảng đệm mà bộ mã hoá MP3 chèn vào.
 *
 * Phép đo thứ nhất KHÔNG bắt được kiểu lỗi thứ hai: khi cuối tệp là im lặng thì
 * biên độ hai đầu đều xấp xỉ 0, bước nhảy bằng 0, mà tai vẫn nghe ra quãng lặng.
 * Đây là lý do phải có cả hai.
 *
 * @param {Float32Array} samples
 * @param {number} sampleRate
 * @param {{startS: number, endS: number}} points
 * @param {object} [options]
 * @param {number} [options.silenceThreshold]
 * @param {number} [options.tailWindowMs] bề rộng cửa sổ soi phần cuối
 */
export function measureLoopQuality(samples, sampleRate, points, options = {}) {
  const { silenceThreshold = DEFAULT_SILENCE_THRESHOLD, tailWindowMs = 250 } = options;
  const { startS, endS } = points;

  const seamJump = Math.abs(
    amplitudeAt(samples, sampleRate, endS) - amplitudeAt(samples, sampleRate, startS),
  );

  // Đi ngược từ điểm kết về trước, đếm xem im lặng kéo dài bao nhiêu.
  const endSample = Math.min(Math.floor(endS * sampleRate), samples.length - 1);
  const windowSamples = Math.round((tailWindowMs / 1000) * sampleRate);
  const floor = Math.max(0, endSample - windowSamples);
  let silentSamples = 0;
  for (let i = endSample; i >= floor; i -= 1) {
    if (Math.abs(samples[i]) > silenceThreshold) break;
    silentSamples += 1;
  }
  const tailSilenceMs = (silentSamples / sampleRate) * 1000;

  return {
    seamJump,
    tailSilenceMs,
    seamless: seamJump < SEAM_JUMP_LIMIT && tailSilenceMs < TAIL_SILENCE_LIMIT_MS,
  };
}
