# Lộ trình thực hiện — VietSoundscape

**Tài liệu kèm:** `BA-VietSoundscape.md` (yêu cầu chi tiết) · `BanDoAmThanh_VietNam.docx` (thuyết minh gốc)
**Ngày lập:** 2026-08-05

## Giả định — sửa lại nếu không đúng

| Giả định | Ảnh hưởng nếu sai |
|---|---|
| **20 tuần (~5 tháng)** kể từ khi khởi động | Nếu ngắn hơn, dùng phương án bó lại ở §7 |
| Nhóm **3–4 người**, làm song song không toàn thời gian | Nếu 2 người, phải bỏ bớt phạm vi, không bó thời gian |
| Đã bỏ hẳn hạng mục AI | Đã phản ánh trong toàn bộ lộ trình |
| **Đã chốt: 4 địa điểm** ⇒ 12 bản trộn, ~32 mẫu âm | — |
| **Đã chốt: mô hình lai về nguồn vật liệu** (BA §5.4) — tải nền có giấy phép mở, tự thu dấu ấn âm thanh | Khối lượng thực địa giảm mạnh: chỉ còn 12–24 mẫu ngắn cần tự thu, không phải thu ambience dài |

**Bốn vai** (một người có thể kiêm nhiều vai): **[NC]** nghiên cứu & điều phối · **[ÂT]** kỹ thuật âm thanh & dữ liệu · **[PM]** lập trình web · **[VH]** nội dung văn hoá & khảo sát.

---

## 1. Nguyên tắc xếp thứ tự

Lộ trình này không xếp theo "dễ làm trước" mà theo **thứ tự khử rủi ro** và **thứ tự không thể đảo**:

1. **Cái không sửa được về sau thì làm trước.** Buổi chợ hôm đó không thu lại được. Đồng thuận không xin được sau khi đã xuất bản.
2. **Cái có thể làm đổ cả đề tài thì thử trước.** Nếu loop không thể liền mạch và điện thoại không tải nổi 5 lớp, thì tiền đề "mô phỏng" sụp — phải biết điều đó ở tuần 2, không phải tuần 15.
3. **Cái nằm trên đường găng thì không được trượt.** Đường găng là: thu âm → xử lý → bản trộn → đóng băng dữ liệu → kích thích → chạy thực nghiệm → phân tích. Mọi việc khác đều có thể chạy song song.
4. **Tuyển người tham gia là việc tốn thời gian thực (calendar time), không phải giờ công.** Phải bắt đầu sớm hơn lúc cần.

### Web trước, app điện thoại là lựa chọn sau

Toàn bộ lộ trình này là **web-first**. Luồng B (phần mềm) chạy liên tục từ tuần 1 đến tuần 18 — là luồng dài nhất, và **bản web demo được cho người ngoài xem đã có ở tuần 9** (mốc M2).

| | Trong phạm vi v1 | Hoãn |
|---|---|---|
| **Web trên máy tính** | ✔ bắt buộc | |
| **Web trên trình duyệt điện thoại** | ✔ **bắt buộc** — cổng G0 phụ thuộc vào việc trộn được 5 lớp trên điện thoại thật | |
| **PWA cài được lên màn hình chính** | ✔ ưu tiên thấp, làm ở M5 khi đã hết việc chặn đường | |
| **App native iOS/Android từ store** | | ✖ hoãn |

**Đừng lẫn "web trên điện thoại" với "app điện thoại".** Cái thứ nhất là bắt buộc và không cắt được — phần lớn người dùng sẽ mở liên kết bằng điện thoại, và toàn bộ ràng buộc bộ nhớ ở M0/G0 là nói về trình duyệt điện thoại. Cái bị hoãn chỉ là bản đóng gói cài từ store.

**Để phần mềm không phải chờ thực địa:** dùng **mẫu âm tạm** (mẫu thu thử ở A0.2 + nguồn có giấy phép mở) làm dữ liệu giả lập, dựng đủ luồng web trước khi có mẫu thật. Đường ống xử lý (A1.3) xuất ra đúng định dạng nên khi dữ liệu thật về chỉ việc thay tệp, không sửa mã. Đây là cách giữ luồng B chạy hết công suất mà không bị luồng A khoá.

### Ba luồng chạy song song

```
Tuần    1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18  19  20
        │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │   │
A Dữ liệu ├───┤ pháp lý+chốt thiết bị ├────── thu đợt 1 ──┤   ├── thu đợt 2 ──┤ ├đóng băng┤
B Phần mềm├───┤ spike âm thanh  ├── đường ống ──┤├─ lát dọc 1 địa điểm ─┤├ mở rộng ┤├chế độ TN┤├ tiếp cận+tối ưu ┤
C Nghiên cứu  ├ thiết kế TN + bộ câu hỏi ┤        ├── tuyển người tham gia ──────┤├chạy TN┤├phân tích┤├báo cáo┤
        │                   │                                   │       │           │           │
      Cổng G0 (tuần 2)   Cổng G1 (tuần 13: đóng băng)      Cổng G2 (tuần 16)    Công bố (tuần 20)
```

---

## 2. Mốc và cổng kiểm soát

| Mốc | Hết tuần | Nội dung | Cổng |
|---|---|---|---|
| **M0** | 2 | Chốt nền tảng, khử rủi ro âm thanh | **G0: go / no-go** |
| **M1** | 6 | Đường ống dữ liệu chạy được + địa điểm đầu tiên đủ âm | |
| **M2** | 9 | Một địa điểm hoàn chỉnh trên web (lát dọc) | |
| **M3** | 12 | Đủ nội dung: 4 địa điểm, 12 bản trộn | |
| **M4** | 13 | Đóng băng dữ liệu v1.0 + kích thích + pilot | **G1: đóng băng, cấm sửa nội dung** |
| **M5** | 16 | Thu xong dữ liệu thực nghiệm | **G2: đủ công suất thống kê?** |
| **M6** | 18 | Phân tích + tiếp cận + tối ưu | |
| **M7** | 20 | Công bố, lưu trữ, báo cáo | |

