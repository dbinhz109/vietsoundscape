/**
 * Kiểm thiết bị thu có bật xử lý ngầm hay không — trả lời câu Q1 bằng **đo**,
 * không bằng đọc thông số máy.
 *
 * Vì sao cần: micro điện thoại bật sẵn AGC (tự động điều chỉnh độ to) và khử ồn
 * cho cuộc gọi. Cả hai phá đúng thứ đề tài cần bảo tồn:
 *   - **AGC** dâng nền ồn lên mỗi khi khung cảnh lặng đi → bản thu như bị bơm hơi.
 *   - **Khử ồn** ăn mất chính phần ambience — mà ambience là đối tượng nghiên cứu.
 * Thông số máy thường không nói có tắt được hay không, nên phải đo.
 *
 * ## Cách dùng
 *
 * Thu một bản thử **60 giây** bằng đúng thiết bị và app sẽ dùng ngoài thực địa:
 *
 *   1. **25 giây im lặng** — đặt máy trong phòng yên, không nói, không di chuyển.
 *   2. **10 giây có âm đều** — vỗ tay chậm, hoặc nói liên tục, hoặc mở một nốt nhạc.
 *   3. **25 giây im lặng** — như bước 1.
 *
 * Rồi chạy: `node scripts/check-recorder.mjs ban-thu-thu.wav`
 *
 * Hai dấu vết mà công cụ tìm:
 *   - Nền ồn trong đoạn lặng **dâng dần** ⇒ AGC đang bật.
 *   - Nền ồn bị **cắt hẳn** xuống mức bất thường ⇒ khử ồn đang bật.
 */

/** Nền ồn dâng quá mức này trong một đoạn lặng thì coi như có AGC. */
export const AGC_RISE_LIMIT_DB = 4;

/** Dưới mức này thì không còn là nền ồn phòng thật — đã bị cắt. */
export const GATE_FLOOR_DB = -80;

/** Tỉ lệ khối bị cắt vượt mức này thì coi như có khử ồn. */
export const GATED_FRACTION_LIMIT = 0.2;

/** Đoạn có âm phải nổi hơn nền ít nhất bấy nhiêu để tách được. */
const LOUD_MARGIN_DB = 12;

const MIN_DURATION_S = 20;
const MIN_QUIET_BLOCKS = 20;

/**
 * Mức dBFS của từng khối thời gian.
 *
 * @param {Float32Array} samples một kênh
 * @param {number} sampleRate
 * @param {object} [options]
 * @param {number} [options.blockMs] bề rộng khối, mặc định 100 ms
 * @returns {number[]} dBFS, `-Infinity` cho khối im lặng tuyệt đối
 */
export function blockLevelsDb(samples, sampleRate, options = {}) {
  const { blockMs = 100 } = options;
  const blockSize = Math.max(1, Math.round((blockMs / 1000) * sampleRate));
  const levels = [];

  for (let start = 0; start + blockSize <= samples.length; start += blockSize) {
    let sum = 0;
    for (let i = start; i < start + blockSize; i += 1) sum += samples[i] * samples[i];
    const rms = Math.sqrt(sum / blockSize);
    levels.push(rms === 0 ? -Infinity : 20 * Math.log10(rms));
  }
  return levels;
}

/**
 * Mức thay cho `-Infinity` khi làm thống kê.
 *
 * Bỏ hẳn các khối im lặng tuyệt đối là sai: khi khử ồn cắt nền về đúng 0 (rất
 * dễ xảy ra với tệp 16-bit), phần còn lại chỉ là đoạn có âm — mọi thống kê sẽ
 * rơi vào đó và đảo ngược kết luận.
 */
const SILENCE_FLOOR_DB = -140;

const finiteDb = (db) => (Number.isFinite(db) ? db : SILENCE_FLOOR_DB);

const percentile = (values, fraction) => {
  if (values.length === 0) return SILENCE_FLOOR_DB;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(fraction * sorted.length));
  return sorted[index];
};

const median = (values) => percentile(values, 0.5);

/** Độ dốc tuyến tính qua một dãy mức, tính theo dB trên toàn dãy. */
function riseAcross(levels) {
  const finite = levels.filter(Number.isFinite);
  if (finite.length < 4) return 0;

  const n = finite.length;
  const meanX = (n - 1) / 2;
  const meanY = finite.reduce((sum, y) => sum + y, 0) / n;

  let numerator = 0;
  let denominator = 0;
  finite.forEach((y, x) => {
    numerator += (x - meanX) * (y - meanY);
    denominator += (x - meanX) ** 2;
  });
  const slopePerBlock = denominator === 0 ? 0 : numerator / denominator;
  return slopePerBlock * (n - 1);
}

/**
 * Tách bản thu thành đoạn lặng đầu, đoạn có âm, đoạn lặng cuối.
 *
 * @param {number[]} levels
 * @returns {{quietBefore: number[], loud: number[] | null, quietAfter: number[]}}
 */
export function segmentByLoudness(levels) {
  // Phân vị 20 thay vì trung vị: quy trình thu đảm bảo đoạn lặng chiếm hơn 20%
  // thời lượng, nên phân vị này luôn nằm trong nền — kể cả khi đoạn có âm dài.
  const floor = percentile(levels.map(finiteDb), 0.2);
  const threshold = floor + LOUD_MARGIN_DB;

  const loudIndexes = levels.map((db, index) => (db > threshold ? index : -1)).filter((i) => i >= 0);
  if (loudIndexes.length === 0) return { quietBefore: levels, loud: null, quietAfter: [] };

  const first = loudIndexes[0];
  const last = loudIndexes.at(-1);
  return {
    quietBefore: levels.slice(0, first),
    loud: levels.slice(first, last + 1),
    quietAfter: levels.slice(last + 1),
  };
}

