/**
 * Theo dõi tuyển người tham gia (lộ trình C2.1, C5.2).
 *
 * Danh sách chờ là CSV **ngoài git** (có thể chứa cách liên hệ) — mẫu cột ở
 * `nghien-cuu/mau-danh-sach-cho.csv`. Tệp này chỉ đọc và đếm: đã nghe bao
 * nhiêu so với 96 (sàn 84), vòng cân bằng 12 người đang thiếu mấy, tiến độ
 * theo tuần, thiết bị nghe và có tai nghe hay không.
 *
 * Không có gì ở đây quyết định loại ai — tiêu chí loại nằm ở kế hoạch phân tích
 * §3 và được người ghi vào cột `trang_thai` trước khi nhìn kết quả.
 */

export const WAITLIST_COLUMNS = Object.freeze(['id', 'ngay_dang_ky', 'trang_thai']);
export const OPTIONAL_COLUMNS = Object.freeze(['ngay_nghe', 'thiet_bi', 'tai_nghe', 'ghi_chu']);

/** `cho` chờ tới lượt · `da_nghe` hoàn tất phiên · `loai` theo tiêu chí §3. */
export const STATUSES = Object.freeze(['cho', 'da_nghe', 'loai']);

/** CSV đơn giản có ngoặc kép, không xuống dòng trong ô. */
function splitCsvLine(line) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      cells.push(cell);
      cell = '';
    } else cell += char;
  }
  cells.push(cell);
  return cells.map((value) => value.trim());
}

/**
 * @param {string} text
 * @returns {Array<Record<string, string | number>>}
 */
export function parseWaitlistCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) return [];
  const header = splitCsvLine(lines[0]);
  const missing = WAITLIST_COLUMNS.filter((column) => !header.includes(column));
  if (missing.length > 0) throw new Error(`Thiếu cột bắt buộc: ${missing.join(', ')}`);

  const rows = [];
  const seen = new Set();
  lines.slice(1).forEach((line, index) => {
    const lineNo = index + 2;
    const cells = splitCsvLine(line);
    const row = {};
    header.forEach((column, i) => {
      const value = cells[i] ?? '';
      if (value !== '') row[column] = value;
    });
    const id = Number(row.id);
    if (!Number.isInteger(id) || id < 1) throw new Error(`Dòng ${lineNo}: id "${row.id}" phải là số nguyên dương`);
    if (seen.has(id)) throw new Error(`Dòng ${lineNo}: id ${id} trùng — hai người không được chung một phiên`);
    seen.add(id);
    if (!STATUSES.includes(row.trang_thai)) {
      throw new Error(`Dòng ${lineNo}: trạng thái "${row.trang_thai}" không nằm trong ${STATUSES.join(' | ')}`);
    }
    rows.push({ ...row, id });
  });
  return rows;
}

/** Tuần ISO 8601 của một ngày `YYYY-MM-DD`, dạng `YYYY-Www`. */
export function isoWeek(dateText) {
  const date = new Date(`${dateText}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

const countBy = (rows, key) => {
  const counts = {};
  for (const row of rows) {
    const value = row[key];
    if (value === undefined || value === '') continue;
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
};

/**
 * @param {Array<Record<string, any>>} rows
 * @param {object} options
 * @param {number} options.target cỡ mẫu chốt (96)
 * @param {number} options.floor sàn (84)
 * @param {number} options.roundSize một vòng hình vuông La Tinh (12)
 * @param {string} options.today `YYYY-MM-DD`
 * @param {string} [options.deadline] hạn thu xong, `YYYY-MM-DD`
 */
export function summariseRecruitment(rows, { target, floor, roundSize, today, deadline }) {
  const done = rows.filter((row) => row.trang_thai === 'da_nghe');
  const completed = done.length;

  const weeks = countBy(done.map((row) => ({ week: isoWeek(row.ngay_nghe) })), 'week');
  const byWeek = Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({ week, completed: count }));

  const summary = {
    registered: rows.length,
    completed,
    waiting: rows.filter((row) => row.trang_thai === 'cho').length,
    excluded: rows.filter((row) => row.trang_thai === 'loai').length,
    remainingToTarget: Math.max(0, target - completed),
    remainingToFloor: Math.max(0, floor - completed),
    completeRounds: Math.floor(completed / roundSize),
    // Vòng đang mở còn thiếu mấy người; vừa tròn vòng thì vòng mới cần đủ 12.
    openRoundMissing: roundSize - (completed % roundSize),
    byWeek,
    devices: countBy(done, 'thiet_bi'),
    headphones: countBy(done, 'tai_nghe'),
  };

  if (deadline) {
    const msLeft = new Date(`${deadline}T00:00:00Z`) - new Date(`${today}T00:00:00Z`);
    const weeksLeft = Math.max(0, Math.round(msLeft / (7 * 86400000)));
    summary.weeksLeft = weeksLeft;
    summary.neededPerWeek = weeksLeft > 0 ? Math.ceil(summary.remainingToTarget / weeksLeft) : summary.remainingToTarget;
  }
  return summary;
}

/** Mã người tham gia kế tiếp — `?nguoi=N` trên trang phiên nghe. */
export function nextFreeId(rows) {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}