---

## 3. Chi tiết từng mốc

### M0 — Chốt nền tảng & khử rủi ro (tuần 1–2)

Đây là mốc quan trọng nhất. Mục đích duy nhất: **biết sớm những gì có thể làm đổ đề tài.**

| # | Việc | Vai | Đầu ra |
|---|---|---|---|
| A0.1 | Chốt thiết bị tự thu. **Chạy `npm run check:recorder`** trên bản thu thử 60 giây (25s lặng → 10s có âm → 25s lặng) để biết AGC/khử ồn có tắt thật hay không | ÂT | BA §5.4.2 (câu Q1). Công cụ đã dựng xong — đo thay vì đoán từ thông số máy |
| A0.1b | **Khảo sát kho âm có giấy phép mở**: chạy `npm run survey` để lấy phiếu 17 mẫu kèm từ khoá cụ thể và kho nên tìm; điền vào `data/clips.json` rồi `npm run validate` | ÂT + VH | BA §5.4.1. Phiếu đã dựng xong, có đếm tiến độ. Chỗ nào kho không có gì đáng dùng thì đổi mẫu đó sang tự thu. 📒 21/09: **bản nghe thử 33 ứng viên đã tải**, giấy phép đọc trên trang gốc khớp 33/33, 15/17 mẫu có ứng viên (`nghien-cuu/ung-vien-kho-am.md` §7) — **chưa ai nghe, `clips.json` chưa điền**; 5 mẫu lệch địa lý chờ Q-28. 📒 21/09 (chiều): `npm run prescreen` chấm máy 33 bản — QUA 20 · CẢNH BÁO 12 · LOẠI 1, thứ tự nên nghe trong `build/kho-am/DUYET.md`, ≈ 40 phút tai người cho 15 bản #1; khối `survey` của 17 mẫu đã ghi `candidates` + verdict máy (`ung-vien-kho-am.md` §7.5). 📒 21/09 (tối): **Q-30** chủ trì cho máy **chọn tạm 10 mẫu** (`npm run chon:tam`, §7.6) — `source_url/license` đã điền, `downloaded_at` trống, vẫn `planned`; 5 mẫu lệch địa lý đánh `de_nghi_tu_thu` theo Q-28. Tai người còn ≈ 30 phút xác nhận |
| A0.2 | ~~Soạn bộ hồ sơ pháp lý~~ **XONG** — 7 văn bản ở `phap-ly/`, số điều khoản đã điền đủ. Việc còn lại: nhờ người có chuyên môn pháp lý rà lại, và điền tên người / liên hệ / tên địa điểm | NC + VH | In văn bản 01, 02, 05 mang đi thực địa |
| A0.3 | ~~Tra điều khoản về dữ liệu cá nhân~~ **XONG** — đã đọc **toàn văn** 39 điều Luật 91/2025, 42 điều NĐ 356/2025, Điều 1–63 Luật Di sản 45/2024 (lưu ở `phap-ly/nguon/`). **Bốn câu treo đã trả lời.** Sửa tiếp 3 lỗi của bản tra 05/08 | NC | Văn bản 08 viết lại, dẫn nguyên văn |
| **A0.3b** | **BỎ theo Q-25 (21/09)** — chủ trì chốt không hỏi; hệ quả ghi trong sổ quyết định. Nguyên văn giữ lại: 🔴 **MỚI — gấp nhất.** Hỏi phòng pháp chế của trường: nhóm có phải nộp **hồ sơ đánh giá tác động xử lý dữ liệu cá nhân** cho Cục A05 trong **60 ngày** kể từ mẫu âm có giọng người đầu tiên không (Luật Điều 21.1; đề tài xử lý dữ liệu nhạy cảm nên không được miễn theo Điều 38.2–3 / NĐ 356 Điều 41) | NC | Câu trả lời bằng văn bản. **Chặn A1 nếu là "có"** |
| **A0.3c** | **BỎ theo Q-25 (21/09).** Nguyên văn: 🔴 **MỚI.** Cử **người phụ trách bảo vệ dữ liệu cá nhân** (Luật Điều 33.2; NĐ 356 Điều 13, 14). Điền tên vào `phap-ly/01`, `04`, `07` | NC | Tên + liên hệ công khai trên web |
| **A0.3d** | 🔴 **MỚI.** Liên hệ **Sở VHTTDL Thừa Thiên Huế và Đắk Lắk** — Luật Di sản Điều 16 khoản 3 buộc "phối hợp với cơ quan chuyên môn về văn hoá cấp tỉnh". Cũng là đường nhanh nhất để tiếp cận nghệ nhân | VH | Thư liên hệ + đầu mối tại Sở. 📒 21/09: **hai thư soạn sẵn** ở `nghien-cuu/thu-so-vhttdl.md` (căn cứ Điều 16 khoản 3, đề nghị 3 điểm, đính kèm 02) — cần kiểm tên Sở sau sắp xếp hành chính 2025, xin chữ ký khoa, **chưa gửi** |
| A0.4 | ~~Chốt giấy phép mặc định~~ **XONG** — `phap-ly/09`: CC BY 4.0 mẫu tự thu · CC0 metadata · MIT mã nguồn · **không NC** · **tránh SA** vì copyleft lây sang cả bản trộn. Biểu đạt văn hoá do cộng đồng quyết | NC | Quyết định Q4 |
| B0.1 | ~~**Spike âm thanh** — chỉ để trả lời 2 câu, không làm UI: (1) loop keynote có liền mạch được không? (2) điện thoại tầm trung tải nổi 5 lớp không?~~ **XONG phần đo được trên máy tính** — `spike/index.html` + `spike/spike.js`, chạy bằng `npm run spike`; kết quả ở `BAO-CAO-G0.md` §2: câu (1) liền mạch ở mức số học (khe hở 0 ms sau bước tìm điểm loop, kể cả tệp có 80 ms đệm); câu (2) 9 lớp / 23,1 MB / 61 fps trên Chromium máy tính | PM + ÂT | 🔴 Câu (2) **chưa trả lời được** cho điện thoại — chưa đo trên máy thật (G0-a, spec S2.3). Câu (1) còn thiếu tai người nghe 5 phút (G0-b, spec S2.1) |
| B0.2 | Thu thử 3–5 mẫu ở địa điểm gần nhất để có vật liệu thật cho spike | ÂT | 5 tệp WAV |
| B0.3 | ~~Chốt React hay JS thuần; dựng khung repo, CI, formatter~~ **XONG một phần** — JS thuần đã chốt (`src/app/main.js`, không khung giao diện, Vite chỉ để gói); repo `github.com/dbinhz109/vietsoundscape` (**public từ 21/09**, spec S0.1); CI `.github/workflows/ci.yml` chạy test → validate → build trên mỗi push (spec S0.3); `pages.yml` đưa `main` lên GitHub Pages (A7.1). **Linter XONG (21/09)** — `npm run lint` (ESLint 10, `eslint.config.js`) vào CI trước `test`; bắt được 3 lỗi thật ngay lượt đầu. Formatter: Prettier có cấu hình nhưng **không áp cả cây** theo Q-31. `LICENSE` MIT có từ 21/09 (chủ sở hữu tạm ghi nhóm đề tài — sổ quyết định Q-29) | PM | Q7 trả lời được: clone sạch `npm ci && npm test` xanh 433/433 |
| C0.1 | ~~Chốt thiết kế thực nghiệm: trong-người hay giữa-người~~ **XONG — chọn trong-người** | NC | Đã cài trong `assignment.js` + `session.js`; mỗi người nghe cả 3 điều kiện nên đóng góp 1 cặp cho mỗi phép so sánh |
| C0.2 | ~~Chốt bộ câu hỏi: ISO 12913-2 hay tự soạn~~ **XONG — chọn ISO 12913-2** | NC | `src/research/soundscape-scale.js` (14 test): 8 thuộc tính Phương pháp A + công thức suy hai chiều của ISO/TS 12913-3. Log ghi điểm **thô**, suy diễn lúc phân tích. Quét cạn 5⁸ tổ hợp khẳng định [−1, 1] |

