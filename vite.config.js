import { cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';

const ROOT = import.meta.dirname;

/**
 * Dữ liệu của dự án nằm ở `data/` và âm thanh ở `spike/audio/`. Máy chủ phát
 * triển của Vite phục vụ chúng trực tiếp từ thư mục gốc, nhưng `vite build` thì
 * không — nên bản dựng sẽ 404 mọi tệp dữ liệu nếu không chép sang.
 *
 * Không dùng `publicDir` vì hai thư mục này không nằm cùng một chỗ, và `data/`
 * còn được các script Node đọc trực tiếp nên không di chuyển được.
 */
function copyProjectData({ directories }) {
  return {
    name: 'copy-project-data',
    apply: 'build',
    closeBundle() {
      const outDir = resolve(ROOT, 'dist');
      for (const directory of directories) {
        const from = resolve(ROOT, directory);
        if (!existsSync(from)) {
          this.warn(`Bỏ qua "${directory}" — không tồn tại. Chạy \`npm run gen:audio\` trước?`);
          continue;
        }
        const to = join(outDir, directory);
        cpSync(from, to, { recursive: true });

        const files = readdirSync(to, { recursive: true }).filter((name) =>
          statSync(join(to, String(name))).isFile(),
        );
        this.info(`${directory} → dist/${directory} (${files.length} tệp)`);
      }
    },
  };
}

/**
 * Cho địa chỉ `/thuc-nghiem` (không đuôi) mở `thuc-nghiem.html`.
 *
 * Vite chỉ tự tìm `index.html`, nên không có mẩu này thì người tham gia gõ địa
 * chỉ trong thư mời sẽ gặp 404. Máy chủ tĩnh khi triển khai cần luật viết lại
 * tương đương — xem `BA §10.5`.
 */
function prettyRoutes({ routes }) {
  return {
    name: 'pretty-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = req.url.split('?')[0].replace(/\/$/, '');
        if (routes[path]) req.url = routes[path] + (req.url.slice(path.length) || '');
        next();
      });
    },
  };
}

export default defineConfig({
  // GitHub Pages phục vụ dưới `/vietsoundscape/`; máy chủ phát triển và preview
  // từ gốc. Mã đọc base qua `src/app/asset-url.js`, dữ liệu vẫn viết từ gốc.
  base: process.env.PUBLIC_BASE || '/',
  plugins: [
    copyProjectData({ directories: ['data', 'spike/audio'] }),
    prettyRoutes({ routes: { '/thuc-nghiem': '/thuc-nghiem.html' } }),
  ],
  server: {
    port: 5174,
    fs: { allow: ['.'] },
  },
  build: {
    outDir: 'dist',
    // Hai trang: trang chính và trang phiên nghe. Trang phiên nghe **không** nạp
    // Leaflet, nên tách gói ra là nó nhẹ hẳn — và quan trọng hơn, không có đường
    // nào để `signature_vi` (mô tả đặc trưng âm thanh từng vùng = đáp án viết
    // sẵn) lọt sang trang người tham gia đang ngồi.
    rollupOptions: {
      input: {
        main: resolve(ROOT, 'index.html'),
        experiment: resolve(ROOT, 'thuc-nghiem.html'),
        // Service worker (A5.1): gói riêng, đặt ở gốc bản dựng với tên cố định
        // vì phạm vi của nó là thư mục chứa nó, và URL đăng ký không được đổi
        // theo mã băm.
        sw: resolve(ROOT, 'src/app/offline/sw.js'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name === 'sw' ? 'sw.js' : 'assets/[name]-[hash].js'),
      },
    },
    // Tên tệp mang mã băm nội dung ⇒ đặt được Cache-Control: immutable (NFR-12).
    assetsDir: 'assets',
    // Ngân sách trang đích: JS < 150 kb, CSS < 30 kb. Leaflet một mình đã khoảng
    // 150 kb chưa nén, nên đặt cảnh báo ở 200 kb để biết ngay khi có gì phình.
    chunkSizeWarningLimit: 200,
  },
});
