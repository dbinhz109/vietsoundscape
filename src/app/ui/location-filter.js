/**
 * Lọc và tìm địa điểm (FR-03).
 *
 * Năm tiêu chí của BA: vùng miền, nhóm Krause, vai Schafer, thời điểm trong
 * ngày, mức mai một — cộng một ô tìm chữ. Kết hợp là **giao**: thêm tiêu chí
 * là thu hẹp. Địa điểm khớp nhóm/vai/mức mai một khi có **ít nhất một** mẫu âm
 * khớp; khớp thời điểm khi có ít nhất một bản trộn ở thời điểm đó.
 *
 * Phần tính toán (`filterLocations`) là hàm thuần, tách khỏi phần dựng form để
 * kiểm được không cần DOM và để `main.js` dùng lại khi trạng thái đến từ URL.
 */

import {
  ENDANGERMENT_LEVELS,
  KRAUSE_CLASSES,
  REGIONS,
  SCHAFER_ROLES,
  TIMES_OF_DAY,
} from '../../domain/taxonomy.js';
import {
  ENDANGERMENT_LABEL,
  KRAUSE_LABEL,
  REGION_LABEL,
  SCHAFER_LABEL,
  TIME_OF_DAY_LABEL,
} from '../../domain/labels.js';

/**
 * Chuẩn hoá để so chữ: bỏ dấu, hạ chữ, đ → d, gộp khoảng trắng. Người dùng
 * điện thoại thường gõ không dấu; bắt họ gõ đúng "Huế" mới ra Huế là bộ tìm
 * kiếm không ai dùng.
 * @param {string} value
 */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const groupBy = (items, key) => {
  const map = new Map();
  for (const item of items) {
    const id = item?.[key];
    if (!id) continue;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(item);
  }
  return map;
};

/**
 * @param {object} args
 * @param {Array<object>} args.locations thuộc tính địa điểm (`feature.properties`)
 * @param {Array<object>} args.clips mẫu âm
 * @param {Array<object>} args.recipes mục trong `data/recipes/index.json`, có `time_of_day`
 * @param {import('../state/url-state.js').LocationFilter} args.filter
 * @returns {string[]} `location_id` khớp, giữ thứ tự đầu vào
 */
export function filterLocations({ locations, clips, recipes, filter }) {
  const clipsAt = groupBy(clips ?? [], 'location_id');
  const recipesAt = groupBy(recipes ?? [], 'location_id');
  const needle = filter.q ? normalizeText(filter.q) : '';

  return locations
    .filter((location) => {
      const own = clipsAt.get(location.location_id) ?? [];
      const mixes = recipesAt.get(location.location_id) ?? [];

      if (filter.region && location.region !== filter.region) return false;
      if (filter.krause && !own.some((c) => c.krause_class === filter.krause)) return false;
      if (filter.schafer && !own.some((c) => c.schafer_role === filter.schafer)) return false;
      if (filter.endangerment && !own.some((c) => c.endangerment_level === filter.endangerment)) {
        return false;
      }
      if (filter.timeOfDay && !mixes.some((r) => r.time_of_day === filter.timeOfDay)) return false;

      if (needle) {
        const haystack = normalizeText(
          [location.name_vi, location.detail_vi, location.signature_vi, ...own.map((c) => c.title_vi)].join(' '),
        );
        if (!haystack.includes(needle)) return false;
      }
      return true;
    })
    .map((location) => location.location_id);
}

const CRITERIA = Object.freeze([
  { key: 'region', label: 'Vùng miền', vocab: REGIONS, labels: REGION_LABEL },
  { key: 'krause', label: 'Nhóm nguồn phát', vocab: KRAUSE_CLASSES, labels: KRAUSE_LABEL },
  { key: 'schafer', label: 'Vai âm thanh', vocab: SCHAFER_ROLES, labels: SCHAFER_LABEL },
  { key: 'timeOfDay', label: 'Thời điểm trong ngày', vocab: TIMES_OF_DAY, labels: TIME_OF_DAY_LABEL },
  { key: 'endangerment', label: 'Mức mai một', vocab: ENDANGERMENT_LEVELS, labels: ENDANGERMENT_LABEL },
]);

/** Bỏ trường trống để bộ lọc rỗng là `{}` — khớp với `url-state.js`. */
const compact = (filter) =>
  Object.fromEntries(Object.entries(filter).filter(([, value]) => value));

/**
 * @param {object} options
 * @param {import('../state/url-state.js').LocationFilter} options.value bộ lọc ban đầu (từ URL)
 * @param {(filter: import('../state/url-state.js').LocationFilter) => void} options.onChange
 * @returns {HTMLFormElement & { setResultCount(matched: number, total: number): void }}
 */
export function createLocationFilter({ value, onChange }) {
  const form = document.createElement('form');
  form.className = 'filter-form';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Lọc và tìm địa điểm');

  const current = { ...compact(value ?? {}) };
  const emit = () => onChange(compact(current));

  const field = (id, labelText, control) => {
    const wrap = document.createElement('div');
    wrap.className = 'filter-field';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    control.id = id;
    wrap.append(label, control);
    return wrap;
  };

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'filter-search';
  search.placeholder = 'Tìm tên nơi, tiếng gì…';
  search.autocomplete = 'off';
  search.value = current.q ?? '';
  search.addEventListener('input', () => {
    current.q = search.value.trim();
    emit();
  });
  form.append(field('filter-q', 'Tìm', search));

  const row = document.createElement('div');
  row.className = 'filter-row';
  const selects = [];
  for (const { key, label, vocab, labels } of CRITERIA) {
    const select = document.createElement('select');
    select.className = 'filter-select';
    const any = document.createElement('option');
    any.value = '';
    any.textContent = 'Tất cả';
    select.append(any);
    for (const code of vocab) {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = labels[code];
      select.append(option);
    }
    select.value = current[key] ?? '';
    select.addEventListener('change', () => {
      current[key] = select.value;
      emit();
    });
    selects.push({ key, select });
    row.append(field(`filter-${key}`, label, select));
  }
  form.append(row);

  const footer = document.createElement('div');
  footer.className = 'filter-footer';
  const count = document.createElement('output');
  count.className = 'filter-count';
  count.setAttribute('role', 'status');
  count.setAttribute('aria-live', 'polite');

  const reset = document.createElement('button');
  reset.type = 'reset';
  reset.className = 'filter-reset';
  reset.textContent = 'Xoá lọc';
  footer.append(count, reset);
  form.append(footer);

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', (event) => {
    event.preventDefault();
    search.value = '';
    for (const { key, select } of selects) {
      select.value = '';
      delete current[key];
    }
    delete current.q;
    emit();
  });

  form.setResultCount = (matched, total) => {
    count.textContent =
      matched === 0 ? 'Không địa điểm nào khớp — thử bỏ một tiêu chí' : `${matched}/${total} địa điểm khớp`;
  };

  return form;
}
