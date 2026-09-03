/**
 * Ánh xạ âm lượng theo cảm nhận (NFR-31).
 *
 * Tai người nghe theo thang logarit. Nối thẳng thanh trượt tuyến tính vào biên độ
 * sẽ cho cảm giác "hầu như không đổi ở nửa trên, tụt hết ở nửa dưới". Toàn bộ
 * module này chỉ để tránh đúng lỗi đó.
 */

/** Mức sàn mặc định của thanh trượt, tính theo dB. */
export const DEFAULT_FLOOR_DB = -60;

/**
 * Đổi decibel sang biên độ tuyến tính để nạp vào GainNode.
 * @param {number} db
 * @returns {number}
 */
export function dbToGain(db) {
  if (db === -Infinity) return 0;
  return 10 ** (db / 20);
}

/**
 * Đổi vị trí thanh trượt [0, 1] sang decibel, tuyến tính trên thang dB.
 *
 * Vị trí 0 trả về -Infinity chứ không phải mức sàn: lớp âm đã tắt phải im hẳn,
 * nếu không nó vẫn rỉ tiếng khi các lớp khác nhỏ (FR-11).
 *
 * @param {number} position vị trí thanh trượt, 0 đến 1
 * @param {number} [floorDb] mức sàn, mặc định -60 dB
 * @returns {number}
 */
export function sliderToDb(position, floorDb = DEFAULT_FLOOR_DB) {
  if (position <= 0) return -Infinity;
  if (position >= 1) return 0; // chặn -0 do phép nhân floorDb * 0
  return floorDb * (1 - position);
}

/**
 * Đổi vị trí thanh trượt trực tiếp sang biên độ tuyến tính.
 * @param {number} position vị trí thanh trượt, 0 đến 1
 * @param {number} [floorDb] mức sàn, mặc định -60 dB
 * @returns {number}
 */
export function sliderToGain(position, floorDb = DEFAULT_FLOOR_DB) {
  return dbToGain(sliderToDb(position, floorDb));
}

/**
 * Tỉ lệ vang mặc định. Đủ để nghe ra không gian, chưa đến mức nhoè mất nguồn âm —
 * mà nhận ra nguồn âm chính là việc người tham gia phải làm trong thực nghiệm.
 */
export const DEFAULT_REVERB_MIX = 0.25;

/**
 * Hệ số khô và ướt theo **luật đẳng công suất**, giống luật dịch trái phải.
 *
 * Đặt ở đây, không đặt trong bộ máy âm thanh, vì **hai nơi phải dùng chung**:
 * bộ trộn thời gian thực của phòng nghe (`audio/engine.js`) và bộ kết xuất kích
 * thích bằng ffmpeg (`research/render-graph.js`). Lệch nhau thì người tham gia
 * nghe một đằng còn trang web trình diễn một nẻo — mà H2 nói về đúng cái cảm
 * giác không gian đó, nên lệch là hỏng phép đo chứ không phải hỏng thẩm mỹ.
 *
 * Cộng thẳng khô 1 + ướt 0,25 thì bật vang lên là to hẳn, mà độ to đúng là yếu
 * tố gây nhiễu FR-57 phải khử. Giữ `khô² + ướt² = 1` thì đổi tỉ lệ không đổi
 * công suất.
 *
 * @param {number} mix 0 (khô hẳn) … 1 (ướt hẳn)
 * @returns {{dryGain: number, wetGain: number}}
 */
export function reverbMixGains(mix = DEFAULT_REVERB_MIX) {
  if (typeof mix !== 'number' || !Number.isFinite(mix) || mix < 0 || mix > 1) {
    throw new Error(`Tỉ lệ vang phải là số trong [0, 1], nhận được ${JSON.stringify(mix)}.`);
  }
  const angle = (mix * Math.PI) / 2;
  return { dryGain: Math.cos(angle), wetGain: Math.sin(angle) };
}
