import { describe, expect, test } from 'vitest';
import { parseUrlState, toSearchParams } from './url-state.js';

describe('parseUrlState', () => {
  test('không có tham số thì không chọn địa điểm nào', () => {
    expect(parseUrlState('')).toEqual({ locationId: null, recipeId: null, layerSliders: {} });
  });

  test('đọc được địa điểm và bản trộn', () => {
    const state = parseUrlState('?location=hue-thien-mu&recipe=hue-trua-he');
    expect(state).toMatchObject({ locationId: 'hue-thien-mu', recipeId: 'hue-trua-he' });
  });

  test('đọc được vị trí thanh trượt từng lớp', () => {
    const state = parseUrlState('?location=hanoi-pho-co&mix=HN-01:0.7,HN-03:0.25');
    expect(state.layerSliders).toEqual({ 'HN-01': 0.7, 'HN-03': 0.25 });
  });

  test('bỏ qua giá trị thanh trượt sai định dạng thay vì làm sập trang', () => {
    // URL do người dùng dán vào — không được tin.
    const state = parseUrlState('?mix=HN-01:abc,HN-03:0.5,HN-06');
    expect(state.layerSliders).toEqual({ 'HN-03': 0.5 });
  });

  test('kẹp giá trị ngoài khoảng về biên', () => {
    const state = parseUrlState('?mix=HN-01:9,HN-03:-4');
    expect(state.layerSliders).toEqual({ 'HN-01': 1, 'HN-03': 0 });
  });
});

describe('toSearchParams', () => {
  test('dựng lại được URL từ trạng thái', () => {
    const params = toSearchParams({
      locationId: 'hanoi-pho-co',
      recipeId: 'hanoi-pho-co-sang-som',
      layerSliders: { 'HN-01': 0.7 },
    });
    expect(params.get('location')).toBe('hanoi-pho-co');
    expect(params.get('recipe')).toBe('hanoi-pho-co-sang-som');
    expect(params.get('mix')).toBe('HN-01:0.7');
  });

  test('bỏ qua trường rỗng để URL không có tham số vô nghĩa', () => {
    const params = toSearchParams({ locationId: 'hue-thien-mu' });
    expect(params.has('recipe')).toBe(false);
    expect(params.has('mix')).toBe(false);
  });

  test('đi vòng tròn thì trạng thái không đổi', () => {
    const state = {
      locationId: 'buon-e-de',
      recipeId: 'buon-e-de-dem',
      layerSliders: { 'TN-01': 0.55, 'TN-05': 0.8 },
    };
    expect(parseUrlState(`?${toSearchParams(state)}`)).toEqual(state);
  });

  test('làm gọn số để URL đọc được', () => {
    const params = toSearchParams({ locationId: 'x', layerSliders: { A: 0.123456789 } });
    expect(params.get('mix')).toBe('A:0.12');
  });
});
