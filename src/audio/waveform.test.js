import { describe, expect, test } from 'vitest';
import { PEAK_BUCKETS, peakEnvelope, rmsLevel, stackOrder } from './waveform.js';

const SAMPLE_RATE = 48000;

/** Sóng sin biên độ cho trước, đủ dài để chia thùng. */
const sine = (seconds, amplitude = 1, freq = 220) => {
  const n = Math.round(seconds * SAMPLE_RATE);
  const data = new Float32Array(n);
  for (let i = 0; i < n; i += 1) data[i] = amplitude * Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
  return data;
};

describe('peakEnvelope', () => {
  test('trả đúng số thùng yêu cầu, mỗi thùng một cặp min/max', () => {
    const env = peakEnvelope(sine(2), { buckets: 100 });
    expect(env.min.length).toBe(100);
    expect(env.max.length).toBe(100);
  });

  test('sóng sin biên độ 1 cho đỉnh ≈ ±1 ở mọi thùng', () => {
    const env = peakEnvelope(sine(2), { buckets: 50 });
    expect(Math.min(...env.max)).toBeGreaterThan(0.99);
    expect(Math.max(...env.min)).toBeLessThan(-0.99);
  });

  test('biên độ nhỏ hơn cho đường bao thấp hơn — đây là thứ mắt phải thấy được', () => {
    const loud = peakEnvelope(sine(2, 0.9), { buckets: 20 });
    const quiet = peakEnvelope(sine(2, 0.2), { buckets: 20 });
    expect(Math.max(...loud.max)).toBeGreaterThan(Math.max(...quiet.max) * 3);
  });

  test('im lặng cho đường bao phẳng bằng 0, không phải NaN', () => {
    const env = peakEnvelope(new Float32Array(48000), { buckets: 10 });
    expect(env.max.every((v) => v === 0)).toBe(true);
    expect(env.min.every((v) => v === 0)).toBe(true);
  });

  test('mẫu ngắn hơn số thùng vẫn chạy, không chia cho 0', () => {
    const env = peakEnvelope(new Float32Array([0.5, -0.5, 0.25]), { buckets: 10 });
    expect(env.max.length).toBe(10);
    expect(env.max.every(Number.isFinite)).toBe(true);
  });

  test('mẫu rỗng cho đường bao 0, không ném lỗi', () => {
    expect(() => peakEnvelope(new Float32Array(0), { buckets: 4 })).not.toThrow();
    expect(peakEnvelope(new Float32Array(0), { buckets: 4 }).max).toEqual([0, 0, 0, 0]);
  });

  test('số thùng mặc định là hằng số có tên, không phải số rơi giữa mã', () => {
    expect(peakEnvelope(sine(1)).max.length).toBe(PEAK_BUCKETS);
    expect(PEAK_BUCKETS).toBeGreaterThan(50);
  });

  test('đọc được từ AudioBuffer qua getChannelData', () => {
    const data = sine(1, 0.6);
    const buffer = { length: data.length, numberOfChannels: 1, getChannelData: () => data };
    expect(Math.max(...peakEnvelope(buffer, { buckets: 8 }).max)).toBeCloseTo(0.6, 1);
  });

  test('bắt đầu và kết thúc bao trọn mẫu — thùng cuối không bỏ sót đuôi', () => {
    const data = new Float32Array(1000);
    data[999] = 1; // chỉ mẫu cuối cùng có tín hiệu
    expect(Math.max(...peakEnvelope(data, { buckets: 10 }).max)).toBe(1);
  });
});

describe('rmsLevel', () => {
  test('sóng sin biên độ 1 có RMS ≈ 0,707', () => {
    expect(rmsLevel(sine(1))).toBeCloseTo(Math.SQRT1_2, 2);
  });
  test('im lặng cho 0, mẫu rỗng cho 0', () => {
    expect(rmsLevel(new Float32Array(100))).toBe(0);
    expect(rmsLevel(new Float32Array(0))).toBe(0);
  });
});

describe('stackOrder', () => {
  test('xếp theo nhóm Krause: tự nhiên dưới, sinh vật giữa, con người trên', () => {
    const layers = [
      { id: 'c', krauseClass: 'anthrophony' },
      { id: 'a', krauseClass: 'geophony' },
      { id: 'b', krauseClass: 'biophony' },
    ];
    expect(stackOrder(layers).map((l) => l.id)).toEqual(['a', 'b', 'c']);
  });

  test('cùng nhóm thì giữ nguyên thứ tự khai — bản trộn là dữ liệu có thứ tự', () => {
    const layers = [
      { id: 'x', krauseClass: 'anthrophony' },
      { id: 'y', krauseClass: 'anthrophony' },
    ];
    expect(stackOrder(layers).map((l) => l.id)).toEqual(['x', 'y']);
  });

  test('nhóm lạ xếp cuối thay vì biến mất', () => {
    const layers = [{ id: 'z', krauseClass: 'lạ' }, { id: 'a', krauseClass: 'geophony' }];
    expect(stackOrder(layers).map((l) => l.id)).toEqual(['a', 'z']);
  });

  test('không đổi mảng đầu vào', () => {
    const layers = [{ id: 'c', krauseClass: 'anthrophony' }, { id: 'a', krauseClass: 'geophony' }];
    const copy = structuredClone(layers);
    stackOrder(layers);
    expect(layers).toEqual(copy);
  });
});
