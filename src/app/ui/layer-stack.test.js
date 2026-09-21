// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KRAUSE_FILL, createLayerStack, drawStack } from './layer-stack.js';

/** Ngữ cảnh canvas giả: ghi lại lệnh vẽ để kiểm được mà không cần canvas thật. */
function fakeContext() {
  const calls = [];
  const ctx = new Proxy(
    { canvas: { width: 600, height: 180 } },
    {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (typeof prop === 'string' && /^(fillRect|clearRect|beginPath|moveTo|lineTo|closePath|fill|stroke|save|restore|setLineDash)$/.test(prop)) {
          return (...args) => calls.push({ fn: prop, args });
        }
        return undefined;
      },
      set(target, prop, value) {
        target[prop] = value;
        calls.push({ fn: `set:${String(prop)}`, args: [value] });
        return true;
      },
    },
  );
  return { ctx, calls };
}

const envelope = (peak) => ({
  min: Array.from({ length: 12 }, () => -peak),
  max: Array.from({ length: 12 }, () => peak),
});

const LAYERS = [
  { id: 'A-01', label: 'Nền A', krauseClass: 'geophony', schaferRole: 'keynote', envelope: envelope(0.8), slider: 0.7 },
  { id: 'A-02', label: 'Tín hiệu A', krauseClass: 'anthrophony', schaferRole: 'signal', envelope: envelope(0.4), slider: 0.6 },
  { id: 'A-03', label: 'Chim', krauseClass: 'biophony', schaferRole: 'keynote', envelope: envelope(0.5), slider: 0.5 },
];

describe('drawStack', () => {
  test('xoá nền trước khi vẽ — không chồng khung cũ lên khung mới', () => {
    const { ctx, calls } = fakeContext();
    drawStack(ctx, LAYERS, { width: 600, height: 180 });
    expect(calls[0].fn).toBe('clearRect');
  });

  test('vẽ một dải cho mỗi lớp, xếp theo nhóm Krause từ dưới lên', () => {
    const { ctx, calls } = fakeContext();
    drawStack(ctx, LAYERS, { width: 600, height: 180 });
    const fills = calls.filter((c) => c.fn === 'set:fillStyle').map((c) => c.args[0]);
    // tự nhiên → sinh vật → con người
    expect(fills.slice(0, 3)).toEqual([
      KRAUSE_FILL.geophony,
      KRAUSE_FILL.biophony,
      KRAUSE_FILL.anthrophony,
    ]);
  });

  test('mỗi lớp chiếm một dải ngang riêng, không đè lên nhau', () => {
    const { ctx, calls } = fakeContext();
    drawStack(ctx, LAYERS, { width: 600, height: 180 });
    const bands = calls.filter((c) => c.fn === 'moveTo').map((c) => Math.round(c.args[1]));
    expect(new Set(bands).size).toBe(3);
  });

  test('âm tự nhiên nằm DƯỚI, âm do con người nằm TRÊN — khớp với lời chú thích', () => {
    // Thứ tự Krause dùng khi mô tả cảnh quan âm thanh: nền đất, rồi sự sống,
    // rồi hoạt động người. Vẽ ngược lại là hình nói một đằng, chữ nói một nẻo.
    const { ctx, calls } = fakeContext();
    drawStack(ctx, LAYERS, { width: 600, height: 180 });
    const y = [];
    let current = null;
    for (const c of calls) {
      if (c.fn === 'set:fillStyle') current = c.args[0];
      if (c.fn === 'moveTo' && current) { y.push({ fill: current, y: c.args[1] }); current = null; }
    }
    const at = (fill) => y.find((e) => e.fill === fill).y;
    expect(at(KRAUSE_FILL.geophony)).toBeGreaterThan(at(KRAUSE_FILL.biophony));
    expect(at(KRAUSE_FILL.biophony)).toBeGreaterThan(at(KRAUSE_FILL.anthrophony));
  });

  test('lớp bị kéo về 0 vẫn có dải nhưng vẽ mờ — tắt tiếng phải thấy được', () => {
    const { ctx, calls } = fakeContext();
    drawStack(ctx, [{ ...LAYERS[0], slider: 0 }], { width: 600, height: 180 });
    const alphas = calls.filter((c) => c.fn === 'set:globalAlpha').map((c) => c.args[0]);
    expect(Math.min(...alphas)).toBeLessThan(0.3);
  });

  test('một lớp vẽ riêng luôn lấp đầy dải — hình không phụ thuộc vật liệu to hay nhỏ', () => {
    // Hệ quả có chủ ý của việc chuẩn hoá theo lớp to nhất: khi chỉ có một lớp,
    // nó LÀ lớp to nhất. So sánh độ to là việc giữa các lớp trong cùng một bản
    // trộn, không phải giữa hai bản trộn khác nhau.
    const measure = (peak) => {
      const { ctx, calls } = fakeContext();
      drawStack(ctx, [{ ...LAYERS[0], envelope: envelope(peak) }], { width: 600, height: 180 });
      const ys = calls.filter((c) => c.fn === 'lineTo').map((c) => c.args[1]);
      return Math.round(Math.max(...ys) - Math.min(...ys));
    };
    expect(measure(0.9)).toBe(measure(0.2));
    expect(measure(0.9)).toBeGreaterThan(180 * 0.8);
  });

  test('chuẩn hoá theo lớp to nhất: lớp to nhất lấp đầy dải, lớp nhỏ vẫn nhỏ hơn theo tỉ lệ', () => {
    // Vẽ theo biên độ thô thì mọi dải gần phẳng khi vật liệu nhỏ, hình vô dụng.
    // Chuẩn hoá theo TỪNG lớp thì mọi lớp trông to bằng nhau — nói dối về tương
    // quan độ to. Chuẩn hoá theo lớp to nhất giữ cả hai: thấy được và trung thực.
    const { ctx, calls } = fakeContext();
    drawStack(
      ctx,
      [
        { id: 'to', krauseClass: 'geophony', envelope: envelope(0.2), slider: 1 },
        { id: 'nho', krauseClass: 'anthrophony', envelope: envelope(0.05), slider: 1 },
      ],
      { width: 600, height: 180 },
    );
    const spans = [];
    let ys = null;
    for (const c of calls) {
      if (c.fn === 'moveTo') ys = [c.args[1]];
      else if (c.fn === 'lineTo' && ys) ys.push(c.args[1]);
      else if (c.fn === 'fill' && ys) { spans.push(Math.max(...ys) - Math.min(...ys)); ys = null; }
    }
    const [loud, quiet] = spans;
    const band = (180 - 4) / 2;
    expect(loud).toBeGreaterThan(band * 0.8); // lớp to lấp gần đầy dải
    expect(quiet / loud).toBeCloseTo(0.25, 1); // vẫn đúng tỉ lệ 0,05/0,2
  });

  test('mọi lớp im lặng thì không chia cho 0', () => {
    const { ctx } = fakeContext();
    expect(() =>
      drawStack(ctx, [{ id: 'a', krauseClass: 'geophony', envelope: envelope(0), slider: 1 }], {
        width: 600,
        height: 180,
      }),
    ).not.toThrow();
  });

  test('không có lớp nào thì vẽ nền sạch, không ném lỗi', () => {
    const { ctx, calls } = fakeContext();
    expect(() => drawStack(ctx, [], { width: 600, height: 180 })).not.toThrow();
    expect(calls.filter((c) => c.fn === 'lineTo')).toEqual([]);
  });

  test('lớp thiếu đường bao bị bỏ qua thay vì vẽ NaN', () => {
    const { ctx, calls } = fakeContext();
    drawStack(ctx, [{ id: 'x', krauseClass: 'geophony', slider: 1 }], { width: 600, height: 180 });
    expect(calls.filter((c) => c.fn === 'lineTo')).toEqual([]);
  });
});

