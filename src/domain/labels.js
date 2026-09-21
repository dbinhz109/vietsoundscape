/**
 * Nhãn tiếng Việt cho từ vựng có kiểm soát ở `taxonomy.js`.
 *
 * Giao diện không được hiện mã máy (`dbscl`, `soundmark`) cho người dùng. Mọi
 * nơi cần chữ đọc được — bộ lọc, thẻ chi tiết mẫu, phòng nghe — đều lấy từ đây,
 * và `labels.test.js` buộc mỗi mã trong taxonomy phải có nhãn.
 */

export const REGION_LABEL = Object.freeze({
  'bac-bo': 'Bắc Bộ',
  'trung-bo': 'Trung Bộ',
  'tay-nguyen': 'Tây Nguyên',
  dbscl: 'Đồng bằng sông Cửu Long',
});

export const KRAUSE_LABEL = Object.freeze({
  geophony: 'Âm tự nhiên (geophony)',
  biophony: 'Âm sinh vật (biophony)',
  anthrophony: 'Âm do con người (anthrophony)',
});

export const SCHAFER_LABEL = Object.freeze({
  keynote: 'Âm nền',
  signal: 'Tín hiệu âm',
  soundmark: 'Dấu ấn âm thanh',
});

export const ENDANGERMENT_LABEL = Object.freeze({
  stable: 'Ổn định',
  declining: 'Đang giảm',
  rare: 'Hiếm',
  critical: 'Nguy cấp',
  lost: 'Đã không còn tồn tại',
});

export const TIME_OF_DAY_LABEL = Object.freeze({
  dawn: 'Rạng sáng',
  early_morning: 'Sáng sớm',
  morning: 'Buổi sáng',
  midday: 'Giữa trưa',
  afternoon: 'Buổi chiều',
  evening: 'Chiều muộn',
  night: 'Đêm',
});

export const CONSENT_LABEL = Object.freeze({
  not_required: 'Không cần — không có giọng người nhận dạng được',
  pending: 'Đang chờ đồng thuận',
  obtained: 'Đã có đồng thuận cá nhân bằng văn bản',
  community_agreed: 'Đã có thoả thuận với cộng đồng chủ thể',
  withdrawn: 'Đã rút — không xuất bản',
});

export const PROVENANCE_LABEL = Object.freeze({
  field_recording: 'Nhóm tự thu tại chỗ',
  licensed_archive: 'Tải từ kho có giấy phép mở',
});

/**
 * Nhãn của một mã; không có nhãn thì trả nguyên mã (còn hơn `undefined` trên
 * màn hình); mã trống thì nói "chưa có".
 * @param {Record<string, string>} labels
 * @param {string | null | undefined} code
 */
export function labelOf(labels, code) {
  if (code === undefined || code === null || code === '') return 'chưa có';
  return labels[code] ?? code;
}
