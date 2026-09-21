# Đánh giá dự án so với thuyết minh đề tài

**Ngày lập:** 14/09/2026 (đồng hồ hệ thống — xem `SPEC-VIEC-CAN-LAM.md` S0.5, ngày thật chưa được người xác nhận)
**Đối chiếu:** `BanDoAmThanh_VietNam.docx` ↔ hiện trạng repo tại commit `390b873`
**Cách kiểm:** `npm test`, đọc `data/clips.json`, `git ls-files`, đọc mã — không dựa trí nhớ
**Quan hệ với tài liệu khác:** tệp này **không thay** `SPEC-VIEC-CAN-LAM.md` (việc cần làm) hay `LO-TRINH-VietSoundscape.md` (thứ tự làm). Nó trả lời đúng một câu: *thuyết minh hứa gì, dự án đang ở đâu so với lời hứa đó.*

## Số liệu gốc

| Đo cái gì | Con số | Lấy ở đâu |
|---|---|---|
| Kiểm thử | **478/478 xanh**, 25 tệp | `npm test` |
| Mẫu âm trong dữ liệu | **32**, cả 32 ở `status: planned` | `data/clips.json` |
| Tệp âm thật trong repo | **0** | `git ls-files \| grep -iE '\.(wav\|mp3\|ogg\|opus\|m4a\|webm\|flac)$'` |
| Địa điểm | 4 | `data/locations.geojson` |
| Bản trộn | 4, cả 4 `placeholder: true` | `data/recipes/` |
| Mẫu kho mở đã khảo sát | **0/17** (`source_url` rỗng cả 17) | `data/clips.json` |
| Người tham gia thực nghiệm | **0/96** | chưa có tệp log nào |

Mọi con số hiệu năng, chất lượng loop và độ to hiện có đều đo trên **âm tổng hợp** (`scripts/gen_test_audio.py`: `np.sin` + nhiễu numpy).

## Kết luận một dòng

Phần **máy móc** đã vượt thuyết minh; phần **vật liệu và dữ liệu thật** vẫn ở mốc 0. Cỗ máy chạy tốt, chưa đổ nhiên liệu.

---

## 1. Bốn mục tiêu cụ thể (mục 5 thuyết minh)

| Mục tiêu | Trạng thái | Bằng chứng |
|---|---|---|
| Thư viện âm phân loại cho 3–5 địa điểm | 🟡 khung xong, ruột rỗng | 4 địa điểm; 32 mẫu **đã phân loại đủ** Krause (17 anthrophony / 8 geophony / 7 biophony) và Schafer (13 keynote / 13 signal / 6 soundmark); nhưng **32/32 `planned`** |
| Website bản đồ tương tác | ✅ chạy được | `src/app/map/sound-map.js` (Leaflet, không tile raster) + danh sách văn bản tương đương chức năng ở `src/app/main.js` (FR-04) |
| Công cụ mô phỏng soundscape | ✅ vượt yêu cầu | `src/audio/{engine,gain,loop,trigger}.js`: 3 bus Krause, fade chống tiếng "cụp", thang dB, panning, ConvolverNode (`engine.js:48`), trigger Poisson có seed |
| Đánh giá qua khảo sát người dùng | 🟡 công cụ 100%, dữ liệu 0% | `src/research/assignment.js`, `src/app/experiment/session.js`, `scripts/analyse-results.mjs`; **0/96 người** |

## 2. Ba sản phẩm dự kiến (mục 10 thuyết minh)

| Sản phẩm hứa | Thực tế |
|---|---|
| Website **có link truy cập công khai** | 🔴 repo **private**; `.github/workflows/` chỉ có `ci.yml`, **không có workflow triển khai**. Mới chạy được `npm run dev` trên máy |
| Thư viện **≥ 30–50 mẫu âm** | 🔴 32 bản ghi *kế hoạch*. 17 mẫu `licensed_archive`: `source_url` 0/17, `survey.status` = `chua_khao_sat` cả 17. 15 mẫu `field_recording`: chưa có lịch thực địa |
| Bộ dữ liệu khảo sát + kết quả phân tích | 🟡 phép kiểm xong, đã đối chiếu độc lập bằng R — **6/6 giá trị p trùng 4 chữ số** (`nghien-cuu/doi-chieu.R`); chưa có một lượt nghe thật nào |

