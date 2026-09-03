/**
 * Phiếu khảo sát kho âm có giấy phép mở — việc A0.1b của lộ trình.
 *
 * Biến "đi lướt web tìm âm" thành một danh sách có từ khoá cụ thể, đếm được tiến
 * độ, và máy kiểm được giấy phép ngay khi điền vào.
 *
 * Cách dùng:
 *   node scripts/survey-archives.mjs           # xem phiếu và tiến độ
 *   node scripts/survey-archives.mjs --todo    # chỉ những mẫu còn thiếu
 *
 * Cách điền: mở `data/clips.json`, tìm mẫu theo mã, điền `source_url`,
 * `source_uploader`, `downloaded_at`, `license`, rồi đổi `survey.status` thành
 * `da_chon`. Chạy `npm run validate` để máy kiểm lại.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALLOWED_LICENSES } from '../src/domain/taxonomy.js';

const ROOT = join(import.meta.dirname, '..');
const { clips } = JSON.parse(readFileSync(join(ROOT, 'data', 'clips.json'), 'utf-8'));
const locations = JSON.parse(readFileSync(join(ROOT, 'data', 'locations.geojson'), 'utf-8'));

const nameOf = new Map(
  locations.features.map((f) => [f.properties.location_id, f.properties.name_vi]),
);

const onlyTodo = process.argv.includes('--todo');
const archiveClips = clips.filter((c) => c.provenance === 'licensed_archive');

const isFilled = (clip) =>
  Boolean(clip.source_url && clip.source_uploader && clip.downloaded_at && clip.license);

console.log('PHIẾU KHẢO SÁT KHO ÂM CÓ GIẤY PHÉP MỞ  ·  việc A0.1b\n');
console.log(`Chỉ nhận giấy phép: ${ALLOWED_LICENSES.filter((l) => l.startsWith('CC')).join(', ')}`);
console.log('KHÔNG nhận bất kỳ biến thể NC (phi thương mại) — nó chặn luôn giá trị');
console.log('quảng bá du lịch mà đề tài đã nêu (BA LG-03). Bộ kiểm sẽ từ chối.\n');
console.log('Ưu tiên bản DÀI 1–5 phút. Loop 3 giây nghe ra ngay là lặp.\n');

let done = 0;
let currentLocation = null;

for (const clip of archiveClips) {
  const filled = isFilled(clip);
  if (filled) done += 1;
  if (onlyTodo && filled) continue;

  if (clip.location_id !== currentLocation) {
    currentLocation = clip.location_id;
    console.log(`\n${'═'.repeat(74)}`);
    console.log(`${nameOf.get(currentLocation) ?? currentLocation}`);
    console.log('═'.repeat(74));
  }

  const survey = clip.survey ?? {};
  console.log(`\n  ${filled ? '✓' : '☐'} ${clip.id}  ${clip.title_vi}`);
  console.log(`      vai/nhóm   ${clip.schafer_role} · ${clip.krause_class}`);
  console.log(`      kho        ${survey.archive ?? '—'}`);
  console.log(`      từ khoá    ${(survey.search_terms ?? []).join(' | ')}`);

  if (filled) {
    console.log(`      đã chọn    ${clip.license} · ${clip.source_uploader} · ${clip.downloaded_at}`);
    console.log(`      nguồn      ${clip.source_url}`);
  } else {
    console.log('      cần điền   source_url · source_uploader · downloaded_at · license');
  }
  if (clip.planning_note) console.log(`      ghi chú    ${clip.planning_note}`);
}

const total = archiveClips.length;
const bar = '█'.repeat(Math.round((done / total) * 30)).padEnd(30, '·');
console.log(`\n${'═'.repeat(74)}`);
console.log(`Tiến độ  ${bar}  ${done}/${total} mẫu đã chọn được nguồn`);

if (done < total) {
  console.log('\nSau khi điền: `npm run validate` để máy kiểm giấy phép và tính đầy đủ.');
  console.log('Chỗ nào kho không có gì đáng dùng thì đổi mẫu đó sang tự thu — cập nhật');
  console.log('`provenance` thành `field_recording` rồi thêm vào danh sách chuyến thực địa.');
} else {
  console.log('\nXong A0.1b. Bước tiếp: chạy `npm run process` trên các tệp đã tải về.');
}
