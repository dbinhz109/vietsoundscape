import { describe, expect, test } from 'vitest';
import { EXPERIMENT_CONDITIONS } from '../domain/taxonomy.js';
import { buildVariants, countPlanEvents, planOverlaps } from './variants.js';
import { checkStimulusBalance } from './stimulus.js';

// Lớp nền lặp vô hạn nên không cần thời lượng. Mọi vai khác phát một lần và
// **phải** có thời lượng — xem test "báo lỗi khi thiếu thời lượng".
const clips = [
  { id: 'HU-01', location_id: 'hue', schafer_role: 'keynote' },
  { id: 'HU-02', location_id: 'hue', schafer_role: 'keynote' },
  { id: 'HU-04', location_id: 'hue', schafer_role: 'soundmark', duration_s: 8 },
  { id: 'HU-05', location_id: 'hue', schafer_role: 'signal', duration_s: 3 },
  { id: 'HN-01', location_id: 'hanoi', schafer_role: 'keynote' },
  { id: 'HN-02', location_id: 'hanoi', schafer_role: 'keynote' },
  { id: 'HN-04', location_id: 'hanoi', schafer_role: 'signal', duration_s: 4 },
  { id: 'HN-07', location_id: 'hanoi', schafer_role: 'soundmark', duration_s: 9 },
  { id: 'CR-01', location_id: 'cairang', schafer_role: 'keynote' },
  { id: 'CR-03', location_id: 'cairang', schafer_role: 'soundmark', duration_s: 7 },
  { id: 'CR-05', location_id: 'cairang', schafer_role: 'signal', duration_s: 5 },
];

const base = (overrides = {}) => ({
  id: 'hue-trua-he',
  location_id: 'hue',
  seed: 20260807,
  layers: [
    { clip_id: 'HU-01', gain_db: -18, pan: 0 },
    { clip_id: 'HU-02', gain_db: -18, pan: -0.3 },
    { clip_id: 'HU-04', gain_db: -6, pan: 0.1 },
    { clip_id: 'HU-05', gain_db: -9, pan: -0.15, trigger: { mean_interval_s: 20, jitter_s: 5 } },
  ],
  ...overrides,
});

const build = (overrides = {}) => buildVariants(base(overrides), clips, { durationS: 60 });

describe('buildVariants — dựng đủ ba điều kiện từ một bản trộn', () => {
  test('trả về đúng ba điều kiện của thực nghiệm', () => {
    expect(Object.keys(build()).sort()).toEqual([...EXPERIMENT_CONDITIONS].sort());
  });

  test('mỗi kịch bản có mã riêng, nêu rõ bản trộn gốc và điều kiện', () => {
    const variants = build();
    expect(variants.layered.id).toBe('hue-trua-he--layered');
    expect(variants.scrambled.recipe_id).toBe('hue-trua-he');
    expect(variants.isolated.condition).toBe('isolated');
  });

  test('cả ba dùng chung một thời lượng', () => {
    const variants = build();
    for (const condition of EXPERIMENT_CONDITIONS) {
      expect(variants[condition].duration_s).toBe(60);
    }
  });

  // Đây là lý do module này tồn tại: FR-56 đòi số sự kiện âm khớp nhau giữa các
  // điều kiện. Dựng ba biến thể từ CÙNG một danh sách sự kiện thì khớp **do cách
  // dựng**, không phải do may mắn rồi đi đo lại.
  test('số sự kiện âm bằng nhau ở cả ba điều kiện — khớp do cách dựng (FR-56)', () => {
    const variants = build();
    const counts = EXPERIMENT_CONDITIONS.map((c) => countPlanEvents(variants[c]));
    expect(new Set(counts).size).toBe(1);
    expect(counts[0]).toBeGreaterThan(4);
  });

  test('mọi sự kiện nằm trong khung thời lượng', () => {
    for (const condition of EXPERIMENT_CONDITIONS) {
      for (const event of build()[condition].events) {
        expect(event.start_s).toBeGreaterThanOrEqual(0);
        expect(event.start_s + event.length_s).toBeLessThanOrEqual(60 + 1e-9);
      }
    }
  });

  test('cùng seed thì ra kịch bản giống hệt', () => {
    expect(build()).toEqual(build());
  });

  test('đổi seed thì kịch bản khác đi', () => {
    expect(build({ seed: 1 })).not.toEqual(build({ seed: 2 }));
  });
});

