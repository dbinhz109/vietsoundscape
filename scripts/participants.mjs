/**
 * Theo dõi tuyển người tham gia — việc C2.1 (mở danh sách chờ) và C5.2 (theo dõi hằng tuần).
 *
 *   node scripts/participants.mjs <danh-sach-cho.csv> [--deadline YYYY-MM-DD] [--target 96] [--floor 84]
 *
 * CSV nằm NGOÀI git (mẫu cột: nghien-cuu/mau-danh-sach-cho.csv; `.gitignore` đã chặn
 * `nghien-cuu/danh-sach-cho*.csv`). Script chỉ đọc và đếm; luật ở src/research/recruitment.js.
 */

import { readFileSync } from 'node:fs';
import { nextFreeId, parseWaitlistCsv, summariseRecruitment } from '../src/research/recruitment.js';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};
const file = args.find((a) => !a.startsWith('--') && !/^\d{4}-\d{2}-\d{2}$/.test(a) && !/^\d+$/.test(a));
if (!file) {
  console.error('Cách dùng: node scripts/participants.mjs <danh-sach-cho.csv> [--deadline YYYY-MM-DD]');
  process.exit(2);
}

const target = Number(option('target', 96));
const floor = Number(option('floor', 84));
const deadline = option('deadline', undefined);
const today = new Date().toISOString().slice(0, 10);

let rows;
try {
  rows = parseWaitlistCsv(readFileSync(file, 'utf-8'));
} catch (error) {
  console.error(`Không đọc được ${file}: ${error.message}`);
  process.exit(1);
}

const s = summariseRecruitment(rows, { target, floor, roundSize: 12, today, deadline });
const bar = '█'.repeat(Math.min(30, Math.round((s.completed / target) * 30))).padEnd(30, '·');

console.log(`TUYỂN NGƯỜI THAM GIA  ·  ${today}\n`);
console.log(`Đã nghe      ${bar}  ${s.completed}/${target} (sàn ${floor})`);
console.log(`Đăng ký ${s.registered} · chờ ${s.waiting} · loại ${s.excluded}`);
console.log(`Còn thiếu    ${s.remainingToTarget} tới mục tiêu · ${s.remainingToFloor} tới sàn`);
console.log(`Vòng 12      ${s.completeRounds} vòng tròn · vòng đang mở thiếu ${s.openRoundMissing}`);
if (deadline) console.log(`Hạn ${deadline}  còn ${s.weeksLeft} tuần → cần ${s.neededPerWeek} người/tuần`);
console.log(`Mã kế tiếp   ?nguoi=${nextFreeId(rows)}`);

if (s.byWeek.length > 0) {
  console.log('\nTheo tuần:');
  for (const { week, completed } of s.byWeek) console.log(`  ${week}  ${'▇'.repeat(completed)} ${completed}`);
}
const fmtCounts = (counts) => Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ') || '—';
console.log(`\nThiết bị nghe: ${fmtCounts(s.devices)}`);
console.log(`Tai nghe:      ${fmtCounts(s.headphones)}`);

if (s.completed >= floor && s.completed < target) {
  console.log('\nĐã qua sàn 84 nhưng chưa tới 96 — kế hoạch phân tích §2.4: KHÔNG dừng theo p, tuyển tiếp tới bội của 12.');
}
if (s.completed >= target) console.log('\nĐủ cỡ mẫu. Bước tiếp: khoá danh sách, chạy `npm run analyse` trên log.');
