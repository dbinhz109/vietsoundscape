import { describe, expect, test } from 'vitest';
import {
  inverseNormalCdf,
  mcnemarPower,
  mcnemarSampleSize,
  mcnemarSampleSizeBySimulation,
  simulateMcnemarPower,
  simulateWilcoxonPower,
  wilcoxonSampleSize,
} from './power.js';

describe('phân vị chuẩn nghịch đảo', () => {
  // Giá trị đối chiếu từ bảng chuẩn — sai một chữ số ở đây là sai cả bài tính cỡ mẫu.
  test.each([
    [0.5, 0],
    [0.8, 0.8416212336],
    [0.9, 1.2815515655],
    [0.95, 1.6448536270],
    [0.975, 1.9599639845],
    [0.99, 2.3263478740],
    [0.995, 2.5758293035],
  ])('Φ⁻¹(%s) = %s', (p, expected) => {
    expect(inverseNormalCdf(p)).toBeCloseTo(expected, 8);
  });

  test('đối xứng quanh 0', () => {
    for (const p of [0.6, 0.75, 0.9, 0.99, 0.999]) {
      expect(inverseNormalCdf(1 - p)).toBeCloseTo(-inverseNormalCdf(p), 10);
    }
  });

  test('ngoài khoảng (0, 1) thì chặn', () => {
    for (const p of [0, 1, -0.1, 1.2, Number.NaN]) {
      expect(() => inverseNormalCdf(p)).toThrow();
    }
  });
});

describe('cỡ mẫu McNemar', () => {
  test('ví dụ đối chiếu tính tay: p01 = 0,30 · p10 = 0,10', () => {
    // n = [z·√πd + z_β·√(πd − δ²)]² / δ²
    //   = [1,95996·√0,40 + 0,84162·√0,36]² / 0,04 = 76,09 → 77
    const n = mcnemarSampleSize({ p01: 0.3, p10: 0.1, alpha: 0.05, power: 0.8 });
    expect(n).toBe(77);
  });

  test('hiệu ứng lớn hơn thì cần ít người hơn', () => {
    const weak = mcnemarSampleSize({ p01: 0.25, p10: 0.15 });
    const strong = mcnemarSampleSize({ p01: 0.35, p10: 0.05 });
    expect(strong).toBeLessThan(weak);
  });

  test('đòi lực mạnh hơn thì cần nhiều người hơn', () => {
    const at80 = mcnemarSampleSize({ p01: 0.3, p10: 0.1, power: 0.8 });
    const at90 = mcnemarSampleSize({ p01: 0.3, p10: 0.1, power: 0.9 });
    expect(at90).toBeGreaterThan(at80);
  });

  test('không có hiệu ứng thì không có cỡ mẫu nào đủ — chặn thay vì trả về ∞', () => {
    expect(() => mcnemarSampleSize({ p01: 0.2, p10: 0.2 })).toThrow(/chênh|hiệu ứng/i);
  });

  test('tỉ lệ vô nghĩa thì chặn', () => {
    expect(() => mcnemarSampleSize({ p01: 0.7, p10: 0.5 })).toThrow();
    expect(() => mcnemarSampleSize({ p01: -0.1, p10: 0.2 })).toThrow();
  });

  test('lực và cỡ mẫu là hai chiều của cùng một phép tính', () => {
    const n = mcnemarSampleSize({ p01: 0.3, p10: 0.1, alpha: 0.05, power: 0.8 });
    expect(mcnemarPower({ n, p01: 0.3, p10: 0.1, alpha: 0.05 })).toBeGreaterThanOrEqual(0.8);
    expect(mcnemarPower({ n: n - 1, p01: 0.3, p10: 0.1, alpha: 0.05 })).toBeLessThan(0.8);
  });
});