> **Cổng G0 — điều kiện đi tiếp:**
> - [ ] Nghe loop 5 phút **không phát hiện điểm nối**, không có tiếng "cụp"
> - [ ] Trộn 5 lớp trên **điện thoại thật tầm trung**: không rớt tiếng, RAM âm thanh ≤ 150 MB
> - [ ] Có bộ hồ sơ đồng thuận sẵn sàng mang đi thực địa
> - [ ] Đã chốt Q1, Q2, Q3, Q4, Q7
>
> **Nếu trượt tiêu chí 1 hoặc 2:** dừng, đổi chiến lược âm thanh (loop ngắn hơn, mono, kết xuất sẵn bản trộn thành tệp đơn) **trước khi** viết bất kỳ dòng UI nào. Đừng đi tiếp rồi hy vọng sửa sau.

---

### M1 — Đường ống dữ liệu + địa điểm đầu tiên (tuần 3–6)

| # | Việc | Vai | Ghi chú |
|---|---|---|---|
| A1.1 | **Thu đợt 1: địa điểm 1 và 2** — chỉ thu **dấu ấn âm thanh và tín hiệu âm** (3–6 mẫu/nơi). Nền lấy từ kho đã khảo sát ở A0.1b | ÂT + VH | Mô hình lai (BA §5.4). Vẫn nên ghé **≥ 2 thời điểm trong ngày** vì tiếng rao/chuông khác nhau theo giờ |
| **A1.1b** | 🆕 **Đo phản hồi xung tại chỗ** bằng quét hình sin cho từng địa điểm — ngõ hẻm phố cổ, mặt nước chợ nổi, sân chùa Thiên Mụ có đặc tính vang khác hẳn nhau. Xuất WAV không nén, khai vào `reverb_ir` của bản trộn | ÂT | Mã đã sẵn sàng (B1.2) và `npm run validate` kiểm đường dẫn. Vang tổng hợp thì mất đúng cái đang muốn có |
| A1.2 | Ghi nhật ký thực địa ngay tại chỗ: toạ độ, thời gian có múi giờ, thiết bị, hướng micro, bối cảnh | ÂT | Ghi sau sẽ sai hoặc mất |
| A1.3 | **Tự động hoá đường ống xử lý**: lọc nhiễu → cắt → đo LUFS (`ffmpeg -af loudnorm`) → tìm điểm loop → xuất Opus + AAC 2 mức chất lượng → sinh metadata + SHA-256 | ÂT | Làm tay 40 mẫu là chỗ đề tài chết. Đầu tư 3 ngày viết script tiết kiệm 3 tuần |
| A1.4 | Chốt lược đồ metadata theo BA §8.2, kèm từ vựng có kiểm soát cho `endangerment_level` | ÂT + VH | |
| B1.1 | ~~Bộ máy âm thanh thành **module độc lập**, không lẫn vào React; có kiểm thử đơn vị (mock `AudioContext`)~~ **XONG** — `src/audio/{engine,gain,loop,trigger}.js` không đụng DOM hay khung nào; kiểm thử qua `test/fake-audio-context.js` | PM | Ánh xạ gain (`gain.test.js`), lịch trigger có seed mulberry32 (`trigger.test.js`), điểm loop (`loop.test.js`), đồ thị nút (`engine.test.js`) — đều test được, không cần trình duyệt |
| B1.2 | ~~Thực thi đồ thị Web Audio theo BA §5.2, gồm ConvolverNode cho reverb không gian~~ **XONG phần mã** — sửa 2 lỗi: nhánh vang trước đây **100% ướt** (mất sạch âm trực tiếp), và **kích thích kết xuất không có vang trong khi phòng nghe có**. Luật khô/ướt về `audio/gain.js` dùng chung hai bên. Đã kiểm ffmpeg thật: đường vang giữ nguyên tính tái lập FR-52 | PM | 🔴 **Còn thiếu vật liệu**: chưa có phản hồi xung nào — phải đo tại chỗ bằng quét hình sin, xem A1.1b. Và còn một quyết định nghiên cứu: bản thu thực địa đã mang sẵn âm học nơi đó, chồng thêm vang là áp hai lần (BA §5.2b) |
| B1.3 | ~~Xử lý chính sách autoplay: khởi tạo `AudioContext` trong sự kiện người dùng, xử lý `suspended → resume()`, kiểm trên **iOS Safari thật**~~ **XONG phần mã** — `AudioContext` chỉ được tạo trong `room.open()`, mà hàm này chỉ chạy từ cú bấm chọn địa điểm; `suspended → resume()` ở `src/app/room/listening-room.js`; trạng thái từ URL chỉ ghi nhận, không tự phát (NFR-21, `main.js`) | PM | 🔴 **Chưa kiểm trên iOS Safari thật** — cần một iPhone, xem spec S2.3 |
| C1.1 | Chốt bộ kích thích thực nghiệm trên giấy: bao nhiêu vùng, bao nhiêu bản trộn/vùng, mấy điều kiện | NC | ≥ 3 bản trộn/vùng ⇒ 4 vùng = **12 bản trộn** |
| C1.2 | ~~Tính cỡ mẫu theo thiết kế đã chốt; viết trước kế hoạch phân tích~~ **XONG** — `src/research/power.js` (26 test) + `npm run plan:sample` + `nghien-cuu/ke-hoach-phan-tich.md`. 🔴 **Cần 96 người (sàn 84), không phải 40–60**; công thức trong sách cho con số thiếu 5–8 đpt lực. **Sửa đổi 1 (spec S1.2):** kịch bản khai lại bằng "biết + đoán mò" (`src/research/guessing-model.js`) sau khi sửa danh sách trả lời — 96 **xác nhận lại** (sàn 84, lực 86,1%); cùng mức giả định, thiết kế cũ cần 286 người | NC | Còn lại: ký và ghi ngày kế hoạch **trước** lượt nghe đầu tiên |

