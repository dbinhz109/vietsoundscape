/**
 * Service worker — chỉ nối sự kiện vào luật ở `cache-policy.js`.
 *
 * Được Vite gói thành `sw.js` ở gốc bản dựng (xem `vite.config.js`), đăng ký từ
 * `register.js` với phạm vi = base của ứng dụng. Không kiểm đơn vị: mọi quyết
 * định nằm ở `cache-policy.js` (có test); tệp này kiểm ở trình duyệt thật.
 */

import { CACHE_NAME, classifyRequest, respond, shellUrls } from './cache-policy.js';

const base = new URL(self.registration.scope).pathname;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Từng tệp một, không `addAll`: thiếu một tệp vỏ (ví dụ preview không có
      // thuc-nghiem.html) không được làm hỏng cả lượt cài.
      await Promise.allSettled(shellUrls(base).map((url) => cache.add(url)));
      await self.skipWaiting();
    }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (names) => {
      await Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)));
      await self.clients.claim();
    }),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const kind = classifyRequest({
    url: request.url,
    method: request.method,
    mode: request.mode,
    origin: self.location.origin,
    base,
  });
  if (kind === 'bypass') return;
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => respond({ kind, url: request.url, request, cache, fetchFn: fetch, base })),
  );
});
