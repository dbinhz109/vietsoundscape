import { describe, expect, test } from 'vitest';
import { countStimulusEvents, checkStimulusBalance, checkRecipeCoverage } from './stimulus.js';

const clips = {
  'HU-01': { id: 'HU-01', schafer_role: 'keynote' },
  'HU-02': { id: 'HU-02', schafer_role: 'keynote' },
  'HU-04': { id: 'HU-04', schafer_role: 'soundmark' },
  'HU-05': { id: 'HU-05', schafer_role: 'signal' },
};

const recipe = (overrides = {}) => ({
  id: 'hue-trua-he',
  location_id: 'hue-thien-mu',
  seed: 20260807,
  layers: [
    { clip_id: 'HU-01' },
    { clip_id: 'HU-02' },
    { clip_id: 'HU-04' },
    { clip_id: 'HU-05', trigger: { mode: 'poisson', mean_interval_s: 27, jitter_s: 7 } },
  ],
  ...overrides,
});

describe('countStimulusEvents — đếm sự kiện âm nghe thấy được', () => {
  test('âm nền và dấu ấn tính một sự kiện mỗi lớp', () => {
    const only = recipe({ layers: [{ clip_id: 'HU-01' }, { clip_id: 'HU-04' }] });
    expect(countStimulusEvents(only, clips, 60)).toBe(2);
  });

  test('lớp tín hiệu đếm theo lịch phát thật, không theo ước lượng', () => {
    // Dùng chính bộ lập lịch có seed của bộ trộn (FR-15b). Ước lượng
    // durationS / mean_interval_s sẽ lệch, mà FR-56 cần con số khớp thật.
    const signalOnly = recipe({
      layers: [{ clip_id: 'HU-05', trigger: { mean_interval_s: 27, jitter_s: 7 } }],
    });
    const count = countStimulusEvents(signalOnly, clips, 120);
    expect(count).toBeGreaterThan(2);
    expect(count).toBeLessThan(6);
  });

  test('cùng seed thì luôn đếm ra cùng một số', () => {
    expect(countStimulusEvents(recipe(), clips, 120)).toBe(countStimulusEvents(recipe(), clips, 120));
  });

  test('đổi seed thì lịch phát khác đi', () => {
    const a = countStimulusEvents(recipe({ seed: 1 }), clips, 600);
    const b = countStimulusEvents(recipe({ seed: 99999 }), clips, 600);
    expect(a).not.toBe(b);
  });

  test('bỏ qua lớp trỏ tới mẫu không có trong bộ dữ liệu thay vì đếm sai', () => {
    const broken = recipe({ layers: [{ clip_id: 'HU-01' }, { clip_id: 'KHONG-CO' }] });
    expect(countStimulusEvents(broken, clips, 60)).toBe(1);
  });
});

describe('checkStimulusBalance — khử yếu tố gây nhiễu (FR-56, FR-57, FR-58)', () => {
  const stimulus = (condition, overrides = {}) => ({
    id: `stim-${condition}`,
    condition,
    duration_s: 60,
    loudness_lufs: -23,
    event_count: 8,
    ...overrides,
  });

  const trio = (overrides = {}) => [
    stimulus('layered'),
    stimulus('isolated', overrides.isolated),
    stimulus('scrambled', overrides.scrambled),
  ];

  test('ba điều kiện khớp nhau thì đạt', () => {
    expect(checkStimulusBalance(trio())).toMatchObject({ balanced: true, issues: [] });
  });

  test('thiếu điều kiện đối chứng phân lớp sai vùng miền thì báo lỗi', () => {
    // FR-58: không có `scrambled` thì thắng lợi của `layered` chỉ chứng minh
    // "nhiều thông tin hơn thì đoán đúng hơn", không phải điều H1 phát biểu.
    const result = checkStimulusBalance([stimulus('layered'), stimulus('isolated')]);
    expect(result.balanced).toBe(false);
    expect(result.issues.join(' ')).toMatch(/scrambled/);
  });

  test('lệch thời lượng quá ngưỡng thì báo lỗi', () => {
    const result = checkStimulusBalance(trio({ isolated: { duration_s: 90 } }));
    expect(result.balanced).toBe(false);
    expect(result.issues.join(' ')).toMatch(/thời lượng/i);
  });

  test('lệch số sự kiện âm quá ngưỡng thì báo lỗi', () => {
    // Đây chính là yếu tố gây nhiễu mà BA §10.4 cảnh báo.
    const result = checkStimulusBalance(trio({ isolated: { event_count: 3 } }));
    expect(result.balanced).toBe(false);
    expect(result.issues.join(' ')).toMatch(/sự kiện/i);
  });

  test('lệch độ to quá ngưỡng thì báo lỗi', () => {
    const result = checkStimulusBalance(trio({ scrambled: { loudness_lufs: -18 } }));
    expect(result.balanced).toBe(false);
    expect(result.issues.join(' ')).toMatch(/độ to|LUFS/i);
  });

  test('lệch trong ngưỡng cho phép thì vẫn đạt', () => {
    const result = checkStimulusBalance(trio({ isolated: { duration_s: 61, loudness_lufs: -23.4 } }));
    expect(result.balanced).toBe(true);
  });

  test('ngưỡng chỉnh được', () => {
    const strict = checkStimulusBalance(trio({ isolated: { duration_s: 61 } }), {
      durationToleranceS: 0.5,
    });
    expect(strict.balanced).toBe(false);
  });

  test('bộ rỗng thì báo lỗi chứ không lặng lẽ báo đạt', () => {
    expect(checkStimulusBalance([]).balanced).toBe(false);
  });
});

describe('checkRecipeCoverage — đủ bản trộn mỗi vùng (FR-59)', () => {
  const recipesFor = (spec) =>
    Object.entries(spec).flatMap(([location, n]) =>
      Array.from({ length: n }, (_, i) => ({ id: `${location}-${i}`, location_id: location })),
    );

  test('đủ 3 bản trộn mỗi vùng thì đạt', () => {
    const result = checkRecipeCoverage(recipesFor({ hanoi: 3, hue: 3 }), ['hanoi', 'hue']);
    expect(result).toMatchObject({ met: true, shortfall: {} });
  });

  test('thiếu bản trộn thì nêu rõ vùng nào thiếu mấy bản', () => {
    // Ràng buộc này làm tăng khối lượng thu âm — phải biết sớm, không phải
    // phát hiện lúc sắp chạy thực nghiệm.
    const result = checkRecipeCoverage(recipesFor({ hanoi: 1, hue: 3 }), ['hanoi', 'hue']);
    expect(result.met).toBe(false);
    expect(result.shortfall).toEqual({ hanoi: 2 });
  });

  test('vùng chưa có bản trộn nào vẫn bị tính thiếu', () => {
    const result = checkRecipeCoverage(recipesFor({ hanoi: 3 }), ['hanoi', 'hue']);
    expect(result.shortfall).toEqual({ hue: 3 });
  });

  test('số bản trộn tối thiểu chỉnh được', () => {
    const result = checkRecipeCoverage(recipesFor({ hanoi: 1 }), ['hanoi'], { minPerLocation: 1 });
    expect(result.met).toBe(true);
  });
});
