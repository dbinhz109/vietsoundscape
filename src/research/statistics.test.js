import { describe, expect, test } from 'vitest';
import {
  binomialTwoSidedP,
  mcnemarTest,
  pairResponses,
  wilcoxonSignedRankTest,
} from './statistics.js';

describe('binomialTwoSidedP — nền của kiểm định McNemar chính xác', () => {
  test('k = n/2 thì p = 1', () => {
    expect(binomialTwoSidedP(5, 10)).toBeCloseTo(1, 10);
  });

  test('giá trị đối chiếu tính tay: k=2, n=11', () => {
    // 2 · (C(11,0)+C(11,1)+C(11,2)) / 2^11 = 2 · 67/2048 = 134/2048
    expect(binomialTwoSidedP(2, 11)).toBeCloseTo(134 / 2048, 12);
  });

  test('không lệch khi lấy đầu nào của phân bố', () => {
    expect(binomialTwoSidedP(2, 11)).toBeCloseTo(binomialTwoSidedP(9, 11), 12);
  });

  test('n = 0 thì không kiểm được gì, p = 1', () => {
    expect(binomialTwoSidedP(0, 0)).toBe(1);
  });
});

describe('mcnemarTest — H1, tỉ lệ nhận diện đúng (BA §10.1)', () => {
  /** Dựng danh sách cặp có đúng b lượt (đúng, sai) và c lượt (sai, đúng). */
  const pairsWith = (a, b, c, d) => [
    ...Array.from({ length: a }, () => ({ a: true, b: true })),
    ...Array.from({ length: b }, () => ({ a: true, b: false })),
    ...Array.from({ length: c }, () => ({ a: false, b: true })),
    ...Array.from({ length: d }, () => ({ a: false, b: false })),
  ];

  test('chỉ đếm cặp bất đồng — cặp giống nhau không mang thông tin', () => {
    // Đây là điểm cốt lõi của McNemar và cũng là lý do thống kê mô tả không thay
    // thế được: người đoán đúng cả hai điều kiện không phân biệt được hai điều kiện.
    const few = mcnemarTest(pairsWith(0, 9, 2, 0));
    const many = mcnemarTest(pairsWith(500, 9, 2, 500));
    expect(few.b).toBe(many.b);
    expect(few.c).toBe(many.c);
    expect(few.p).toBeCloseTo(many.p, 12);
  });

  test('giá trị đối chiếu tính tay — chi bình phương không hiệu chỉnh', () => {
    // (9−2)² / (9+2) = 49/11 = 4,4545
    const result = mcnemarTest(pairsWith(30, 9, 2, 30), { method: 'chi-square' });
    expect(result.chiSquare).toBeCloseTo(49 / 11, 10);
    expect(result.p).toBeCloseTo(0.0348, 3);
  });

  test('giá trị đối chiếu tính tay — có hiệu chỉnh liên tục', () => {
    // (|9−2|−1)² / 11 = 36/11 = 3,2727
    const result = mcnemarTest(pairsWith(30, 9, 2, 30), { method: 'chi-square-corrected' });
    expect(result.chiSquare).toBeCloseTo(36 / 11, 10);
    expect(result.p).toBeCloseTo(0.0704, 3);
  });

  test('giá trị đối chiếu tính tay — kiểm định chính xác', () => {
    const result = mcnemarTest(pairsWith(30, 9, 2, 30), { method: 'exact' });
    expect(result.p).toBeCloseTo(134 / 2048, 12);
  });

  test('ít cặp bất đồng thì TỰ CHỌN kiểm định chính xác', () => {
    // Xấp xỉ chi bình phương không đáng tin khi b + c nhỏ. Đây là chỗ dễ báo
    // "có ý nghĩa" một cách sai, vì bản không hiệu chỉnh cho p nhỏ nhất.
    const result = mcnemarTest(pairsWith(30, 9, 2, 30));
    expect(result.method).toBe('exact');
    expect(result.p).toBeCloseTo(134 / 2048, 12);
  });

  test('nhiều cặp bất đồng thì dùng xấp xỉ chi bình phương có hiệu chỉnh', () => {
    const result = mcnemarTest(pairsWith(10, 20, 10, 10));
    expect(result.method).toBe('chi-square-corrected');
    expect(result.n).toBe(30);
  });

  test('không có cặp bất đồng nào thì p = 1, không phải chia cho 0', () => {
    const result = mcnemarTest(pairsWith(20, 0, 0, 20));
    expect(result.p).toBe(1);
    expect(result.significant).toBe(false);
    expect(result.note).toMatch(/bất đồng/i);
  });

  test('nêu rõ chiều của hiệu ứng, không chỉ nêu p', () => {
    expect(mcnemarTest(pairsWith(5, 9, 2, 5)).favours).toBe('a');
    expect(mcnemarTest(pairsWith(5, 2, 9, 5)).favours).toBe('b');
    expect(mcnemarTest(pairsWith(5, 4, 4, 5)).favours).toBe(null);
  });

  test('bộ rỗng thì báo lỗi chứ không trả về "không có ý nghĩa"', () => {
    expect(() => mcnemarTest([])).toThrow(/không có cặp/i);
  });
});

