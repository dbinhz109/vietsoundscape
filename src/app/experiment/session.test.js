import { describe, expect, test } from 'vitest';
import { createExperimentSession, REQUIRED_CONSENT_PURPOSES } from './session.js';

const LOCATIONS = ['hanoi-pho-co', 'hue-thien-mu', 'cai-rang', 'buon-e-de'];
/** Địa danh thật nhưng KHÔNG có trong bộ kích thích — chặn loại trừ (spec S1.1). */
const DISTRACTORS = ['sa-pa', 'hoi-an', 'da-lat', 'phu-quoc'];
const ANSWER_OPTIONS = [...LOCATIONS, ...DISTRACTORS];

/** Ba bản trộn mỗi vùng — đúng yêu cầu FR-59. */
const RECIPES = LOCATIONS.flatMap((location) =>
  [0, 1, 2].map((i) => ({ id: `${location}-mix${i}`, location_id: location })),
);

const start = (overrides = {}) =>
  createExperimentSession({
    participantIndex: 0,
    locations: LOCATIONS,
    recipes: RECIPES,
    answerOptions: ANSWER_OPTIONS,
    likertFields: ['pleasantness'],
    ...overrides,
  });

const consentAll = () => Object.fromEntries(REQUIRED_CONSENT_PURPOSES.map((p) => [p, true]));

/**
 * Trả lời lượt hiện tại. Khi không có lượt hiện tại (chưa đồng thuận, hoặc đã
 * xong) thì vẫn gọi `submit` với dữ liệu hợp lệ, để lỗi ném ra là lỗi của module
 * chứ không phải của hàm phụ này.
 */
const answer = (session, { correct = true, pleasantness = 3 } = {}) => {
  const trial = session.current();
  const guess = trial
    ? correct
      ? trial.location_id
      : LOCATIONS.find((l) => l !== trial.location_id)
    : LOCATIONS[0];
  return session.submit({ guess, likert: { pleasantness } });
};

describe('đồng thuận — cổng bắt buộc trước mọi thứ khác', () => {
  test('phiên bắt đầu ở bước đồng thuận, chưa có lượt nào', () => {
    const session = start();
    expect(session.state()).toBe('consent');
    expect(session.current()).toBeNull();
  });

  test('không nghe được gì khi chưa đồng thuận', () => {
    expect(() => answer(start())).toThrow(/đồng thuận/i);
  });

  test('thiếu một mục đích thì chưa vào được', () => {
    // Luật 91/2025 Điều 9 khoản 4 điểm a: đồng thuận theo TỪNG mục đích, và
    // điểm b cấm gộp. Nên thiếu một ô là chưa đủ, không phải "gần đủ".
    const session = start();
    const partial = { ...consentAll(), [REQUIRED_CONSENT_PURPOSES[0]]: false };
    expect(() => session.giveConsent(partial)).toThrow(/mục đích/i);
    expect(session.state()).toBe('consent');
  });

  test('không trả lời cũng là không đồng ý', () => {
    // Điều 9 khoản 4 điểm d: im lặng hoặc không phản hồi không được coi là đồng ý.
    expect(() => start().giveConsent({})).toThrow(/mục đích/i);
  });

  test('đồng thuận đủ thì vào lượt đầu', () => {
    const session = start();
    session.giveConsent(consentAll());
    expect(session.state()).toBe('trial');
    expect(session.current().order).toBe(1);
  });

  test('ghi lại thời điểm đồng thuận để lưu bằng chứng', () => {
    // Nghị định 356 Điều 6 khoản 2: tranh chấp thì BÊN KIỂM SOÁT phải chứng minh
    // đã có đồng thuận, đồng thuận lúc nào và nội dung gì.
    const session = start({ now: () => '2026-09-14T05:30:00+07:00' });
    session.giveConsent(consentAll());
    expect(session.toLog().consent.at).toBe('2026-09-14T05:30:00+07:00');
    expect(session.toLog().consent.purposes).toEqual(consentAll());
  });
});

