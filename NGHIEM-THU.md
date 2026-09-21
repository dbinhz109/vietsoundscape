# Bảng nghiệm thu — "hoàn thiện" nghĩa là gì và đang ở đâu

**Lập:** 21/09/2026 (máy, từ kiểm tra thật trong repo — không chép từ trí nhớ) · **Commit:** xem `git log`
**Vì sao có tệp này:** lộ trình có 59 dòng việc, spec có 18, nên câu "dự án xong chưa" không trả lời được bằng một chữ. Tệp này định nghĩa **ba mức xong** và xếp từng dòng vào đúng mức, kèm bằng chứng mở được.

---

## Định nghĩa

| Mức | Nghĩa | Ai đóng được |
|---|---|---|
| **M — máy** | Viết mã, dựng tài liệu, chạy đo trên máy tính | Máy làm một mình |
| **N — người** | Cần tay người: đi thu âm, nghe duyệt, ký, gặp cộng đồng, bấm trên máy thật | Chỉ người |
| **T — người tham gia** | Cần người ngoài nhóm ngồi nghe và trả lời | Chỉ sau khi N xong |

**Dự án "hoàn thiện" = cả ba mức đóng.** Đến hôm nay: **M đóng**, N và T chưa mở.

## Số đếm thật trong repo

| | Số | Kiểm bằng |
|---|---|---|
| Kiểm thử | **662** đạt | `npm test` |
| Tài liệu nghiên cứu | 11 tệp | `ls nghien-cuu/*.md` |
| Module mã sản phẩm / tệp kiểm thử | 39 / 34 | `find src -name '*.js'` |
| Công cụ dòng lệnh | 13 | `ls scripts/*.mjs` |
| Mẫu âm khai báo | 32 (15 tự thu, 8 ⭐ xác minh tại chỗ) | `data/clips.json` |
| **Mẫu âm đã thu thật** | **0** | mọi mẫu còn `status: planned` |
| Mẫu có giấy phép | 10 (đều là **máy chọn tạm**, Q-30) | `survey.status` |
| Bản trộn | 12 (3/vùng, FR-59 đạt) — **12/12 còn là âm giữ chỗ** | `data/recipes/` |
| Văn bản pháp lý / nghiên cứu | 10 / 10 | `phap-ly/`, `nghien-cuu/` |
| Quyết định đã ghi | 31 (Q-01…Q-31) | `nghien-cuu/so-quyet-dinh.md` |
| **Lượt nghe thực nghiệm** | **0** | chưa mở tuyển |

## Mức M — máy: đóng

| Nhóm | Bằng chứng |
|---|---|
| Hạ tầng (B0.3, S0.1–S0.4) | repo công khai, CI `lint → test → validate → build`, `LICENSE` MIT, ESLint là cổng (Q-31) |
| Bộ máy âm thanh (B1.1, B1.2) | `src/audio/`: gain, loop, trigger có seed, đồ thị nút; luật khô/ướt dùng chung phòng nghe và bộ kết xuất |
| Luật dữ liệu (A1.4, C3.1b) | `clip-schema.js`, `recipe-schema.js`, `taxonomy.js`; `npm run validate` cưỡng chế FR-59, R-10, giấy phép, đồng thuận |
| Đường ống âm (A1.3) | `npm run process`: LUFS → gain → điểm loop → Opus 72k/144k → metadata + SHA-256. Đã chạy trên âm thật một lần (`BAO-CAO-G0.md` §7) |
| Web (B2.1–B2.5, B3.1) | bản đồ, phòng nghe, lọc/tìm 5 tiêu chí, thẻ chi tiết FR-25, trích dẫn FR-27, tiếp cận bàn phím |
| Thực nghiệm (C3.1, C3.1c, A4.2) | phân điều kiện vuông Latin, 3 biến thể, kết xuất so băm 12/12 khớp |
| Thống kê (C6.1, C6.2) | McNemar, Wilcoxon, cỡ hiệu ứng + CI; đối chiếu R khớp 12 chữ số |
| Công bố (A7.1, A5.1) | link công khai, PWA ngoại tuyến, demo không cần wifi, hình xếp chồng dạng sóng |
| Hiệu năng (B6.3, B6.4) | 94 KB qua dây, 0 lỗi, RAM 12 MB/5 lớp; 6 bề rộng không tràn ngang (`BAO-CAO-G0.md` §8) |
| Báo cáo và bảo vệ (C7.1, C7.2) | Báo cáo nghiên cứu mục 1–4 viết xong, 5–7 có khung; 12 câu phản biện có bằng chứng; văn bản sửa 6 lỗi thuyết minh |

