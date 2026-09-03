import { describe, expect, test } from 'vitest';
import { mcnemarEffect, wilcoxonEffect } from './effect-size.js';

/**
 * Mọi giá trị đối chiếu dưới đây được tính độc lập bằng Python (`math.erfc`,
 * tổ hợp chính xác, nghịch đảo kiểm định vét cạn) trước khi viết mã.
 */

/** a = đúng cả hai · b = chỉ điều kiện A đúng · c = chỉ B đúng · d = sai cả hai. */
const pairsWith = (a, b, c, d) => [
  ...Array.from({ length: a }, () => ({ a: true, b: true })),
  ...Array.from({ length: b }, () => ({ a: true, b: false })),
  ...Array.from({ length: c }, () => ({ a: false, b: true })),
  ...Array.from({ length: d }, () => ({ a: false, b: false })),
];

describe('mcnemarEffect — cỡ hiệu ứng cho H1', () => {
  const sample = () => pairsWith(30, 17, 5, 8); // n = 60

  test('chênh tỉ lệ Wald khớp giá trị tính tay', () => {
    // (17 − 5) / 60 = 0,2
    const result = mcnemarEffect(sample());
    expect(result.riskDifferenceWald).toBeCloseTo(0.2, 12);
    expect(result.riskDifferenceWaldCi[0]).toBeCloseTo(0.055381159095, 10);
    expect(result.riskDifferenceWaldCi[1]).toBeCloseTo(0.344618840905, 10);
  });

  test('khoảng hiệu chỉnh Agresti–Min khớp giá trị tính tay', () => {
    const result = mcnemarEffect(sample());
    expect(result.riskDifferenceCi[0]).toBeCloseTo(0.0507504390575, 10);
    expect(result.riskDifferenceCi[1]).toBeCloseTo(0.342692183893, 10);
  });

  test('khoảng hiệu chỉnh RỘNG hơn Wald thuần', () => {
    // Wald thuần cho khoảng hẹp hơn thực tế — hẹp quá là sai theo hướng nguy
    // hiểm, nên mặc định trả về bản hiệu chỉnh.
    const r = mcnemarEffect(sample());
    const width = (ci) => ci[1] - ci[0];
    expect(width(r.riskDifferenceCi)).toBeGreaterThan(width(r.riskDifferenceWaldCi));
  });

  test('tỉ số odds và khoảng logit khớp giá trị tính tay', () => {
    // OR = 17/5 = 3,4 · SE(log) = √(1/17 + 1/5)
    const result = mcnemarEffect(sample());
    expect(result.oddsRatio).toBeCloseTo(3.4, 12);
    expect(result.ci[0]).toBeCloseTo(1.25439024853, 9);
    expect(result.ci[1]).toBeCloseTo(9.2156328651, 9);
  });

  test('khoảng tin cậy hẹp lại khi mức tin cậy giảm', () => {
    const width = (alpha) => {
      const ci = mcnemarEffect(sample(), { alpha }).riskDifferenceCi;
      return ci[1] - ci[0];
    };
    expect(width(0.1)).toBeLessThan(width(0.05));
    expect(width(0.05)).toBeLessThan(width(0.01));
  });

  test('một ô bất đồng bằng 0 thì tỉ số odds không xác định, kèm ghi chú', () => {
    const result = mcnemarEffect(pairsWith(20, 9, 0, 20));
    expect(result.ci).toBeNull();
    expect(result.note).toMatch(/không xác định/i);
    // Chênh tỉ lệ vẫn tính được, nên vẫn có thứ để báo cáo.
    expect(result.riskDifference).toBeGreaterThan(0);
  });

  test('không có cặp bất đồng nào thì chênh tỉ lệ bằng 0', () => {
    const result = mcnemarEffect(pairsWith(20, 0, 0, 20));
    expect(result.riskDifferenceWald).toBe(0);
    expect(result.oddsRatio).toBeNull();
  });

  test('từ chối mức tin cậy chưa có phân vị thay vì tính bừa', () => {
    expect(() => mcnemarEffect(sample(), { alpha: 0.037 })).toThrow(/phân vị/i);
  });

  test('bộ rỗng thì báo lỗi', () => {
    expect(() => mcnemarEffect([])).toThrow(/không có cặp/i);
  });
});