**Nghiệm thu M1:** đường ống chạy tự động từ WAV gốc ra tệp xuất bản + metadata đầy đủ; địa điểm 1 nghe được bằng script, chưa cần UI.

---

### M2 — Lát dọc một địa điểm hoàn chỉnh (tuần 7–9)

Làm **xong hẳn một địa điểm** từ bản đồ đến bộ trộn, thay vì làm nửa vời cả bốn. Lát dọc phơi ra mọi vấn đề tích hợp sớm.

| # | Việc | Vai |
|---|---|---|
| B2.1 | ~~Bản đồ (Leaflet/MapLibre + GeoJSON) + tile từ MapTiler/Carto. **Không dùng tile mặc định của OSM cho traffic thật**~~ **XONG** — `src/app/map/sound-map.js`: Leaflet + `data/vietnam-outline.geojson` (sinh bằng `scripts/extract-vietnam-outline.mjs`) + `data/locations.geojson`. **Không dùng tile raster nào** — hết vướng tile policy của OSM, không cần MapTiler/Carto, không có yêu cầu mạng nào ra ngoài | PM |
| B2.2 | ~~Phòng nghe: bật/tắt lớp, thanh trượt từng lớp + 3 bus theo nhóm Krause, fade chống tiếng "cụp", gain theo thang dB~~ **XONG** — `src/app/room/listening-room.js` (20 test) + `src/app/ui/layer-slider.js`; ba bus Krause và fade ở `src/audio/engine.js`; thang dB `sliderToDb`/`dbToGain` ở `src/audio/gain.js`. Từ B2.4: phát dần, lớp nền lên tiếng trước | PM |
| B2.3 | ~~Bản trộn nạp từ tệp JSON khai báo (BA §8.3) — người biên tập tạo bản trộn mới **không cần lập trình viên**~~ **XONG** — `data/recipes/*.json` + `data/recipes/index.json`; luật ở `src/data/recipe-schema.js`, `npm run validate` báo lỗi bằng tiếng Việt theo từng trường; `main.js` nạp theo `index.json`, không có bản trộn nào viết trong mã | PM |
| B2.4 | ~~Chia sẻ bản trộn qua URL; tải lười theo lớp, có tiếng đầu tiên ≤ 5 s trên 4G mô phỏng~~ **XONG phần mã** — phát dần: lớp nền đi trước một mình rồi phát ngay, lớp phụ tải nền. Đo trong trình duyệt ở 5 Mbit/s chia nhau: **10,8 s → 6,4 s**. 🔴 **Chưa đạt 5 s vì web đang phục vụ WAV thô**; đường ống đã xuất Opus 72k (nén 7×) ⇒ chiếu ra **0,9 s**. Chỉ cần trỏ `audio` sang bản Opus khi có vật liệu thật. 📒 14/09 (`BAO-CAO-G0.md` §7.3): tỉ số thật của Opus 72k trên âm thật là **15–21×**, con số 7× là của 144k ⇒ 0,9 s là ước lượng dè dặt. 📒 21/09: web công khai đang phục vụ WAV tổng hợp qua GitHub Pages — đo lại thời gian có tiếng đầu tiên trên link đó khi có Opus thật | PM |
| B2.5 | ~~**Làm tiếp cận ngay từ đây**, không để cuối: bàn phím đầy đủ, `role="slider"` + `aria-valuetext`, danh sách địa điểm dạng văn bản song song với bản đồ~~ **XONG phần mã** — `layer-slider.js`: `<input type=range>` (vai slider sẵn) + `aria-valuetext` đọc theo dB; danh sách địa điểm văn bản + `aria-current` ở `main.js` (FR-04); trang thực nghiệm dùng `fieldset`/`legend`, `aria-live`, nhãn `for`/`id` cho mọi ô (kiểm ở `experiment-view.test.js` mục "tiếp cận") | PM | Kiểm với NVDA/VoiceOver và người dùng thật là B6.1 — chưa làm |
| A2.1 | Xử lý xong toàn bộ mẫu đợt 1; dựng 6 bản trộn đầu | ÂT |
| VH2.1 | Viết thẻ văn hoá cho mẫu đợt 1: âm này là gì, ý nghĩa, đang mai một ra sao | VH | **Chỗ đổ nội dung đã có** (14/09): trường `cultural_note_vi/en` + `tags[]`, bắt buộc khi xuất bản, hiện ra ngay dưới thanh trượt trong phòng nghe kèm `aria-describedby` — sổ quyết định Q-24. Mới có 1/32 thẻ (HN-08) |
| C2.1 | **Bắt đầu tuyển người tham gia** — mở danh sách chờ, liên hệ lớp/khoa/nhóm | NC | 📒 21/09: quy trình + thư mời + ba điều kiện trước khi gửi link ở `nghien-cuu/tuyen-nguoi-tham-gia.md`; mẫu CSV `mau-danh-sach-cho.csv` (CSV thật ngoài git); `npm run participants` đếm đã nghe/96, vòng 12, theo tuần (C5.2). **Chưa mở danh sách** — cần người |

