import { describe, expect, test } from 'vitest';
import { validateClip, validateDataset } from './clip-schema.js';

/** Mẫu ở trạng thái đã lên kế hoạch — chưa có tệp âm, chưa có số đo. */
const planned = (overrides = {}) => ({
  id: 'HN-05',
  status: 'planned',
  title_vi: 'Tiếng gõ búa thợ bạc phố Hàng Bạc',
  location_id: 'hanoi-pho-co',
  krause_class: 'anthrophony',
  schafer_role: 'soundmark',
  provenance: 'field_recording',
  endangerment_level: 'declining',
  ...overrides,
});

/** Mẫu đã xuất bản — mọi trường bắt buộc của BA §8.2 phải đủ. */
const published = (overrides = {}) => ({
  ...planned(),
  status: 'published',
  title_en: 'Silversmith hammering, Hang Bac street',
  lat: 21.0345,
  lon: 105.8535,
  recorded_at: '2026-09-14T05:30:00+07:00',
  time_of_day: 'early_morning',
  season: 'autumn',
  device: 'Zoom H1essential',
  mic_pattern: 'XY stereo',
  sample_rate: 48000,
  bit_depth: 24,
  channels: 1,
  duration_s: 42.5,
  loudness_lufs: -23.1,
  true_peak_dbtp: -1.2,
  license: 'CC-BY-4.0',
  rights_holder: 'Nhóm nghiên cứu VietSoundscape',
  contributor: 'Nguyễn Văn A',
  consent_status: 'obtained',
  location_verified: true,
  sha256: 'a'.repeat(64),
  editing_log: ['trim', 'loudnorm'],
  cultural_note_vi:
    'Phố Hàng Bạc làm nghề bạc từ thế kỷ 15. Tiếng búa gõ tay là dấu ấn âm ' +
    'thanh của nghề đó, và đang thưa dần khi máy thay người.',
  ...overrides,
});

const errorFields = (result) => result.errors.map((e) => e.field);

describe('validateClip — trạng thái kế hoạch', () => {
  test('mẫu đã lên kế hoạch hợp lệ dù chưa có tệp âm', () => {
    expect(validateClip(planned())).toMatchObject({ valid: true, errors: [] });
  });

  test('thiếu trường định danh thì không hợp lệ', () => {
    const result = validateClip(planned({ location_id: undefined }));
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('location_id');
  });

  test('chưa yêu cầu số đo độ to khi còn ở trạng thái kế hoạch', () => {
    expect(errorFields(validateClip(planned()))).not.toContain('loudness_lufs');
  });
});

describe('validateClip — từ vựng có kiểm soát', () => {
  test('từ chối nhóm nguồn phát ngoài khung Krause', () => {
    const result = validateClip(planned({ krause_class: 'technophony' }));
    expect(errorFields(result)).toContain('krause_class');
  });

  test('từ chối vai âm thanh ngoài khung Schafer', () => {
    expect(errorFields(validateClip(planned({ schafer_role: 'ambience' })))).toContain(
      'schafer_role',
    );
  });

  test('chấp nhận mức mai một "lost" cho âm đã không còn tồn tại', () => {
    const clip = planned({
      id: 'HN-08',
      endangerment_level: 'lost',
      provenance: 'licensed_archive',
      source_url: 'https://example.org/tram-bell',
      source_uploader: 'archive-user',
      downloaded_at: '2026-08-20',
      license: 'CC-BY-4.0',
    });
    expect(validateClip(clip).valid).toBe(true);
  });
});

describe('validateClip — giấy phép', () => {
  test('chấp nhận CC0', () => {
    const clip = published({ license: 'CC0-1.0' });
    expect(errorFields(validateClip(clip))).not.toContain('license');
  });

  test('từ chối giấy phép phi thương mại và nói rõ vì sao', () => {
    // NC chặn luôn giá trị "quảng bá du lịch" nêu ở mục 10 thuyết minh (LG-03).
    const result = validateClip(published({ license: 'CC-BY-NC-4.0' }));
    expect(result.valid).toBe(false);
    const error = result.errors.find((e) => e.field === 'license');
    expect(error.message).toMatch(/phi thương mại|LG-03/i);
  });

  test('từ chối giấy phép không nằm trong danh sách cho phép', () => {
    expect(errorFields(validateClip(published({ license: 'all-rights-reserved' })))).toContain(
      'license',
    );
  });
});

