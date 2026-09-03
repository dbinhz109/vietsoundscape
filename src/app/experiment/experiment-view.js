/**
 * Lớp hiển thị của chế độ thực nghiệm (việc C3.1).
 *
 * Mỏng có chủ ý: mọi luật về trình tự, đồng thuận và chấm điểm nằm ở
 * `session.js`. Ở đây chỉ có hiển thị và ba ràng buộc mà **chỉ giao diện mới
 * chặn được**:
 *
 *  1. **Không tích sẵn ô đồng thuận nào**, và nút bắt đầu khoá tới khi tích đủ
 *     — Nghị định 356 Điều 6 khoản 3 cấm đặt mặc định là đồng ý.
 *  2. **Phải nghe hết đoạn âm mới nộp được.** Không có ràng buộc này thì người
 *     ta bấm bừa qua nhanh, và lượt đó không đo được gì nhưng vẫn nằm trong dữ
 *     liệu như một lượt hợp lệ — tệ hơn là thiếu dữ liệu, vì nó trông hợp lệ.
 *  3. **Không để lộ điều kiện hay đáp án trong DOM.** Người tham gia mở xem
 *     nguồn trang mà thấy `layered` hay tên vùng là hỏng lượt đó. Chỉ mã kích
 *     thích xuất hiện, trong thuộc tính `src`.
 *  4. **Ô vùng thật và ô nhiễu dựng giống hệt nhau.** Danh sách trả lời có
 *     phương án nhiễu (spec S1.1); một class hay thuộc tính khác biệt giữa hai
 *     nhóm là đủ để lọc ra bốn đáp án có thể đúng. Thứ tự ô do phiên quyết
 *     (`trial.answer_options`), giao diện chỉ vẽ theo.
 */

import { REQUIRED_CONSENT_PURPOSES } from './session.js';
import { AGREEMENT_SCALE, ISO_ATTRIBUTES } from '../../research/soundscape-scale.js';

/** Nội dung các ô đồng thuận — khớp văn bản `phap-ly/07`. Sửa một bên thì sửa cả hai. */
const CONSENT_LABELS = Object.freeze({
  participate: 'Tôi đồng ý tham gia phiên nghe và trả lời câu hỏi.',
  analysis: 'Tôi đồng ý cho nhóm dùng câu trả lời của tôi để phân tích, kiểm chứng giả thuyết.',
  open_dataset: 'Tôi đồng ý công bố bộ dữ liệu đã ẩn danh kèm báo cáo nghiên cứu.',
});

/** Câu dẫn của Phương pháp A, ISO 12913-2 Phụ lục C. */
const LIKERT_LEGEND =
  'Với khung cảnh âm thanh vừa nghe, bạn đồng ý ở mức nào rằng nó…';

const el = (tag, props = {}, children = []) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'text') node.textContent = value;
    else if (value !== null && value !== undefined) node.setAttribute(key, String(value));
  }
  node.append(...children);
  return node;
};

/**
 * Ô chọn kèm nhãn gắn đúng qua for/id — dùng cho cả checkbox lẫn radio.
 *
 * `ariaLabel` cho hàng thang điểm: mắt chỉ cần thấy con số (chú giải nằm ở đầu
 * nhóm), còn trình đọc màn hình phải nghe đủ chữ, vì nó đọc từng ô một và không
 * có ngữ cảnh của bảng.
 */
const choice = ({ type, name, value, id, label, ariaLabel = null, itemClass = 'choice' }) =>
  el('div', { class: itemClass }, [
    el('input', { type, name, value, id, 'aria-label': ariaLabel }),
    el('label', { for: id, text: label }),
  ]);

/**
 * @param {HTMLElement} root
 * @param {object} config
 * @param {ReturnType<import('./session.js').createExperimentSession>} config.session
 * @param {Record<string, string>} config.optionLabels Nhãn tiếng Việt cho MỌI mã
 *   trong danh sách trả lời — vùng thật lẫn phương án nhiễu. Thiếu mã nào thì ném
 *   lỗi, không hiện mã thô: hiện khác đi cho riêng một ô là một gợi ý.
 * @param {(stimulusId: string) => string} config.stimulusUrl
 * @param {(log: object) => void} config.onComplete
 * @param {{key: string, statement_vi: string}[]} [config.attributes]
 * @param {{value: number, label_vi: string}[]} [config.scale]
 * @param {string} [config.likertLegend]
 */
