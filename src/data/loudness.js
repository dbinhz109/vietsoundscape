/**
 * Chuẩn hoá độ to theo EBU R128 / ITU-R BS.1770 (NFR-30).
 *
 * **Vì sao không dùng thẳng bộ lọc `loudnorm` để chuẩn hoá:** chạy một lượt thì
 * `loudnorm` báo `"normalization_type": "dynamic"` — nó **nén động**. Với vật
 * liệu sinh thái âm thì nén động làm biến dạng đúng thứ cần bảo tồn: quan hệ độ
 * to giữa âm nền lặng và tín hiệu âm nổi lên. Nên ở đây `loudnorm` chỉ dùng để
 * **đo**, sau đó áp một **gain tuyến tính** duy nhất — giữ nguyên dải động.
 *
 * Đo bằng đỉnh (peak) là sai về cảm nhận: hai bản cùng đỉnh 0 dBFS có thể to
 * nhỏ khác nhau rất xa. Đó là lý do phải đo LUFS.
 */

/** Mức tham chiếu cho từng mẫu, theo EBU R128. */
export const LOUDNESS_TARGET_LUFS = -23;

/**
 * Trần đỉnh thật. Chừa 1 dB để bộ giải mã có nhiễu làm tròn cũng không vỡ đỉnh,
 * và để tổng của nhiều lớp còn dư địa.
 */
export const TRUE_PEAK_CEILING_DBTP = -1;

/**
 * @typedef {object} Measured
 * @property {number} lufs độ to tích hợp
 * @property {number} truePeakDbtp đỉnh thật, dBTP
 * @property {number} [lra] dải độ to
 */

/**
 * Đọc khối JSON mà `ffmpeg -af loudnorm=print_format=json` in ra stderr.
 *
 * @param {string} output toàn bộ stderr của ffmpeg
 * @returns {Measured}
 */
export function parseLoudnormJson(output) {
  const start = output.lastIndexOf('{');
  const end = output.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Không tìm thấy khối JSON của loudnorm trong đầu ra ffmpeg.');
  }

  const raw = JSON.parse(output.slice(start, end + 1));
  const lufs = Number.parseFloat(raw.input_i);
  const truePeakDbtp = Number.parseFloat(raw.input_tp);

  if (!Number.isFinite(lufs)) {
    throw new Error(
      `Độ to đo được là "${raw.input_i}" — bản ghi im lặng hoặc quá nhỏ để đo. ` +
        'Kiểm lại tệp nguồn trước khi đưa vào đường ống.',
    );
  }

  return { lufs, truePeakDbtp, lra: Number.parseFloat(raw.input_lra) };
}

/**
 * @typedef {object} GainDecision
 * @property {number} gainDb gain tuyến tính cần áp, dB
 * @property {boolean} limitedByPeak đã phải hạ gain vì sắp vỡ đỉnh
 * @property {number} resultingLufs độ to đạt được sau khi áp gain
 * @property {number} resultingTruePeakDbtp đỉnh thật sau khi áp gain
 *
 * @param {Measured} measured
 * @param {object} [options]
 * @param {number} [options.targetLufs]
 * @param {number} [options.ceilingDbtp]
 * @returns {GainDecision}
 */
export function gainToTarget(measured, options = {}) {
  const { targetLufs = LOUDNESS_TARGET_LUFS, ceilingDbtp = TRUE_PEAK_CEILING_DBTP } = options;
  const { lufs, truePeakDbtp } = measured;

  const wanted = targetLufs - lufs;
  const peakHeadroom = ceilingDbtp - truePeakDbtp;

  // Thà để mẫu hơi nhỏ hơn mục tiêu còn hơn để tiếng bị méo — vỡ đỉnh là lỗi
  // không cứu được, còn lệch độ to thì bù được bằng gain của lớp trong bộ trộn.
  const limitedByPeak = wanted > peakHeadroom;
  const gainDb = limitedByPeak ? peakHeadroom : wanted;

  return {
    gainDb,
    limitedByPeak,
    resultingLufs: lufs + gainDb,
    resultingTruePeakDbtp: truePeakDbtp + gainDb,
  };
}
