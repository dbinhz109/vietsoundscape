import { describe, expect, test } from 'vitest';
import { blockLevelsDb, checkRecorder, segmentByLoudness } from './recorder-check.js';

const SAMPLE_RATE = 48000;

/**
 * Dựng bản thu thử theo đúng quy trình ở §Cách dùng của recorder-check.js:
 * im lặng → âm đều → im lặng.
 *
 * @param {object} options
 * @param {number} [options.quietDb] nền ồn phòng, dBFS
 * @param {number} [options.agcRiseDb] AGC nâng nền lên bao nhiêu trong đoạn lặng
 * @param {boolean} [options.gate] khử ồn cắt hẳn nền xuống im lặng
 */
function testRecording({ quietDb = -60, agcRiseDb = 0, gate = false } = {}) {
  const quietS = 12;
  const loudS = 6;
  const total = quietS * 2 + loudS;
  const length = total * SAMPLE_RATE;
  const out = new Float32Array(length);

  let seed = 12345;
  const noise = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) * 2 - 1;
  };

  const dbToAmp = (db) => 10 ** (db / 20);
  const loudStart = quietS * SAMPLE_RATE;
  const loudEnd = (quietS + loudS) * SAMPLE_RATE;

  for (let i = 0; i < length; i += 1) {
    const t = i / SAMPLE_RATE;

    if (i >= loudStart && i < loudEnd) {
      out[i] = 0.4 * Math.sin(2 * Math.PI * 440 * t) + 0.02 * noise();
      continue;
    }

    // Đoạn lặng: nền ồn phòng. AGC làm nền dâng dần; khử ồn thì cắt hẳn.
    const withinQuiet = i < loudStart ? i / loudStart : (i - loudEnd) / (length - loudEnd);
    if (gate) {
      out[i] = 1e-6 * noise();
      continue;
    }
    out[i] = dbToAmp(quietDb + agcRiseDb * withinQuiet) * noise();
  }
  return out;
}

describe('blockLevelsDb', () => {
  test('chia bản thu thành khối và trả mức dBFS cho từng khối', () => {
    const levels = blockLevelsDb(testRecording(), SAMPLE_RATE, { blockMs: 100 });
    expect(levels.length).toBeCloseTo(300, -1);
  });

  test('khối im lặng tuyệt đối cho âm vô cực, không phải NaN', () => {
    const levels = blockLevelsDb(new Float32Array(SAMPLE_RATE), SAMPLE_RATE, { blockMs: 100 });
    expect(levels.every((db) => db === -Infinity)).toBe(true);
  });

  test('đo đúng mức của tín hiệu đã biết', () => {
    // Sin biên độ 0,5 có RMS = 0,5/√2 ≈ 0,354 ⇒ khoảng −9,0 dBFS.
    const length = SAMPLE_RATE;
    const samples = new Float32Array(length);
    for (let i = 0; i < length; i += 1) samples[i] = 0.5 * Math.sin((2 * Math.PI * 1000 * i) / SAMPLE_RATE);

    const levels = blockLevelsDb(samples, SAMPLE_RATE, { blockMs: 100 });
    expect(levels[5]).toBeCloseTo(-9.03, 1);
  });
});

describe('segmentByLoudness', () => {
  test('tách được đoạn có âm ở giữa và hai đoạn lặng hai bên', () => {
    const levels = blockLevelsDb(testRecording(), SAMPLE_RATE, { blockMs: 100 });
    const segments = segmentByLoudness(levels);

    expect(segments.loud).not.toBeNull();
    expect(segments.quietBefore.length).toBeGreaterThan(50);
    expect(segments.quietAfter.length).toBeGreaterThan(50);
  });

  test('trả về loud rỗng khi bản thu không có đoạn âm nào nổi lên', () => {
    const flat = blockLevelsDb(testRecording({ quietDb: -60 }).slice(0, SAMPLE_RATE * 5), SAMPLE_RATE, {
      blockMs: 100,
    });
    expect(segmentByLoudness(flat).loud).toBeNull();
  });
});

