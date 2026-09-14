/**
 * Bộ kiểm lược đồ metadata cho mẫu âm (BA §8.2).
 *
 * Đây là chỗ các quyết định đã chốt trở thành **luật máy kiểm được**, không còn
 * là dòng chữ trong tài liệu. Ba luật quan trọng nhất:
 *   - Giấy phép NC bị cấm ở tầng dữ liệu (LG-03).
 *   - Mẫu tải về không được khai là đã xác minh nơi chốn (R-10).
 *   - Âm đã mất không thể do nhóm tự thu.
 *
 * Trường bắt buộc phụ thuộc `status`: mẫu mới lên kế hoạch chưa cần số đo, mẫu
 * đã xuất bản thì phải đủ. Nếu đòi đủ ngay từ đầu thì không lập kế hoạch được.
 */

import {
  ALLOWED_LICENSES,
  CLIP_STATUSES,
  CONSENT_OK_FOR_VOICE,
  CONSENT_STATUSES,
  ENDANGERMENT_LEVELS,
  KRAUSE_CLASSES,
  LOOPING_ROLES,
  PROVENANCE,
  SCHAFER_ROLES,
  SENSITIVE_CATEGORIES,
  TIMES_OF_DAY,
  VIETNAM_BOUNDS,
} from '../domain/taxonomy.js';

/** Trường bắt buộc ngay từ khi lên kế hoạch. */
const PLANNED_FIELDS = [
  'id',
  'status',
  'title_vi',
  'location_id',
  'krause_class',
  'schafer_role',
  'provenance',
  'endangerment_level',
];

/** Trường bắt buộc thêm khi đã xuất bản. */
const PUBLISHED_FIELDS = [
  'title_en',
  'lat',
  'lon',
  'recorded_at',
  'time_of_day',
  'device',
  'sample_rate',
  'channels',
  'duration_s',
  'loudness_lufs',
  'true_peak_dbtp',
  'license',
  'rights_holder',
  'consent_status',
  'sha256',
  'editing_log',
  'cultural_note_vi',
];

/**
 * Độ dài tối thiểu của thẻ văn hoá.
 *
 * FR-26 đòi "≥ 1 đoạn giải thích" cho mỗi mẫu âm, mà BA §8.2 lại để
 * `cultural_note_vi` là tuỳ chọn — hai chỗ không khớp nhau. Chốt theo FR-26:
 * bắt buộc **khi xuất bản**, còn lúc mới lên kế hoạch thì chưa cần, vì nội dung
 * là việc VH2.1 của lộ trình, viết sau khi đã thu được mẫu (sổ quyết định Q-24).
 *
 * Ngưỡng tồn tại để chặn chỗ điền cho có: một câu tiếng Việt nói được âm này là
 * gì và đang mai một ra sao hiếm khi ngắn hơn chừng này. Nó **không** thay được
 * việc đọc lại — chỉ chặn `"tiếng rao"` và `"chưa có"`.
 */
export const CULTURAL_NOTE_MIN_CHARS = 60;

const SHA256_PATTERN = /^[0-9a-f]{64}$/;
/** ISO 8601 phải có múi giờ: kết thúc bằng Z hoặc ±hh:mm. */
const TZ_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;
const NON_COMMERCIAL_PATTERN = /-NC(-|$)/i;

const isMissing = (value) => value === undefined || value === null || value === '';

/**
 * @typedef {{field: string, message: string}} ValidationError
 * @typedef {{valid: boolean, errors: ValidationError[]}} ValidationResult
 */

/**
 * @param {object} clip
 * @returns {ValidationResult}
 */
export function validateClip(clip) {
  /** @type {ValidationError[]} */
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  const isPublished = clip.status === 'published';

  for (const field of PLANNED_FIELDS) {
    if (isMissing(clip[field])) fail(field, `Thiếu trường bắt buộc "${field}".`);
  }
  if (isPublished) {
    for (const field of PUBLISHED_FIELDS) {
      if (isMissing(clip[field])) {
        fail(field, `Mẫu đã xuất bản phải có "${field}" (BA §8.2).`);
      }
    }
  }

  checkVocabulary(clip, fail);
  checkLicense(clip, fail, isPublished);
  checkProvenance(clip, fail);
  checkConsent(clip, fail, isPublished);
  checkSensitiveData(clip, fail, isPublished);
  checkPublishedShape(clip, fail, isPublished);
  checkCulturalNote(clip, fail);

  return { valid: errors.length === 0, errors };
}

