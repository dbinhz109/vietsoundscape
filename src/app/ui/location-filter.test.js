// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createLocationFilter, filterLocations, normalizeText } from './location-filter.js';

const LOCATIONS = [
  { location_id: 'hanoi-pho-co', name_vi: 'Phố cổ Hà Nội', region: 'bac-bo', detail_vi: 'Hàng Bạc', signature_vi: 'Xe máy, giọng rao' },
  { location_id: 'cai-rang', name_vi: 'Chợ nổi Cái Răng', region: 'dbscl', detail_vi: 'Cần Thơ', signature_vi: 'Máy đuôi tôm' },
  { location_id: 'hue-thien-mu', name_vi: 'Huế — chùa Thiên Mụ', region: 'trung-bo', detail_vi: 'Sân chùa', signature_vi: 'Chuông lớn' },
];

const CLIPS = [
  { id: 'HN-01', location_id: 'hanoi-pho-co', title_vi: 'Rì rầm xe máy', krause_class: 'anthrophony', schafer_role: 'keynote', endangerment_level: 'declining' },
  { id: 'HN-08', location_id: 'hanoi-pho-co', title_vi: 'Tàu điện leng keng', krause_class: 'anthrophony', schafer_role: 'soundmark', endangerment_level: 'lost' },
  { id: 'CR-04', location_id: 'cai-rang', title_vi: 'Máy đuôi tôm', krause_class: 'anthrophony', schafer_role: 'soundmark', endangerment_level: 'stable' },
  { id: 'CR-08', location_id: 'cai-rang', title_vi: 'Mưa rào trên sông', krause_class: 'geophony', schafer_role: 'signal', endangerment_level: 'stable' },
  { id: 'HU-01', location_id: 'hue-thien-mu', title_vi: 'Ve trưa hè', krause_class: 'biophony', schafer_role: 'keynote', endangerment_level: 'stable' },
];

const RECIPES = [
  { id: 'hanoi-pho-co-sang-som', location_id: 'hanoi-pho-co', time_of_day: 'early_morning' },
  { id: 'cai-rang-rang-sang', location_id: 'cai-rang', time_of_day: 'dawn' },
  { id: 'hue-trua-he', location_id: 'hue-thien-mu', time_of_day: 'midday' },
];

const run = (filter) => filterLocations({ locations: LOCATIONS, clips: CLIPS, recipes: RECIPES, filter });

describe('filterLocations', () => {
  test('không có tiêu chí thì giữ nguyên mọi địa điểm, đúng thứ tự', () => {
    expect(run({})).toEqual(['hanoi-pho-co', 'cai-rang', 'hue-thien-mu']);
  });

  test('lọc theo vùng miền', () => {
    expect(run({ region: 'dbscl' })).toEqual(['cai-rang']);
  });

  test('lọc theo nhóm Krause: địa điểm khớp khi có ít nhất một mẫu thuộc nhóm', () => {
    expect(run({ krause: 'biophony' })).toEqual(['hue-thien-mu']);
    expect(run({ krause: 'anthrophony' })).toEqual(['hanoi-pho-co', 'cai-rang']);
  });

  test('lọc theo vai Schafer', () => {
    expect(run({ schafer: 'soundmark' })).toEqual(['hanoi-pho-co', 'cai-rang']);
  });

  test('lọc theo thời điểm trong ngày qua bản trộn', () => {
    expect(run({ timeOfDay: 'midday' })).toEqual(['hue-thien-mu']);
  });

  test('lọc theo mức mai một — "lost" chỉ ra nơi có âm đã mất', () => {
    expect(run({ endangerment: 'lost' })).toEqual(['hanoi-pho-co']);
  });

  test('kết hợp nhiều tiêu chí là giao (AND), không phải hợp', () => {
    expect(run({ krause: 'anthrophony', schafer: 'soundmark', region: 'bac-bo' })).toEqual(['hanoi-pho-co']);
    expect(run({ krause: 'anthrophony', timeOfDay: 'midday' })).toEqual([]);
  });

  test('tìm chữ: khớp tên địa điểm, chi tiết, chữ ký âm và tên mẫu', () => {
    expect(run({ q: 'Cần Thơ' })).toEqual(['cai-rang']);
    expect(run({ q: 'tàu điện' })).toEqual(['hanoi-pho-co']);
    expect(run({ q: 'chuông' })).toEqual(['hue-thien-mu']);
  });

  test('tìm chữ bỏ dấu: gõ "hue" vẫn ra Huế, gõ "cho noi" vẫn ra Chợ nổi', () => {
    expect(run({ q: 'hue' })).toEqual(['hue-thien-mu']);
    expect(run({ q: 'cho noi' })).toEqual(['cai-rang']);
  });

  test('mẫu không có địa điểm hoặc thiếu trường thì không làm sập bộ lọc', () => {
    const clips = [...CLIPS, { id: 'X-01' }, { id: 'X-02', location_id: 'nowhere', krause_class: 'geophony' }];
    expect(filterLocations({ locations: LOCATIONS, clips, recipes: RECIPES, filter: { krause: 'geophony' } })).toEqual(['cai-rang']);
  });
});

