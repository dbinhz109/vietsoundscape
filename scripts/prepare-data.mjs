#!/usr/bin/env node
/** Chuẩn bị bộ dữ liệu chạy được, giữ nguyên dữ liệu biên tập trong data/. */
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { materializeClip, materializeRecipe } from '../src/data/runtime-dataset.js';
import { validateDataset } from '../src/data/clip-schema.js';
import { indexClipsById, validateRecipe } from '../src/data/recipe-schema.js';

const root = resolve(import.meta.dirname, '..');
process.chdir(root);
const args = process.argv.slice(2);
const demo = args.includes('--demo');
if (demo === args.includes('--real')) throw new Error('Chọn đúng một chế độ: --demo hoặc --real.');
const input = resolve(args.find((a) => a.startsWith('--input='))?.slice(8) || 'input/audio');
const run = (command, params) => {
  const result = spawnSync(command, params, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} thất bại (${result.status}).`);
};
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const write = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
const dataset = read('data/clips.json');
const metadataPath = join(input, 'metadata.json');
const metadata = !demo && existsSync(metadataPath) ? read(metadataPath) : {};
for (const id of Object.keys(metadata)) {
  if (!dataset.clips.some((clip) => clip.id === id)) throw new Error(`Metadata chứa mã lạ: ${id}`);
}

if (demo) run('python3', ['scripts/gen_dataset_audio.py']);
const sourceDir = demo ? 'build/demo-sources' : input;
const sources = dataset.clips.map((clip) => join(sourceDir, `${clip.id}.wav`));
if (!demo) {
  const inputCheck = validateDataset(dataset.clips.map((clip) => ({ ...clip,
    ...(metadata[clip.id] ?? {}), id: clip.id,
    status: 'processed',
  })));
  if (!inputCheck.valid) throw new Error(`Metadata đầu vào chưa hợp lệ:\n${JSON.stringify(inputCheck.byClip, null, 2)}`);
}
const missing = sources.filter((source) => !existsSync(source));
if (missing.length) throw new Error(`Thiếu ${missing.length} tệp:\n${missing.join('\n')}`);

// Dựng ở thư mục tạm; lỗi đầu vào không phá bộ đang dùng.
const stage = 'build/runtime-next';
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync('data', join(stage, 'data'), { recursive: true });
run(process.execPath, ['scripts/process-audio.mjs', ...sources,
  `--out=${stage}/audio`, `--report=${stage}/processing.json`]);
const reports = read(join(stage, 'processing.json'));
dataset.clips = dataset.clips.map((original) => materializeClip(original,
  reports.find((r) => r.id === original.id), {
    metadata: metadata[original.id], synthetic: demo, audioPrefix: '/build/runtime/audio/',
  }));
const checked = validateDataset(dataset.clips);
if (!checked.valid) throw new Error(`Metadata chưa hợp lệ:\n${JSON.stringify(checked.byClip, null, 2)}`);
const byId = indexClipsById(dataset.clips);
const recipeDir = join(stage, 'data/recipes');
const recipes = readdirSync(recipeDir).filter((f) => f.endsWith('.json') && f !== 'index.json').map((name) => {
  const recipe = materializeRecipe(read(join(recipeDir, name)), byId, demo);
  const result = validateRecipe(recipe, byId);
  if (!result.valid) throw new Error(JSON.stringify(result.errors));
  write(join(recipeDir, name), recipe);
  return recipe;
});
dataset.synthetic = demo;
dataset.dataset_version = `${demo ? 'demo' : 'real'}-` + createHash('sha256')
  .update(JSON.stringify({ clips: dataset.clips, recipes })).digest('hex').slice(0, 16);
write(join(stage, 'data/clips.json'), dataset);
write(join(stage, 'mode.json'), { synthetic: demo, dataset_version: dataset.dataset_version });
for (const report of reports) {
  for (const file of report.files) file.path = file.path.replace(stage, 'build/runtime');
}
write(join(stage, 'processing.json'), reports);
const previous = 'build/runtime-previous';
rmSync(previous, { recursive: true, force: true });
if (existsSync('build/runtime')) renameSync('build/runtime', previous);
renameSync(stage, 'build/runtime');
rmSync(previous, { recursive: true, force: true });
// Không để phiên nghe dùng kích thích của bộ dữ liệu trước.
rmSync('build/stimuli', { recursive: true, force: true });
console.log(`\nĐã chuẩn bị ${dataset.clips.length} mẫu / ${recipes.length} bản trộn: ${dataset.dataset_version}`);
console.log('Tiếp theo: npm run render:stimuli && npm run build');