function checkVocabulary(clip, fail) {
  const vocabularies = [
    ['status', CLIP_STATUSES],
    ['krause_class', KRAUSE_CLASSES],
    ['schafer_role', SCHAFER_ROLES],
    ['provenance', PROVENANCE],
    ['endangerment_level', ENDANGERMENT_LEVELS],
    ['consent_status', CONSENT_STATUSES],
  ];

  for (const [field, allowed] of vocabularies) {
    const value = clip[field];
    if (!isMissing(value) && !allowed.includes(value)) {
      fail(field, `"${value}" không thuộc từ vựng cho phép: ${allowed.join(', ')}.`);
    }
  }

  if (!isMissing(clip.time_of_day) && !TIMES_OF_DAY.includes(clip.time_of_day)) {
    fail('time_of_day', `"${clip.time_of_day}" không thuộc: ${TIMES_OF_DAY.join(', ')}.`);
  }
}

/**
 * Thẻ thông tin văn hoá (FR-26).
 *
 * Nửa "mức độ mai một dùng từ vựng có kiểm soát" của FR-26 đã do
 * `endangerment_level` lo. Nửa còn lại — đoạn giải thích — là chỗ này.
 */
function checkCulturalNote(clip, fail) {
  for (const field of ['cultural_note_vi', 'cultural_note_en']) {
    const note = clip[field];
    if (isMissing(note)) continue; // thiếu hay không đã xét ở phần trường bắt buộc

    if (typeof note !== 'string') {
      fail(field, `"${field}" phải là chuỗi, nhận được ${typeof note}.`);
      continue;
    }
    if (note.trim().length < CULTURAL_NOTE_MIN_CHARS) {
      fail(
        field,
        `Thẻ văn hoá đang có ${note.trim().length} ký tự. FR-26 đòi một đoạn giải thích ` +
          `(≥ ${CULTURAL_NOTE_MIN_CHARS} ký tự): âm này là gì, ý nghĩa, đang mai một ra sao.`,
      );
    }
  }

  const { tags } = clip;
  if (isMissing(tags)) return;

  if (!Array.isArray(tags)) {
    fail('tags', `"tags" phải là mảng chuỗi, nhận được ${typeof tags}.`);
    return;
  }
  if (tags.some((tag) => typeof tag !== 'string' || tag.trim() === '')) {
    fail('tags', 'Mọi thẻ trong "tags" phải là chuỗi không rỗng.');
    return; // các luật dưới đều giả định mọi thẻ là chuỗi
  }

  const thua = tags.filter((tag) => tag !== tag.trim());
  if (thua.length > 0) {
    fail(
      'tags',
      `Thẻ có khoảng trắng thừa ở đầu hoặc cuối: ${thua.map((t) => `"${t}"`).join(', ')}. ` +
        'Bỏ khoảng trắng đi — thẻ được so khớp nguyên văn khi lọc.',
    );
  }

  // So khớp sau khi chuẩn hoá, không so nguyên văn. Thẻ do người điền tay ở việc
  // VH2.1, nên " giao-thong " và "Giao-Thong" sẽ thành ba thẻ khác nhau cho cùng
  // một thứ, và bộ lọc theo thẻ (FR-03) chia nhỏ kết quả mà không ai hiểu vì sao.
  const chuanHoa = tags.map((tag) => tag.trim().toLowerCase());
  if (new Set(chuanHoa).size !== chuanHoa.length) {
    fail('tags', 'Có thẻ trùng nhau trong "tags" (không phân biệt hoa thường và khoảng trắng).');
  }
}

