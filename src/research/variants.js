/**
 * Dựng ba biến thể điều kiện từ một bản trộn (FR-52, FR-56, FR-58).
 *
 * ## Vì sao module này quan trọng hơn nó trông
 *
 * Thuyết minh gốc nói H1 so sánh "soundscape phân lớp" với "âm đơn lẻ", nhưng
 * **chưa bao giờ định nghĩa** điều kiện đối chứng là gì cụ thể. Mà đó lại là chỗ
 * H1 sống hay chết: nếu bản phân lớp dài hơn, to hơn, nhiều âm hơn, thì người
 * nghe đoán đúng hơn cũng chẳng chứng minh được gì (BA §10.4).
 *
 * Ở đây ba điều kiện được định nghĩa thao tác được, và **khác nhau đúng một
 * biến**:
 *
 * | Điều kiện | Mẫu âm | Tính đồng thời | Vùng miền |
 * |---|---|---|---|
 * | `layered`   | của vùng gốc      | **chồng lấp**   | mạch lạc |
 * | `isolated`  | y hệt `layered`   | **lần lượt**    | mạch lạc |
 * | `scrambled` | vai giống, vùng khác | **chồng lấp** | bị phá |
 *
 * `layered` vs `isolated` cô lập **tính đồng thời**. `layered` vs `scrambled` cô
 * lập **tính mạch lạc vùng miền** — tức chữ *"có chủ đích"* trong H1. Không có
 * cột thứ hai thì H1 chỉ kiểm được "nhiều thông tin hơn thì đoán đúng hơn".
 *
 * ## Cân bằng do cách dựng, không do đo lại
 *
 * Cả ba dựng từ **cùng một danh sách sự kiện**, nên số sự kiện và thời lượng khớp
 * nhau tự động. Cách làm ngược lại — dựng riêng từng điều kiện rồi đi đo xem có
 * khớp không — thì gần như chắc chắn lệch, và mỗi lần lệch là một lần phải thu
 * thêm hoặc cắt bớt vật liệu.
 *
 * Kịch bản trả về là **danh sách sự kiện phẳng, đã chốt thời điểm** — không còn
 * `trigger` nào để bộ kết xuất tự diễn giải. Nhờ vậy kết xuất ra tệp cố định,
 * đối chiếu được bằng SHA-256 (FR-52).
 */

import { EXPERIMENT_CONDITIONS, LOOPING_ROLES } from '../domain/taxonomy.js';
import { createRng, scheduleTriggers } from '../audio/trigger.js';

/**
 * @typedef {{clip_id: string, start_s: number, length_s: number, gain_db: number, pan: number}} PlanEvent
 * @typedef {{
 *   id: string, recipe_id: string, location_id: string, condition: string,
 *   seed: number, duration_s: number, events: PlanEvent[],
 * }} StimulusPlan
 */

