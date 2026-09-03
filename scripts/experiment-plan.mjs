#!/usr/bin/env node
/**
 * In kế hoạch phân điều kiện cho thực nghiệm H1/H2 (việc C3.1, C4.1).
 *
 *   npm run experiment                      — cỡ mẫu mặc định 48
 *   npm run experiment -- 12                — xem trọn một vòng cân bằng
 *   npm run experiment -- 48 --full         — in đủ phiên của từng người
 *   npm run experiment -- 48 --placeholder  — đo thời lượng từ âm giả lập để
 *                                             dựng thử biến thể trước khi có
 *                                             vật liệu thật
 *
 * Dùng trước khi tuyển người: nó cho biết cỡ mẫu dự kiến có cân bằng không, và
 * nếu chưa thì cần thêm mấy người. Phát hiện lệch sau khi thu xong thì không
 * sửa được nữa — dữ liệu đã có rồi.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { assignCohort, summariseCoverage } from '../src/research/assignment.js';
import { checkRecipeCoverage, checkStimulusBalance } from '../src/research/stimulus.js';
import { buildVariants, countPlanEvents } from '../src/research/variants.js';
import { EXPERIMENT_CONDITIONS } from '../src/domain/taxonomy.js';
import { LOUDNESS_TARGET_LUFS } from '../src/data/loudness.js';

const ROOT = process.cwd();
/** Khung thời lượng mỗi kích thích. Đủ dài để nghe ra bối cảnh, đủ ngắn để làm 4 lượt. */
const STIMULUS_DURATION_S = 60;
const RENDER_TARGET_LUFS = LOUDNESS_TARGET_LUFS;
const args = process.argv.slice(2);
const showAll = args.includes('--full');
const usePlaceholder = args.includes('--placeholder');
const size = Number(args.find((a) => /^\d+$/.test(a)) ?? 48);

const recipeDir = join(ROOT, 'data', 'recipes');
const recipes = readdirSync(recipeDir)
  .filter((name) => name.endsWith('.json') && name !== 'index.json')
  .map((name) => JSON.parse(readFileSync(join(recipeDir, name), 'utf-8')));

const locations = [...new Set(recipes.map((r) => r.location_id))].sort();

console.log('Kế hoạch thực nghiệm — thiết kế TRONG-NGƯỜI (BA §10.2)\n');
console.log(`  Địa điểm   ${locations.length}: ${locations.join(', ')}`);
console.log(`  Điều kiện  ${EXPERIMENT_CONDITIONS.length}: ${EXPERIMENT_CONDITIONS.join(', ')}`);
console.log(`  Cỡ mẫu     ${size} người · ${size * locations.length} lượt nghe`);

const cohort = assignCohort(size, locations);
const summary = summariseCoverage(cohort, locations);

console.log(`\nCân bằng — một vòng đầy đủ là ${summary.cycleSize} người:`);
if (summary.balanced) {
  console.log(`  ✓ ${size} chia hết cho ${summary.cycleSize}: mọi ô địa điểm × điều kiện phủ đều nhau.`);
} else {
  console.log(
    `  ⚠ ${size} không chia hết cho ${summary.cycleSize} — có ô được nghe nhiều hơn ô khác.\n` +
      `    Lấy ${summary.nextBalancedSize} người thì cân bằng chính xác.`,
  );
}

console.log('\n  Số lượt mỗi ô (địa điểm × điều kiện):');
const width = Math.max(...locations.map((l) => l.length));
console.log(`    ${''.padEnd(width)}  ${EXPERIMENT_CONDITIONS.map((c) => c.padStart(10)).join('')}`);
for (const location of locations) {
  const cells = EXPERIMENT_CONDITIONS.map((c) =>
    String(summary.cells[`${location}|${c}`]).padStart(10),
  ).join('');
  console.log(`    ${location.padEnd(width)}  ${cells}`);
}

console.log('\n  Điều kiện đứng đầu phiên (chống hiệu ứng khởi động):');
for (const [condition, count] of Object.entries(summary.firstPosition)) {
  console.log(`    ${condition.padEnd(width + 2)}${String(count).padStart(8)} người`);
}

