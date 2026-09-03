/**
 * Hợp đồng dữ liệu của **bản trộn** (BA §8.3).
 *
 * Bản trộn là **dữ liệu, không phải trạng thái giao diện**. Nhờ vậy người biên
 * tập tạo bản trộn mới không cần lập trình viên, bản trộn chia sẻ được qua URL
 * (FR-20), và kết xuất sẵn thành kích thích thực nghiệm cố định được (FR-52).
 *
 * Luật đáng chú ý nhất là `experimentReady`: nó biến rủi ro R-10 thành một phép
 * kiểm máy chạy được, thay vì một dòng ghi chú trong tài liệu.
 */

import { LOOPING_ROLES } from '../domain/taxonomy.js';

const isMissing = (value) => value === undefined || value === null || value === '';
const inRange = (value, min, max) => typeof value === 'number' && value >= min && value <= max;

/** Tra cứu mẫu âm theo mã — dùng chung cho bộ kiểm và tầng nạp dữ liệu. */
export function indexClipsById(clips) {
  return Object.fromEntries(clips.map((clip) => [clip.id, clip]));
}

/**
 * Bản trộn có dùng làm kích thích cho giả thuyết H1 được không?
 *
 * Điều kiện của rủi ro **R-10**: phải chứa ít nhất một mẫu do nhóm tự thu và đã
 * xác minh tại chỗ. Bản trộn toàn nền tải từ kho thì H1 **không kiểm được điều
 * gì** — người nghe chỉ đang đoán cái nhãn ta tự gán.
 *
 * @param {object} recipe
 * @param {Record<string, object>} clipsById
 * @returns {boolean}
 */
export function isExperimentReady(recipe, clipsById = {}) {
  const layers = Array.isArray(recipe.layers) ? recipe.layers : [];
  return layers.some((layer) => {
    const clip = clipsById[layer.clip_id];
    return Boolean(clip?.location_verified === true && clip?.must_verify_on_site === true);
  });
}

/**
 * Giấy phép hiệu lực của một bản trộn — hệ quả kỹ thuật của quyết định A0.4.
 *
 * **Copyleft lây sang.** Trộn một tệp nền CC BY-SA tải về cùng bản ghi nhóm tự
 * thu thì cả bản trộn bị ràng buộc chia sẻ lại cùng điều kiện — nhóm mất quyền
 * tự quyết với chính bản ghi của mình trong bản trộn đó. Đây là lý do quyết định
 * A0.4 khuyên **ưu tiên CC0 và CC BY, tránh SA** cho vật liệu sẽ đem trộn.
 *
 * Thứ tự ràng buộc từ lỏng đến chặt: CC0 → CC BY → CC BY-SA.
 *
 * @param {object} recipe
 * @param {Record<string, object>} clipsById
 * @returns {{license: string | null, copyleft: boolean, layerLicenses: Record<string, string>, warnings: string[]}}
 */
export function effectiveMixLicense(recipe, clipsById = {}) {
  const layers = Array.isArray(recipe.layers) ? recipe.layers : [];
  /** @type {Record<string, string>} */
  const layerLicenses = {};
  const warnings = [];
  const missing = [];

  for (const layer of layers) {
    const clip = clipsById[layer.clip_id];
    const license = clip?.license;
    if (isMissing(license)) missing.push(layer.clip_id);
    else layerLicenses[layer.clip_id] = license;
  }

  if (missing.length > 0) {
    warnings.push(
      `Không xác định được giấy phép bản trộn: lớp ${missing.join(', ')} chưa có giấy phép. ` +
        'Điền trước khi công bố, đừng đoán.',
    );
    return { license: null, copyleft: false, layerLicenses, warnings };
  }

  const values = Object.values(layerLicenses);
  const shareAlike = values.filter((license) => license.includes('-SA-'));
  const copyleft = shareAlike.length > 0;

  let license;
  if (copyleft) license = shareAlike[0];
  else if (values.some((l) => l.startsWith('CC-BY'))) license = values.find((l) => l.startsWith('CC-BY'));
  else if (values.every((l) => l === 'CC0-1.0')) license = 'CC0-1.0';
  else license = values[0];

  if (copyleft) {
    const own = Object.entries(layerLicenses)
      .filter(([, l]) => l === 'proprietary-own')
      .map(([id]) => id);
    if (own.length > 0) {
      warnings.push(
        `Lớp tự thu (${own.join(', ')}, giấy phép proprietary-own) bị ràng buộc bởi điều kiện ` +
          `SA của ${shareAlike.join(', ')}. Cả bản trộn phải công bố dưới ${license}, nghĩa là ` +
          'nhóm mất quyền tự quyết với bản ghi của mình trong bản trộn này. Cân nhắc đổi lớp ' +
          'SA sang một tệp CC0 hoặc CC BY tương đương.',
      );
    }
  }

  return { license, copyleft, layerLicenses, warnings };
}

