import { describe, expect, test } from 'vitest';
import { chanceLevel, discordantRates } from './guessing-model.js';

describe('chanceLevel — mức đoán mò trung bình qua các lượt, có loại trừ', () => {
  test('danh sách = đúng 4 vùng sẽ nghe: lượt 1 là 1/4, lượt 4 là 1/1 ⇒ trung bình ≈ 52%', () => {
    // (1/4 + 1/3 + 1/2 + 1) / 4 — đây là lỗi thiết kế mà spec S1.1 sửa.
    expect(chanceLevel({ trials: 4, options: 4 })).toBeCloseTo((1 / 4 + 1 / 3 + 1 / 2 + 1) / 4, 10);
  });

  test('8 ô trả lời: trung bình ≈ 16%', () => {
    expect(chanceLevel({ trials: 4, options: 8 })).toBeCloseTo((1 / 8 + 1 / 7 + 1 / 6 + 1 / 5) / 4, 10);
  });

  test('không loại trừ thì mọi lượt đều 1/số ô', () => {
    expect(chanceLevel({ trials: 4, options: 8, eliminate: false })).toBeCloseTo(1 / 8, 10);
  });

  test('thêm ô thì mức đoán mò giảm — đơn điệu', () => {
    const levels = [4, 6, 8, 12, 16].map((options) => chanceLevel({ trials: 4, options }));
    for (let i = 1; i < levels.length; i += 1) expect(levels[i]).toBeLessThan(levels[i - 1]);
  });

  test('ít ô hơn số lượt thì ném lỗi — không thể loại trừ tới âm', () => {
    expect(() => chanceLevel({ trials: 4, options: 3 })).toThrow(/lượt|ô/i);
  });
});

describe('discordantRates — từ "biết" và mức đoán mò ra p01/p10 cho McNemar', () => {
  // Mô hình: mỗi người có năng lực u ~ U(0,1); "biết" đáp án ở điều kiện c khi
  // u < know_c. Ai biết ở điều kiện khó thì cũng biết ở điều kiện dễ (cùng một
  // u) — giả định THẬN TRỌNG: cặp bất đồng ít hơn so với giả định độc lập.
  // Không biết thì đoán mò, trúng với xác suất `chance`.

  test('không có đoán mò: p01 = chênh lệch "biết", p10 = 0', () => {
    const r = discordantRates({ knowLayered: 0.55, knowIsolated: 0.35, chance: 0 });
    expect(r.p01).toBeCloseTo(0.2, 10);
    expect(r.p10).toBeCloseTo(0, 10);
  });

  test('hai điều kiện "biết" như nhau thì p01 = p10 (giả thuyết không)', () => {
    const r = discordantRates({ knowLayered: 0.4, knowIsolated: 0.4, chance: 0.3 });
    expect(r.p01).toBeCloseTo(r.p10, 10);
  });

  test('tỉ lệ đúng = biết + (1 − biết) × đoán mò', () => {
    const r = discordantRates({ knowLayered: 0.55, knowIsolated: 0.35, chance: 0.25 });
    expect(r.accuracyLayered).toBeCloseTo(0.55 + 0.45 * 0.25, 10);
    expect(r.accuracyIsolated).toBeCloseTo(0.35 + 0.65 * 0.25, 10);
  });

  test('mức đoán mò càng cao thì chênh p01 − p10 càng teo — đây là cái giá của lỗi S1.1', () => {
    const gap = (chance) => {
      const r = discordantRates({ knowLayered: 0.55, knowIsolated: 0.35, chance });
      return r.p01 - r.p10;
    };
    expect(gap(0.52)).toBeLessThan(gap(0.16));
    expect(gap(0.16)).toBeLessThan(gap(0));
    // Dạng đóng: chênh = (know_L − know_I) × (1 − chance).
    expect(gap(0.16)).toBeCloseTo(0.2 * 0.84, 10);
  });

  test('p01, p10 là xác suất hợp lệ và không vượt tổng 1', () => {
    for (const chance of [0, 0.16, 0.52, 0.9]) {
      const r = discordantRates({ knowLayered: 0.7, knowIsolated: 0.2, chance });
      expect(r.p01).toBeGreaterThanOrEqual(0);
      expect(r.p10).toBeGreaterThanOrEqual(0);
      expect(r.p01 + r.p10).toBeLessThanOrEqual(1);
    }
  });

  test('"biết" ở layered thấp hơn isolated thì ném lỗi — mô hình chỉ cho chiều H1', () => {
    expect(() => discordantRates({ knowLayered: 0.3, knowIsolated: 0.5, chance: 0.2 })).toThrow();
  });

  test('tham số ngoài [0, 1] thì ném lỗi', () => {
    expect(() => discordantRates({ knowLayered: 1.2, knowIsolated: 0.5, chance: 0.2 })).toThrow();
    expect(() => discordantRates({ knowLayered: 0.6, knowIsolated: 0.5, chance: -0.1 })).toThrow();
  });
});
