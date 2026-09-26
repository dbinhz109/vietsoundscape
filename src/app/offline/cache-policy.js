/**
 * Luật cache cho service worker (A5.1 — PWA ngoại tuyến, C7.2 — demo không wifi).
 *
 * Hàm thuần, không đụng `self`/`caches` toàn cục: service worker (`sw.js`) chỉ
 * nối sự kiện vào đây. Nhờ vậy luật kiểm được bằng cache giả, còn `sw.js` thì
 * không có gì để sai.
 *
 * Ba đường:
 *  - `cache-first`   — tệp có mã băm trong `assets/`, tệp âm, biểu tượng: bất
 *                      biến và nặng, có rồi thì không tải lại.
 *  - `network-first` — dữ liệu `data/` và mọi thứ khác: độ tươi quan trọng
 *                      (một bản trộn sửa hôm nay phải hiện hôm nay); mất mạng
 *                      mới dùng bản đã cất.
 *  - `navigation`    — mở trang: mạng trước, mất mạng thì trả vỏ HTML đã cất.
 * `bypass` cho POST, khác gốc, và chính `sw.js` — để trình duyệt tự lo.
 */

/** Đổi số này khi đổi luật: cache cũ bị dọn ở `activate`. */
export const CACHE_PREFIX = 'vietsoundscape-';
export const CACHE_NAME = `${CACHE_PREFIX}v3`;

const AUDIO_PATTERN = /\.(wav|opus|mp3|ogg|flac|m4a|webm)$/i;
const IMAGE_PATTERN = /\.(png|svg|webp|ico)$/i;

/**
 * @param {object} r
 * @param {string} r.url
 * @param {string} r.method
 * @param {string} r.mode `navigate` khi mở trang
 * @param {string} r.origin gốc của service worker
 * @param {string} r.base đường dẫn gốc ứng dụng, có "/" cuối
 * @returns {'bypass' | 'navigation' | 'cache-first' | 'network-first'}
 */
export function classifyRequest({ url, method, mode, origin, base }) {
  if (method !== 'GET') return 'bypass';
  const parsed = new URL(url);
  if (parsed.origin !== origin) return 'bypass';
  const path = parsed.pathname;
  if (path === `${base}sw.js`) return 'bypass';
  if (mode === 'navigate') return 'navigation';
  if (path.startsWith(`${base}assets/`)) return 'cache-first';
  if (AUDIO_PATTERN.test(path) || IMAGE_PATTERN.test(path)) return 'cache-first';
  return 'network-first';
}

/** Vỏ ứng dụng cất sẵn lúc cài: đủ để mở trang khi không có mạng. */
export function shellUrls(base) {
  return [base, `${base}index.html`, `${base}thuc-nghiem.html`, `${base}manifest.webmanifest`];
}

const offline = () =>
  new Response('Đang ngoại tuyến và tệp này chưa được cất trong bộ đệm. Mở lại khi có mạng một lần.', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });

/** Trang phiên nghe hay trang chính — để chọn vỏ dự phòng. */
function shellFor(url, base) {
  const { origin, pathname } = new URL(url);
  const isExperiment = pathname.replace(/\/$/, '').endsWith('/thuc-nghiem') || pathname.endsWith('/thuc-nghiem.html');
  return `${origin}${base}${isExperiment ? 'thuc-nghiem.html' : 'index.html'}`;
}

/**
 * @param {object} args
 * @param {'navigation' | 'cache-first' | 'network-first'} args.kind
 * @param {string} args.url
 * @param {Request | object} args.request truyền thẳng cho `fetchFn`
 * @param {{ match(key: string): Promise<Response | undefined>, put(key: string, r: Response): Promise<void> }} args.cache
 * @param {(request: any) => Promise<Response>} args.fetchFn
 * @param {string} args.base
 * @returns {Promise<Response>}
 */
export async function respond({ kind, url, request, cache, fetchFn, base }) {
  if (kind === 'cache-first') {
    const hit = await cache.match(url);
    if (hit) return hit;
    const fresh = await fetchFn(request);
    // Cache API từ chối 206: audio dùng Range khi tải/seek.
    if (fresh.status === 200) await cache.put(url, fresh.clone());
    return fresh;
  }

  // Điều hướng cất theo URL chuẩn của vỏ (bỏ query) để `?location=…` nào cũng
  // rơi về cùng một index.html khi mất mạng.
  const cacheKey = kind === 'navigation' ? shellFor(url, base) : url;
  try {
    const fresh = await fetchFn(request);
    // Cache API từ chối 206: audio dùng Range khi tải/seek.
    if (fresh.status === 200) await cache.put(cacheKey, fresh.clone());
    return fresh;
  } catch {
    const hit = (await cache.match(cacheKey)) ?? (kind === 'navigation' ? await cache.match(url) : undefined);
    return hit ?? offline();
  }
}
