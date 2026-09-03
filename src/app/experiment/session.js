/**
 * Máy trạng thái một phiên thực nghiệm (việc C3.1).
 *
 * Tách hẳn khỏi phần giao diện vì đây là chỗ **sai thì hỏng cả bộ dữ liệu**, mà
 * hỏng theo kiểu không nhìn ra: log vẫn đầy đủ, kiểm định vẫn chạy, chỉ có kết
 * quả là vô nghĩa. Bốn luật quan trọng nhất:
 *
 *  1. **Đồng thuận là cổng cứng.** Chưa đủ đồng thuận thì không nghe được gì.
 *     Đồng thuận hỏi theo **từng mục đích** — Luật 91/2025/QH15 Điều 9 khoản 4
 *     điểm a, và điểm b cấm gộp. Không trả lời cũng là không đồng ý (điểm d).
 *  2. **Không quay lại được.** Không có `back()`. Sửa câu trả lời sau khi đã nghe
 *     lượt sau là để thông tin của lượt sau chảy ngược vào lượt trước.
 *  3. **Không lộ đúng sai.** Báo kết quả sau mỗi lượt là dạy người tham gia giữa
 *     chừng, và các lượt sau không còn đo cùng một thứ với lượt đầu.
 *  4. **Đúng/sai do máy tính từ đáp án**, không do người tham gia tự khai.
 *
 * Log xuất ra đúng format mà `scripts/analyse-results.mjs` đọc — kiểm định quyết
 * định cần ghi gì, chứ không phải ghi được gì thì kiểm cái đó.
 *
 * @see `src/research/assignment.js` cho phần phân điều kiện · `phap-ly/07` cho
 *      nội dung đồng thuận
 */

import { assignParticipant } from '../../research/assignment.js';
import { EXPERIMENT_CONDITIONS } from '../../domain/taxonomy.js';

/**
 * Các mục đích phải được đồng ý riêng từng cái. Trùng với các ô trong văn bản
 * `phap-ly/07-dong-thuan-tham-gia-nghien-cuu.md` — sửa một bên thì sửa cả hai.
 */
export const REQUIRED_CONSENT_PURPOSES = Object.freeze([
  'participate', // tham gia phiên nghe và trả lời
  'analysis', // dùng câu trả lời để phân tích, kiểm chứng H1/H2
  'open_dataset', // công bố bộ dữ liệu đã ẩn danh kèm báo cáo
]);

/**
 * @param {object} config
 * @param {number} config.participantIndex
 * @param {string[]} config.locations
 * @param {{id: string, location_id: string}[]} config.recipes
 * @param {string[]} config.likertFields
 * @param {() => string} [config.now] nguồn thời gian, tiêm vào để test được
 */
