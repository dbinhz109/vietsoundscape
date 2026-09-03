#!/usr/bin/env node
/**
 * Kết xuất kích thích thực nghiệm thành tệp cố định (việc A4.2, FR-52).
 *
 *   npm run render:stimuli -- --placeholder          — kết xuất từ âm giả lập
 *   npm run render:stimuli -- --placeholder --verify  — kết xuất hai lần, đối chiếu băm
 *
 * Ba bước cho mỗi kích thích, đúng thứ tự đã chốt ở đường ống xử lý âm:
 *   1. trộn theo kịch bản phẳng của `buildVariants` (chưa chỉnh độ to),
 *   2. **đo** độ to bằng `loudnorm` — chỉ đo, không để nó chuẩn hoá,
 *   3. áp **một** hệ số gain tuyến tính bằng bộ lọc `volume`.
 *
 * Vì sao không để `loudnorm` tự chuẩn hoá: nó nén động, làm biến dạng quan hệ độ
 * to giữa các lớp — mà quan hệ đó chính là thứ đề tài muốn giữ.
 *
 * `--verify` là phép chứng minh của FR-52: kết xuất lại lần hai vào thư mục khác
 * rồi so SHA-256. Khớp thì mọi người tham gia nghe đúng cùng một tệp; không khớp
 * thì bảng kê băm vô nghĩa và phải tìm chỗ còn ngẫu nhiên.
 */

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildVariants, countPlanEvents } from '../src/research/variants.js';
import { buildRenderCommand } from '../src/research/render-graph.js';
import { LOUDNESS_TARGET_LUFS, gainToTarget, parseLoudnormJson } from '../src/data/loudness.js';
import { EXPERIMENT_CONDITIONS } from '../src/domain/taxonomy.js';

const ROOT = process.cwd();
const STIMULUS_DURATION_S = 60;

const args = process.argv.slice(2);
const usePlaceholder = args.includes('--placeholder');
const verify = args.includes('--verify');

const ffmpeg = (params) => {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...params], {
    encoding: 'utf-8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`ffmpeg thất bại (mã ${result.status}):\n${result.stderr?.slice(-1500)}`);
  }
  return result.stderr ?? '';
};

const measure = (path) =>
  parseLoudnormJson(
    ffmpeg(['-i', path, '-af', 'loudnorm=print_format=json', '-f', 'null', '-']),
  );

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

// ---------------------------------------------------------------- nạp dữ liệu

const recipeDir = join(ROOT, 'data', 'recipes');
const recipes = readdirSync(recipeDir)
  .filter((name) => name.endsWith('.json') && name !== 'index.json')
  .map((name) => JSON.parse(readFileSync(join(recipeDir, name), 'utf-8')))
  .sort((a, b) => a.id.localeCompare(b.id));

let clips = JSON.parse(readFileSync(join(ROOT, 'data', 'clips.json'), 'utf-8')).clips;