function checkLicense(clip, fail, isPublished) {
  const { license } = clip;
  if (isMissing(license)) return; // đã báo ở phần trường bắt buộc nếu cần

  if (NON_COMMERCIAL_PATTERN.test(license)) {
    fail(
      'license',
      `Giấy phép "${license}" là phi thương mại (NC). Không dùng được: NC chặn luôn ` +
        'giá trị quảng bá du lịch mà đề tài đã nêu (BA LG-03). Tìm bản CC0 hoặc CC BY thay thế.',
    );
    return;
  }
  if (!ALLOWED_LICENSES.includes(license)) {
    fail('license', `Giấy phép "${license}" không nằm trong danh sách cho phép: ${ALLOWED_LICENSES.join(', ')}.`);
  }
  if (isPublished && isMissing(clip.rights_holder)) {
    fail('rights_holder', 'Đã xuất bản thì phải ghi rõ chủ quyền.');
  }
}

function checkProvenance(clip, fail) {
  const fromArchive = clip.provenance === 'licensed_archive';
  // Ở trạng thái kế hoạch thì chưa đi khảo sát kho (việc A0.1b của lộ trình),
  // nên chưa thể có đường dẫn nguồn. Từ khi mẫu đã thu thập về thì bắt buộc.
  const isCollected = clip.status !== undefined && clip.status !== 'planned';

  if (fromArchive) {
    if (isCollected) {
      for (const field of ['source_url', 'source_uploader', 'downloaded_at']) {
        if (isMissing(clip[field])) {
          fail(field, `Mẫu lấy từ kho phải có "${field}" để truy vết giấy phép (BA §5.4.1).`);
        }
      }
    }
    if (clip.must_verify_on_site === true) {
      fail(
        'must_verify_on_site',
        'Mẫu lấy từ kho không thể đánh dấu bắt buộc xác minh tại chỗ — không ai ra hiện ' +
          'trường xác minh được một tệp tải từ kho quốc tế.',
      );
    }
    if (clip.location_verified === true) {
      fail(
        'location_verified',
        'Mẫu lấy từ kho không thể khai là đã xác minh nơi chốn: một tệp gắn nhãn ' +
          '"chợ nổi Việt Nam" có thể được thu ở nơi khác và không có cách nào kiểm chứng (BA R-10).',
      );
    }
  }

  if (clip.endangerment_level === 'lost' && clip.provenance === 'field_recording') {
    fail(
      'provenance',
      'Âm đã ở mức "lost" thì không còn tồn tại để thu tại chỗ — nguồn duy nhất là kho lưu trữ.',
    );
  }
}

/**
 * Đồng thuận và quyền — biến quy trình pháp lý ở `phap-ly/` thành luật máy kiểm.
 *
 * Ba luật, ứng với ba rủi ro khác nhau:
 *   - **LG-04:** mẫu đã bị rút thì không bao giờ xuất bản được. Chặn ở đây để
 *     không còn đường nào lọt ra công khai.
 *   - **LG-01:** giọng người nhận dạng được (tiếng rao, tụng kinh) cần đồng thuận
 *     bằng văn bản trước khi xuất bản.
 *   - **LG-02:** biểu đạt văn hoá truyền thống (cồng chiêng, ca Huế) là di sản
 *     của **cộng đồng**, không phải tài sản của người ghi âm hay một nghệ nhân
 *     đơn lẻ — nên đồng thuận cá nhân là chưa đủ.
 */
function checkConsent(clip, fail, isPublished) {
  const { consent_status: consent } = clip;

  if (consent === 'withdrawn' && isPublished) {
    fail(
      'consent_status',
      'Mẫu đã có yêu cầu rút thì không được xuất bản. Xem quy trình tại ' +
        'phap-ly/04-quy-trinh-yeu-cau-xoa.md (LG-04).',
    );
    return;
  }

  if (!isPublished) return;

  if (clip.cultural_expression === true) {
    if (consent !== 'community_agreed') {
      fail(
        'consent_status',
        'Đây là biểu đạt văn hoá truyền thống — di sản của **cộng đồng chủ thể**, không phải ' +
          'tài sản của người ghi âm. Cần thoả thuận cộng đồng (`community_agreed`), đồng thuận ' +
          'cá nhân là chưa đủ. Mẫu văn bản: phap-ly/02-thoa-thuan-ghi-cong-cong-dong.md (LG-02).',
      );
    }
    if (isMissing(clip.community_credit)) {
      fail(
        'community_credit',
        'Biểu đạt văn hoá phải ghi công cộng đồng chủ thể (tên buôn/làng/nhóm nghệ nhân).',
      );
    }
  } else if (clip.contains_identifiable_voice === true && !CONSENT_OK_FOR_VOICE.includes(consent)) {
    fail(
      'consent_status',
      `Mẫu có giọng người nhận dạng được nhưng trạng thái đồng thuận là "${consent}". ` +
        'Phải có đồng thuận bằng văn bản trước khi xuất bản. Mẫu phiếu: ' +
        'phap-ly/01-phieu-dong-thuan-ghi-am.md (LG-01).',
    );
  }
}

