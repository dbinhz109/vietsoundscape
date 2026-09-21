/**
 * Đăng ký service worker cho PWA ngoại tuyến (A5.1).
 *
 * Chỉ chạy ở bản dựng: trong `vite dev` không có `sw.js`, và một service worker
 * cất cache lúc đang phát triển là nguồn của những lỗi "sao sửa rồi mà không
 * đổi". Thất bại thì ghi cảnh báo và thôi — trang vẫn chạy như không có PWA.
 *
 * @param {object} options
 * @param {string} options.swUrl URL của `sw.js` đã qua `assetUrl`
 * @param {boolean} [options.enabled]
 * @returns {Promise<boolean>} đã đăng ký được hay không
 */
export async function registerOfflineSupport({ swUrl, enabled = import.meta.env.PROD }) {
  if (!enabled || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  try {
    await navigator.serviceWorker.register(swUrl);
    return true;
  } catch (error) {
    console.warn(`Không đăng ký được chế độ ngoại tuyến: ${error.message}`);
    return false;
  }
}