/** Tệp âm của từng mẫu. Chế độ giả lập lấy từ `placeholder_audio` của bản trộn. */
const sources = new Map();
for (const recipe of recipes) {
  for (const layer of recipe.layers ?? []) {
    if (usePlaceholder && layer.placeholder_audio && !sources.has(layer.clip_id)) {
      sources.set(layer.clip_id, join(ROOT, layer.placeholder_audio.replace(/^\//, '')));
    }
  }
}

if (usePlaceholder) {
  // Thời lượng đo từ tệp thật, không khai tay: `buildVariants` từ chối đoán
  // thời lượng của âm phát một lần, và đó là hành vi đúng (FR-56).
  const durations = new Map();
  for (const [clipId, path] of sources) {
    const probe = spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path],
      { encoding: 'utf-8' },
    );
    const seconds = Number(String(probe.stdout).trim());
    if (Number.isFinite(seconds) && seconds > 0) durations.set(clipId, seconds);
  }
  // Chỉ giữ những mẫu **có tệp âm**. Điều kiện `scrambled` chọn mẫu từ vùng
  // khác, nên nếu để cả 32 mẫu trong nguồn chọn thì nó sẽ chọn mẫu chưa có tệp
  // và bước kết xuất chết. Khi có vật liệu thật thì mọi mẫu đã xuất bản đều có
  // tệp, và bộ lọc này thành vô hại.
  clips = clips
    .filter((clip) => sources.has(clip.id))
    .map((clip) => ({ ...clip, duration_s: durations.get(clip.id) }));

  console.log(
    `Chế độ âm giả lập: ${sources.size} tệp, thời lượng đo bằng ffprobe. ` +
      `Nguồn chọn cho scrambled giới hạn ở ${clips.length} mẫu có tệp.\n`,
  );
}

// ------------------------------------------------------------------ kết xuất

/**
 * Tên tệp phục vụ cho người tham gia — **mờ có chủ ý**.
 *
 * Mã kịch bản là `<bản trộn>--<điều kiện>`, mà mã bản trộn chứa tên vùng. Đặt tên
 * tệp theo mã đó là người tham gia mở tab mạng hoặc xem nguồn trang thấy ngay cả
 * điều kiện lẫn đáp án. Băm của **chính nội dung** vừa mờ vừa ổn định: cùng nội
 * dung thì cùng tên, nên tái lập được.
 */
const opaqueName = (hash) => hash.slice(0, 16);

/** Trộn → đo → áp một gain tuyến tính → đổi sang tên mờ. */
function renderPlan(plan, outDir) {
  const rawPath = join(outDir, `${plan.id}.raw.wav`);
  const finalPath = join(outDir, `${plan.id}.wav`);

  // Phản hồi xung đi thẳng từ kịch bản, không tra lại từ bản trộn: `buildVariants`
  // đã bảo đảm cả ba điều kiện mang **cùng một** IR, và tra lại ở đây là mở đường
  // cho hai chỗ lệch nhau.
  const impulsePath = plan.reverb_ir
    ? join(ROOT, plan.reverb_ir.replace(/^\//, ''))
    : null;
  if (impulsePath && !existsSync(impulsePath)) {
    throw new Error(
      `Bản trộn "${plan.recipe_id}" khai vang "${plan.reverb_ir}" nhưng không có tệp đó. ` +
        'Kết xuất không vang trong khi phòng nghe có vang là người tham gia nghe một đằng, ' +
        'trang web trình diễn một nẻo — mà H2 nói về đúng cảm giác không gian đó.',
    );
  }

  const command = buildRenderCommand(plan, {
    sourceFor: (clipId) => sources.get(clipId),
    outputPath: rawPath,
    impulsePath,
  });
  ffmpeg(command.args);

  const measured = measure(rawPath);
  const decision = gainToTarget(measured);

  ffmpeg([
    '-fflags', '+bitexact', '-flags', '+bitexact',
    '-i', rawPath,
    '-af', `volume=${decision.gainDb.toFixed(4)}dB`,
    '-map_metadata', '-1',
    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s24le',
    '-y', finalPath,
  ]);
  rmSync(rawPath);

  const after = measure(finalPath);
  const digest = sha256(finalPath);

  // Đổi sang tên mờ ngay tại đây, không để bước sau: còn tệp mang tên mã kịch
  // bản trong thư mục phục vụ là còn đường lộ.
  const servedName = `${opaqueName(digest)}.wav`;
  renameSync(finalPath, join(outDir, servedName));

  return {
    id: plan.id,
    served_as: servedName,
    reverb_ir: plan.reverb_ir,
    recipe_id: plan.recipe_id,
    location_id: plan.location_id,
    condition: plan.condition,
    seed: plan.seed,
    duration_s: plan.duration_s,
    event_count: countPlanEvents(plan),
    gain_applied_db: Number(decision.gainDb.toFixed(4)),
    limited_by_peak: decision.limitedByPeak,
    loudness_lufs: after.lufs,
    true_peak_dbtp: after.truePeakDbtp,
    sha256: digest,
  };
}

function renderAll(outDir) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const rendered = [];
  for (const recipe of recipes) {
    const variants = buildVariants(recipe, clips, { durationS: STIMULUS_DURATION_S });
    for (const condition of EXPERIMENT_CONDITIONS) {
      rendered.push(renderPlan(variants[condition], outDir));
    }
  }
  return rendered;
}

const outDir = join(ROOT, 'build', 'stimuli');
let rendered;
try {
  rendered = renderAll(outDir);
} catch (error) {
  console.error(`\nKhông kết xuất được: ${error.message}`);
  if (!usePlaceholder) {
    console.error(
      '\nChưa có vật liệu thật thì thêm --placeholder để kết xuất thử từ âm giả lập.',
    );
  }
  process.exit(1);
}

console.log(`Đã kết xuất ${rendered.length} kích thích vào build/stimuli/\n`);
const w = Math.max(...rendered.map((r) => r.id.length));
console.log(`  ${'kịch bản'.padEnd(w)}  sự kiện    LUFS   dBTP  gain    SHA-256`);
for (const item of rendered) {
  console.log(
    `  ${item.id.padEnd(w)}  ${String(item.event_count).padStart(7)}  ` +
      `${item.loudness_lufs.toFixed(1).padStart(6)}  ${item.true_peak_dbtp.toFixed(1).padStart(5)}  ` +
      `${item.gain_applied_db.toFixed(1).padStart(5)}  ${item.sha256.slice(0, 12)}…`,
  );
}

// Độ to là yếu tố gây nhiễu của FR-57, nên kiểm ngay trên tệp đã kết xuất chứ
// không tin vào ý định.
const lufs = rendered.map((r) => r.loudness_lufs);
const spreadLu = Math.max(...lufs) - Math.min(...lufs);
console.log(
  `\nĐộ to: mục tiêu ${LOUDNESS_TARGET_LUFS} LUFS · lệch giữa các kích thích ${spreadLu.toFixed(2)} LU ` +
    `${spreadLu <= 1 ? '✓ đạt FR-57' : '✗ VƯỢT ngưỡng 1 LU'}`,
);

const manifest = {
  generated_from: usePlaceholder ? 'placeholder' : 'field_recordings',
  stimulus_duration_s: STIMULUS_DURATION_S,
  loudness_target_lufs: LOUDNESS_TARGET_LUFS,
  stimuli: rendered,
};
writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Bảng kê băm: build/stimuli/manifest.json');

if (verify) {
  console.log('\n--verify: kết xuất lại lần hai để đối chiếu băm…');
  const secondDir = join(ROOT, 'build', 'stimuli-verify');
  const again = renderAll(secondDir);

  const mismatched = again.filter((item, index) => item.sha256 !== rendered[index].sha256);
  rmSync(secondDir, { recursive: true, force: true });

  if (mismatched.length === 0) {
    console.log(
      `  ✓ ${again.length}/${again.length} tệp khớp băm chính xác.\n` +
        '  FR-52 đạt: kết xuất lại cho ra đúng byte cũ, nên mọi người tham gia nghe\n' +
        '  cùng một tệp và bảng kê băm có giá trị đối chiếu.',
    );
  } else {
    console.error(`  ✗ ${mismatched.length} tệp KHÔNG khớp băm: ${mismatched.map((m) => m.id).join(', ')}`);
    console.error(
      '  Còn chỗ nào chưa xác định trong đường ống. Bảng kê băm chưa dùng được,\n' +
        '  và kích thích chưa tái lập được (FR-52).',
    );
    process.exit(1);
  }
}
