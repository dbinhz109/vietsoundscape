#!/usr/bin/env node
/**
 * Chạy kiểm định H1 và H2 trên log lượt nghe (việc M6).
 *
 *   npm run analyse -- build/log/nguoi-001.json            — một người
 *   npm run analyse -- build/log/*.json                    — cả mẻ, gộp lại
 *   npm run analyse -- build/log/                          — cả thư mục
 *   npm run analyse -- --demo                     — sinh dữ liệu GIẢ LẬP để xem format log
 *   npm run analyse -- --demo --save mau-log.json — ghi log giả lập ra tệp (để đối chiếu R)
 *
 * Script này định nghĩa luôn **format log mà chế độ thực nghiệm phải ghi**. Đây là
 * chiều phụ thuộc có chủ ý: kiểm định quyết định cần ghi gì, chứ không phải ghi
 * được gì thì kiểm cái đó. Thiếu một trường là mất một giả thuyết.
 *
 * ```json
 * {
 *   "design": "within-subject",
 *   "likert_fields": ["pleasantness", "eventfulness"],
 *   "trials": [
 *     { "participant_index": 0, "order": 1, "location_id": "hue-thien-mu",
 *       "condition": "layered", "correct": true, "pleasantness": 4 }
 *   ]
 * }
 * ```
 *
 * Hai phép so sánh, không phải một:
 *   · `layered` vs `isolated`  — tính đồng thời (H1 như thuyết minh phát biểu)
 *   · `layered` vs `scrambled` — tính mạch lạc vùng miền (FR-58, chữ "có chủ đích")
 *
 * Chỉ chạy phép đầu thì kết quả dương tính vẫn giải thích được bằng "nhiều thông
 * tin hơn thì đoán đúng hơn".
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mcnemarTest, pairResponses, wilcoxonSignedRankTest } from '../src/research/statistics.js';
import { mcnemarEffect, wilcoxonEffect } from '../src/research/effect-size.js';
import { ISO_ATTRIBUTE_KEYS, deriveIsoDimensions } from '../src/research/soundscape-scale.js';
import {
  REQUIRED_CONSENT_PURPOSES,
  createExperimentSession,
} from '../src/app/experiment/session.js';
import { createRng } from '../src/audio/trigger.js';
import { composeAnswerOptions } from '../src/research/answer-options.js';
import { mergeParticipantLogs } from '../src/research/merge-logs.js';

const args = process.argv.slice(2);
const demo = args.includes('--demo');
const saveIndex = args.indexOf('--save');
const savePath = saveIndex >= 0 ? args[saveIndex + 1] : null;
/**
 * Mọi đối số không phải cờ đều là tệp log — **không chỉ cái đầu tiên**.
 *
 * Trang phiên nghe cho mỗi người tải về một tệp riêng, nên lúc phân tích sẽ có
 * 96 tệp. Bản trước lấy `args.find(...)` nên `npm run analyse -- log/*.json`
 * chạy trót lọt và **im lặng** báo n = 1. Lỗi tìm được lúc diễn tập trọn đường
 * ống, trước khi tuyển người.
 */
const paths = args.filter((a, i) => !a.startsWith('--') && (saveIndex < 0 || i !== saveIndex + 1));

/** Đưa vào thư mục thì lấy mọi tệp .json trong đó. */
const expandPaths = (list) =>
  list.flatMap((entry) => {
    if (!statSync(entry).isDirectory()) return [entry];
    return readdirSync(entry)
      .filter((name) => name.endsWith('.json'))
      .sort()
      .map((name) => join(entry, name));
  });

/**
 * Sinh log giả lập để xem format và kiểm đường ống. KHÔNG phải kết quả nghiên cứu.
 *
 * Chạy qua **chính `createExperimentSession`** mà chế độ thực nghiệm sẽ dùng, chứ
 * không tự bịa cấu trúc log. Nhờ vậy `--demo` là phép kiểm thật cho hợp đồng
 * format: nếu máy trạng thái phiên đổi trường nào mà script này không đọc được
 * nữa, chạy demo là lộ ngay.
 */
