# BA — Bản đồ âm thanh Việt Nam (VietSoundscape)

| | |
|---|---|
| **Tài liệu** | Phân tích nghiệp vụ (Business Analysis) |
| **Nguồn đầu vào** | `BanDoAmThanh_VietNam.docx` (thuyết minh đề tài, 11 mục) |
| **Phiên bản** | 0.1 — bản nháp đầu, chờ chốt các mục ở §14 |
| **Ngày** | 2026-08-05 |
| **Phạm vi** | Nền tảng web thu thập – phân loại – mô phỏng – bảo tồn soundscape các vùng miền Việt Nam |
| **Trạng thái** | **Đã chốt:** bỏ hẳn AI/học máy (§2) · 4 địa điểm · nguồn vật liệu theo mô hình lai (§5.4). **Chưa chốt:** thiết bị tự thu (§5.4.2), bộ câu hỏi khảo sát (§10.3), thiết kế thực nghiệm (§10.2) |

> **Cách đọc tài liệu này.** Mục 1–4 là nghiệp vụ. Mục 5–8 là yêu cầu chức năng (FR) và dữ liệu. Mục 9 là yêu cầu phi chức năng (NFR). Mục 10 là yêu cầu riêng cho phần nghiên cứu — phần này thường bị bỏ sót và là chỗ dễ làm đổ giả thuyết H1/H2 nhất. Mục 11–14 là pháp lý, rủi ro, nghiệm thu, câu hỏi mở. Lý do và bằng chứng của từng quyết định nằm ở `nghien-cuu/so-quyet-dinh.md` (các dòng 📒); BA chỉ giữ yêu cầu hiện hành.

---

## 1. Bối cảnh và vấn đề nghiệp vụ

Không gian âm thanh (soundscape) đặc trưng của từng vùng miền Việt Nam là di sản văn hóa phi vật thể nhưng đang mai một nhanh do đô thị hóa và thay đổi lối sống. Hiện trạng:

| Vấn đề | Hệ quả nghiệp vụ |
|---|---|
| Âm thanh đặc trưng biến mất theo thời gian | Mất vĩnh viễn, không có bản ghi đối chứng cho thế hệ sau |
| Bản ghi nếu có thì rời rạc, không phân loại, không định vị | Không tra cứu được, không dùng được cho giáo dục/nghiên cứu |
| Chưa khai thác "nghe một vùng đất" như kênh giới thiệu văn hóa | Bỏ trống một hình thức truyền thông di sản có chi phí thấp |

**Cơ hội công nghệ:** Web Audio API cho phép phân lớp và trộn nhiều nguồn âm theo thời gian thực ngay trên trình duyệt — nghĩa là sản phẩm có thể *mô phỏng* không gian âm thanh chứ không chỉ *phát lại* bản ghi. Đây là điểm khác biệt cốt lõi và cũng là ràng buộc kỹ thuật chính của toàn hệ thống.

### 1.1 Định vị so với các nền tảng đã có

| Nền tảng | Mô hình | Khoảng trống VietSoundscape lấp vào |
|---|---|---|
| Radio Aporee | Bản đồ âm thanh toàn cầu, cộng đồng đóng góp tự do | Không phân loại khoa học, không có bộ trộn phân lớp, dữ liệu VN lẻ tẻ |
| Cities and Memory | Bản ghi gốc + bản phối lại nghệ thuật | Hướng nghệ thuật, không hướng bảo tồn có hệ thống |
| British Library Sounds | Kho lưu trữ có biên mục | Không gắn bản đồ tương tác, không mô phỏng |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-01** — Rủi ro phát biểu (`nghien-cuu/so-quyet-dinh.md`).

---

## 2. Mục tiêu nghiệp vụ và chỉ số đo

| Mã | Mục tiêu | Chỉ số đo được (KPI) |
|---|---|---|
| G1 | Thư viện âm thanh số có phân loại khoa học | **4 địa điểm**; ≥ 32 mẫu âm đạt chuẩn metadata bắt buộc (§8.2); 100% mẫu có nguồn gốc + giấy phép rõ; trong đó **≥ 12 mẫu do nhóm tự thu và xác minh tại chỗ** (§5.4) |
| G2 | Web có bản đồ tương tác | Người dùng mới vào được "phòng nghe" của 1 địa điểm trong ≤ 3 lần tương tác |
| G3 | Công cụ mô phỏng soundscape | Trộn được ≥ 5 lớp âm đồng thời, ổn định trên máy tính và điện thoại tầm trung |
| G4 | Đánh giá hiệu quả bằng thực nghiệm | Kiểm chứng được H1/H2 với kiểm định thống kê hợp lệ, cỡ mẫu đủ công suất (§10.2) |
| G5 | Bảo tồn dài hạn | Bộ dữ liệu được đóng gói, có mã băm toàn vẹn, lưu trữ ở nơi có định danh bền (DOI) |

**Ngoài phạm vi (Out of scope):**

- **Mọi hạng mục AI / học máy — đã quyết định bỏ hẳn.** Bao gồm giả thuyết H3 về nhận diện vùng miền bằng mô hình, việc so sánh AI với con người, phân loại âm thanh tự động, và nhận dạng âm thanh thời gian thực. Đề tài chỉ còn hai giả thuyết H1 và H2, kiểm chứng bằng thực nghiệm với người nghe (§10). Câu dẫn H3 ở cuối mục 4 của thuyết minh gốc phải xoá — xem §16.5.
- **Ứng dụng di động native (iOS/Android) — hoãn, không làm ở v1.** Toàn bộ nguồn lực dồn cho web.

  > ⚠️ **Phải phân biệt rõ hai thứ hay bị lẫn:**
  > - **Web chạy trên điện thoại** — **nằm trong phạm vi v1 và là yêu cầu bắt buộc** (NFR-01…04, NFR-20…23). Phần lớn người dùng sẽ mở liên kết bằng trình duyệt điện thoại, và cổng kiểm soát G0 của lộ trình phụ thuộc vào việc trộn được 5 lớp trên điện thoại thật. Không được cắt phần này.
  > - **App đóng gói cài từ store** — đây mới là thứ bị hoãn.
  >
  > **Đường đi tới app khi nào cần:** PWA cài được (FR-70) trước, nếu thật cần lên store thì bọc web bằng Capacitor — **không viết lại native**. Viết lại native nghĩa là phải làm lại toàn bộ bộ trộn bằng AVAudioEngine (iOS) và Oboe/AAudio (Android), tức là làm lại đúng phần khó nhất của đề tài mà không thu được giá trị khoa học nào. Điều kiện để giữ được lựa chọn rẻ này: **bộ máy âm thanh phải là module độc lập, không lẫn vào React** (NFR-50).
- Thu âm không gian 3D / ambisonic.
- Bản đồ toàn quốc 63 tỉnh.
- Dịch đa ngôn ngữ ngoài Việt–Anh.

> 📒 Lý do và bằng chứng: sổ quyết định **Q-02** — Hệ quả tích cực của việc bỏ AI (`nghien-cuu/so-quyet-dinh.md`).

---

## 3. Các bên liên quan (Stakeholder)

| Bên liên quan | Quan tâm chính | Ảnh hưởng lên yêu cầu |
|---|---|---|
| Nhóm nghiên cứu | Bảo vệ được giả thuyết, có sản phẩm chạy được | Cần chế độ thực nghiệm (§10), cần dữ liệu đóng băng phiên bản |
| Người xem phổ thông / khách du lịch | Trải nghiệm "nghe một vùng đất" | Vào nhanh, không cần đăng ký, chạy tốt trên 4G |
| Giáo viên / học sinh | Dùng trong tiết học di sản | Chế độ dùng ngoại tuyến (không wifi), nội dung văn hóa chuẩn xác |
| Người khiếm thị | Tiếp cận được nội dung | **Buộc phải có** đường dẫn không dùng bản đồ (§7.8) — vì thuyết minh đã hứa giá trị này |
| Người đóng góp âm thanh | Được ghi công, giữ quyền | Khai báo giấy phép, ghi công, cơ chế rút bản ghi |
| Cộng đồng chủ thể văn hóa (nghệ nhân, dân địa phương) | Không bị khai thác, được ghi nhận | Đồng thuận, ghi công cộng đồng, giới hạn mục đích sử dụng (§11) |
| Người kiểm duyệt / quản trị | Chất lượng và tính pháp lý của dữ liệu | Quy trình duyệt trước khi xuất bản (§7.7) |

---

## 4. Từ vựng nghiệp vụ (bắt buộc dùng thống nhất trong code và tài liệu)