describe('wilcoxonEffect — cỡ hiệu ứng cho H2', () => {
  /** Chênh lệch 1, −2, 3, −4, 5 — cùng bộ đã dùng để đối chiếu kiểm định. */
  const fivePairs = [
    { a: 4, b: 3 },
    { a: 2, b: 4 },
    { a: 6, b: 3 },
    { a: 1, b: 5 },
    { a: 7, b: 2 },
  ];

  /** 12 chênh lệch, phần lớn dương — cỡ mẫu đủ để khoảng tin cậy có ý nghĩa. */
  const twelvePairs = [3, 5, 2, 7, 4, 6, -1, 8, 3, 5, 9, 4].map((d) => ({ a: d, b: 0 }));

  test('tương quan rank-biserial khớp giá trị tính tay', () => {
    // W⁺ = 9, W⁻ = 6 ⇒ (9 − 6)/15 = 0,2
    expect(wilcoxonEffect(fivePairs).rankBiserial).toBeCloseTo(0.2, 12);
  });

  test('Hodges–Lehmann khớp trung vị của 15 trung bình Walsh', () => {
    expect(wilcoxonEffect(fivePairs).hodgesLehmann).toBeCloseTo(0.5, 12);
  });

  test('rank-biserial nằm trong [−1, 1] và đảo dấu khi đổi chiều', () => {
    const forward = wilcoxonEffect(fivePairs).rankBiserial;
    const reversed = wilcoxonEffect(fivePairs.map((p) => ({ a: p.b, b: p.a }))).rankBiserial;
    expect(forward).toBeCloseTo(-reversed, 12);
    expect(Math.abs(forward)).toBeLessThanOrEqual(1);
  });

  test('mọi cặp lệch cùng chiều thì rank-biserial bằng 1', () => {
    expect(wilcoxonEffect([{ a: 5, b: 1 }, { a: 4, b: 2 }, { a: 9, b: 3 }]).rankBiserial).toBe(1);
  });

  test('n = 12: Hodges–Lehmann và khoảng tin cậy khớp giá trị tính tay', () => {
    // Đối chiếu hai đường độc lập, cùng ra [3; 6,5]:
    //   · công thức cắt đuôi từ phân bố signed-rank
    //   · nghịch đảo kiểm định quét ĐIỂM GIỮA các trung bình Walsh → khoảng mở
    //     (3,25; 6,25), bao đóng đúng bằng [3; 6,5]
    const result = wilcoxonEffect(twelvePairs);
    expect(result.n).toBe(12);
    expect(result.hodgesLehmann).toBeCloseTo(4.5, 12);
    expect(result.ci[0]).toBeCloseTo(3, 12);
    expect(result.ci[1]).toBeCloseTo(6.5, 12);
    expect(result.uninformative).toBe(false);
  });

  test('thang Likert thô vẫn cho khoảng THẬT, không suy biến thành một điểm', () => {
    // Chênh lệch Likert chỉ nhận ít giá trị nguyên, nên tập trung bình Walsh rất
    // thô — ở đây chỉ có {1; 1,5; 2}. Nếu tính khoảng bằng cách thử đúng các giá
    // trị đó thì `d − θ = 0` làm cặp bị loại, phép kiểm đổi, và khoảng co lại
    // thành [1,5; 1,5]. Khoảng tin cậy không bao giờ là một điểm.
    const pairs = [
      ...Array.from({ length: 25 }, () => ({ a: 1, b: 0 })),
      ...Array.from({ length: 14 }, () => ({ a: 2, b: 0 })),
    ];
    const result = wilcoxonEffect(pairs);
    expect(result.ci[0]).toBeCloseTo(1, 12);
    expect(result.ci[1]).toBeCloseTo(1.5, 12);
    expect(result.ci[0]).toBeLessThan(result.ci[1]);
  });

  test('khoảng tin cậy chứa ước lượng điểm', () => {
    const result = wilcoxonEffect(twelvePairs);
    expect(result.hodgesLehmann).toBeGreaterThanOrEqual(result.ci[0]);
    expect(result.hodgesLehmann).toBeLessThanOrEqual(result.ci[1]);
  });

  test('n = 5: NÓI RÕ khoảng tin cậy không cho biết gì', () => {
    // Ở n = 5 không có θ nào bị bác bỏ ở α = 0,05, nên khoảng trải hết tập
    // Walsh. In ra một khoảng rộng như thể nó là kết quả là hiểu sai nó.
    const result = wilcoxonEffect(fivePairs);
    expect(result.ci).toEqual([-4, 5]);
    expect(result.uninformative).toBe(true);
    expect(result.note).toMatch(/không cho biết gì|quá nhỏ/i);
  });

  test('cảnh báo khi có chênh lệch trùng nhau', () => {
    const result = wilcoxonEffect([{ a: 5, b: 3 }, { a: 6, b: 4 }, { a: 7, b: 2 }]);
    expect(result.note).toMatch(/trùng/i);
  });

  test('bỏ cặp không chênh lệch và ghi rõ số bị bỏ', () => {
    const result = wilcoxonEffect([{ a: 3, b: 3 }, { a: 5, b: 2 }, { a: 6, b: 1 }]);
    expect(result.n).toBe(2);
    expect(result.dropped).toBe(1);
  });

  test('mọi cặp không chênh lệch thì không có hiệu ứng nào để đo', () => {
    const result = wilcoxonEffect([{ a: 3, b: 3 }, { a: 4, b: 4 }]);
    expect(result.rankBiserial).toBe(0);
    expect(result.ci).toBeNull();
    expect(result.note).toMatch(/không có hiệu ứng/i);
  });

  test('bộ rỗng thì báo lỗi', () => {
    expect(() => wilcoxonEffect([])).toThrow(/không có cặp/i);
  });
});
