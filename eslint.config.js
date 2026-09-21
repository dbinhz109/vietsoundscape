/**
 * ESLint — việc B0.3 của lộ trình, phần "linter".
 *
 * Chỉ bắt **lỗi thật**, không bắt phong cách: biến không dùng, tên chưa khai,
 * `case` rơi xuyên, `await` trong vòng lặp tuần tự, so sánh `==`. Phong cách để
 * Prettier lo, và Prettier ở đây là **tuỳ chọn** — xem `.prettierignore` và
 * sổ quyết định Q-31: định dạng lại cả cây làm hỏng chỗ đọc được nhất của mã
 * (mảng tham số ffmpeg theo cặp cờ–giá trị, bảng hệ số AS241 chép từ bài báo).
 */

import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: ['dist/', 'build/', 'coverage/', 'node_modules/', 'spike/audio/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Biến không dùng gần như luôn là dấu vết của một lần sửa dở. Cho phép
      // `_` ở đầu tên để cố ý bỏ qua tham số (ví dụ `(_req, res)`).
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // `==` giữa chuỗi và số đã gây đủ lỗi trong lịch sử JS; ngoại lệ `== null`
      // để kiểm cả `null` lẫn `undefined` trong một phép so sánh.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      // Ném thứ không phải Error thì mất stack — mọi chỗ bắt lỗi trong repo đều
      // đọc `error.message`.
      'no-throw-literal': 'error',
      'no-console': 'off', // script dòng lệnh in ra là việc chính của chúng
    },
  },
  {
    // Bảng hệ số chép **nguyên văn** từ bài báo gốc (AS241 Wichura 1988; công
    // thức Abramowitz–Stegun). Chúng cố ý mang nhiều chữ số hơn một `double`
    // giữ được: chép đúng hằng số đã công bố rồi để máy làm tròn về double gần
    // nhất là cách đúng, còn tự cắt bớt chữ số là đưa thêm sai số của mình vào.
    // `no-loss-of-precision` bắt đúng ý nghĩa nhưng sai ngữ cảnh ở đây.
    files: ['src/research/power.js', 'src/research/statistics.js'],
    rules: { 'no-loss-of-precision': 'off' },
  },
  {
    // Tệp kiểm thử: vitest đưa sẵn `describe`/`test`/`expect` vào phạm vi.
    files: ['**/*.test.js'],
    languageOptions: { globals: { ...globals.vitest } },
  },
  {
    // Service worker chạy trong phạm vi riêng, có `self`, `caches`, `clients`.
    files: ['src/app/offline/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
];