| Thuật ngữ | Định nghĩa | Vì sao quan trọng với kỹ thuật |
|---|---|---|
| **Soundscape** | Toàn bộ không gian âm thanh cảm nhận được tại một nơi chốn | Là đối tượng nghiệp vụ trung tâm |
| **Keynote** (âm nền) | Âm nền liên tục, hầu như luôn hiện diện (sóng biển, gió, ồn giao thông) | → phát **loop liên tục**, gain thấp, là "bed" của bản trộn |
| **Sound signal** (tín hiệu âm) | Âm nổi lên có chủ ý, lặp lại không đều (tiếng rao, chuông, còi) | → phát **theo chu kỳ có xác suất**, cần seed để tái lập (§10.5) |
| **Soundmark** (dấu ấn âm thanh) | Âm mang bản sắc riêng của một nơi, không nơi nào khác giống | → phát **one-shot nổi bật**, là "nhân vật chính" của địa điểm |
| **Geophony** | Âm tự nhiên phi sinh vật: gió, nước, mưa | → nhóm bus 1 trong bộ trộn |
| **Biophony** | Âm sinh vật: chim, ve, ếch | → nhóm bus 2 |
| **Anthrophony** | Âm do con người: chợ, giao thông, tôn giáo, nhạc | → nhóm bus 3 |
| **Lớp âm (Layer)** | Một mẫu âm + cấu hình phát của nó trong một bản trộn | Đơn vị điều khiển của người dùng (bật/tắt, âm lượng) |
| **Bản trộn (Recipe)** | Đặc tả khai báo của một soundscape: danh sách lớp + gain + pan + seed | **Là dữ liệu, không phải trạng thái UI** — chia sẻ được, tái lập được |
| **Mẫu âm (Clip)** | Một tệp âm thanh đã xử lý + metadata của nó | Đơn vị lưu trữ và trích dẫn |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-03** — Nhận định kiến trúc quan trọng (`nghien-cuu/so-quyet-dinh.md`).

---

## 5. Kiến trúc đề xuất (điều chỉnh so với mục 8 của thuyết minh)

### 5.1 Sơ đồ khối

```
Người dùng ─► Trình duyệt (SPA)
                 │
                 ├─ Tầng bản đồ ......... Leaflet/MapLibre + GeoJSON điểm âm
                 ├─ Tầng dữ liệu ........ locations.geojson, clips.json, recipes/*.json  (tĩnh, CDN)
                 ├─ Bộ máy âm thanh ..... Web Audio API (chi tiết §5.2)
                 └─ Tầng ghi (chỉ khi cần)
                        │
                        ▼
                 Supabase (Postgres + RLS + Storage)
                        ├─ contributions      (âm thanh cộng đồng gửi lên, chờ duyệt)
                        └─ survey_responses   (dữ liệu thực nghiệm H1/H2)

Tệp âm thanh ─► Object storage + CDN (tên tệp có băm nội dung, Cache-Control: immutable)
```

**Nguyên tắc:** *đường đọc là tĩnh, đường ghi mới cần backend.* Toàn bộ nội dung công khai (bản đồ, metadata, âm thanh, bản trộn) là tệp tĩnh trên CDN — miễn phí, nhanh, cache tốt, không có gì để tấn công. Chỉ hai việc cần ghi dữ liệu: nhận đóng góp và thu phản hồi khảo sát.

### 5.2 Đồ thị Web Audio (thiết kế bắt buộc)

```
                        ┌──────────────── LỚP ÂM (mỗi lớp một nhánh) ────────────────┐
AudioBufferSource ──► GainNode ──► StereoPanner ──┐
 (clip ngắn, loop)   (gain lớp)     (trái/phải)   │      ┌─► GainNode ─────────────────┐
                                                  ├──► GainNode                        ├─► GainNode ─► destination
MediaElementSource ──► GainNode ──► StereoPanner ─┘   (bus Krause) └─► Convolver ─► GainNode ─┘   (master)
 (bed dài, streaming)                                              (vang không gian)  (ướt)
                                                              đường khô ↑ + đường ướt ↑
```

> 📒 Lý do và bằng chứng: sổ quyết định **Q-04** — Sơ đồ này đã sửa so với bản BA đầu (`nghien-cuu/so-quyet-dinh.md`).

| Quyết định | Lý do |
|---|---|
| `AudioBufferSourceNode` cho clip ngắn, `MediaElementAudioSourceNode` cho bed dài | Bed dài giải nén hết vào RAM sẽ nổ bộ nhớ trên điện thoại (§9.1) |
| 3 GainNode bus theo nhóm Krause | Cho người dùng kéo cả nhóm "âm tự nhiên" thay vì từng lớp; khớp khung khoa học |
| **ConvolverNode (reverb) cho từng không gian** | Thuyết minh chỉ nêu panning. Nhưng cái tạo cảm giác "đi vào không gian" (giả thuyết H2) chủ yếu là **âm phản hồi của không gian**, không phải panning. Ngõ hẻm phố cổ, mặt nước chợ nổi, sân chùa có đặc tính vang hoàn toàn khác nhau. Thêm một node, hiệu quả cảm nhận lớn nhất |
| `StereoPannerNode` thay vì `PannerNode` HRTF | Rẻ CPU. Chỉ nâng lên HRTF nếu đo thấy cần cho H2 |

### 5.2b Vang không gian — hai lỗi tìm được khi làm việc B1.2

Nhánh vang có mã từ lâu nhưng **chưa bao giờ chạy**: cả 4 bản trộn đều để `reverb_ir: null`. Mã không chạy là mã không được kiểm, và ở đây có hai lỗi thật.

#### Lỗi 1 — 100% ướt, không có đường khô

`busTarget = convolver` rồi chỉ convolver nối vào master ⇒ mọi bus đi qua bộ vang, không còn tí âm trực tiếp nào. Bật lên là mất nguồn âm, mà **nhận ra nguồn âm chính là việc người tham gia phải làm** trong thực nghiệm.

Đã sửa thành hai đường song song với **luật đẳng công suất** (`khô² + ướt² = 1`), mặc định `reverbMix = 0,25` — nghiêng hẳn về khô. Cộng thẳng khô 1 + ướt 0,25 sẽ làm bật vang lên là to hẳn, mà độ to đúng là yếu tố gây nhiễu FR-57 phải khử. Luật này nằm ở `audio/gain.js` chứ không nằm trong bộ máy âm thanh, vì hai nơi phải dùng chung — xem lỗi 2.

#### Lỗi 2 — kích thích kết xuất KHÔNG có vang, phòng nghe thì có

`render-graph.js` không hề đụng tới `reverb_ir`. Nếu ai đó khai vang cho một bản trộn, phòng nghe trên web sẽ có vang còn 12 tệp kích thích thì không — **người tham gia nghe một đằng, trang web trình diễn một nẻo**, mà H2 nói về đúng cảm giác không gian đó. Không có phép kiểm nào bắt được, vì mỗi bên tự nó đều đúng.

Đã nối bằng bộ lọc `afir` của ffmpeg, dùng **chung hàm** `reverbMixGains` với phòng nghe. Ba chi tiết:

| Chi tiết | Không có thì sao |
|---|---|
| Phản hồi xung là **nguồn vào cuối cùng** | Chỉ số 0…n−1 đã thuộc về sự kiện; chèn vào giữa là lệch cả đồ thị |
| `gtype=none` tắt tự chỉnh gain của `afir` | Mặc định `peak` cho hệ số khuếch đại phụ thuộc nội dung IR theo cách không lường trước ⇒ hai bản trộn cùng tỉ lệ vang lại khác độ to (FR-57) |
| `apad` đặt **sau** bộ vang | Đuôi vang của sự kiện cuối phải nằm trong khung, không bị cắt cụt |

Đã kiểm bằng ffmpeg thật: kết xuất khô và kết xuất ướt cùng thời lượng nhưng khác nội dung, và **kết xuất hai lần cho đúng cùng một băm SHA-256** — đường vang không phá tính tái lập của FR-52.

#### Một đánh đổi có chủ ý: cả ba điều kiện dùng CHUNG một vang

Kể cả `scrambled`, dù mẫu của nó lấy từ vùng khác. Lý do: dùng vang riêng theo từng mẫu sẽ làm `scrambled` khác `layered` ở **hai** điểm — nội dung lẫn không gian — nên FR-58 hết cô lập được thứ nó định cô lập. Giữ chung một vang là chấp nhận `scrambled` nghe "gắn kết" hơn một chút, tức làm hiệu ứng **khó thấy hơn**, không dễ hơn. Đó là hướng sai an toàn.

#### 🔴 Còn thiếu: chưa có phản hồi xung nào

