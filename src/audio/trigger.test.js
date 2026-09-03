import { afterEach, describe, expect, test, vi } from 'vitest';
import { createRng, scheduleTriggers } from './trigger.js';

const intervals = (times) => times.slice(1).map((t, i) => t - times[i]);

describe('createRng', () => {
  test('cùng seed cho cùng chuỗi số', () => {
    const a = createRng(20260805);
    const b = createRng(20260805);
    const drawA = [a(), a(), a(), a(), a()];
    const drawB = [b(), b(), b(), b(), b()];
    expect(drawA).toEqual(drawB);
  });

  test('seed khác cho chuỗi khác', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  test('mọi số nằm trong nửa khoảng [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 500; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('scheduleTriggers', () => {
  const config = { seed: 42, meanIntervalS: 24, jitterS: 8, durationS: 300 };

  test('cùng seed cho cùng lịch phát — điều kiện của FR-52', () => {
    expect(scheduleTriggers(config)).toEqual(scheduleTriggers(config));
  });

  test('seed khác cho lịch phát khác', () => {
    const other = scheduleTriggers({ ...config, seed: 43 });
    expect(scheduleTriggers(config)).not.toEqual(other);
  });

  test('mọi thời điểm nằm trong thời lượng đã cho', () => {
    for (const time of scheduleTriggers(config)) {
      expect(time).toBeGreaterThanOrEqual(0);
      expect(time).toBeLessThan(config.durationS);
    }
  });

  test('thời điểm tăng dần', () => {
    const times = scheduleTriggers(config);
    expect(times).toEqual([...times].sort((x, y) => x - y));
    expect(new Set(times).size).toBe(times.length);
  });

  test('khoảng cách giữa hai lần phát nằm trong biên jitter', () => {
    for (const gap of intervals(scheduleTriggers(config))) {
      expect(gap).toBeGreaterThanOrEqual(config.meanIntervalS - config.jitterS);
      expect(gap).toBeLessThanOrEqual(config.meanIntervalS + config.jitterS);
    }
  });

  test('jitter bằng 0 cho lịch cách đều tuyệt đối', () => {
    const times = scheduleTriggers({ ...config, jitterS: 0 });
    for (const gap of intervals(times)) {
      expect(gap).toBeCloseTo(config.meanIntervalS, 6);
    }
  });

  test('số lần phát xấp xỉ thời lượng chia khoảng cách trung bình', () => {
    const times = scheduleTriggers(config);
    const expected = config.durationS / config.meanIntervalS;
    expect(times.length).toBeGreaterThan(expected * 0.7);
    expect(times.length).toBeLessThan(expected * 1.3);
  });

  test('không dùng Math.random — nếu dùng thì lịch phát không tái lập được', () => {
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('scheduleTriggers phải dùng RNG có seed, không dùng Math.random');
    });
    expect(() => scheduleTriggers(config)).not.toThrow();
    spy.mockRestore();
  });

  test('thời lượng bằng 0 cho lịch rỗng', () => {
    expect(scheduleTriggers({ ...config, durationS: 0 })).toEqual([]);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
