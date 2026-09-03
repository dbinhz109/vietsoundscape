// @vitest-environment happy-dom
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createExperimentView } from './experiment-view.js';
import { REQUIRED_CONSENT_PURPOSES, createExperimentSession } from './session.js';
import { ISO_ATTRIBUTES, ISO_ATTRIBUTE_KEYS } from '../../research/soundscape-scale.js';

const LOCATIONS = ['hanoi-pho-co', 'hue-thien-mu', 'cai-rang', 'buon-e-de'];
const LABELS = {
  'hanoi-pho-co': 'Phố cổ Hà Nội',
  'hue-thien-mu': 'Huế — chùa Thiên Mụ',
  'cai-rang': 'Chợ nổi Cái Răng',
  'buon-e-de': 'Buôn Ê Đê',
};
const RECIPES = LOCATIONS.map((location) => ({ id: `${location}-mix0`, location_id: location }));

const build = (overrides = {}) => {
  const root = document.createElement('div');
  document.body.append(root);
  const session = createExperimentSession({
    participantIndex: 0,
    locations: LOCATIONS,
    recipes: RECIPES,
    likertFields: ISO_ATTRIBUTE_KEYS,
    now: () => '2026-09-14T05:30:00+07:00',
  });
  const view = createExperimentView(root, {
    session,
    locationLabels: LABELS,
    // Tên tệp phải MỜ. Bản kết xuất đặt tên theo băm chính vì lý do này.
    stimulusUrl: (id) => `/stimuli/${opaque(id)}.wav`,
    onComplete: () => {},
    ...overrides,
  });
  return { root, session, view };
};

/** Giả lập cách đặt tên theo băm của `render-stimuli.mjs`. */
const opaque = (id) => {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0');
};

const $ = (root, selector) => root.querySelector(selector);
const $$ = (root, selector) => [...root.querySelectorAll(selector)];

/** Giả lập người tham gia nghe hết đoạn âm. */
const listenFully = (root) => {
  const audio = $(root, 'audio');
  audio.dispatchEvent(new Event('ended'));
};

/** Chấm một thuộc tính. */
const rateAttribute = (root, key, score) => {
  const radio = $$(root, `input[name="${key}"]`).find((i) => i.value === String(score));
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
};

const rateAll = (root, score = 3) => {
  for (const key of ISO_ATTRIBUTE_KEYS) rateAttribute(root, key, score);
};

const chooseAndSubmit = (root, { location = LOCATIONS[0], score = 3 } = {}) => {
  listenFully(root);
  const radio = $$(root, 'input[name="guess"]').find((input) => input.value === location);
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));

  rateAll(root, score);

  $(root, 'button[data-action="submit"]').click();
};