Cả 4 địa điểm vẫn `reverb_ir: null`. Phản hồi xung **phải đo tại chỗ** bằng quét hình sin (sine sweep) — là việc thực địa, thêm vào luồng A. Dựng vang tổng hợp thì mất đúng cái đang muốn có: đặc tính riêng của ngõ hẻm phố cổ, mặt nước chợ nổi, sân chùa Thiên Mụ.

Và một câu phải quyết trước khi đo: **bản thu thực địa đã mang sẵn âm học của không gian đó**. Chồng thêm vang cùng chỗ là **áp hai lần**. Vang có việc thật khi các lớp đến từ **nguồn khác nhau** — mô hình lai của §5.4 tải nền từ kho mở rồi ghép với dấu ấn âm thanh tự thu, và một vang chung là thứ dán chúng thành một nơi. Nên quy tắc nên là: **áp vang cho lớp tải từ kho, không áp cho lớp tự thu tại chỗ**. Việc này cần `render-graph.js` áp vang theo từng lớp thay vì áp lên bản trộn — chưa làm, và cần quyết định của người phụ trách nghiên cứu trước khi làm.

### 5.3 Bảng công nghệ (đã sửa so với mục 8 thuyết minh)

| Thành phần | Thuyết minh nêu | **Đề xuất chốt** | Lý do sửa |
|---|---|---|---|
| Giao diện | HTML/CSS/JS, có thể React | React + Vite, hoặc JS thuần nếu nhóm mỏng | "Có thể" là chưa quyết; chốt sớm để không phải viết lại |
| Bản đồ | Leaflet **hoặc** Mapbox | **Leaflet + đường viền vector, KHÔNG dùng tile raster** | Đã dựng. Bản đồ âm thanh không cần chi tiết đường phố, nên bỏ tile là hết ba vấn đề cùng lúc: không cần khoá API, không vướng tile usage policy của OSM, và tải tức thì (~72 KB vector thay vì hàng chục ảnh). Đường viền từ Natural Earth (**public domain**) qua `scripts/extract-vietnam-outline.mjs` |
| Dữ liệu bản đồ | JSON tự do | **GeoJSON** (`FeatureCollection` of `Point`) | Chuẩn mở, Leaflet/MapLibre nạp trực tiếp, dùng lại được trong QGIS/công cụ GIS |
| Âm thanh | Web Audio API | Web Audio API + đồ thị ở §5.2 | Giữ, nhưng phải chốt đồ thị chứ không để mở |
| Lưu dữ liệu | JSON tĩnh **hoặc** Firebase/Supabase | **Đọc: JSON/GeoJSON tĩnh. Ghi: Supabase (Postgres)** | Không để mở. Chọn Postgres vì bước phân tích thống kê cần SQL; NoSQL của Firebase làm bước này khổ hơn nhiều |
| Tệp âm | mp3/.ogg | Opus (`.webm`/`.caf`) + fallback AAC/MP3, 2 mức chất lượng | Opus tốt hơn rõ ở bitrate thấp và ghép loop liền mạch. **Phải tự kiểm ma trận hỗ trợ Safari/iOS bằng caniuse trước khi chốt** |
| CDN | Cloud storage / CDN | Cloudflare R2/Pages hoặc CDN có egress rẻ | Netlify/Vercel gói miễn phí có hạn mức băng thông; 50 MB âm thanh/khách sẽ đốt hết rất nhanh (§9.2) |
| Hosting | GitHub Pages / Vercel / Netlify | Giữ nguyên, ưu tiên nơi cùng nhà với CDN | Hợp lý cho quy mô đề tài |

### 5.4 Nguồn vật liệu âm thanh — mô hình lai

Thuyết minh gốc §7 cho phép cả hai đường: *"ghi âm trực tiếp tại địa điểm **hoặc thu thập từ nguồn có giấy phép**"*. Chốt theo **mô hình lai**, chia theo vai Schafer chứ không chia theo sự thuận tiện:

| Vai âm thanh | Nguồn | Lý do |
|---|---|---|
| **keynote** (nền: gió, nước, mưa, ồn giao thông, rì rầm chợ) | **Tải từ kho có giấy phép mở** | Ít mang bản sắc vùng miền, sẵn có nhiều bản dài chất lượng tốt dưới CC0/CC BY. Đây cũng là phần chiếm phần lớn thời lượng nghe |
| **signal** + **soundmark** (tiếng rao, cồng chiêng, chuông chùa, mái chèo chợ nổi) | **Nhóm tự thu** | Đây đúng là phần *làm nên bản sắc nơi chốn*, và cũng là phần kho quốc tế gần như không có bản Việt Nam đáng tin. Đây mới là đóng góp thật của đề tài |

**Vì sao chia như vậy — hai kiểu lỗi bù trừ cho nhau.** Bẫy của điện thoại (AGC dâng nền ồn, khử ồn ăn mất ambience) phá nặng nhất đúng loại **âm nền lặng và dài**. Bẫy của vật liệu tải về (không xác minh được nơi chốn) phá nặng nhất đúng loại **âm mang bản sắc**. Ghép lại: tải nền, tự thu dấu ấn — mỗi đường đi vào chỗ nó mạnh.

**Hệ quả thực tế:** không cần mua máy ghi chuyên dụng ở v1. Dấu ấn âm thanh thường to, gần, ngắn (một tiếng cồng, một tiếng chuông, một câu rao) — điện thoại thu được. Số lượng cũng ít: khoảng 3–6 mẫu/địa điểm, tức 12–24 mẫu cho 4 địa điểm.

#### 5.4.1 Quy tắc bắt buộc khi tải vật liệu

| # | Quy tắc |
|---|---|
| 1 | **Chỉ lấy CC0 hoặc CC BY.** Không lấy **NC** — nó xung đột trực tiếp với giá trị "quảng bá du lịch" nêu ở mục 10 thuyết minh (xem LG-03) |
| 2 | Nguồn ưu tiên: **Freesound** (giấy phép theo từng tệp, phải đọc từng cái), **Xeno-canto** cho biophony. ⚠️ Cần tự đọc điều khoản BBC Sound Effects trước khi dùng — giấy phép của kho này có giới hạn, chưa chắc cho phép đặt trên web công khai |
| 3 | **Tuyệt đối không** lấy từ YouTube hay các trang tổng hợp "tải nhạc miễn phí" không ghi giấy phép theo từng tệp. Không có giấy phép theo tệp = không dùng được, dù nghe hay |
| 4 | Ghi lại cho từng mẫu: URL nguồn, tên người tải lên, mã giấy phép, ngày tải, tên tệp gốc |
| 5 | Ưu tiên bản **dài** (1–5 phút ambience) hơn bản ngắn. Loop 3 giây sẽ nghe ra ngay là lặp, dù chỗ nối liền mạch |

#### 5.4.2 Thông số khi nhóm tự thu

| Thông số | Chốt |
|---|---|
| Định dạng gốc | **WAV không nén**, giữ bản gốc mãi, chỉ nén ở bước xuất bản |
| Tần số / độ sâu | 48 kHz, 24-bit nếu thiết bị cho (32-bit float thì hết nguy cơ vượt ngưỡng) |
| Số kênh khi thu | **Stereo** — từ stereo suy ra mono được, ngược lại thì không. Mono là định dạng *xuất bản* (NFR-03), không phải định dạng *thu* |
| Mức đỉnh | quanh −12…−18 dBFS, không bao giờ chạm 0. **Vượt ngưỡng là lỗi duy nhất không cứu được** |
| Tắt bắt buộc | AGC, khử ồn |
| Bắt buộc có | chắn gió khi thu ngoài trời |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-05** — Cách xác minh AGC/khử ồn đã tắt thật — đo, không đọc thông số máy (`nghien-cuu/so-quyet-dinh.md`).

> 📒 Lý do và bằng chứng: sổ quyết định **Q-06** — Tin tốt từ spike M0 (`nghien-cuu/so-quyet-dinh.md`).

---

## 6. Vai và quyền

| Vai | Quyền |
|---|---|
| Khách (không đăng nhập) | Xem bản đồ, nghe, trộn lớp âm, đọc thẻ văn hóa, chia sẻ liên kết bản trộn, tham gia khảo sát |
| Người đóng góp | Thêm quyền gửi bản ghi + metadata + khai báo giấy phép; xem trạng thái duyệt; yêu cầu rút bản ghi |
| Người biên tập (curator) | Duyệt/từ chối đóng góp, sửa metadata, phân loại, tạo bản trộn, xuất bản |
| Quản trị | Thêm quyền quản lý vai, đóng gói phiên bản dữ liệu, xử lý yêu cầu xóa dữ liệu cá nhân |
| Nhà nghiên cứu (nội bộ) | Bật chế độ thực nghiệm, tải dữ liệu khảo sát đã ẩn danh |