describe('checkRecorder', () => {
  test('máy sạch: không phát hiện AGC, không phát hiện khử ồn', () => {
    const result = checkRecorder(testRecording(), SAMPLE_RATE);

    expect(result.agcSuspected).toBe(false);
    expect(result.noiseSuppressionSuspected).toBe(false);
    expect(result.usable).toBe(true);
  });

  test('phát hiện AGC khi nền ồn dâng dần trong đoạn lặng', () => {
    // Dấu vết của AGC: không có tín hiệu thì nó tự nâng gain lên, nền ồn phòng
    // dâng theo — nghe như bản thu bị bơm hơi.
    const result = checkRecorder(testRecording({ agcRiseDb: 12 }), SAMPLE_RATE);

    expect(result.agcSuspected).toBe(true);
    expect(result.usable).toBe(false);
    expect(result.notes.join(' ')).toMatch(/AGC/);
  });

  test('phát hiện khử ồn khi nền bị cắt xuống im lặng bất thường', () => {
    // Dấu vết của khử ồn: nền phòng biến mất hẳn thay vì chỉ nhỏ đi. Đúng thứ
    // đề tài cần giữ lại thì nó ăn mất.
    const result = checkRecorder(testRecording({ gate: true }), SAMPLE_RATE);

    expect(result.noiseSuppressionSuspected).toBe(true);
    expect(result.usable).toBe(false);
    expect(result.notes.join(' ')).toMatch(/khử ồn/i);
  });

  test('báo mức dâng đo được để biết nặng nhẹ', () => {
    const result = checkRecorder(testRecording({ agcRiseDb: 12 }), SAMPLE_RATE);
    expect(result.quietRiseDb).toBeGreaterThan(6);
  });

  test('báo nền ồn phòng đo được', () => {
    const result = checkRecorder(testRecording({ quietDb: -55 }), SAMPLE_RATE);
    expect(result.noiseFloorDb).toBeGreaterThan(-62);
    expect(result.noiseFloorDb).toBeLessThan(-48);
  });

  test('từ chối chấm khi bản thu không đúng quy trình', () => {
    // Không có đoạn âm nổi lên thì không tách được đoạn lặng để so sánh.
    const flat = new Float32Array(SAMPLE_RATE * 5).fill(0.001);
    const result = checkRecorder(flat, SAMPLE_RATE);

    expect(result.usable).toBeNull();
    expect(result.notes.join(' ')).toMatch(/quy trình|không tách được/i);
  });

  test('từ chối chấm khi bản thu quá ngắn', () => {
    const result = checkRecorder(new Float32Array(SAMPLE_RATE), SAMPLE_RATE);
    expect(result.usable).toBeNull();
    expect(result.notes.join(' ')).toMatch(/quá ngắn/i);
  });
});

describe('checkRecorder — khử ồn cắt hẳn về im lặng tuyệt đối', () => {
  /**
   * Trường hợp thật: tệp 16-bit lượng tử hoá nền đã bị khử ồn về **đúng 0**, nên
   * mọi khối lặng thành -Infinity. Nếu chỉ lấy trung vị của các khối hữu hạn thì
   * trung vị rơi vào đoạn có âm, ngưỡng bị đẩy lên trên cả đoạn to, và bộ tách
   * đoạn báo "không có âm nào nổi lên" — đảo ngược hoàn toàn kết luận.
   */
  function gatedToTrueSilence() {
    const quietS = 12;
    const loudS = 6;
    const length = (quietS * 2 + loudS) * SAMPLE_RATE;
    const out = new Float32Array(length); // im lặng tuyệt đối ở hai đoạn lặng
    const loudStart = quietS * SAMPLE_RATE;
    const loudEnd = (quietS + loudS) * SAMPLE_RATE;
    for (let i = loudStart; i < loudEnd; i += 1) {
      out[i] = 0.35 * Math.sin((2 * Math.PI * 440 * i) / SAMPLE_RATE);
    }
    return out;
  }

  test('vẫn tách được đoạn có âm khi đoạn lặng là im lặng tuyệt đối', () => {
    const segments = segmentByLoudness(blockLevelsDb(gatedToTrueSilence(), SAMPLE_RATE));
    expect(segments.loud).not.toBeNull();
    expect(segments.quietBefore.length).toBeGreaterThan(MIN_QUIET_BLOCKS_FOR_TEST);
  });

  test('kết luận là phát hiện khử ồn, không phải không chấm được', () => {
    const result = checkRecorder(gatedToTrueSilence(), SAMPLE_RATE);
    expect(result.usable).toBe(false);
    expect(result.noiseSuppressionSuspected).toBe(true);
    expect(result.notes.join(' ')).toMatch(/khử ồn/i);
  });

  test('không in ra "-Infinity" trong báo cáo nền ồn', () => {
    const result = checkRecorder(gatedToTrueSilence(), SAMPLE_RATE);
    expect(result.notes.join(' ')).not.toMatch(/-Infinity/);
  });
});

const MIN_QUIET_BLOCKS_FOR_TEST = 20;