## 3. Bốn tính năng cốt lõi (mục 8 thuyết minh)

| Tính năng | Trạng thái |
|---|---|
| Bản đồ + nhấn để mở "phòng nghe" | ✅ |
| Trình phát có thanh trượt âm lượng từng lớp | ✅ `src/app/room/listening-room.js` + `src/app/ui/layer-slider.js` (29 test) |
| **Thẻ thông tin văn hóa** — âm này là gì, ý nghĩa, đang mai một ra sao | 🟡 **cơ chế xong 14/09, nội dung thiếu**. Lúc chấm lần đầu là 🔴: không có trường mô tả nào trong lược đồ, giao diện chỉ hiện tên + `"signal · anthrophony"` + nhãn mai một. Nay `cultural_note_vi/en` + `tags[]` bắt buộc khi xuất bản, hiện ngay dưới thanh trượt kèm `aria-describedby` (trả luôn FR-63), 10 test. **Còn thiếu nội dung: 1/32 thẻ** — 31 mẫu chờ việc VH2.1, cố ý không bịa (sổ quyết định Q-24) |
| Trang đóng góp cộng đồng | 🔴 không có — đúng như thuyết minh ghi "mở rộng về sau". Nhưng kiến trúc hiện tại **tĩnh 100%**, nên FR-30…34 (kiểm tệp phía server, xoá metadata gốc, hàng chờ duyệt) sẽ cần một máy chủ **chưa được tính vào kế hoạch nào** |

## 4. Bảng công nghệ mục 8 — bốn chỗ đã đi khác

| Thuyết minh | Thực tế | Đánh giá |
|---|---|---|
| "có thể dùng React" | JS thuần, Vite chỉ để gói | ✅ tốt hơn cho ràng buộc RAM (NFR §9.1) |
| Leaflet **hoặc Mapbox** + tile | Leaflet **không tile raster**, chỉ đường viền vector 72 KB | ✅ hết cần khoá API, hết vướng chính sách tile của OSM |
| JSON tĩnh **hoặc Firebase / Supabase** | JSON tĩnh | 🟡 đủ cho M1–M3 và thực nghiệm; **chặn** M4 (đóng góp) và M5 (quản trị) |
| Cloud storage / CDN, định dạng `.mp3/.ogg` | chưa có hosting; đường ống xuất **Opus 72k/144k** | 🟡 phải sửa lại bảng trong thuyết minh cho khớp |

## 5. Sáu phương pháp nghiên cứu (mục 7 thuyết minh)

| Phương pháp | Trạng thái | Bằng chứng |
|---|---|---|
| Nghiên cứu tài liệu | ✅ | BA §1.1 định vị so với Cities and Memory / Radio Aporee / British Library Sounds; `phap-ly/nguon/` lưu toàn văn ba đạo luật |
| Điền dã — thu âm thực địa | 🔴 chưa đi | Chưa có ngày, chưa có người, chưa có danh sách mẫu theo giờ (S3.3) |
| Xử lý và phân loại âm | 🟡 đường ống xong, chưa chạy thật | `scripts/process-audio.mjs`: LUFS → gain → tìm điểm loop → Opus 72k/144k → SHA-256. **Chưa một tệp thật nào đi qua** (S2.1) |
| Phát triển phần mềm | ✅ | 478 test, CI chạy `test → validate → build` mỗi push |
| Thực nghiệm đánh giá | 🟡 thiết kế + công cụ xong, chưa có người | Ba điều kiện, đảo thứ tự cân bằng, chặn quay lại, log đủ để chạy kiểm định |
| Phân tích dữ liệu | ✅ công cụ | McNemar (H1), Wilcoxon signed-rank (H2), cỡ hiệu ứng + khoảng tin cậy ngay dưới mỗi p |