describe('điều kiện layered — soundscape phân lớp đúng vùng', () => {
  test('lớp nền phủ trọn khung, chồng lên nhau', () => {
    const layered = build().layered;
    const beds = layered.events.filter((e) => e.clip_id === 'HU-01' || e.clip_id === 'HU-02');
    expect(beds).toHaveLength(2);
    for (const bed of beds) {
      expect(bed.start_s).toBe(0);
      expect(bed.length_s).toBe(60);
    }
  });

  test('lớp tín hiệu phát theo lịch có seed, nhiều lần', () => {
    const signals = build().layered.events.filter((e) => e.clip_id === 'HU-05');
    expect(signals.length).toBeGreaterThan(1);
    const starts = signals.map((e) => e.start_s);
    expect([...starts].sort((a, b) => a - b)).toEqual(starts);
  });

  test('mỗi lần phát dài đúng bằng thời lượng mẫu âm, không phải tới hết khung', () => {
    // Tiếng chuông dài 3 giây thì mỗi lần vang là 3 giây. Lấy "từ đây tới hết
    // khung" thì bộ kết xuất phát sai, và phép kiểm chồng lấp cũng sai theo.
    for (const event of build().layered.events.filter((e) => e.clip_id === 'HU-05')) {
      expect(event.length_s).toBeCloseTo(3, 6);
    }
  });

  test('lần phát sát cuối khung bị cắt cho vừa khung', () => {
    const plan = buildVariants(
      base({ layers: [{ clip_id: 'HU-05', trigger: { mean_interval_s: 9, jitter_s: 0 } }] }),
      clips,
      { durationS: 20 },
    ).layered;
    const last = plan.events[plan.events.length - 1];
    expect(last.start_s + last.length_s).toBeLessThanOrEqual(20 + 1e-9);
    expect(last.length_s).toBeLessThan(3);
  });

  test('dấu ấn âm thanh phát MỘT lần, không phủ trọn khung như lớp nền', () => {
    // `soundmark` không lặp (LOOPING_ROLES chỉ có `keynote`). Coi nó như nền là
    // biến một tiếng cồng thành tiếng cồng ngân 60 giây.
    const marks = build().layered.events.filter((e) => e.clip_id === 'HU-04');
    expect(marks).toHaveLength(1);
    expect(marks[0].length_s).toBeCloseTo(8, 6);
  });

  test('báo lỗi khi mẫu không lặp mà thiếu thời lượng', () => {
    // Đoán thời lượng là đúng thứ FR-56 cấm: kích thích lệch nhau mà không ai
    // biết. Thà dừng lại, chạy `npm run process` để đo thật.
    const noDuration = clips.map((c) => (c.id === 'HU-05' ? { ...c, duration_s: undefined } : c));
    expect(() => buildVariants(base(), noDuration, { durationS: 60 })).toThrow(/thời lượng/i);
  });

  test('có chồng lấp — đó chính là điều kiện đang thao tác', () => {
    expect(planOverlaps(build().layered)).toBe(true);
  });

  test('giữ nguyên vùng miền của bản trộn gốc', () => {
    for (const event of build().layered.events) {
      expect(event.clip_id.startsWith('HU-')).toBe(true);
    }
  });
});