describe('trình tự lượt nghe', () => {
  const running = (overrides) => {
    const session = start(overrides);
    session.giveConsent(consentAll());
    return session;
  };

  test('số lượt bằng số địa điểm, mỗi địa điểm một lần', () => {
    const session = running();
    const seen = [];
    for (let i = 0; i < LOCATIONS.length; i += 1) {
      seen.push(session.current().location_id);
      answer(session);
    }
    expect(new Set(seen).size).toBe(LOCATIONS.length);
    expect(session.state()).toBe('complete');
  });

  test('mỗi lượt trỏ tới đúng tệp kích thích đã kết xuất', () => {
    const trial = running().current();
    expect(trial.stimulus_id).toBe(`${trial.recipe_id}--${trial.condition}`);
    expect(RECIPES.some((r) => r.id === trial.recipe_id)).toBe(true);
  });

  test('người khác nhau nhận bản trộn khác nhau cho cùng địa điểm', () => {
    // Đây là lý do FR-59 đòi 3 bản trộn mỗi vùng. Nếu ai cũng nghe đúng một bản
    // thì kết quả có thể chỉ phản ánh bản trộn đó, không phản ánh vùng miền —
    // và bộ dữ liệu 12 bản trộn trở thành công sức bỏ phí.
    const recipeFor = (participantIndex, location) => {
      const session = running({ participantIndex });
      for (let i = 0; i < LOCATIONS.length; i += 1) {
        if (session.current().location_id === location) return session.current().recipe_id;
        answer(session);
      }
      return null;
    };
    const used = new Set([0, 1, 2].map((p) => recipeFor(p, 'hue-thien-mu')));
    expect(used.size).toBeGreaterThan(1);
  });

  test('96 người được cân bằng bản trộn × điều kiện trong từng địa điểm', () => {
    const cells = {};
    for (let participantIndex = 0; participantIndex < 96; participantIndex += 1) {
      const session = running({ participantIndex });
      for (let order = 0; order < LOCATIONS.length; order += 1) {
        const trial = session.current();
        const key = `${trial.location_id}|${trial.recipe_id}|${trial.condition}`;
        cells[key] = (cells[key] ?? 0) + 1;
        answer(session);
      }
    }
    const counts = Object.values(cells);
    expect(counts).toHaveLength(LOCATIONS.length * 3 * 3);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  test('không lộ đúng sai sau mỗi lượt', () => {
    // Báo đúng/sai là dạy người tham gia giữa chừng: các lượt sau không còn đo
    // cùng một thứ với lượt đầu.
    const session = running();
    const result = answer(session, { correct: true });
    expect(JSON.stringify(result)).not.toMatch(/correct|đúng/i);
  });

  test('hết lượt thì không còn lượt hiện tại', () => {
    const session = running();
    for (let i = 0; i < LOCATIONS.length; i += 1) answer(session);
    expect(session.current()).toBeNull();
    expect(() => answer(session)).toThrow(/đã xong/i);
  });
});

describe('chặn quay lại và sửa câu trả lời', () => {
  const running = () => {
    const session = start();
    session.giveConsent(consentAll());
    return session;
  };

  test('không có đường quay lại lượt trước', () => {
    const session = running();
    expect(session.back).toBeUndefined();
  });

  test('đã trả lời thì lượt đó chốt, nộp lại báo lỗi', () => {
    const session = running();
    const trial = session.current();
    answer(session);
    expect(() => session.submitFor(trial.order, { guess: 'hanoi-pho-co', likert: {} })).toThrow(
      /đã trả lời/i,
    );
  });

  test('thiếu câu đoán vùng miền thì không nộp được', () => {
    const session = running();
    expect(() => session.submit({ likert: { pleasantness: 3 } })).toThrow(/đoán/i);
  });

  test('đoán một vùng không có trong danh sách thì báo lỗi', () => {
    const session = running();
    expect(() => session.submit({ guess: 'da-nang', likert: { pleasantness: 3 } })).toThrow(
      /da-nang/,
    );
  });

  test('thiếu điểm Likert thì không nộp được — kiểm định cần đủ trường', () => {
    const session = running();
    expect(() => session.submit({ guess: 'hanoi-pho-co', likert: {} })).toThrow(/pleasantness/);
  });
});

describe('toLog — đúng format mà npm run analyse đọc được', () => {
  const finished = () => {
    const session = start({ now: () => '2026-09-14T05:30:00+07:00' });
    session.giveConsent(consentAll());
    for (let i = 0; i < LOCATIONS.length; i += 1) answer(session, { correct: i % 2 === 0 });
    return session;
  };

  test('có đủ các trường mà kiểm định cần', () => {
    const log = finished().toLog();
    expect(log.design).toBe('within-subject');
    expect(log.likert_fields).toEqual(['pleasantness']);
    for (const trial of log.trials) {
      expect(trial).toMatchObject({
        participant_index: expect.any(Number),
        order: expect.any(Number),
        location_id: expect.any(String),
        condition: expect.any(String),
        correct: expect.any(Boolean),
        pleasantness: expect.any(Number),
      });
    }
  });

  test('đúng/sai tính từ câu đoán so với đáp án, không do người tham gia tự khai', () => {
    const log = finished().toLog();
    expect(log.trials.map((t) => t.correct)).toEqual([true, false, true, false]);
  });

  test('giữ nguyên câu đoán để kiểm lại và để phân tích nhầm lẫn giữa các vùng', () => {
    const log = finished().toLog();
    expect(log.trials.every((t) => typeof t.guess === 'string')).toBe(true);
  });

  test('phiên chưa xong vẫn xuất được log, kèm cờ chưa hoàn thành', () => {
    const session = start();
    session.giveConsent(consentAll());
    answer(session);
    const log = session.toLog();
    expect(log.complete).toBe(false);
    expect(log.trials).toHaveLength(1);
  });

  test('phiên xong thì đánh dấu hoàn thành', () => {
    expect(finished().toLog().complete).toBe(true);
  });
});

describe('danh sách trả lời — phương án nhiễu chặn heuristic loại trừ (spec S1.1)', () => {
  // Mỗi người nghe mỗi vùng đúng một lần. Nếu danh sách trả lời = đúng bốn vùng
  // đó thì nhớ ba câu trước là lượt 4 chỉ còn một lựa chọn. Tỉ lệ đúng bị thổi
  // lên, McNemar mất lực, và không phép kiểm nào trên log phát hiện được.
  const running = (overrides) => {
    const session = start(overrides);
    session.giveConsent(consentAll());
    return session;
  };

  test('bắt buộc khai answerOptions', () => {
    expect(() => start({ answerOptions: undefined })).toThrow(/answerOptions/);
  });

  test('answerOptions không có phương án nhiễu thì ném lỗi — đó là thiết kế có lỗ', () => {
    expect(() => start({ answerOptions: [...LOCATIONS] })).toThrow(/nhiễu|loại trừ/i);
  });

  test('answerOptions thiếu một vùng thật thì ném lỗi', () => {
    expect(() => start({ answerOptions: [...LOCATIONS.slice(1), ...DISTRACTORS] })).toThrow(
      /hanoi-pho-co/,
    );
  });

  test('answerOptions có mã trùng thì ném lỗi', () => {
    expect(() => start({ answerOptions: [...ANSWER_OPTIONS, 'hue-thien-mu'] })).toThrow(
      /hue-thien-mu/,
    );
  });

  test('mỗi lượt kèm danh sách trả lời đủ vùng thật lẫn nhiễu', () => {
    const trial = running().current();
    expect([...trial.answer_options].sort()).toEqual([...ANSWER_OPTIONS].sort());
  });

  test('thứ tự danh sách khác nhau giữa lượt 1 và lượt 2 của cùng người', () => {
    const session = running();
    const first = session.current().answer_options;
    answer(session);
    const second = session.current().answer_options;
    expect(first).not.toEqual(second);
    expect([...first].sort()).toEqual([...second].sort());
  });

  test('dựng lại cùng participantIndex thì thứ tự y hệt', () => {
    const a = running({ participantIndex: 5 }).current().answer_options;
    const b = running({ participantIndex: 5 }).current().answer_options;
    expect(a).toHaveLength(ANSWER_OPTIONS.length);
    expect(a).toEqual(b);
  });

  test('chọn phương án nhiễu: nhận, chấm sai, không ném lỗi', () => {
    const session = running();
    expect(() => session.submit({ guess: 'sa-pa', likert: { pleasantness: 3 } })).not.toThrow();
    expect(session.toLog().trials[0]).toMatchObject({ guess: 'sa-pa', correct: false });
    expect(session.state()).toBe('trial');
  });

  test('log ghi danh sách gốc và thứ tự đã hiện ở từng lượt', () => {
    // Để phân tích thiên lệch vị trí về sau, và để tính mức đoán mò 1/N đúng N.
    const session = running();
    const shown = session.current().answer_options;
    answer(session);
    const log = session.toLog();
    expect(log.answer_options).toEqual(ANSWER_OPTIONS);
    expect(log.trials[0].answer_options).toEqual(shown);
  });
});