export function createExperimentSession({
  participantIndex,
  locations,
  recipes,
  likertFields,
  now = () => new Date().toISOString(),
}) {
  const trials = assignParticipant(participantIndex, locations, EXPERIMENT_CONDITIONS).map(
    (trial) => ({
      ...trial,
      recipe_id: pickRecipe(trial.location_id),
    }),
  );

  /**
   * Bản trộn nào cho địa điểm này.
   *
   * Xoay vòng theo số thứ tự người tham gia, nên **người khác nhau nghe bản trộn
   * khác nhau**. Đây chính là lý do FR-59 đòi ≥ 3 bản trộn mỗi vùng: nếu ai cũng
   * nghe đúng một bản thì kết quả có thể chỉ phản ánh bản trộn đó chứ không phản
   * ánh vùng miền — và công sức dựng 12 bản trộn thành bỏ phí.
   */
  function pickRecipe(locationId) {
    const forLocation = recipes.filter((recipe) => recipe.location_id === locationId);
    if (forLocation.length === 0) {
      throw new Error(`Không có bản trộn nào cho địa điểm "${locationId}".`);
    }
    return forLocation[participantIndex % forLocation.length].id;
  }

  /** @type {Record<string, boolean> | null} */
  let consent = null;
  let consentAt = null;
  let cursor = 0;
  /** @type {object[]} */
  const responses = [];

  const state = () => {
    if (consent === null) return 'consent';
    return cursor < trials.length ? 'trial' : 'complete';
  };

  const current = () => {
    if (state() !== 'trial') return null;
    const trial = trials[cursor];
    return {
      order: trial.order,
      location_id: trial.location_id,
      condition: trial.condition,
      recipe_id: trial.recipe_id,
      stimulus_id: `${trial.recipe_id}--${trial.condition}`,
      total: trials.length,
    };
  };

  function giveConsent(purposes = {}) {
    const missing = REQUIRED_CONSENT_PURPOSES.filter((purpose) => purposes[purpose] !== true);
    if (missing.length > 0) {
      throw new Error(
        `Chưa đồng ý các mục đích: ${missing.join(', ')}. Luật 91/2025/QH15 Điều 9 khoản 4 ` +
          'buộc hỏi riêng từng mục đích và cấm gộp; không trả lời cũng không được coi là đồng ý.',
      );
    }
    consent = Object.fromEntries(REQUIRED_CONSENT_PURPOSES.map((p) => [p, true]));
    consentAt = now();
    return current();
  }

  function submit({ guess, likert = {} } = {}) {
    if (consent === null) {
      throw new Error('Chưa có đồng thuận — không được ghi câu trả lời nào.');
    }
    if (state() === 'complete') {
      throw new Error('Phiên đã xong, không còn lượt nào để trả lời.');
    }

    const trial = trials[cursor];

    if (guess === undefined || guess === null || guess === '') {
      throw new Error(`Lượt ${trial.order}: chưa có câu đoán vùng miền.`);
    }
    if (!locations.includes(guess)) {
      throw new Error(
        `Lượt ${trial.order}: "${guess}" không nằm trong danh sách địa điểm. Câu đoán phải ` +
          'chọn từ danh sách, nếu không thì không đối chiếu được với đáp án.',
      );
    }
    for (const field of likertFields) {
      if (typeof likert[field] !== 'number') {
        throw new Error(
          `Lượt ${trial.order}: thiếu điểm "${field}". Kiểm định H2 cần đủ trường này ở mọi ` +
            'lượt — thiếu một lượt là mất cả cặp của người tham gia đó.',
        );
      }
    }

    responses.push({
      participant_index: participantIndex,
      order: trial.order,
      location_id: trial.location_id,
      condition: trial.condition,
      recipe_id: trial.recipe_id,
      guess,
      // Máy tự đối chiếu với đáp án. Để người tham gia tự khai đúng/sai là mở
      // đường cho cả nhầm lẫn lẫn thiên lệch mong muốn làm hài lòng người hỏi.
      correct: guess === trial.location_id,
      ...Object.fromEntries(likertFields.map((field) => [field, likert[field]])),
      answered_at: now(),
    });

    cursor += 1;
    // Cố ý KHÔNG trả về đúng/sai: báo kết quả sau mỗi lượt là dạy người tham gia
    // giữa chừng, và các lượt sau không còn đo cùng một thứ với lượt đầu.
    return { state: state(), next: current() };
  }

  /** Nộp cho một lượt cụ thể — chỉ để chặn sửa lại, không phải đường quay lui. */
  function submitFor(order, payload) {
    if (responses.some((response) => response.order === order)) {
      throw new Error(
        `Lượt ${order} đã trả lời rồi. Không sửa lại được: sửa sau khi đã nghe lượt kế tiếp ` +
          'là để thông tin của lượt sau chảy ngược vào lượt trước.',
      );
    }
    if (current()?.order !== order) {
      throw new Error(`Lượt ${order} không phải lượt hiện tại.`);
    }
    return submit(payload);
  }

  const toLog = () => ({
    design: 'within-subject',
    participant_index: participantIndex,
    likert_fields: [...likertFields],
    consent: consent === null ? null : { purposes: { ...consent }, at: consentAt },
    complete: state() === 'complete',
    trials: responses.map((response) => ({ ...response })),
  });

  return { state, current, giveConsent, submit, submitFor, toLog };
}