function demoData() {
  const recipes = readdirSync(join(process.cwd(), 'data', 'recipes'))
    .filter((name) => name.endsWith('.json') && name !== 'index.json')
    .map((name) => JSON.parse(readFileSync(join(process.cwd(), 'data', 'recipes', name), 'utf-8')))
    .map((recipe) => ({ id: recipe.id, location_id: recipe.location_id }));
  const locations = [...new Set(recipes.map((r) => r.location_id))].sort();
  // Danh sách trả lời thật: vùng thật + phương án nhiễu (spec S1.1). Câu đoán sai
  // trong demo phải rơi vào cả nhiễu, không thì demo không kiểm được đường đó.
  const { distractors } = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'distractors.json'), 'utf-8'),
  );
  const answerOptions = composeAnswerOptions(
    locations,
    distractors.map((d) => d.location_id),
  );

  const rng = createRng(20260806);
  // Tỉ lệ đoán đúng giả định theo điều kiện — con số bịa để thử đường ống.
  const hitRate = { layered: 0.72, isolated: 0.5, scrambled: 0.42 };
  const consent = Object.fromEntries(REQUIRED_CONSENT_PURPOSES.map((p) => [p, true]));

  const trials = [];
  for (let participantIndex = 0; participantIndex < 48; participantIndex += 1) {
    const session = createExperimentSession({
      participantIndex,
      locations,
      recipes,
      answerOptions,
      likertFields: ISO_ATTRIBUTE_KEYS,
      now: () => '2026-09-14T05:30:00+07:00',
    });
    session.giveConsent(consent);

    // Mỗi người dùng thang một kiểu — có người chấm rộng, có người dồn về giữa.
    // Không có khác biệt cá nhân thì dữ liệu giả cho cỡ hiệu ứng hoàn hảo
    // (rank-biserial = 1,000) ở cả bốn phép kiểm, trông như đường ống hỏng.
    const personalBias = (rng() - 0.5) * 1.6;

    while (session.state() === 'trial') {
      const trial = session.current();
      const willBeCorrect = rng() < hitRate[trial.condition];
      // Đoán sai thì chọn ngẫu nhiên trong các ô còn lại — vùng thật khác hay nhiễu.
      const others = trial.answer_options.filter((id) => id !== trial.location_id);
      const wrongGuess = others[Math.floor(rng() * others.length)];
      session.submit({
        guess: willBeCorrect ? trial.location_id : wrongGuess,
        likert: fakeRatings(trial.condition, rng, personalBias),
      });
    }
    trials.push(...session.toLog().trials);
  }

  return {
    design: 'within-subject',
    likert_fields: [...ISO_ATTRIBUTE_KEYS],
    trials,
    synthetic: true,
  };
}

/**
 * Điểm 8 thuộc tính giả lập. Giả định bịa: bản `layered` nghe **dễ chịu và sống
 * động hơn**, bản `scrambled` nghe **hỗn loạn hơn**. Chấm điểm từng thuộc tính rồi
 * để công thức ISO tự suy ra hai chiều — chứ không bịa thẳng ra hai chiều, vì làm
 * thế thì `--demo` không còn kiểm được bước suy diễn.
 */
function fakeRatings(condition, rng, personalBias) {
  const clamp = (x) => Math.max(1, Math.min(5, Math.round(x)));
  const nudge = {
    layered: { pleasant: 1, vibrant: 1, calm: 0.4, chaotic: -0.5, monotonous: -0.8 },
    isolated: { monotonous: 0.8, uneventful: 0.6, vibrant: -0.6 },
    scrambled: { chaotic: 1.1, annoying: 0.7, pleasant: -0.6, calm: -0.8 },
  }[condition];
  return Object.fromEntries(
    ISO_ATTRIBUTE_KEYS.map((key) => [
      key,
      clamp(3 + personalBias + (nudge[key] ?? 0) + (rng() - 0.5) * 2.4),
    ]),
  );
}

