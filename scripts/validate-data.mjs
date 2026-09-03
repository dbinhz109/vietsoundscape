/**
 * Kiểm bộ dữ liệu thật bằng luật ở `src/data/clip-schema.js`.
 *
 * Chạy trong CI. Thoát mã 1 nếu có lỗi, để một mẫu giấy phép NC hay một mẫu
 * thiếu metadata không lọt được vào nhánh chính.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { validateDataset } from '../src/data/clip-schema.js';
import { indexClipsById, validateRecipe } from '../src/data/recipe-schema.js';
import { KRAUSE_CLASSES, SCHAFER_ROLES } from '../src/domain/taxonomy.js';
import { checkRecipeCoverage } from '../src/research/stimulus.js';
import { composeAnswerOptions } from '../src/research/answer-options.js';

// Neo vào thư mục gốc của dự án, không phụ thuộc cwd lúc gọi.
const ROOT = join(import.meta.dirname, '..');
const read = (name) => JSON.parse(readFileSync(join(ROOT, 'data', name), 'utf-8'));

const { dataset_version: version, clips } = read('clips.json');
const locations = read('locations.geojson');
const locationIds = new Set(locations.features.map((f) => f.properties.location_id));

console.log(`Bộ dữ liệu ${version}: ${clips.length} mẫu âm, ${locationIds.size} địa điểm\n`);

const result = validateDataset(clips);

// Luật liên bảng: mọi mẫu phải trỏ tới một địa điểm có thật.
const orphans = clips.filter((c) => !locationIds.has(c.location_id));
for (const clip of orphans) {
  console.error(`  ✗ ${clip.id}: location_id "${clip.location_id}" không có trong locations.geojson`);
}

for (const [id, errors] of Object.entries(result.byClip)) {
  for (const error of errors) console.error(`  ✗ ${id} [${error.field}] ${error.message}`);
}

// Thống kê để thấy ngay bộ dữ liệu có cân hay không.
const count = (predicate) => clips.filter(predicate).length;
const table = [
  ['Tự thu', count((c) => c.provenance === 'field_recording')],
  ['Tải từ kho', count((c) => c.provenance === 'licensed_archive')],
  ['Bắt buộc xác minh tại chỗ (⭐)', count((c) => c.must_verify_on_site)],
  ['Âm đã mất (lost)', count((c) => c.endangerment_level === 'lost')],
];
for (const role of SCHAFER_ROLES) table.push([`vai ${role}`, count((c) => c.schafer_role === role)]);
for (const krause of KRAUSE_CLASSES) table.push([`nhóm ${krause}`, count((c) => c.krause_class === krause)]);

for (const [label, value] of table) console.log(`  ${label.padEnd(32)} ${value}`);

// Điều kiện của rủi ro R-10: mỗi địa điểm phải có ít nhất một mẫu ⭐, nếu không
// thì bản trộn của nơi đó không dùng làm kích thích cho H1 được.
console.log('');
let r10Failed = false;
for (const locationId of locationIds) {
  const stars = clips.filter((c) => c.location_id === locationId && c.must_verify_on_site);
  const ok = stars.length >= 1;
  if (!ok) r10Failed = true;
  console.log(`  ${ok ? '✓' : '✗'} ${locationId.padEnd(16)} ${stars.length} mẫu ⭐ (R-10 cần ≥ 1)`);
}

// Đồng thuận: mẫu nào còn nợ văn bản gì (việc A0.2).
const needsConsent = clips.filter(
  (c) => c.contains_identifiable_voice || c.cultural_expression,
);
if (needsConsent.length > 0) {
  console.log(`\nĐồng thuận — ${needsConsent.length} mẫu cần văn bản (phap-ly/):`);
  for (const clip of needsConsent) {
    const form = clip.cultural_expression ? '02 thoả thuận cộng đồng' : '01 phiếu đồng thuận';
    const ready = clip.cultural_expression
      ? clip.consent_status === 'community_agreed'
      : clip.consent_status === 'obtained';
    console.log(
      `  ${ready ? '✓' : '☐'} ${clip.id.padEnd(6)} ${clip.title_vi.padEnd(30)} ` +
        `${clip.consent_status.padEnd(17)} cần: ${form}`,
    );
  }
  const pending = needsConsent.filter(
    (c) => c.consent_status === 'pending' || c.consent_status === 'not_required',
  ).length;
  if (pending > 0) {
    console.log(
      `\n  ${pending} mẫu chưa có đồng thuận. Chúng vẫn hợp lệ ở trạng thái nháp, nhưng\n` +
        '  bộ kiểm sẽ CHẶN khi chuyển sang published. Xem phap-ly/README.md.',
    );
  }
}

// Dữ liệu nhạy cảm: nghĩa vụ nặng hơn hẳn, nên tách riêng khỏi bảng đồng thuận
// ở trên để không ai lướt qua (Nghị định 356/2025/NĐ-CP Điều 4 khoản 1).
const CATEGORY_LABELS = {
  ethnic_origin: 'điểm a · nguồn gốc dân tộc',
  religious_belief: 'điểm b · tôn giáo, tín ngưỡng',
  biometric: 'điểm đ · sinh trắc học',
};
const sensitive = clips.filter((c) => c.sensitive_categories?.length > 0);
if (sensitive.length > 0) {
  console.log(`\nDữ liệu cá nhân NHẠY CẢM — ${sensitive.length} mẫu (NĐ 356 Điều 4 khoản 1):`);
  for (const clip of sensitive) {
    const labels = clip.sensitive_categories.map((c) => CATEGORY_LABELS[c] ?? c).join(' + ');
    const noticed = clip.sensitive_notice_given === true && clip.recording_notice_given === true;
    console.log(`  ${noticed ? '✓' : '☐'} ${clip.id.padEnd(6)} ${clip.title_vi.padEnd(30)} ${labels}`);
  }
  console.log(
    '\n  Ngoài đồng thuận, mỗi mẫu trên còn cần HAI xác nhận trước khi xuất bản:\n' +
      '    · sensitive_notice_given  — đã nói rõ với người ký đây là dữ liệu nhạy cảm (NĐ 356 Điều 6.4)\n' +
      '    · recording_notice_given  — đã báo cho người có mặt biết đang bị ghi âm (Luật Điều 32.2)\n' +
      '  Và phải phân quyền giới hạn truy cập tệp gốc — phap-ly/04, mục cuối.',
  );
}

// Bản trộn: kiểm hợp đồng dữ liệu và cờ dùng được cho thực nghiệm.
const clipsById = indexClipsById(clips);
const recipeFiles = readdirSync(join(ROOT, 'data', 'recipes')).filter(
  (name) => name.endsWith('.json') && name !== 'index.json',
);

console.log(`\nBản trộn (${recipeFiles.length}):`);
let recipesFailed = false;
const loadedRecipes = [];
for (const name of recipeFiles) {
  const recipe = JSON.parse(readFileSync(join(ROOT, 'data', 'recipes', name), 'utf-8'));
  loadedRecipes.push(recipe);
  const check = validateRecipe(recipe, clipsById);
  if (!check.valid) recipesFailed = true;

  const flags = [
    check.valid ? 'hợp lệ' : 'LỖI',
    check.experimentReady ? 'dùng được cho H1' : 'chưa dùng được cho H1',
    recipe.placeholder ? 'âm giả lập' : 'âm thật',
  ].join(' · ');
  console.log(`  ${check.valid ? '✓' : '✗'} ${recipe.id.padEnd(24)} ${recipe.layers.length} lớp · ${flags}`);
  for (const error of check.errors) console.error(`      [${error.field}] ${error.message}`);
}

const notReady = recipeFiles.length;
console.log(
  '\n  Ghi chú: bản trộn "chưa dùng được cho H1" là đúng ở giai đoạn này — điều kiện R-10 cần\n' +
    '  ít nhất một mẫu tự thu đã xác minh tại chỗ, mà chưa đi thực địa nên chưa mẫu nào có.',
);

// FR-59: đủ bản trộn mỗi vùng chưa. Ràng buộc này làm tăng khối lượng thu âm,
// nên phải hiện sớm chứ không phải phát hiện lúc sắp chạy thực nghiệm.
const recipeLocations = [...new Set(loadedRecipes.map((r) => r.location_id))];
const coverage = checkRecipeCoverage(loadedRecipes, recipeLocations);
if (!coverage.met) {
  const total = Object.values(coverage.shortfall).reduce((a, b) => a + b, 0);
  console.log(
    `\n  ⚠ FR-59: cần ≥ ${coverage.minPerLocation} bản trộn mỗi vùng, hiện còn thiếu ${total} bản:`,
  );
  for (const [location, missing] of Object.entries(coverage.shortfall)) {
    console.log(`      ${location.padEnd(18)} có ${coverage.counts[location]}, thiếu ${missing}`);
  }
  console.log(
    '      Vì sao cần 3: có một bản trộn mỗi vùng thì kết quả H1 có thể chỉ phản ánh\n' +
      '      đúng bản trộn đó, không phản ánh vùng miền. Việc A3.3 của lộ trình.',
  );
}

// Phương án nhiễu (spec S1.1): danh sách trả lời phải dài hơn số vùng sẽ nghe,
// và không phương án nào được trùng vùng thật — nếu không "correct" mất nghĩa.
const { distractors } = read('distractors.json');
let distractorsFailed = false;
try {
  const options = composeAnswerOptions(
    [...locationIds],
    distractors.map((d) => d.location_id),
  );
  const regions = new Set(locations.features.map((f) => f.properties.region));
  const uncovered = [...regions].filter((r) => !distractors.some((d) => d.region === r));
  if (uncovered.length > 0) {
    distractorsFailed = true;
    console.error(`  ✗ vùng không có phương án nhiễu cùng vùng: ${uncovered.join(', ')}`);
  }
  console.log(
    `\nDanh sách trả lời: ${options.length} ô = ${locationIds.size} vùng thật + ` +
      `${distractors.length} phương án nhiễu (${distractors.map((d) => d.name_vi).join(', ')})`,
  );
} catch (error) {
  distractorsFailed = true;
  console.error(`  ✗ distractors.json: ${error.message}`);
}

const failed =
  !result.valid || orphans.length > 0 || r10Failed || recipesFailed || distractorsFailed;
console.log(failed ? '\nKHÔNG ĐẠT' : `\nĐẠT — ${clips.length} mẫu và ${notReady} bản trộn đều hợp lệ`);
process.exit(failed ? 1 : 0);
