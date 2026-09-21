/**
 * Ghép đường dẫn tệp tĩnh (`data/`, `spike/audio/`, `build/stimuli/`) với base
 * của bản dựng.
 *
 * Máy chủ phát triển phục vụ từ gốc (`/`), nhưng GitHub Pages đặt cả trang dưới
 * `/vietsoundscape/`. Mã và dữ liệu viết đường dẫn tuyệt đối từ gốc
 * (`/data/clips.json`, `placeholder_audio: "/spike/audio/…"`) — hàm này là chỗ
 * duy nhất biết base là gì. `import.meta.env.BASE_URL` do Vite điền từ `base`
 * trong `vite.config.js` (biến môi trường `PUBLIC_BASE` lúc dựng).
 */
export function assetUrl(path, base = import.meta.env.BASE_URL ?? '/') {
  // Có giao thức (https:, blob:, data:) thì không phải tệp của ta — để nguyên.
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;

  const root = base.endsWith('/') ? base : `${base}/`;
  const relative = path.replace(/^\/+/, '');

  // Đã mang base rồi (URL ghép một lần rồi truyền tiếp) thì không ghép nữa.
  if (root !== '/' && `/${relative}`.startsWith(root)) return `/${relative}`;

  return `${root}${relative}`;
}