let data;
if (demo) {
  data = demoData();
  if (savePath) {
    // Cùng một tệp cho `npm run analyse` và `nghien-cuu/doi-chieu.R` — đối chiếu
    // hai bản cài đặt độc lập trên đúng một đầu vào (spec S4.2).
    writeFileSync(savePath, `${JSON.stringify(data, null, 2)}\n`);
    console.log(`Đã ghi log giả lập ra ${savePath}\n`);
  }
  console.log(
    '╔══════════════════════════════════════════════════════════════════════╗\n' +
      '║  DỮ LIỆU GIẢ LẬP — sinh bằng số ngẫu nhiên có seed.                  ║\n' +
      '║  Đây KHÔNG phải kết quả nghiên cứu. Chỉ để xem format log và kiểm    ║\n' +
      '║  đường ống phân tích chạy được.                                      ║\n' +
      '╚══════════════════════════════════════════════════════════════════════╝\n',
  );
} else if (paths.length === 0) {
  console.error('Cần đường dẫn tệp log (một tệp, nhiều tệp, hoặc một thư mục), hoặc --demo để xem format.');
  process.exit(1);
} else {
  const files = expandPaths(paths);
  data = mergeParticipantLogs(files.map((file) => JSON.parse(readFileSync(file, 'utf-8'))));
  console.log(`Đọc ${files.length} tệp log.`);
  for (const item of data.excluded ?? []) {
    console.log(`  ⚠ loại người ${item.participant_index ?? '?'}: ${item.reason}`);
  }
}

const trials = data.trials ?? [];
if (trials.length === 0) {
  console.error('Log không có lượt nghe nào.');
  process.exit(1);
}

const participants = new Set(trials.map((t) => t.participant_index)).size;
console.log(`Log: ${trials.length} lượt nghe · ${participants} người tham gia · thiết kế ${data.design ?? '?'}`);

// Câu đoán sai rơi vào đâu: vùng thật khác (nhầm nơi này với nơi kia) hay phương
// án nhiễu (spec S1.1). Tỉ lệ nhiễu ≈ 0 trên dữ liệu thật là dấu hiệu người tham
// gia vẫn loại trừ được — phải xem lại danh sách nhiễu, không phải mừng.
const realLocations = new Set(trials.map((t) => t.location_id));
const wrong = trials.filter((t) => t.correct === false);
const intoDistractor = wrong.filter((t) => !realLocations.has(t.guess)).length;
if (wrong.length > 0) {
  console.log(
    `Câu đoán sai: ${wrong.length} — ${wrong.length - intoDistractor} vào vùng thật khác, ` +
      `${intoDistractor} vào phương án nhiễu`,
  );
}

/**
 * Log ghi **8 thuộc tính thô** của ISO 12913-2; kiểm định chạy trên **hai chiều**
 * suy ra bằng công thức ISO/TS 12913-3.
 *
 * Không chạy Wilcoxon thẳng trên cả 8: 8 thuộc tính × 2 phép so sánh là 16 kiểm
 * định, mà với α = 0,05 thì xác suất có ít nhất một dương tính giả xấp xỉ 56%.
 * Suy ra hai chiều rồi kiểm hai chiều đó là 4 kiểm định — và đó cũng là cách
 * ISO/TS 12913-3 định dùng bộ này.
 *
 * Log cũ chỉ có một trường tự soạn vẫn chạy được, chỉ là không suy diễn gì.
 */
function prepareLikert(fields, rows) {
  const hasIsoSet = ISO_ATTRIBUTE_KEYS.every((key) => fields.includes(key));
  if (!hasIsoSet) return { fields, rows, derived: false };
  return {
    fields: ['pleasantness', 'eventfulness'],
    rows: rows.map((row) => ({ ...row, ...deriveIsoDimensions(row) })),
    derived: true,
  };
}

const likert = prepareLikert(data.likert_fields ?? [], trials);
if (likert.derived) {
  console.log(
    `Thang cảm nhận: ISO 12913-2 Phương pháp A, 8 thuộc tính thô → hai chiều của\n` +
      'ISO/TS 12913-3 (pleasantness, eventfulness), mỗi chiều trong [−1, 1].',
  );
} else if (likert.fields.length > 0) {
  console.log(
    `Thang cảm nhận: ${likert.fields.length} trường tự soạn (${likert.fields.join(', ')}). ` +
      'Không so sánh được với nghiên cứu quốc tế — xem `src/research/soundscape-scale.js`.',
  );
}

const COMPARISONS = [
  {
    a: 'layered',
    b: 'isolated',
    label: 'H1 — phân lớp vs âm rời rạc',
    isolates: 'tính đồng thời',
  },
  {
    a: 'layered',
    b: 'scrambled',
    label: 'FR-58 — phân lớp đúng vùng vs sai vùng',
    isolates: 'tính mạch lạc vùng miền (chữ "có chủ đích" trong H1)',
  },
];

const pct = (value) => `${(value * 100).toFixed(1)}%`;