---

## 7. Yêu cầu chức năng (FR)

### M1 — Bản đồ và khám phá

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-01 | Hiện bản đồ Việt Nam với các điểm âm thanh, cụm hóa (cluster) khi thu nhỏ | Mở trang thấy đủ số điểm đã xuất bản; zoom/pan mượt ≥ 30 fps trên điện thoại tầm trung |
| FR-02 | Nhấn một điểm → mở "phòng nghe" của địa điểm | ≤ 3 lần tương tác từ khi vào trang đến khi có tiếng |
| FR-03 | Lọc và tìm theo vùng miền, nhóm Krause, vai Schafer, thời điểm trong ngày, mức độ mai một | Mỗi tiêu chí lọc đúng; kết hợp nhiều tiêu chí đúng; trạng thái lọc nằm trên URL |
| FR-04 | Danh sách địa điểm dạng văn bản, tương đương chức năng với bản đồ | Hoàn thành mọi việc của FR-01/02 mà không cần bản đồ (điều kiện của FR-31) |

### M2 — Phòng nghe và bộ trộn soundscape (trái tim hệ thống)

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-10 | Nạp bản trộn mặc định của địa điểm và phát sau một hành động của người dùng | Không lỗi autoplay trên Chrome/Safari/Firefox; iOS Safari phát được |
| FR-11 | Bật/tắt từng lớp âm | Bật/tắt có fade ≥ 20 ms, **không nghe tiếng "cụp"** |
| FR-12 | Thanh trượt âm lượng từng lớp | Kéo trượt không có tiếng rè bậc thang (zipper noise); dùng `setTargetAtTime`, không gán `.value` trực tiếp |
| FR-13 | Thanh trượt âm lượng theo nhóm Krause (3 bus) | Kéo 1 thanh ảnh hưởng đúng mọi lớp trong nhóm |
| FR-14 | Lớp keynote phát loop **liền mạch, không có khe hở** | Nghe liên tục 5 phút không phát hiện điểm nối; kiểm bằng cách xem dạng sóng tại điểm loop |
| FR-15 | Lớp signal phát lặp lại không đều theo xác suất cấu hình được | Nghe 3 phút không thấy quy luật máy móc; cùng seed → cùng chuỗi thời điểm |
| FR-16 | Lớp soundmark phát one-shot khi người dùng bấm | Có nhãn rõ đây là dấu ấn âm thanh của nơi chốn |
| FR-17 | Cân bằng độ to giữa các lớp và giữa các địa điểm | Chuyển giữa 2 địa điểm ở cùng vị trí thanh trượt, độ to cảm nhận không lệch quá 3 LU |
| FR-18 | Reverb theo đặc tính không gian của địa điểm | Mỗi địa điểm có cấu hình vang riêng, bật/tắt được để so sánh |
| FR-19 | Panning trái/phải theo cấu hình lớp | Nghe được định hướng bằng tai nghe |
| FR-20 | Lưu và chia sẻ bản trộn qua URL | Mở URL trên máy khác cho ra bản trộn giống hệt |
| FR-21 | Hiện tiến trình tải và cho nghe ngay khi lớp đầu tiên sẵn sàng | Có tiếng đầu tiên ≤ 5 s trên mạng 4G mô phỏng, không chờ tải hết |
| FR-22 | Hiển thị dạng sóng hoặc phổ tần của lớp đang phát | Hình vẽ khớp âm đang nghe; tắt được để tiết kiệm pin |

### M3 — Thư viện, metadata, thẻ văn hóa

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-25 | Trang chi tiết mẫu âm: nghe, metadata đầy đủ, giấy phép, người ghi công | 100% trường bắt buộc ở §8.2 hiển thị hoặc ghi rõ "không có" |
| FR-26 | Thẻ thông tin văn hóa: âm này là gì, ý nghĩa, đang mai một ra sao | Mỗi mẫu âm có ≥ 1 đoạn giải thích; mức độ mai một dùng từ vựng có kiểm soát, không phải văn tự do |
| FR-27 | Xuất trích dẫn học thuật cho mẫu âm và cho bộ dữ liệu | Xuất được BibTeX; có mã băm SHA-256 của tệp |
| FR-28 | Tải mẫu âm gốc (nếu giấy phép cho phép) | Mẫu không cho tải thì ẩn nút và nêu lý do |

### M4 — Đóng góp cộng đồng

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-30 | Biểu mẫu gửi bản ghi: tệp, vị trí, thời điểm, thiết bị, bối cảnh, giấy phép, cam kết quyền | Thiếu trường bắt buộc thì không gửi được, báo lỗi rõ bằng tiếng Việt |
| FR-31 | Kiểm tra tệp phía server: kiểu thật (magic bytes, không tin đuôi tệp), dung lượng, thời lượng | Tệp không phải âm thanh bị chặn; giới hạn dung lượng có hiệu lực |
| FR-32 | Mã hóa lại (re-encode) phía server và **xóa sạch metadata gốc** | Tệp xuất bản không còn GPS/EXIF/tên thiết bị của người gửi |
| FR-33 | Hàng chờ kiểm duyệt: chỉ nội dung đã duyệt mới lên bản đồ | Không có đường nào đưa tệp chưa duyệt ra công khai |
| FR-34 | Người đóng góp yêu cầu rút bản ghi | Rút trong ≤ 7 ngày, có ghi vết |

### M5 — Quản trị và xuất bản

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-40 | Quy trình: nhận → gắn metadata → phân loại → duyệt → xuất bản | Mỗi mẫu âm luôn có đúng một trạng thái; có lịch sử thay đổi |
| FR-41 | Đóng băng phiên bản bộ dữ liệu (`dataset v1.0`) | Xuất được gói kèm bảng kê mã băm; kết quả thực nghiệm gắn với đúng một phiên bản |
| FR-42 | Nhật ký xử lý âm cho từng mẫu (lọc nhiễu, cắt, chuẩn hóa) | Đọc được đã làm gì với bản gốc — điều kiện để nghiên cứu tái lập được |

### M6 — Chế độ thực nghiệm (xem §10, **hạng mục dễ bị bỏ sót nhất**)

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-50 | Chế độ thực nghiệm riêng biệt, tách khỏi chế độ khám phá tự do | Người tham gia không thấy đáp án, không xem trước được vùng miền |
| FR-51 | Phân điều kiện (âm đơn lẻ / soundscape phân lớp) và **đảo thứ tự cân bằng** | Kiểm được log: thứ tự trình bày phân bố đều giữa người tham gia |
| FR-52 | Kích thích thực nghiệm là **tệp âm đã kết xuất sẵn, bit-identical** cho mọi người | Băm SHA-256 của kích thích giống nhau ở mọi phiên |
| FR-53 | Ghi câu trả lời + mốc thời gian + thiết bị + có dùng tai nghe hay không | Xuất CSV/SQL đủ để chạy kiểm định ở §10.2 |
| FR-54 | Chặn nghe lại/quay lại câu trước | Không có cách nào sửa câu đã trả lời |
| FR-55 | Bộ câu hỏi cảm nhận theo thang đo đã được kiểm định (§10.3) | Dùng đúng bộ thuộc tính, không tự phát minh thang đo |

### M7 — Tiếp cận cho người khiếm thị (thuyết minh đã hứa ⇒ thành yêu cầu bắt buộc)

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-60 | Toàn bộ chức năng dùng được bằng bàn phím | Đi hết luồng nghe + trộn + chia sẻ chỉ bằng Tab/Enter/mũi tên |
| FR-61 | Thanh trượt có `role="slider"` và `aria-valuetext` đọc ra giá trị có nghĩa | NVDA/VoiceOver đọc "Tiếng rao — 40 phần trăm", không đọc "40" trơ |
| FR-62 | Chế độ hạ âm nền (ducking) khi trình đọc màn hình đang nói | Bật chế độ này thì nghe rõ giọng trình đọc |
| FR-63 | Văn bản mô tả từng âm (thay cho việc phải nhìn nhãn) | Mỗi lớp âm có mô tả ngắn đọc được |
| FR-64 | Tôn trọng `prefers-reduced-motion` | Bật thiết lập này thì bản đồ không tự động bay/zoom |
| FR-65 | Kiểm thử thật với trình đọc màn hình và ≥ 1 người khiếm thị | Có biên bản kiểm thử; nếu không làm được thì **phải bỏ tuyên bố này khỏi mục 10 thuyết minh** |

### M8 — Dùng ngoại tuyến (cho lớp học không wifi) · nền cho lựa chọn app sau này

