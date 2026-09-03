import { describe, expect, test } from 'vitest';
import { findLoopPoints, measureLoopQuality } from './loop.js';

const SAMPLE_RATE = 48000;

/** Sóng sin thuần, có đệm im lặng hai đầu — mô phỏng bản ghi thật chưa cắt. */
function sineWithSilence({ freq = 440, toneS = 1, padS = 0.25, amp = 0.8 } = {}) {
  const pad = Math.round(padS * SAMPLE_RATE);
  const tone = Math.round(toneS * SAMPLE_RATE);
  const samples = new Float32Array(pad * 2 + tone);
  for (let i = 0; i < tone; i += 1) {
    samples[pad + i] = amp * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
  }
  return samples;
}

const isAscendingZeroCrossing = (samples, index) =>
  samples[index] <= 0 && samples[index + 1] > 0;

/**
 * Biên độ tại một thời điểm phân số — chính là cách trình duyệt nội suy khi
 * `loopStart`/`loopEnd` không rơi đúng vào ranh giới mẫu.
 */
function amplitudeAt(samples, timeS) {
  const position = timeS * SAMPLE_RATE;
  const index = Math.floor(position);
  const fraction = position - index;
  return samples[index] * (1 - fraction) + samples[index + 1] * fraction;
}

describe('findLoopPoints', () => {
  test('cắt bỏ phần im lặng ở hai đầu', () => {
    const samples = sineWithSilence();
    const { startS, endS } = findLoopPoints(samples, SAMPLE_RATE);

    expect(startS).toBeGreaterThan(0.2);
    expect(endS).toBeLessThan(1.3);
  });

  test('hai đầu loop nằm đúng tại điểm cắt không, chính xác dưới mức một mẫu', () => {
    // Chốt vào chỉ số mẫu nguyên để lại dư tới ~0.046 ở 440 Hz/48 kHz — nghe được.
    // loopStart/loopEnd nhận giây kiểu số thực nên phải nội suy về đúng điểm cắt không.
    const samples = sineWithSilence();
    const { startS, endS } = findLoopPoints(samples, SAMPLE_RATE);

    expect(Math.abs(amplitudeAt(samples, startS))).toBeLessThan(0.001);
    expect(Math.abs(amplitudeAt(samples, endS))).toBeLessThan(0.001);
  });

  test('hai đầu cùng chiều đi lên — nếu ngược chiều thì chỗ nối bị đảo pha, nghe thành tiếng cụp', () => {
    const samples = sineWithSilence();
    const { startSample, endSample } = findLoopPoints(samples, SAMPLE_RATE);

    expect(isAscendingZeroCrossing(samples, startSample)).toBe(true);
    expect(isAscendingZeroCrossing(samples, endSample)).toBe(true);
  });

  test('bước nhảy biên độ tại chỗ nối gần như bằng 0', () => {
    const samples = sineWithSilence();
    const { startS, endS } = findLoopPoints(samples, SAMPLE_RATE);

    const seamJump = Math.abs(amplitudeAt(samples, endS) - amplitudeAt(samples, startS));
    expect(seamJump).toBeLessThan(0.001);
  });

  test('thời điểm phân số nằm trong khoảng một mẫu kể từ điểm cắt không', () => {
    const samples = sineWithSilence();
    const { startSample, endSample, startS, endS } = findLoopPoints(samples, SAMPLE_RATE);

    expect(startS).toBeGreaterThanOrEqual(startSample / SAMPLE_RATE);
    expect(startS).toBeLessThan((startSample + 1) / SAMPLE_RATE);
    expect(endS).toBeGreaterThanOrEqual(endSample / SAMPLE_RATE);
    expect(endS).toBeLessThan((endSample + 1) / SAMPLE_RATE);
  });

  test('đoạn loop luôn có độ dài dương', () => {
    const { startSample, endSample } = findLoopPoints(sineWithSilence(), SAMPLE_RATE);
    expect(endSample).toBeGreaterThan(startSample);
  });

  test('nhận ngưỡng im lặng tuỳ chọn', () => {
    const samples = sineWithSilence({ amp: 0.05 });
    const loose = findLoopPoints(samples, SAMPLE_RATE, { silenceThreshold: 0.01 });
    expect(loose.endS - loose.startS).toBeGreaterThan(0.5);
  });

  test('trả về null khi cả bản ghi là im lặng', () => {
    expect(findLoopPoints(new Float32Array(SAMPLE_RATE), SAMPLE_RATE)).toBeNull();
  });

  test('trả về null khi không đủ mẫu để lặp', () => {
    expect(findLoopPoints(new Float32Array([0, 1]), SAMPLE_RATE)).toBeNull();
  });
});

