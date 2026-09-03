import { describe, expect, test } from 'vitest';
import { composeAnswerOptions, orderAnswerOptions } from './answer-options.js';

const LOCATIONS = ['hanoi-pho-co', 'hue-thien-mu', 'cai-rang', 'buon-e-de'];
const DISTRACTORS = ['sa-pa', 'hoi-an', 'da-lat', 'phu-quoc'];

describe('composeAnswerOptions — danh sách trả lời = vùng thật + phương án nhiễu', () => {
  test('gộp đủ cả hai, vùng thật trước rồi tới nhiễu, đúng thứ tự khai', () => {
    expect(composeAnswerOptions(LOCATIONS, DISTRACTORS)).toEqual([...LOCATIONS, ...DISTRACTORS]);
  });

  test('không có phương án nhiễu thì ném lỗi — đó chính là lỗi loại trừ', () => {
    // Danh sách trả lời = đúng 4 vùng sẽ nghe ⇒ nhớ 3 câu trước là lượt 4 còn
    // một lựa chọn. Cấm ở đây để không ai vô tình dựng lại thiết kế có lỗ.
    expect(() => composeAnswerOptions(LOCATIONS, [])).toThrow(/nhiễu|loại trừ/i);
  });

  test('phương án nhiễu trùng một vùng thật thì ném lỗi', () => {
    expect(() => composeAnswerOptions(LOCATIONS, ['sa-pa', 'hue-thien-mu'])).toThrow(
      /hue-thien-mu/,
    );
  });

  test('mã trùng nhau trong cùng danh sách thì ném lỗi', () => {
    expect(() => composeAnswerOptions(LOCATIONS, ['sa-pa', 'sa-pa'])).toThrow(/sa-pa/);
  });

  test('không làm đổi mảng đầu vào', () => {
    const locations = [...LOCATIONS];
    const distractors = [...DISTRACTORS];
    composeAnswerOptions(locations, distractors);
    expect(locations).toEqual(LOCATIONS);
    expect(distractors).toEqual(DISTRACTORS);
  });
});

describe('orderAnswerOptions — thứ tự theo seed (người × lượt), tái lập được', () => {
  const options = composeAnswerOptions(LOCATIONS, DISTRACTORS);

  test('giữ nguyên tập phần tử, không thêm không bớt', () => {
    const ordered = orderAnswerOptions(options, { participantIndex: 3, order: 2 });
    expect([...ordered].sort()).toEqual([...options].sort());
  });

  test('cùng người, cùng lượt → cùng thứ tự (dựng lại phiên được)', () => {
    const a = orderAnswerOptions(options, { participantIndex: 7, order: 3 });
    const b = orderAnswerOptions(options, { participantIndex: 7, order: 3 });
    expect(a).toEqual(b);
  });

  test('cùng người, lượt khác → thứ tự khác (không học được vị trí)', () => {
    for (let participantIndex = 0; participantIndex < 12; participantIndex += 1) {
      const seen = new Set();
      for (let order = 1; order <= 4; order += 1) {
        seen.add(orderAnswerOptions(options, { participantIndex, order }).join('|'));
      }
      expect(seen.size, `người ${participantIndex}`).toBe(4);
    }
  });

  test('người khác, cùng lượt → thứ tự khác', () => {
    const seen = new Set();
    for (let participantIndex = 0; participantIndex < 12; participantIndex += 1) {
      seen.add(orderAnswerOptions(options, { participantIndex, order: 1 }).join('|'));
    }
    expect(seen.size).toBe(12);
  });

  test('vùng thật không dồn về một phía của danh sách', () => {
    // Nếu vùng thật hay đứng đầu (hay cuối) thì vị trí trở thành gợi ý. Qua
    // 48 người × 4 lượt, vị trí trung bình của hai nhóm phải xấp xỉ nhau.
    const position = { real: [], distractor: [] };
    for (let participantIndex = 0; participantIndex < 48; participantIndex += 1) {
      for (let order = 1; order <= 4; order += 1) {
        orderAnswerOptions(options, { participantIndex, order }).forEach((id, index) => {
          position[LOCATIONS.includes(id) ? 'real' : 'distractor'].push(index);
        });
      }
    }
    const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(Math.abs(mean(position.real) - mean(position.distractor))).toBeLessThan(0.4);
  });

  test('không làm đổi mảng đầu vào', () => {
    const copy = [...options];
    orderAnswerOptions(options, { participantIndex: 0, order: 1 });
    expect(options).toEqual(copy);
  });

  test('số thứ tự người hay lượt không hợp lệ thì ném lỗi', () => {
    expect(() => orderAnswerOptions(options, { participantIndex: -1, order: 1 })).toThrow();
    expect(() => orderAnswerOptions(options, { participantIndex: 0, order: 0 })).toThrow();
    expect(() => orderAnswerOptions(options, { participantIndex: 1.5, order: 1 })).toThrow();
  });
});
