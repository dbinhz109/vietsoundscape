import { describe, expect, test } from 'vitest';
import {
  effectiveMixLicense,
  indexClipsById,
  isExperimentReady,
  validateRecipe,
} from './recipe-schema.js';

const clip = (overrides = {}) => ({
  id: 'HN-01',
  location_id: 'hanoi-pho-co',
  krause_class: 'anthrophony',
  schafer_role: 'keynote',
  provenance: 'licensed_archive',
  location_verified: false,
  must_verify_on_site: false,
  ...overrides,
});

const CLIPS = [
  clip({ id: 'HN-01', schafer_role: 'keynote' }),
  clip({ id: 'HN-03', schafer_role: 'keynote', krause_class: 'geophony' }),
  clip({ id: 'HN-06', schafer_role: 'signal' }),
  clip({
    id: 'HN-05',
    schafer_role: 'soundmark',
    provenance: 'field_recording',
    location_verified: true,
    must_verify_on_site: true,
  }),
  clip({ id: 'CR-01', location_id: 'cai-rang', schafer_role: 'keynote' }),
];
const byId = indexClipsById(CLIPS);

const recipe = (overrides = {}) => ({
  id: 'hanoi-pho-co-sang-som',
  location_id: 'hanoi-pho-co',
  title_vi: 'Phố cổ Hà Nội — sáng sớm',
  seed: 20260805,
  layers: [
    { clip_id: 'HN-01', slider: 0.7, pan: 0 },
    { clip_id: 'HN-03', slider: 0.5, pan: -0.3 },
    { clip_id: 'HN-06', slider: 0.6, trigger: { mean_interval_s: 24, jitter_s: 8 } },
  ],
  ...overrides,
});

const errorFields = (result) => result.errors.map((e) => e.field);

describe('validateRecipe', () => {
  test('bản trộn đầy đủ thì hợp lệ', () => {
    expect(validateRecipe(recipe(), byId)).toMatchObject({ valid: true, errors: [] });
  });

  test('thiếu tiêu đề thì không hợp lệ', () => {
    expect(errorFields(validateRecipe(recipe({ title_vi: undefined }), byId))).toContain('title_vi');
  });

  test('bản trộn rỗng lớp âm thì không hợp lệ', () => {
    expect(errorFields(validateRecipe(recipe({ layers: [] }), byId))).toContain('layers');
  });

  test('từ chối lớp trỏ tới mẫu âm không tồn tại', () => {
    const broken = recipe({ layers: [{ clip_id: 'KHONG-CO' }] });
    expect(errorFields(validateRecipe(broken, byId))).toContain('layers[0].clip_id');
  });

  test('bắt buộc có ít nhất một lớp âm nền', () => {
    // Không có nền thì không có gì để lặp, soundscape thành các âm rời rạc —
    // đúng thứ mà giả thuyết H1 lấy làm nhóm đối chứng.
    const noKeynote = recipe({
      layers: [{ clip_id: 'HN-06', trigger: { mean_interval_s: 20 } }],
    });
    expect(errorFields(validateRecipe(noKeynote, byId))).toContain('layers');
  });

  test('từ chối trộn lẫn mẫu âm của địa điểm khác', () => {
    // Trộn lẫn địa điểm làm hỏng chính phép thử nhận diện vùng miền.
    const mixed = recipe({
      layers: [...recipe().layers, { clip_id: 'CR-01', slider: 0.4 }],
    });
    const result = validateRecipe(mixed, byId);
    expect(errorFields(result)).toContain('layers[3].clip_id');
    expect(result.errors.at(-1).message).toMatch(/cai-rang/);
  });

  test('lớp tín hiệu âm phải có cấu hình lịch phát', () => {
    const noTrigger = recipe({
      layers: [{ clip_id: 'HN-01', slider: 0.7 }, { clip_id: 'HN-06', slider: 0.6 }],
    });
    expect(errorFields(validateRecipe(noTrigger, byId))).toContain('layers[1].trigger');
  });

  test('bản trộn có lớp tín hiệu thì phải có seed', () => {
    // Không seed thì mỗi người nghe một chuỗi khác nhau và bản trộn không tái
    // lập được — kích thích thực nghiệm mất tính kiểm soát (FR-52).
    expect(errorFields(validateRecipe(recipe({ seed: undefined }), byId))).toContain('seed');
  });

  test('bản trộn chỉ có âm nền thì không cần seed', () => {
    const beds = recipe({
      seed: undefined,
      layers: [{ clip_id: 'HN-01', slider: 0.7 }, { clip_id: 'HN-03', slider: 0.5 }],
    });
    expect(validateRecipe(beds, byId).valid).toBe(true);
  });

  test('từ chối giá trị trái phải ngoài khoảng', () => {
    const badPan = recipe({ layers: [{ clip_id: 'HN-01', pan: 2 }] });
    expect(errorFields(validateRecipe(badPan, byId))).toContain('layers[0].pan');
  });

  test('từ chối vị trí thanh trượt ngoài khoảng', () => {
    const badSlider = recipe({ layers: [{ clip_id: 'HN-01', slider: 1.4 }] });
    expect(errorFields(validateRecipe(badSlider, byId))).toContain('layers[0].slider');
  });
});

