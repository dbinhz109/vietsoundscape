/**
 * Máy chọn tạm nguồn kho cho các mẫu `licensed_archive` (Q-30) — tai người xác nhận sau.
 *
 *   node scripts/chon-tam-kho-am.mjs [--bo CR-01,CR-03,…]   # --bo: mẫu KHÔNG chọn (đang chờ Q-28)
 *
 * Đọc build/kho-am/prescreen.json (số đo + verdict + ⭐/🟡), chọn theo pickProvisional()
 * ở src/data/prescreen.js, tránh một tệp dùng cho hai mẫu, rồi điền vào data/clips.json:
 *   source_url · source_uploader · license (mã) · survey.status = "chon_tam" · survey.chosen{…}
 * KHÔNG điền downloaded_at (bản gốc chưa tải, chỉ có bản nghe thử) và KHÔNG đổi status
 * của mẫu — mẫu vẫn `planned`. Người nghe xong: đổi survey.status → "da_chon" (hoặc chọn
 * bản khác), tải bản gốc, điền downloaded_at.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pickProvisional } from '../src/data/prescreen.js';

const ROOT = join(import.meta.dirname, '..');
const LICENSE_CODE = { 'CC0 1.0': 'CC0-1.0', 'CC BY 4.0': 'CC-BY-4.0', 'CC BY 3.0': 'CC-BY-3.0' };

const args = process.argv.slice(2);
const skipIndex = args.indexOf('--bo');
const skip = new Set(skipIndex === -1 ? [] : args[skipIndex + 1].split(',').map((s) => s.trim()));

const prescreen = JSON.parse(readFileSync(join(ROOT, 'build', 'kho-am', 'prescreen.json'), 'utf-8'));
const clipsPath = join(ROOT, 'data', 'clips.json');
const clipsFile = JSON.parse(readFileSync(clipsPath, 'utf-8'));

const byClip = new Map();
for (const item of prescreen.items) {
  if (!byClip.has(item.clip)) byClip.set(item.clip, []);
  byClip.get(item.clip).push(item);
}

const used = new Set();
const today = new Date().toISOString().slice(0, 10);
const chosen = [];
const skipped = [];
const none = [];

for (const clip of clipsFile.clips) {
  if (clip.provenance !== 'licensed_archive') continue;
  const candidates = byClip.get(clip.id) ?? [];
  clip.survey = clip.survey ?? {};

  if (skip.has(clip.id)) {
    clip.survey.status = 'de_nghi_tu_thu';
    clip.survey.note = 'Không chọn tạm: ứng viên kho lệch địa lý/loại (sổ quyết định Q-28 đề nghị chuyển sang tự thu).';
    skipped.push(clip.id);
    continue;
  }
  if (candidates.length === 0) { none.push(clip.id); continue; }

  const pick = pickProvisional(candidates, { exclude: used });
  if (!pick) {
    clip.survey.status = 'de_nghi_tu_thu';
    clip.survey.note = 'Không chọn tạm: mọi ứng viên đều lệch hoặc bị loại theo số đo.';
    skipped.push(clip.id);
    continue;
  }
  used.add(pick.fsid);
  const code = LICENSE_CODE[pick.license];
  if (!code) throw new Error(`${clip.id}: giấy phép "${pick.license}" không ánh xạ được sang mã — dừng, không đoán.`);

  clip.source_url = pick.page_url;
  clip.source_uploader = pick.uploader;
  clip.license = code;
  clip.survey.status = 'chon_tam';
  clip.survey.chosen = {
    by: 'may',
    at: today,
    freesound_id: pick.fsid,
    matches_description: Boolean(pick.star),
    machine_verdict: pick.verdict,
    machine_reasons: pick.reasons,
    preview_file: pick.file,
    note: 'Chọn tạm theo mô tả + số đo, CHƯA AI NGHE. Bản nghe thử MP3; bản gốc chưa tải (downloaded_at trống). Nghe xong: đổi status → da_chon hoặc chọn bản khác.',
  };
  chosen.push(`${clip.id} → #${pick.fsid} ${pick.star ? '⭐' : ''} ${pick.verdict}${pick.reasons.length ? ` (${pick.reasons.join('; ')})` : ''} · ${code} · ${pick.uploader}`);
}

writeFileSync(clipsPath, JSON.stringify(clipsFile, null, 2) + '\n');
console.log(`CHỌN TẠM (máy, ${today}) — ${chosen.length} mẫu:\n  ${chosen.join('\n  ')}`);
console.log(`\nKHÔNG chọn (${skipped.length}, chờ Q-28 / tự thu): ${skipped.join(', ')}`);
console.log(`Không có ứng viên (${none.length}): ${none.join(', ')}`);
console.log('\nBước tiếp: nghe từng bản đã chọn (build/kho-am/DUYET.md), đổi survey.status → da_chon, tải bản gốc, điền downloaded_at; npm run validate.');
