/**
 * Xếp chồng dạng sóng từng lớp — **lập luận thị giác cho H1** (A5.1).
 *
 * Thuyết minh nói "mô phỏng chứ không phát lại", và H1 nói phân lớp *có chủ
 * đích* giúp nhận diện vùng miền. Cả hai đều là phát biểu về **cấu trúc**, mà
 * cấu trúc thì nghe được chứ không thấy được. Hình này cho thấy: một nền chạy
 * liên tục, vài tín hiệu nổi lên rời rạc, một dấu ấn. Kéo một thanh trượt về 0
 * thì dải tương ứng mờ đi — người xem thấy ngay lớp nào vừa mất.
 *
 * Vẽ bằng canvas 2D, không thư viện. Toán nằm ở `src/audio/waveform.js`.
 */

import { peakEnvelope, stackOrder } from '../../audio/waveform.js';
import { KRAUSE_LABEL, SCHAFER_LABEL, labelOf } from '../../domain/labels.js';

/** Màu ba nhóm nguồn phát — cùng hệ với token giao diện, đủ tương phản trên giấy ngà. */
export const KRAUSE_FILL = Object.freeze({
  geophony: 'oklch(62% 0.11 215 / 0.75)',
  biophony: 'oklch(64% 0.13 145 / 0.75)',
  anthrophony: 'oklch(65% 0.15 65 / 0.75)',
});

const BAND_GAP = 4;
/** Lớp đã kéo về 0 vẫn giữ chỗ nhưng mờ hẳn — mất tiếng phải thấy được. */
const MUTED_ALPHA = 0.18;

/**
 * Vẽ một khung.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{id: string, krauseClass?: string, envelope?: {min: number[], max: number[]}, slider?: number}>} layers
 * @param {{ width: number, height: number }} size
 */
export function drawStack(ctx, layers, { width, height }) {
  ctx.clearRect(0, 0, width, height);
  const drawable = stackOrder(layers).filter((layer) => layer.envelope?.max?.length > 0);
  if (drawable.length === 0) return;

  const bandHeight = (height - BAND_GAP * (drawable.length - 1)) / drawable.length;

  // Chuẩn hoá theo **lớp to nhất**, không theo từng lớp. Chuẩn hoá từng lớp thì
  // mọi dải trông to bằng nhau — hình đẹp nhưng nói dối: người xem mất đúng cái
  // đang muốn so sánh, là lớp nào lấn át lớp nào. Chia chung một hệ số thì lớp
  // to lấp đầy dải, lớp nhỏ vẫn nhỏ theo đúng tỉ lệ.
  const loudest = Math.max(
    ...drawable.map((layer) =>
      Math.max(...layer.envelope.max.map(Math.abs), ...layer.envelope.min.map(Math.abs)),
    ),
  );
  const normalise = loudest > 0 ? 1 / loudest : 0;

  drawable.forEach((layer, index) => {
    // `stackOrder` trả từ dưới lên (tự nhiên trước), còn trục y của canvas tính
    // từ trên xuống — nên phải lật, nếu không hình nói ngược lời chú thích.
    const top = (drawable.length - 1 - index) * (bandHeight + BAND_GAP);
    const middle = top + bandHeight / 2;
    const slider = layer.slider ?? 1;

    ctx.globalAlpha = slider <= 0 ? MUTED_ALPHA : 0.35 + 0.65 * slider;
    ctx.fillStyle = KRAUSE_FILL[layer.krauseClass] ?? 'oklch(60% 0 0 / 0.6)';

    const { min, max } = layer.envelope;
    const buckets = max.length;
    const step = width / buckets;
    // Nửa dải trừ chút lề để hai dải cạnh nhau không chạm nhau khi cùng đầy.
    const scale = (bandHeight / 2) * 0.92 * normalise;

    ctx.beginPath();
    ctx.moveTo(0, middle - max[0] * scale);
    for (let i = 1; i < buckets; i += 1) ctx.lineTo(i * step, middle - max[i] * scale);
    for (let i = buckets - 1; i >= 0; i -= 1) ctx.lineTo(i * step, middle - min[i] * scale);
    ctx.closePath();
    ctx.fill();
  });

  ctx.globalAlpha = 1;
}

/**
 * @param {object} options
 * @param {Array<{id: string, label?: string, krauseClass?: string, schaferRole?: string, buffer?: object, envelope?: object, slider?: number}>} options.layers
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @returns {(HTMLElement & { update(sliders: Record<string, number>): void }) | null}
 */
export function createLayerStack({ layers, width = 600, height = 180 }) {
  if (!Array.isArray(layers) || layers.length === 0) return null;

  // Đường bao tính **một lần** lúc dựng: nó không đổi khi kéo thanh trượt (thanh
  // trượt đổi độ trong suốt, không đổi hình sóng), nên tính lại mỗi khung là phí.
  const prepared = layers.map((layer) => ({
    ...layer,
    envelope: layer.envelope ?? (layer.buffer ? peakEnvelope(layer.buffer) : undefined),
  }));

  const figure = document.createElement('figure');
  figure.className = 'layer-stack';

  const canvas = document.createElement('canvas');
  canvas.className = 'layer-stack-canvas';
  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    `Dạng sóng ${prepared.length} lớp âm xếp chồng theo nhóm nguồn phát: ` +
      prepared
        .map(
          (layer) =>
            `${layer.label ?? layer.id} (${labelOf(KRAUSE_LABEL, layer.krauseClass)}, ` +
            `${labelOf(SCHAFER_LABEL, layer.schaferRole)})`,
        )
        .join('; '),
  );

  const caption = document.createElement('figcaption');
  caption.textContent =
    `${prepared.length} lớp xếp chồng — âm tự nhiên dưới, âm sinh vật giữa, âm do con người trên. ` +
    'Kéo thanh trượt của một lớp về 0 thì dải của nó mờ đi.';

  figure.append(canvas, caption);

  const render = (sliders = {}) => {
    // `getContext` trả null khi canvas chưa gắn vào trang hoặc trình duyệt từ
    // chối — im lặng bỏ qua thay vì đánh sập phòng nghe vì một hình minh hoạ.
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return;
    drawStack(
      ctx,
      prepared.map((layer) => ({ ...layer, slider: sliders[layer.id] ?? layer.slider })),
      { width, height },
    );
  };

  figure.update = render;
  render();
  return figure;
}
