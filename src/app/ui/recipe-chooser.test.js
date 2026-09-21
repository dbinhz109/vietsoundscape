// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createRecipeChooser } from './recipe-chooser.js';

const RECIPES = [
  { id: 'hanoi-pho-co-sang-som', location_id: 'hanoi-pho-co', title_vi: 'Phố cổ Hà Nội — sáng sớm', time_of_day: 'early_morning' },
  { id: 'hanoi-pho-co-trua-mua', location_id: 'hanoi-pho-co', title_vi: 'Phố cổ Hà Nội — trưa mưa', time_of_day: 'midday' },
  { id: 'hanoi-pho-co-dem', location_id: 'hanoi-pho-co', title_vi: 'Phố cổ Hà Nội — đêm', time_of_day: 'night' },
];

describe('createRecipeChooser', () => {
  beforeEach(() => document.body.replaceChildren());

  test('một nhóm nút có nhãn, mỗi bản trộn một nút, nút đang chọn có aria-pressed', () => {
    const el = createRecipeChooser({ recipes: RECIPES, currentId: 'hanoi-pho-co-dem', onChoose: () => {} });
    expect(el.getAttribute('role')).toBe('group');
    expect(el.getAttribute('aria-label')).toBe('Chọn bản trộn');
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    expect([...buttons].map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'false', 'true']);
  });

  test('nút hiện thời điểm trong ngày bằng tiếng Việt, không hiện mã', () => {
    const el = createRecipeChooser({ recipes: RECIPES, currentId: RECIPES[0].id, onChoose: () => {} });
    const texts = [...el.querySelectorAll('button')].map((b) => b.textContent);
    expect(texts).toEqual(['Sáng sớm', 'Giữa trưa', 'Đêm']);
    expect(el.textContent).not.toContain('early_morning');
  });

  test('bấm nút khác thì gọi lại với mã bản trộn; bấm nút đang chọn thì không', () => {
    const onChoose = vi.fn();
    const el = createRecipeChooser({ recipes: RECIPES, currentId: RECIPES[0].id, onChoose });
    const buttons = el.querySelectorAll('button');
    buttons[2].click();
    expect(onChoose).toHaveBeenCalledWith('hanoi-pho-co-dem');
    buttons[0].click();
    expect(onChoose).toHaveBeenCalledTimes(1);
  });

  test('chỉ một bản trộn thì không dựng gì — không có gì để chọn', () => {
    expect(createRecipeChooser({ recipes: [RECIPES[0]], currentId: RECIPES[0].id, onChoose: () => {} })).toBeNull();
  });

  test('tiêu đề đầy đủ nằm trong title để đọc khi rê chuột / trình đọc màn hình', () => {
    const el = createRecipeChooser({ recipes: RECIPES, currentId: RECIPES[0].id, onChoose: () => {} });
    expect(el.querySelectorAll('button')[1].getAttribute('aria-label')).toBe('Phố cổ Hà Nội — trưa mưa');
  });
});