describe('validateClip — nguồn gốc vật liệu', () => {
  test('mẫu tải về phải có đường dẫn nguồn, người tải lên và ngày tải', () => {
    const result = validateClip(published({ provenance: 'licensed_archive' }));
    const fields = errorFields(result);
    expect(fields).toContain('source_url');
    expect(fields).toContain('source_uploader');
    expect(fields).toContain('downloaded_at');
  });

  test('mẫu tải về không được khai là đã xác minh nơi chốn', () => {
    // Tệp gắn nhãn "chợ nổi Việt Nam" trên kho quốc tế có thể thu ở nơi khác —
    // không có cách nào kiểm chứng (rủi ro R-10).
    const result = validateClip(
      published({
        provenance: 'licensed_archive',
        source_url: 'https://example.org/a',
        source_uploader: 'someone',
        downloaded_at: '2026-08-20',
        location_verified: true,
      }),
    );
    expect(errorFields(result)).toContain('location_verified');
  });

  test('âm đã mất không thể do nhóm tự thu', () => {
    // Tiếng tàu điện Hà Nội đã ngừng tồn tại — không ai thu tại chỗ được nữa.
    const result = validateClip(planned({ endangerment_level: 'lost' }));
    expect(errorFields(result)).toContain('provenance');
  });
});

describe('validateClip — trạng thái đã xuất bản', () => {
  test('mẫu đã xuất bản đầy đủ thì hợp lệ', () => {
    expect(validateClip(published())).toMatchObject({ valid: true, errors: [] });
  });

  test('bắt buộc có số đo LUFS khi xuất bản', () => {
    expect(errorFields(validateClip(published({ loudness_lufs: undefined })))).toContain(
      'loudness_lufs',
    );
  });

  test('bắt buộc có mã băm khi xuất bản', () => {
    expect(errorFields(validateClip(published({ sha256: undefined })))).toContain('sha256');
  });

  test('từ chối mã băm sai định dạng', () => {
    expect(errorFields(validateClip(published({ sha256: 'khong-phai-bam' })))).toContain('sha256');
  });

  test('thời điểm thu phải có múi giờ', () => {
    // "2026-09-14T05:30:00" không nói được là 5 giờ sáng ở đâu. Chợ 5 giờ sáng
    // là một soundscape khác hẳn chợ 5 giờ chiều.
    const result = validateClip(published({ recorded_at: '2026-09-14T05:30:00' }));
    expect(errorFields(result)).toContain('recorded_at');
  });

  test('lớp âm nền đã xuất bản phải có điểm loop đã tính', () => {
    const result = validateClip(published({ schafer_role: 'keynote' }));
    const fields = errorFields(result);
    expect(fields).toContain('loop_start_s');
    expect(fields).toContain('loop_end_s');
  });

  test('lớp phát một lần không cần điểm loop', () => {
    const fields = errorFields(validateClip(published({ schafer_role: 'soundmark' })));
    expect(fields).not.toContain('loop_start_s');
  });

  test('toạ độ phải nằm trong khung Việt Nam', () => {
    expect(errorFields(validateClip(published({ lat: 48.85, lon: 2.35 })))).toContain('lat');
  });
});

describe('validateDataset', () => {
  test('từ chối hai mẫu cùng mã', () => {
    const result = validateDataset([planned(), planned()]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => /trùng mã|đã tồn tại/i.test(e.message))).toBe(true);
  });

  test('gom lỗi theo từng mẫu để sửa được', () => {
    const result = validateDataset([planned(), planned({ id: 'X-01', krause_class: 'sai' })]);
    expect(result.byClip['X-01'].map((e) => e.field)).toContain('krause_class');
    expect(result.byClip['HN-05']).toEqual([]);
  });

  test('bộ dữ liệu hợp lệ thì không có lỗi nào', () => {
    const result = validateDataset([planned(), planned({ id: 'CR-04' })]);
    expect(result).toMatchObject({ valid: true, errors: [] });
  });
});

