#!/usr/bin/env node
/** Log mô phỏng đi qua cùng máy trạng thái như người dùng trình duyệt. */
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createExperimentSession, REQUIRED_CONSENT_PURPOSES } from '../src/app/experiment/session.js';
import { ISO_ATTRIBUTE_KEYS } from '../src/research/soundscape-scale.js';
import { composeAnswerOptions } from '../src/research/answer-options.js';
import { createRng } from '../src/audio/trigger.js';

const read = (path) => JSON.parse(readFileSync(path, 'utf8'));
const base = 'build/runtime/data';
const dataset = read(`${base}/clips.json`);
if (dataset.synthetic !== true) throw new Error('Chạy prepare:demo trước; không sinh log demo vào bộ thật.');
const count = Number(process.argv.find((a) => a.startsWith('--count='))?.slice(8) ?? 96);
if (!Number.isSafeInteger(count) || count < 1) throw new Error('--count phải là số nguyên dương.');
const locations = read(`${base}/locations.geojson`).features.map((f) => f.properties.location_id);
const recipes = read(`${base}/recipes/index.json`);
const options = composeAnswerOptions(locations, read(`${base}/distractors.json`).distractors.map((d) => d.location_id));
const out = 'build/demo/logs';
mkdirSync(out, { recursive: true });
const expected = new Set(Array.from({ length: count }, (_, i) => `nguoi-${String(i).padStart(3, '0')}.json`));
for (const name of readdirSync(out).filter((f) => f.endsWith('.json'))) {
  if (!expected.has(name) || read(join(out, name)).synthetic !== true) {
    throw new Error(`Thư mục demo chứa log ngoài bộ sẽ sinh: ${name}. Chuyển log này đi trước.`);
  }
}
const rng = createRng(260926);
for (let participantIndex = 0; participantIndex < count; participantIndex++) {
  let tick = participantIndex * 600;
  const session = createExperimentSession({ participantIndex, locations, recipes,
    answerOptions: options, likertFields: ISO_ATTRIBUTE_KEYS,
    now: () => new Date(Date.UTC(2026, 8, 26) + tick++ * 1000).toISOString() });
  session.giveConsent(Object.fromEntries(REQUIRED_CONSENT_PURPOSES.map((p) => [p, true])));
  while (session.state() === 'trial') {
    // Không cài trước kết luận H1/H2: cùng phân phối cho mọi điều kiện.
    session.submit({ guess: options[Math.floor(rng() * options.length)],
      likert: Object.fromEntries(ISO_ATTRIBUTE_KEYS.map((key) => [key, 1 + Math.floor(rng() * 5)])) });
  }
  const log = { ...session.toLog(), synthetic: true, simulation_seed: 260926,
    dataset_version: dataset.dataset_version, consent_simulated: true };
  const manifestPath = 'build/stimuli/manifest.json';
  if (existsSync(manifestPath)) {
    const manifest = read(manifestPath);
    if (manifest.dataset_version !== dataset.dataset_version) throw new Error('Kích thích khác phiên bản dữ liệu.');
    log.stimulus_hashes = Object.fromEntries(manifest.stimuli.map((s) => [s.id, s.sha256]));
  }
  writeFileSync(join(out, `nguoi-${String(participantIndex).padStart(3, '0')}.json`), JSON.stringify(log, null, 2) + '\n');
}
console.log(`GIẢ LẬP: ${count} người / ${count * locations.length} lượt → ${out}`);
