/**
 * Thẻ chi tiết mẫu âm (FR-25) và ghi công (A7.1, `phap-ly/09` "Ghi công thế nào").
 *
 * Tiêu chí FR-25: **100% trường bắt buộc ở BA §8.2 hiển thị hoặc ghi rõ "không
 * có"**. Nên hàng nào thiếu vẫn có mặt, mang chữ "chưa có" và một lớp CSS để
 * nhìn ra — không giấu, không bịa. Kèm trích dẫn FR-27 với hai nút sao chép.
 *
 * Toàn bộ dựng bằng `textContent`, không `innerHTML`: tên người tải lên và tên
 * chủ quyền là dữ liệu bên ngoài.
 */

import { clipCitation, licenseName, licenseUrl } from '../../data/citation.js';
import { effectiveMixLicense } from '../../data/recipe-schema.js';
import {
  CONSENT_LABEL,
  ENDANGERMENT_LABEL,
  PROVENANCE_LABEL,
  TIME_OF_DAY_LABEL,
  labelOf,
} from '../../domain/labels.js';

const MISSING = 'chưa có';
const isMissing = (value) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);

/** Số kiểu Việt: dấu phẩy thập phân, dấu trừ thật. */
const vn = (value) => String(value).replace('.', ',').replace(/^-/, '−');

/**
 * Chỉ dựng liên kết cho http(s). `source_url` là dữ liệu người đóng góp điền;
 * một dòng `javascript:` lọt vào `clips.json` phải hiện ra là chữ, không phải
 * nút bấm được.
 * @param {unknown} href
 * @returns {string | null}
 */