describe('validateClip — luật phụ thuộc trạng thái', () => {
  test('mẫu tải về ở trạng thái kế hoạch chưa cần đường dẫn nguồn', () => {
    // Lúc lập kế hoạch thì chưa đi khảo sát kho (việc A0.1b của lộ trình) —
    // chưa biết sẽ lấy tệp nào thì không thể có URL.
    const clip = planned({ provenance: 'licensed_archive' });
    const fields = errorFields(validateClip(clip));

    expect(fields).not.toContain('source_url');
    expect(fields).not.toContain('source_uploader');
    expect(fields).not.toContain('downloaded_at');
  });

  test('nhưng bắt buộc có ngay khi mẫu đã được thu thập về', () => {
    const clip = planned({ status: 'recorded', provenance: 'licensed_archive' });
    expect(errorFields(validateClip(clip))).toContain('source_url');
  });

  test('mẫu lấy từ kho không thể đánh dấu bắt buộc xác minh tại chỗ', () => {
    // Không ai ra hiện trường xác minh được một tệp tải từ kho quốc tế.
    const clip = planned({ provenance: 'licensed_archive', must_verify_on_site: true });
    expect(errorFields(validateClip(clip))).toContain('must_verify_on_site');
  });
});

describe('validateClip — đồng thuận và quyền (LG-01, LG-02, LG-04)', () => {
  const voiceClip = (overrides = {}) =>
    published({
      id: 'HN-04',
      title_vi: 'Tiếng rao đêm',
      schafer_role: 'signal',
      contains_identifiable_voice: true,
      consent_status: 'obtained',
      sensitive_categories: ['biometric'],
      sensitive_notice_given: true,
      recording_notice_given: true,
      ...overrides,
    });

  test('từ chối trạng thái đồng thuận ngoài từ vựng', () => {
    expect(errorFields(validateClip(published({ consent_status: 'hinh-nhu-co' })))).toContain(
      'consent_status',
    );
  });

  test('mẫu có giọng người nhận dạng được, đã xin đồng thuận thì hợp lệ', () => {
    expect(validateClip(voiceClip()).valid).toBe(true);
  });

  test('không xuất bản mẫu có giọng người khi đồng thuận còn đang chờ', () => {
    // LG-01: tiếng rao là giọng của một người cụ thể.
    const result = validateClip(voiceClip({ consent_status: 'pending' }));
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('consent_status');
  });

  test('không xuất bản mẫu có giọng người khi khai là không cần đồng thuận', () => {
    expect(errorFields(validateClip(voiceClip({ consent_status: 'not_required' })))).toContain(
      'consent_status',
    );
  });

  test('mẫu đã bị rút thì không được xuất bản ở bất kỳ hoàn cảnh nào', () => {
    // LG-04: người xuất hiện trong bản ghi yêu cầu rút thì phải rút thật, không
    // để sót một đường nào đưa nó ra công khai.
    const result = validateClip(voiceClip({ consent_status: 'withdrawn' }));
    expect(result.valid).toBe(false);
    expect(result.errors.find((e) => e.field === 'consent_status').message).toMatch(/rút/i);
  });

  test('mẫu đã bị rút ở trạng thái nháp thì vẫn hợp lệ — chỉ chặn xuất bản', () => {
    const draft = planned({ consent_status: 'withdrawn' });
    expect(validateClip(draft).valid).toBe(true);
  });

  test('biểu đạt văn hoá truyền thống cần thoả thuận cộng đồng, không chỉ đồng thuận cá nhân', () => {
    // LG-02: cồng chiêng và ca Huế là di sản của cộng đồng, không phải tài sản
    // của người ghi âm hay của một nghệ nhân đơn lẻ.
    const gong = published({
      id: 'TN-05',
      title_vi: 'Cồng chiêng',
      cultural_expression: true,
      consent_status: 'obtained',
    });
    const result = validateClip(gong);
    expect(result.valid).toBe(false);
    expect(result.errors.find((e) => e.field === 'consent_status').message).toMatch(/cộng đồng/i);
  });

  test('biểu đạt văn hoá có thoả thuận cộng đồng và ghi công thì hợp lệ', () => {
    const gong = published({
      id: 'TN-05',
      cultural_expression: true,
      consent_status: 'community_agreed',
      community_credit: 'Đội cồng chiêng buôn Akŏ Dhông, Buôn Ma Thuột',
      recording_notice_given: true,
    });
    expect(validateClip(gong).valid).toBe(true);
  });

  test('biểu đạt văn hoá phải ghi công cộng đồng chủ thể', () => {
    const gong = published({
      id: 'TN-05',
      cultural_expression: true,
      consent_status: 'community_agreed',
      community_credit: undefined,
    });
    expect(errorFields(validateClip(gong))).toContain('community_credit');
  });
});

