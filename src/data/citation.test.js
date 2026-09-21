import { describe, expect, test } from 'vitest';
import { bibtexEscape, clipCitation, datasetCitation, licenseUrl } from './citation.js';

const CONTEXT = {
  datasetVersion: '0.3.0',
  siteUrl: 'https://dbinhz109.github.io/vietsoundscape/',
  accessed: '2026-09-21',
};

const published = {
  id: 'HN-04',
  title_vi: 'Tiếng rao đêm',
  title_en: 'Night street vendor call',
  location_id: 'hanoi-pho-co',
  provenance: 'field_recording',
  license: 'CC-BY-4.0',
  rights_holder: 'Nhóm đề tài VietSoundscape',
  contributor: 'Nguyễn Văn A',
  recorded_at: '2026-10-03T21:15:00+07:00',
  sha256: 'a'.repeat(64),
};

const archive = {
  id: 'CR-08',
  title_vi: 'Mưa rào trên sông',
  location_id: 'cai-rang',
  provenance: 'licensed_archive',
  license: 'CC0-1.0',
  source_url: 'https://freesound.org/people/x/sounds/135821/',
  source_uploader: 'x',
  downloaded_at: '2026-09-21T10:00:00+07:00',
};

const planned = {
  id: 'HN-01',
  title_vi: 'Rì rầm xe máy trong phố hẹp',
  location_id: 'hanoi-pho-co',
  provenance: 'licensed_archive',
};

describe('clipCitation — mẫu đã xuất bản', () => {
  const { text, bibtex } = clipCitation(published, CONTEXT);

  test('văn bản có đủ tác giả, năm, tên, giấy phép và mã băm', () => {
    expect(text).toContain('Nhóm đề tài VietSoundscape');
    expect(text).toContain('2026');
    expect(text).toContain('Tiếng rao đêm');
    expect(text).toContain('Giấy phép: CC BY 4.0');
    expect(text).toContain(`SHA-256 ${'a'.repeat(64)}`);
  });

  test('văn bản trỏ về địa điểm trên web công khai', () => {
    expect(text).toContain('https://dbinhz109.github.io/vietsoundscape/?location=hanoi-pho-co');
  });

  test('BibTeX là một mục @misc có khoá ổn định theo mã mẫu', () => {
    expect(bibtex.startsWith('@misc{vietsoundscape_hn_04,')).toBe(true);
    expect(bibtex.trimEnd().endsWith('}')).toBe(true);
  });

  test('BibTeX có đủ trường FR-27 đòi: title, author, year, url, note với SHA-256', () => {
    expect(bibtex).toMatch(/title\s*=\s*\{\{Tiếng rao đêm\}\}/);
    expect(bibtex).toMatch(/author\s*=\s*\{Nhóm đề tài VietSoundscape\}/);
    expect(bibtex).toMatch(/year\s*=\s*\{2026\}/);
    expect(bibtex).toMatch(/url\s*=\s*\{https:\/\/dbinhz109\.github\.io\/vietsoundscape\/\?location=hanoi-pho-co\}/);
    expect(bibtex).toMatch(/note\s*=\s*\{[^}]*SHA-256: a{64}/);
    expect(bibtex).toMatch(/urldate\s*=\s*\{2026-09-21\}/);
  });

  test('ghi người thu khi khác chủ quyền', () => {
    expect(text).toContain('Nguyễn Văn A');
  });
});

describe('clipCitation — mẫu tải từ kho', () => {
  const { text, bibtex } = clipCitation(archive, CONTEXT);

  test('tác giả là người tải lên kho, năm lấy từ ngày tải', () => {
    expect(text.startsWith('x.')).toBe(true);
    expect(bibtex).toMatch(/year\s*=\s*\{2026\}/);
  });

  test('nguồn gốc trên kho được ghi trong note để truy vết (BA §5.4.1 quy tắc 4)', () => {
    expect(text).toContain('https://freesound.org/people/x/sounds/135821/');
    expect(bibtex).toMatch(/note\s*=\s*\{[^}]*Nguồn gốc: https:\/\/freesound\.org/);
  });

  test('CC0 được viết tên đầy đủ', () => {
    expect(text).toContain('CC0 1.0');
  });
});

describe('clipCitation — mẫu mới lên kế hoạch', () => {
  const { text, bibtex } = clipCitation(planned, CONTEXT);

  test('không bịa: giấy phép, mã băm, tác giả đều ghi rõ "chưa có"', () => {
    expect(text).toContain('Giấy phép: chưa có');
    expect(text).toContain('SHA-256 chưa có');
    expect(bibtex).toMatch(/note\s*=\s*\{[^}]*SHA-256: chưa có/);
  });

  test('tác giả rơi về nhóm đề tài, năm rơi về năm truy cập', () => {
    expect(bibtex).toMatch(/author\s*=\s*\{Nhóm đề tài VietSoundscape\}/);
    expect(bibtex).toMatch(/year\s*=\s*\{2026\}/);
  });
});

describe('datasetCitation', () => {
  const { text, bibtex } = datasetCitation({ ...CONTEXT, clipCount: 32 });

  test('trích dẫn cả bộ dữ liệu có phiên bản và số mẫu', () => {
    expect(text).toContain('phiên bản 0.3.0');
    expect(text).toContain('32 mẫu âm');
    expect(bibtex).toMatch(/version\s*=\s*\{0\.3\.0\}/);
    expect(bibtex.startsWith('@misc{vietsoundscape_dataset_0_3_0,')).toBe(true);
  });

  test('metadata là CC0 theo phap-ly/09', () => {
    expect(text).toContain('CC0 1.0');
  });
});

describe('bibtexEscape', () => {
  test('thoát các ký tự BibTeX hiểu nhầm, giữ nguyên tiếng Việt', () => {
    expect(bibtexEscape('Hàng Bạc & Hàng_Bồ 100% #1 {x}')).toBe(
      'Hàng Bạc \\& Hàng\\_Bồ 100\\% \\#1 \\{x\\}',
    );
  });
});

describe('licenseUrl', () => {
  test('trỏ tới toàn văn giấy phép Creative Commons', () => {
    expect(licenseUrl('CC0-1.0')).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
    expect(licenseUrl('CC-BY-4.0')).toBe('https://creativecommons.org/licenses/by/4.0/');
    expect(licenseUrl('CC-BY-SA-3.0')).toBe('https://creativecommons.org/licenses/by-sa/3.0/');
  });

  test('mẫu tự thu giữ toàn quyền thì không có liên kết', () => {
    expect(licenseUrl('proprietary-own')).toBeNull();
    expect(licenseUrl(undefined)).toBeNull();
  });
});