describe('measureLoopQuality', () => {
  test('đo được bước nhảy biên độ tại chỗ nối', () => {
    const samples = sineWithSilence();
    const points = findLoopPoints(samples, SAMPLE_RATE);
    const quality = measureLoopQuality(samples, SAMPLE_RATE, points);

    expect(quality.seamJump).toBeLessThan(0.001);
  });

  test('phát hiện khe hở im lặng ngay trước điểm kết loop', () => {
    // Kiểu lỗi thứ hai, khác hẳn kiểu bước nhảy biên độ: bộ mã hoá MP3 chèn
    // khoảng đệm ở cuối. Biên độ hai đầu vẫn xấp xỉ 0 nên phép đo bước nhảy
    // không thấy gì — nhưng tai nghe rõ một quãng lặng mỗi vòng lặp.
    const samples = sineWithSilence({ padS: 0 });
    const padded = new Float32Array(samples.length + Math.round(0.08 * SAMPLE_RATE));
    padded.set(samples, 0);

    const naive = { startSample: 0, endSample: padded.length - 1, startS: 0, endS: padded.length / SAMPLE_RATE };
    const quality = measureLoopQuality(padded, SAMPLE_RATE, naive);

    expect(quality.tailSilenceMs).toBeGreaterThan(70);
  });

  test('không báo khe hở khi điểm loop đã được cắt đúng', () => {
    const samples = sineWithSilence();
    const points = findLoopPoints(samples, SAMPLE_RATE);
    const quality = measureLoopQuality(samples, SAMPLE_RATE, points);

    expect(quality.tailSilenceMs).toBeLessThan(5);
  });

  test('kết luận liền mạch chỉ khi cả hai phép đo đều đạt', () => {
    const clean = sineWithSilence();
    const cleanPoints = findLoopPoints(clean, SAMPLE_RATE);
    expect(measureLoopQuality(clean, SAMPLE_RATE, cleanPoints).seamless).toBe(true);

    const padded = new Float32Array(clean.length + Math.round(0.08 * SAMPLE_RATE));
    padded.set(clean, 0);
    const naive = { startSample: 0, endSample: padded.length - 1, startS: 0, endS: padded.length / SAMPLE_RATE };
    expect(measureLoopQuality(padded, SAMPLE_RATE, naive).seamless).toBe(false);
  });
});

describe('findLoopPoints với độ dài tối đa', () => {
  test('cắt ngắn loop nhưng vẫn chốt điểm kết vào điểm cắt không', () => {
    // Cắt cứng ở "start + N giây" sẽ rơi vào giữa dốc sóng và tạo bước nhảy —
    // đo được 1.13e-2 trên vật liệu thật. Điểm kết phải lùi về điểm cắt không
    // gần nhất trước mốc đó.
    const samples = sineWithSilence({ toneS: 2, padS: 0.1 });
    const points = findLoopPoints(samples, SAMPLE_RATE, { maxDurationS: 0.5 });

    expect(isAscendingZeroCrossing(samples, points.endSample)).toBe(true);
  });

  test('độ dài loop không vượt mức tối đa đã yêu cầu', () => {
    const samples = sineWithSilence({ toneS: 2, padS: 0.1 });
    const points = findLoopPoints(samples, SAMPLE_RATE, { maxDurationS: 0.5 });

    expect(points.endS - points.startS).toBeLessThanOrEqual(0.5);
  });

  test('loop đã cắt ngắn vẫn liền mạch theo cả hai phép đo', () => {
    const samples = sineWithSilence({ toneS: 2, padS: 0.1 });
    const points = findLoopPoints(samples, SAMPLE_RATE, { maxDurationS: 0.5 });

    expect(measureLoopQuality(samples, SAMPLE_RATE, points).seamless).toBe(true);
  });

  test('bỏ qua mức tối đa khi nó dài hơn cả vật liệu', () => {
    const samples = sineWithSilence({ toneS: 1, padS: 0.25 });
    const capped = findLoopPoints(samples, SAMPLE_RATE, { maxDurationS: 99 });
    const plain = findLoopPoints(samples, SAMPLE_RATE);

    expect(capped).toEqual(plain);
  });
});