| Mã | Yêu cầu | Tiêu chí nghiệm thu |
|---|---|---|
| FR-70 | PWA + Service Worker: tải sẵn gói một địa điểm để nghe offline | Tắt mạng vẫn nghe và trộn được địa điểm đã tải |
| FR-71 | Manifest + icon để **cài được lên màn hình chính** | Cài từ Chrome Android và Safari iOS, mở ra không thấy thanh địa chỉ |

> FR-70/71 là **con đường tới "app điện thoại"** với chi phí gần bằng không, thay cho việc viết native. Ưu tiên thấp trong v1 (làm sau khi thực nghiệm đã chạy), nhưng cũng là lý do kiến trúc phải giữ bộ máy âm thanh tách rời từ đầu.

---

## 8. Mô hình dữ liệu

### 8.1 Thực thể

```
Location (địa điểm)
  1─n SoundClip (mẫu âm)
  1─n SoundscapeRecipe (bản trộn)
SoundscapeRecipe 1─n Layer ──► tham chiếu 1 SoundClip
Contribution (đóng góp) ──► sau khi duyệt trở thành SoundClip
SurveySession 1─n SurveyResponse
Contributor, License
```

### 8.2 `SoundClip` — trường metadata

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `id`, `title_vi`, `title_en` | ✔ | |
| `location_id`, `lat`, `lon` | ✔ | Toạ độ có thể làm nhoè nếu là chỗ ở riêng của người dân |
| `recorded_at` | ✔ | ISO 8601 **có múi giờ** |
| `time_of_day`, `season` | ✔ | Chợ 5 giờ sáng khác chợ 3 giờ chiều — đây là chiều dữ liệu thuyết minh còn thiếu |
| `krause_class` | ✔ | `geophony` \| `biophony` \| `anthrophony` |
| `schafer_role` | ✔ | `keynote` \| `signal` \| `soundmark` |
| `device`, `mic_pattern`, `sample_rate`, `bit_depth`, `channels`, `duration_s` | ✔ | Nguồn gốc kỹ thuật |
| `loudness_lufs`, `true_peak_dbtp` | ✔ | Đo theo EBU R128; **thiếu trường này thì FR-17 không làm được** |
| `license`, `rights_holder`, `contributor`, `consent_status` | ✔ | §11 |
| `contains_identifiable_voice`, `cultural_expression`, `community_credit` | ✔ khi có | LG-01, LG-02 |
| `sensitive_categories[]` | ✔ khi mẫu chạm dữ liệu nhạy cảm | `ethnic_origin` (điểm a) \| `religious_belief` (điểm b) \| `biometric` (điểm đ) — **Nghị định 356/2025/NĐ-CP Điều 4 khoản 1**. Máy tự bắt mâu thuẫn: có giọng người mà không khai `biometric`, hoặc khai `biometric` mà bảo không có giọng người |
| `sensitive_notice_given` | ✔ khi `sensitive_categories` không rỗng | Đã nói rõ với người ký rằng dữ liệu là **nhạy cảm** — NĐ 356 Điều 6 khoản 4 |
| `recording_notice_given` | ✔ khi nhạy cảm **và** `provenance = field_recording` | Đã báo cho người có mặt biết đang bị ghi âm — Luật Điều 32 khoản 2. **Nghĩa vụ riêng**, không suy ra được từ `consent_status`: nó tồn tại kể cả khi Điều 32 cho phép ghi mà không cần đồng thuận |
| `provenance` | ✔ | `field_recording` \| `licensed_archive` — mô hình lai ở §5.4 bắt buộc phân biệt được hai loại |
| `location_verified` | ✔ | `true` chỉ khi nhóm tự thu tại chỗ. Mẫu tải về mặc định `false`: một tệp gắn nhãn "chợ Việt Nam" trên kho quốc tế có thể được thu ở nơi khác, hoặc dựng trong studio — **không xác minh được** |
| `source_url`, `source_uploader`, `downloaded_at` | ✔ khi `provenance = licensed_archive` | Truy vết giấy phép (§5.4.1 quy tắc 4) |
| `sha256` | ✔ | Toàn vẹn + trích dẫn |
| `editing_log[]` | ✔ | Đã lọc nhiễu / cắt / chuẩn hóa những gì |
| `endangerment_level` | ✔ | Từ vựng có kiểm soát, không phải văn tự do. Phải có mức **`lost`** cho âm đã không còn tồn tại — ví dụ tiếng tàu điện Hà Nội (xem `VAT-LIEU-4-DIA-DIEM.md` §4). Lớp `lost` hiển thị như lớp đã tắt vĩnh viễn, và là minh chứng mạnh nhất cho luận điểm trung tâm của đề tài |
| `cultural_note_vi/en`, `tags[]` | | Nội dung thẻ văn hóa |
| `loop_start`, `loop_end` | | Cho lớp keynote (FR-14) |

### 8.3 `SoundscapeRecipe` — bản trộn là **dữ liệu**, không phải trạng thái UI

```json
{
  "id": "hanoi-oldquarter-morning",
  "location_id": "hanoi-oldquarter",
  "title_vi": "Phố cổ Hà Nội — sáng sớm",
  "time_of_day": "early_morning",
  "seed": 20260805,
  "reverb_ir": "ir/narrow-alley.webm",
  "master_gain_db": -3,
  "layers": [
    { "clip_id": "hn-traffic-bed",  "role": "keynote",   "gain_db": -18, "pan": 0.0,  "loop": true },
    { "clip_id": "hn-street-cry",   "role": "signal",    "gain_db": -9,  "pan": -0.4,
      "trigger": { "mode": "poisson", "mean_interval_s": 24, "jitter_s": 8 } },
    { "clip_id": "hn-tram-bell",    "role": "soundmark", "gain_db": -6,  "pan": 0.3, "one_shot": true }
  ]
}
```

Lợi ích: bản trộn chia sẻ được qua URL (FR-20), lưu vết được cho nghiên cứu, kết xuất offline được thành tệp âm cố định (FR-52), và người biên tập tạo bản trộn mới **không cần lập trình viên**.

### 8.4 Tầng bản đồ — GeoJSON

```json
{ "type": "FeatureCollection", "features": [
  { "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [105.8524, 21.0339] },
    "properties": { "location_id": "hanoi-oldquarter", "name_vi": "Phố cổ Hà Nội",
                    "region": "bac-bo", "clip_count": 9, "recipe_default": "hanoi-oldquarter-morning" } }
]}
```

---

## 9. Yêu cầu phi chức năng (NFR)

### 9.1 Bộ nhớ và CPU — ràng buộc cứng, quyết định kiến trúc

Một tệp stereo 5 phút, 44.1 kHz, giải nén thành `AudioBuffer` float32 chiếm:

```
300 s × 44 100 × 2 kênh × 4 byte ≈ 105 MB RAM
```

Sáu lớp như vậy là ~600 MB — điện thoại tầm trung sẽ bị hệ điều hành giết tab. **Đây là rủi ro kỹ thuật số một của đề tài.**

| Mã | Yêu cầu |
|---|---|
| NFR-01 | Bed dài dùng `MediaElementAudioSourceNode` (phát theo dòng), **không** giải nén hết vào RAM |
| NFR-02 | Clip loop giữ ngắn (30–60 s) rồi lặp + ngẫu nhiên hoá, thay vì một tệp dài |
| NFR-03 | Phần lớn lớp âm dùng **mono** (giảm nửa bộ nhớ), chỉ bed và soundmark cần stereo |
| NFR-04 | Giải phóng buffer khi rời địa điểm; tổng RAM âm thanh ≤ 150 MB |
| NFR-05 | Trộn 5 lớp đồng thời trên điện thoại tầm trung: không rớt tiếng, không giật hình |

### 9.2 Mạng và tải trang

| Mã | Yêu cầu |
|---|---|
| NFR-10 | Có tiếng đầu tiên ≤ 5 s trên 4G mô phỏng; tải lười theo lớp, ưu tiên bed trước |
| NFR-11 | Ngân sách tải một địa điểm ≤ 8 MB ở mức chất lượng thường |
| NFR-12 | Tên tệp có băm nội dung + `Cache-Control: immutable`; **phải ước lượng băng thông trước** — 50 mẫu × 1 MB × vài nghìn khách sẽ vượt hạn mức miễn phí |
| NFR-13 | Hai mức chất lượng (thường/cao) cho người nghe bằng tai nghe tốt |

### 9.3 Tương thích