/** Xáo trộn Fisher–Yates với bộ sinh có seed — không dùng Math.random. */
function shuffled(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Danh sách sự kiện của điều kiện phân lớp — gốc để suy ra hai điều kiện kia.
 *
 * Phân nhánh theo **vai Schafer**, không theo việc có `trigger` hay không:
 *
 *  - `keynote` — lặp vô hạn, nên phủ trọn khung. Không cần biết thời lượng mẫu.
 *  - `signal` có lịch phát — phát nhiều lần, **mỗi lần dài đúng thời lượng mẫu**.
 *  - còn lại (`soundmark`, hoặc `signal` không có lịch) — phát **một lần**.
 *
 * Hai chỗ dễ sai mà cả hai đều làm hỏng bản kết xuất: coi `soundmark` như nền
 * (biến một tiếng cồng thành tiếng cồng ngân 60 giây), và lấy độ dài sự kiện là
 * "từ đây tới hết khung" (tiếng chuông ở giây 17 thành dài 43 giây).
 *
 * Mỗi lớp tín hiệu dùng một seed dẫn xuất: dùng chung một seed thì mọi lớp tín
 * hiệu phát trùng khớp nhau, nghe như một sự kiện.
 */
function layeredEvents(recipe, clipsById, durationS) {
  const events = [];

  recipe.layers.forEach((layer, index) => {
    const clip = clipsById[layer.clip_id];
    if (!clip) return;

    const shape = { clip_id: layer.clip_id, gain_db: layer.gain_db ?? 0, pan: layer.pan ?? 0 };

    if (LOOPING_ROLES.includes(clip.schafer_role)) {
      events.push({ ...shape, start_s: 0, length_s: durationS, loops: true });
      return;
    }

    // Đoán thời lượng là đúng thứ FR-56 cấm: kích thích các điều kiện lệch nhau
    // mà không ai biết. Thà dừng lại và đi đo thật.
    if (typeof clip.duration_s !== 'number' || !(clip.duration_s > 0)) {
      throw new Error(
        `Mẫu "${clip.id}" vai "${clip.schafer_role}" phát một lần nên phải biết thời lượng, ` +
          'nhưng `duration_s` chưa có. Chạy `npm run process <tệp>` để đo, đừng đoán — ' +
          'đoán thời lượng thì kích thích giữa các điều kiện lệch nhau mà không ai phát hiện (FR-56).',
      );
    }

    const starts = layer.trigger
      ? scheduleTriggers({
          seed: (recipe.seed ?? 0) + index,
          meanIntervalS: layer.trigger.mean_interval_s,
          jitterS: layer.trigger.jitter_s ?? 0,
          durationS,
        })
      : [0];

    for (const start of starts) {
      events.push({
        ...shape,
        start_s: start,
        length_s: Math.min(clip.duration_s, durationS - start),
        loops: false,
      });
    }
  });

  return events.sort((a, b) => a.start_s - b.start_s);
}

/**
 * Chọn mẫu thay thế cho điều kiện `scrambled`: **cùng vai, khác vùng**.
 *
 * Giữ vai âm thanh để cấu trúc bản trộn không đổi — vẫn có nền, vẫn có tín hiệu,
 * vẫn có dấu ấn. Chỉ tính mạch lạc vùng miền bị phá.
 */
function scrambleClips(events, clipsById, clips, locationId, rng) {
  const byRole = new Map();
  for (const clip of clips) {
    if (clip.location_id === locationId) continue;
    const role = clip.schafer_role;
    if (!byRole.has(role)) byRole.set(role, []);
    byRole.get(role).push(clip.id);
  }

  // Mỗi vai một con trỏ xoay vòng qua danh sách đã xáo, để một mẫu không bị lặp
  // lại nhiều lần trong khi mẫu khác không được dùng.
  const cursors = new Map();
  const pools = new Map();
  for (const [role, ids] of byRole) {
    pools.set(role, shuffled(ids, rng));
    cursors.set(role, 0);
  }

  return events.map((event) => {
    const role = clipsById[event.clip_id].schafer_role;
    const pool = pools.get(role);
    if (!pool || pool.length === 0) {
      throw new Error(
        `Không có mẫu âm nào vai "${role}" thuộc vùng khác để dựng điều kiện scrambled. ` +
          'Điều kiện đối chứng FR-58 cần vật liệu từ ít nhất hai vùng — chưa có thì chưa ' +
          'chạy được H1, vì không tách được "phân lớp có chủ đích" khỏi "nhiều thông tin hơn".',
      );
    }
    const cursor = cursors.get(role);
    cursors.set(role, cursor + 1);
    return { ...event, clip_id: pool[cursor % pool.length] };
  });
}

/**
 * Xếp lại cùng bấy nhiêu sự kiện thành chuỗi **không chồng lấp**, phủ kín khung.
 *
 * Chỗ này từng làm sai theo cách rất dễ sai: chia khung thành các ô **bằng nhau**.
 * Nghe hợp lý, nhưng nó gán cho tiếng chuông 3 giây một ô 12 giây — bộ kết xuất
 * sẽ kéo dài hoặc lặp nó, và `isolated` không còn là "cùng bấy nhiêu âm, nghe lần
 * lượt" mà thành âm khác hẳn. Yếu tố gây nhiễu bị đẩy sang chỗ khác thay vì bị khử.
 *
 * Cách đúng: **âm phát một lần giữ nguyên thời lượng thật**, còn **lớp nền hút
 * phần dư**. Nền vốn liên tục nên co giãn được mà vẫn là chính nó; âm một lần thì
 * không. Nhờ vậy giữ được cả ba: khung khớp, số sự kiện khớp, và mỗi âm một lần
 * dài đúng như ở điều kiện phân lớp.
 *
 * Thứ tự do seed quyết định chứ không theo thứ tự khai lớp: nếu luôn phát nền
 * trước rồi tín hiệu sau thì thứ tự trở thành gợi ý cho người nghe.
 */
function sequence(events, durationS, rng) {
  const beds = events.filter((event) => event.loops);
  const oneShots = events.filter((event) => !event.loops);
  const oneShotTotal = oneShots.reduce((sum, event) => sum + event.length_s, 0);
  const leftover = durationS - oneShotTotal;

  if (beds.length === 0) {
    // Không có nền để hút phần dư thì rải phần dư thành khoảng lặng đều nhau.
    const gap = leftover / Math.max(oneShots.length, 1);
    let cursor = 0;
    return shuffled(oneShots, rng).map((event) => {
      const placed = { ...event, start_s: cursor };
      cursor += event.length_s + gap;
      return placed;
    });
  }

  if (leftover <= 0) {
    throw new Error(
      `Các âm phát một lần đã chiếm ${oneShotTotal.toFixed(1)} giây trong khung ${durationS} ` +
        'giây, không còn chỗ cho lớp nền. Khung quá ngắn cho bản trộn này — nới thời lượng ' +
        'kích thích, hoặc bớt lớp. Cắt bớt thời lượng của âm một lần thì `isolated` không ' +
        'còn tương đương với `layered` nữa (FR-56).',
    );
  }

  const bedShare = leftover / beds.length;
  const sized = [
    ...oneShots,
    ...beds.map((bed) => ({ ...bed, length_s: bedShare })),
  ];

  let cursor = 0;
  return shuffled(sized, rng).map((event) => {
    const placed = { ...event, start_s: cursor };
    cursor += event.length_s;
    return placed;
  });
}

/**
 * @param {object} recipe Bản trộn gốc — luôn là điều kiện `layered`.
 * @param {object[]} clips Toàn bộ mẫu âm, cần cho `scrambled` và tra vai.
 * @param {{durationS: number}} options
 * @returns {Record<string, StimulusPlan>}
 */
export function buildVariants(recipe, clips, { durationS }) {
  const clipsById = Object.fromEntries(clips.map((clip) => [clip.id, clip]));
  const seed = recipe.seed ?? 0;
  const events = layeredEvents(recipe, clipsById, durationS);

  const plan = (condition, planEvents) => ({
    id: `${recipe.id}--${condition}`,
    recipe_id: recipe.id,
    location_id: recipe.location_id,
    condition,
    seed,
    duration_s: durationS,
    // CHUNG cho cả ba điều kiện, có chủ ý. Cho mỗi điều kiện một không gian khác
    // nhau là biến vang thành yếu tố gây nhiễu: chênh lệch nhận diện khi đó giải
    // thích được bằng "phòng này dễ nghe hơn phòng kia", không đụng gì tới H1.
    //
    // Kể cả `scrambled` — dù mẫu lấy từ vùng khác. Dùng vang riêng từng mẫu sẽ
    // làm `scrambled` khác `layered` ở HAI điểm (nội dung lẫn không gian) thay
    // vì một, và FR-58 hết cô lập được thứ nó định cô lập.
    reverb_ir: recipe.reverb_ir ?? null,
    events: planEvents,
  });

  // Mỗi điều kiện một dòng ngẫu nhiên riêng, nếu không thì thứ tự ô của
  // `isolated` sẽ dính vào việc chọn mẫu của `scrambled`.
  const variants = {
    layered: plan('layered', events),
    isolated: plan('isolated', sequence(events, durationS, createRng(seed + 1000))),
    scrambled: plan(
      'scrambled',
      scrambleClips(events, clipsById, clips, recipe.location_id, createRng(seed + 2000)),
    ),
  };

  const missing = EXPERIMENT_CONDITIONS.filter((condition) => !(condition in variants));
  if (missing.length > 0) throw new Error(`Chưa dựng điều kiện: ${missing.join(', ')}.`);

  return variants;
}

/**
 * @param {StimulusPlan} plan
 * @returns {number}
 */
export function countPlanEvents(plan) {
  return plan.events.length;
}

/**
 * Có sự kiện nào chồng lấp không — phép kiểm định nghĩa của điều kiện `isolated`.
 *
 * @param {StimulusPlan} plan
 * @returns {boolean}
 */
export function planOverlaps(plan) {
  const sorted = [...plan.events].sort((a, b) => a.start_s - b.start_s);
  return sorted.some((event, index) => {
    if (index === 0) return false;
    const previous = sorted[index - 1];
    return event.start_s < previous.start_s + previous.length_s - 1e-9;
  });
}