**Nghiệm thu M2:** người ngoài nhóm mở link trên điện thoại của họ, tự tìm ra địa điểm, nghe và trộn được, không cần hướng dẫn.

---

### M3 — Đủ nội dung (tuần 10–12)

| # | Việc | Vai |
|---|---|---|
| A3.1 | **Thu đợt 2: địa điểm 3 và 4** + bù các mẫu thiếu của đợt 1 | ÂT + VH | 📒 21/09: khung `nghien-cuu/ke-hoach-thuc-dia-dot-2.md` (Huế + Buôn Ê Đê, phiếu 02 hai cộng đồng, xin phép chùa, mùa); thư Sở `thu-so-vhttdl.md`. Chưa có ngày, đầu mối |
| A3.2 | Xử lý, phân loại, cân bằng LUFS toàn bộ: **≥ 32 mẫu / 4 địa điểm** | ÂT |
| A3.3 | Dựng **đủ 12 bản trộn** (3/vùng) + bản đối chứng "phân lớp sai vùng miền" | ÂT + NC | 📒 21/09: **khung 12 bản trộn XONG** — 8 bản mới (`data/recipes/`, `placeholder: true`, mỗi vùng 3 thời điểm khác nhau, mỗi bản có ⭐), `validate` hết cảnh báo FR-59, `npm run experiment -- 48 --placeholder` 12/12 cân bằng sự kiện; phòng nghe có nút chọn bản trộn theo thời điểm (`src/app/ui/recipe-chooser.js`). Bản đối chứng `scrambled` sinh tự động từ `variants.js`. **Còn:** thay âm giữ chỗ bằng vật liệu thật, tinh chỉnh tổ hợp lớp theo tai |
| B3.1 | Mở rộng đủ 4 địa điểm; lọc/tìm theo phân loại; trang chi tiết mẫu âm + xuất trích dẫn | PM | **XONG một phần** (14/09): cơ chế thẻ văn hoá FR-26 — lược đồ, giao diện, 10 test (`clip-schema.js`, `layer-slider.js`, `listening-room.js`). 📒 21/09: **FR-03, FR-25, FR-27 XONG phần mã** — `src/app/ui/location-filter.js` (5 tiêu chí + tìm chữ bỏ dấu; trạng thái trên URL `vung/nhom/vai/buoi/maimot/q`; danh sách và bản đồ cùng lọc), `src/app/ui/clip-details.js` (thẻ gập theo BA §8.2, hàng thiếu ghi "chưa có"), `src/data/citation.js` (văn bản + BibTeX có SHA-256, hai nút sao chép có đường lùi); 63 test, kiểm trình duyệt thật ở 375 px. Còn lại là **nội dung**: `clips.json` chưa có giấy phép/nguồn/băm nên thẻ đang toàn "chưa có" |
| B3.2 | Biểu mẫu đóng góp + kiểm tệp phía server (kiểu thật theo magic bytes, mã hoá lại, **xoá sạch metadata gốc**) + hàng chờ duyệt | PM |
| B3.3 | Bật RLS trên Supabase, chặn tần suất, cấu hình CSP/HSTS | PM |
| C3.1 | ~~Dựng chế độ thực nghiệm: phân điều kiện, đảo thứ tự cân bằng, chặn quay lại, ghi log đủ để chạy kiểm định~~ **XONG TRỌN** — `assignment.js` + `session.js` (21 test) + `experiment-view.js` (19 test) + `bootstrap.js` (13 test), nối dây tại trang riêng `/thuc-nghiem`. Đã chạy thật trong trình duyệt: 4 lượt, 4 tệp WAV 200 OK, log tải xuống `nguoi-003.json`, `npm run analyse` đọc thẳng được. 0/7 chuỗi bí mật lọt vào DOM. **Sửa lỗi thiết kế S1.1 (spec):** danh sách trả lời trước đây = đúng 4 vùng sẽ nghe ⇒ lượt 4 còn một lựa chọn. Nay = 4 vùng thật + phương án nhiễu (`data/distractors.json`, một nơi cùng vùng cho mỗi vùng), xáo theo (người × lượt) bằng seed ở `src/research/answer-options.js` (11 test); phiên ghi thứ tự đã hiện vào log; ô thật và ô nhiễu dựng giống hệt (test khoá); màn đồng thuận + `phap-ly/07` nói rõ danh sách dài hơn số đoạn | PM + NC |
| **C3.1b** | 🆕 Kiểm khử yếu tố gây nhiễu FR-56/57/59 — `src/research/stimulus.js` **XONG**, đã nối vào `npm run validate` | ÂT + NC |
| **C3.1c** | 🆕 Dựng ba biến thể điều kiện từ bản trộn — `src/research/variants.js` **XONG**. Cân bằng **do cách dựng**: `npm run experiment -- 48 --placeholder` cho 6/6/6 · 7/7/7 · 5/5/5 sự kiện, đạt `checkStimulusBalance` với ngưỡng 0. Chặn cứng nếu mẫu không lặp mà thiếu `duration_s` — không đoán | ÂT + NC |
| C3.2 | Tuyển đủ danh sách người tham gia theo cỡ mẫu đã tính | NC |

