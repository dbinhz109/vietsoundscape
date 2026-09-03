/**
 * Máy chủ tĩnh tối giản cho spike — không phụ thuộc gói ngoài.
 *
 * Cần có vì `file://` chặn fetch và ES module, nên trang spike không mở trực
 * tiếp từ ổ đĩa được.
 */

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PORT = Number(process.env.PORT ?? 5173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wav': 'audio/wav',
  '.webm': 'audio/webm',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
};

createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  // Chuyển hướng thật thay vì map ngầm, để đường dẫn tương đối trong trang
  // giải đúng (src="spike.js" phải thành /spike/spike.js).
  if (url.pathname === '/' || url.pathname === '/spike') {
    response.writeHead(302, { Location: '/spike/index.html' });
    response.end();
    return;
  }

  const requested = url.pathname;

  // Chặn đi ngược ra ngoài thư mục gốc.
  const target = join(ROOT, normalize(requested).replace(/^(\.\.[/\\])+/, ''));
  if (!target.startsWith(ROOT) || !existsSync(target) || statSync(target).isDirectory()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Không tìm thấy ${requested}\n`);
    return;
  }

  response.writeHead(200, {
    'Content-Type': MIME[extname(target)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(target).pipe(response);
}).listen(PORT, () => {
  console.log(`Spike: http://localhost:${PORT}/`);
});