const report = (result, favourLabels) => {
  const dir =
    result.favours === null ? 'không nghiêng bên nào' : `nghiêng về ${favourLabels[result.favours]}`;
  console.log(
    `    p = ${result.p.toFixed(4)} · ${result.significant ? '✓ CÓ ý nghĩa' : '✗ KHÔNG có ý nghĩa'}` +
      ` ở α = ${result.alpha} · ${dir} · kiểm định: ${result.method}`,
  );
  if (result.note) console.log(`    ghi chú: ${result.note}`);
};

for (const comparison of COMPARISONS) {
  console.log(`\n${comparison.label}`);
  console.log(`  cô lập: ${comparison.isolates}`);

  const { pairs, incomplete } = pairResponses(trials, {
    conditionA: comparison.a,
    conditionB: comparison.b,
    field: 'correct',
    withReport: true,
  });

  if (pairs.length === 0) {
    console.log('  Không có cặp nào — log chưa đủ hai điều kiện trên cùng người tham gia.');
    continue;
  }

  const mcnemar = mcnemarTest(pairs);
  console.log(
    `  Tỉ lệ nhận diện đúng (McNemar) — ${pairs.length} cặp, ` +
      `${mcnemar.n} cặp bất đồng (b=${mcnemar.b}, c=${mcnemar.c})`,
  );
  report(mcnemar, { a: comparison.a, b: comparison.b });

  // Cỡ hiệu ứng đi liền với p, không để ở mục riêng cuối báo cáo: p nói "có
  // thật không", cỡ hiệu ứng nói "lớn bao nhiêu". Tách ra thì người đọc chỉ nhớ p.
  const effect = mcnemarEffect(pairs);
  console.log(
    `    chênh tỉ lệ ${pct(effect.riskDifference)} · CI ${effect.alpha === 0.05 ? '95%' : ''} ` +
      `[${pct(effect.riskDifferenceCi[0])}, ${pct(effect.riskDifferenceCi[1])}]`,
  );
  if (effect.ci) {
    console.log(
      `    tỉ số odds ${effect.oddsRatio.toFixed(2)} · CI [${effect.ci[0].toFixed(2)}, ${effect.ci[1].toFixed(2)}]`,
    );
  } else if (effect.note) {
    console.log(`    ${effect.note}`);
  }
  if (incomplete.length > 0) {
    console.log(`    bỏ ${incomplete.length} người thiếu một trong hai điều kiện`);
  }

  for (const field of likert.fields) {
    const likertPairs = pairResponses(likert.rows, {
      conditionA: comparison.a,
      conditionB: comparison.b,
      field,
    });
    const wilcoxon = wilcoxonSignedRankTest(likertPairs);
    console.log(
      `  Chiều "${field}" (Wilcoxon) — n = ${wilcoxon.n}` +
        (wilcoxon.dropped > 0 ? `, bỏ ${wilcoxon.dropped} cặp không chênh lệch` : ''),
    );
    report(wilcoxon, { a: comparison.a, b: comparison.b });

    const size = wilcoxonEffect(likertPairs);
    // Chiều suy ra là số thực, không phải điểm nguyên 1–5, nên phải làm tròn khi
    // in — không thì một dòng báo cáo dài 60 chữ số.
    const round = (value) => (likert.derived ? value.toFixed(3) : String(value));
    const interval = size.ci ? `[${round(size.ci[0])}, ${round(size.ci[1])}]` : 'không xác định';
    console.log(
      `    rank-biserial ${size.rankBiserial.toFixed(3)} · Hodges–Lehmann ` +
        `${round(size.hodgesLehmann)} · CI ${interval}${size.uninformative ? ' ⚠ không cho biết gì' : ''}`,
    );
    if (size.note) console.log(`    ghi chú: ${size.note}`);
  }
}

console.log(
  '\nNhắc: cặp bất đồng ít thì kiểm định tự chuyển sang bản chính xác — xấp xỉ chi bình\n' +
    'phương không đáng tin khi b + c < 25, và bản không hiệu chỉnh là bản cho p nhỏ nhất.\n' +
    'Báo cáo phải nêu tên kiểm định đã dùng, không chỉ nêu p.',
);

if (data.synthetic) {
  console.log('\n⚠ Nhắc lại: các số trên sinh từ dữ liệu giả lập, không có giá trị khoa học.');
}
