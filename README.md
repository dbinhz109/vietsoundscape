# VietSoundscape — Bản đồ âm thanh Việt Nam

Nền tảng web để **thu thập, phân loại, mô phỏng và bảo tồn** không gian âm thanh
các vùng miền Việt Nam, kèm một thực nghiệm kiểm chứng hai giả thuyết: nghe âm
thanh **phân lớp có chủ đích** giúp nhận diện vùng miền đúng hơn (H1) và được cảm
nhận khác biệt (H2) so với nghe âm rời rạc.

Đề tài nghiên cứu sinh viên. JS thuần, không khung giao diện. Web trước, app
điện thoại là lựa chọn sau.

## Chạy lần đầu

Cần **Node ≥ 22** (đang dùng 24). `ffmpeg`/`ffprobe` chỉ cần cho đường ống âm
thanh; `python3` + `numpy` chỉ cần để sinh âm thử.

```bash
npm ci                # cài đúng phiên bản trong package-lock.json
npm test              # 478 test — phải xanh trước khi làm gì khác
npm run gen:audio     # sinh âm thử tổng hợp vào spike/audio/ (không có trong repo)
npm run dev           # http://localhost:5174
```

Trang chính là phòng nghe: chọn địa điểm trên bản đồ hoặc danh sách, trộn các
lớp âm. Trang `/thuc-nghiem?nguoi=N` là phiên nghe của người tham gia thứ N — cần
kết xuất kích thích trước (`npm run render:stimuli -- --placeholder`, cần ffmpeg).

## Lệnh

| Lệnh | Làm gì |
|---|---|
| `npm run dev` | Máy chủ phát triển Vite, cổng 5174 |
| `npm run build` | Dựng bản tĩnh vào `dist/`, chép kèm `data/` và `spike/audio/` |
| `npm run preview` | Xem bản đã dựng |
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
| `npm run render:stimuli -- --placeholder [--verify]` | Kết xuất 12 kích thích thực nghiệm; `--verify` kết xuất lại và so băm *(ffmpeg, ~198 MB)* |
| `npm run analyse -- <log.json>` | Chạy McNemar (H1) và Wilcoxon (H2) trên log lượt nghe; `-- --demo` dùng dữ liệu giả |
| `npm run plan:sample` | Bảng cỡ mẫu theo ba kịch bản, công thức đối chiếu mô phỏng |

CI (`.github/workflows/ci.yml`) chạy `test` → `validate` → `build` trên mỗi push.

## Cấu trúc

```
src/audio/       bộ máy Web Audio: gain, loop, trigger có seed, đồ thị nút — không đụng DOM
src/data/        lược đồ và luật cho mẫu âm, bản trộn, độ to, kiểm thiết bị thu
src/domain/      phân loại Schafer / Krause, ba điều kiện thực nghiệm
src/research/    phân điều kiện, biến thể kích thích, thống kê, cỡ hiệu ứng, lực, thang ISO
src/app/         giao diện: bản đồ, phòng nghe, trang thực nghiệm
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
| `phap-ly/` | Hồ sơ pháp lý: phiếu đồng thuận, thoả thuận cộng đồng, căn cứ luật, quyết định giấy phép |

Giấy phép mã nguồn dự kiến là MIT (`phap-ly/09`); chưa có tệp `LICENSE` vì chưa
điền tên chủ sở hữu.

## Quy ước làm việc

- **Test trước, mã sau.** Mỗi module có tệp `.test.js` cạnh nó.
- Không đưa tệp âm vào git: `spike/audio/`, `build/` sinh lại được.
- Không hardcode bí mật. Repo hiện không cần biến môi trường nào.
- Tài liệu và thông báo lỗi viết bằng tiếng Việt.
