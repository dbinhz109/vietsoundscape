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
 *  5. **Danh sách trả lời dài hơn số lượt.** Mỗi vùng chỉ nghe một lần, nên nếu
 *     danh sách = đúng các vùng sẽ nghe thì lượt cuối chỉ còn một lựa chọn. Phải
 *     có phương án nhiễu (`answerOptions` ⊋ `locations`), và thứ tự xáo theo
 *     (người, lượt) — xem `src/research/answer-options.js`.
 *
 * Log xuất ra đúng format mà `scripts/analyse-results.mjs` đọc — kiểm định quyết
 * định cần ghi gì, chứ không phải ghi được gì thì kiểm cái đó.
 *
 * @see `src/research/assignment.js` cho phần phân điều kiện · `phap-ly/07` cho
 *      nội dung đồng thuận
 */

import { assignParticipant } from '../../research/assignment.js';
import { composeAnswerOptions, orderAnswerOptions } from '../../research/answer-options.js';
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
 * @param {string[]} config.answerOptions Vùng thật + phương án nhiễu — mọi mã mà
 *   người tham gia có thể chọn. Bắt buộc là tập cha thật sự của `locations`.
 * @param {string[]} config.likertFields
 * @param {() => string} [config.now] nguồn thời gian, tiêm vào để test được
 */
export function createExperimentSession({
  participantIndex,
  locations,
  recipes,
  answerOptions,
  likertFields,
  now = () => new Date().toISOString(),
}) {
  if (!Array.isArray(answerOptions)) {
    throw new Error(
      'Thiếu `answerOptions` — danh sách trả lời gồm vùng thật và phương án nhiễu. Không có ' +
        'phương án nhiễu thì người tham gia loại trừ dần, lượt cuối chỉ còn một lựa chọn (spec S1.1).',
    );
  }
  const missing = locations.filter((location) => !answerOptions.includes(location));
  if (missing.length > 0) {
    throw new Error(
      `Danh sách trả lời thiếu vùng thật: ${missing.join(', ')}. Đáp án đúng mà không chọn ` +
        'được thì lượt đó chắc chắn sai.',
    );
  }
  const repeated = answerOptions.filter((id, index) => answerOptions.indexOf(id) !== index);
  if (repeated.length > 0) {
    throw new Error(`Mã trùng trong danh sách trả lời: ${[...new Set(repeated)].join(', ')}.`);
  }
  // Kiểm luật còn lại (phải có nhiễu, nhiễu không trùng vùng thật) ở một chỗ duy nhất.
  composeAnswerOptions(locations, answerOptions.filter((id) => !locations.includes(id)));

  const trials = assignParticipant(participantIndex, locations, EXPERIMENT_CONDITIONS).map(
    (trial) => ({
      ...trial,
      recipe_id: pickRecipe(trial.location_id, trial.order),
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
  function pickRecipe(locationId, order) {
    const forLocation = recipes.filter((recipe) => recipe.location_id === locationId);
    if (forLocation.length === 0) {
      throw new Error(`Không có bản trộn nào cho địa điểm "${locationId}".`);
    }
    // Trong mỗi vòng 12 người, vị trí lượt đã cân bằng địa điểm × điều kiện.
    // Dịch biến thể theo vòng và theo vị trí cho mỗi ô nhận 10–11 lượt ở n=96,
    // thay vì chênh 8–16 lượt như công thức chỉ lấy participantIndex % 3.
    const cohortCycle = locations.length * EXPERIMENT_CONDITIONS.length;
    const variant = (Math.floor(participantIndex / cohortCycle) + order - 1) % forLocation.length;
    return forLocation[variant].id;
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

  /** Thứ tự danh sách trả lời mà người này thấy ở lượt này — dựng lại được. */
  const optionsShownAt = (order) => orderAnswerOptions(answerOptions, { participantIndex, order });

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
      answer_options: optionsShownAt(trial.order),
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
    if (!answerOptions.includes(guess)) {
      throw new Error(
        `Lượt ${trial.order}: "${guess}" không nằm trong danh sách trả lời. Câu đoán phải ` +
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
      // Thứ tự đã hiện — để sau này kiểm thiên lệch vị trí, và để biết mức đoán
      // mò của lượt này là 1/N với N nào.
      answer_options: optionsShownAt(trial.order),
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
    answer_options: [...answerOptions],
    consent: consent === null ? null : { purposes: { ...consent }, at: consentAt },
    complete: state() === 'complete',
    trials: responses.map((response) => ({ ...response })),
  });

  return { state, current, giveConsent, submit, submitFor, toLog };
}
