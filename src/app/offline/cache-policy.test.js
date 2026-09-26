import { describe, expect, test, vi } from 'vitest';
import { CACHE_NAME, classifyRequest, respond, shellUrls } from './cache-policy.js';

const BASE = '/vietsoundscape/';
const ORIGIN = 'https://dbinhz109.github.io';
const at = (path, extra = {}) => ({ url: `${ORIGIN}${path}`, method: 'GET', mode: 'cors', origin: ORIGIN, base: BASE, ...extra });

describe('classifyRequest — cái gì đi đường nào', () => {
  test('không phải GET, khác gốc, hay chính sw.js thì bỏ qua — để trình duyệt tự lo', () => {
    expect(classifyRequest(at('/vietsoundscape/data/clips.json', { method: 'POST' }))).toBe('bypass');
    expect(classifyRequest(at('/x.js', { url: 'https://cdn.example/x.js' }))).toBe('bypass');
    expect(classifyRequest(at('/vietsoundscape/sw.js'))).toBe('bypass');
  });

  test('điều hướng trang → mạng trước, có vỏ dự phòng', () => {
    expect(classifyRequest(at('/vietsoundscape/', { mode: 'navigate' }))).toBe('navigation');
    expect(classifyRequest(at('/vietsoundscape/thuc-nghiem?nguoi=3', { mode: 'navigate' }))).toBe('navigation');
  });

  test('tệp có mã băm trong assets/ và tệp âm → cache trước (bất biến, nặng)', () => {
    expect(classifyRequest(at('/vietsoundscape/assets/main-C0WmPY4g.js'))).toBe('cache-first');
    expect(classifyRequest(at('/vietsoundscape/spike/audio/bed-market.wav'))).toBe('cache-first');
    expect(classifyRequest(at('/vietsoundscape/build/stimuli/x.opus'))).toBe('cache-first');
    expect(classifyRequest(at('/vietsoundscape/icons/icon-192.png'))).toBe('cache-first');
  });

  test('dữ liệu JSON/GeoJSON → mạng trước — độ tươi quan trọng cho nghiên cứu', () => {
    expect(classifyRequest(at('/vietsoundscape/data/clips.json'))).toBe('network-first');
    expect(classifyRequest(at('/vietsoundscape/data/recipes/index.json'))).toBe('network-first');
  });

  test('base gốc "/" cũng chạy đúng', () => {
    expect(classifyRequest(at('/assets/a-1.js', { base: '/' }))).toBe('cache-first');
    expect(classifyRequest(at('/sw.js', { base: '/' }))).toBe('bypass');
  });
});

describe('shellUrls', () => {
  test('vỏ ứng dụng theo base: trang chính, trang phiên nghe, manifest', () => {
    expect(shellUrls(BASE)).toEqual([
      '/vietsoundscape/',
      '/vietsoundscape/index.html',
      '/vietsoundscape/thuc-nghiem.html',
      '/vietsoundscape/manifest.webmanifest',
    ]);
  });
  test('tên cache có phiên bản để đổi luật là dọn được cache cũ', () => {
    expect(CACHE_NAME).toMatch(/^vietsoundscape-v\d+$/);
  });
});

/** Cache giả: Map theo URL, đủ cho match/put/keys. */
function fakeCache(initial = {}) {
  const store = new Map(Object.entries(initial).map(([k, v]) => [k, new Response(v)]));
  return {
    store,
    match: vi.fn(async (key) => store.get(key)?.clone()),
    put: vi.fn(async (key, response) => {
      store.set(key, response);
    }),
  };
}
const ok = (body) => new Response(body, { status: 200 });
const failing = () => Promise.reject(new TypeError('Failed to fetch'));

