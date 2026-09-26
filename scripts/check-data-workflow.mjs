#!/usr/bin/env node
/** Kiểm nhập âm thật bằng fixture tổng hợp trong thư mục tạm, không chạm bộ đang dùng. */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const temp = mkdtempSync(join(tmpdir(), 'soundscape-import-test-'));
const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const run = (command, args, succeeds = true) => {
  const result = spawnSync(command, args, { cwd: temp, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (succeeds) assert.equal(result.status, 0, result.stderr + result.stdout);
  else assert.notEqual(result.status, 0, 'Đầu vào lỗi phải bị từ chối');
  return result;
};
try {
  for (const directory of ['scripts', 'src', 'data']) cpSync(join(root, directory), join(temp, directory), { recursive: true });
  writeFileSync(join(temp, 'package.json'), '{"type":"module"}');
  mkdirSync(join(temp, 'input/audio'), { recursive: true });
  run('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=2', '-y', 'fixture.wav']);
  const dataset = read(join(temp, 'data/clips.json'));
  const metadata = {};
  for (const clip of dataset.clips) {
    cpSync(join(temp, 'fixture.wav'), join(temp, 'input/audio', `${clip.id}.wav`));
    if (clip.provenance === 'licensed_archive') metadata[clip.id] = {
      source_url: 'https://example.invalid/integration-test-fixture', source_uploader: 'TEST FIXTURE',
      downloaded_at: '2026-09-26T00:00:00Z',
    };
  }
  writeFileSync(join(temp, 'input/audio/metadata.json'), JSON.stringify(metadata));
  const originalBytes = readFileSync(join(temp, 'data/clips.json'), 'utf8');
  run(process.execPath, ['scripts/prepare-data.mjs', '--real']);
  const active = read(join(temp, 'build/runtime/data/clips.json'));
  for (const report of read(join(temp, 'build/runtime/processing.json'))) {
    for (const file of report.files) assert(existsSync(join(temp, file.path)));
  }
  assert.equal(active.synthetic, false);
  assert.equal(active.clips.length, 32);
  for (const clip of active.clips) {
    assert.equal(clip.synthetic, false);
    assert.equal(clip.status, 'processed');
    assert(existsSync(join(temp, clip.audio.slice(1))));
    assert(existsSync(join(temp, clip.research_audio.slice(1))));
  }
  for (const name of readdirSync(join(temp, 'build/runtime/data/recipes')).filter((f) => f !== 'index.json')) {
    const recipe = read(join(temp, 'build/runtime/data/recipes', name));
    assert.equal(recipe.placeholder, false);
    for (const layer of recipe.layers) {
      assert(!('placeholder_audio' in layer));
      assert(existsSync(join(temp, layer.audio.slice(1))));
    }
  }
  assert.equal(readFileSync(join(temp, 'data/clips.json'), 'utf8'), originalBytes);
  const activeBytes = readFileSync(join(temp, 'build/runtime/data/clips.json'), 'utf8');
  rmSync(join(temp, 'input/audio/HN-01.wav'));
  run(process.execPath, ['scripts/prepare-data.mjs', '--real'], false);
  assert.equal(readFileSync(join(temp, 'build/runtime/data/clips.json'), 'utf8'), activeBytes);
  console.log('ĐẠT: nhập 32 WAV theo đường thật, nối 12 bản trộn, giữ data gốc; thiếu nguồn không phá bộ đang dùng.');
} finally {
  rmSync(temp, { recursive: true, force: true });
}
