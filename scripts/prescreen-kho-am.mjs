/**
 * Chấm máy 33 bản nghe thử đã tải về `build/kho-am/` — vòng lọc trước tai người.
 *
 *   node scripts/prescreen-kho-am.mjs            # đo hết, ghi build/kho-am/prescreen.json
 *   node scripts/prescreen-kho-am.mjs --report   # chỉ in lại từ prescreen.json, không đo
 *
 * Mỗi tệp một lượt ffmpeg: `loudnorm` (đo LUFS, LRA, đỉnh thật) nối `silencedetect`
 * (tỉ lệ im lặng). Luật chấm ở `src/data/prescreen.js`. Đầu ra:
 *   - build/kho-am/prescreen.json — số đo + verdict từng tệp
 *   - build/kho-am/DUYET.md      — thêm mục "Máy chấm trước", thứ tự nên nghe
 * Không đụng `data/clips.json`: chọn bản nào là việc của tai người.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLoudnormJson } from '../src/data/loudness.js';
import { parseSilenceDetect, rankCandidates } from '../src/data/prescreen.js';

const ROOT = join(import.meta.dirname, '..');
const KHO = join(ROOT, 'build', 'kho-am');
const manifestPath = join(KHO, 'manifest.json');
const outPath = join(KHO, 'prescreen.json');
const duyetPath = join(KHO, 'DUYET.md');

if (!existsSync(manifestPath)) {
  console.error('Không thấy build/kho-am/manifest.json — chạy tải bản nghe thử trước (ung-vien-kho-am.md §7).');
  process.exit(2);
}
const { clips } = JSON.parse(readFileSync(join(ROOT, 'data', 'clips.json'), 'utf-8'));
const roleOf = new Map(clips.map((c) => [c.id, c.schafer_role]));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
const reportOnly = process.argv.includes('--report');

function measure(file) {
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-nostdin', '-i', file, '-af', 'loudnorm=print_format=json,silencedetect=n=-45dB:d=1', '-f', 'null', '-'],
    { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.status !== 0) throw new Error(`ffmpeg lỗi với ${file}:\n${result.stderr.slice(-600)}`);
  const stderr = result.stderr;
  const { lufs, truePeakDbtp, lra } = parseLoudnormJson(stderr);
  return { lufs, truePeakDbtp, lra, stderr };
}

let measured;
if (reportOnly && existsSync(outPath)) {
  measured = JSON.parse(readFileSync(outPath, 'utf-8')).items;
} else {
  measured = [];
  for (const item of manifest.items.filter((i) => i.ok)) {
    const file = join(ROOT, item.file);
    process.stdout.write(`đo ${item.clip} #${item.fsid} … `);
    try {
      const { lufs, truePeakDbtp, lra, stderr } = measure(file);
      const durationS = item.probe?.durationS ?? 0;
      measured.push({
        clip: item.clip,
        fsid: item.fsid,
        uploader: item.uploader,
        star: Boolean(item.star),
        weak: Boolean(item.weak),
        label: item.label,
        page_url: item.page_url,
        license: item.page_license,
        file: item.file,
        role: roleOf.get(item.clip) ?? 'keynote',
        durationS,
        lufs,
        lra,
        truePeakDbtp,
        silenceFraction: parseSilenceDetect(stderr, durationS),
        sampleRate: item.probe?.sampleRate,
        channels: item.probe?.channels,
      });
      console.log(`${lufs.toFixed(1)} LUFS · LRA ${lra.toFixed(1)} · đỉnh ${truePeakDbtp.toFixed(1)} dBTP`);
    } catch (error) {
      console.log(`LỖI — ${error.message.split('\n')[0]}`);
      measured.push({ clip: item.clip, fsid: item.fsid, file: item.file, role: roleOf.get(item.clip), error: error.message });
    }
  }
}

const byClip = new Map();
for (const item of measured) {
  if (!byClip.has(item.clip)) byClip.set(item.clip, []);
  byClip.get(item.clip).push(item);
}

const ranked = [];
for (const [clip, items] of byClip) {
  for (const [index, entry] of rankCandidates(items).entries()) ranked.push({ ...entry, clip, rank: index + 1 });
}

const measuredAt = new Date().toISOString().slice(0, 10);
writeFileSync(outPath, JSON.stringify({ measured_at: measuredAt, rule_source: 'src/data/prescreen.js', items: ranked }, null, 2));

const VERDICT_LABEL = { qua: 'QUA', 'canh-bao': 'CẢNH BÁO', loai: 'LOẠI', 'chua-do': 'CHƯA ĐO' };
const fmt = (v) => (typeof v === 'number' ? String(Math.round(v * 10) / 10).replace('.', ',') : '?');

let md = `\n\n## Máy chấm trước — ${measuredAt}\n\n`;
md += 'Luật ở `src/data/prescreen.js` (thời lượng theo vai, đỉnh thật, tỉ lệ im lặng, LRA, mức khuếch đại cần). ';
md += '**Máy không nghe nội dung** — LOẠI là loại theo số đo; QUA vẫn phải nghe. Thứ tự dưới là thứ tự nên nghe.\n\n';
md += '| Mẫu | # | Tệp | Máy chấm | Dài | LUFS | LRA | Đỉnh | Im lặng | Lý do |\n|---|---|---|---|---|---|---|---|---|---|\n';
for (const r of ranked) {
  const tag = r.star ? '⭐' : r.weak ? '🟡' : '';
  const name = r.file ? r.file.split('/').at(-1) : '?';
  md += `| ${r.clip} ${tag} | ${r.rank} | \`${name}\` | **${VERDICT_LABEL[r.verdict] ?? '?'}** | ${fmt(r.durationS)} s | ${fmt(r.lufs)} | ${fmt(r.lra)} | ${fmt(r.truePeakDbtp)} | ${r.silenceFraction === undefined ? '?' : Math.round(r.silenceFraction * 100) + '%'} | ${(r.reasons ?? [r.error?.split('\n')[0]]).join('; ')} |\n`;
}
const counts = ranked.reduce((acc, r) => ({ ...acc, [r.verdict]: (acc[r.verdict] ?? 0) + 1 }), {});
md += `\n**Tổng:** ${ranked.length} tệp — ${Object.entries(counts).map(([k, v]) => `${VERDICT_LABEL[k]} ${v}`).join(' · ')}.\n`;
const firstListen = ranked.filter((r) => r.rank === 1 && r.verdict !== 'loai');
md += `\n**Nghe trước (bản xếp #1 của mỗi mẫu, chưa bị loại):** ${firstListen.map((r) => `${r.clip} #${r.fsid}`).join(' · ')}.\n`;

const existing = readFileSync(duyetPath, 'utf-8');
const marker = '\n\n## Máy chấm trước — ';
const base = existing.includes(marker) ? existing.slice(0, existing.indexOf(marker)) : existing.trimEnd();
writeFileSync(duyetPath, base + md);

console.log(`\nGhi ${outPath}\nThêm mục "Máy chấm trước" vào ${duyetPath}`);
console.log(`Tổng: ${Object.entries(counts).map(([k, v]) => `${VERDICT_LABEL[k]} ${v}`).join(' · ')}`);