describe('respond — cache-first', () => {
  test('có trong cache thì trả từ cache, không ra mạng', async () => {
    const cache = fakeCache({ [`${ORIGIN}/vietsoundscape/assets/a.js`]: 'cached' });
    const fetchFn = vi.fn();
    const response = await respond({ kind: 'cache-first', url: `${ORIGIN}/vietsoundscape/assets/a.js`, request: {}, cache, fetchFn, base: BASE });
    expect(await response.text()).toBe('cached');
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('chưa có thì tải, cất bản sao, trả bản gốc', async () => {
    const cache = fakeCache();
    const fetchFn = vi.fn(async () => ok('fresh'));
    const url = `${ORIGIN}/vietsoundscape/spike/audio/x.wav`;
    const response = await respond({ kind: 'cache-first', url, request: {}, cache, fetchFn, base: BASE });
    expect(await response.text()).toBe('fresh');
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect(await cache.store.get(url).text()).toBe('fresh');
  });

  test('mạng trả lỗi (404) thì không cất — cache không được chứa lỗi', async () => {
    const cache = fakeCache();
    const fetchFn = vi.fn(async () => new Response('', { status: 404 }));
    const response = await respond({ kind: 'cache-first', url: `${ORIGIN}/vietsoundscape/assets/b.js`, request: {}, cache, fetchFn, base: BASE });
    expect(response.status).toBe(404);
    expect(cache.put).not.toHaveBeenCalled();
  });
});

describe('respond — network-first', () => {
  test('mạng ổn thì dùng mạng và cập nhật cache', async () => {
    const url = `${ORIGIN}/vietsoundscape/data/clips.json`;
    const cache = fakeCache({ [url]: 'old' });
    const response = await respond({ kind: 'network-first', url, request: {}, cache, fetchFn: async () => ok('new'), base: BASE });
    expect(await response.text()).toBe('new');
    expect(await cache.store.get(url).text()).toBe('new');
  });

  test('mất mạng thì rơi về cache', async () => {
    const url = `${ORIGIN}/vietsoundscape/data/clips.json`;
    const cache = fakeCache({ [url]: 'old' });
    const response = await respond({ kind: 'network-first', url, request: {}, cache, fetchFn: failing, base: BASE });
    expect(await response.text()).toBe('old');
  });

  test('mất mạng và không có cache thì trả 503 tiếng Việt, không ném lỗi', async () => {
    const response = await respond({ kind: 'network-first', url: `${ORIGIN}/vietsoundscape/data/x.json`, request: {}, cache: fakeCache(), fetchFn: failing, base: BASE });
    expect(response.status).toBe(503);
    expect(await response.text()).toMatch(/ngoại tuyến/i);
  });
});

describe('respond — navigation', () => {
  test('mất mạng thì trang phiên nghe rơi về thuc-nghiem.html, trang khác về index.html', async () => {
    const cache = fakeCache({
      [`${ORIGIN}/vietsoundscape/index.html`]: 'shell-main',
      [`${ORIGIN}/vietsoundscape/thuc-nghiem.html`]: 'shell-exp',
    });
    const exp = await respond({ kind: 'navigation', url: `${ORIGIN}/vietsoundscape/thuc-nghiem?nguoi=2`, request: {}, cache, fetchFn: failing, base: BASE });
    expect(await exp.text()).toBe('shell-exp');
    const main = await respond({ kind: 'navigation', url: `${ORIGIN}/vietsoundscape/?location=hue-thien-mu`, request: {}, cache, fetchFn: failing, base: BASE });
    expect(await main.text()).toBe('shell-main');
  });

  test('mạng ổn thì cất bản HTML mới vào vỏ theo URL chuẩn (bỏ query)', async () => {
    const cache = fakeCache();
    await respond({ kind: 'navigation', url: `${ORIGIN}/vietsoundscape/?vung=bac-bo`, request: {}, cache, fetchFn: async () => ok('html'), base: BASE });
    expect(cache.store.has(`${ORIGIN}/vietsoundscape/index.html`)).toBe(true);
  });
});

test('audio Range 206 phát được qua service worker, không đưa partial response vào cache', async () => {
  const cache = fakeCache();
  cache.put.mockImplementation(async () => { throw new TypeError('Partial response cannot be cached'); });
  const response = await respond({ kind: 'cache-first', url: `${ORIGIN}/vietsoundscape/build/stimuli/test.wav`,
    request: {}, cache, base: BASE,
    fetchFn: async () => new Response('audio-part', { status: 206, headers: { 'Content-Range': 'bytes 0-9/20' } }) });
  expect(response.status).toBe(206);
  expect(await response.text()).toBe('audio-part');
  expect(cache.put).not.toHaveBeenCalled();
});
