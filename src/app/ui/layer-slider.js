/**
 * Thanh trượt âm lượng có nhãn đọc được (FR-61).
 *
 * Trình đọc màn hình mặc định sẽ đọc "40" — vô nghĩa. `aria-valuetext` cho nó
 * đọc "Tiếng ve — 40 phần trăm". Làm tiếp cận ngay lúc dựng component rẻ hơn
 * nhiều lần so với ghép vào sau (FR-60…65).
 */

/**
 * @param {object} options
 * @param {string} options.id
 * @param {string} options.label nhãn đọc được, bằng tiếng Việt
 * @param {number} options.value 0…1
 * @param {(value: number) => void} options.onInput
 * @param {string} [options.hint] dòng phụ, ví dụ nhóm nguồn phát
 * @returns {HTMLElement}
 */
export function createLayerSlider({ id, label, value, onInput, hint }) {
  const row = document.createElement('div');
  row.className = 'slider-row';

  const labelElement = document.createElement('label');
  labelElement.className = 'slider-label';
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  if (hint) {
    const hintElement = document.createElement('span');
    hintElement.className = 'slider-hint';
    hintElement.textContent = hint;
    labelElement.append(' ', hintElement);
  }

  const input = document.createElement('input');
  input.type = 'range';
  input.id = id;
  input.min = '0';
  input.max = '1';
  input.step = '0.01';
  input.value = String(value);
  input.className = 'slider-input';

  const readout = document.createElement('output');
  readout.className = 'slider-readout';
  readout.htmlFor = id;

  const percent = (raw) => Math.round(raw * 100);
  const describe = (raw) => {
    const value = percent(raw);
    if (value === 0) return `${label} — đã tắt`;
    return `${label} — ${value} phần trăm`;
  };

  const render = () => {
    const raw = Number(input.value);
    readout.textContent = `${percent(raw)}%`;
    input.setAttribute('aria-valuetext', describe(raw));
    row.style.setProperty('--fill', String(raw));
  };

  input.addEventListener('input', () => {
    render();
    onInput(Number(input.value));
  });
  render();

  row.append(labelElement, input, readout);
  return row;
}