---

## 6. Chỗ dự án **vượt** thuyết minh — nên đưa ngược vào docx

1. **Điều kiện đối chứng thứ ba.** Thuyết minh chỉ so "âm đơn lẻ ↔ soundscape mô phỏng". Dự án thêm điều kiện `scrambled` (phân lớp **sai vùng miền**). Không có nó thì H1 **không kiểm được** chữ *"có chủ đích"*: so đơn lẻ với phân lớp chỉ chứng minh "nhiều âm hơn thì đoán đúng hơn". (BA FR-58, `src/research/variants.js`)
2. **Cỡ mẫu tính trước: 96 người** (sàn 84, lực 86,1% — `src/research/power.js`, 26 test), thay cho "khảo sát người dùng" chung chung.
3. **Phương án nhiễu trong danh sách trả lời.** Thiết kế trong thuyết minh cho người nghe 4 vùng rồi chọn trong đúng 4 vùng đó → lượt thứ 4 chỉ còn một lựa chọn. Đã sửa: 8 ô/lượt, xáo theo seed `(người × lượt)` — `data/distractors.json`, `src/research/answer-options.js`.
4. **ISO 12913-2/3** thay cho "thang Likert 5 mức" tự soạn (mục 7 thuyết minh) — `src/research/soundscape-scale.js`.
5. **Kích thích kết xuất sẵn, đối chiếu SHA-256** ⇒ nghiên cứu tái lập được (`npm run render:stimuli -- --verify`, 12/12 khớp băm).
6. **Hồ sơ pháp lý 9 văn bản** theo Luật 91/2025, NĐ 356/2025, Luật Di sản 45/2024. Thuyết minh mục 7 chỉ có một dòng *"luật bản quyền và quyền riêng tư khi ghi âm"*.

## 7. Sáu câu trong thuyết minh nay phải sửa hoặc phải chứng minh

| Câu trong docx | Vì sao phải động vào |
|---|---|
| Bảng công nghệ mục 8 (React, Mapbox, Firebase, CDN, mp3/ogg) | Bốn dòng đã đi khác — xem §4 |
| H1: *"so với khi nghe các âm thanh đơn lẻ"* | Thiếu điều kiện thứ ba thì không kiểm được chữ "có chủ đích" — nên viết lại H1 theo ba điều kiện |
| Mục 7: *"khảo sát cảm xúc bằng thang Likert 5 mức"* | Đã thay bằng ISO 12913-2 Phương pháp A |
| Mục 9: *"hỗ trợ người khiếm thị hình dung nơi chốn"* | Mã đã làm phần làm được (`aria-valuetext`, danh sách văn bản, `prefers-reduced-motion`) nhưng **chưa kiểm với trình đọc màn hình và người khiếm thị thật** (FR-65). Không làm được thì **phải bỏ câu này** |
| Mục 10: *"≥ 30–50 mẫu âm"* | FR-59 đòi ≥ 3 bản trộn mỗi vùng ⇒ 12–15 bản trộn, kéo khối lượng thu âm lên ~3 lần. 30–50 mẫu có thể không đủ |
| Mục 7: thu âm thực địa | Chưa nhắc nghĩa vụ theo Luật 91/2025. Phản biện trong nước sẽ hỏi — xem rủi ro đầu bảng §8 |

## 8. Rủi ro, xếp theo mức có thể giết đề tài

