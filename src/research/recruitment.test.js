import { describe, expect, test } from 'vitest';
import { nextFreeId, parseWaitlistCsv, summariseRecruitment, WAITLIST_COLUMNS } from './recruitment.js';

const CSV = `id,ngay_dang_ky,trang_thai,ngay_nghe,thiet_bi,tai_nghe,ghi_chu
1,2026-10-01,da_nghe,2026-10-03,android,co,
2,2026-10-01,da_nghe,2026-10-03,iphone,co,
3,2026-10-02,cho,,,,"hẹn tuần sau, có dấu phẩy"
4,2026-10-02,loai,2026-10-04,laptop,khong,loa ngoài nơi ồn
5,2026-10-08,da_nghe,2026-10-10,android,khong,
`;

describe('parseWaitlistCsv', () => {
  test('đọc đủ hàng và cột, giữ ô có dấu phẩy trong ngoặc kép', () => {
    const rows = parseWaitlistCsv(CSV);
    expect(rows.length).toBe(5);
    expect(rows[2].ghi_chu).toBe('hẹn tuần sau, có dấu phẩy');
    expect(rows[0].id).toBe(1);
  });

  test('thiếu cột bắt buộc thì báo rõ tên cột', () => {
    expect(() => parseWaitlistCsv('id,ngay_dang_ky\n1,2026-10-01\n')).toThrow(/trang_thai/);
    expect(WAITLIST_COLUMNS).toContain('trang_thai');
  });

  test('trạng thái ngoài từ vựng thì báo dòng nào', () => {
    expect(() => parseWaitlistCsv('id,ngay_dang_ky,trang_thai\n7,2026-10-01,xong\n')).toThrow(/dòng 2.*xong/i);
  });

  test('id trùng thì báo — hai người cùng một phiên là hỏng phân điều kiện', () => {
    expect(() =>
      parseWaitlistCsv('id,ngay_dang_ky,trang_thai\n1,2026-10-01,cho\n1,2026-10-02,cho\n'),
    ).toThrow(/trùng/);
  });

  test('bỏ dòng trống và khoảng trắng thừa', () => {
    const rows = parseWaitlistCsv('id,ngay_dang_ky,trang_thai\n\n 1 , 2026-10-01 , cho \n\n');
    expect(rows).toEqual([{ id: 1, ngay_dang_ky: '2026-10-01', trang_thai: 'cho' }]);
  });
});

describe('summariseRecruitment', () => {
  const rows = parseWaitlistCsv(CSV);
  const summary = summariseRecruitment(rows, { target: 96, floor: 84, roundSize: 12, today: '2026-10-12' });

  test('đếm đúng bốn nhóm', () => {
    expect(summary.registered).toBe(5);
    expect(summary.completed).toBe(3);
    expect(summary.waiting).toBe(1);
    expect(summary.excluded).toBe(1);
  });

  test('còn thiếu bao nhiêu tới mục tiêu và tới sàn — chỉ tính người đã nghe', () => {
    expect(summary.remainingToTarget).toBe(93);
    expect(summary.remainingToFloor).toBe(81);
  });

  test('vòng cân bằng 12 người: mấy vòng tròn, vòng đang mở thiếu mấy', () => {
    expect(summary.completeRounds).toBe(0);
    expect(summary.openRoundMissing).toBe(9);
  });

  test('tiến độ theo tuần ISO của ngày nghe, để C5.2 theo dõi hằng tuần', () => {
    expect(summary.byWeek).toEqual([
      { week: '2026-W40', completed: 2 },
      { week: '2026-W41', completed: 1 },
    ]);
  });

  test('ghi nhận thiết bị nghe và có tai nghe hay không (C5.2)', () => {
    expect(summary.devices).toEqual({ android: 2, iphone: 1 });
    expect(summary.headphones).toEqual({ co: 2, khong: 1 });
  });

  test('tốc độ cần để kịp hạn: người/tuần còn lại', () => {
    const paced = summariseRecruitment(rows, { target: 96, floor: 84, roundSize: 12, today: '2026-10-12', deadline: '2026-12-07' });
    expect(paced.weeksLeft).toBe(8);
    expect(paced.neededPerWeek).toBe(12);
  });

  test('bảng trống thì mọi số về 0, không chia cho 0', () => {
    const empty = summariseRecruitment([], { target: 96, floor: 84, roundSize: 12, today: '2026-10-12' });
    expect(empty.completed).toBe(0);
    expect(empty.byWeek).toEqual([]);
    expect(empty.openRoundMissing).toBe(12);
  });
});

describe('nextFreeId', () => {
  test('id kế tiếp là max + 1, bảng trống thì 1', () => {
    expect(nextFreeId(parseWaitlistCsv(CSV))).toBe(6);
    expect(nextFreeId([])).toBe(1);
  });
});
