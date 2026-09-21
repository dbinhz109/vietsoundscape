import { describe, expect, test } from 'vitest';
import {
  KEYNOTE_MIN_DURATION_S,
  parseSilenceDetect,
  prescreenCandidate,
  rankCandidates,
} from './prescreen.js';

const good = {
  role: 'keynote',
  durationS: 180,
  lufs: -28,
  lra: 8,
  truePeakDbtp: -4,
  silenceFraction: 0.02,
  sampleRate: 48000,
  channels: 2,
};

describe('prescreenCandidate — luật khách quan, không thay tai người', () => {
  test('bản nền dài, sạch, không cắt đỉnh thì QUA, không lý do', () => {
    const result = prescreenCandidate(good);
    expect(result.verdict).toBe('qua');
    expect(result.reasons).toEqual([]);
  });

  test('bản nền dưới 60 s thì LOẠI — loop ngắn nghe ra ngay là lặp (BA §5.4.1 quy tắc 5)', () => {
    const result = prescreenCandidate({ ...good, durationS: 45 });
    expect(result.verdict).toBe('loai');
    expect(result.reasons.join(' ')).toMatch(/60 s/);
    expect(KEYNOTE_MIN_DURATION_S).toBe(60);
  });

  test('bản nền 60–120 s thì CẢNH BÁO chứ không loại', () => {
    expect(prescreenCandidate({ ...good, durationS: 90 }).verdict).toBe('canh-bao');
  });

  test('tín hiệu âm ngắn 4 s vẫn QUA — vai signal không cần dài', () => {
    expect(prescreenCandidate({ ...good, role: 'signal', durationS: 4 }).verdict).toBe('qua');
  });

  test('tín hiệu dưới 1 s thì LOẠI, trên 10 phút thì CẢNH BÁO phải cắt', () => {
    expect(prescreenCandidate({ ...good, role: 'signal', durationS: 0.6 }).verdict).toBe('loai');
    const long = prescreenCandidate({ ...good, role: 'soundmark', durationS: 700 });
    expect(long.verdict).toBe('canh-bao');
    expect(long.reasons.join(' ')).toMatch(/cắt/);
  });

  test('đỉnh thật sát 0 dBTP là dấu hiệu cắt đỉnh → CẢNH BÁO', () => {
    const result = prescreenCandidate({ ...good, truePeakDbtp: -0.1 });
    expect(result.verdict).toBe('canh-bao');
    expect(result.reasons.join(' ')).toMatch(/đỉnh/);
  });

  test('im lặng chiếm quá nửa bản nền thì LOẠI, trên 30% thì CẢNH BÁO', () => {
    expect(prescreenCandidate({ ...good, silenceFraction: 0.55 }).verdict).toBe('loai');
    expect(prescreenCandidate({ ...good, silenceFraction: 0.35 }).verdict).toBe('canh-bao');
  });

  test('dải độ to (LRA) quá rộng ở bản nền → CẢNH BÁO có thể lẫn giọng hay nhạc', () => {
    const result = prescreenCandidate({ ...good, lra: 24 });
    expect(result.verdict).toBe('canh-bao');
    expect(result.reasons.join(' ')).toMatch(/LRA/);
  });

  test('bản quá nhỏ (cần khuếch đại > 17 dB) → CẢNH BÁO lộ nhiễu', () => {
    const result = prescreenCandidate({ ...good, lufs: -42 });
    expect(result.verdict).toBe('canh-bao');
    expect(result.reasons.join(' ')).toMatch(/khuếch đại/);
  });

  test('tần số lấy mẫu dưới 44,1 kHz → CẢNH BÁO', () => {
    expect(prescreenCandidate({ ...good, sampleRate: 22050 }).verdict).toBe('canh-bao');
  });

  test('thiếu số đo thì không đoán: verdict "chua-do"', () => {
    expect(prescreenCandidate({ role: 'keynote', durationS: 100 }).verdict).toBe('chua-do');
  });

  test('điểm số giảm theo số lý do, loại thì 0', () => {
    expect(prescreenCandidate(good).score).toBe(100);
    expect(prescreenCandidate({ ...good, truePeakDbtp: -0.1 }).score).toBeLessThan(100);
    expect(prescreenCandidate({ ...good, durationS: 10 }).score).toBe(0);
  });
});

describe('rankCandidates', () => {
  const items = [
    { fsid: 1, star: false, ...good, durationS: 90 },
    { fsid: 2, star: true, ...good },
    { fsid: 3, star: false, ...good, durationS: 20 },
    { fsid: 4, star: false, ...good },
  ];

  test('xếp QUA trước CẢNH BÁO trước LOẠI; cùng hạng thì ⭐ (khớp mô tả) lên trước', () => {
    const ranked = rankCandidates(items);
    expect(ranked.map((r) => r.fsid)).toEqual([2, 4, 1, 3]);
    expect(ranked[0].verdict).toBe('qua');
    expect(ranked[3].verdict).toBe('loai');
  });

  test('không đổi mảng đầu vào', () => {
    const copy = structuredClone(items);
    rankCandidates(items);
    expect(items).toEqual(copy);
  });
});

describe('parseSilenceDetect', () => {
  const stderr = `
[silencedetect @ 0x1] silence_start: 3.5
[silencedetect @ 0x1] silence_end: 5.5 | silence_duration: 2
[silencedetect @ 0x1] silence_start: 40
[silencedetect @ 0x1] silence_end: 41.25 | silence_duration: 1.25
`;
  test('cộng các đoạn im lặng và chia cho thời lượng', () => {
    expect(parseSilenceDetect(stderr, 65)).toBeCloseTo(3.25 / 65, 6);
  });
  test('không có đoạn nào thì 0; thời lượng 0 thì 0, không NaN', () => {
    expect(parseSilenceDetect('nothing', 65)).toBe(0);
    expect(parseSilenceDetect(stderr, 0)).toBe(0);
  });
  test('đoạn im lặng chưa đóng ở cuối tệp tính tới hết thời lượng', () => {
    expect(parseSilenceDetect('[x] silence_start: 60\n', 65)).toBeCloseTo(5 / 65, 6);
  });
});
