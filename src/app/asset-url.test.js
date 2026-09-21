import { describe, expect, test } from 'vitest';
import { assetUrl } from './asset-url.js';

describe('assetUrl', () => {
  test('máy chủ phát triển: base "/" giữ nguyên đường dẫn tuyệt đối', () => {
    expect(assetUrl('/data/clips.json', '/')).toBe('/data/clips.json');
  });

  test('đường dẫn không có "/" đầu cũng ra cùng kết quả', () => {
    expect(assetUrl('data/clips.json', '/')).toBe('/data/clips.json');
  });

  test('GitHub Pages: base "/vietsoundscape/" đi trước mọi tệp dữ liệu và âm', () => {
    expect(assetUrl('/data/clips.json', '/vietsoundscape/')).toBe('/vietsoundscape/data/clips.json');
    expect(assetUrl('/spike/audio/bed-traffic.wav', '/vietsoundscape/')).toBe(
      '/vietsoundscape/spike/audio/bed-traffic.wav',
    );
  });

  test('base thiếu "/" cuối vẫn không dính hai đoạn vào nhau', () => {
    expect(assetUrl('/data/x.json', '/vietsoundscape')).toBe('/vietsoundscape/data/x.json');
  });

  test('không nhân đôi base nếu đường dẫn đã mang base', () => {
    // URL trong recipe có thể đã được ghép một lần rồi truyền tiếp.
    expect(assetUrl('/vietsoundscape/data/x.json', '/vietsoundscape/')).toBe(
      '/vietsoundscape/data/x.json',
    );
  });

  test('URL tuyệt đối có giao thức thì để nguyên', () => {
    expect(assetUrl('https://cdn.example/a.opus', '/vietsoundscape/')).toBe('https://cdn.example/a.opus');
  });

  test('mặc định đọc base của Vite (trong test là "/")', () => {
    expect(assetUrl('/data/clips.json')).toBe('/data/clips.json');
  });
});