/** Thống kê một đoạn lặng: nền ở đâu, có dâng không, có bị cắt không. */
function analyseQuiet(levels) {
  const gated = levels.filter((db) => finiteDb(db) < GATE_FLOOR_DB).length;
  const audible = levels.filter((db) => Number.isFinite(db) && db >= GATE_FLOOR_DB);
  return {
    blocks: levels.length,
    // Nền toàn bộ bị cắt thì báo mức sàn quy ước, không báo -Infinity — con số
    // đó in ra báo cáo sẽ vô nghĩa với người đọc.
    floorDb: audible.length > 0 ? median(audible) : SILENCE_FLOOR_DB,
    riseDb: riseAcross(levels),
    gatedFraction: levels.length === 0 ? 0 : gated / levels.length,
  };
}

/**
 * @typedef {object} RecorderVerdict
 * @property {boolean | null} usable null khi bản thu không đúng quy trình
 * @property {boolean} agcSuspected
 * @property {boolean} noiseSuppressionSuspected
 * @property {number} noiseFloorDb nền ồn phòng đo được
 * @property {number} quietRiseDb mức dâng lớn nhất trong các đoạn lặng
 * @property {number} gatedFraction tỉ lệ khối bị cắt
 * @property {string[]} notes
 *
 * @param {Float32Array} samples
 * @param {number} sampleRate
 * @param {object} [options]
 * @returns {RecorderVerdict}
 */
export function checkRecorder(samples, sampleRate, options = {}) {
  const notes = [];
  const empty = {
    usable: null,
    agcSuspected: false,
    noiseSuppressionSuspected: false,
    noiseFloorDb: -Infinity,
    quietRiseDb: 0,
    gatedFraction: 0,
    notes,
  };

  const durationS = samples.length / sampleRate;
  if (durationS < MIN_DURATION_S) {
    notes.push(
      `Bản thu chỉ ${durationS.toFixed(1)} giây — quá ngắn. Cần ít nhất ${MIN_DURATION_S} giây ` +
        'theo quy trình: im lặng → âm đều → im lặng.',
    );
    return empty;
  }

  const levels = blockLevelsDb(samples, sampleRate, options);
  const { quietBefore, loud, quietAfter } = segmentByLoudness(levels);

  if (!loud) {
    notes.push(
      'Không tách được đoạn có âm nổi lên. Bản thu chưa đúng quy trình: phải có một đoạn ' +
        'giữa có âm rõ (vỗ tay chậm hoặc nói liên tục) để so với hai đoạn lặng hai bên.',
    );
    return empty;
  }

  const quiets = [quietBefore, quietAfter].filter((segment) => segment.length >= MIN_QUIET_BLOCKS);
  if (quiets.length === 0) {
    notes.push(
      'Hai đoạn lặng quá ngắn để chấm. Kéo dài mỗi đoạn im lặng lên khoảng 25 giây rồi thu lại.',
    );
    return empty;
  }

  const stats = quiets.map(analyseQuiet);
  const quietRiseDb = Math.max(...stats.map((s) => s.riseDb));
  const gatedFraction = Math.max(...stats.map((s) => s.gatedFraction));
  const noiseFloorDb = median(stats.map((s) => s.floorDb));

  const agcSuspected = quietRiseDb > AGC_RISE_LIMIT_DB;
  const noiseSuppressionSuspected = gatedFraction > GATED_FRACTION_LIMIT;

  if (agcSuspected) {
    notes.push(
      `AGC: nền ồn dâng ${quietRiseDb.toFixed(1)} dB trong đoạn lặng (ngưỡng ` +
        `${AGC_RISE_LIMIT_DB} dB). Máy đang tự nâng gain khi không có tín hiệu — ` +
        'bản thu ambience sẽ nghe như bị bơm hơi. Tìm cách tắt trong app, hoặc đổi app/thiết bị.',
    );
  }
  if (noiseSuppressionSuspected) {
    notes.push(
      `Khử ồn: ${(gatedFraction * 100).toFixed(0)}% khối trong đoạn lặng bị cắt xuống dưới ` +
        `${GATE_FLOOR_DB} dBFS. Nền phòng bị xoá hẳn thay vì chỉ nhỏ đi — mà nền phòng chính là ` +
        'lớp âm nền (keynote) đề tài cần. Phải tắt trước khi đi thực địa.',
    );
  }
  if (!agcSuspected && !noiseSuppressionSuspected) {
    notes.push(
      `Không thấy dấu vết xử lý ngầm. Nền ồn phòng ${noiseFloorDb.toFixed(1)} dBFS, ` +
        `dâng ${quietRiseDb.toFixed(1)} dB — trong ngưỡng. Thiết bị dùng được cho lớp âm nền.`,
    );
  }

  return {
    usable: !agcSuspected && !noiseSuppressionSuspected,
    agcSuspected,
    noiseSuppressionSuspected,
    noiseFloorDb,
    quietRiseDb,
    gatedFraction,
    notes,
  };
}