export function createExperimentView(root, {
  session,
  optionLabels,
  stimulusUrl,
  onComplete,
  attributes = ISO_ATTRIBUTES,
  scale = AGREEMENT_SCALE,
  likertLegend = LIKERT_LEGEND,
}) {
  /** Nhãn cho một phương án — không có thì dừng, vì mã thô là một khác biệt nhìn thấy được. */
  const labelFor = (id) => {
    const label = optionLabels[id];
    if (typeof label !== 'string' || label.trim() === '') {
      throw new Error(
        `Thiếu nhãn cho phương án "${id}" trong optionLabels. Hiện mã thô cho riêng một ô là ` +
          'để nó khác các ô còn lại — và khác biệt là gợi ý về đáp án.',
      );
    }
    return label;
  };

  function renderConsent() {
    const boxes = REQUIRED_CONSENT_PURPOSES.map((purpose) =>
      choice({
        type: 'checkbox',
        name: 'consent',
        value: purpose,
        id: `consent-${purpose}`,
        label: CONSENT_LABELS[purpose] ?? purpose,
      }),
    );

    const start = el('button', {
      type: 'button',
      'data-action': 'start',
      disabled: 'disabled',
      text: 'Bắt đầu',
    });

    const fieldset = el('fieldset', {}, [
      el('legend', { text: 'Đồng thuận tham gia' }),
      ...boxes,
    ]);

    // Hỏi riêng từng mục đích, và mở khoá chỉ khi đủ cả ba — Luật Điều 9 khoản 4
    // điểm a và b. Không gộp thành một ô "tôi đồng ý tất cả".
    fieldset.addEventListener('change', () => {
      const checked = [...fieldset.querySelectorAll('input[name="consent"]')].filter(
        (input) => input.checked,
      );
      if (checked.length === REQUIRED_CONSENT_PURPOSES.length) start.removeAttribute('disabled');
      else start.setAttribute('disabled', 'disabled');
    });

    start.addEventListener('click', () => {
      session.giveConsent(
        Object.fromEntries(REQUIRED_CONSENT_PURPOSES.map((purpose) => [purpose, true])),
      );
      render();
    });

    root.replaceChildren(
      el('h2', { text: 'Trước khi bắt đầu' }),
      el('p', {
        text:
          'Bạn sẽ nghe bốn đoạn âm thanh, mỗi đoạn khoảng một phút, và đoán xem đoạn đó thu ở ' +
          'đâu. Danh sách để chọn có nhiều địa điểm hơn số đoạn bạn sẽ nghe — không phải nơi ' +
          'nào trong danh sách cũng xuất hiện. Không có đáp án đúng nào bị chấm điểm về phía bạn.',
      }),
      fieldset,
      start,
    );
  }

  function renderTrial() {
    const trial = session.current();
    let listened = false;

    const progress = el('p', {
      'data-region': 'progress',
      'aria-live': 'polite',
      text: `Đoạn ${trial.order} trên ${trial.total}`,
    });

    // Mã kích thích là `<bản trộn>--<điều kiện>`, mà mã bản trộn lại chứa tên
    // vùng. Đưa thẳng nó vào `src` là người tham gia mở xem nguồn trang thấy cả
    // điều kiện lẫn đáp án — và hỏng theo kiểu không ai biết, vì log vẫn ghi
    // bình thường. Nên tệp kết xuất đặt tên theo băm, và chỗ này kiểm lại.
    const source = stimulusUrl(trial.stimulus_id);
    for (const [what, secret] of [
      ['điều kiện', trial.condition],
      ['mã bản trộn', trial.recipe_id],
      ['mã địa điểm', trial.location_id],
    ]) {
      if (source.includes(secret)) {
        throw new Error(
          `URL kích thích "${source}" để lộ ${what} ("${secret}"). Người tham gia xem nguồn ` +
            'trang là đoán được đáp án. Dùng tên tệp mờ — bản kết xuất đặt tên theo băm ' +
            '(xem `opaque_name` trong build/stimuli/manifest.json).',
        );
      }
    }

    const audio = el('audio', { src: source, controls: 'controls', preload: 'auto' });

    const submit = el('button', {
      type: 'button',
      'data-action': 'submit',
      disabled: 'disabled',
      text: 'Gửi câu trả lời',
    });

    // Thứ tự do phiên quyết (xáo theo người × lượt, dựng lại được). Vẽ đúng theo
    // đó, và vẽ mọi ô bằng cùng một hàm — vùng thật hay nhiễu đều không phân biệt
    // được từ DOM (xem luật 4 ở đầu tệp).
    const guessFieldset = el('fieldset', { 'data-region': 'question' }, [
      el('legend', { text: 'Theo bạn, đoạn âm này thu ở đâu?' }),
      ...trial.answer_options.map((option) =>
        choice({
          type: 'radio',
          name: 'guess',
          value: option,
          id: `guess-${trial.order}-${option}`,
          label: labelFor(option),
        }),
      ),
    ]);

    // Một nhóm cho mỗi thuộc tính, theo đúng thứ tự của bộ chuẩn. Nhãn từng mức
    // lặp lại ở mọi hàng nhưng chỉ hiện một lần trên đầu — trình đọc màn hình
    // vẫn đọc đủ, mắt thì không phải đọc 40 lần cùng một chuỗi chữ.
    const likertFieldset = el('fieldset', { 'data-region': 'likert' }, [
      el('legend', { text: likertLegend }),
      el(
        'ol',
        { class: 'scale-key', 'aria-hidden': 'true' },
        scale.map((step) => el('li', { text: `${step.value}. ${step.label_vi}` })),
      ),
      ...attributes.map((attribute) =>
        el('fieldset', { class: 'attribute', 'data-attribute': attribute.key }, [
          el('legend', { text: attribute.statement_vi }),
          el(
            'div',
            { class: 'scale-row' },
            scale.map((step) =>
              choice({
                type: 'radio',
                name: attribute.key,
                value: step.value,
                id: `${attribute.key}-${trial.order}-${step.value}`,
                label: String(step.value),
                ariaLabel: `${attribute.statement_vi} — ${step.label_vi}`,
                itemClass: 'scale-point',
              }),
            ),
          ),
        ]),
      ),
    ]);

    const selected = (name) =>
      [...root.querySelectorAll(`input[name="${name}"]`)].find((input) => input.checked);

    // Đủ CẢ 8 mới mở khoá: công thức ISO/TS 12913-3 cần đủ tám thuộc tính, thiếu
    // một là lượt đó không suy ra được chiều nào — mất cả cặp của người đó.
    const refresh = () => {
      const ready =
        listened &&
        selected('guess') &&
        attributes.every((attribute) => selected(attribute.key));
      if (ready) submit.removeAttribute('disabled');
      else submit.setAttribute('disabled', 'disabled');
    };

    // Nghe hết mới nộp được. Bấm bừa qua nhanh cho ra một lượt trông hợp lệ mà
    // không đo được gì — tệ hơn là thiếu dữ liệu, vì nó lọt qua mọi phép kiểm.
    audio.addEventListener('ended', () => {
      listened = true;
      refresh();
    });
    guessFieldset.addEventListener('change', refresh);
    likertFieldset.addEventListener('change', refresh);

    submit.addEventListener('click', () => {
      session.submit({
        guess: selected('guess').value,
        // Ghi **điểm thô** của cả 8 thuộc tính. Suy ra hai chiều là việc của
        // tầng phân tích, nên đổi công thức không phải thu lại dữ liệu.
        likert: Object.fromEntries(
          attributes.map((attribute) => [attribute.key, Number(selected(attribute.key).value)]),
        ),
      });
      // Cố ý không hiện đúng/sai: báo kết quả là dạy người tham gia giữa chừng.
      render();
    });

    root.replaceChildren(progress, audio, guessFieldset, likertFieldset, submit);
  }

  function renderComplete() {
    root.replaceChildren(
      el('h2', { text: 'Xong rồi — cảm ơn bạn' }),
      el('p', {
        'data-region': 'progress',
        'aria-live': 'polite',
        text: 'Câu trả lời của bạn đã được ghi lại. Bạn có thể đóng trang này.',
      }),
    );
    onComplete(session.toLog());
  }

  function render() {
    const state = session.state();
    if (state === 'consent') renderConsent();
    else if (state === 'trial') renderTrial();
    else renderComplete();
  }

  render();

  return {
    render,
    destroy: () => root.replaceChildren(),
  };
}