**Nghiệm thu M3:** chênh độ to giữa các địa điểm ≤ 3 LU ở cùng vị trí thanh trượt; 100% mẫu đủ trường metadata bắt buộc.

---

### M4 — Đóng băng & pilot (tuần 13) · **Cổng G1**

| # | Việc | Vai |
|---|---|---|
| A4.1 | **Đóng băng bộ dữ liệu `v1.0`** + bảng kê SHA-256 | ÂT |
| A4.2 | ~~**Kết xuất kích thích thực nghiệm** thành tệp cố định; đối chiếu băm~~ **ĐƯỜNG ỐNG XONG** — `npm run render:stimuli -- --placeholder --verify` kết xuất 12 kích thích, kết xuất lại lần hai, **12/12 khớp băm chính xác**, độ to lệch 0,04 LU. Việc còn lại ở mốc này: chạy lại trên **vật liệu thật** rồi chốt bảng kê vào `v1.0`. **Kết xuất phía máy chủ, không phải trên máy người tham gia**: `OfflineAudioContext` không cho ra byte giống nhau giữa các trình duyệt (BA §10.5) | ÂT + PM |
| C4.1 | **Pilot với 5–8 người** ngoài nhóm | NC |
| C4.2 | Sửa câu hỏi/hướng dẫn theo phản hồi pilot, rồi **đóng băng bộ câu hỏi** | NC |

> **Cổng G1 — sau mốc này cấm sửa nội dung:**
> - [x] ~~Kích thích cố định, băm khớp, không còn ngẫu nhiên trong bản dùng cho thực nghiệm~~ — **đường ống đã chứng minh** trên âm giả lập: 12/12 tệp khớp băm khi kết xuất lại (`npm run render:stimuli -- --placeholder --verify`). Còn phải chạy lại trên vật liệu thật trước khi tick thật
> - [ ] Pilot chạy trơn, người tham gia hiểu hướng dẫn mà không cần giải thích thêm
> - [ ] Dữ liệu `v1.0` đã đóng băng, có bảng kê băm
>
> **Vì sao là cổng cứng:** sửa mẫu âm hoặc bản trộn sau khi đã có người trả lời sẽ làm dữ liệu thực nghiệm **không còn tái lập được** — kết quả mất giá trị. Muốn sửa gì thì để vào `v1.1` sau khi thu xong.

---

### M5 — Chạy thực nghiệm (tuần 14–16) · **Cổng G2**

| # | Việc | Vai |
|---|---|---|
| C5.1 | Chạy thu dữ liệu: **96 người** (bội của 12 để tròn vòng cân bằng; sàn 84). Con số 40–60 cũ chỉ cho 44–63% lực cho H1 — xem C1.2. Nếu không tuyển đủ: `nghien-cuu/ke-hoach-phan-tich.md` §2.4 | NC + cả nhóm |
| C5.2 | Theo dõi tiến độ hằng tuần; ghi nhận thiết bị nghe / có tai nghe hay không | NC |
| B5.1 | Chỉ sửa lỗi chặn đường, **tuyệt đối không đổi nội dung hay âm thanh** | PM |
| A5.1 | Việc không ảnh hưởng thực nghiệm: **PWA offline + cài được lên màn hình chính**, hiển thị dạng sóng/phổ | PM + ÂT | 📒 21/09: **PWA XONG** — `src/app/offline/` (luật cache có 14 test với cache giả; `sw.js` gói riêng ở gốc bản dựng; `manifest.webmanifest` + biểu tượng 192/512). Kiểm trình duyệt thật: mở một lần rồi tắt mạng, tải lại vẫn đủ 4 địa điểm và phòng nghe 5 lớp từ cache. Kéo lên sớm vì phục vụ C7.2. **Còn:** dạng sóng/phổ |

> **Cổng G2:** đã đạt cỡ mẫu đã tính chưa? Nếu chưa, **kéo dài tuyển thêm**, đừng phân tích với mẫu thiếu công suất — kết quả "không có ý nghĩa" do thiếu mẫu sẽ bị hiểu sai thành "giả thuyết sai".

---

### M6 — Phân tích, tiếp cận, tối ưu (tuần 17–18)

