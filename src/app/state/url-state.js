/**
 * Trạng thái nằm trên URL (FR-03, FR-20).
 *
 * Địa điểm, bản trộn và vị trí từng thanh trượt đều đi vào URL, nên một bản trộn
 * người dùng tự pha ra chia sẻ được bằng cách gửi liên kết — và mở trên máy khác
 * cho ra đúng bản trộn đó.
 *
 * URL là dữ liệu bên ngoài nên **không tin được**: mọi giá trị sai định dạng bị
 * bỏ qua, mọi giá trị ngoài khoảng bị kẹp về biên. Trang không được sập vì một
 * liên kết dán sai.
 */

const MIX_PRECISION = 2;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/**
 * @typedef {object} UrlState
 * @property {string | null} locationId
 * @property {string | null} recipeId
 * @property {Record<string, number>} layerSliders
 */

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
  return params;
}
