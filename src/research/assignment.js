/**
 * Phân điều kiện và đảo thứ tự cân bằng cho thực nghiệm H1/H2 (việc C3.1).
 *
 * Thiết kế: **trong-người** (BA §10.2) — mỗi người nghe cả ba điều kiện, nhờ đó
 * kiểm soát được khác biệt cá nhân. Cỡ mẫu chốt là **96 người** (bội của 12) theo
 * `nghien-cuu/ke-hoach-phan-tich.md` §2 — con số 40–60 ban đầu không đủ lực.
 *
 * ## Ràng buộc quan trọng nhất: không lặp địa điểm
 *
 * Thiết kế trong-người bình thường sẽ cho mỗi người nghe **mọi** tổ hợp địa điểm
 * × điều kiện. Ở đây thì **không được**: nhiệm vụ là đoán vùng miền, nên nghe Huế
 * lần thứ hai là đã biết đáp án. Lượt đó không đo được gì nữa.
 *
 * Nên mỗi người chỉ nghe **mỗi địa điểm đúng một lần**, với điều kiện xoay vòng
 * theo hình vuông La Tinh. Đủ một vòng (12 người với 4 địa điểm × 3 điều kiện)
 * thì mọi ô được phủ đều nhau.
 *
 * ## Vì sao lấy số thứ tự người tham gia, không lấy số ngẫu nhiên
 *
 * Đảo thứ tự cân bằng là việc **có hệ thống**, không phải ngẫu nhiên: gán ngẫu
 * nhiên với n ≈ 100 thì lệch nhóm là chuyện thường, và lệch bao nhiêu thì
 * không kiểm soát được. Xoay vòng theo số thứ tự cho cân bằng chính xác, lại
 * dựng lại được đúng phiên của người thứ k mà không cần lưu thêm gì.
 *
 * @see BA §10.2, §10.4 · FR-58 · phap-ly/07 (đồng thuận tham gia)
 */

import { EXPERIMENT_CONDITIONS } from '../domain/taxonomy.js';

/**
 * @typedef {{order: number, location_id: string, condition: string}} Trial
 */

/**
 * Phiên nghe của một người tham gia.
 *
 * @param {number} participantIndex Số thứ tự người tham gia, đếm từ 0.
 * @param {string[]} locations Danh sách địa điểm, thứ tự cố định trong cả đợt.
 * @param {string[]} [conditions]
 * @returns {Trial[]}
 */
export function assignParticipant(participantIndex, locations, conditions = EXPERIMENT_CONDITIONS) {
  if (!Number.isInteger(participantIndex) || participantIndex < 0) {
    throw new Error(
      `Số thứ tự người tham gia phải là số nguyên không âm, nhận được ${participantIndex}.`,
    );
  }
  if (locations.length < conditions.length) {
    throw new Error(
      `Có ${locations.length} địa điểm nhưng ${conditions.length} điều kiện. Mỗi người chỉ ` +
        'nghe mỗi địa điểm một lần, nên số địa điểm phải ≥ số điều kiện — nếu không sẽ có ' +
        'người không gặp đủ điều kiện, và họ không đóng góp được cặp nào cho kiểm định McNemar.',
    );
  }

  const trials = locations.map((_, step) => {
    const k = participantIndex + step;
    return {
      location_id: locations[k % locations.length],
      condition: conditions[k % conditions.length],
    };
  });

  // Người có số lẻ đi ngược chiều. Nếu ai cũng theo cùng một chiều thì thứ tự
  // trở thành biến gây nhiễu dính chặt vào điều kiện, tách ra không được nữa.
  const ordered = participantIndex % 2 === 1 ? [...trials].reverse() : trials;

  return ordered.map((trial, index) => ({ order: index + 1, ...trial }));
}

/**
 * Phiên nghe của cả đợt.
 *
 * @param {number} size Số người tham gia.
 * @param {string[]} locations
 * @param {string[]} [conditions]
 * @returns {Trial[][]}
 */
export function assignCohort(size, locations, conditions = EXPERIMENT_CONDITIONS) {
  return Array.from({ length: size }, (_, index) =>
    assignParticipant(index, locations, conditions),
  );
}

/**
 * Kiểm cân bằng **trước khi** chạy thật — không phải sau khi đã thu xong.
 *
 * Chạy hàm này với cỡ mẫu dự kiến để biết bộ phân điều kiện có lệch không. Lệch
 * mà phát hiện sau khi thu xong thì không sửa được nữa: dữ liệu đã có rồi.
 *
 * @param {Trial[][]} cohort
 * @param {string[]} locations
 * @param {string[]} [conditions]
 * @returns {{
 *   cells: Record<string, number>,
 *   firstPosition: Record<string, number>,
 *   cycleSize: number,
 *   balanced: boolean,
 *   nextBalancedSize: number,
 * }}
 */
export function summariseCoverage(cohort, locations, conditions = EXPERIMENT_CONDITIONS) {
  /** @type {Record<string, number>} */
  const cells = {};
  for (const location of locations) {
    for (const condition of conditions) cells[`${location}|${condition}`] = 0;
  }

  /** @type {Record<string, number>} */
  const firstPosition = Object.fromEntries(conditions.map((c) => [c, 0]));

  for (const trials of cohort) {
    for (const trial of trials) {
      const key = `${trial.location_id}|${trial.condition}`;
      if (key in cells) cells[key] += 1;
    }
    const first = trials.find((t) => t.order === 1);
    if (first && first.condition in firstPosition) firstPosition[first.condition] += 1;
  }

  // Ô (địa điểm, điều kiện) do `k mod (số địa điểm × số điều kiện)` quyết định,
  // nên một vòng đầy đủ đúng bằng tích hai số — với 4 địa điểm và 3 điều kiện
  // là 12 người. Cỡ mẫu không chia hết cho 12 thì có ô được phủ nhiều hơn ô khác.
  const cycleSize = locations.length * conditions.length;
  const remainder = cohort.length % cycleSize;
  const balanced = cohort.length > 0 && remainder === 0;

  return {
    cells,
    firstPosition,
    cycleSize,
    balanced,
    nextBalancedSize: cohort.length + (remainder === 0 ? 0 : cycleSize - remainder),
  };
}
