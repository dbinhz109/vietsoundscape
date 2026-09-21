// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createClipDetails, createMixLicenseNote, describeClip } from './clip-details.js';

const CONTEXT = { datasetVersion: '0.3.0', siteUrl: 'https://x.test/', accessed: '2026-09-21' };

const planned = {
  id: 'HN-01',
  title_vi: 'Rì rầm xe máy trong phố hẹp',
  location_id: 'hanoi-pho-co',
  krause_class: 'anthrophony',
  schafer_role: 'keynote',
  provenance: 'licensed_archive',
  endangerment_level: 'declining',
  location_verified: false,
  consent_status: 'not_required',
};

const published = {
  id: 'TN-05',
  title_vi: 'Cồng chiêng trong lễ',
  location_id: 'buon-e-de',
  krause_class: 'anthrophony',
  schafer_role: 'soundmark',
  provenance: 'field_recording',
  endangerment_level: 'critical',
  location_verified: true,
  license: 'CC-BY-4.0',
  rights_holder: 'Buôn Akô Dhông',
  contributor: 'Nguyễn Văn A',
  consent_status: 'community_agreed',
  cultural_expression: true,
  community_credit: 'Đội chiêng buôn Akô Dhông',
  recorded_at: '2026-11-02T17:40:00+07:00',
  time_of_day: 'evening',
  device: 'Zoom H1n',
  sample_rate: 48000,
  channels: 2,
  duration_s: 84.2,
  loudness_lufs: -23,
  true_peak_dbtp: -2.4,
  sha256: 'b'.repeat(64),
  editing_log: ['cắt 0–3 s', 'chuẩn hoá −23 LUFS'],
};

const archive = {
  ...planned,
  license: 'CC0-1.0',
  source_url: 'https://freesound.org/s/451508/',
  source_uploader: 'someone',
  downloaded_at: '2026-09-21T09:00:00+07:00',
};

describe('describeClip — FR-25: mọi trường bắt buộc hiển thị hoặc ghi rõ "chưa có"', () => {
  test('mẫu mới lên kế hoạch: mọi hàng vẫn có, hàng thiếu được đánh dấu', () => {
    const rows = describeClip(planned);
    const labels = rows.map((r) => r.label);
    for (const need of ['Nguồn', 'Chủ quyền', 'Giấy phép', 'Đồng thuận', 'Thu lúc', 'Thiết bị', 'Độ to', 'SHA-256', 'Xác minh tại chỗ', 'Mức mai một', 'Đã chỉnh sửa']) {
      expect(labels, `thiếu hàng "${need}"`).toContain(need);
    }
    const license = rows.find((r) => r.label === 'Giấy phép');
    expect(license.missing).toBe(true);
    expect(license.value).toBe('chưa có');
    expect(rows.find((r) => r.label === 'SHA-256').missing).toBe(true);
  });

  test('mẫu đã xuất bản: không hàng nào thiếu, giấy phép có liên kết toàn văn', () => {
    const rows = describeClip(published);
    expect(rows.filter((r) => r.missing)).toEqual([]);
    const license = rows.find((r) => r.label === 'Giấy phép');
    expect(license.value).toBe('CC BY 4.0');
    expect(license.href).toBe('https://creativecommons.org/licenses/by/4.0/');
  });

  test('cộng đồng chủ thể chỉ hiện với biểu đạt văn hoá, và là bắt buộc khi đó', () => {
    expect(describeClip(planned).some((r) => r.label === 'Cộng đồng chủ thể')).toBe(false);
    const row = describeClip(published).find((r) => r.label === 'Cộng đồng chủ thể');
    expect(row.value).toBe('Đội chiêng buôn Akô Dhông');
    const noCredit = describeClip({ ...published, community_credit: null });
    expect(noCredit.find((r) => r.label === 'Cộng đồng chủ thể').missing).toBe(true);
  });

  test('mẫu tải từ kho: nguồn ghi người tải lên và liên kết về trang gốc', () => {
    const source = describeClip(archive).find((r) => r.label === 'Nguồn');
    expect(source.value).toContain('someone');
    expect(source.href).toBe('https://freesound.org/s/451508/');
    expect(source.missing).toBe(false);
  });

  test('mẫu tải từ kho mà chưa có URL nguồn thì hàng Nguồn bị đánh dấu thiếu', () => {
    expect(describeClip(planned).find((r) => r.label === 'Nguồn').missing).toBe(true);
  });

  test('nơi thu chưa xác minh được nói thẳng, không để trống', () => {
    expect(describeClip(planned).find((r) => r.label === 'Xác minh tại chỗ').value).toMatch(/chưa xác minh/);
    expect(describeClip(published).find((r) => r.label === 'Xác minh tại chỗ').value).toMatch(/đã xác minh/);
  });

  test('thiết bị và độ to gộp thành một dòng đọc được', () => {
    const rows = describeClip(published);
    expect(rows.find((r) => r.label === 'Thiết bị').value).toBe('Zoom H1n · 48000 Hz · 2 kênh · 84,2 s');
    expect(rows.find((r) => r.label === 'Độ to').value).toBe('−23 LUFS · đỉnh −2,4 dBTP');
  });

  test('nhật ký chỉnh sửa nối bằng dấu chấm phẩy', () => {
    expect(describeClip(published).find((r) => r.label === 'Đã chỉnh sửa').value).toBe('cắt 0–3 s; chuẩn hoá −23 LUFS');
  });
});

