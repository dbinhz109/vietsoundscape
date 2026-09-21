import { describe, expect, test } from 'vitest';
import { mergeParticipantLogs } from './merge-logs.js';

const log = (index, overrides = {}) => ({
  design: 'within-subject',
  likert_fields: ['pleasant', 'chaotic'],
  participant_index: index,
  complete: true,
  trials: [
    { participant_index: index, order: 1, location_id: 'hanoi-pho-co', condition: 'layered', correct: true },
    { participant_index: index, order: 2, location_id: 'cai-rang', condition: 'isolated', correct: false },
  ],
  ...overrides,
});

describe('mergeParticipantLogs', () => {
  test('gộp nhiều tệp một người thành một bộ dữ liệu, giữ đủ lượt', () => {
    const merged = mergeParticipantLogs([log(1), log(2), log(3)]);
    expect(merged.trials.length).toBe(6);
    expect(new Set(merged.trials.map((t) => t.participant_index)).size).toBe(3);
    expect(merged.sources).toBe(3);
  });

  test('một tệp gộp sẵn nhiều người vẫn đọc được — không bắt đổi cách làm cũ', () => {
    const combined = { design: 'within-subject', likert_fields: ['pleasant'], trials: [...log(1).trials, ...log(2).trials] };
    expect(mergeParticipantLogs([combined]).trials.length).toBe(4);
  });

  test('trùng mã người tham gia là LỖI — hai người cùng mã thì phân điều kiện hỏng', () => {
    expect(() => mergeParticipantLogs([log(1), log(1)])).toThrow(/Mã người tham gia 1 trùng/);
  });

  test('phiên chưa hoàn tất bị loại theo tiêu chí §3, và đếm được số bị loại', () => {
    const merged = mergeParticipantLogs([log(1), log(2, { complete: false })]);
    expect(merged.trials.length).toBe(2);
    expect(merged.excluded).toEqual([{ participant_index: 2, reason: 'phiên không hoàn tất' }]);
  });

  test('thiết kế khác nhau giữa các tệp là LỖI — không trộn hai thiết kế', () => {
    expect(() => mergeParticipantLogs([log(1), log(2, { design: 'between-subject' })])).toThrow(/thiết kế/i);
  });

  test('danh sách thuộc tính khác nhau là LỖI — bộ câu hỏi đã đổi giữa chừng', () => {
    expect(() => mergeParticipantLogs([log(1), log(2, { likert_fields: ['pleasant'] })])).toThrow(/thuộc tính|likert/i);
  });

  test('tệp không có lượt nào bị bỏ qua kèm lý do, không làm hỏng cả mẻ', () => {
    const merged = mergeParticipantLogs([log(1), { design: 'within-subject', likert_fields: ['pleasant', 'chaotic'], participant_index: 9, trials: [] }]);
    expect(merged.trials.length).toBe(2);
    expect(merged.excluded[0].reason).toMatch(/không có lượt/);
  });

  test('giữ design và likert_fields cho bước phân tích', () => {
    const merged = mergeParticipantLogs([log(1), log(2)]);
    expect(merged.design).toBe('within-subject');
    expect(merged.likert_fields).toEqual(['pleasant', 'chaotic']);
  });

  test('sắp lượt theo người rồi theo thứ tự nghe — báo cáo đọc được', () => {
    const merged = mergeParticipantLogs([log(3), log(1), log(2)]);
    const keys = merged.trials.map((t) => `${t.participant_index}.${t.order}`);
    expect(keys).toEqual(['1.1', '1.2', '2.1', '2.2', '3.1', '3.2']);
  });

  test('danh sách rỗng là LỖI rõ ràng, không phải bộ dữ liệu rỗng im lặng', () => {
    expect(() => mergeParticipantLogs([])).toThrow(/không có tệp/i);
  });
});
