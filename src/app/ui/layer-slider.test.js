// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createLayerSlider } from './layer-slider.js';

const build = (overrides = {}) =>
  createLayerSlider({
    id: 'layer-HU-01',
    label: 'Ve trưa hè',
    value: 0.7,
    onInput: () => {},
    ...overrides,
  });

const inputOf = (row) => row.querySelector('input[type=range]');

const drag = (row, value) => {
  const input = inputOf(row);
  input.value = String(value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  return input;
};

describe('createLayerSlider', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  test('nhãn gắn đúng với thanh trượt qua thuộc tính for', () => {
    const row = build();
    expect(row.querySelector('label').getAttribute('for')).toBe('layer-HU-01');
    expect(inputOf(row).id).toBe('layer-HU-01');
  });

  test('trình đọc màn hình đọc ra nhãn kèm phần trăm, không đọc số trơ', () => {
    // Mặc định trình đọc sẽ đọc "0.7" — vô nghĩa với người nghe (FR-61).
    expect(inputOf(build()).getAttribute('aria-valuetext')).toBe('Ve trưa hè — 70 phần trăm');
  });

  test('ở mức 0 thì đọc là "đã tắt" chứ không phải "0 phần trăm"', () => {
    expect(inputOf(build({ value: 0 })).getAttribute('aria-valuetext')).toBe('Ve trưa hè — đã tắt');
  });

  test('nhãn đọc được cập nhật khi kéo', () => {
    const row = build();
    const input = drag(row, 0.25);
    expect(input.getAttribute('aria-valuetext')).toBe('Ve trưa hè — 25 phần trăm');
  });

  test('hiện số phần trăm cho người nhìn thấy', () => {
    const row = build();
    expect(row.querySelector('output').textContent).toBe('70%');
    drag(row, 0.4);
    expect(row.querySelector('output').textContent).toBe('40%');
  });

  test('gọi lại hàm xử lý với giá trị số, không phải chuỗi', () => {
    const onInput = vi.fn();
    drag(build({ onInput }), 0.33);
    expect(onInput).toHaveBeenCalledWith(0.33);
  });

  test('dùng bàn phím được — thanh trượt là input range thật, không phải div', () => {
    // Tự dựng thanh trượt bằng div là cách nhanh nhất để mất hoàn toàn khả năng
    // dùng bàn phím (FR-60).
    const input = inputOf(build());
    expect(input.tagName).toBe('INPUT');
    expect(input.type).toBe('range');
    expect(input.min).toBe('0');
    expect(input.max).toBe('1');
  });

  test('hiện dòng phụ khi có', () => {
    const row = build({ hint: 'keynote · biophony' });
    expect(row.querySelector('.slider-hint').textContent).toBe('keynote · biophony');
    // Dòng phụ nằm trong label nên trình đọc cũng đọc được.
    expect(row.querySelector('label').textContent).toContain('keynote');
  });

  test('không có dòng phụ thì không dựng phần tử rỗng', () => {
    expect(build().querySelector('.slider-hint')).toBeNull();
  });
});

describe('mô tả văn bản cho từng lớp âm (FR-26, FR-63)', () => {
  test('có mô tả thì dựng đoạn văn và nối vào thanh trượt bằng aria-describedby', () => {
    const moTa = 'Tiếng chuông chùa Thiên Mụ, vang kéo dài trên mặt sông Hương.';
    const row = createLayerSlider({
      id: 'layer-HU-04',
      label: 'Đại hồng chung',
      value: 0.5,
      onInput: () => {},
      description: moTa,
    });

    const paragraph = row.querySelector('.slider-description');
    const input = row.querySelector('input');

    expect(paragraph.textContent).toBe(moTa);
    expect(paragraph.id).toBeTruthy();
    expect(input.getAttribute('aria-describedby')).toBe(paragraph.id);
  });

  test('không có mô tả thì không dựng đoạn văn rỗng', () => {
    const row = createLayerSlider({
      id: 'layer-HU-04',
      label: 'Đại hồng chung',
      value: 0.5,
      onInput: () => {},
    });

    expect(row.querySelector('.slider-description')).toBeNull();
    expect(row.querySelector('input').hasAttribute('aria-describedby')).toBe(false);
  });
});