const safeHref = (href) => (typeof href === 'string' && /^https?:\/\//i.test(href) ? href : null);

const row = (label, value, { href = null, missing = isMissing(value) } = {}) => ({
  label,
  value: missing ? MISSING : String(value),
  missing,
  href: missing ? null : safeHref(href),
});

function sourceRow(clip) {
  if (clip.provenance === 'licensed_archive') {
    const uploader = isMissing(clip.source_uploader) ? MISSING : clip.source_uploader;
    return row(
      'Nguồn',
      `${PROVENANCE_LABEL.licensed_archive} — người tải lên: ${uploader}`,
      { href: clip.source_url ?? null, missing: isMissing(clip.source_url) },
    );
  }
  return row('Nguồn', labelOf(PROVENANCE_LABEL, clip.provenance));
}

function deviceRow(clip) {
  const parts = [clip.device, clip.sample_rate, clip.channels, clip.duration_s];
  if (parts.some(isMissing)) return row('Thiết bị', null);
  return row(
    'Thiết bị',
    `${clip.device} · ${clip.sample_rate} Hz · ${clip.channels} kênh · ${vn(clip.duration_s)} s`,
  );
}

function loudnessRow(clip) {
  if (isMissing(clip.loudness_lufs) || isMissing(clip.true_peak_dbtp)) return row('Độ to', null);
  return row('Độ to', `${vn(clip.loudness_lufs)} LUFS · đỉnh ${vn(clip.true_peak_dbtp)} dBTP`);
}

function recordedRow(clip) {
  if (isMissing(clip.recorded_at)) return row('Thu lúc', null);
  const when = isMissing(clip.time_of_day) ? '' : ` (${labelOf(TIME_OF_DAY_LABEL, clip.time_of_day)})`;
  return row('Thu lúc', `${clip.recorded_at}${when}`);
}

/**
 * Các hàng FR-25 cho một mẫu âm, theo thứ tự người đọc cần: ai, quyền gì, rồi
 * mới tới kỹ thuật.
 * @param {object} clip
 * @returns {Array<{ label: string, value: string, missing: boolean, href: string | null }>}
 */
export function describeClip(clip) {
  const rows = [
    sourceRow(clip),
    row('Chủ quyền', clip.rights_holder),
    row('Người thu', clip.contributor),
  ];
  if (clip.cultural_expression) rows.push(row('Cộng đồng chủ thể', clip.community_credit));
  rows.push(
    row('Giấy phép', isMissing(clip.license) ? null : licenseName(clip.license), {
      href: licenseUrl(clip.license),
    }),
    row('Đồng thuận', isMissing(clip.consent_status) ? null : labelOf(CONSENT_LABEL, clip.consent_status)),
    recordedRow(clip),
    deviceRow(clip),
    loudnessRow(clip),
    row(
      'Xác minh tại chỗ',
      clip.location_verified
        ? 'đã xác minh — nhóm tự thu tại chỗ'
        : 'chưa xác minh — nơi thu không kiểm được',
    ),
    row('Mức mai một', isMissing(clip.endangerment_level) ? null : labelOf(ENDANGERMENT_LABEL, clip.endangerment_level)),
    row('SHA-256', clip.sha256),
    row('Đã chỉnh sửa', Array.isArray(clip.editing_log) ? clip.editing_log.join('; ') : clip.editing_log),
  );
  return rows;
}

function externalLink(href, text) {
  const link = document.createElement('a');
  link.href = href;
  link.textContent = text;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

/**
 * Sao chép có đường lùi: clipboard bị chặn (HTTP, iframe, quyền) thì mở ô văn
 * bản đã chọn sẵn để người dùng Ctrl+C. Không nuốt lỗi — thanh trạng thái nói
 * rõ đang ở đường nào.
 *
 * Hai nút dùng chung một thanh trạng thái và một ô lùi, nên mỗi lượt bấm mang
 * một số thứ tự: lượt nào không còn là lượt mới nhất khi xong thì bỏ, để cú
 * bấm sau không bị cú bấm trước (xong muộn) ghi đè.
 */
function createCopier({ status, fallback }) {
  let latest = 0;
  return async function copyWithFallback(text, label) {
    const ticket = ++latest;
    const clipboard = globalThis.navigator?.clipboard;
    try {
      if (!clipboard?.writeText) throw new Error('Trình duyệt không cho sao chép tự động');
      await clipboard.writeText(text);
      if (ticket !== latest) return;
      fallback.hidden = true;
      status.textContent = `Đã sao chép ${label}`;
    } catch (error) {
      if (ticket !== latest) return;
      fallback.value = text;
      fallback.hidden = false;
      fallback.select?.();
      status.textContent = `Không sao chép tự động được (${error.message}) — ô dưới đã chọn sẵn, sao chép tay bằng Ctrl+C`;
    }
  };
}

/**
 * @param {object} clip
 * @param {{ datasetVersion: string, siteUrl: string, accessed: string }} context cho trích dẫn
 * @returns {HTMLDetailsElement}
 */
export function createClipDetails(clip, context) {
  const details = document.createElement('details');
  details.className = 'clip-details';

  const summary = document.createElement('summary');
  summary.textContent = 'Nguồn, giấy phép và trích dẫn';
  details.append(summary);

  const list = document.createElement('dl');
  list.className = 'clip-facts';
  for (const fact of describeClip(clip)) {
    const term = document.createElement('dt');
    term.textContent = fact.label;
    const value = document.createElement('dd');
    if (fact.missing) value.className = 'fact-missing';
    if (fact.href) value.append(externalLink(fact.href, fact.value));
    else value.textContent = fact.value;
    list.append(term, value);
  }
  details.append(list);

  const { text, bibtex } = clipCitation(clip, context);
  const citation = document.createElement('div');
  citation.className = 'citation';

  const heading = document.createElement('h4');
  heading.textContent = 'Trích dẫn';
  const shown = document.createElement('p');
  shown.className = 'citation-text';
  shown.textContent = text;

  const status = document.createElement('output');
  status.className = 'citation-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  const fallback = document.createElement('textarea');
  fallback.className = 'citation-fallback';
  fallback.readOnly = true;
  fallback.rows = 6;
  fallback.hidden = true;
  fallback.setAttribute('aria-label', 'Trích dẫn để sao chép tay');

  const copy = createCopier({ status, fallback });
  const button = (label, payload, name) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'citation-button';
    el.textContent = label;
    el.addEventListener('click', () => copy(payload, name));
    return el;
  };

  citation.append(
    heading,
    shown,
    button('Sao chép trích dẫn', text, 'trích dẫn'),
    button('Sao chép BibTeX', bibtex, 'BibTeX'),
    status,
    fallback,
  );
  details.append(citation);
  return details;
}

/**
 * Giấy phép hiệu lực của cả bản trộn — `phap-ly/09` đòi hiển thị cùng giấy
 * phép từng lớp, và cảnh báo khi SA của tệp tải về lây sang lớp tự thu.
 * @param {object} recipe
 * @param {Record<string, object>} clipsById
 * @returns {HTMLParagraphElement}
 */
export function createMixLicenseNote(recipe, clipsById) {
  const result = effectiveMixLicense(recipe, clipsById);
  const note = document.createElement('p');
  note.className = 'mix-license';

  if (!result.license) {
    note.textContent = `Giấy phép bản trộn: chưa xác định. ${result.warnings.join(' ')}`;
    return note;
  }

  note.append('Giấy phép hiệu lực của bản trộn: ');
  const href = licenseUrl(result.license);
  const name = licenseName(result.license);
  note.append(href ? externalLink(href, name) : name);

  const perLayer = Object.entries(result.layerLicenses)
    .map(([id, code]) => `${id}: ${licenseName(code)}`)
    .join(' · ');
  note.append(` — từng lớp: ${perLayer}.`);

  for (const warning of result.warnings) {
    const warn = document.createElement('span');
    warn.className = 'mix-license-warn';
    warn.textContent = ` ${warning}`;
    note.append(warn);
  }
  return note;
}
