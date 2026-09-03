/**
 * Chấm thiết bị thu — trả lời câu Q1 bằng đo, không bằng đọc thông số máy.
 *
 * Quy trình thu bản thử (60 giây, bằng đúng thiết bị + app sẽ dùng thực địa):
 *   1. 25 giây im lặng — phòng yên, không nói, không di chuyển máy
 *   2. 10 giây có âm đều — vỗ tay chậm, hoặc nói liên tục
 *   3. 25 giây im lặng
 *
 * Rồi: node scripts/check-recorder.mjs ban-thu-thu.m4a
 *
 * Nhận mọi định dạng ffmpeg đọc được, kể cả m4a của điện thoại.
 */

import { spawnSync } from 'node:child_process';
import { basename } from 'node:path';
import { checkRecorder } from '../src/data/recorder-check.js';

const sources = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (sources.length === 0) {
  console.error('Cách dùng: node scripts/check-recorder.mjs <bản-thu-thử...>');
  console.error('Thu 25s im lặng → 10s có âm → 25s im lặng, bằng đúng máy sẽ dùng thực địa.');
  process.exit(2);
}

/** Giải nén về một kênh float32 để phân tích. */
function decodeMono(source) {
  const result = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-nostdin', '-i', source, '-ac', '1', '-f', 'f32le', '-c:a', 'pcm_f32le', '-'],
    { maxBuffer: 512 * 1024 * 1024 },
  );
  if (result.status !== 0) {
    throw new Error(`Không đọc được "${source}":\n${String(result.stderr).slice(-800)}`);
  }
  const stdout = result.stdout;
  const aligned = new ArrayBuffer(stdout.length - (stdout.length % 4));
  new Uint8Array(aligned).set(stdout.subarray(0, aligned.byteLength));
  return new Float32Array(aligned);
}

function sampleRateOf(source) {
  const result = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=sample_rate', '-of', 'json', source],
    { encoding: 'utf-8' },
  );
  if (result.status !== 0) throw new Error(`ffprobe lỗi với "${source}".`);
  return Number(JSON.parse(result.stdout).streams[0].sample_rate);
}

let anyBad = false;

for (const source of sources) {
  const sampleRate = sampleRateOf(source);
  const samples = decodeMono(source);
  const result = checkRecorder(samples, sampleRate);

  const verdict =
    result.usable === null ? 'KHÔNG CHẤM ĐƯỢC' : result.usable ? 'DÙNG ĐƯỢC' : 'KHÔNG DÙNG ĐƯỢC';
  if (result.usable !== true) anyBad = true;

  console.log(`\n${'─'.repeat(72)}`);
  console.log(`${basename(source)}  ·  ${(samples.length / sampleRate).toFixed(1)}s @ ${sampleRate} Hz`);
  console.log(`${'─'.repeat(72)}`);
  console.log(`  Kết luận            ${verdict}`);
  if (result.usable !== null) {
    console.log(`  Nền ồn phòng        ${result.noiseFloorDb.toFixed(1)} dBFS`);
    console.log(`  Nền dâng trong lặng ${result.quietRiseDb.toFixed(1)} dB`);
    console.log(`  Khối bị cắt         ${(result.gatedFraction * 100).toFixed(0)}%`);
    console.log(`  AGC                 ${result.agcSuspected ? 'CÓ' : 'không thấy'}`);
    console.log(`  Khử ồn              ${result.noiseSuppressionSuspected ? 'CÓ' : 'không thấy'}`);
  }
  console.log('');
  for (const note of result.notes) console.log(`  • ${note}`);
}

console.log(`\n${'─'.repeat(72)}`);
if (anyBad) {
  console.log('Còn thiết bị chưa dùng được. Thứ tự thử tiếp:');
  console.log('  1. Tìm trong app: "Tự động điều chỉnh âm lượng", "Giảm tiếng ồn", "Lọc gió" — tắt hết');
  console.log('  2. Đổi sang app ghi âm cho phép thu thô (ghi ra WAV, không xử lý)');
  console.log('  3. Nếu vẫn không tắt được: điện thoại chỉ dùng cho dấu ấn âm thanh (âm to, ngắn),');
  console.log('     lớp âm nền lấy từ kho có giấy phép mở — đúng mô hình lai ở BA §5.4');
} else {
  console.log('Thiết bị dùng được. Chốt câu Q1 và ghi thông số vào BA §5.4.2.');
}
process.exit(0);