describe('mô phỏng — chạy CHÍNH phép kiểm sẽ dùng khi phân tích', () => {
  // Công thức khép kín là xấp xỉ chuẩn; phép kiểm thật tự chuyển sang bản chính
  // xác khi ít cặp bất đồng. Mô phỏng bằng chính hàm kiểm định là cách duy nhất
  // biết hai thứ đó có khớp nhau không.
  test('không có hiệu ứng thì lực xấp xỉ α — đây là phép kiểm sai số loại I', () => {
    const power = simulateMcnemarPower({
      n: 48, p01: 0.2, p10: 0.2, alpha: 0.05, runs: 2000, seed: 20260807,
    });
    expect(power).toBeLessThan(0.08);
  });

  test('hiệu ứng lớn thì gần như luôn phát hiện được', () => {
    const power = simulateMcnemarPower({
      n: 48, p01: 0.35, p10: 0.05, alpha: 0.05, runs: 1000, seed: 20260807,
    });
    expect(power).toBeGreaterThan(0.9);
  });

  test('phép kiểm thật TIÊU ÍT hơn α danh nghĩa', () => {
    // Nguyên nhân gốc của mọi chênh lệch dưới đây. `mcnemarTest` dùng bản chính
    // xác khi ít cặp bất đồng, và bản chi bình phương CÓ hiệu chỉnh khi nhiều —
    // cả hai đều thận trọng hơn xấp xỉ chuẩn trần mà công thức Connor giả định.
    for (const p of [0.1, 0.2, 0.3]) {
      const typeOne = simulateMcnemarPower({
        n: 48, p01: p, p10: p, alpha: 0.05, runs: 4000, seed: 20260807,
      });
      expect(typeOne).toBeLessThan(0.05);
    }
  });

  test('CÔNG THỨC KHÉP KÍN ĐÁNH GIÁ CAO LỰC THẬT ở cỡ mẫu của đề tài', () => {
    // Không phải nhiễu Monte Carlo — chênh có hướng cố định và co lại khi n lớn.
    // Hệ quả thực tế: tuyển 77 người theo công thức thì lực thật chỉ ~0,75, không
    // phải 0,80 như công thức hứa. Cỡ mẫu chốt trong kế hoạch phân tích lấy theo
    // MÔ PHỎNG, không lấy theo công thức.
    const gap = (n) =>
      mcnemarPower({ n, p01: 0.3, p10: 0.1 }) -
      simulateMcnemarPower({ n, p01: 0.3, p10: 0.1, runs: 4000, seed: 20260807 });

    expect(gap(48)).toBeGreaterThan(0.03);
    expect(gap(77)).toBeGreaterThan(0.02);
    // Hội tụ khi mẫu lớn — xấp xỉ chuẩn đúng dần, nên chênh phải teo lại.
    expect(gap(200)).toBeLessThan(0.02);
    expect(gap(48)).toBeGreaterThan(gap(150));
  });

  test('cỡ mẫu theo mô phỏng LỚN HƠN cỡ mẫu theo công thức', () => {
    const byFormula = mcnemarSampleSize({ p01: 0.3, p10: 0.1, power: 0.8 });
    const bySimulation = mcnemarSampleSizeBySimulation({
      p01: 0.3, p10: 0.1, power: 0.8, runs: 2000, seed: 20260807,
    });
    expect(bySimulation).toBeGreaterThan(byFormula);
    expect(
      simulateMcnemarPower({
        n: bySimulation, p01: 0.3, p10: 0.1, runs: 4000, seed: 20260807,
      }),
    ).toBeGreaterThanOrEqual(0.79);
  });

  test('cùng seed cho cùng kết quả', () => {
    const args = { n: 30, p01: 0.3, p10: 0.1, runs: 500, seed: 7 };
    expect(simulateMcnemarPower(args)).toBe(simulateMcnemarPower(args));
  });
});

describe('cỡ mẫu Wilcoxon cho hai chiều ISO', () => {
  test('không có hiệu ứng thì lực xấp xỉ α', () => {
    const power = simulateWilcoxonPower({
      n: 48, effectSize: 0, alpha: 0.05, runs: 1000, seed: 20260807,
    });
    expect(power).toBeLessThan(0.09);
  });

  test('hiệu ứng vừa (d = 0,5) với n = 48 thì lực cao', () => {
    const power = simulateWilcoxonPower({
      n: 48, effectSize: 0.5, alpha: 0.05, runs: 1000, seed: 20260807,
    });
    expect(power).toBeGreaterThan(0.9);
  });

  test('lực tăng theo cỡ mẫu', () => {
    const small = simulateWilcoxonPower({ n: 12, effectSize: 0.4, runs: 600, seed: 1 });
    const large = simulateWilcoxonPower({ n: 60, effectSize: 0.4, runs: 600, seed: 1 });
    expect(large).toBeGreaterThan(small);
  });

  test('tìm được cỡ mẫu nhỏ nhất đạt lực mong muốn', () => {
    const n = wilcoxonSampleSize({ effectSize: 0.5, alpha: 0.05, power: 0.8, seed: 20260807 });
    expect(n).toBeGreaterThan(20);
    expect(n).toBeLessThan(50);
    expect(
      simulateWilcoxonPower({ n, effectSize: 0.5, alpha: 0.05, runs: 2000, seed: 20260807 }),
    ).toBeGreaterThanOrEqual(0.8);
  });

  test('hiệu ứng bằng 0 thì không có cỡ mẫu nào đủ — chặn', () => {
    expect(() => wilcoxonSampleSize({ effectSize: 0 })).toThrow(/hiệu ứng/i);
  });
});
