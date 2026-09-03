// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  assertStimuliAvailable,
  attachExitGuard,
  createStimulusUrl,
  logFilename,
  resolveParticipantIndex,
} from './bootstrap.js';

const MANIFEST = {
  stimuli: [
    { id: 'hue-trua-he--layered', recipe_id: 'hue-trua-he', location_id: 'hue-thien-mu', condition: 'layered', served_as: 'bb0c9c0cc563c7f4.wav' },
    { id: 'hue-trua-he--isolated', recipe_id: 'hue-trua-he', location_id: 'hue-thien-mu', condition: 'isolated', served_as: '4d1f0a77e9b2c305.wav' },
    { id: 'hue-trua-he--scrambled', recipe_id: 'hue-trua-he', location_id: 'hue-thien-mu', condition: 'scrambled', served_as: '90ac31be5f7d2e18.wav' },
  ],
};

describe('số thứ tự người tham gia', () => {
  test('lấy từ tham số URL', () => {
    expect(resolveParticipantIndex('?nguoi=7')).toBe(7);
    expect(resolveParticipantIndex('?nguoi=0')).toBe(0);
  });

  test('THIẾU thì chặn, không mặc định về 0', () => {
    // Mặc định 0 là hỏng câm: ai cũng nghe cùng một thứ tự, phép đảo thứ tự cân
    // bằng biến mất, và không có dấu hiệu nào trong log để phát hiện ra.
    expect(() => resolveParticipantIndex('')).toThrow(/nguoi/);
    expect(() => resolveParticipantIndex('?abc=1')).toThrow(/nguoi/);
  });

  test('giá trị vô nghĩa thì chặn', () => {
    for (const search of ['?nguoi=', '?nguoi=abc', '?nguoi=-1', '?nguoi=1.5', '?nguoi=1e3']) {
      expect(() => resolveParticipantIndex(search)).toThrow();
    }
  });
});

describe('đường dẫn tệp kích thích', () => {
  test('tra theo bảng kê, trả về tên mờ', () => {
    const url = createStimulusUrl(MANIFEST, { base: '/stimuli/' });
    expect(url('hue-trua-he--layered')).toBe('/stimuli/bb0c9c0cc563c7f4.wav');
  });

  test('không có trong bảng kê thì báo lỗi rõ, không để 404 câm', () => {
    const url = createStimulusUrl(MANIFEST);
    expect(() => url('cai-rang-sang--layered')).toThrow(/bảng kê|manifest/i);
  });

  test('CHẶN NGAY LÚC NẠP nếu bảng kê đặt tên tệp lộ đáp án', () => {
    // Bắt ở đây chứ không đợi tầng hiển thị: lỗi ở tầng hiển thị nổ ra giữa lúc
    // người tham gia đang ngồi trước máy, còn lỗi ở đây nổ trước khi hỏi đồng thuận.
    const leaky = {
      stimuli: [{ ...MANIFEST.stimuli[0], served_as: 'hue-trua-he--layered.wav' }],
    };
    expect(() => createStimulusUrl(leaky)).toThrow(/lộ/);
  });
});

describe('đủ tệp cho cả thiết kế', () => {
  const recipes = [{ id: 'hue-trua-he', location_id: 'hue-thien-mu' }];

  test('đủ thì im lặng đi qua', () => {
    expect(() =>
      assertStimuliAvailable(MANIFEST, recipes, ['layered', 'isolated', 'scrambled']),
    ).not.toThrow();
  });

  test('thiếu một điều kiện thì chặn trước khi bắt đầu, kèm tên còn thiếu', () => {
    const partial = { stimuli: MANIFEST.stimuli.slice(0, 2) };
    expect(() =>
      assertStimuliAvailable(partial, recipes, ['layered', 'isolated', 'scrambled']),
    ).toThrow(/hue-trua-he--scrambled/);
  });
});

describe('tên tệp log', () => {
  test('mang số thứ tự người tham gia, đệm 0 để sắp xếp đúng', () => {
    expect(logFilename({ participant_index: 7 })).toBe('nguoi-007.json');
    expect(logFilename({ participant_index: 128 })).toBe('nguoi-128.json');
  });
});

describe('chặn rời trang giữa chừng', () => {
  beforeEach(() => document.body.replaceChildren());

  const fakeWindow = () => {
    const listeners = new Map();
    return {
      addEventListener: (type, fn) => listeners.set(type, fn),
      removeEventListener: (type) => listeners.delete(type),
      fire(type) {
        const event = { preventDefault: vi.fn(), returnValue: '' };
        listeners.get(type)?.(event);
        return event;
      },
      has: (type) => listeners.has(type),
    };
  };

  test('đang giữa phiên thì hỏi lại trước khi rời', () => {
    // Tải lại trang là mất phiên: người đó đã nghe rồi, nghe lại là lượt sau
    // không còn đo cùng một thứ. Thà hỏi lại còn hơn mất một người tham gia.
    const win = fakeWindow();
    attachExitGuard(win, { state: () => 'trial' });
    expect(win.fire('beforeunload').preventDefault).toHaveBeenCalled();
  });

  test('xong rồi thì để rời tự do', () => {
    const win = fakeWindow();
    attachExitGuard(win, { state: () => 'complete' });
    expect(win.fire('beforeunload').preventDefault).not.toHaveBeenCalled();
  });

  test('chưa đồng thuận thì cũng để rời tự do', () => {
    const win = fakeWindow();
    attachExitGuard(win, { state: () => 'consent' });
    expect(win.fire('beforeunload').preventDefault).not.toHaveBeenCalled();
  });

  test('gỡ được', () => {
    const win = fakeWindow();
    attachExitGuard(win, { state: () => 'trial' })();
    expect(win.has('beforeunload')).toBe(false);
  });
});
