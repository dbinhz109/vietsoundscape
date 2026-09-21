/**
 * Trích dẫn học thuật cho mẫu âm và cho bộ dữ liệu (FR-27).
 *
 * Hàm thuần, không đụng DOM — giao diện gọi rồi đưa vào ô sao chép. Hai dạng:
 * văn bản một dòng để dán vào báo cáo, và BibTeX để đưa vào trình quản lý tài
 * liệu tham khảo. FR-27 đòi có **mã băm SHA-256** của tệp — không có thì ghi
 * "chưa có", không bỏ trống, không bịa.
 *
 * Nguyên tắc: mọi trường thiếu đều nói thẳng là thiếu. Một trích dẫn trông đầy
 * đủ nhưng bịa năm hoặc bịa tác giả còn tệ hơn một trích dẫn thiếu.
 */

const PROJECT_AUTHOR = 'Nhóm đề tài VietSoundscape';
const PROJECT_TITLE = 'Bản đồ âm thanh Việt Nam';
const MISSING = 'chưa có';

/** Tên đầy đủ để in ra, ánh xạ từ mã trong `ALLOWED_LICENSES`. */
const LICENSE_NAME = Object.freeze({
  'CC0-1.0': 'CC0 1.0',
  'CC-BY-4.0': 'CC BY 4.0',
  'CC-BY-3.0': 'CC BY 3.0',
  'CC-BY-SA-4.0': 'CC BY-SA 4.0',
  'CC-BY-SA-3.0': 'CC BY-SA 3.0',
  'proprietary-own': 'nhóm tự thu, giữ toàn quyền',
});

const LICENSE_URL = Object.freeze({
  'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC-BY-SA-3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
});

const isMissing = (value) => value === undefined || value === null || value === '';

/** @param {string | undefined} code */
export function licenseName(code) {
  if (isMissing(code)) return MISSING;
  return LICENSE_NAME[code] ?? code;
}

/**
 * Liên kết tới toàn văn giấy phép. Mẫu tự thu giữ toàn quyền thì không có.
 * @param {string | undefined} code
 * @returns {string | null}
 */
export function licenseUrl(code) {
  if (isMissing(code)) return null;
  return LICENSE_URL[code] ?? null;
}

/**
 * Thoát ký tự BibTeX hiểu nhầm. Tiếng Việt giữ nguyên — BibTeX/biblatex hiện
 * đại đọc UTF-8, còn chuyển sang \'{e} thì không ai đọc nổi.
 * @param {string} value
 */
export function bibtexEscape(value) {
  return String(value).replace(/[\\{}&%$#_]/g, (char) => `\\${char}`);
}

const yearOf = (isoDate) => {
  if (isMissing(isoDate)) return null;
  const match = /^(\d{4})/.exec(String(isoDate));
  return match ? match[1] : null;
};

const bibKeyPart = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_');

/** @param {Record<string, string>} fields */
function bibtexEntry(type, key, fields) {
  const body = Object.entries(fields)
    .filter(([, value]) => !isMissing(value))
    .map(([name, value]) => `  ${name} = {${value}},`)
    .join('\n');
  return `@${type}{${key},\n${body}\n}\n`;
}

/**
 * Ai là tác giả của bản ghi: mẫu tải về thì là người tải lên kho, mẫu tự thu
 * thì là chủ quyền đã khai; không có gì thì là nhóm đề tài.
 */
function authorOf(clip) {
  if (clip.provenance === 'licensed_archive' && !isMissing(clip.source_uploader)) {
    return clip.source_uploader;
  }
  if (!isMissing(clip.rights_holder)) return clip.rights_holder;
  return PROJECT_AUTHOR;
}

/**
 * @param {object} clip mẫu âm theo `clip-schema.js`, ở bất kỳ trạng thái nào
 * @param {object} context
 * @param {string} context.datasetVersion `dataset_version` trong `clips.json`
 * @param {string} context.siteUrl gốc web công khai, có dấu "/" cuối
 * @param {string} context.accessed ngày truy cập, ISO `YYYY-MM-DD`
 * @returns {{ text: string, bibtex: string }}
 */
export function clipCitation(clip, { datasetVersion, siteUrl, accessed }) {
  const author = authorOf(clip);
  const year =
    yearOf(clip.recorded_at) ?? yearOf(clip.downloaded_at) ?? yearOf(accessed) ?? MISSING;
  const url = `${siteUrl}?location=${clip.location_id}`;
  const license = licenseName(clip.license);
  const sha = isMissing(clip.sha256) ? MISSING : clip.sha256;
  const contributor =
    !isMissing(clip.contributor) && clip.contributor !== author ? clip.contributor : null;
  const origin = clip.provenance === 'licensed_archive' && !isMissing(clip.source_url)
    ? clip.source_url
    : null;

  const textParts = [
    `${author}. ${year}. "${clip.title_vi}" [bản ghi âm${contributor ? `, người thu: ${contributor}` : ''}].`,
    `Trong ${PROJECT_TITLE}, bộ dữ liệu phiên bản ${datasetVersion}. ${url}.`,
    origin ? `Nguồn gốc: ${origin}.` : null,
    `Giấy phép: ${license}. SHA-256 ${sha}.`,
    `Truy cập ${accessed}.`,
  ];
  const text = textParts.filter(Boolean).join(' ');

  const notes = [
    `Giấy phép: ${license}`,
    `SHA-256: ${sha}`,
    origin ? `Nguồn gốc: ${origin}` : null,
    contributor ? `Người thu: ${contributor}` : null,
  ].filter(Boolean);

  const bibtex = bibtexEntry('misc', `vietsoundscape_${bibKeyPart(clip.id)}`, {
    title: `{${bibtexEscape(clip.title_vi)}}`,
    author: bibtexEscape(author),
    year,
    howpublished: `${bibtexEscape(PROJECT_TITLE)}, bộ dữ liệu phiên bản ${bibtexEscape(datasetVersion)}`,
    url,
    urldate: accessed,
    note: bibtexEscape(notes.join('. ')),
  });

  return { text, bibtex };
}

/**
 * Trích dẫn cho cả bộ dữ liệu. Metadata là CC0 1.0 theo `phap-ly/09`; từng
 * mẫu âm giữ giấy phép riêng và được trích dẫn riêng bằng `clipCitation`.
 *
 * @param {object} context
 * @param {string} context.datasetVersion
 * @param {string} context.siteUrl
 * @param {string} context.accessed
 * @param {number} context.clipCount
 * @param {string} [context.author]
 */
export function datasetCitation({ datasetVersion, siteUrl, accessed, clipCount, author = PROJECT_AUTHOR }) {
  const year = yearOf(accessed) ?? MISSING;
  const text =
    `${author}. ${year}. ${PROJECT_TITLE} — bộ dữ liệu mẫu âm, bản trộn và địa điểm, ` +
    `phiên bản ${datasetVersion} (${clipCount} mẫu âm). ${siteUrl}. ` +
    `Metadata: CC0 1.0; từng mẫu âm giữ giấy phép riêng. Truy cập ${accessed}.`;

  const bibtex = bibtexEntry('misc', `vietsoundscape_dataset_${bibKeyPart(datasetVersion)}`, {
    title: `{${bibtexEscape(PROJECT_TITLE)} — bộ dữ liệu}`,
    author: bibtexEscape(author),
    year,
    version: datasetVersion,
    url: siteUrl,
    urldate: accessed,
    note: bibtexEscape(`${clipCount} mẫu âm. Metadata CC0 1.0; từng mẫu âm giữ giấy phép riêng`),
  });

  return { text, bibtex };
}
