import { describe, expect, test } from 'vitest';
import { EXPERIMENT_CONDITIONS } from '../domain/taxonomy.js';
import { assignParticipant, assignCohort, summariseCoverage } from './assignment.js';

const LOCATIONS = ['hanoi-pho-co', 'hue-song-huong', 'cai-rang-cho-noi', 'buon-ma-thuot'];

const conditionsOf = (trials) => trials.map((t) => t.condition);
const locationsOf = (trials) => trials.map((t) => t.location_id);

describe('assignParticipant — mỗi người nghe gì', () => {
  test('số lượt bằng số địa điểm', () => {
    expect(assignParticipant(0, LOCATIONS)).toHaveLength(LOCATIONS.length);
  });

  test('mỗi địa điểm chỉ nghe MỘT lần trong cả phiên', () => {
    // Đây là ràng buộc quan trọng nhất của thiết kế trong-người cho nhiệm vụ
    // đoán vùng miền: nghe Huế lần hai thì đã biết đáp án, lượt đó vô giá trị.
    for (let p = 0; p < 24; p += 1) {
      const seen = locationsOf(assignParticipant(p, LOCATIONS));
      expect(new Set(seen).size).toBe(LOCATIONS.length);
    }
  });

  test('mỗi người đều gặp cả điều kiện phân lớp lẫn âm đơn lẻ', () => {
    // McNemar cần cặp trong cùng một người. Thiếu một trong hai thì người đó
    // không đóng góp được gì cho H1.
    for (let p = 0; p < 24; p += 1) {
      const conditions = conditionsOf(assignParticipant(p, LOCATIONS));
      expect(conditions).toContain('layered');
      expect(conditions).toContain('isolated');
    }
  });

  test('đánh số lượt từ 1, liên tục', () => {
    expect(assignParticipant(7, LOCATIONS).map((t) => t.order)).toEqual([1, 2, 3, 4]);
  });

  test('cùng số thứ tự người tham gia thì luôn ra cùng một phiên', () => {
    // Tái lập được: sau khi thu xong vẫn dựng lại được đúng những gì người thứ
    // 13 đã nghe, không cần lưu thêm gì.
    expect(assignParticipant(13, LOCATIONS)).toEqual(assignParticipant(13, LOCATIONS));
  });

  test('người kế tiếp nghe khác người trước', () => {
    expect(assignParticipant(0, LOCATIONS)).not.toEqual(assignParticipant(1, LOCATIONS));
  });

  test('chiều chuyển điều kiện đảo giữa người chẵn và người lẻ', () => {
    // Chống hiệu ứng lan truyền một chiều: nếu mọi người đều đi qua các điều
    // kiện theo cùng một chiều thì "điều kiện B sau điều kiện A" là hằng số của
    // cả đợt, và ảnh hưởng của thứ tự không tách được khỏi ảnh hưởng của điều kiện.
    const m = EXPERIMENT_CONDITIONS.length;
    const steps = (p) => {
      const idx = conditionsOf(assignParticipant(p, LOCATIONS)).map((c) =>
        EXPERIMENT_CONDITIONS.indexOf(c),
      );
      return idx.slice(1).map((v, i) => (v - idx[i] + m) % m);
    };

    for (let p = 0; p < 12; p += 2) {
      expect(steps(p)).toEqual(steps(p).map(() => 1)); // chẵn: đi xuôi
      expect(steps(p + 1)).toEqual(steps(p + 1).map(() => m - 1)); // lẻ: đi ngược
    }
  });

  test('từ chối số thứ tự không phải số nguyên không âm', () => {
    expect(() => assignParticipant(-1, LOCATIONS)).toThrow(/số nguyên/i);
    expect(() => assignParticipant(1.5, LOCATIONS)).toThrow(/số nguyên/i);
  });

  test('từ chối khi số địa điểm ít hơn số điều kiện', () => {
    // 2 địa điểm mà 3 điều kiện thì có người không gặp đủ điều kiện.
    expect(() => assignParticipant(0, ['hanoi-pho-co', 'hue-song-huong'])).toThrow(/điều kiện/i);
  });
});

describe('summariseCoverage — kiểm cân bằng trước khi chạy thật', () => {
  test('đủ một vòng thì mọi ô địa điểm × điều kiện được phủ đều nhau', () => {
    const cohort = assignCohort(12, LOCATIONS);
    const summary = summariseCoverage(cohort, LOCATIONS);

    const counts = Object.values(summary.cells);
    expect(counts).toHaveLength(LOCATIONS.length * EXPERIMENT_CONDITIONS.length);
    expect(new Set(counts).size).toBe(1);
    expect(summary.balanced).toBe(true);
  });

  test('mỗi điều kiện đứng đầu phiên đều nhau', () => {
    // Nếu "phân lớp" luôn là lượt đầu thì hiệu ứng khởi động dính hết vào nó.
    const summary = summariseCoverage(assignCohort(12, LOCATIONS), LOCATIONS);
    expect(new Set(Object.values(summary.firstPosition)).size).toBe(1);
  });

  test('cỡ mẫu lẻ vòng thì báo chưa cân bằng, kèm gợi ý số người cần thêm', () => {
    const summary = summariseCoverage(assignCohort(10, LOCATIONS), LOCATIONS);
    expect(summary.balanced).toBe(false);
    expect(summary.nextBalancedSize).toBe(12);
  });

  test('nêu rõ số người cần cho một vòng đầy đủ', () => {
    expect(summariseCoverage(assignCohort(12, LOCATIONS), LOCATIONS).cycleSize).toBe(12);
  });
});
