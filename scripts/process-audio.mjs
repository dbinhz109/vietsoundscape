/**
 * Đường ống xử lý âm (việc A1.3 của lộ trình).
 *
 *   nguồn WAV → đo LUFS → gain tuyến tính → tìm điểm loop → mã hoá → metadata
 *
 * Hai quyết định thiết kế đáng nói:
 *
 * 1. **Dùng lại `src/audio/loop.js`, không viết lại bằng ngôn ngữ khác.** Điểm
 *    loop ghi vào metadata phải do đúng đoạn code mà trình duyệt sẽ tôn trọng
 *    tính ra. Hai bản cài đặt song song chắc chắn sẽ lệch nhau.
 * 2. **`loudnorm` chỉ để đo, gain áp riêng bằng bộ lọc `volume`.** Chạy
 *    `loudnorm` để chuẩn hoá sẽ nén động và làm biến dạng quan hệ độ to giữa âm
 *    nền và tín hiệu âm — xem `src/data/loudness.js`.
 *
 * Cách dùng:
 *   node scripts/process-audio.mjs <tệp...>                  # chạy thử, không ghi gì
 *   node scripts/process-audio.mjs <tệp...> --out=build/audio # mã hoá ra thư mục
 *   node scripts/process-audio.mjs a.wav --clip-id=HN-05 --write  # cập nhật clips.json
 */

import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { findLoopPoints, measureLoopQuality } from '../src/audio/loop.js';
import { LOUDNESS_TARGET_LUFS, gainToTarget, parseLoudnormJson } from '../src/data/loudness.js';

const ROOT = join(import.meta.dirname, '..');

/** Bậc chất lượng khi xuất bản (NFR-13). */
const ENCODINGS = [
  { name: 'research', ext: 'wav', args: ['-c:a', 'pcm_s24le', '-ar', '48000'] },
  { name: 'standard', ext: 'webm', args: ['-c:a', 'libopus', '-b:a', '72k'] },
  { name: 'high', ext: 'webm', args: ['-c:a', 'libopus', '-b:a', '144k'] },
  { name: 'fallback', ext: 'm4a', args: ['-c:a', 'aac', '-b:a', '128k'] },
];

/**
 * Gọi ffmpeg và lấy được **cả** stdout và stderr.
 *
 * Dùng spawnSync chứ không execFileSync: ffmpeg in số đo của `loudnorm` ra
 * stderr, mà execFileSync chỉ trả về stdout.
 */
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args], {
    maxBuffer: 512 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `ffmpeg lỗi (mã ${result.status}):\n${String(result.stderr ?? '').slice(-2000)}`,
    );
  }
  return { stdout: result.stdout ?? Buffer.alloc(0), stderr: String(result.stderr ?? '') };
}

/** Đo độ to bằng loudnorm — chỉ đo, không chuẩn hoá. */
function measureLoudness(source) {
  const { stderr } = ffmpeg([
    '-i', source,
    '-af', 'loudnorm=print_format=json',
    '-f', 'null', '-',
  ]);
  return parseLoudnormJson(stderr);
}

function probe(source) {
  const raw = execFileSync(
    'ffprobe',
    [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=sample_rate,channels,duration,bits_per_raw_sample',
      '-of', 'json',
      source,
    ],
    { encoding: 'utf-8' },
  );
  const stream = JSON.parse(raw).streams[0];
  return {
    sampleRate: Number(stream.sample_rate),
    channels: Number(stream.channels),
    durationS: Number(stream.duration),
    bitDepth: Number(stream.bits_per_raw_sample) || undefined,
  };
}

/** Giải nén về một kênh float32 đã áp gain, để tìm điểm loop trên đúng tín hiệu sẽ xuất bản. */
function decodeMono(source, gainDb) {
  const { stdout } = ffmpeg([
    '-i', source,
    '-af', `volume=${gainDb.toFixed(4)}dB`,
    '-ac', '1',
    '-f', 'f32le',
    '-c:a', 'pcm_f32le',
    '-',
  ]);
  const aligned = new ArrayBuffer(stdout.length - (stdout.length % 4));
  new Uint8Array(aligned).set(stdout.subarray(0, aligned.byteLength));
  return new Float32Array(aligned);
}

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function processFile(source, { outDir }) {
  const id = basename(source, extname(source));
  const info = probe(source);
  const measured = measureLoudness(source);
  const decision = gainToTarget(measured);

  const samples = decodeMono(source, decision.gainDb);
  const points = findLoopPoints(samples, info.sampleRate);
  const quality = points ? measureLoopQuality(samples, info.sampleRate, points) : null;

  const files = [];
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    for (const encoding of ENCODINGS) {
      const temporary = join(outDir, `${id}.${encoding.name}.tmp.${encoding.ext}`);
      ffmpeg([
        '-y',
        '-i', source,
        '-af', `volume=${decision.gainDb.toFixed(4)}dB`,
        ...encoding.args,
        temporary,
      ]);
      // Tên tệp mang mã băm nội dung ⇒ đặt được Cache-Control: immutable (NFR-12).
      const bytes = readFileSync(temporary);
      const digest = sha256(bytes).slice(0, 8);
      const final = join(outDir, `${id}.${encoding.name}.${digest}.${encoding.ext}`);
      writeFileSync(final, bytes);
      execFileSync('rm', ['-f', temporary]);
      files.push({ quality: encoding.name, path: final, bytes: bytes.length });
    }
  }

  return {
    id,
    source,
    sample_rate: info.sampleRate,
    channels: info.channels,
    duration_s: Number(info.durationS.toFixed(3)),
    bit_depth: info.bitDepth,
    measured_lufs: measured.lufs,
    measured_true_peak_dbtp: measured.truePeakDbtp,
    gain_applied_db: Number(decision.gainDb.toFixed(2)),
    limited_by_peak: decision.limitedByPeak,
    loudness_lufs: Number(decision.resultingLufs.toFixed(2)),
    true_peak_dbtp: Number(decision.resultingTruePeakDbtp.toFixed(2)),
    loop_start_s: points ? Number(points.startS.toFixed(6)) : null,
    loop_end_s: points ? Number(points.endS.toFixed(6)) : null,
    seam_jump: quality ? quality.seamJump : null,
    tail_silence_ms: quality ? Number(quality.tailSilenceMs.toFixed(1)) : null,
    seamless: quality ? quality.seamless : null,
    sha256: sha256(readFileSync(source)),
    editing_log: ['measure_lufs', `gain_${decision.gainDb.toFixed(2)}db`, 'detect_loop_points'],
    files,
  };
}

