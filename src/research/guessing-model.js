/**
 * Mô hình đoán mò cho bài tính cỡ mẫu (spec S1.2).
 *
 * Bài tính ở `plan-sample.mjs` cần `p01`/`p10` — tỉ lệ cặp bất đồng của McNemar.
 * Trước đây ba kịch bản khai thẳng hai số đó, không nói gì về **mức đoán mò**,
 * nên khi thiết kế danh sách trả lời đổi (spec S1.1: 4 ô → 8 ô) thì không biết
 * phải sửa kịch bản thế nào. Tệp này tách hai thứ ra:
 *
 *  · **biết** — xác suất người nghe thật sự nhận ra nơi đó ở điều kiện c;
 *  · **đoán mò** — không biết thì chọn bừa trong các ô còn lại, trúng với xác
 *    suất `chance` do thiết kế danh sách quyết định.
 *
 * Rồi suy `p01`/`p10` từ hai thứ đó. Đổi thiết kế thì chỉ đổi `chance`.
 *
 * ## Giả định thận trọng về tương quan trong người
 *
 * Mỗi người có một năng lực `u ~ U(0, 1)`, biết ở điều kiện c khi `u < know_c`.
 * Cùng một `u` cho cả hai điều kiện ⇒ ai biết ở điều kiện khó thì cũng biết ở
 * điều kiện dễ. Đây là tương quan **cực đại**: cặp bất đồng ít nhất có thể, nên
 * cỡ mẫu tính ra **không nhỏ hơn** cỡ mẫu thật cần — sai thì sai về phía an toàn.
 * Giả định độc lập (hay dùng vì tiện) cho cặp bất đồng nhiều hơn và cỡ mẫu nhỏ
 * hơn; nếu sai thì phát hiện sau khi đã thu xong.
 */

const assertUnit = (name, value) => {
  if (typeof value !== 'number' || !(value >= 0 && value <= 1)) {
    throw new Error(`${name} phải là số trong [0, 1], nhận ${value}.`);
  }
};

/**
 * Mức đoán mò **trung bình qua các lượt**, có tính người tham gia loại trừ các
 * nơi đã nghe (giả định tệ nhất về phía thiết kế: họ nhớ hết).
 *
 * Với 4 lượt và danh sách 4 ô: (1/4 + 1/3 + 1/2 + 1/1) / 4 ≈ 52% — lượt cuối
 * chắc chắn đúng. Với 8 ô: (1/8 + 1/7 + 1/6 + 1/5) / 4 ≈ 16%.
 *
 * @param {{trials: number, options: number, eliminate?: boolean}} design
 * @returns {number}
 */
export function chanceLevel({ trials, options, eliminate = true }) {
  if (!Number.isInteger(trials) || trials < 1) throw new Error(`Số lượt phải là số nguyên ≥ 1, nhận ${trials}.`);
  if (!Number.isInteger(options) || options < 1) throw new Error(`Số ô phải là số nguyên ≥ 1, nhận ${options}.`);
  if (!eliminate) return 1 / options;
  if (options < trials) {
    throw new Error(
      `${options} ô cho ${trials} lượt: loại trừ hết là không còn ô nào. Số ô phải ≥ số lượt.`,
    );
  }
  let sum = 0;
  for (let heard = 0; heard < trials; heard += 1) sum += 1 / (options - heard);
  return sum / trials;
}

/**
 * Tỉ lệ cặp bất đồng cho McNemar từ mức "biết" ở hai điều kiện và mức đoán mò.
 *
 * `p01` = P(đúng ở layered, sai ở isolated) · `p10` = chiều ngược lại.
 * Dạng đóng đáng nhớ: `p01 − p10 = (knowLayered − knowIsolated) × (1 − chance)`
 * — mức đoán mò cao bào thẳng vào chênh lệch mà McNemar nhìn thấy.
 *
 * @param {{knowLayered: number, knowIsolated: number, chance: number}} params
 * @returns {{p01: number, p10: number, accuracyLayered: number, accuracyIsolated: number}}
 */
export function discordantRates({ knowLayered, knowIsolated, chance }) {
  assertUnit('knowLayered', knowLayered);
  assertUnit('knowIsolated', knowIsolated);
  assertUnit('chance', chance);
  if (knowLayered < knowIsolated) {
    throw new Error(
      'Mô hình chỉ cho chiều H1 (layered giúp nhận ra nhiều hơn): knowLayered phải ≥ knowIsolated.',
    );
  }
  const knowsOnlyLayered = knowLayered - knowIsolated;
  const knowsNeither = 1 - knowLayered;
  const guessSplit = chance * (1 - chance); // đoán trúng một bên, trật bên kia
  return {
    p01: knowsOnlyLayered * (1 - chance) + knowsNeither * guessSplit,
    p10: knowsNeither * guessSplit,
    accuracyLayered: knowLayered + knowsNeither * chance,
    accuracyIsolated: knowIsolated + (1 - knowIsolated) * chance,
  };
}