describe('màn hình đồng thuận', () => {
  beforeEach(() => document.body.replaceChildren());

  test('hiện một ô riêng cho mỗi mục đích', () => {
    const { root } = build();
    const boxes = $$(root, 'input[type="checkbox"][name="consent"]');
    expect(boxes.map((b) => b.value)).toEqual([...REQUIRED_CONSENT_PURPOSES]);
  });

  test('KHÔNG có ô nào tích sẵn', () => {
    // Nghị định 356 Điều 6 khoản 3 cấm đặt mặc định là đồng ý; Luật Điều 9 khoản
    // 4 điểm d nói im lặng không phải đồng ý. Tích sẵn là vi phạm cả hai.
    const { root } = build();
    expect($$(root, 'input[name="consent"]').every((b) => b.checked === false)).toBe(true);
  });

  test('nút bắt đầu bị khoá cho tới khi tích đủ', () => {
    const { root } = build();
    const start = $(root, 'button[data-action="start"]');
    expect(start.disabled).toBe(true);

    const boxes = $$(root, 'input[name="consent"]');
    boxes.forEach((box, index) => {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
      // Chỉ mở khoá ở ô cuối cùng.
      expect(start.disabled).toBe(index < boxes.length - 1);
    });
  });

  test('bỏ tích lại thì khoá lại', () => {
    const { root } = build();
    const boxes = $$(root, 'input[name="consent"]');
    for (const box of boxes) {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    boxes[1].checked = false;
    boxes[1].dispatchEvent(new Event('change', { bubbles: true }));
    expect($(root, 'button[data-action="start"]').disabled).toBe(true);
  });

  test('bấm bắt đầu thì chuyển sang lượt nghe đầu tiên', () => {
    const { root, session } = build();
    for (const box of $$(root, 'input[name="consent"]')) {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    $(root, 'button[data-action="start"]').click();
    expect(session.state()).toBe('trial');
    expect($(root, 'audio')).not.toBeNull();
  });
});

describe('màn hình lượt nghe', () => {
  const started = (overrides) => {
    const built = build(overrides);
    for (const box of $$(built.root, 'input[name="consent"]')) {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    $(built.root, 'button[data-action="start"]').click();
    return built;
  };

  beforeEach(() => document.body.replaceChildren());

  test('phát đúng tệp kích thích đã kết xuất', () => {
    const { root, session } = started();
    expect($(root, 'audio').getAttribute('src')).toBe(
      `/stimuli/${opaque(session.current().stimulus_id)}.wav`,
    );
  });

  test('KHÔNG lộ điều kiện hay đáp án ở bất cứ đâu trong trang', () => {
    // Người tham gia mở xem nguồn trang mà thấy "layered" hay "hue-thien-mu" là
    // hỏng lượt đó — và hỏng theo kiểu không ai biết, vì log vẫn ghi bình thường.
    const { root, session } = started();
    const trial = session.current();
    expect(root.innerHTML).not.toContain(trial.condition);
    expect(root.innerHTML).not.toContain(trial.recipe_id);
    // Tên vùng chỉ được xuất hiện trong danh sách lựa chọn, đủ cả bốn vùng nên
    // không gợi ý gì; nhưng mã vùng thì không được lộ ở thuộc tính nào.
    expect($(root, 'audio').getAttribute('src')).not.toContain(trial.location_id);
  });

  test('chặn cứng khi hàm dựng URL để lọt điều kiện ra tên tệp', () => {
    // Đây không phải trách nhiệm của người gọi. Cách đặt tên rò rỉ trông hoàn
    // toàn bình thường lúc viết, và không có phép kiểm nào ở tầng dưới bắt được.
    expect(() =>
      started({ stimulusUrl: (id) => `/stimuli/${id}.wav` }),
    ).toThrow(/lộ|rò rỉ/i);
  });

  test('liệt kê đủ các vùng để chọn, theo nhãn tiếng Việt', () => {
    const { root } = started();
    const radios = $$(root, 'input[name="guess"]');
    expect(radios.map((r) => r.value).sort()).toEqual([...LOCATIONS].sort());
    expect(root.textContent).toContain('Chợ nổi Cái Răng');
  });

  test('hỏi đủ 8 thuộc tính ISO 12913-2, ĐÚNG THỨ TỰ của bộ chuẩn', () => {
    // Thứ tự cố định là một phần của bộ đã được kiểm định. Đảo đi cho "đỡ nhàm"
    // là mất tính so sánh được với nghiên cứu quốc tế — mà đó là cả lý do dùng bộ này.
    const { root } = started();
    const groups = $$(root, 'fieldset[data-attribute]').map((f) => f.dataset.attribute);
    expect(groups).toEqual([...ISO_ATTRIBUTE_KEYS]);
    for (const attribute of ISO_ATTRIBUTES) {
      expect(root.textContent).toContain(attribute.statement_vi);
    }
  });

  test('nút nộp bị khoá cho tới khi NGHE HẾT đoạn âm', () => {
    // Không có ràng buộc này thì người ta bấm bừa qua nhanh, và lượt đó không đo
    // được gì — nhưng vẫn nằm trong dữ liệu như một lượt hợp lệ.
    const { root } = started();
    const submit = $(root, 'button[data-action="submit"]');
    expect(submit.disabled).toBe(true);

    const radio = $$(root, 'input[name="guess"]')[0];
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));
    rateAll(root);
    expect(submit.disabled).toBe(true);

    listenFully(root);
    expect(submit.disabled).toBe(false);
  });

  test('nghe hết rồi nhưng chưa chọn đủ thì vẫn khoá', () => {
    const { root } = started();
    listenFully(root);
    expect($(root, 'button[data-action="submit"]').disabled).toBe(true);
  });

  test('THIẾU MỘT thuộc tính thôi cũng vẫn khoá', () => {
    // Công thức ISO/TS 12913-3 cần đủ cả 8. Thiếu một là lượt đó không suy ra
    // được chiều nào — mất cả cặp của người tham gia đó ở phép kiểm.
    const { root } = started();
    listenFully(root);
    const radio = $$(root, 'input[name="guess"]')[0];
    radio.checked = true;
    radio.dispatchEvent(new Event('change', { bubbles: true }));

    for (const key of ISO_ATTRIBUTE_KEYS.slice(0, -1)) rateAttribute(root, key, 4);
    expect($(root, 'button[data-action="submit"]').disabled).toBe(true);

    rateAttribute(root, ISO_ATTRIBUTE_KEYS.at(-1), 4);
    expect($(root, 'button[data-action="submit"]').disabled).toBe(false);
  });

  test('ghi đủ 8 điểm thô vào log, không tự suy diễn ở giao diện', () => {
    // Suy diễn xảy ra lúc phân tích. Ghi điểm thô nghĩa là đổi công thức không
    // phải thu lại dữ liệu.
    const onComplete = vi.fn();
    const { root } = started({ onComplete });
    ISO_ATTRIBUTE_KEYS.forEach((key, index) => {
      if (index === 0) listenFully(root);
      rateAttribute(root, key, (index % 5) + 1);
    });
    const guess = $$(root, 'input[name="guess"]')[0];
    guess.checked = true;
    guess.dispatchEvent(new Event('change', { bubbles: true }));
    $(root, 'button[data-action="submit"]').click();
    for (let i = 1; i < LOCATIONS.length; i += 1) chooseAndSubmit(root);

    const first = onComplete.mock.calls[0][0].trials[0];
    ISO_ATTRIBUTE_KEYS.forEach((key, index) => {
      expect(first[key]).toBe((index % 5) + 1);
    });
    expect(first.pleasantness).toBeUndefined();
  });

  test('nộp xong thì sang lượt kế, đếm lượt cập nhật', () => {
    const { root, session } = started();
    expect($(root, '[data-region="progress"]').textContent).toMatch(/1.*4/);
    chooseAndSubmit(root);
    expect(session.current().order).toBe(2);
    expect($(root, '[data-region="progress"]').textContent).toMatch(/2.*4/);
  });

  test('KHÔNG báo đúng hay sai sau khi nộp', () => {
    const { root } = started();
    chooseAndSubmit(root);
    expect(root.textContent).not.toMatch(/đúng rồi|sai rồi|chính xác/i);
  });

  test('lượt mới thì xoá lựa chọn cũ và khoá lại nút nộp', () => {
    const { root } = started();
    chooseAndSubmit(root);
    expect($$(root, 'input[name="guess"]').every((r) => r.checked === false)).toBe(true);
    expect($(root, 'button[data-action="submit"]').disabled).toBe(true);
  });

  test('hết lượt thì sang màn hình kết thúc và gọi onComplete kèm log', () => {
    const onComplete = vi.fn();
    const { root } = started({ onComplete });
    for (let i = 0; i < LOCATIONS.length; i += 1) chooseAndSubmit(root);

    expect(onComplete).toHaveBeenCalledTimes(1);
    const log = onComplete.mock.calls[0][0];
    expect(log.complete).toBe(true);
    expect(log.trials).toHaveLength(4);
    expect($(root, 'audio')).toBeNull();
  });
});

describe('tiếp cận', () => {
  beforeEach(() => document.body.replaceChildren());

  test('nhóm lựa chọn dùng fieldset kèm legend', () => {
    const { root } = build();
    for (const box of $$(root, 'input[name="consent"]')) {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    $(root, 'button[data-action="start"]').click();
    const fieldsets = $$(root, 'fieldset');
    expect(fieldsets.length).toBeGreaterThanOrEqual(2);
    expect(fieldsets.every((f) => f.querySelector('legend')?.textContent.trim())).toBe(true);
  });

  test('mỗi ô chọn có nhãn gắn đúng qua for/id', () => {
    const { root } = build();
    for (const input of $$(root, 'input')) {
      expect(input.id).toBeTruthy();
      expect($(root, `label[for="${input.id}"]`)).not.toBeNull();
    }
  });

  test('vùng đổi nội dung được đánh dấu để trình đọc màn hình thông báo', () => {
    // Màn hình đồng thuận không có vùng nào tự đổi; cần thông báo là ở màn hình
    // lượt nghe (đếm lượt) và màn hình kết thúc.
    const { root } = build();
    for (const box of $$(root, 'input[name="consent"]')) {
      box.checked = true;
      box.dispatchEvent(new Event('change', { bubbles: true }));
    }
    $(root, 'button[data-action="start"]').click();
    expect($(root, '[data-region="progress"]').getAttribute('aria-live')).toBe('polite');

    for (let i = 0; i < LOCATIONS.length; i += 1) chooseAndSubmit(root);
    expect($(root, '[data-region="progress"]').getAttribute('aria-live')).toBe('polite');
  });

  test('destroy gỡ sạch nội dung', () => {
    const { root, view } = build();
    view.destroy();
    expect(root.childNodes).toHaveLength(0);
  });
});