/**
 * Dữ liệu cá nhân nhạy cảm — Nghị định 356/2025/NĐ-CP Điều 4 khoản 1 (LG-01c).
 *
 * Sáu mẫu của đề tài rơi vào diện này, và **không phải qua tranh cãi "giọng nói
 * có phải sinh trắc học không"**: tụng kinh vào điểm b (tôn giáo), cồng chiêng và
 * đàn t'rưng vào điểm a (nguồn gốc dân tộc). Hai đường đó không cãi được. Xem
 * `phap-ly/08-can-cu-phap-ly.md` §4.2.
 *
 * Hai xác nhận bắt buộc trước khi xuất bản là hai nghĩa vụ **riêng biệt**, dễ
 * nhầm là một:
 *   - `sensitive_notice_given`  — đã nói với người ký rằng đây là dữ liệu nhạy
 *     cảm (Nghị định 356 Điều 6 khoản 4). Gắn với việc **xin đồng thuận**.
 *   - `recording_notice_given`  — đã cho người có mặt biết mình đang bị ghi âm
 *     (Luật Điều 32 khoản 2). Tồn tại **kể cả khi không cần đồng thuận**, nên
 *     không suy ra được từ `consent_status`.
 */
function checkSensitiveData(clip, fail, isPublished) {
  const declared = clip.sensitive_categories;
  if (declared !== undefined && !Array.isArray(declared)) {
    fail('sensitive_categories', 'Nhóm dữ liệu nhạy cảm phải khai bằng mảng, kể cả khi chỉ có một nhóm.');
    return;
  }

  const categories = declared ?? [];
  const unknown = categories.filter((value) => !SENSITIVE_CATEGORIES.includes(value));
  if (unknown.length > 0) {
    fail(
      'sensitive_categories',
      `${unknown.map((v) => `"${v}"`).join(', ')} không thuộc từ vựng cho phép: ` +
        `${SENSITIVE_CATEGORIES.join(', ')} (Nghị định 356/2025/NĐ-CP Điều 4 khoản 1, điểm a/b/đ).`,
    );
    return;
  }

  const hasVoice = clip.contains_identifiable_voice === true;
  const claimsBiometric = categories.includes('biometric');

  if (hasVoice && !claimsBiometric) {
    fail(
      'sensitive_categories',
      'Mẫu có giọng người nhận dạng được thì phải khai nhóm "biometric" (Nghị định 356 ' +
        'Điều 4 khoản 1 điểm đ). Quên khai là mất luôn các nghĩa vụ kèm theo: nói rõ với ' +
        'người ký rằng dữ liệu là nhạy cảm, và phân quyền giới hạn truy cập.',
    );
  }
  if (claimsBiometric && !hasVoice) {
    fail(
      'sensitive_categories',
      'Khai nhóm "biometric" nhưng `contains_identifiable_voice` không phải true — hai ' +
        'trường mâu thuẫn. Sửa một trong hai, đừng để lệch.',
    );
  }

  if (categories.length === 0) return;

  // Mâu thuẫn ngay từ lúc lên kế hoạch, không đợi tới khi xuất bản: dữ liệu
  // nhạy cảm luôn cần đồng thuận — Luật Điều 19 không có ngoại lệ nào cho
  // nghiên cứu khoa học (phap-ly/08 §6).
  if (clip.consent_status === 'not_required') {
    fail(
      'consent_status',
      'Mẫu chứa dữ liệu cá nhân nhạy cảm thì không thể là "không cần đồng thuận". ' +
        'Luật Điều 19 không có ngoại lệ cho nghiên cứu khoa học.',
    );
  }

  if (!isPublished) return;

  if (clip.sensitive_notice_given !== true) {
    fail(
      'sensitive_notice_given',
      'Trước khi xuất bản phải xác nhận đã nói rõ với người đồng thuận rằng dữ liệu cần ' +
        'xử lý là **dữ liệu cá nhân nhạy cảm** — Nghị định 356/2025/NĐ-CP Điều 6 khoản 4. ' +
        'Ô đánh dấu ở mục 5 phiếu phap-ly/01-phieu-dong-thuan-ghi-am.md.',
    );
  }

  // Chỉ áp cho mẫu tự thu: không ai ra hiện trường thông báo hộ một tệp tải về.
  if (clip.provenance === 'field_recording' && clip.recording_notice_given !== true) {
    fail(
      'recording_notice_given',
      'Trước khi xuất bản phải xác nhận đã thông báo cho người có mặt biết đang bị ghi âm — ' +
        'Luật 91/2025/QH15 Điều 32 khoản 2. Đây là nghĩa vụ riêng, tồn tại kể cả khi Điều 32 ' +
        'cho phép ghi mà không cần đồng thuận. Cách làm ở phap-ly/05-nhat-ky-thuc-dia.md.',
    );
  }
}