**Còn trong M nhưng cố ý không làm:** B3.2 biểu mẫu đóng góp và B3.3 RLS/CSP cần máy chủ thật — ngoài phạm vi v1 (BA §2 "ngoài phạm vi").

## Mức N — người: chưa mở, 6 việc

| # | Việc | Chặn cái gì | Chuẩn bị sẵn |
|---|---|---|---|
| N1 | **Nghe 10 bản máy chọn tạm**, xác nhận hoặc đổi, tải bản gốc | vật liệu nền cho mọi bản trộn | `build/kho-am/DUYET.md`, thứ tự nghe, ≈ 30 phút |
| N2 | **Chốt 4 quyết định**: vang (S1.3), Q-26 PDM, Q-27 SA, Q-28 tự thu 5 mẫu; xác nhận tên trong `LICENSE` (Q-29) | ký kế hoạch phân tích | mỗi mục có phương án và khuyến nghị của máy |
| N3 | **Thực địa đợt 1** Hà Nội + Cái Răng | 8 mẫu ⭐, R-10, cổng G0 | `ke-hoach-thuc-dia-dot-1.md` chỉ thiếu ngày và tên |
| N4 | **Gửi 2 thư Sở**, liên hệ cộng đồng, **thực địa đợt 2** Huế + Buôn Ê Đê | 4 vùng đủ cho FR-59 | `thu-so-vhttdl.md`, `ke-hoach-thuc-dia-dot-2.md` |
| N5 | **Điện thoại Android thật** trên link công khai + nghe loop 5 phút | đóng cổng G0 | `BAO-CAO-G0.md` §8 đã có số máy tính để đối chiếu |
| N6 | **Ký kế hoạch phân tích**, tag `pre-registration-v1` | mọi lượt nghe sau đó | `ke-hoach-phan-tich.md` chờ chữ ký và ngày |

## Mức T — người tham gia: chưa mở

Pilot 5–8 người → đóng băng bộ câu hỏi → 96 người (sàn 84, bội của 12) → `npm run analyse`.
Quy trình, thư mời và bộ đếm đã sẵn ở `nghien-cuu/tuyen-nguoi-tham-gia.md` và `npm run participants`.
**Ba điều kiện bắt buộc trước khi gửi link đầu tiên:** kích thích thật (N3+N4), kế hoạch đã ký (N6), pilot xong.

## Bốn con số tự đánh giá

| Phần | Mức | Đổi được bằng |
|---|---|---|
| Kỹ thuật và phương pháp | ~97% | — (phần còn lại cần máy chủ) |
| Công bố | ~60% | N1 (có vật liệu thì ghi công hết "chưa có") |
| **Vật liệu thật** | **0%** | N3, N4 |
| **Dữ liệu người tham gia** | **0%** | T |

Hai số 0 cuối là lý do dự án **chưa hoàn thiện**, và không dòng mã nào làm chúng đổi.

## Đường ngắn nhất tới "xong"

`N1 (30 phút)` → `N2 (1 giờ)` → `N3 (2 ngày)` → `N5 (1 giờ)` → `N6 (1 giờ)` → `N4 (3 ngày)` → `T (6–8 tuần)`.

Mốc kiểm được sau mỗi bước: N1 xong thì `npm run survey` hết dòng ⚠; N3 xong thì `npm run validate` báo bản trộn Hà Nội `experimentReady`; N5 xong thì cổng G0 đóng; T xong thì `npm run analyse` chạy trên log thật.
