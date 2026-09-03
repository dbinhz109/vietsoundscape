/**
 * Danh sách trả lời của phiên thực nghiệm: vùng thật + phương án nhiễu (spec S1.1).
 *
 * ## Lỗi thiết kế mà tệp này sửa
 *
 * `assignment.js` cho mỗi người nghe **mỗi vùng đúng một lần**. Nếu danh sách
 * trả lời đúng bằng bốn vùng đó thì người nhớ ba câu trước sẽ thấy lượt 4 chỉ
 * còn **một** lựa chọn, lượt 3 còn hai. Tỉ lệ đúng bị thổi lên không do nghe
 * được gì, cặp cùng-đúng tăng, McNemar mất lực — và không phép kiểm nào trên log
 * phát hiện ra, vì log vẫn đầy đủ.
 *
 * Cách sửa: thêm địa danh **thật, quen, có không gian âm thanh phân biệt được**
 * nhưng **không** có trong bộ kích thích (`data/distractors.json`), và nói thẳng
 * với người tham gia rằng danh sách dài hơn số đoạn sẽ nghe. Không lừa ai; chỉ
 * bỏ đi cái phím tắt.
 *
 * ## Thứ tự
 *
 * Xáo theo seed suy từ (người, lượt): dựng lại đúng danh sách mà người thứ k đã
 * thấy ở lượt thứ j mà không cần lưu gì thêm, và không ai học được vị trí.
 */

import { createRng } from '../audio/trigger.js';
import { shuffled } from './variants.js';

/**
 * Gộp vùng thật và phương án nhiễu thành một danh sách, kiểm luật trước.
 *
 * @param {string[]} locations Vùng có trong bộ kích thích — đáp án có thể đúng.
 * @param {string[]} distractors Địa danh không bao giờ là đáp án.
 * @returns {string[]} Thứ tự khai, chưa xáo. Xáo là việc của `orderAnswerOptions`.
 */
export function composeAnswerOptions(locations, distractors) {
  if (!Array.isArray(distractors) || distractors.length === 0) {
    throw new Error(
      'Danh sách trả lời phải có phương án nhiễu. Không có thì danh sách = đúng các vùng sẽ ' +
        'nghe, và người tham gia loại trừ dần: lượt cuối chỉ còn một lựa chọn (spec S1.1).',
    );
  }
  const overlap = distractors.filter((id) => locations.includes(id));
  if (overlap.length > 0) {
    throw new Error(
      `Phương án nhiễu trùng vùng thật: ${overlap.join(', ')}. Nhiễu phải là nơi KHÔNG có ` +
        'trong bộ kích thích, nếu không "correct" mất nghĩa.',
    );
  }
  const all = [...locations, ...distractors];
  const duplicates = all.filter((id, index) => all.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`Mã trùng trong danh sách trả lời: ${[...new Set(duplicates)].join(', ')}.`);
  }
  return all;
}

/**
 * Seed cho một ô (người, lượt). Hai hằng nhân là số lẻ lớn để hai ô kề nhau
 * không cho hai chuỗi giống nhau ở vài số đầu.
 */
const seedFor = (participantIndex, order) =>
  (Math.imul(participantIndex + 1, 0x9e3779b1) ^ Math.imul(order, 0x85ebca77)) >>> 0;

/**
 * Thứ tự hiển thị của danh sách trả lời cho một lượt cụ thể.
 *
 * @param {string[]} options Kết quả của `composeAnswerOptions`.
 * @param {{participantIndex: number, order: number}} trial
 * @returns {string[]} Bản sao đã xáo; không đụng vào `options`.
 */
export function orderAnswerOptions(options, { participantIndex, order }) {
  if (!Number.isInteger(participantIndex) || participantIndex < 0) {
    throw new Error(`Số thứ tự người tham gia phải là số nguyên ≥ 0, nhận ${participantIndex}.`);
  }
  if (!Number.isInteger(order) || order < 1) {
    throw new Error(`Số thứ tự lượt phải là số nguyên ≥ 1, nhận ${order}.`);
  }
  return shuffled(options, createRng(seedFor(participantIndex, order)));
}
