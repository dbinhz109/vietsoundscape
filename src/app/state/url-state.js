/**
 * Trạng thái nằm trên URL (FR-03, FR-20).
 *
 * Địa điểm, bản trộn, vị trí từng thanh trượt **và bộ lọc** đều đi vào URL, nên
 * một bản trộn người dùng tự pha — hay một góc nhìn đã lọc ("chỉ dấu ấn đã mất
 * ở Bắc Bộ") — chia sẻ được bằng cách gửi liên kết, và mở trên máy khác cho ra
 * đúng thứ đó.
 *
 * URL là dữ liệu bên ngoài nên **không tin được**: mọi giá trị sai định dạng bị
 * bỏ qua, mọi giá trị ngoài khoảng bị kẹp về biên, mọi mã ngoài từ vựng bị bỏ.
 * Trang không được sập vì một liên kết dán sai.
 */

import {
  ENDANGERMENT_LEVELS,
  KRAUSE_CLASSES,
  REGIONS,
  SCHAFER_ROLES,
  TIMES_OF_DAY,
} from '../../domain/taxonomy.js';

const MIX_PRECISION = 2;
/** Chữ tìm dài hơn thế này không còn là tìm nữa. */
const QUERY_MAX_CHARS = 80;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * Tên tham số URL ngắn, tiếng Việt không dấu — người dùng nhìn URL hiểu được.
 * Mỗi tiêu chí kèm từ vựng để kiểm giá trị.
 */
const FILTER_PARAMS = Object.freeze([
  { key: 'region', param: 'vung', vocab: REGIONS },
  { key: 'krause', param: 'nhom', vocab: KRAUSE_CLASSES },
  { key: 'schafer', param: 'vai', vocab: SCHAFER_ROLES },
  { key: 'timeOfDay', param: 'buoi', vocab: TIMES_OF_DAY },
  { key: 'endangerment', param: 'maimot', vocab: ENDANGERMENT_LEVELS },
]);

/**
 * @typedef {object} LocationFilter
 * @property {string} [region]
 * @property {string} [krause]
 * @property {string} [schafer]
 * @property {string} [timeOfDay]
 * @property {string} [endangerment]
 * @property {string} [q] chữ tìm tự do
 */

/**
 * @typedef {object} UrlState
 * @property {string | null} locationId
 * @property {string | null} recipeId
 * @property {Record<string, number>} layerSliders
 * @property {LocationFilter} filter chỉ chứa tiêu chí đang dùng
 */

/** @param {URLSearchParams} params */
function parseFilter(params) {
  /** @type {LocationFilter} */
  const filter = {};
  for (const { key, param, vocab } of FILTER_PARAMS) {
    const value = params.get(param);
    if (value && vocab.includes(value)) filter[key] = value;
  }
  const q = (params.get('q') ?? '').trim().slice(0, QUERY_MAX_CHARS);
  if (q) filter.q = q;
  return filter;
}

/**
 * @param {string} search phần truy vấn của URL, có hoặc không có dấu "?"
 * @returns {UrlState}
 */
export function parseUrlState(search) {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);

  /** @type {Record<string, number>} */
  const layerSliders = {};
  for (const entry of (params.get('mix') ?? '').split(',')) {
    if (!entry) continue;
    const [clipId, rawValue] = entry.split(':');
    if (!clipId || rawValue === undefined) continue;

    const value = Number.parseFloat(rawValue);
    if (!Number.isFinite(value)) continue;
    layerSliders[clipId] = clamp(value, 0, 1);
  }

  return {
    locationId: params.get('location'),
    recipeId: params.get('recipe'),
    layerSliders,
    filter: parseFilter(params),
  };
}

/**
 * @param {Partial<UrlState>} state
 * @returns {URLSearchParams}
 */
export function toSearchParams(state) {
  const params = new URLSearchParams();
  if (state.locationId) params.set('location', state.locationId);
  if (state.recipeId) params.set('recipe', state.recipeId);

  const entries = Object.entries(state.layerSliders ?? {});
  if (entries.length > 0) {
    params.set(
      'mix',
      entries
        .map(([clipId, value]) => `${clipId}:${Number(value.toFixed(MIX_PRECISION))}`)
        .join(','),
    );
  }

  const filter = state.filter ?? {};
  for (const { key, param } of FILTER_PARAMS) {
    if (filter[key]) params.set(param, filter[key]);
  }
  // Cắt ở cùng một ngưỡng với lúc đọc: link chia sẻ mở lại phải ra đúng bộ lọc
  // đã gửi, không phải một bộ lọc bị cắt bớt trong im lặng.
  if (filter.q) params.set('q', String(filter.q).trim().slice(0, QUERY_MAX_CHARS));
  return params;
}