| # | Việc | Vai |
|---|---|---|
| C6.1 | ~~Chạy kiểm định đúng loại: **McNemar** cho H1, **Wilcoxon signed-rank** cho H2~~ **CÔNG CỤ XONG** — `npm run analyse -- <tệp log>`. Đối chiếu độc lập với Python: khớp 12 chữ số có nghĩa. Chạy **hai** phép so sánh: `layered` vs `isolated` **và** `layered` vs `scrambled` (FR-58). Việc còn lại: chạy trên dữ liệu thật | NC |
| **C6.1b** | 🆕 Format log lượt nghe đã chốt bởi `scripts/analyse-results.mjs` — chế độ thực nghiệm (C3.1) **phải** ghi đúng các trường đó, thiếu một trường là mất một giả thuyết. Xem `npm run analyse -- --demo` | PM + NC |
| C6.2 | ~~Báo cáo cả cỡ hiệu ứng và khoảng tin cậy, không chỉ giá trị p~~ **XONG** — `src/research/effect-size.js`. H1: chênh tỉ lệ (Wald hiệu chỉnh Agresti–Min) + tỉ số odds (CI logit). H2: rank-biserial + Hodges–Lehmann (CI cắt đuôi phân bố signed-rank). `npm run analyse` in cỡ hiệu ứng **ngay dưới mỗi p**, không để mục riêng | NC |
| B6.1 | **Kiểm thử tiếp cận thật** với NVDA/VoiceOver + ≥ 1 người khiếm thị; chế độ hạ âm nền khi trình đọc đang nói | PM |
| B6.2 | Nếu B6.1 không làm được → **bỏ tuyên bố hỗ trợ người khiếm thị** khỏi mục 10 thuyết minh. Không giữ tuyên bố chưa kiểm chứng | NC |
| B6.3 | Đo và siết hiệu năng: RAM âm thanh, thời gian có tiếng đầu tiên, ngân sách băng thông CDN | PM | 📒 21/09: **đo trên bản công khai** (`BAO-CAO-G0.md` §8.3) — 94 KB qua dây lần tải đầu (gzip), 10 yêu cầu, 0 lỗi, DOMContentLoaded 50 ms, RAM âm thanh 12,0 MB/5 lớp (ngưỡng NFR-04 là 150 MB). **Máy tính**; điện thoại thật vẫn là S2.3 |
| B6.4 | Kiểm thử chéo trình duyệt + hồi quy hình ảnh ở 320/768/1024/1440 | PM | 📒 21/09: **hồi quy bố cục XONG** ở 320/375/768/1024/1440/1920 — không bề rộng nào tràn ngang, bố cục đổi đúng mốc 60rem, bộ lọc 1→2 cột (`BAO-CAO-G0.md` §8.1); bàn phím đi trọn tới phòng nghe, viền focus 2 px, giảm chuyển động về 0 s (§8.2). **Còn:** Firefox và **iOS Safari thật** (B1.3) |

---

### M7 — Công bố & lưu trữ (tuần 19–20)

| # | Việc | Vai |
|---|---|---|
| A7.1 | Công bố web, kiểm lại toàn bộ ghi công và giấy phép hiển thị đúng | cả nhóm | **XONG một phần (21/09, kéo lên sớm theo G2)** — link công khai `https://dbinhz109.github.io/vietsoundscape/` từ `.github/workflows/pages.yml`, base qua `src/app/asset-url.js`; kiểm trình duyệt thật: 4 địa điểm, phòng nghe 5 lớp, không lỗi. 📒 21/09 (chiều): **cơ chế ghi công xong** — thẻ "Nguồn, giấy phép và trích dẫn" trên mỗi lớp + "Giấy phép hiệu lực của bản trộn" (`effectiveMixLicense`) theo `phap-ly/09`; `LICENSE` MIT (Q-29). **Còn:** âm là tổng hợp giữ chỗ nên thẻ toàn "chưa có"; `/thuc-nghiem` chưa có kích thích (BA §10.5) |
| A7.2 | Nộp bộ dữ liệu lên Zenodo lấy **DOI** — nâng hẳn giá trị mục "sản phẩm dự kiến". ⚠️ **Phải là bước cuối, sau khi đã công khai hợp pháp trên web.** Hai lý do: (1) NĐ 356 Điều 17 khoản 3 điểm b miễn hồ sơ đánh giá tác động **chuyển dữ liệu xuyên biên giới** cho dữ liệu đã công khai hợp pháp — nộp trước là mất miễn trừ và phải làm hồ sơ trong 60 ngày (Luật Điều 20 khoản 2); (2) Zenodo giữ vĩnh viễn, nộp sớm là tự khoá tay khi có người yêu cầu xoá (Luật Điều 14 khoản 3) | ÂT |
| C7.1 | Viết báo cáo/bài báo; **sửa 5 lỗi trong thuyết minh gốc** theo BA §16 (thiếu mục 9, sai lĩnh vực, thiếu kế hoạch/kinh phí/tham khảo, thu hẹp phát biểu "chưa có bản đồ nào", xoá câu H3) | NC | 📒 21/09: **văn bản thay thế soạn sẵn** cho cả 6 lỗi + 3 mục mới (kế hoạch/phân công, kinh phí/rủi ro, tài liệu tham khảo) ở `nghien-cuu/sua-thuyet-minh.md` — NC duyệt rồi dán vào `.docx` |
| C7.2 | Chuẩn bị bảo vệ: demo ngoại tuyến dự phòng (**đừng phụ thuộc wifi hội trường**) | cả nhóm | 📒 21/09: **không phụ thuộc wifi** — bản đồ dùng đường viền vector cục bộ, không tile, không CDN; `npm run demo` dựng + phục vụ tại máy (README). Bộ câu phản biện dự kiến: `nghien-cuu/phan-bien-du-kien.md` (12 câu, mỗi câu có bằng chứng mở được và điểm yếu thật) |

---

## 4. Bảy sai lầm thứ tự làm đổ đề tài