describe('normalizeText', () => {
  test('bỏ dấu, hạ chữ, đổi đ thành d, gộp khoảng trắng', () => {
    expect(normalizeText('  Chợ  nổi Cái Răng — Đồng bằng ')).toBe('cho noi cai rang — dong bang');
  });
});

describe('createLocationFilter', () => {
  beforeEach(() => document.body.replaceChildren());

  test('là một form tìm kiếm có nhãn, mỗi ô có label gắn đúng', () => {
    const form = createLocationFilter({ value: {}, onChange: () => {} });
    expect(form.tagName).toBe('FORM');
    expect(form.getAttribute('role')).toBe('search');
    for (const control of form.querySelectorAll('input, select')) {
      const label = form.querySelector(`label[for="${control.id}"]`);
      expect(label, `thiếu label cho #${control.id}`).not.toBeNull();
    }
  });

  test('có đủ năm ô chọn cho năm tiêu chí của FR-03 và một ô tìm chữ', () => {
    const form = createLocationFilter({ value: {}, onChange: () => {} });
    expect(form.querySelectorAll('select').length).toBe(5);
    expect(form.querySelectorAll('input[type=search]').length).toBe(1);
  });

  test('ô chọn hiện nhãn tiếng Việt, không hiện mã máy', () => {
    const form = createLocationFilter({ value: {}, onChange: () => {} });
    const texts = [...form.querySelectorAll('option')].map((o) => o.textContent);
    expect(texts).toContain('Đồng bằng sông Cửu Long');
    expect(texts).not.toContain('dbscl');
    expect(texts).toContain('Dấu ấn âm thanh');
  });

  test('giá trị ban đầu từ URL được đặt vào ô', () => {
    const form = createLocationFilter({ value: { region: 'trung-bo', q: 'chuông' }, onChange: () => {} });
    expect(form.querySelector('#filter-region').value).toBe('trung-bo');
    expect(form.querySelector('#filter-q').value).toBe('chuông');
  });

  test('đổi một ô thì gọi lại với bộ lọc mới, bỏ trường trống', () => {
    const onChange = vi.fn();
    const form = createLocationFilter({ value: {}, onChange });
    const select = form.querySelector('#filter-krause');
    select.value = 'geophony';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith({ krause: 'geophony' });
  });

  test('gõ chữ thì gọi lại với q, và nút xoá đưa về rỗng', () => {
    const onChange = vi.fn();
    const form = createLocationFilter({ value: { region: 'bac-bo' }, onChange });
    const q = form.querySelector('#filter-q');
    q.value = 'rao';
    q.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).toHaveBeenLastCalledWith({ region: 'bac-bo', q: 'rao' });

    form.querySelector('button[type=reset]').click();
    expect(onChange).toHaveBeenLastCalledWith({});
    expect(form.querySelector('#filter-region').value).toBe('');
  });

  test('gửi form không tải lại trang', () => {
    const form = createLocationFilter({ value: {}, onChange: () => {} });
    const event = new Event('submit', { cancelable: true, bubbles: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  test('báo số kết quả cho trình đọc màn hình', () => {
    const form = createLocationFilter({ value: {}, onChange: () => {} });
    form.setResultCount(1, 4);
    const out = form.querySelector('[role=status]');
    expect(out.textContent).toBe('1/4 địa điểm khớp');
    form.setResultCount(0, 4);
    expect(out.textContent).toBe('Không địa điểm nào khớp — thử bỏ một tiêu chí');
  });
});
