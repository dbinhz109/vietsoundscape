import { describe, expect, test } from 'vitest';
import { LOUDNESS_TARGET_LUFS, TRUE_PEAK_CEILING_DBTP, gainToTarget, parseLoudnormJson } from './loudness.js';

/** Đầu ra thật của `ffmpeg -af loudnorm=print_format=json` (ffmpeg 4.4.2). */
const REAL_OUTPUT = `  Stream #0:0: Audio: pcm_s16le, 192000 Hz, mono, s16, 3072 kb/s
video:0kB audio:7500kB subtitle:0kB other streams:0kB global headers:0kB
[Parsed_loudnorm_0 @ 0x61ac141b1a40]
{
\t"input_i" : "-22.88",
\t"input_tp" : "-6.94",
\t"input_lra" : "1.20",
\t"input_thresh" : "-32.88",
\t"output_i" : "-23.76",
\t"output_tp" : "-7.69",
\t"output_lra" : "0.50",
\t"output_thresh" : "-33.76",
\t"normalization_type" : "dynamic",
\t"target_offset" : "-0.24"
}`;

describe('parseLoudnormJson', () => {
  test('đọc được độ to và đỉnh thật từ đầu ra thật của ffmpeg', () => {
    const measured = parseLoudnormJson(REAL_OUTPUT);

    expect(measured.lufs).toBeCloseTo(-22.88, 6);
    expect(measured.truePeakDbtp).toBeCloseTo(-6.94, 6);
    expect(measured.lra).toBeCloseTo(1.2, 6);
  });

  test('trả về số, không phải chuỗi — ffmpeg in ra chuỗi có dấu ngoặc kép', () => {
    const measured = parseLoudnormJson(REAL_OUTPUT);

    expect(typeof measured.lufs).toBe('number');
    expect(typeof measured.truePeakDbtp).toBe('number');
  });

  test('ném lỗi rõ ràng khi không tìm thấy khối JSON', () => {
    expect(() => parseLoudnormJson('ffmpeg: khong co gi o day')).toThrow(/loudnorm/i);
  });

  test('ném lỗi khi bản ghi im lặng — độ to là âm vô cực', () => {
    const silent = REAL_OUTPUT.replace('"-22.88"', '"-inf"');
    expect(() => parseLoudnormJson(silent)).toThrow(/im lặng/i);
  });
});

describe('gainToTarget', () => {
  test('nâng đúng mức để đạt độ to mục tiêu', () => {
    const result = gainToTarget({ lufs: -30, truePeakDbtp: -20 });

    expect(result.gainDb).toBeCloseTo(-23 - -30, 6);
    expect(result.limitedByPeak).toBe(false);
  });

  test('không đổi gì khi mẫu đã đúng mục tiêu', () => {
    const result = gainToTarget({ lufs: LOUDNESS_TARGET_LUFS, truePeakDbtp: -10 });
    expect(result.gainDb).toBeCloseTo(0, 6);
  });

  test('hạ âm lượng khi mẫu to hơn mục tiêu', () => {
    expect(gainToTarget({ lufs: -16, truePeakDbtp: -3 }).gainDb).toBeLessThan(0);
  });

  test('chặn gain lại khi nâng lên sẽ vượt ngưỡng đỉnh thật', () => {
    // Mẫu nhỏ nhưng có đỉnh sát trần: nâng đủ để đạt −23 LUFS sẽ làm vỡ đỉnh.
    // Thà để mẫu hơi nhỏ hơn mục tiêu, còn hơn để tiếng bị méo.
    const result = gainToTarget({ lufs: -30, truePeakDbtp: -2 });

    expect(result.limitedByPeak).toBe(true);
    expect(result.gainDb).toBeCloseTo(TRUE_PEAK_CEILING_DBTP - -2, 6);
    expect(result.resultingTruePeakDbtp).toBeCloseTo(TRUE_PEAK_CEILING_DBTP, 6);
  });

  test('báo lại độ to đạt được sau khi bị chặn, để biết mẫu lệch bao nhiêu', () => {
    const result = gainToTarget({ lufs: -30, truePeakDbtp: -2 });

    expect(result.resultingLufs).toBeGreaterThan(-30);
    expect(result.resultingLufs).toBeLessThan(LOUDNESS_TARGET_LUFS);
  });

  test('nhận mục tiêu và trần tuỳ chọn', () => {
    const result = gainToTarget({ lufs: -30, truePeakDbtp: -20 }, { targetLufs: -16 });
    expect(result.gainDb).toBeCloseTo(14, 6);
  });
});
