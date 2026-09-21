# VietSoundscape — Bản đồ âm thanh Việt Nam

Nền tảng web để **thu thập, phân loại, mô phỏng và bảo tồn** không gian âm thanh
các vùng miền Việt Nam, kèm một thực nghiệm kiểm chứng hai giả thuyết: nghe âm
thanh **phân lớp có chủ đích** giúp nhận diện vùng miền đúng hơn (H1) và được cảm
nhận khác biệt (H2) so với nghe âm rời rạc.

Đề tài nghiên cứu sinh viên. JS thuần, không khung giao diện. Web trước, app
điện thoại là lựa chọn sau.

**Web công khai:** https://dbinhz109.github.io/vietsoundscape/ — bản dựng của `main`, âm thanh
hiện là **tổng hợp giữ chỗ** (`recipes` đang `placeholder: true`) cho tới khi có vật liệu thật.

## Chạy lần đầu

Cần **Node ≥ 22** (đang dùng 24). `ffmpeg`/`ffprobe` chỉ cần cho đường ống âm
thanh; `python3` + `numpy` chỉ cần để sinh âm thử.

```bash
npm ci                # cài đúng phiên bản trong package-lock.json
npm test              # 618 test — phải xanh trước khi làm gì khác
npm run gen:audio     # sinh âm thử tổng hợp vào spike/audio/ (không có trong repo)
npm run dev           # http://localhost:5174
```

Trang chính là phòng nghe: chọn địa điểm trên bản đồ hoặc danh sách, trộn các
lớp âm. Trên danh sách có bộ lọc năm tiêu chí (vùng, nhóm Krause, vai Schafer,
thời điểm, mức mai một) và ô tìm chữ bỏ dấu; trạng thái lọc nằm trên URL (FR-03).
Mỗi địa điểm có 3 bản trộn theo thời điểm (FR-59), chọn bằng nút trên đầu phòng nghe.
Mỗi lớp âm có thẻ gập "Nguồn, giấy phép và trích dẫn" — mọi trường bắt buộc của
BA §8.2 hiện ra hoặc ghi "chưa có" (FR-25), kèm trích dẫn văn bản và BibTeX có
SHA-256 (FR-27); bản trộn hiện giấy phép hiệu lực theo `phap-ly/09`.
Trang `/thuc-nghiem?nguoi=N` là phiên nghe của người tham gia thứ N — cần
kết xuất kích thích trước (`npm run render:stimuli -- --placeholder`, cần ffmpeg).

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Máy chủ phát triển Vite, cổng 5174 |
| `npm run build` | Dựng bản tĩnh vào `dist/`, chép kèm `data/` và `spike/audio/` |
| `npm run preview` | Xem bản đã dựng |
| `npm run demo` | Dựng với base của Pages rồi phục vụ tại máy — **demo ngoại tuyến** (xem dưới) |
| `npm test` | Toàn bộ kiểm thử, chạy một lần (vitest + happy-dom) |
| `npm run test:watch` | Kiểm thử theo dõi thay đổi |
| `npm run coverage` | Kiểm thử kèm độ phủ (v8), ngưỡng 80% |
| `npm run validate` | Kiểm `data/clips.json` và `data/recipes/*.json` theo luật lược đồ; thoát mã 1 nếu lỗi |
| `npm run process -- <wav…>` | Đường ống âm: đo LUFS → gain → tìm điểm loop → Opus 72k/144k → metadata *(ffmpeg)* |
| `npm run survey` | Phiếu khảo sát kho âm mở cho các mẫu `licensed_archive`, đếm tiến độ |
| `npm run check:recorder -- <bản-thu>` | Chấm thiết bị thu: AGC/khử ồn có tắt thật không *(ffmpeg)* |
| `npm run gen:audio` | Sinh âm thử tổng hợp vào `spike/audio/` *(python3 + numpy)* |
| `npm run spike` | Máy chủ tĩnh cho trang spike đo RAM và chất lượng loop |
| `npm run experiment -- [N]` | In kế hoạch phân điều kiện cho N người, kiểm cân bằng vuông Latin |
| `npm run render:stimuli -- --placeholder [--verify]` | Kết xuất kích thích thực nghiệm (12 bản trộn × 3 điều kiện = 36); `--verify` kết xuất lại và so băm *(ffmpeg, ~600 MB)* |
| `npm run analyse -- <log.json>` | Chạy McNemar (H1) và Wilcoxon (H2) trên log lượt nghe; `-- --demo` dùng dữ liệu giả |
| `npm run plan:sample` | Bảng cỡ mẫu theo ba kịch bản, công thức đối chiếu mô phỏng |
| `npm run chon:tam -- --bo <mã,…>` | Máy chọn tạm nguồn kho từ kết quả `prescreen` (Q-30): điền `source_url/license`, để trống `downloaded_at`, gắn `survey.status: chon_tam`; `--bo` là mẫu không chọn (chờ Q-28) |
| `npm run prescreen` | Chấm máy bản nghe thử kho âm trong `build/kho-am/` (LUFS, đỉnh, im lặng, thời lượng theo vai) → `DUYET.md` mục "Máy chấm trước" *(ffmpeg)* |
| `npm run participants -- <csv>` | Theo dõi tuyển người tham gia: đã nghe/96, vòng 12 đang hở, theo tuần, thiết bị; CSV ngoài git (mẫu `nghien-cuu/mau-danh-sach-cho.csv`) |

CI (`.github/workflows/ci.yml`) chạy `test` → `validate` → `build` trên mỗi push.
`pages.yml` dựng `main` với `PUBLIC_BASE=/vietsoundscape/` (kèm `gen:audio`) và đưa lên GitHub Pages.

## Cấu trúc