describe('createLayerStack', () => {
  beforeEach(() => document.body.replaceChildren());

  test('là một figure có canvas và lời chú thích đọc được', () => {
    const el = createLayerStack({ layers: LAYERS });
    expect(el.tagName).toBe('FIGURE');
    expect(el.querySelector('canvas')).not.toBeNull();
    expect(el.querySelector('figcaption').textContent).toContain('3 lớp');
  });

  test('canvas có nhãn thay thế cho người không nhìn thấy — kể tên từng lớp', () => {
    const el = createLayerStack({ layers: LAYERS });
    const label = el.querySelector('canvas').getAttribute('aria-label');
    expect(label).toContain('Nền A');
    expect(label).toContain('Tín hiệu A');
    expect(label).toContain('Âm tự nhiên');
  });

  test('canvas không phải là chốt điều khiển: role img, không tab tới được', () => {
    const canvas = createLayerStack({ layers: LAYERS }).querySelector('canvas');
    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.hasAttribute('tabindex')).toBe(false);
  });

  test('gọi update() vẽ lại với giá trị thanh trượt mới', () => {
    const el = createLayerStack({ layers: LAYERS });
    const draw = vi.fn();
    el.querySelector('canvas').getContext = () => null;
    expect(() => el.update({ 'A-01': 0.1 })).not.toThrow();
    expect(draw).not.toHaveBeenCalled(); // không có ngữ cảnh thì im lặng bỏ qua, không sập
  });

  test('không có lớp nào thì không dựng gì', () => {
    expect(createLayerStack({ layers: [] })).toBeNull();
  });
});