describe('isExperimentReady — điều kiện của rủi ro R-10', () => {
  test('bản trộn có mẫu tự thu đã xác minh thì dùng được cho H1', () => {
    const withSoundmark = recipe({
      layers: [...recipe().layers, { clip_id: 'HN-05', slider: 0.8 }],
    });
    expect(isExperimentReady(withSoundmark, byId)).toBe(true);
  });

  test('bản trộn toàn nền tải về thì KHÔNG dùng được cho H1', () => {
    // Nền tải từ kho không xác minh được nơi chốn. Người nghe chỉ đang đoán cái
    // nhãn ta tự gán, chứ không nhận diện vùng miền thật.
    expect(isExperimentReady(recipe(), byId)).toBe(false);
  });

  test('kết quả kiểm bản trộn có kèm cờ dùng được cho thực nghiệm', () => {
    const withSoundmark = recipe({
      layers: [...recipe().layers, { clip_id: 'HN-05', slider: 0.8 }],
    });
    expect(validateRecipe(withSoundmark, byId).experimentReady).toBe(true);
    expect(validateRecipe(recipe(), byId).experimentReady).toBe(false);
  });
});

describe('indexClipsById', () => {
  test('tra cứu được mẫu âm theo mã', () => {
    expect(indexClipsById(CLIPS)['HN-05'].schafer_role).toBe('soundmark');
  });
});

describe('effectiveMixLicense — giấy phép của bản trộn (A0.4)', () => {
  const licensed = (id, license, role = 'keynote') =>
    clip({ id, license, schafer_role: role, location_id: 'hanoi-pho-co' });

  const mixOf = (...clips) => ({
    recipe: {
      id: 'm',
      location_id: 'hanoi-pho-co',
      title_vi: 'M',
      layers: clips.map((c) => ({ clip_id: c.id })),
    },
    byId: indexClipsById(clips),
  });

  test('toàn bộ CC0 thì bản trộn công bố được dưới CC0', () => {
    const { recipe, byId } = mixOf(licensed('A', 'CC0-1.0'), licensed('B', 'CC0-1.0'));
    expect(effectiveMixLicense(recipe, byId).license).toBe('CC0-1.0');
  });

  test('trộn CC0 với CC BY thì bản trộn phải là CC BY — điều kiện ghi công lan ra', () => {
    const { recipe, byId } = mixOf(licensed('A', 'CC0-1.0'), licensed('B', 'CC-BY-4.0'));
    expect(effectiveMixLicense(recipe, byId).license).toBe('CC-BY-4.0');
  });

  test('một lớp SA làm cả bản trộn thành SA — copyleft lây sang', () => {
    // Đây là bẫy: tải một tệp nền CC BY-SA về trộn cùng vật liệu nhóm tự thu thì
    // cả bản trộn bị ràng buộc chia sẻ lại cùng điều kiện.
    const { recipe, byId } = mixOf(licensed('A', 'CC-BY-4.0'), licensed('B', 'CC-BY-SA-4.0'));
    const result = effectiveMixLicense(recipe, byId);

    expect(result.license).toBe('CC-BY-SA-4.0');
    expect(result.copyleft).toBe(true);
  });

  test('cảnh báo khi vật liệu nhóm tự thu bị SA của tệp tải về ràng buộc', () => {
    // Nhóm mất quyền tự quyết với chính bản ghi của mình trong bản trộn đó.
    const { recipe, byId } = mixOf(
      licensed('A', 'proprietary-own'),
      licensed('B', 'CC-BY-SA-4.0'),
    );
    const result = effectiveMixLicense(recipe, byId);

    expect(result.warnings.join(' ')).toMatch(/tự thu|proprietary-own/i);
    expect(result.warnings.join(' ')).toMatch(/SA/);
  });

  test('không cảnh báo khi mọi lớp đều không copyleft', () => {
    const { recipe, byId } = mixOf(licensed('A', 'proprietary-own'), licensed('B', 'CC-BY-4.0'));
    expect(effectiveMixLicense(recipe, byId).warnings).toEqual([]);
  });

  test('báo lớp nào thiếu giấy phép thay vì đoán', () => {
    const { recipe, byId } = mixOf(licensed('A', 'CC-BY-4.0'), licensed('B', undefined));
    const result = effectiveMixLicense(recipe, byId);

    expect(result.license).toBeNull();
    expect(result.warnings.join(' ')).toMatch(/B/);
  });

  test('liệt kê đủ giấy phép của các lớp để ghi công đúng', () => {
    const { recipe, byId } = mixOf(licensed('A', 'CC0-1.0'), licensed('B', 'CC-BY-4.0'));
    expect(effectiveMixLicense(recipe, byId).layerLicenses).toEqual({
      A: 'CC0-1.0',
      B: 'CC-BY-4.0',
    });
  });
});

describe('vang không gian', () => {
  test('không khai vang thì hợp lệ', () => {
    const bare = recipe();
    delete bare.reverb_ir;
    expect(validateRecipe(bare, byId).valid).toBe(true);
  });

  test('null cũng hợp lệ — nghĩa là cố ý không dùng vang', () => {
    expect(validateRecipe({ ...recipe(), reverb_ir: null }, byId).valid).toBe(true);
  });

  test('đường dẫn phải là chuỗi bắt đầu bằng / và trỏ tới tệp wav', () => {
    for (const reverb_ir of ['ir/hue.wav', '/ir/hue.mp3', 42, '/ir/hue']) {
      const result = validateRecipe({ ...recipe(), reverb_ir }, byId);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'reverb_ir')).toBe(true);
    }
  });

  test('đường dẫn đúng dạng thì hợp lệ', () => {
    expect(
      validateRecipe({ ...recipe(), reverb_ir: '/data/ir/hue-thien-mu.wav' }, byId).valid,
    ).toBe(true);
  });
});