| Mức | Việc | Việc tương ứng trong spec |
|---|---|---|
| 🔴 | Chưa hỏi phòng pháp chế: có phải nộp **hồ sơ đánh giá tác động xử lý dữ liệu cá nhân** cho A05 trong **60 ngày kể từ mẫu âm có giọng người đầu tiên** không. Nếu "có" thì mốc chạy từ **ngày thu**, không phải ngày ra mắt ⇒ chặn toàn bộ việc thu âm | S3.2 (A0.3b) |
| 🔴 | **Vật liệu = 0.** Chưa biết tìm điểm loop có chạy trên tiếng chợ không, chuẩn hoá LUFS có làm bẹt tiếng rao không, `scrambled` nghe có "sai" thật không | S2.1 |
| 🔴 | **Cổng G0 chưa đóng** — chưa đo 5 lớp trên điện thoại thật, chưa ai nghe liền 5 phút bằng tai | S2.3, S2.4 |
| 🟡 | Mới có 4 bản trộn, cần 12–15 | — (thuộc mốc M3) |
| 🟡 | `nghien-cuu/ke-hoach-phan-tich.md` **chưa ký, chưa tag** ⇒ chưa có giá trị đăng ký trước | S1.4 |
| 🟡 | Tuyên bố hỗ trợ người khiếm thị chưa có bằng chứng | B6.1 / FR-65 |

## 9. Đối chiếu với `SPEC-VIEC-CAN-LAM.md`

Spec tự chấm **13/18**. Kiểm lại bằng mã và dữ liệu: **đồng ý**. Năm việc còn lại (S0.5 ngày thật · S1.3 quyết định vang · S1.4 ký kế hoạch · S2.\* vật liệu thật · S3.\* kho âm, pháp lý, lịch thực địa) **không việc nào làm được bằng cách viết thêm mã**. Viết thêm mã lúc này là làm sai việc.

## 10. Ba việc mở khoá mọi thứ còn lại

1. **Gửi câu hỏi pháp chế (A0.3b) ngay.** Một email, nhưng câu trả lời có thể chặn hai tháng.
2. **Thu một tệp âm thật bất kỳ** cho chạy qua `npm run process` — không cần đi xa, không cần đúng địa điểm nghiên cứu.
3. **Khảo sát 17 mẫu kho mở** bằng `npm run survey` — ngồi bàn làm được ngay, không chờ ai.

---

## Tự đánh giá tổng thể

| Phần | Mức hoàn thành so với thuyết minh |
|---|---|
| Kỹ thuật và phương pháp | ~90% (14/09: thêm cơ chế thẻ văn hoá FR-26) |
| Vật liệu âm thật | 0% |
| Dữ liệu người tham gia | 0% |
| Công bố (link công khai) | 0% |

---

## 11. Cập nhật 21/09 — ba con số ở trên đã đổi

Nguyên văn các mục 1–10 giữ làm mốc so sánh (hiện trạng `390b873`). Từ đó tới `main` hôm nay:

| Mục ở trên | Lúc chấm (14/09) | Nay (21/09) | Bằng chứng |
|---|---|---|---|
| §2 sản phẩm 1 — *website có link công khai* | 🔴 repo private, không workflow triển khai | 🟡 **có link**: `https://dbinhz109.github.io/vietsoundscape/` — repo public, `pages.yml` dựng `main`; kiểm trình duyệt thật: 4 địa điểm, phòng nghe 5 lớp, không lỗi. **Nội dung vẫn là âm tổng hợp giữ chỗ** | commit `d1ae64b`, `03b1fbb`; run Pages xanh |
| §4 hàng *hosting* — "chưa có hosting" | 🟡 | ✅ GitHub Pages (đúng phương án thuyết minh mục 8 nêu) | `.github/workflows/pages.yml` |
| Số liệu gốc — *mẫu kho mở đã khảo sát 0/17* | 0/17 | **15/17 có ứng viên, 33 bản nghe thử tải về, giấy phép khớp 33/33**; vẫn **0/17 điền vào `clips.json`** vì chưa ai nghe | `nghien-cuu/ung-vien-kho-am.md` §7 |
| §8 rủi ro đầu bảng — *chưa hỏi phòng pháp chế* | 🔴 | **Bỏ theo quyết định Q-25** — rủi ro không mất đi, chỉ đổi từ "chưa hỏi" thành "quyết không hỏi"; hệ quả ghi trong sổ | `nghien-cuu/so-quyet-dinh.md` Q-25 |
| §10 việc 3 — *khảo sát 17 mẫu kho mở* | chưa | máy làm xong phần máy; phần tai người còn | `build/kho-am/DUYET.md` |
| §5 thư viện — *lọc/tìm, trang chi tiết, xuất trích dẫn* (FR-03/25/27, lộ trình B3.1) | chưa dựng | ✅ **xong phần mã** (21/09 chiều): 5 tiêu chí + tìm, thẻ chi tiết theo BA §8.2 với hàng thiếu ghi "chưa có", BibTeX có SHA-256; kiểm trình duyệt 375 px | `src/app/ui/location-filter.js`, `clip-details.js`, `src/data/citation.js` |
| §2 sản phẩm 1 — *ghi công, giấy phép hiển thị, `LICENSE`* (A7.1) | 🔴 chưa có gì | 🟡 cơ chế xong (thẻ ghi công, giấy phép hiệu lực bản trộn), `LICENSE` MIT; **nội dung vẫn "chưa có"** vì `clips.json` chưa điền | sổ quyết định Q-29 |
| §7 việc C7.1/C7.2 — *sửa thuyết minh, chuẩn bị bảo vệ* | chưa | 🟡 văn bản thay thế 6 lỗi soạn sẵn; 12 câu phản biện; demo ngoại tuyến `npm run demo` | `nghien-cuu/sua-thuyet-minh.md`, `phan-bien-du-kien.md` |
| Số liệu gốc — *kho mở 0/17* (tiếp) | 15/17 ứng viên chưa duyệt | máy chấm trước 33 bản (QUA 20 · CẢNH BÁO 12 · LOẠI 1), thứ tự nghe sẵn, `survey.candidates` trong `clips.json`; tai người còn ≈ 40 phút | `ung-vien-kho-am.md` §7.5 |
| §8 lộ trình A5.1 — *PWA offline* | chưa | ✅ service worker + manifest, kiểm tắt mạng tải lại vẫn chạy | `src/app/offline/` |
| §6 hàng *"Mới có 4 bản trộn, cần 12–15"* | 🟡 4 | 🟡 **12 bản trộn** (3/vùng, FR-59 đạt về cấu trúc), vẫn âm giữ chỗ; nút chọn theo thời điểm | `data/recipes/`, `recipe-chooser.js` |
| §7 lộ trình A0.3d, A3.1 — *Sở VHTTDL, thực địa đợt 2* | chưa | 🟡 hai thư soạn sẵn, khung kế hoạch Huế + Buôn Ê Đê | `nghien-cuu/thu-so-vhttdl.md`, `ke-hoach-thuc-dia-dot-2.md` |
| §7 việc C2.1 — *tuyển người* | chưa | 🟡 quy trình, thư mời, script theo dõi sẵn; **chưa mở danh sách** | `nghien-cuu/tuyen-nguoi-tham-gia.md` |

**Tự đánh giá tổng thể, cập nhật (21/09 chiều):** Kỹ thuật và phương pháp ~90% → **~95%** (FR-03/25/27 là ba yêu cầu web cuối còn mở; còn B3.2/B3.3 đóng góp cộng đồng — hoãn sau thi, cần máy chủ). Công bố 0% → **~55%** — link có, cơ chế ghi công/giấy phép/trích dẫn có, `LICENSE` có; **nội dung vẫn giữ chỗ** nên mọi thẻ đang ghi "chưa có". Hai dòng còn lại (vật liệu 0%, dữ liệu người 0%) **không đổi**: bản nghe thử chưa phải vật liệu, chưa có lượt nghe nào. Không con số nào trong bốn dòng tăng thêm được bằng cách viết mã.