| Mã | Yêu cầu |
|---|---|
| NFR-20 | Chrome, Firefox, Safari (kể cả **iOS Safari**), Edge — 2 phiên bản gần nhất |
| NFR-21 | Xử lý đúng chính sách autoplay: `AudioContext` khởi tạo trong sự kiện người dùng; xử lý trạng thái `suspended` → `resume()` |
| NFR-22 | Chốt định dạng âm dựa trên ma trận hỗ trợ **tự kiểm**, luôn có phương án dự phòng |
| NFR-23 | Responsive 320 → 1920 px, không tràn ngang |

### 9.4 Chất lượng âm — chuẩn hoá, không làm bằng cảm tính

| Mã | Yêu cầu |
|---|---|
| NFR-30 | Chuẩn hoá theo **LUFS (EBU R128 / ITU-R BS.1770)**, không dùng chuẩn hoá đỉnh (peak). Đo bằng `ffmpeg -af loudnorm`; lưu kết quả vào metadata |
| NFR-31 | Thanh trượt ánh xạ **theo cảm nhận** (thang dB, ví dụ −60…0 dB), không ánh xạ tuyến tính sang gain |
| NFR-32 | Mọi thay đổi gain đi qua `setTargetAtTime`/`linearRampToValueAtTime` — chống tiếng "cụp" và tiếng rè bậc thang |
| NFR-33 | Loop liền mạch: dùng `loopStart`/`loopEnd`, cắt đúng điểm cắt không, hoặc crossfade 2 nguồn lệch pha. **MP3 có khoảng đệm của bộ mã hoá ở đầu/cuối ⇒ luôn có khe hở nếu không xử lý** |
| NFR-34 | Chống vượt ngưỡng (clipping) khi bật nhiều lớp: giới hạn tổng ở master |

### 9.5 Bảo mật, quyền riêng tư, vận hành

