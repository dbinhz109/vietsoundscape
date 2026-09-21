/**
 * Từ vựng có kiểm soát của cả hệ thống — một nguồn chân lý duy nhất.
 *
 * Bộ máy âm thanh, bộ kiểm dữ liệu và giao diện đều đọc từ đây. Nhân bản các
 * danh sách này ra nhiều chỗ là cách chắc chắn nhất để chúng lệch nhau.
 */

/** Ba nhóm nguồn phát theo Bernie Krause → ba bus âm lượng của bộ trộn. */
export const KRAUSE_CLASSES = Object.freeze(['geophony', 'biophony', 'anthrophony']);

/** Ba vai âm thanh theo R. Murray Schafer → hành vi phát của lớp âm. */
export const SCHAFER_ROLES = Object.freeze(['keynote', 'signal', 'soundmark']);

/** Chỉ âm nền là lặp vô hạn. Tín hiệu âm và dấu ấn âm thanh phát một lần. */
export const LOOPING_ROLES = Object.freeze(['keynote']);

/** Nguồn vật liệu — mô hình lai ở BA §5.4 bắt buộc phân biệt được hai loại. */
export const PROVENANCE = Object.freeze(['field_recording', 'licensed_archive']);

/** Mức mai một. `lost` = âm đã không còn tồn tại trong thực tế. */
export const ENDANGERMENT_LEVELS = Object.freeze([
  'stable',
  'declining',
  'rare',
  'critical',
  'lost',
]);

export const CLIP_STATUSES = Object.freeze(['planned', 'recorded', 'processed', 'published']);

/**
 * Trạng thái đồng thuận (LG-01, LG-02, LG-04).
 *
 *  - `not_required`   — không có giọng người nhận dạng được, không phải biểu đạt
 *                       văn hoá của cộng đồng (ví dụ: tiếng gió, tiếng nước).
 *  - `pending`        — đã liên hệ, chưa có văn bản đồng thuận.
 *  - `obtained`       — có đồng thuận **cá nhân** bằng văn bản.
 *  - `community_agreed` — có thoả thuận với **cộng đồng chủ thể**. Bắt buộc cho
 *                       biểu đạt văn hoá truyền thống: cồng chiêng, ca Huế, hát ru.
 *  - `withdrawn`      — đã có yêu cầu rút. **Không bao giờ được xuất bản.**
 */
export const CONSENT_STATUSES = Object.freeze([
  'not_required',
  'pending',
  'obtained',
  'community_agreed',
  'withdrawn',
]);

/** Trạng thái cho phép xuất bản mẫu có giọng người nhận dạng được. */
export const CONSENT_OK_FOR_VOICE = Object.freeze(['obtained', 'community_agreed']);

/**
 * Nhóm **dữ liệu cá nhân nhạy cảm** — Nghị định 356/2025/NĐ-CP Điều 4 khoản 1.
 *
 * Chỉ giữ ba điểm mà đề tài thật sự chạm tới; danh mục đầy đủ có 12 điểm
 * (`phap-ly/nguon/nghi-dinh-356-2025-ND-CP.txt`).
 *
 *  - `ethnic_origin`    — **điểm a**, "dữ liệu tiết lộ nguồn gốc chủng tộc, nguồn
 *                         gốc dân tộc". Cồng chiêng, đàn t'rưng của nghệ nhân Ê Đê.
 *  - `religious_belief` — **điểm b**, "quan điểm về chính trị, tôn giáo, tín
 *                         ngưỡng". Tiếng tụng kinh ở chùa.
 *  - `biometric`        — **điểm đ**, "dữ liệu sinh trắc học". Giọng người nhận
 *                         ra được.
 *
 * Vì sao quan trọng: Luật không tự xếp loại nhạy cảm — Điều 2 khoản 3 giao danh
 * mục cho Chính phủ ban hành. Nên **căn cứ là Nghị định, không phải Luật**. Chi
 * tiết và lý do chọn ba nhóm này: `phap-ly/08-can-cu-phap-ly.md` §4.
 */
export const SENSITIVE_CATEGORIES = Object.freeze([
  'ethnic_origin',
  'religious_belief',
  'biometric',
]);

/**
 * Ba điều kiện của thực nghiệm H1 (BA §10.4, FR-58).
 *
 *  - `layered`   — soundscape phân lớp **đúng vùng miền**. Điều kiện chính.
 *  - `isolated`  — các âm rời rạc, không phân lớp. Đối chứng của thuyết minh gốc.
 *  - `scrambled` — phân lớp **sai vùng miền**: trộn lớp từ nhiều vùng khác nhau.
 *
 * Điều kiện thứ ba là phần thuyết minh gốc thiếu, và nó mới là phép thử đúng cho
 * chữ **"có chủ đích"** trong H1. Không có `scrambled` thì `layered` thắng
 * `isolated` chỉ chứng minh "nhiều thông tin hơn thì đoán đúng hơn" — một kết
 * luận tầm thường, không phải điều H1 phát biểu.
 */
export const EXPERIMENT_CONDITIONS = Object.freeze(['layered', 'isolated', 'scrambled']);

/**
 * Bốn vùng của bốn địa điểm (`data/locations.geojson`, BA §5.1). Bộ lọc FR-03
 * và phương án nhiễu FR-60 cùng đọc từ đây; `dataset.test.js` kiểm mọi địa điểm
 * và phương án nhiễu đều khai vùng nằm trong danh sách này.
 */
export const REGIONS = Object.freeze(['bac-bo', 'trung-bo', 'tay-nguyen', 'dbscl']);

export const TIMES_OF_DAY = Object.freeze([
  'dawn',
  'early_morning',
  'morning',
  'midday',
  'afternoon',
  'evening',
  'night',
]);

/**
 * Giấy phép được phép dùng.
 *
 * KHÔNG có biến thể NC (phi thương mại): nó chặn luôn giá trị "quảng bá du lịch"
 * mà mục 10 thuyết minh nêu ra (BA LG-03). Cấm ở tầng dữ liệu để không ai vô
 * tình đưa mẫu NC vào rồi phát hiện khi đã công bố.
 */
export const ALLOWED_LICENSES = Object.freeze([
  'CC0-1.0',
  'CC-BY-4.0',
  'CC-BY-3.0',
  'CC-BY-SA-4.0',
  'CC-BY-SA-3.0',
  'proprietary-own', // nhóm tự thu, giữ toàn quyền
]);

/** Khung toạ độ Việt Nam, dùng để bắt lỗi nhập toạ độ sai. */
export const VIETNAM_BOUNDS = Object.freeze({
  latMin: 8.0,
  latMax: 23.5,
  lonMin: 102.0,
  lonMax: 110.0,
});