function checkPublishedShape(clip, fail, isPublished) {
  if (!isMissing(clip.sha256) && !SHA256_PATTERN.test(clip.sha256)) {
    fail('sha256', 'Mã băm phải là 64 ký tự hex thường.');
  }

  if (!isMissing(clip.recorded_at) && !TZ_PATTERN.test(clip.recorded_at)) {
    fail(
      'recorded_at',
      'Thời điểm thu phải có múi giờ (ISO 8601, ví dụ 2026-09-14T05:30:00+07:00). ' +
        '"5 giờ sáng" không có múi giờ thì không xác định được, mà chợ 5 giờ sáng ' +
        'là một soundscape khác hẳn chợ 5 giờ chiều.',
    );
  }

  for (const [field, min, max] of [
    ['lat', VIETNAM_BOUNDS.latMin, VIETNAM_BOUNDS.latMax],
    ['lon', VIETNAM_BOUNDS.lonMin, VIETNAM_BOUNDS.lonMax],
  ]) {
    const value = clip[field];
    if (!isMissing(value) && (value < min || value > max)) {
      fail(field, `Toạ độ ${field}=${value} nằm ngoài khung Việt Nam (${min}…${max}).`);
    }
  }

  if (isPublished && LOOPING_ROLES.includes(clip.schafer_role)) {
    for (const field of ['loop_start_s', 'loop_end_s']) {
      if (isMissing(clip[field])) {
        fail(field, 'Lớp âm nền phải có điểm loop đã tính, nếu không sẽ nghe ra chỗ nối (FR-14).');
      }
    }
  }
}

/**
 * Kiểm cả bộ dữ liệu: từng mẫu, cộng thêm các luật ở mức tập hợp.
 *
 * @param {object[]} clips
 * @returns {ValidationResult & {byClip: Record<string, ValidationError[]>}}
 */
export function validateDataset(clips) {
  /** @type {ValidationError[]} */
  const errors = [];
  /** @type {Record<string, ValidationError[]>} */
  const byClip = {};

  const seen = new Set();
  for (const clip of clips) {
    const result = validateClip(clip);
    byClip[clip.id] = result.errors;
    errors.push(...result.errors.map((e) => ({ ...e, id: clip.id })));

    if (seen.has(clip.id)) {
      const error = { field: 'id', message: `Mẫu "${clip.id}" bị trùng mã trong bộ dữ liệu.` };
      errors.push({ ...error, id: clip.id });
      byClip[clip.id].push(error);
    }
    seen.add(clip.id);
  }

  return { valid: errors.length === 0, errors, byClip };
}