describe('wilcoxonSignedRankTest — H2, điểm cảm nhận Likert (BA §10.1)', () => {
  test('giá trị đối chiếu tính tay: chênh lệch 1, −2, 3, −4, 5', () => {
    // Hạng của |d| là 1..5. Chênh dương ở hạng 1, 3, 5 ⇒ W+ = 9, W− = 6.
    // Đúng 13 trong 32 tập con của {1..5} có tổng ≤ 6 ⇒ p hai phía = 2·13/32.
    const result = wilcoxonSignedRankTest([
      { a: 4, b: 3 },
      { a: 2, b: 4 },
      { a: 6, b: 3 },
      { a: 1, b: 5 },
      { a: 7, b: 2 },
    ]);
    expect(result.wPlus).toBeCloseTo(9, 10);
    expect(result.wMinus).toBeCloseTo(6, 10);
    expect(result.n).toBe(5);
    expect(result.method).toBe('exact');
    expect(result.p).toBeCloseTo((2 * 13) / 32, 12);
  });

  test('bỏ cặp không chênh lệch, và ghi rõ đã bỏ bao nhiêu', () => {
    const result = wilcoxonSignedRankTest([
      { a: 3, b: 3 },
      { a: 5, b: 2 },
      { a: 4, b: 1 },
    ]);
    expect(result.n).toBe(2);
    expect(result.dropped).toBe(1);
  });

  test('chia hạng trung bình cho các chênh lệch bằng nhau', () => {
    // |d| = 2, 2, 5 ⇒ hai giá trị 2 chia nhau hạng 1 và 2 ⇒ đều là 1,5.
    const result = wilcoxonSignedRankTest([
      { a: 5, b: 3 },
      { a: 6, b: 4 },
      { a: 7, b: 2 },
    ]);
    expect(result.wPlus).toBeCloseTo(1.5 + 1.5 + 3, 10);
    expect(result.tiedGroups).toEqual([2]);
  });

  test('cỡ mẫu lớn thì chuyển sang xấp xỉ chuẩn', () => {
    const pairs = Array.from({ length: 40 }, (_, i) => ({ a: i % 7, b: (i % 5) + 1 }));
    expect(wilcoxonSignedRankTest(pairs).method).toBe('normal-approximation');
  });

  test('xấp xỉ chuẩn và kiểm định chính xác cho cùng kết luận ở vùng giáp ranh', () => {
    // Mục đích: bắt lỗi thô — sai hệ số 2, lấy sai đuôi phân bố, quên hiệu chỉnh
    // liên tục. KHÔNG phải đo chất lượng xấp xỉ: ở n = 25 và có chênh lệch trùng
    // nhau, lệch cỡ 0,01 giữa hai cách là bình thường và đúng như lý thuyết.
    const pairs = Array.from({ length: 25 }, (_, i) => ({ a: (i * 3) % 11, b: (i * 5) % 9 }));
    const exact = wilcoxonSignedRankTest(pairs, { method: 'exact' });
    const approx = wilcoxonSignedRankTest(pairs, { method: 'normal-approximation' });

    expect(Math.abs(approx.p - exact.p)).toBeLessThan(0.02);
    expect(approx.significant).toBe(exact.significant);
  });

  test('xin kiểm định chính xác mà có chênh lệch trùng nhau thì phải cảnh báo', () => {
    // Bẫy: phân bố chính xác của W+ dựng trên hạng 1..n **không trùng**. Có trùng
    // thì phân bố thật khác đi, nên "exact" không còn chính xác. Im lặng ở đây là
    // báo cáo một con số chắc chắn hơn thực tế.
    const withTies = wilcoxonSignedRankTest(
      [{ a: 5, b: 3 }, { a: 6, b: 4 }, { a: 7, b: 2 }],
      { method: 'exact' },
    );
    expect(withTies.tiedGroups).toEqual([2]);
    expect(withTies.note).toMatch(/trùng/i);
  });

  test('không có chênh lệch trùng nhau thì kiểm định chính xác không kèm cảnh báo', () => {
    const noTies = wilcoxonSignedRankTest(
      [{ a: 4, b: 3 }, { a: 2, b: 4 }, { a: 6, b: 3 }],
      { method: 'exact' },
    );
    expect(noTies.tiedGroups).toEqual([]);
    expect(noTies.note).toBeUndefined();
  });

  test('chọn tự động thì tránh kiểm định chính xác khi có trùng nhau', () => {
    const auto = wilcoxonSignedRankTest([{ a: 5, b: 3 }, { a: 6, b: 4 }, { a: 7, b: 2 }]);
    expect(auto.method).toBe('normal-approximation');
  });

  test('mọi cặp đều không chênh lệch thì p = 1 kèm ghi chú', () => {
    const result = wilcoxonSignedRankTest([{ a: 3, b: 3 }, { a: 4, b: 4 }]);
    expect(result.p).toBe(1);
    expect(result.note).toMatch(/không có chênh lệch/i);
  });

  test('nêu chiều của hiệu ứng', () => {
    expect(wilcoxonSignedRankTest([{ a: 5, b: 1 }, { a: 4, b: 2 }]).favours).toBe('a');
    expect(wilcoxonSignedRankTest([{ a: 1, b: 5 }, { a: 2, b: 4 }]).favours).toBe('b');
  });

  test('bộ rỗng thì báo lỗi', () => {
    expect(() => wilcoxonSignedRankTest([])).toThrow(/không có cặp/i);
  });
});