const preview = showAll ? cohort : cohort.slice(0, 4);
console.log(`\nPhiên nghe${showAll ? '' : ' (4 người đầu, thêm --full để xem hết)'}:`);
preview.forEach((trials, index) => {
  const line = trials.map((t) => `${t.location_id}/${t.condition}`).join('  →  ');
  console.log(`  #${String(index).padStart(3)}  ${line}`);
});

// Dựng thử ba biến thể điều kiện cho từng bản trộn và kiểm cân bằng ngay
// (FR-52, FR-56…FR-58). Chỗ nào chưa dựng được thì nêu đúng lý do.
let clips = JSON.parse(readFileSync(join(ROOT, 'data', 'clips.json'), 'utf-8')).clips;

// `--placeholder`: đo thời lượng từ tệp âm giả lập để chứng minh đường ống chạy
// trước khi có vật liệu thật. Cùng đường mã, chỉ khác nguồn thời lượng — nên
// khi có bản ghi thật thì `npm run process` điền `duration_s` và bỏ cờ này đi.
if (usePlaceholder) {
  const durations = new Map();
  for (const recipe of recipes) {
    for (const layer of recipe.layers ?? []) {
      if (!layer.placeholder_audio || durations.has(layer.clip_id)) continue;
      const probe = spawnSync(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
         join(ROOT, layer.placeholder_audio.replace(/^\//, ''))],
        { encoding: 'utf-8' },
      );
      const seconds = Number(String(probe.stdout).trim());
      if (Number.isFinite(seconds) && seconds > 0) durations.set(layer.clip_id, seconds);
    }
  }
  clips = clips.map((clip) =>
    durations.has(clip.id) ? { ...clip, duration_s: durations.get(clip.id) } : clip,
  );
  console.log(
    `\n  (chế độ --placeholder: lấy thời lượng từ ${durations.size} tệp âm giả lập bằng ffprobe)`,
  );
}

console.log(`\nBiến thể điều kiện — khung ${STIMULUS_DURATION_S} giây mỗi kích thích:`);
let variantsReady = 0;
for (const recipe of recipes) {
  try {
    const variants = buildVariants(recipe, clips, { durationS: STIMULUS_DURATION_S });
    const balance = checkStimulusBalance(
      Object.values(variants).map((plan) => ({
        id: plan.id,
        condition: plan.condition,
        duration_s: plan.duration_s,
        event_count: countPlanEvents(plan),
        loudness_lufs: RENDER_TARGET_LUFS,
      })),
    );
    const counts = EXPERIMENT_CONDITIONS.map((c) => countPlanEvents(variants[c])).join('/');
    console.log(
      `  ${balance.balanced ? '✓' : '✗'} ${recipe.id.padEnd(24)} ${counts} sự kiện · ` +
        `${balance.balanced ? 'cân bằng' : 'LỆCH'}`,
    );
    for (const issue of balance.issues) console.log(`      ${issue}`);
    if (balance.balanced) variantsReady += 1;
  } catch (error) {
    console.log(`  ✗ ${recipe.id.padEnd(24)} chưa dựng được`);
    console.log(`      ${error.message}`);
  }
}

const coverage = checkRecipeCoverage(recipes, locations);
if (!coverage.met || variantsReady < recipes.length) {
  const total = Object.values(coverage.shortfall).reduce((a, b) => a + b, 0);
  console.log('\n⚠ CHƯA CHẠY ĐƯỢC THỰC NGHIỆM:');
  if (!coverage.met) {
    console.log(`  · FR-59 cần ≥ ${coverage.minPerLocation} bản trộn mỗi vùng, còn thiếu ${total}.`);
  }
  if (variantsReady < recipes.length) {
    console.log(
      `  · ${recipes.length - variantsReady}/${recipes.length} bản trộn chưa dựng được biến thể — xem lý do ở trên.`,
    );
  }
}

console.log(
  '\nGhi chú: phân điều kiện lấy theo SỐ THỨ TỰ người tham gia, không lấy ngẫu nhiên.\n' +
    'Nhờ vậy cân bằng chính xác thay vì cân bằng "trung bình", và sau khi thu xong vẫn\n' +
    'dựng lại được đúng những gì người thứ k đã nghe mà không cần lưu thêm gì.',
);