/**
 * Dữ liệu cá nhân nhạy cảm — Nghị định 356/2025/NĐ-CP Điều 4 khoản 1.
 *
 * Căn cứ đầy đủ ở `phap-ly/08-can-cu-phap-ly.md` §4. Trước đây §4.2 chỉ là một
 * bảng trong tài liệu; ở đây nó thành luật máy kiểm được.
 */
describe('validateClip — dữ liệu cá nhân nhạy cảm (LG-01b, LG-01c)', () => {
  const sensitiveClip = (overrides = {}) =>
    published({
      id: 'HU-05',
      title_vi: 'Mõ và tụng kinh gần',
      contains_identifiable_voice: true,
      consent_status: 'obtained',
      sensitive_categories: ['biometric', 'religious_belief'],
      sensitive_notice_given: true,
      recording_notice_given: true,
      ...overrides,
    });

  test('mẫu nhạy cảm khai đủ thì hợp lệ', () => {
    expect(validateClip(sensitiveClip())).toMatchObject({ valid: true, errors: [] });
  });

  test('từ chối nhóm nhạy cảm ngoài từ vựng', () => {
    const result = validateClip(sensitiveClip({ sensitive_categories: ['nghe-nhac'] }));
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('sensitive_categories');
  });

  test('từ chối khi khai nhóm nhạy cảm không phải mảng', () => {
    expect(errorFields(validateClip(sensitiveClip({ sensitive_categories: 'biometric' })))).toContain(
      'sensitive_categories',
    );
  });

  test('giọng người nhận dạng được thì bắt buộc khai nhóm sinh trắc học', () => {
    // Nghị định 356 Điều 4 khoản 1 điểm đ. Quên khai là mất luôn các nghĩa vụ
    // kèm theo — thông báo cho người ký, phân quyền truy cập.
    const result = validateClip(sensitiveClip({ sensitive_categories: ['religious_belief'] }));
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('sensitive_categories');
  });

  test('khai sinh trắc học mà lại bảo không có giọng người là mâu thuẫn', () => {
    const result = validateClip(
      sensitiveClip({ contains_identifiable_voice: false, sensitive_categories: ['biometric'] }),
    );
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('sensitive_categories');
  });

  test('dữ liệu nhạy cảm không bao giờ là "không cần đồng thuận"', () => {
    // Không phụ thuộc trạng thái: mâu thuẫn ngay từ lúc lên kế hoạch.
    const draft = planned({
      sensitive_categories: ['ethnic_origin'],
      consent_status: 'not_required',
    });
    const result = validateClip(draft);
    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('consent_status');
  });

  test('chưa xuất bản thì chưa đòi hai xác nhận thông báo', () => {
    const draft = planned({
      contains_identifiable_voice: true,
      sensitive_categories: ['biometric'],
      consent_status: 'pending',
    });
    expect(validateClip(draft).valid).toBe(true);
  });

  test('xuất bản mẫu nhạy cảm phải xác nhận đã nói rõ đây là dữ liệu nhạy cảm', () => {
    // Nghị định 356 Điều 6 khoản 4.
    const result = validateClip(sensitiveClip({ sensitive_notice_given: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors.find((e) => e.field === 'sensitive_notice_given').message).toMatch(
      /Điều 6 khoản 4/,
    );
  });

  test('xuất bản mẫu tự thu nhạy cảm phải xác nhận đã thông báo đang ghi âm', () => {
    // Luật 91/2025 Điều 32 khoản 2 — nghĩa vụ riêng, tồn tại kể cả khi Điều 32
    // cho phép ghi mà không cần đồng thuận.
    const result = validateClip(sensitiveClip({ recording_notice_given: undefined }));
    expect(result.valid).toBe(false);
    expect(result.errors.find((e) => e.field === 'recording_notice_given').message).toMatch(
      /Điều 32 khoản 2/,
    );
  });

  test('mẫu tải từ kho không bị đòi xác nhận đã thông báo tại chỗ', () => {
    // Không ai ra hiện trường thông báo hộ một tệp tải từ kho quốc tế được.
    const archived = sensitiveClip({
      provenance: 'licensed_archive',
      source_url: 'https://freesound.org/s/000000/',
      source_uploader: 'someone',
      downloaded_at: '2026-08-01T10:00:00+07:00',
      location_verified: false,
      recording_notice_given: undefined,
    });
    expect(errorFields(validateClip(archived))).not.toContain('recording_notice_given');
  });

  test('mẫu không nhạy cảm không bị đòi thêm gì', () => {
    expect(validateClip(published()).valid).toBe(true);
  });
});

describe('thẻ thông tin văn hoá (FR-26)', () => {
  const note =
    'Tiếng búa gõ bạc là âm của một nghề gắn chặt với một con phố: Hàng Bạc ' +
    'làm bạc từ thế kỷ 15. Số hộ còn gõ tay đang giảm dần khi máy thay người.';

  test('mẫu đã xuất bản mà thiếu cultural_note_vi thì không hợp lệ', () => {
    const result = validateClip(published({ cultural_note_vi: undefined }));

    expect(result.valid).toBe(false);
    expect(errorFields(result)).toContain('cultural_note_vi');
  });

  test('mẫu mới lên kế hoạch chưa cần thẻ văn hoá — nội dung viết ở việc VH2.1', () => {
    const result = validateClip(planned());

    expect(result.valid).toBe(true);
  });

  test('thẻ văn hoá quá ngắn bị coi là điền cho có', () => {
    const result = validateClip(published({ cultural_note_vi: 'Tiếng rao.' }));

    expect(result.valid).toBe(false);
    const error = result.errors.find((e) => e.field === 'cultural_note_vi');
    expect(error.message).toMatch(/đoạn giải thích/i);
  });

  test('thẻ văn hoá đủ dài thì hợp lệ', () => {
    const result = validateClip(published({ cultural_note_vi: note }));

    expect(result.valid).toBe(true);
  });

  test('bản tiếng Anh không bắt buộc, nhưng có thì cũng phải là đoạn giải thích', () => {
    const chiTiengViet = validateClip(published({ cultural_note_vi: note }));
    const anhCutNgan = validateClip(
      published({ cultural_note_vi: note, cultural_note_en: 'Hammering.' }),
    );

    expect(chiTiengViet.valid).toBe(true);
    expect(anhCutNgan.valid).toBe(false);
    expect(errorFields(anhCutNgan)).toContain('cultural_note_en');
  });

  test('tags phải là mảng chuỗi không rỗng, không trùng nhau', () => {
    const base = { cultural_note_vi: note };

    expect(validateClip(published({ ...base, tags: ['nghe-thu-cong', 'kim-loai'] })).valid).toBe(
      true,
    );
    expect(validateClip(published({ ...base, tags: 'nghe-thu-cong' })).valid).toBe(false);
    expect(validateClip(published({ ...base, tags: ['nghe-thu-cong', ''] })).valid).toBe(false);
    expect(
      validateClip(published({ ...base, tags: ['kim-loai', 'kim-loai'] })).valid,
    ).toBe(false);
  });
});