| Sai lầm | Hậu quả |
|---|---|
| **Kích thích thực nghiệm H1 chỉ gồm nền tải về** | H1 hỏi người nghe có nhận đúng vùng miền không. Nếu vật liệu không thật sự đến từ vùng đó thì **H1 không kiểm được gì cả**. Mỗi bản trộn dùng cho H1 phải chứa ≥ 1 dấu ấn âm thanh nhóm tự thu và đã xác minh (BA R-10) |
| **Tải vật liệu có giấy phép NC** | Chặn luôn giá trị "quảng bá du lịch" nêu ở mục 10 thuyết minh; phát hiện muộn thì phải thay toàn bộ vật liệu (BA LG-03) |
| Thu âm trước khi có quy trình đồng thuận | Dữ liệu không dùng được, không xin lại được |
| Thu âm trước khi chốt thiết bị/định dạng | Không thu lại được buổi đó |
| Làm UI trước khi chứng minh loop liền mạch | Xây trên nền cát; đến tuần 15 mới biết thì hết đường lùi |
| Sửa dữ liệu sau khi đã chạy thực nghiệm | Kết quả không tái lập, mất giá trị khoa học |
| Tuyển người tham gia ở tuần 14 | Nghẽn cứng ở cuối, không kịp phân tích |

---

## 5. Việc phải làm sớm dù trông như việc nhỏ

- **Script hoá đường ống xử lý âm (A1.3).** 3 ngày viết script đổi lấy 3 tuần làm tay và tránh sai sót không đều tay.
- **Bản trộn là tệp JSON khai báo (B2.3).** Người viết nội dung tự tạo bản trộn, không phải chờ lập trình viên. Đây cũng là điều kiện để kết xuất kích thích ở M4.
- **Tiếp cận làm trong lúc dựng component (B2.5).** Ghép vào sau đắt gấp nhiều lần.
- **Đo LUFS ngay khi xử lý (A1.3).** Thiếu số đo này thì việc cân bằng độ to giữa các địa điểm không làm được.

---

## 6. Kiểm tra sức khoẻ định kỳ

| Nhịp | Kiểm gì |
|---|---|
| Hằng tuần | Đường găng có trượt không? Số mẫu đã xử lý đạt / kế hoạch? |
| Cuối mỗi mốc | Nghiệm thu theo tiêu chí của mốc, không nghiệm thu bằng cảm tính |
| Hằng tháng | Đo lại RAM + thời gian có tiếng trên **điện thoại thật**, không chỉ máy tính |
| Trước mỗi chuyến thực địa | Đủ hồ sơ đồng thuận? Thiết bị đủ pin/thẻ nhớ? Đã thu thử chưa? |

---

## 7. Nếu chỉ có 12 tuần

Bó theo thứ tự này, **không bó chỗ khác**:

| Giữ nguyên (không thoả hiệp) | Cắt |
|---|---|
| M0 và cổng G0 — vẫn 2 tuần | Còn **3 địa điểm**, **9 bản trộn** |
| Chế độ thực nghiệm + kích thích kết xuất sẵn | Trang đóng góp cộng đồng → chỉ nhận qua email, không làm biểu mẫu |
| Chuẩn hoá LUFS + loop liền mạch | PWA offline, hiển thị dạng sóng/phổ |
| Đóng băng dữ liệu + cổng G1 | Thu ở 2 thời điểm/ngày → chỉ 1 thời điểm |
| Kiểm định thống kê đúng loại | Cỡ mẫu xuống ~30 người, **thiết kế trong-người** để giữ công suất |
| Tiếp cận bằng bàn phím + ARIA | Kiểm thử với người khiếm thị → **và bỏ luôn tuyên bố đó khỏi thuyết minh** |

**Không được cắt:** cổng G0, chế độ thực nghiệm, đóng băng dữ liệu, hồ sơ đồng thuận. Cắt bất kỳ cái nào trong bốn cái này thì phần nghiên cứu mất giá trị, chỉ còn lại một website nghe cho vui.

---

## 8. Đường đi tới app điện thoại (sau v1, khi thật cần)

Ba bước, tăng dần chi phí. Đừng nhảy bước.

| Bước | Làm gì | Chi phí | Được gì |
|---|---|---|---|
| 1 | **PWA cài được** — manifest + icon + Service Worker (FR-70/71, đã nằm ở M5) | ~2–3 ngày | Cài lên màn hình chính, chạy offline, mở ra không thấy thanh địa chỉ. Với đa số người dùng thì đây **đã là "app"** |
| 2 | **Bọc bằng Capacitor** nếu bắt buộc phải có mặt trên App Store / Play Store | ~1–2 tuần + phí tài khoản nhà phát triển | Có mặt trên store, dùng lại 100% mã web |
| 3 | Viết native thật | **hàng tháng** | Gần như không thêm giá trị — xem bên dưới |

**Vì sao bước 3 gần như không nên làm:** viết native nghĩa là làm lại toàn bộ bộ trộn bằng `AVAudioEngine` (iOS) và Oboe/AAudio (Android). Đó đúng là phần khó nhất của đề tài, làm lại từ đầu, mà **không thu được thêm giá trị khoa học nào** — H1/H2 không phụ thuộc vào việc chạy trên nền tảng nào. Chỉ có một lý do kỹ thuật chính đáng để đi bước 3: nếu cần thu âm nền trong lúc app chạy ngầm hoặc cần độ trễ âm thanh rất thấp — cả hai đều không nằm trong yêu cầu của đề tài.

**Điều kiện duy nhất phải giữ từ bây giờ để bước 1 và 2 còn rẻ:** bộ máy âm thanh là **module độc lập**, không lẫn logic vào component React (NFR-50, việc B1.1 ở mốc M1). Nếu để logic âm thanh trộn vào UI thì cả ba bước trên đều đắt lên nhiều lần. Đây là lý do kiến trúc thật sự của việc tách module, không phải chỉ để cho gọn mã.