describe('điều kiện isolated — âm rời rạc, đối chứng của H1', () => {
  test('KHÔNG có sự kiện nào chồng lấp', () => {
    // Định nghĩa thao tác của "âm đơn lẻ": cùng bấy nhiêu âm, cùng khung thời
    // gian, nhưng nghe lần lượt từng cái. Khác biệt duy nhất so với `layered`
    // là tính đồng thời — đúng thứ H1 phát biểu.
    expect(planOverlaps(build().isolated)).toBe(false);
  });

  test('dùng đúng những mẫu âm của điều kiện phân lớp', () => {
    const variants = build();
    const ids = (plan) => [...new Set(plan.events.map((e) => e.clip_id))].sort();
    expect(ids(variants.isolated)).toEqual(ids(variants.layered));
  });

  test('âm phát một lần giữ ĐÚNG thời lượng thật của nó', () => {
    // Chia khung thành các ô bằng nhau thì tiếng chuông 3 giây bị gán ô 12 giây,
    // và bộ kết xuất sẽ kéo dài hoặc lặp nó. Lúc đó `isolated` không còn là
    // "cùng bấy nhiêu âm, nghe lần lượt" — nó là âm khác hẳn.
    const variants = build();
    const lengthByClip = (plan, id) =>
      plan.events.filter((e) => e.clip_id === id).map((e) => e.length_s);

    expect(lengthByClip(variants.isolated, 'HU-04')).toEqual([8]);
    expect(lengthByClip(variants.isolated, 'HU-05')).toEqual(
      lengthByClip(variants.layered, 'HU-05'),
    );
  });

  test('lớp nền hút phần thời gian còn lại để khung khớp đúng', () => {
    // Nền vốn liên tục nên co giãn được; âm phát một lần thì không. Cho nền hút
    // phần dư là cách duy nhất giữ được cả hai: thời lượng khung khớp, và mỗi
    // âm một lần vẫn dài đúng như ở điều kiện phân lớp.
    const plan = build().isolated;
    const covered = plan.events.reduce((sum, e) => sum + e.length_s, 0);
    expect(covered).toBeCloseTo(plan.duration_s, 6);

    const beds = plan.events.filter((e) => e.loops);
    expect(beds.length).toBeGreaterThan(0);
    for (const bed of beds) expect(bed.length_s).toBeGreaterThan(0);
  });

  test('báo lỗi khi âm phát một lần đã chiếm hết khung, không còn chỗ cho nền', () => {
    // Khung 8 giây mà riêng dấu ấn âm thanh HU-04 đã dài 8 giây: xếp lần lượt
    // thì nền không còn chỗ nào. Thà báo lỗi hơn là âm thầm cắt bớt HU-04, vì
    // cắt là làm `isolated` khác `layered` ở chỗ không ai để ý.
    expect(() => buildVariants(base(), clips, { durationS: 8 })).toThrow(/không còn chỗ|quá ngắn/i);
  });

  test('thứ tự các ô do seed quyết định, không phải theo thứ tự khai lớp', () => {
    // Nếu luôn phát nền trước rồi tín hiệu sau thì thứ tự trở thành gợi ý,
    // và nó cũng khác hẳn cách người ta gặp âm thanh trong thực tế.
    const a = build({ seed: 11 }).isolated.events.map((e) => e.clip_id);
    const b = build({ seed: 22 }).isolated.events.map((e) => e.clip_id);
    expect(a).not.toEqual(b);
  });
});

describe('điều kiện scrambled — phân lớp SAI vùng miền (FR-58)', () => {
  test('không còn mẫu nào thuộc vùng gốc', () => {
    // Đây mới là phép thử đúng cho chữ "có chủ đích" trong H1: lượng thông tin
    // giữ nguyên, chỉ phá tính mạch lạc vùng miền.
    for (const event of build().scrambled.events) {
      expect(event.clip_id.startsWith('HU-')).toBe(false);
    }
  });

  test('giữ nguyên cấu trúc vai âm thanh của bản gốc', () => {
    const roleOf = (id) => clips.find((c) => c.id === id).schafer_role;
    const variants = build();
    const roles = (plan) => plan.events.map((e) => roleOf(e.clip_id));
    expect(roles(variants.scrambled)).toEqual(roles(variants.layered));
  });

  test('trộn từ nhiều vùng khác nhau, không phải đổi sang một vùng khác', () => {
    // Nếu tất cả lớp đều lấy từ Hà Nội thì `scrambled` chỉ là một soundscape
    // Hà Nội mạch lạc — không phá được tính mạch lạc nào cả.
    const locationOf = (id) => clips.find((c) => c.id === id).location_id;
    const used = new Set(build().scrambled.events.map((e) => locationOf(e.clip_id)));
    expect(used.size).toBeGreaterThan(1);
  });

  test('vẫn chồng lấp như điều kiện phân lớp', () => {
    expect(planOverlaps(build().scrambled)).toBe(true);
  });

  test('báo lỗi khi không đủ mẫu ngoài vùng để thay thế', () => {
    const onlyHue = clips.filter((c) => c.location_id === 'hue');
    expect(() => buildVariants(base(), onlyHue, { durationS: 60 })).toThrow(/vùng khác/i);
  });
});

/**
 * Phép kiểm quan trọng nhất của cả hai module: bộ dựng biến thể có thật sự thoả
 * điều kiện cân bằng mà `checkStimulusBalance` đòi hay không.
 *
 * Nếu test này đỏ thì cách dựng ba điều kiện có lỗi — không phải ngưỡng quá chặt.
 */