describe('pairResponses — biến log lượt nghe thành cặp so sánh', () => {
  const trial = (participant, order, condition, correct) => ({
    participant_index: participant,
    order,
    condition,
    correct,
  });

  test('ghép theo người tham gia, lấy LƯỢT ĐẦU của mỗi điều kiện', () => {
    // Thiết kế trong-người với 4 địa điểm và 3 điều kiện thì một điều kiện xuất
    // hiện hai lần. Lấy lượt đầu để hiệu ứng luyện tập rơi đều lên hai điều
    // kiện đang so sánh; lượt thừa vẫn dùng được cho phân tích khác.
    const pairs = pairResponses(
      [
        trial(0, 1, 'layered', true),
        trial(0, 2, 'isolated', false),
        trial(0, 4, 'layered', false),
      ],
      { conditionA: 'layered', conditionB: 'isolated', field: 'correct' },
    );
    expect(pairs).toEqual([{ participant_index: 0, a: true, b: false }]);
  });

  test('bỏ người thiếu một trong hai điều kiện, và ghi rõ', () => {
    const result = pairResponses(
      [trial(0, 1, 'layered', true), trial(1, 1, 'layered', true), trial(1, 2, 'isolated', true)],
      { conditionA: 'layered', conditionB: 'isolated', field: 'correct', withReport: true },
    );
    expect(result.pairs).toHaveLength(1);
    expect(result.incomplete).toEqual([0]);
  });

  test('bỏ qua điều kiện thứ ba khi so hai điều kiện', () => {
    const pairs = pairResponses(
      [
        trial(0, 1, 'scrambled', true),
        trial(0, 2, 'layered', true),
        trial(0, 3, 'isolated', false),
      ],
      { conditionA: 'layered', conditionB: 'isolated', field: 'correct' },
    );
    expect(pairs).toHaveLength(1);
  });

  test('ghép được cả trường điểm số cho H2', () => {
    const pairs = pairResponses(
      [
        { participant_index: 0, order: 1, condition: 'layered', pleasantness: 4 },
        { participant_index: 0, order: 2, condition: 'isolated', pleasantness: 2 },
      ],
      { conditionA: 'layered', conditionB: 'isolated', field: 'pleasantness' },
    );
    expect(pairs).toEqual([{ participant_index: 0, a: 4, b: 2 }]);
  });

  test('báo lỗi khi log thiếu trường cần so', () => {
    expect(() =>
      pairResponses([trial(0, 1, 'layered', true), trial(0, 2, 'isolated', true)], {
        conditionA: 'layered',
        conditionB: 'isolated',
        field: 'khong_co',
      }),
    ).toThrow(/khong_co/);
  });
});
