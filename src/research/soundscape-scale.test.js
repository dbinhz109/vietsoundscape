import { describe, expect, test } from 'vitest';
import {
  AGREEMENT_SCALE,
  ISO_ATTRIBUTES,
  deriveIsoDimensions,
} from './soundscape-scale.js';

/** Trả lời trung lập cho cả 8 thuộc tính. */
const neutral = () => Object.fromEntries(ISO_ATTRIBUTES.map((a) => [a.key, 3]));
const rate = (overrides) => ({ ...neutral(), ...overrides });

describe('bộ thuộc tính ISO 12913-2', () => {
  test('đủ 8 thuộc tính, mã không trùng', () => {
    expect(ISO_ATTRIBUTES).toHaveLength(8);
    expect(new Set(ISO_ATTRIBUTES.map((a) => a.key)).size).toBe(8);
  });

  test('đủ bốn cặp đối nghĩa mà công thức ISO cần', () => {
    // Thiếu một thuộc tính là công thức suy diễn không chạy được — mà lúc đó
    // dữ liệu đã thu xong rồi.
    const keys = ISO_ATTRIBUTES.map((a) => a.key);
    for (const key of [
      'pleasant', 'annoying',
      'calm', 'chaotic',
      'vibrant', 'monotonous',
      'eventful', 'uneventful',
    ]) {
      expect(keys).toContain(key);
    }
  });

  test('mỗi thuộc tính có nhận định tiếng Việt', () => {
    expect(ISO_ATTRIBUTES.every((a) => a.statement_vi.trim().length > 0)).toBe(true);
  });

  test('thang đồng ý 5 mức, từ 1 đến 5', () => {
    expect(AGREEMENT_SCALE.map((s) => s.value)).toEqual([1, 2, 3, 4, 5]);
    expect(AGREEMENT_SCALE.every((s) => s.label_vi.trim().length > 0)).toBe(true);
  });
});

describe('suy ra hai chiều của ISO/TS 12913-3', () => {
  test('trả lời trung lập hết thì cả hai chiều bằng 0', () => {
    expect(deriveIsoDimensions(neutral())).toEqual({ pleasantness: 0, eventfulness: 0 });
  });

  test('hồ sơ dễ chịu cực đại cho pleasantness = 1', () => {
    const result = deriveIsoDimensions(
      rate({ pleasant: 5, annoying: 1, calm: 5, chaotic: 1, vibrant: 5, monotonous: 1 }),
    );
    expect(result.pleasantness).toBeCloseTo(1, 12);
  });

  test('hồ sơ nhiều sự kiện cực đại cho eventfulness = 1', () => {
    const result = deriveIsoDimensions(
      rate({ eventful: 5, uneventful: 1, chaotic: 5, calm: 1, vibrant: 5, monotonous: 1 }),
    );
    expect(result.eventfulness).toBeCloseTo(1, 12);
  });

  test('hai chiều TRỰC GIAO: dễ chịu cực đại không kéo theo nhiều sự kiện', () => {
    // Đây là điểm cốt lõi của mô hình vòng tròn ISO, và cũng là lý do phải suy ra
    // từ 8 thuộc tính chứ không hỏi thẳng hai câu: hỏi thẳng thì hai câu trả lời
    // tương quan với nhau theo cách không kiểm soát được.
    const pleasantMax = deriveIsoDimensions(
      rate({ pleasant: 5, annoying: 1, calm: 5, chaotic: 1, vibrant: 5, monotonous: 1 }),
    );
    expect(pleasantMax.eventfulness).toBeCloseTo(0, 12);

    const eventfulMax = deriveIsoDimensions(
      rate({ eventful: 5, uneventful: 1, chaotic: 5, calm: 1, vibrant: 5, monotonous: 1 }),
    );
    expect(eventfulMax.pleasantness).toBeCloseTo(0, 12);
  });

  test('giá trị tính tay: nghiêng dễ chịu một nửa thang', () => {
    const result = deriveIsoDimensions(
      rate({ pleasant: 4, annoying: 2, calm: 4, chaotic: 2, vibrant: 4, monotonous: 2 }),
    );
    expect(result.pleasantness).toBeCloseTo(0.5, 12);
    expect(result.eventfulness).toBeCloseTo(0, 12);
  });

  test('hồ sơ khó chịu cực đại cho pleasantness = −1', () => {
    const result = deriveIsoDimensions(
      rate({ pleasant: 1, annoying: 5, calm: 1, chaotic: 5, vibrant: 1, monotonous: 5 }),
    );
    expect(result.pleasantness).toBeCloseTo(-1, 12);
  });

  test('luôn nằm trong [−1, 1] với mọi tổ hợp trả lời', () => {
    // Quét toàn bộ 5^8 là 390 625 tổ hợp — chạy vẫn nhanh, và đây là loại bảo đảm
    // đáng quét cạn: một hệ số sai dấu sẽ lọt qua vài ca thử tay.
    const keys = ISO_ATTRIBUTES.map((a) => a.key);
    const ratings = {};
    let worst = 0;
    const walk = (depth) => {
      if (depth === keys.length) {
        const { pleasantness, eventfulness } = deriveIsoDimensions(ratings);
        worst = Math.max(worst, Math.abs(pleasantness), Math.abs(eventfulness));
        return;
      }
      for (let value = 1; value <= 5; value += 1) {
        ratings[keys[depth]] = value;
        walk(depth + 1);
      }
    };
    walk(0);
    expect(worst).toBeLessThanOrEqual(1 + 1e-12);
    expect(worst).toBeCloseTo(1, 12); // và biên thật sự đạt được
  });
});

describe('từ chối dữ liệu không dùng được', () => {
  test('thiếu một thuộc tính thì báo tên thuộc tính đó', () => {
    const partial = neutral();
    delete partial.monotonous;
    expect(() => deriveIsoDimensions(partial)).toThrow(/monotonous/);
  });

  test('điểm ngoài thang thì chặn', () => {
    expect(() => deriveIsoDimensions(rate({ pleasant: 0 }))).toThrow(/pleasant/);
    expect(() => deriveIsoDimensions(rate({ pleasant: 6 }))).toThrow(/pleasant/);
  });

  test('điểm không phải số thì chặn', () => {
    expect(() => deriveIsoDimensions(rate({ calm: '4' }))).toThrow(/calm/);
    expect(() => deriveIsoDimensions(rate({ calm: null }))).toThrow(/calm/);
  });
});