/**
 * @param {object} recipe
 * @param {Record<string, object>} clipsById
 * @returns {{valid: boolean, errors: {field: string, message: string}[], experimentReady: boolean}}
 */
export function validateRecipe(recipe, clipsById = {}) {
  /** @type {{field: string, message: string}[]} */
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  for (const field of ['id', 'location_id', 'title_vi', 'layers']) {
    if (isMissing(recipe[field])) fail(field, `Thiếu trường bắt buộc "${field}".`);
  }

  // Vang không gian là tuỳ chọn, nhưng khai sai thì phải chặn ở đây. Khai một
  // đường dẫn hỏng mà không ai bắt thì phòng nghe im lặng bỏ qua vang, còn bộ
  // kết xuất kích thích thì chết giữa chừng — hai hành vi khác nhau cho cùng
  // một lỗi là kiểu hỏng khó lần ra nhất.
  if (recipe.reverb_ir !== undefined && recipe.reverb_ir !== null) {
    if (typeof recipe.reverb_ir !== 'string' || !/^\/.*\.wav$/.test(recipe.reverb_ir)) {
      fail(
        'reverb_ir',
        `"${recipe.reverb_ir}" không phải đường dẫn hợp lệ tới phản hồi xung. Phải là chuỗi ` +
          'bắt đầu bằng "/" và kết thúc bằng ".wav" — phản hồi xung phải là bản không nén, ' +
          'vì nén mất pha là hỏng đúng thứ tạo ra cảm giác không gian.',
      );
    }
  }

  const layers = Array.isArray(recipe.layers) ? recipe.layers : [];
  if (layers.length === 0) fail('layers', 'Bản trộn phải có ít nhất một lớp âm.');

  const roles = [];
  let hasSignal = false;

  layers.forEach((layer, index) => {
    const at = (field) => `layers[${index}].${field}`;

    if (isMissing(layer.clip_id)) {
      fail(at('clip_id'), 'Lớp âm phải trỏ tới một mẫu âm.');
      return;
    }
    const clip = clipsById[layer.clip_id];
    if (!clip) {
      fail(at('clip_id'), `Không có mẫu âm nào mang mã "${layer.clip_id}".`);
      return;
    }

    roles.push(clip.schafer_role);

    if (clip.location_id !== recipe.location_id) {
      fail(
        at('clip_id'),
        `Mẫu "${layer.clip_id}" thuộc địa điểm "${clip.location_id}" nhưng bản trộn là của ` +
          `"${recipe.location_id}". Trộn lẫn địa điểm làm hỏng chính phép thử nhận diện vùng miền.`,
      );
    }

    if (!isMissing(layer.pan) && !inRange(layer.pan, -1, 1)) {
      fail(at('pan'), 'Giá trị trái phải phải nằm trong khoảng −1 đến 1.');
    }
    if (!isMissing(layer.slider) && !inRange(layer.slider, 0, 1)) {
      fail(at('slider'), 'Vị trí thanh trượt phải nằm trong khoảng 0 đến 1.');
    }

    if (clip.schafer_role === 'signal') {
      hasSignal = true;
      if (isMissing(layer.trigger)) {
        fail(at('trigger'), 'Lớp tín hiệu âm phải có cấu hình lịch phát.');
      } else if (!(layer.trigger.mean_interval_s > 0)) {
        fail(at('trigger.mean_interval_s'), 'Khoảng cách trung bình giữa hai lần phát phải > 0.');
      }
    }
  });

  if (layers.length > 0 && !roles.some((role) => LOOPING_ROLES.includes(role))) {
    fail(
      'layers',
      'Bản trộn phải có ít nhất một lớp âm nền (keynote): không có nền thì không có gì để lặp, ' +
        'và soundscape trở thành các âm rời rạc — đúng thứ mà H1 dùng làm nhóm đối chứng.',
    );
  }

  // Lớp tín hiệu phát ngẫu nhiên: không có seed thì mỗi người nghe một chuỗi
  // khác nhau, bản trộn không tái lập được (FR-15, FR-52).
  if (hasSignal && !Number.isInteger(recipe.seed)) {
    fail('seed', 'Bản trộn có lớp tín hiệu âm thì phải có seed nguyên để tái lập được lịch phát.');
  }

  return {
    valid: errors.length === 0,
    errors,
    experimentReady: isExperimentReady(recipe, clipsById),
  };
}
