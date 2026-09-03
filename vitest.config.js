import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.js'],
    coverage: {
      // Chỉ tính code sản phẩm. `scripts/` là dụng cụ dựng dữ liệu và `spike/`
      // là dụng cụ đo của mốc M0 — gộp vào sẽ làm con số phủ mất ý nghĩa.
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.test.js',
        // Ba tệp dưới đây chỉ nối dây, không chứa quyết định nào:
        //  - `main.js` là điểm nối dữ liệu ↔ bản đồ ↔ phòng nghe ↔ URL.
        //  - `sound-map.js` là vỏ bọc mỏng quanh Leaflet.
        //  - `main-experiment.js` nối phiên nghe; mọi quyết định đã tách sang
        //    `bootstrap.js` và `session.js` chính vì lý do này — cái gì sai được
        //    thì phải kiểm được.
        // Kiểm chúng bằng đơn vị sẽ phải giả lập toàn bộ Leaflet, `fetch` và
        // trình tải tệp, mà phép kiểm thu được chỉ nói "đã gọi đúng hàm của thư
        // viện". Chúng được kiểm ở tầng trình duyệt thật (Playwright) — nơi phép
        // kiểm mới có nghĩa.
        'src/app/main.js',
        'src/app/map/sound-map.js',
        'src/app/experiment/main-experiment.js',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
