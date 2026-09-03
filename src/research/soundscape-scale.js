/**
 * Bộ câu hỏi cảm nhận khung cảnh âm thanh theo **ISO 12913-2 Phụ lục C (Phương
 * pháp A)**, và phép suy ra hai chiều của **ISO/TS 12913-3** (việc C0.2, câu Q3).
 *
 * Vì sao hỏi 8 thuộc tính rồi suy ra, thay vì hỏi thẳng hai câu "dễ chịu?" và
 * "nhiều sự kiện?":
 *
 *  · Hỏi thẳng là **thang tự soạn** — không so sánh được với nghiên cứu quốc tế,
 *    và đó chính là điều BA §12 khuyến nghị bỏ.
 *  · Hai chiều của ISO **trực giao theo cách dựng**. Hỏi thẳng hai câu thì hai
 *    câu trả lời tương quan với nhau theo cách không kiểm soát được, nên không
 *    còn là hai trục độc lập nữa.
 *  · 8 thuộc tính thô được **ghi nguyên vào log**. Suy diễn xảy ra lúc phân tích,
 *    nên đổi công thức không phải thu lại dữ liệu.
 *
 * Một điểm về thống kê, không phải về đo lường: chạy Wilcoxon trên cả 8 thuộc
 * tính × 2 phép so sánh là **16 kiểm định** — với α = 0,05 thì xác suất có ít
 * nhất một dương tính giả xấp xỉ 56%. Suy ra 2 chiều rồi kiểm 2 chiều đó là 4
 * kiểm định, và là cách ISO/TS 12913-3 định dùng bộ này.
 *
 * @see ISO/TS 12913-3:2019, công thức (1) và (2)
 */

/**
 * 8 thuộc tính theo đúng thứ tự của Phụ lục C. **Không đảo thứ tự**: thứ tự cố
 * định là một phần của bộ đã được kiểm định, đảo đi là mất tính so sánh được.
 */
export const ISO_ATTRIBUTES = Object.freeze([
  { key: 'pleasant', statement_vi: 'dễ chịu' },
  { key: 'chaotic', statement_vi: 'hỗn loạn' },
  { key: 'vibrant', statement_vi: 'sống động' },
  { key: 'uneventful', statement_vi: 'ít chuyện xảy ra' },
  { key: 'calm', statement_vi: 'yên bình' },
  { key: 'annoying', statement_vi: 'gây khó chịu' },
  { key: 'eventful', statement_vi: 'nhiều chuyện xảy ra' },
  { key: 'monotonous', statement_vi: 'đơn điệu' },
].map(Object.freeze));

/** Thang đồng ý 5 mức của Phương pháp A. */
export const AGREEMENT_SCALE = Object.freeze([
  { value: 1, label_vi: 'Hoàn toàn không đồng ý' },
  { value: 2, label_vi: 'Không đồng ý' },
  { value: 3, label_vi: 'Trung lập' },
  { value: 4, label_vi: 'Đồng ý' },
  { value: 5, label_vi: 'Hoàn toàn đồng ý' },
].map(Object.freeze));

/** Mã của 8 thuộc tính — dùng làm `likertFields` của phiên. */
export const ISO_ATTRIBUTE_KEYS = Object.freeze(ISO_ATTRIBUTES.map((a) => a.key));

const SCALE_MIN = AGREEMENT_SCALE[0].value;
const SCALE_MAX = AGREEMENT_SCALE[AGREEMENT_SCALE.length - 1].value;
/** Tâm thang: 1..5 → −2..+2, để "trung lập" thành gốc toạ độ. */
const SCALE_CENTRE = (SCALE_MIN + SCALE_MAX) / 2;

const COS_45 = Math.SQRT1_2;
/**
 * Chuẩn hoá về [−1, 1]. Biên đạt được khi cả ba số hạng cùng cực đại:
 * 4 + √32 = 4 + 2·(cos45° · 4).
 */
const NORMALISER = 4 + Math.sqrt(32);

/** Lấy một điểm đã tâm hoá, chặn mọi thứ không dùng được. */
function centred(ratings, key) {
  const value = ratings?.[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(
      `Thiếu hoặc sai điểm cho thuộc tính "${key}" (nhận được ${JSON.stringify(value)}). ` +
        'Công thức ISO/TS 12913-3 cần đủ cả 8 thuộc tính — thiếu một là không suy ra được ' +
        'chiều nào, mà lúc phát hiện thì dữ liệu đã thu xong rồi.',
    );
  }
  if (value < SCALE_MIN || value > SCALE_MAX) {
    throw new Error(
      `Điểm ${value} của thuộc tính "${key}" nằm ngoài thang ${SCALE_MIN}–${SCALE_MAX}.`,
    );
  }
  return value - SCALE_CENTRE;
}

/**
 * @param {Record<string, number>} ratings điểm thô của 8 thuộc tính, thang 1–5
 * @returns {{pleasantness: number, eventfulness: number}} hai chiều trong [−1, 1]
 */
export function deriveIsoDimensions(ratings) {
  const get = (key) => centred(ratings, key);
  const pleasant = get('pleasant');
  const annoying = get('annoying');
  const calm = get('calm');
  const chaotic = get('chaotic');
  const vibrant = get('vibrant');
  const monotonous = get('monotonous');
  const eventful = get('eventful');
  const uneventful = get('uneventful');

  const pleasantness =
    (pleasant - annoying + COS_45 * (calm - chaotic) + COS_45 * (vibrant - monotonous)) /
    NORMALISER;
  const eventfulness =
    (eventful - uneventful + COS_45 * (chaotic - calm) + COS_45 * (vibrant - monotonous)) /
    NORMALISER;

  return { pleasantness, eventfulness };
}