```
src/audio/       bộ máy Web Audio: gain, loop, trigger có seed, đồ thị nút — không đụng DOM
src/data/        lược đồ và luật cho mẫu âm, bản trộn, độ to, kiểm thiết bị thu
src/domain/      phân loại Schafer / Krause, ba điều kiện thực nghiệm
src/research/    phân điều kiện, biến thể kích thích, thống kê, cỡ hiệu ứng, lực, thang ISO
src/app/         giao diện: bản đồ, phòng nghe, bộ lọc, thẻ chi tiết, trang thực nghiệm, PWA (offline/)
scripts/         công cụ dòng lệnh (bảng trên)
data/            mẫu âm, bản trộn, địa điểm (GeoJSON) — nguồn sự thật, script Node đọc thẳng
test/            AudioContext giả cho kiểm thử
spike/           trang đo ban đầu (G0)
```

## Tài liệu

| Tệp | Nội dung |
|---|---|
| `BA-VietSoundscape.md` | Phân tích nghiệp vụ: yêu cầu FR/NFR, mô hình dữ liệu, thiết kế thực nghiệm |
| `LO-TRINH-VietSoundscape.md` | Lộ trình theo mốc M0–M7 và ba luồng A/B/C, cổng G0–G2 |
| `SPEC-VIEC-CAN-LAM.md` | Việc cần làm theo hai lần đánh giá lại, mỗi việc có tiêu chí "Đạt khi" |
| `DANH-GIA-SO-VOI-THUYET-MINH.md` | Đối chiếu hiện trạng repo với thuyết minh đề tài: hứa gì, đang ở đâu, phải sửa gì trong thuyết minh |
| `BAO-CAO-G0.md` | Báo cáo spike: chất lượng loop, RAM, câu còn treo |
| `VAT-LIEU-4-DIA-DIEM.md` | Kê vật liệu âm cho bốn địa điểm |
| `nghien-cuu/ke-hoach-phan-tich.md` | Kế hoạch phân tích đăng ký trước: giả thuyết, phép kiểm, cỡ mẫu, tiêu chí loại |
| `nghien-cuu/so-quyet-dinh.md` | Sổ quyết định Q-01…Q-29: mỗi quyết định nghiên cứu kèm lý do và bằng chứng |
| `nghien-cuu/ke-hoach-thuc-dia-dot-1.md` | Kế hoạch thực địa Hà Nội + Cái Răng: mẫu, khung giờ, phiếu, tiêu chí đạt |
| `nghien-cuu/ke-hoach-thuc-dia-dot-2.md` | Kế hoạch đợt 2 Huế + Buôn Ê Đê: mẫu nhạy cảm, phiếu 02 cộng đồng, xin phép chùa, mùa |
| `nghien-cuu/thu-so-vhttdl.md` | Hai thư gửi Sở VHTTDL Huế và Đắk Lắk theo Luật Di sản Điều 16 khoản 3 (A0.3d) |
| `nghien-cuu/ung-vien-kho-am.md` | Ứng viên kho âm mở cho 17 mẫu `licensed_archive`; §7 bản nghe thử đã tải |
| `nghien-cuu/phan-bien-du-kien.md` | 12 câu phản biện dự kiến, mỗi câu có trả lời 30 giây, bằng chứng, điểm yếu thật |
| `nghien-cuu/sua-thuyet-minh.md` | Văn bản thay thế sẵn cho 6 lỗi của thuyết minh gốc (BA §16) |
| `nghien-cuu/tuyen-nguoi-tham-gia.md` | Tuyển người: điều kiện mở, con số, quy trình một người, thư mời, theo dõi tuần |
| `nghien-cuu/phieu-06-cai-rang.md` | Phiếu cộng tác viên điền sẵn cho Cái Răng (nếu không tự đi) |
| `phap-ly/` | Hồ sơ pháp lý: phiếu đồng thuận, thoả thuận cộng đồng, căn cứ luật, quyết định giấy phép |

Mã nguồn theo **MIT** (`LICENSE`; chủ sở hữu tạm ghi là nhóm đề tài — sổ quyết
định Q-29, đổi tên bằng một commit khi NC chốt). Mẫu âm, bản trộn, metadata, tài
liệu theo giấy phép riêng ở `phap-ly/09`.

## Demo ngoại tuyến (bảo vệ không cần wifi)

Toàn bộ trang chạy được không có mạng: bản đồ dùng đường viền vector cục bộ
(không tile, không CDN), dữ liệu và âm nằm trong `dist/`.

```bash
npm run gen:audio     # một lần, nếu spike/audio/ chưa có
npm run demo          # dựng + phục vụ tại http://localhost:4173/vietsoundscape/
```

Tắt wifi rồi mở lại trang để chắc. Nếu cần trình chiếu từ máy khác trong phòng,
thêm `-- --host` vào lệnh preview.

Link công khai cũng là **PWA**: mở một lần có mạng, service worker (`src/app/offline/`)
cất vỏ trang, dữ liệu và tệp âm đã nghe; sau đó mất mạng vẫn mở được, và trên
điện thoại "Thêm vào màn hình chính" cài được như app. Tệp có mã băm cache trước,
dữ liệu `data/` mạng trước (độ tươi), đổi luật thì tăng số ở `CACHE_NAME`.

## Quy ước làm việc

- **Test trước, mã sau.** Mỗi module có tệp `.test.js` cạnh nó.
- Không đưa tệp âm vào git: `spike/audio/`, `build/` sinh lại được.
- Không hardcode bí mật. Biến môi trường duy nhất là `PUBLIC_BASE` (tuỳ chọn, chỉ lúc `build` cho Pages).
- Tài liệu và thông báo lỗi viết bằng tiếng Việt.