| Mã | Yêu cầu |
|---|---|
| NFR-40 | Không tin dữ liệu tải lên: kiểm kiểu thật, giới hạn dung lượng/thời lượng, mã hoá lại phía server, xoá metadata gốc |
| NFR-41 | Bật RLS trên Supabase; khoá ẩn danh chỉ được ghi vào bảng đóng góp/khảo sát, không đọc được dữ liệu người khác |
| NFR-42 | Chặn tần suất (rate limit) trên biểu mẫu gửi và khảo sát; có bẫy chống bot nhẹ, không dùng CAPTCHA nặng |
| NFR-43 | CSP có nonce; HSTS; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin` |
| NFR-44 | Không có bí mật (khoá API, token) trong mã nguồn; toàn bộ qua biến môi trường |
| NFR-45 | Dữ liệu khảo sát tách rời khỏi danh tính; ID người tham gia là ngẫu nhiên, không thu email nếu không thật cần |
| NFR-46 | Sao lưu bộ dữ liệu ở ≥ 2 nơi; cân nhắc nộp Zenodo để có DOI (nâng giá trị mục "sản phẩm dự kiến") |

### 9.6 Bảo trì

| Mã | Yêu cầu |
|---|---|
| NFR-50 | Tệp ≤ 400 dòng, hàm ≤ 50 dòng; tách bộ máy âm thanh thành module độc lập, không lẫn vào React |
| NFR-51 | Bộ máy âm thanh có kiểm thử đơn vị (mock `AudioContext`); ánh xạ gain, lịch trigger, tính seed phải test được |
| NFR-52 | Bao phủ kiểm thử ≥ 80% cho tầng logic (bộ trộn, ánh xạ dữ liệu, thống kê) |
| NFR-53 | Kiểm thử hồi quy hình ảnh ở 320/768/1024/1440; kiểm tự động về tiếp cận |

---

## 10. Yêu cầu cho phần nghiên cứu (H1/H2) — **phần yếu nhất của thuyết minh gốc**

### 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả

H1 nói soundscape phân lớp giúp nhận diện vùng miền "cao hơn **có ý nghĩa**". Nhưng mục 7 thuyết minh chỉ nêu "thống kê mô tả, so sánh tỉ lệ/điểm trung bình" — **thống kê mô tả không chứng minh được ý nghĩa thống kê**. Cần nêu rõ kiểm định:

| Giả thuyết | Loại dữ liệu | Kiểm định phù hợp |
|---|---|---|
| H1 (tỉ lệ nhận diện đúng) | Nhị phân, cùng người nghe cả 2 điều kiện | **McNemar** (thiết kế trong-người) hoặc chi-square/Fisher (giữa-người) |
| H2 (điểm cảm nhận Likert) | Thứ bậc | **Wilcoxon signed-rank** (trong-người) hoặc Mann–Whitney U. **Không dùng t-test** cho Likert đơn mục |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-07 → Q-12** — Đã dựng: `src/research/statistics.js` (`nghien-cuu/so-quyet-dinh.md`).

### 10.2 Cỡ mẫu — phải tính trước, không thu bừa

Với thiết kế giữa-người, phát hiện mức chênh 50% → 75%, α = 0,05 hai phía, công suất 0,80:

```
n = (1,96 + 0,84)² × [0,25 + 0,1875] / 0,25²  ≈  55 người mỗi nhóm  (≈ 110 tổng)
```

**Khuyến nghị: dùng thiết kế trong-người** (mỗi người nghe cả hai điều kiện, đảo thứ tự cân bằng) — kiểm soát được khác biệt cá nhân và giảm cỡ mẫu xuống khoảng **40–60 người tổng**. Đây là thay đổi lớn về công sức thu thập.

> 📒 Lý do và bằng chứng: sổ quyết định **Q-13** — Đã dựng: `src/research/assignment.js` (`nghien-cuu/so-quyet-dinh.md`).

> 📒 Lý do và bằng chứng: sổ quyết định **Q-14 → Q-16** — 🔴 Đã tính thật, và con số 40–60 ở trên là KHÔNG ĐỦ (`nghien-cuu/so-quyet-dinh.md`).

### 10.3 Thang đo cho H2 — đừng tự phát minh

Thuyết minh nói "khảo sát bằng thang Likert 5 mức" tự soạn. Có sẵn **bộ tiêu chuẩn quốc tế**: **ISO 12913** về soundscape — phần 1 (khung khái niệm), phần 2 (yêu cầu thu thập dữ liệu, kèm bộ câu hỏi với 8 thuộc tính cảm nhận: *dễ chịu, hỗn loạn, sống động, tĩnh lặng, yên bình, gây khó chịu, nhiều sự kiện, đơn điệu*), phần 3 (phương pháp phân tích).

Dùng ISO 12913-2 thay cho thang tự soạn mang lại: thang đã được kiểm định, kết quả **so sánh được với nghiên cứu quốc tế**, và một mục "cơ sở khoa học" mạnh hơn hẳn khi bảo vệ. Đây là khuyến nghị có giá trị cao nhất trong toàn bộ tài liệu này.

> 📒 Lý do và bằng chứng: sổ quyết định **Q-17** — Đã dựng — câu Q3 / việc C0.2 chốt theo hướng ISO (`nghien-cuu/so-quyet-dinh.md`).

### 10.4 Yếu tố gây nhiễu phải khử — nếu không H1 vô nghĩa

Bản soundscape phân lớp thì **dài hơn, to hơn, nhiều thông tin hơn** bản âm đơn lẻ. Nếu người nghe nhận diện đúng hơn, có thể chỉ vì *nhiều thông tin hơn*, chứ không phải vì *"phân lớp có chủ đích"* như H1 phát biểu.

> 📒 Lý do và bằng chứng: sổ quyết định **Q-18** — Ba điều kiện, định nghĩa thao tác được (`nghien-cuu/so-quyet-dinh.md`).

| Mã | Yêu cầu |
|---|---|
| FR-56 | Cân bằng tổng thời lượng và tổng số sự kiện âm riêng biệt giữa hai điều kiện |
| FR-57 | Chuẩn hoá cùng mức LUFS cho mọi kích thích |
| FR-58 | **Thêm điều kiện đối chứng thứ ba: phân lớp *sai vùng miền* (trộn ngẫu nhiên).** Đây mới là phép thử đúng cho chữ "có chủ đích" trong H1 |
| FR-59 | ≥ 3 bản trộn khác nhau cho mỗi vùng miền (chống hiệu ứng do một mẫu cụ thể) ⇒ **12–15 bản trộn**, không phải 4–5. Ràng buộc này làm tăng khối lượng thu âm — phải tính vào kế hoạch |
| FR-60 | **Danh sách trả lời phải dài hơn số lượt nghe**: 4 vùng thật + ≥ 4 phương án nhiễu là địa danh thật, quen, không có trong bộ kích thích, mỗi vùng một nơi cùng vùng. Thứ tự xáo theo (người, lượt) có seed; ô thật và ô nhiễu dựng giống hệt trong DOM; người tham gia được báo trước rằng danh sách dài hơn số đoạn |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-19** — 🔴 Lỗi thiết kế tìm được khi đánh giá lại (spec S1.1) — đã sửa, ra FR-60 (`nghien-cuu/so-quyet-dinh.md`).

> 📒 Lý do và bằng chứng: sổ quyết định **Q-20** — Đã dựng: `src/research/stimulus.js` (`nghien-cuu/so-quyet-dinh.md`).

### 10.5 Tái lập được — lý do bản trộn phải kết xuất sẵn

Lớp signal phát ngẫu nhiên (FR-15) nghĩa là **mỗi người tham gia nghe một thứ khác nhau** → không phải thực nghiệm có kiểm soát. Bắt buộc:

| Mã | Yêu cầu |
|---|---|
| FR-52 | Kích thích thực nghiệm được **kết xuất sẵn** thành tệp cố định; mọi người tham gia nghe tệp giống hệt nhau (đối chiếu bằng SHA-256) |
| FR-15b | Bộ sinh số ngẫu nhiên phải có seed; `recipe + seed → chuỗi trigger xác định` |

> 📒 Lý do và bằng chứng: sổ quyết định **Q-21** — FR-52 đã dựng và đã chứng minh (`nghien-cuu/so-quyet-dinh.md`).

Bộ trộn thời gian thực chỉ dùng cho **chế độ khám phá tự do**, không dùng làm kích thích thực nghiệm.

---

## 11. Pháp lý, đạo đức, quyền riêng tư

> 📒 Lý do và bằng chứng: sổ quyết định **Q-22 → Q-23** — Bộ hồ sơ đã soạn xong ở `phap-ly/` (`nghien-cuu/so-quyet-dinh.md`).


| Mã | Yêu cầu | Ghi chú |
|---|---|---|
| LG-01 | Có quy trình đồng thuận khi ghi âm nơi công cộng có **giọng người nhận dạng được** (tiếng rao là giọng của một người cụ thể) | ✅ **A0.3 xong, đã đọc toàn văn.** Căn cứ: **Luật 91/2025/QH15** + **Nghị định 356/2025/NĐ-CP** (thay Nghị định 13/2023, hết hiệu lực 01/01/2026). Đồng thuận phải hỏi **riêng từng mục đích** (Luật Điều 9 khoản 4). **Không có ngoại lệ cho nghiên cứu khoa học** (Điều 19). Chi tiết `phap-ly/08` |
| **LG-01b** | **Thông báo cho người có mặt biết đang bị ghi âm** — nghĩa vụ riêng, tồn tại **kể cả khi không cần xin đồng thuận** | 🆕 Phát hiện khi đọc toàn văn: **Luật Điều 32 khoản 2**. Cách làm cụ thể (nói to và ghi âm luôn câu nói / biển A5 / báo ban quản lý) ở `phap-ly/05` |
| **LG-01c** | Xử lý **dữ liệu cá nhân nhạy cảm**: nói rõ với người ký rằng dữ liệu là nhạy cảm; phân quyền giới hạn truy cập; bảo mật thiết bị lưu và truyền | 🆕 **NĐ 356 Điều 6 khoản 4, Điều 4 khoản 2; Luật Điều 31 khoản 4.** Áp cho 6 mẫu HN-04, CR-05, HU-05, HU-06, TN-05, TN-06 — nhạy cảm vì **nguồn gốc dân tộc** (NĐ 356 Điều 4.1.a) và **tôn giáo** (điểm b), không phải vì tranh cãi giọng nói = sinh trắc học |
| LG-02 | Ghi công **cộng đồng chủ thể** với các biểu đạt văn hoá truyền thống (cồng chiêng, hát ru, làn điệu), không chỉ đồng thuận cá nhân | ✅ Có căn cứ luật: **Luật Di sản văn hoá 45/2024 Điều 5 khoản 1** đặt **cộng đồng** ngang hàng pháp nhân về quyền với di sản; **khoản 3 điểm b** cho quyền *"được giữ bí mật thông tin, nếu có yêu cầu"*; **Điều 9** cấm phổ biến sai lệch và cấm xâm phạm lợi ích cộng đồng. Trước đây chỉ là chuẩn mực đạo đức |
| LG-03 | Chốt giấy phép cho từng mẫu. ✅ **Đã quyết (A0.4): CC BY 4.0** cho mẫu tự thu, CC0 cho metadata, MIT cho mã nguồn. **Không NC, tránh SA.** Chi tiết: `phap-ly/09` | ⚠️ Cân nhắc: **NC (phi thương mại) sẽ chặn luôn việc quảng bá du lịch có tính thương mại** — mà đó lại là giá trị thực tiễn nêu ở mục 10 thuyết minh. Phải chọn có ý thức, đừng chọn theo phản xạ |
| LG-04 | Cơ chế yêu cầu xoá/rút bản ghi cho người xuất hiện trong bản ghi | Đầu mối liên hệ công khai, cam kết ≤ 7 ngày. **Luật cho phép chậm nhất: rút đồng thuận 15 ngày, xoá 20 ngày, phản hồi 2 ngày làm việc** — NĐ 356 Điều 5. Quy trình phải **đăng công khai** (NĐ 356 Điều 5 khoản 1). `phap-ly/04`. **Nguyên tắc: ẩn trước, xác minh sau** |
| **LG-08** | Xoá phải **xoá thật**: CDN, bản sao lưu, kho Git, không để khôi phục trái phép được. Không xoá được thì **phải thông báo lý do** | 🆕 **Luật Điều 14 khoản 3, 4, 5.** Hệ quả thứ tự công việc: **nộp Zenodo là bước cuối** — Zenodo giữ vĩnh viễn, nộp sớm là tự khoá tay mình |
| LG-05 | Người đóng góp cam kết có quyền với tệp gửi lên | Ô đánh dấu bắt buộc + lưu vết |
| LG-06 | Làm nhoè toạ độ khi điểm ghi trùng chỗ ở riêng của người dân | Tránh vô tình lộ nơi ở |
| LG-07 | Thông báo và đồng thuận tham gia nghiên cứu trước khảo sát; nêu rõ dữ liệu dùng làm gì | Tiêu chuẩn đạo đức nghiên cứu |
| LG-08 | Ghi rõ giấy phép của tile bản đồ và ghi công theo yêu cầu nhà cung cấp | Xem NFR ở §5.3 |

---

## 12. Rủi ro

| Mã | Rủi ro | Mức | Giảm thiểu |
|---|---|---|---|
| R-01 | Loop nghe rõ khe hở/tiếng cụp → sản phẩm nghe "nghiệp dư", đổ luôn H2 | **Cao** | NFR-33, dựng nguyên mẫu loop **ngay tuần đầu** trước khi làm bất cứ thứ gì khác |
| R-02 | Sập/rớt tiếng trên điện thoại do hết bộ nhớ | **Cao** | NFR-01…04; đo trên máy thật, không chỉ trên máy tính |
| R-03 | Thực nghiệm không kiểm được H1 vì thiếu chế độ thực nghiệm và kích thích cố định | **Cao** | M6 phải nằm trong phạm vi v1, không để "làm sau" |
| R-04 | Thu âm không đạt do thời tiết, ồn nền, không xin được phép | Trung bình | Đi thu nhiều lần, có địa điểm dự phòng gần nơi nghiên cứu |
| **R-10** | **Vật liệu tải về không xác minh được nơi chốn** — tệp gắn nhãn "chợ nổi Việt Nam" có thể thu ở nước khác. Nếu kích thích thực nghiệm không thật sự đến từ vùng miền đó thì **H1 không kiểm được điều gì cả** | **Cao** | Trường `location_verified` (§8.2). **Kích thích cho H1 phải chứa ít nhất một soundmark do nhóm tự thu và đã xác minh** — nền tải về chỉ làm lớp lót. Xem §16.6 |
| **R-11** | Giấy phép sai hoặc thiếu ở mẫu tải về → phải rút bản ghi sau khi đã công bố | Trung bình | Quy tắc §5.4.1: chỉ CC0/CC BY, ghi URL + mã giấy phép + ngày tải cho từng mẫu, kiểm lại toàn bộ trước mốc M7 |
| R-05 | Vấn đề bản quyền/đồng thuận phát sinh sau khi đã xuất bản | Trung bình | LG-01…06 làm trước khi thu, không làm sau |
| R-06 | Vượt hạn mức băng thông/hạn mức bản đồ của gói miễn phí | Trung bình | NFR-12; ước lượng trước khi công bố rộng |
| R-07 | Cỡ mẫu không đủ công suất → kết quả "không có ý nghĩa" dù giả thuyết đúng | Trung bình | §10.2, chốt thiết kế trong-người |
| R-08 | Tuyên bố hỗ trợ người khiếm thị không được kiểm chứng | Trung bình | FR-60…65, hoặc bỏ tuyên bố |
| R-09 | Tên "VietSoundscape" trùng dự án khác | Thấp | Tra cứu trước khi in tài liệu |

---

## 13. Nghiệm thu tổng thể (Definition of Done)

- [ ] Web công khai chạy được, có liên kết truy cập
- [ ] ≥ 3 địa điểm, ≥ 30 mẫu âm, **100% đủ trường metadata bắt buộc** (§8.2)
- [ ] Trộn 5 lớp đồng thời mượt trên điện thoại tầm trung; RAM âm thanh ≤ 150 MB
- [ ] Loop keynote nghe 5 phút không phát hiện điểm nối
- [ ] Chênh độ to giữa các địa điểm ≤ 3 LU ở cùng vị trí thanh trượt
- [ ] Chế độ thực nghiệm chạy được, kích thích bit-identical, xuất được dữ liệu cho kiểm định
- [ ] Có kết quả kiểm định McNemar/Wilcoxon cho H1/H2, cỡ mẫu đạt công suất đã tính
- [ ] Đi hết luồng chính bằng bàn phím + trình đọc màn hình
- [ ] Không có bí mật trong mã nguồn; RLS bật; kiểm tệp tải lên hoạt động
- [ ] Bộ dữ liệu đóng băng `v1.0` + bảng kê SHA-256; kết quả nghiên cứu gắn với phiên bản này

---

## 14. Câu hỏi mở — cần bạn chốt

| # | Câu hỏi | Vì sao cần chốt sớm |
|---|---|---|
| Q1 | Thiết bị tự thu cho lớp signal/soundmark (§5.4.2) — điện thoại có tắt được AGC/khử ồn và ghi ra WAV không? | Chặn chuyến thu đầu. Đã hạ nhẹ nhờ mô hình lai: chỉ cần thu 12–24 mẫu ngắn và to, không cần thu ambience lặng |
| Q2 | Thiết kế thực nghiệm trong-người hay giữa-người? | Chênh nhau ~50 người tham gia |
| Q3 | Dùng bộ câu hỏi ISO 12913-2 hay thang tự soạn? | Quyết định độ chắc của H2 khi bảo vệ |
| Q4 | Giấy phép mặc định — có chấp nhận NC chặn dùng thương mại? | Xung đột với giá trị "quảng bá du lịch" (LG-03). **Giờ càng gấp**: quy tắc §5.4.1 loại bỏ nguồn NC ngay từ bước tải |
| Q5 | Có cam kết làm phần tiếp cận cho người khiếm thị đến mức kiểm thử thật? | Nếu không thì phải bỏ tuyên bố ở mục 10 thuyết minh |
| Q6 | React hay JS thuần? | Ảnh hưởng cấu trúc mã ngay từ đầu |

**Đã chốt:**

| Câu | Quyết định |
|---|---|
| Giữ hay bỏ H3 (AI) | **Bỏ hẳn** (§2) |
| Số địa điểm | **4 địa điểm** ⇒ 12 bản trộn, ~32 mẫu âm (§10.4) |
| Nguồn vật liệu âm thanh | **Mô hình lai** — tải nền, tự thu dấu ấn (§5.4) |

---

## 15. Truy vết yêu cầu ⇄ thuyết minh gốc

| Mục thuyết minh | FR/NFR tương ứng | Nhận xét |
|---|---|---|
| §5 Mục tiêu — thư viện phân loại | FR-25…28, §8.2 | Thuyết minh chưa nêu lược đồ metadata — đã bổ sung |
| §5 Mục tiêu — bản đồ tương tác | FR-01…04 | Bổ sung FR-04 (đường không dùng bản đồ) |
| §5 Mục tiêu — công cụ mô phỏng | FR-10…22 | Bổ sung reverb, loop liền mạch, cân bằng LUFS |
| §5 Mục tiêu — đánh giá qua khảo sát | M6, §10 | **Thuyết minh thiếu hoàn toàn yêu cầu cho chế độ thực nghiệm** |
| §7 Phương pháp — xử lý & chuẩn hoá | NFR-30…34, FR-42 | Thuyết minh nói "chuẩn hoá âm lượng" mà không nêu chuẩn nào |
| §7 Phương pháp — phân tích dữ liệu | §10.1, §10.2 | Thống kê mô tả không đủ cho chữ "có ý nghĩa" |
| §8 Kiến trúc | §5.3 | Đã chốt các chỗ thuyết minh còn để "hoặc" |
| §8 Tính năng — trang đóng góp | FR-30…34 | Thuyết minh xếp "mở rộng về sau"; nhưng yêu cầu an toàn tệp phải thiết kế từ đầu |
| §10 Tính mới — hỗ trợ người khiếm thị | FR-60…65 | Từ "giá trị" thành **yêu cầu bắt buộc** |
| §11 Sản phẩm dự kiến | §13 | Bổ sung mã băm, đóng băng phiên bản, DOI |
| §4 H3 (AI) — "xem Mục 9" | — (đã bỏ khỏi phạm vi, §2) | Câu này **phải xoá khỏi thuyết minh gốc** (§16.5); nó cũng đang dẫn tới Mục 9 vốn không tồn tại |

---

## 16. Lỗi trong tài liệu gốc cần sửa

1. **Thiếu hẳn mục 9.** Số mục nhảy từ 8 sang 10 → phải đánh số lại liên tục. Tham chiếu treo *"xem Mục 9"* ở mục 4 sẽ tự hết khi xoá câu H3 theo §16.5.
2. **"Lĩnh vực: Phần mềm hệ thống"** — sai. Đây là ứng dụng web/đa phương tiện liên ngành với nhân văn số. Xếp sai lĩnh vực có thể bị chấm lệch tiêu chí.
3. **Thiếu các mục thường bắt buộc** với một thuyết minh đề tài: kế hoạch thực hiện theo mốc thời gian, phân công thành viên, dự toán kinh phí (thiết bị thu âm là chi phí thật), đánh giá rủi ro, và **danh mục tài liệu tham khảo** — hiện đang nêu tên Schafer, Krause, ISO, các dự án quốc tế trong phần nội dung mà không có mục trích dẫn.
4. **Phát biểu "chưa có bản đồ âm thanh cho Việt Nam"** quá rộng, cần thu hẹp kèm bằng chứng khảo sát (§1.1).
5. **Xoá câu H3 (AI) ở cuối mục 4** — nguyên văn: *"(Tùy chọn) Có thể mở rộng bằng giả thuyết H3 về khả năng nhận diện vùng miền của mô hình AI và việc so sánh AI với con người – xem Mục 9."* Đã quyết định bỏ hẳn hạng mục AI (§2). Xoá cả câu, không để lại dưới dạng "hướng phát triển" — một câu AI bỏ lửng sẽ mời người phản biện hỏi về cỡ dữ liệu và cách chia train/test, tức là tự mở ra điểm yếu cho một phần không làm. Sau khi xoá, mục 4 còn đúng hai giả thuyết H1 và H2, và tham chiếu treo tới Mục 9 cũng hết.
6. **Sửa lại phát biểu về đóng góp ở mục 5 và mục 10** cho khớp mô hình lai (§5.4). Mục 5 hiện đặt mục tiêu *"xây dựng thư viện âm thanh số có phân loại khoa học"* và mục 10 nói tính mới là *"kết hợp bảo tồn... với công nghệ web audio"*. Nếu phần lớn nền là tải về thì **đóng góp "thu thập" yếu đi rõ** — người phản biện sẽ hỏi thẳng "vậy nhóm tự thu được gì?". Cách phát biểu chịu được phản biện:
   - Đóng góp thu thập → thu hẹp vào **dấu ấn âm thanh và tín hiệu âm do nhóm tự thu và xác minh tại chỗ** (12–24 mẫu), đây là phần kho quốc tế không có.
   - Đóng góp chính → dịch sang **hệ thống hoá (phân loại theo Krause × Schafer), mô phỏng phân lớp, và kiểm chứng bằng thực nghiệm**. Ba thứ này không phụ thuộc nguồn vật liệu và vẫn nguyên giá trị.
   - Nói thẳng trong tài liệu rằng nền dùng nguồn có giấy phép mở, kèm trường `provenance` hiển thị công khai trên web. **Minh bạch là cách phòng thủ tốt nhất** — bị phát hiện thì mất uy tín, tự công bố thì thành ưu điểm về phương pháp.