function mergeIntoClips(clipId, report) {
  const path = join(ROOT, 'data', 'clips.json');
  const dataset = JSON.parse(readFileSync(path, 'utf-8'));
  const clip = dataset.clips.find((c) => c.id === clipId);
  if (!clip) throw new Error(`Không có mẫu nào mang mã "${clipId}" trong data/clips.json.`);

  Object.assign(clip, {
    status: 'processed',
    sample_rate: report.sample_rate,
    channels: report.channels,
    duration_s: report.duration_s,
    loudness_lufs: report.loudness_lufs,
    true_peak_dbtp: report.true_peak_dbtp,
    loop_start_s: report.loop_start_s,
    loop_end_s: report.loop_end_s,
    sha256: report.sha256,
    editing_log: report.editing_log,
  });
  writeFileSync(path, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(`\nĐã cập nhật ${clipId} trong data/clips.json (status → processed)`);
  console.log('Chạy `npm run validate` để kiểm lại bộ dữ liệu.');
}

const args = process.argv.slice(2);
const sources = args.filter((a) => !a.startsWith('--'));
const outDir = args.find((a) => a.startsWith('--out='))?.slice(6);
const clipId = args.find((a) => a.startsWith('--clip-id='))?.slice(10);
const shouldWrite = args.includes('--write');

if (sources.length === 0) {
  console.error('Cách dùng: node scripts/process-audio.mjs <tệp...> [--out=thư/mục] [--clip-id=X --write]');
  process.exit(2);
}

console.log(`Mục tiêu độ to ${LOUDNESS_TARGET_LUFS} LUFS · gain tuyến tính, không nén động\n`);
console.log(
  ['tệp', 'LUFS đo', 'gain', 'LUFS ra', 'đỉnh ra', 'loop (s)', 'nhảy', 'lặng cuối', 'liền mạch']
    .map((h, i) => h.padEnd([26, 9, 8, 9, 9, 20, 10, 11, 9][i]))
    .join(''),
);

const reports = [];
for (const source of sources) {
  const report = processFile(source, { outDir });
  reports.push(report);
  console.log(
    [
      basename(source).padEnd(26),
      `${report.measured_lufs.toFixed(2)}`.padEnd(9),
      `${report.gain_applied_db > 0 ? '+' : ''}${report.gain_applied_db.toFixed(2)}${report.limited_by_peak ? '*' : ''}`.padEnd(8),
      `${report.loudness_lufs.toFixed(2)}`.padEnd(9),
      `${report.true_peak_dbtp.toFixed(2)}`.padEnd(9),
      (report.loop_start_s === null
        ? '—'
        : `${report.loop_start_s.toFixed(4)}→${report.loop_end_s.toFixed(4)}`
      ).padEnd(20),
      (report.seam_jump === null ? '—' : report.seam_jump.toExponential(1)).padEnd(10),
      (report.tail_silence_ms === null ? '—' : `${report.tail_silence_ms}ms`).padEnd(11),
      report.seamless === null ? '—' : report.seamless ? 'ĐẠT' : 'KHÔNG',
    ].join(''),
  );
}

if (reports.some((r) => r.limited_by_peak)) {
  console.log('\n* = gain bị chặn vì sắp vỡ đỉnh thật. Mẫu nhỏ hơn mục tiêu, bù bằng gain lớp trong bộ trộn.');
}
const notSeamless = reports.filter((r) => r.seamless === false);
if (notSeamless.length > 0) {
  console.log(`\n⚠️  ${notSeamless.length} mẫu chưa liền mạch: ${notSeamless.map((r) => r.id).join(', ')}`);
  console.log('   Kiểm lại vật liệu nguồn — có thể còn im lặng ở cuối hoặc quá ngắn để lặp.');
}
if (outDir) {
  const total = reports.flatMap((r) => r.files).reduce((sum, f) => sum + f.bytes, 0);
  console.log(`\nĐã mã hoá ${reports.flatMap((r) => r.files).length} tệp, tổng ${(total / 1e6).toFixed(2)} MB → ${outDir}`);
}

if (clipId) {
  if (reports.length !== 1) throw new Error('--clip-id chỉ dùng khi xử lý đúng một tệp.');
  if (shouldWrite) mergeIntoClips(clipId, reports[0]);
  else console.log(`\n(chạy thử) thêm --write để cập nhật ${clipId} trong data/clips.json`);
}

const reportPath = args.find((a) => a.startsWith('--report='))?.slice(9);
if (reportPath) writeFileSync(reportPath, `${JSON.stringify(reports, null, 2)}\n`);