describe('buildVariants × checkStimulusBalance — cân bằng do cách dựng', () => {
  const asStimuli = (variants) =>
    Object.values(variants).map((plan) => ({
      id: plan.id,
      condition: plan.condition,
      duration_s: plan.duration_s,
      event_count: countPlanEvents(plan),
      // Bộ kết xuất chuẩn hoá mọi kích thích về −23 LUFS (FR-57), nên độ to
      // không phải là biến gây nhiễu ở đây.
      loudness_lufs: -23,
    }));

  test('ba biến thể dựng ra thì đạt phép kiểm khử nhiễu, không cần chỉnh tay', () => {
    const result = checkStimulusBalance(asStimuli(build()));
    expect(result).toMatchObject({ balanced: true, issues: [] });
  });

  test('đạt cả với ngưỡng chặt nhất — khớp chính xác, không phải khớp trong sai số', () => {
    const result = checkStimulusBalance(asStimuli(build()), {
      durationToleranceS: 0,
      eventTolerance: 0,
      lufsToleranceLu: 0,
    });
    expect(result.balanced).toBe(true);
  });

  test('đạt với nhiều bản trộn và nhiều thời lượng khác nhau', () => {
    for (const durationS of [30, 45, 60, 90]) {
      for (const seed of [1, 4242, 20260807]) {
        const variants = buildVariants(base({ seed }), clips, { durationS });
        expect(checkStimulusBalance(asStimuli(variants)).balanced).toBe(true);
      }
    }
  });
});

describe('vang không gian đi cùng kịch bản', () => {
  const recipe = {
    id: 'hue-trua-he',
    location_id: 'hue-thien-mu',
    seed: 42,
    reverb_ir: '/ir/hue-thien-mu.wav',
    layers: [
      { clip_id: 'HU-01', gain_db: -18, pan: 0 },
      { clip_id: 'HU-05', gain_db: -9, pan: -0.5, trigger: { mean_interval_s: 20, jitter_s: 4 } },
    ],
  };
  const clips = [
    { id: 'HU-01', location_id: 'hue-thien-mu', krause_class: 'geophony', schafer_role: 'keynote', duration_s: 40 },
    { id: 'HU-05', location_id: 'hue-thien-mu', krause_class: 'anthrophony', schafer_role: 'signal', duration_s: 3 },
    { id: 'HN-01', location_id: 'hanoi-pho-co', krause_class: 'anthrophony', schafer_role: 'keynote', duration_s: 40 },
    { id: 'HN-02', location_id: 'hanoi-pho-co', krause_class: 'anthrophony', schafer_role: 'signal', duration_s: 3 },
  ];

  test('CẢ BA điều kiện dùng CHUNG một phản hồi xung', () => {
    // Cho mỗi điều kiện một không gian khác nhau là biến vang thành yếu tố gây
    // nhiễu: chênh lệch nhận diện khi đó giải thích được bằng "phòng này dễ nghe
    // hơn phòng kia", không đụng gì tới H1. FR-56/57 tồn tại đúng để chặn loại
    // chênh lệch này.
    const variants = buildVariants(recipe, clips, { durationS: 60 });
    const irs = EXPERIMENT_CONDITIONS.map((condition) => variants[condition].reverb_ir);
    expect(new Set(irs).size).toBe(1);
    expect(irs[0]).toBe('/ir/hue-thien-mu.wav');
  });

  test('`scrambled` lấy mẫu vùng khác nhưng VẪN dùng vang của vùng gốc', () => {
    // Ở đây có một đánh đổi thật, ghi lại để không ai "sửa" nhầm: dùng vang
    // riêng của từng mẫu sẽ làm `scrambled` khác `layered` ở HAI điểm (nội dung
    // lẫn không gian) thay vì một, nên FR-58 không còn cô lập được điều nó định
    // cô lập. Giữ chung một vang là chấp nhận `scrambled` được "gắn kết" hơn một
    // chút — đó là hướng thận trọng, vì nó làm hiệu ứng KHÓ thấy hơn, không dễ hơn.
    const variants = buildVariants(recipe, clips, { durationS: 60 });
    const foreign = variants.scrambled.events.some((event) => event.clip_id.startsWith('HN-'));
    expect(foreign).toBe(true);
    expect(variants.scrambled.reverb_ir).toBe(variants.layered.reverb_ir);
  });

  test('bản trộn không khai vang thì kịch bản mang null, không mang undefined', () => {
    const { reverb_ir: ir, ...bare } = recipe;
    const variants = buildVariants(bare, clips, { durationS: 60 });
    for (const condition of EXPERIMENT_CONDITIONS) {
      expect(variants[condition].reverb_ir).toBeNull();
    }
  });
});
