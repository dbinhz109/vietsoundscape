/**
 * Khử yếu tố gây nhiễu cho kích thích thực nghiệm (BA §10.4 — FR-56…FR-59).
 *
 * ## Vấn đề mà module này tồn tại để chặn
 *
 * Bản soundscape phân lớp **dài hơn, to hơn, nhiều sự kiện âm hơn** bản âm đơn
 * lẻ. Nếu người nghe nhận diện đúng hơn ở điều kiện phân lớp, có thể chỉ vì họ
 * nhận được **nhiều thông tin hơn** — chứ không phải vì việc phân lớp *có chủ
 * đích* như H1 phát biểu.
 *
 * Đây không phải lỗi nhỏ. Không khử thì H1 **không kiểm được gì**: kết quả dương
 * tính vẫn giải thích được bằng một cơ chế tầm thường, và người phản biện sẽ nêu
 * đúng điều đó. Nên phép kiểm này phải chạy **trước** khi thu dữ liệu, không phải
 * sau.
 *
 * @see BA §10.4 · `assignment.js` cho phần phân điều kiện
 */

import { EXPERIMENT_CONDITIONS, LOOPING_ROLES } from '../domain/taxonomy.js';
import { scheduleTriggers } from '../audio/trigger.js';

/** Ngưỡng mặc định — nới hơn thì phải giải trình được trong báo cáo. */
export const DEFAULT_TOLERANCE = Object.freeze({
  durationToleranceS: 2,
  eventTolerance: 2,
  lufsToleranceLu: 1,
});

/** FR-59: mỗi vùng cần ≥ 3 bản trộn để kết quả không dính vào một mẫu cụ thể. */
export const MIN_RECIPES_PER_LOCATION = 3;

const spread = (values) => Math.max(...values) - Math.min(...values);

/**
 * Số sự kiện âm nghe thấy được trong một kích thích.
 *
 * Lớp nền và dấu ấn âm thanh tính **một** sự kiện mỗi lớp. Lớp tín hiệu âm đếm
 * theo **lịch phát thật** do bộ sinh có seed sinh ra (FR-15b) — không dùng ước
 * lượng `durationS / mean_interval_s`, vì FR-56 cần con số khớp thật giữa các
 * điều kiện chứ không phải xấp xỉ.
 *
 * @param {object} recipe
 * @param {Record<string, object>} clipsById
 * @param {number} durationS
 * @returns {number}
 */
export function countStimulusEvents(recipe, clipsById, durationS) {
  const layers = Array.isArray(recipe.layers) ? recipe.layers : [];

  return layers.reduce((total, layer, index) => {
    const clip = clipsById[layer.clip_id];
    if (!clip) return total; // lớp hỏng đã bị `validateRecipe` bắt; ở đây không đếm bừa

    if (!layer.trigger || LOOPING_ROLES.includes(clip.schafer_role)) return total + 1;

    // Mỗi lớp một seed dẫn xuất, nếu không thì mọi lớp tín hiệu trong cùng bản
    // trộn sẽ phát trùng khớp nhau — nghe như một sự kiện, và đếm cũng sai.
    const times = scheduleTriggers({
      seed: (recipe.seed ?? 0) + index,
      meanIntervalS: layer.trigger.mean_interval_s,
      jitterS: layer.trigger.jitter_s ?? 0,
      durationS,
    });
    return total + times.length;
  }, 0);
}

/**
 * Ba điều kiện có khớp nhau về thời lượng, số sự kiện và độ to không?
 *
 * @param {{id: string, condition: string, duration_s: number, loudness_lufs: number, event_count: number}[]} stimuli
 * @param {Partial<typeof DEFAULT_TOLERANCE>} [tolerance]
 * @returns {{balanced: boolean, issues: string[], byCondition: Record<string, object>}}
 */
export function checkStimulusBalance(stimuli, tolerance = {}) {
  const limits = { ...DEFAULT_TOLERANCE, ...tolerance };
  const issues = [];

  if (!Array.isArray(stimuli) || stimuli.length === 0) {
    return {
      balanced: false,
      issues: ['Không có kích thích nào để kiểm — bộ rỗng không phải là bộ cân bằng.'],
      byCondition: {},
    };
  }

  /** @type {Record<string, object>} */
  const byCondition = {};
  for (const stimulus of stimuli) byCondition[stimulus.condition] = stimulus;

  const missing = EXPERIMENT_CONDITIONS.filter((condition) => !(condition in byCondition));
  if (missing.length > 0) {
    issues.push(
      `Thiếu điều kiện: ${missing.join(', ')}. Riêng "scrambled" (phân lớp sai vùng miền) là ` +
        'điều kiện đối chứng bắt buộc của FR-58 — không có nó thì việc "layered" thắng ' +
        '"isolated" chỉ chứng minh nhiều thông tin hơn thì đoán đúng hơn, chứ không chứng ' +
        'minh được chữ "có chủ đích" trong H1.',
    );
  }

  const checks = [
    ['duration_s', limits.durationToleranceS, 'thời lượng', 'giây', 'FR-56'],
    ['event_count', limits.eventTolerance, 'số sự kiện âm', 'sự kiện', 'FR-56'],
    ['loudness_lufs', limits.lufsToleranceLu, 'độ to (LUFS)', 'LU', 'FR-57'],
  ];

  for (const [field, limit, label, unit, code] of checks) {
    const values = stimuli.map((s) => s[field]).filter((v) => typeof v === 'number');
    if (values.length < 2) continue;

    const delta = spread(values);
    if (delta > limit) {
      issues.push(
        `Lệch ${label} giữa các điều kiện là ${delta.toFixed(2)} ${unit}, vượt ngưỡng ` +
          `${limit} ${unit} (${code}). Người nghe có thể đoán đúng hơn chỉ vì lệch này, ` +
          'chứ không phải vì cách phân lớp.',
      );
    }
  }

  return { balanced: issues.length === 0, issues, byCondition };
}

/**
 * FR-59: mỗi vùng đủ số bản trộn chưa?
 *
 * Ràng buộc này làm **tăng khối lượng thu âm** — 12–15 bản trộn thay vì 4–5 — nên
 * phải biết thiếu bao nhiêu từ sớm, đừng để phát hiện lúc sắp chạy thực nghiệm.
 *
 * @param {{location_id: string}[]} recipes
 * @param {string[]} locations
 * @param {{minPerLocation?: number}} [options]
 * @returns {{met: boolean, counts: Record<string, number>, shortfall: Record<string, number>, minPerLocation: number}}
 */
export function checkRecipeCoverage(recipes, locations, options = {}) {
  const minPerLocation = options.minPerLocation ?? MIN_RECIPES_PER_LOCATION;

  /** @type {Record<string, number>} */
  const counts = Object.fromEntries(locations.map((id) => [id, 0]));
  for (const recipe of recipes) {
    if (recipe.location_id in counts) counts[recipe.location_id] += 1;
  }

  /** @type {Record<string, number>} */
  const shortfall = {};
  for (const [location, count] of Object.entries(counts)) {
    if (count < minPerLocation) shortfall[location] = minPerLocation - count;
  }

  return {
    met: Object.keys(shortfall).length === 0,
    counts,
    shortfall,
    minPerLocation,
  };
}
