import { describe, expect, test } from 'vitest';
import { dbToGain, sliderToDb, sliderToGain } from './gain.js';

describe('dbToGain', () => {
  test('0 dB là biên độ nguyên bản', () => {
    expect(dbToGain(0)).toBe(1);
  });

  test('giảm 6 dB thì biên độ còn khoảng một nửa', () => {
    expect(dbToGain(-6)).toBeCloseTo(0.5012, 4);
  });

  test('trừ vô cực là im lặng tuyệt đối', () => {
    expect(dbToGain(-Infinity)).toBe(0);
  });
});

describe('sliderToDb', () => {
  test('thanh trượt ở đỉnh là 0 dB', () => {
    expect(sliderToDb(1)).toBe(0);
  });

  test('thanh trượt ở đáy là im lặng tuyệt đối, không phải mức sàn', () => {
    // Nếu đáy chỉ là -60 dB thì lớp âm đã tắt vẫn rỉ tiếng khi các lớp khác nhỏ.
    // FR-11 yêu cầu tắt là tắt hẳn.
    expect(sliderToDb(0)).toBe(-Infinity);
  });

  test('thanh trượt giữa nằm giữa thang dB, không giữa thang biên độ', () => {
    expect(sliderToDb(0.5)).toBeCloseTo(-30, 6);
  });

  test('nhận được mức sàn tuỳ chọn', () => {
    expect(sliderToDb(0.5, -40)).toBeCloseTo(-20, 6);
  });
});

describe('sliderToGain', () => {
  test('ghép hai bước ánh xạ lại với nhau', () => {
    expect(sliderToGain(1)).toBe(1);
    expect(sliderToGain(0)).toBe(0);
    expect(sliderToGain(0.9)).toBeCloseTo(dbToGain(-6), 6);
  });

  test('nửa thanh trượt nghe nhỏ hơn nhiều so với nửa biên độ', () => {
    // Đây là lý do tồn tại của cả module: ánh xạ tuyến tính sẽ cho 0.5.
    expect(sliderToGain(0.5)).toBeLessThan(0.05);
  });
});