describe('createClipDetails', () => {
  let writeText;

  beforeEach(() => {
    document.body.replaceChildren();
    writeText = vi.fn(async () => {});
    vi.stubGlobal('navigator', { clipboard: { writeText } });
  });
  afterEach(() => vi.unstubAllGlobals());

  test('là <details> gập lại mặc định, có tóm tắt đọc được', () => {
    const el = createClipDetails(published, CONTEXT);
    expect(el.tagName).toBe('DETAILS');
    expect(el.open).toBe(false);
    expect(el.querySelector('summary').textContent).toBe('Nguồn, giấy phép và trích dẫn');
  });

  test('mỗi hàng là một cặp dt/dd; hàng thiếu có lớp riêng để nhìn ra', () => {
    const el = createClipDetails(planned, CONTEXT);
    const rows = describeClip(planned);
    expect(el.querySelectorAll('dt').length).toBe(rows.length);
    expect(el.querySelectorAll('dd').length).toBe(rows.length);
    const missing = el.querySelectorAll('dd.fact-missing');
    expect(missing.length).toBe(rows.filter((r) => r.missing).length);
    expect(missing[0].textContent).toBe('chưa có');
  });

  test('liên kết ra ngoài mở tab mới với rel an toàn', () => {
    const el = createClipDetails(archive, CONTEXT);
    const link = el.querySelector('a[href="https://freesound.org/s/451508/"]');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  test('URL nguồn không phải http(s) thì in chữ, không dựng liên kết', () => {
    // source_url là dữ liệu do người đóng góp điền — một dòng "javascript:" lọt
    // vào clips.json không được biến thành liên kết bấm được.
    const el = createClipDetails({ ...archive, source_url: 'javascript:alert(1)' }, CONTEXT);
    expect(el.querySelector('a[href^="javascript"]')).toBeNull();
    expect(el.textContent).toContain('javascript:alert(1)');
  });

  test('bấm hai nút liên tiếp thì trạng thái theo cú bấm SAU, không theo cú xong sau', async () => {
    let releaseFirst;
    writeText
      .mockImplementationOnce(() => new Promise((resolve) => { releaseFirst = resolve; }))
      .mockImplementationOnce(async () => {});
    const el = createClipDetails(published, CONTEXT);
    const [copyText, copyBibtex] = el.querySelectorAll('button');
    copyText.click();
    copyBibtex.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(el.querySelector('[role=status]').textContent).toBe('Đã sao chép BibTeX');
    releaseFirst();
    await Promise.resolve();
    await Promise.resolve();
    expect(el.querySelector('[role=status]').textContent).toBe('Đã sao chép BibTeX');
  });

  test('không dùng innerHTML: tiêu đề có thẻ HTML được in nguyên chữ', () => {
    const el = createClipDetails({ ...published, rights_holder: '<img src=x onerror=alert(1)>' }, CONTEXT);
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>');
  });

  test('hiện trích dẫn văn bản sẵn để đọc, và hai nút sao chép', () => {
    const el = createClipDetails(published, CONTEXT);
    expect(el.querySelector('.citation-text').textContent).toContain('Cồng chiêng trong lễ');
    const buttons = [...el.querySelectorAll('button')].map((b) => b.textContent);
    expect(buttons).toEqual(['Sao chép trích dẫn', 'Sao chép BibTeX']);
  });

  test('bấm sao chép BibTeX thì ghi vào clipboard và báo đã sao chép', async () => {
    const el = createClipDetails(published, CONTEXT);
    el.querySelectorAll('button')[1].click();
    await Promise.resolve();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toMatch(/^@misc\{vietsoundscape_tn_05,/);
    expect(el.querySelector('[role=status]').textContent).toBe('Đã sao chép BibTeX');
  });

  test('clipboard hỏng thì mở ô văn bản để sao chép tay, không nuốt lỗi', async () => {
    writeText.mockRejectedValue(new Error('bị chặn'));
    const el = createClipDetails(published, CONTEXT);
    el.querySelectorAll('button')[0].click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    const fallback = el.querySelector('textarea');
    expect(fallback.hidden).toBe(false);
    expect(fallback.value).toContain('Cồng chiêng trong lễ');
    expect(el.querySelector('[role=status]').textContent).toMatch(/sao chép tay/);
  });

  test('không có clipboard API thì cũng đi đường sao chép tay', async () => {
    vi.stubGlobal('navigator', {});
    const el = createClipDetails(published, CONTEXT);
    el.querySelectorAll('button')[1].click();
    await Promise.resolve();
    await Promise.resolve();
    expect(el.querySelector('textarea').hidden).toBe(false);
  });
});

describe('createMixLicenseNote', () => {
  const recipe = { id: 'm', layers: [{ clip_id: 'A' }, { clip_id: 'B' }] };

  test('chưa đủ giấy phép thì nói "chưa xác định" và kể tên lớp thiếu', () => {
    const el = createMixLicenseNote(recipe, { A: { license: 'CC0-1.0' }, B: {} });
    expect(el.textContent).toContain('chưa xác định');
    expect(el.textContent).toContain('B');
  });

  test('đủ giấy phép thì nêu giấy phép hiệu lực và từng lớp', () => {
    const el = createMixLicenseNote(recipe, { A: { license: 'CC0-1.0' }, B: { license: 'CC-BY-4.0' } });
    expect(el.textContent).toContain('Giấy phép hiệu lực của bản trộn: CC BY 4.0');
    expect(el.textContent).toContain('A: CC0 1.0');
    expect(el.textContent).toContain('B: CC BY 4.0');
    expect(el.querySelector('a').getAttribute('href')).toBe('https://creativecommons.org/licenses/by/4.0/');
  });

  test('SA lây sang lớp tự thu thì hiện cảnh báo của effectiveMixLicense', () => {
    const el = createMixLicenseNote(recipe, { A: { license: 'CC-BY-SA-3.0' }, B: { license: 'proprietary-own' } });
    expect(el.querySelector('.mix-license-warn').textContent).toMatch(/ràng buộc bởi điều kiện SA/);
  });
});
