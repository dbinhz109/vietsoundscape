# BA — Bản đồ âm thanh Việt Nam (VietSoundscape)

| | |
|---|---|
| **Tài liệu** | Phân tích nghiệp vụ (Business Analysis) |
| **Nguồn đầu vào** | `BanDoAmThanh_VietNam.docx` (thuyết minh đề tài, 11 mục) |
| **Phiên bản** | 0.1 — bản nháp đầu, chờ chốt các mục ở §14 |
| **Ngày** | 2026-08-05 |
| **Phạm vi** | Nền tảng web thu thập – phân loại – mô phỏng – bảo tồn soundscape các vùng miền Việt Nam |
| **Trạng thái** | **Đã chốt:** bỏ hẳn AI/học máy (§2) · 4 địa điểm · nguồn vật liệu theo mô hình lai (§5.4). **Chưa chốt:** thiết bị tự thu (§5.4.2), bộ câu hỏi khảo sát (§10.3), thiết kế thực nghiệm (§10.2) |

> **Cách đọc tài liệu này.** Mục 1–4 là nghiệp vụ. Mục 5–8 là yêu cầu chức năng (FR) và dữ liệu. Mục 9 là yêu cầu phi chức năng (NFR). Mục 10 là yêu cầu riêng cho phần nghiên cứu — phần này thường bị bỏ sót và là chỗ dễ làm đổ giả thuyết H1/H2 nhất. Mục 11–14 là pháp lý, rủi ro, nghiệm thu, câu hỏi mở.

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

> ⚠️ **Rủi ro phát biểu.** Câu "chưa có bản đồ âm thanh cho Việt Nam" trong thuyết minh là **quá rộng và dễ bị phản biện** — Radio Aporee đã có điểm ghi tại Việt Nam. Phải thu hẹp phát biểu thành: *"chưa có bản đồ âm thanh **có phân loại khoa học theo khung Krause × Schafer**, **có công cụ mô phỏng phân lớp tương tác**, dành riêng cho các vùng miền Việt Nam"*. Trước khi bảo vệ, phải khảo sát và liệt kê thực tế các điểm ghi VN đang có trên các nền tảng trên (bằng chứng, không phỏng đoán).

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

> **Hệ quả tích cực của việc bỏ AI:** toàn bộ công suất nhóm dồn vào ba việc thực sự quyết định kết quả — chất lượng âm (§9.4), chế độ thực nghiệm (§10.5) và độ chắc của dữ liệu (§8.2). Không còn phải giải trình về cỡ dữ liệu quá nhỏ so với yêu cầu huấn luyện mô hình, cũng không còn rủi ro rò rỉ dữ liệu khi chia train/test.

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

> **Nhận định kiến trúc quan trọng:** hai khung phân loại khoa học *ánh xạ trực tiếp* sang kiến trúc âm thanh. Krause (geophony/biophony/anthrophony) → **cấu trúc bus của bộ trộn**. Schafer (keynote/signal/soundmark) → **hành vi phát của lớp âm**. Thuyết minh gốc chưa nói ra liên kết này; đây là ý tưởng kỹ thuật mạnh nhất có thể rút ra và nên viết hẳn vào đề tài.

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

> ⚠️ **Sơ đồ này đã sửa so với bản BA đầu.** Bản đầu vẽ `bus ──► Convolver ──► master` — tức **100% ướt**, không còn đường khô nào. Đó không phải "bước vào một không gian" mà là **mất sạch âm trực tiếp**, nghe như đứng ngoài phòng vọng vào. Mã nguồn đã cài đúng theo sơ đồ sai đó và tồn tại qua nhiều đợt vì mọi bản trộn đều để `reverb_ir: null`, nên nhánh vang chưa bao giờ chạy. Chi tiết ở §5.2b.

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

> **Cách xác minh AGC/khử ồn đã tắt thật — đo, không đọc thông số máy.** Thông số máy hầu như không nói có tắt được hay không. Chạy `npm run check:recorder <bản-thu-thử>`:
>
> 1. Thu **60 giây** bằng đúng thiết bị + app sẽ dùng: **25 s im lặng → 10 s có âm đều** (vỗ tay chậm hoặc nói liên tục) **→ 25 s im lặng**.
> 2. Công cụ tách ba đoạn rồi tìm hai dấu vết: nền ồn **dâng dần** trong đoạn lặng ⇒ AGC đang bật; nền ồn bị **cắt hẳn** xuống dưới −80 dBFS ⇒ khử ồn đang bật.
> 3. Kết luận `DÙNG ĐƯỢC` / `KHÔNG DÙNG ĐƯỢC` kèm số đo cụ thể (nền ồn phòng, mức dâng, tỉ lệ khối bị cắt).
>
> Nếu không tắt được: điện thoại **chỉ dùng cho dấu ấn âm thanh** (âm to, ngắn — AGC/khử ồn ít phá), còn lớp âm nền lấy từ kho. Đúng mô hình lai ở §5.4.

> **Tin tốt từ spike M0:** vật liệu tải về thường đã qua nén MP3, mang theo khoảng đệm của bộ mã hoá ở đầu/cuối. Spike đã đo và chứng minh `findLoopPoints` **tự cắt bỏ được khoảng đệm này** (từ 79,9 ms khe hở về 0 ms, bước nhảy từ `1.1e-1` về `6.7e-13`). Nghĩa là vật liệu tải về vẫn loop liền mạch được — miễn là luôn đi qua bước tìm điểm loop.

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

> ✅ **Đã dựng: `src/research/statistics.js`** — `npm run analyse -- <tệp log>`, hoặc `--demo` để xem format log.
>
> **Đã đối chiếu độc lập:** 8 giá trị (nhị thức, McNemar ba biến thể, Wilcoxon chính xác và xấp xỉ) khớp tới **12 chữ số có nghĩa** với một bản dựng lại bằng Python dùng `math.erfc` và tổ hợp chính xác. Không phải "tin là đúng" — đã đối chiếu.
>
> **Hai phép so sánh, không phải một.** Script chạy cả `layered` vs `isolated` (tính đồng thời — H1 như thuyết minh phát biểu) **và** `layered` vs `scrambled` (tính mạch lạc vùng miền — FR-58). Chỉ chạy phép đầu thì kết quả dương tính vẫn giải thích được bằng "nhiều thông tin hơn thì đoán đúng hơn".
>
> **Ba chỗ dễ báo sai "có ý nghĩa", đã chặn:**
>
> | Bẫy | Cách chặn |
> |---|---|
> | Dùng xấp xỉ chi bình phương khi quá ít cặp bất đồng — bản **không hiệu chỉnh cho p nhỏ nhất**, nên là bản dễ tự lừa mình nhất | tự chuyển sang **kiểm định chính xác** khi `b + c < 25` |
> | Bỏ cặp không chênh lệch trong Wilcoxon rồi báo `n` như cũ | trả về `dropped`, script in ra bắt buộc |
> | Gọi là "exact" khi có chênh lệch **trùng nhau** — phân bố chính xác dựng trên hạng không trùng, nên p không còn chính xác. Với Likert 5 mức thì trùng nhau là chuyện thường | kèm `note` cảnh báo; chế độ tự chọn tránh `exact` khi có trùng và dùng xấp xỉ chuẩn **có hiệu chỉnh phương sai** |
>
> **Một quyết định phương pháp đã ghi vào mã** (`pairResponses`): thiết kế trong-người 4 địa điểm × 3 điều kiện làm mỗi người có **một điều kiện xuất hiện hai lần**. Cặp lấy **lượt đầu** của mỗi điều kiện, để hiệu ứng luyện tập rơi đều lên hai điều kiện đang so sánh. Lượt thừa không bỏ đi nhưng **không** được đưa vào McNemar — làm thế là đếm một người hai lần.
>
> **Chiều phụ thuộc có chủ ý:** `scripts/analyse-results.mjs` định nghĩa luôn format log mà chế độ thực nghiệm phải ghi. Kiểm định quyết định cần ghi gì, chứ không phải ghi được gì thì kiểm cái đó — thiếu một trường là mất một giả thuyết.
>
> ✅ **Hợp đồng format đã đóng lại thành vòng kín:** `--demo` chạy qua **chính `createExperimentSession`** mà chế độ thực nghiệm sẽ dùng, không tự bịa cấu trúc log. Máy trạng thái phiên đổi trường nào mà script phân tích không đọc được nữa thì chạy demo là lộ ngay.
>
> ### Máy trạng thái phiên — `src/app/experiment/session.js`
>
> Tách hẳn khỏi giao diện vì đây là chỗ **sai thì hỏng cả bộ dữ liệu, mà hỏng theo kiểu không nhìn ra**: log vẫn đầy đủ, kiểm định vẫn chạy, chỉ có kết quả là vô nghĩa. Bốn luật:
>
> | Luật | Vì sao |
> |---|---|
> | **Đồng thuận là cổng cứng**, hỏi theo **từng mục đích**, không trả lời = không đồng ý | Luật 91/2025 Điều 9 khoản 4 điểm a/b/d. Thời điểm đồng thuận được ghi vào log — NĐ 356 Điều 6 khoản 2 bắt bên kiểm soát phải chứng minh được |
> | **Không có `back()`** | Sửa câu trả lời sau khi đã nghe lượt sau là để thông tin của lượt sau chảy ngược vào lượt trước |
> | **Không lộ đúng/sai sau mỗi lượt** | Báo kết quả là dạy người tham gia giữa chừng; các lượt sau không còn đo cùng một thứ với lượt đầu |
> | **Đúng/sai do máy đối chiếu đáp án**, không do người tham gia tự khai | Tránh cả nhầm lẫn lẫn thiên lệch muốn làm hài lòng người hỏi |
>
> Và một điểm làm FR-59 thật sự có tác dụng: **bản trộn xoay vòng theo số thứ tự người tham gia**, nên người khác nhau nghe bản trộn khác nhau cho cùng một vùng. Không có chỗ này thì ai cũng nghe đúng một bản, kết quả có thể chỉ phản ánh bản trộn đó chứ không phản ánh vùng miền — và công sức dựng 12 bản trộn thành bỏ phí.
>
> ### Giao diện — `src/app/experiment/experiment-view.js`
>
> Mỏng có chủ ý: mọi luật về trình tự và chấm điểm nằm ở `session.js`. Ở đây chỉ có ba ràng buộc mà **chỉ giao diện mới chặn được**:
>
> | Ràng buộc | Vì sao |
> |---|---|
> | **Không tích sẵn ô đồng thuận nào**; nút bắt đầu khoá tới khi tích đủ cả ba | NĐ 356 Điều 6 khoản 3 cấm đặt mặc định là đồng ý; Luật Điều 9 khoản 4 điểm d nói im lặng không phải đồng ý |
> | **Phải nghe hết đoạn âm mới nộp được** | Bấm bừa qua nhanh cho ra một lượt **trông hợp lệ** mà không đo được gì — tệ hơn thiếu dữ liệu, vì nó lọt qua mọi phép kiểm |
> | **Đủ cả 8 thuộc tính ISO mới nộp được** | Công thức ISO/TS 12913-3 cần đủ tám; thiếu một là lượt đó không suy ra được chiều nào ⇒ mất cả cặp của người đó ở phép kiểm (§10.3) |
> | **URL kích thích không được chứa điều kiện, mã bản trộn hay mã địa điểm** | Xem dưới |
>
> **Một lỗi tôi tự thiết kế vào, và test bắt được.** Mã kịch bản là `<bản trộn>--<điều kiện>`, mà mã bản trộn lại chứa tên vùng. Đưa thẳng vào `src` của thẻ `<audio>` thì người tham gia mở tab mạng hoặc xem nguồn trang là thấy `hue-trua-he--layered.wav` — biết luôn cả điều kiện lẫn đáp án. Hỏng theo kiểu **không ai biết**, vì log vẫn ghi bình thường và mọi kiểm định vẫn chạy.
>
> Chặn ở hai tầng: `render-stimuli.mjs` đặt tên tệp phục vụ theo **16 ký tự đầu của SHA-256 nội dung** (mờ, nhưng ổn định nên vẫn tái lập được), và `experiment-view.js` **ném lỗi** nếu URL nhận được có chứa bất kỳ ba chuỗi bí mật nào. Tầng thứ hai không thừa: cách đặt tên rò rỉ trông hoàn toàn bình thường lúc viết, và không tầng nào ở dưới bắt được.
>
> ### Trang phiên nghe — `/thuc-nghiem`
>
> ✅ **Đã nối dây và chạy thật trong trình duyệt** (07/08). Một người tham gia đi hết bốn lượt, bốn tệp WAV tải về đủ (17,3 MB mỗi tệp, HTTP 200), log tải xuống thành `nguoi-003.json`, và `npm run analyse` đọc được thẳng tệp đó. Đường đi khép kín từ thư mời đến bảng kết quả.
>
> **Là trang riêng, không phải một chế độ bên trong trang chính** — vì lý do nghiên cứu chứ không phải kỹ thuật. Trang chính hiện `signature_vi`, câu mô tả đặc trưng âm thanh của từng vùng ("tiếng rao, xe máy, chuông chùa…"). Đó chính là **đáp án viết sẵn**. Tách trang bảo đảm không có đường nào để chữ đó lọt vào mắt người tham gia; đo trong trình duyệt thật cho 0/7 chuỗi bí mật xuất hiện trong DOM. Phần lợi kỹ thuật (không nạp Leaflet: 10 kB thay vì 165 kB) chỉ là hệ quả.
>
> Ba quyết định của phần nối dây nằm ở `bootstrap.js` chứ không nằm trong tệp điểm vào, vì cả ba đều **sai được mà không để lại dấu vết nào trong log**:
>
> | Quyết định | Nếu làm cẩu thả |
> |---|---|
> | Số thứ tự người tham gia lấy từ `?nguoi=`, **không có giá trị mặc định** | Mặc định 0 ⇒ ai cũng nghe cùng một thứ tự ⇒ phép đảo thứ tự cân bằng của `assignment.js` biến mất, log vẫn trông bình thường |
> | Kiểm tên tệp mờ **lúc nạp bảng kê**, không đợi tầng hiển thị | Lỗi ở tầng hiển thị nổ ra giữa lúc người tham gia đang ngồi trước máy; ở đây nổ trước khi hỏi đồng thuận |
> | Kiểm đủ **cả 12 tệp** của thiết kế, không chỉ 4 lượt của người này | Thiếu tệp mà phát hiện ở người thứ mười hai thì mười một người trước đã nghe xong rồi |
>
> Thêm một chốt chặn: tải lại trang là **mất phiên** (không giữ trạng thái qua lần tải lại). Người đó đã nghe rồi, nghe lại thì các lượt sau không còn đo cùng một thứ. Nên có `beforeunload` hỏi lại khi đang giữa phiên — thà hỏi lại còn hơn mất lặng lẽ một người tham gia. Chưa xong hoặc đã xong thì để rời tự do.
>
> ⚠️ **Kích thích không nằm trong bản dựng web.** 12 tệp WAV 48k/24-bit ≈ **198 MB** — gói vào là bản dựng không dùng được. Phiên nghe chạy tại chỗ bằng máy chủ phát triển (`npm run dev`, đúng cách một thực nghiệm nghe có kiểm soát vẫn làm), hoặc `build/stimuli/` được phục vụ riêng. Máy chủ tĩnh khi triển khai cần luật viết lại `/thuc-nghiem` → `/thuc-nghiem.html`; máy chủ phát triển đã có sẵn trong `vite.config.js`.
>
> Trang chính **không** đặt liên kết sang đây: không có `?nguoi=` thì trang báo lỗi và dừng, nên một liên kết công khai chỉ dẫn người ta vào ngõ cụt. Người tham gia nhận địa chỉ kèm số thứ tự trong thư mời (việc C3.2).
>
> ### Cỡ hiệu ứng và khoảng tin cậy — `src/research/effect-size.js`
>
> p trả lời "hiệu ứng có thật không". Nó **không** trả lời "lớn bao nhiêu". Với n = 48, một hiệu ứng nhỏ đến mức vô nghĩa thực tiễn vẫn ra `p < 0,05`, và người đọc chỉ thấy p thì không có cách nào biết. Nên `npm run analyse` in cỡ hiệu ứng **ngay dưới mỗi p**, không để mục riêng cuối báo cáo:
>
> ```
> p = 0.0169 · ✓ CÓ ý nghĩa · nghiêng về layered · kiểm định: exact
>   chênh tỉ lệ 24.5% · CI 95% [6.6%, 42.4%]
>   tỉ số odds 3.40 · CI [1.25, 9.22]
> ```
>
> | Giả thuyết | Cỡ hiệu ứng | Khoảng tin cậy |
> |---|---|---|
> | H1 | **chênh tỉ lệ** (dễ hiểu) + **tỉ số odds** (so được với tài liệu) | Wald **hiệu chỉnh Agresti–Min** · logit |
> | H2 | **rank-biserial** | **Hodges–Lehmann** + cắt đuôi phân bố signed-rank |
>
> Không dùng Cohen's d: nó giả định thang khoảng và phân bố chuẩn, mà dữ liệu ở đây là nhị phân và thứ bậc. Khoảng chênh tỉ lệ mặc định là bản **hiệu chỉnh** vì Wald thuần có tỉ lệ phủ thật thấp hơn danh nghĩa — nó cho khoảng **hẹp hơn thực tế**, và hẹp quá là sai theo hướng nguy hiểm. Cả hai đều trả về để đối chiếu.
>
> **Một lỗi tìm ra nhờ nghi ngờ kết quả trông "quá đẹp".** Bản đầu tính khoảng Hodges–Lehmann bằng **nghịch đảo kiểm định tại** các trung bình Walsh — nghe chắc chắn hơn vì đó là định nghĩa. Nhưng thử đúng tại một trung bình Walsh thì có `dᵢ − θ = 0`, cặp bị loại, `n` giảm, phép kiểm đổi hẳn. Với thang Likert (tập Walsh chỉ có vài giá trị) khoảng co thành **một điểm** `[1,5; 1,5]` — mà khoảng tin cậy không bao giờ là một điểm. Đối chiếu ba trường hợp cho thấy nghịch đảo tại **điểm giữa** hai trung bình Walsh liền nhau cho khoảng mở, và bao đóng của nó khớp chính xác công thức cắt đuôi:
>
> | n | nghịch đảo tại điểm giữa | cắt đuôi |
> |---|---|---|
> | 12 | (3,25 ; 6,25) | **[3 ; 6,5]** |
> | 5 | (−3,5 ; 4,5) | **[−4 ; 5]** |
> | Likert 39 | (1,25 ; 1,25) | **[1 ; 1,5]** |
>
> Hai đường thật ra là một; công thức cắt đuôi vừa đúng vừa rẻ hơn. Và `uninformative: true` khi không cắt được đuôi nào — ở n = 5 khoảng trải hết tập Walsh, tức **nó không cho biết gì**, và báo cáo phải nói thế thay vì in ra một khoảng rộng như thể nó là kết quả.

### 10.2 Cỡ mẫu — phải tính trước, không thu bừa

Với thiết kế giữa-người, phát hiện mức chênh 50% → 75%, α = 0,05 hai phía, công suất 0,80:

```
n = (1,96 + 0,84)² × [0,25 + 0,1875] / 0,25²  ≈  55 người mỗi nhóm  (≈ 110 tổng)
```

**Khuyến nghị: dùng thiết kế trong-người** (mỗi người nghe cả hai điều kiện, đảo thứ tự cân bằng) — kiểm soát được khác biệt cá nhân và giảm cỡ mẫu xuống khoảng **40–60 người tổng**. Đây là thay đổi lớn về công sức thu thập.

> ✅ **Đã dựng: `src/research/assignment.js`** — xem kế hoạch bằng `npm run experiment -- 48`.
>
> **Một ràng buộc mà thiết kế trong-người thông thường không có.** Bình thường mỗi người sẽ nghe **mọi** tổ hợp địa điểm × điều kiện. Ở đây thì **không được**: nhiệm vụ là đoán vùng miền, nên nghe Huế lần thứ hai là đã biết đáp án — lượt đó không đo được gì. Nên mỗi người chỉ nghe **mỗi địa điểm đúng một lần**, điều kiện xoay vòng theo hình vuông La Tinh. Hệ quả: **một vòng cân bằng đầy đủ là 12 người** (4 địa điểm × 3 điều kiện), nên cỡ mẫu nên là bội của 12 — 48 là lựa chọn tự nhiên trong khoảng 40–60.
>
> Phân điều kiện lấy theo **số thứ tự** người tham gia, không lấy ngẫu nhiên: với n = 40–60 thì gán ngẫu nhiên lệch nhóm là chuyện thường và lệch bao nhiêu không kiểm soát được, còn xoay vòng cho cân bằng chính xác — đồng thời dựng lại được đúng phiên của người thứ k mà không cần lưu thêm gì.

> ### 🔴 Đã tính thật, và con số 40–60 ở trên là KHÔNG ĐỦ
>
> Việc C1.2 xong: `src/research/power.js` (26 test) + `npm run plan:sample` + `nghien-cuu/ke-hoach-phan-tich.md`. Con số 40–60 trong đoạn trên là ước đoán từ kinh nghiệm chung về thiết kế trong-người, không phải phép tính cho *thiết kế này*. Tính ra thì:
>
> | n | lực cho **H1** (kịch bản vừa phải) | lực cho **H2** (d = 0,5) |
> |---|---|---|
> | 40 | **43,7%** | 85,9% ✓ |
> | 48 | **52,1%** | 92,0% ✓ |
> | 60 | **63,3%** | 96,8% ✓ |
> | 85 | **80,0%** ✓ | 99,3% ✓ |
>
> Với 48 người, xác suất bỏ sót một hiệu ứng H1 có thật là **gần một nửa**. Ràng buộc nằm ở H1 chứ không ở H2: tỉ lệ đúng/sai là biến nhị phân nên tốn mẫu hơn hẳn biến liên tục. **Cỡ mẫu chốt: 85 người.** Vòng cân bằng đầy đủ là 12 người nên bội của 12 mới tròn: **84 cho 79,8%** — thực chất bằng 85, chênh nằm trong nhiễu mô phỏng — còn **96 cho 85,8%**. Chốt **96** nếu tuyển được, **84** là mức sàn.
>
> #### Công thức trong sách cho con số thiếu
>
> Bài tính chạy **hai đường**: công thức khép kín của Connor (1987), và mô phỏng chạy **chính `mcnemarTest`** mà `npm run analyse` sẽ dùng. Hai đường không khớp, và chênh có **hướng cố định**:
>
> | n | công thức | thật (mô phỏng) | chênh |
> |---|---|---|---|
> | 48 | 59,6% | 52,1% | −7,5 đpt |
> | **77** | **80,5%** | **75,4%** | **−5,1 đpt** |
> | 200 | 99,6% | 99,8% | +0,2 đpt |
>
> Nguyên nhân đo được: công thức giả định xấp xỉ chuẩn **không hiệu chỉnh**, còn phép kiểm thật dùng bản **chính xác** khi ít cặp bất đồng và bản chi bình phương **có hiệu chỉnh** khi nhiều. Cả hai đều thận trọng hơn — sai số loại I thực tế chỉ **3,0%** chứ không phải 5,0%, nên phép kiểm cũng nhận lại ít lực hơn. Chênh teo dần khi n lớn, đúng như một xấp xỉ tiệm cận phải thế; nhưng ở đúng khoảng n mà đề tài quan tâm thì nó đáng 5–8 điểm phần trăm.
>
> Nếu chỉ tra công thức trong sách, nhóm sẽ tuyển 77 người, tin rằng mình có 80% lực, và thật ra có 75%. Có kiểm thử khoá phát hiện này lại.
>
> #### Giả định nào đang chống đỡ con số
>
> Nói thẳng: **chưa có số liệu mồi**. Ba kịch bản (chênh 10 / 20 / 30 điểm phần trăm giữa hai loại cặp bất đồng) là phán đoán. Pilot ở C4.1 là để thay phán đoán bằng số đo — sau pilot phải chạy lại `npm run plan:sample` và cập nhật kế hoạch bằng một mục sửa đổi, không sửa đè.
>
> Và một yếu tố đẩy con số **lên** chứ không xuống: trong một cặp, hai điều kiện rơi vào **hai địa điểm khác nhau** (`layered`@Huế so với `isolated`@Hà Nội) — không tránh được, vì cho nghe lại cùng một vùng là họ nhận ra. Chênh lệch giữa các vùng vì thế cộng thêm nhiễu vào từng cặp. Thiết kế xoay vòng cân bằng chuyện đó **giữa** những người tham gia, nhưng **trong** một cặp thì nhiễu vẫn còn.
>
> Nếu không tuyển đủ 85 người, ba lựa chọn xếp theo mức khuyến nghị nằm ở `nghien-cuu/ke-hoach-phan-tich.md` §2.4 — trong đó phương án tốt nhất là **tăng số lượt mỗi người từ 4 lên 8**, cần khoảng một nửa số người nhưng đòi đủ 12 bản trộn (việc A3.3).

### 10.3 Thang đo cho H2 — đừng tự phát minh

Thuyết minh nói "khảo sát bằng thang Likert 5 mức" tự soạn. Có sẵn **bộ tiêu chuẩn quốc tế**: **ISO 12913** về soundscape — phần 1 (khung khái niệm), phần 2 (yêu cầu thu thập dữ liệu, kèm bộ câu hỏi với 8 thuộc tính cảm nhận: *dễ chịu, hỗn loạn, sống động, tĩnh lặng, yên bình, gây khó chịu, nhiều sự kiện, đơn điệu*), phần 3 (phương pháp phân tích).

Dùng ISO 12913-2 thay cho thang tự soạn mang lại: thang đã được kiểm định, kết quả **so sánh được với nghiên cứu quốc tế**, và một mục "cơ sở khoa học" mạnh hơn hẳn khi bảo vệ. Đây là khuyến nghị có giá trị cao nhất trong toàn bộ tài liệu này.

> ✅ **Đã dựng — câu Q3 / việc C0.2 chốt theo hướng ISO** (`src/research/soundscape-scale.js`, 14 test). Phiên nghe hỏi đủ **8 thuộc tính**, thang đồng ý 5 mức của Phương pháp A (Phụ lục C), **giữ nguyên thứ tự của bộ chuẩn** — đảo thứ tự cho "đỡ nhàm" là mất chính cái tính so sánh được vốn là lý do dùng bộ này.
>
> **Không hỏi thẳng "dễ chịu?" và "nhiều sự kiện?"** dù đó là hai chiều cần cho H2. Ba lý do, xếp theo mức quan trọng:
>
> | | |
> |---|---|
> | **Trực giao** | Hai chiều của ISO trực giao **theo cách dựng** — pleasant ở 0°, vibrant 45°, eventful 90°, chaotic 135°… Hỏi thẳng hai câu thì hai câu trả lời tương quan với nhau theo cách không kiểm soát được, và hết là hai trục độc lập. Có test khẳng định điều này: hồ sơ dễ chịu cực đại cho `eventfulness = 0`, và ngược lại |
> | **Số phép kiểm** | 8 thuộc tính × 2 phép so sánh = **16 kiểm định**; với α = 0,05 thì xác suất có ít nhất một dương tính giả ≈ **56%**. Suy ra 2 chiều rồi kiểm 2 chiều đó là **4 kiểm định** — và đó cũng là cách ISO/TS 12913-3 định dùng bộ này |
> | **Không so sánh được** | Hỏi thẳng là thang tự soạn, tức đúng thứ mục này khuyên bỏ |
>
> Công thức ISO/TS 12913-3, điểm 1–5 tâm hoá về −2…+2, chia cho 4 + √32 để nằm gọn trong [−1, 1]:
>
> ```
> P = [(dễ chịu − khó chịu) + cos45°(yên bình − hỗn loạn) + cos45°(sống động − đơn điệu)] / (4 + √32)
> E = [(nhiều − ít chuyện xảy ra) + cos45°(hỗn loạn − yên bình) + cos45°(sống động − đơn điệu)] / (4 + √32)
> ```
>
> Phép kiểm đáng nói nhất trong bộ test: **quét cạn cả 5⁸ = 390 625 tổ hợp trả lời**, khẳng định không tổ hợp nào ra ngoài [−1, 1] và biên ±1 thật sự đạt được. Một hệ số sai dấu sẽ lọt qua vài ca thử tay nhưng không lọt qua phép quét này.
>
> **Log ghi 8 điểm thô, suy diễn xảy ra lúc phân tích.** Nghĩa là đổi công thức không phải thu lại dữ liệu — và nhóm khác muốn tính lại theo cách khác thì vẫn có nguyên liệu.

### 10.4 Yếu tố gây nhiễu phải khử — nếu không H1 vô nghĩa

Bản soundscape phân lớp thì **dài hơn, to hơn, nhiều thông tin hơn** bản âm đơn lẻ. Nếu người nghe nhận diện đúng hơn, có thể chỉ vì *nhiều thông tin hơn*, chứ không phải vì *"phân lớp có chủ đích"* như H1 phát biểu.

> ### Ba điều kiện, định nghĩa thao tác được
>
> Thuyết minh gốc nói H1 so sánh "soundscape phân lớp" với "âm đơn lẻ" nhưng **chưa bao giờ định nghĩa** điều kiện đối chứng là gì cụ thể. Đã định nghĩa và dựng trong `src/research/variants.js`:
>
> | Điều kiện | Mẫu âm | Tính đồng thời | Vùng miền |
> |---|---|---|---|
> | `layered` | của vùng gốc | **chồng lấp** | mạch lạc |
> | `isolated` | **y hệt** `layered` | **lần lượt, không chồng** | mạch lạc |
> | `scrambled` | vai giống, **vùng khác** | chồng lấp | bị phá |
>
> `layered` vs `isolated` cô lập **tính đồng thời**. `layered` vs `scrambled` cô lập **tính mạch lạc vùng miền** — tức chữ *"có chủ đích"*. Mỗi cặp chỉ khác nhau **một** biến.
>
> **Cân bằng do cách dựng, không do đo lại.** Cả ba suy ra từ **cùng một danh sách sự kiện**, nên số sự kiện và thời lượng khớp *chính xác* — `npm run experiment -- 48 --placeholder` cho `6/6/6 · 7/7/7 · 5/5/5 sự kiện · cân bằng`, và test tích hợp chạy `checkStimulusBalance` với ngưỡng **0** vẫn đạt. Cách ngược lại (dựng riêng từng điều kiện rồi đi đo xem có khớp) gần như chắc chắn lệch, và mỗi lần lệch là một lần phải thu thêm hoặc cắt bớt vật liệu.
>
> **Hai chỗ tôi làm sai rồi phải sửa** — ghi lại vì cả hai đều "trông hợp lý":
> 1. *Chia khung `isolated` thành các ô bằng nhau.* Nó gán cho tiếng chuông 3 giây một ô 12 giây ⇒ bộ kết xuất kéo dài hoặc lặp nó ⇒ `isolated` không còn tương đương. Cách đúng: **âm phát một lần giữ nguyên thời lượng thật, lớp nền hút phần dư** (nền liên tục nên co giãn được mà vẫn là chính nó).
> 2. *Lấy độ dài sự kiện là "từ đây tới hết khung".* Tiếng chuông ở giây 17 thành dài 43 giây. Và `soundmark` không có `trigger` bị coi như nền lặp vô hạn — một tiếng cồng ngân 60 giây. Cách đúng: phân nhánh theo **vai Schafer**, không theo việc có `trigger`.

| Mã | Yêu cầu |
|---|---|
| FR-56 | Cân bằng tổng thời lượng và tổng số sự kiện âm riêng biệt giữa hai điều kiện |
| FR-57 | Chuẩn hoá cùng mức LUFS cho mọi kích thích |
| FR-58 | **Thêm điều kiện đối chứng thứ ba: phân lớp *sai vùng miền* (trộn ngẫu nhiên).** Đây mới là phép thử đúng cho chữ "có chủ đích" trong H1 |
| FR-59 | ≥ 3 bản trộn khác nhau cho mỗi vùng miền (chống hiệu ứng do một mẫu cụ thể) ⇒ **12–15 bản trộn**, không phải 4–5. Ràng buộc này làm tăng khối lượng thu âm — phải tính vào kế hoạch |
| FR-60 | **Danh sách trả lời phải dài hơn số lượt nghe**: 4 vùng thật + ≥ 4 phương án nhiễu là địa danh thật, quen, không có trong bộ kích thích, mỗi vùng một nơi cùng vùng. Thứ tự xáo theo (người, lượt) có seed; ô thật và ô nhiễu dựng giống hệt trong DOM; người tham gia được báo trước rằng danh sách dài hơn số đoạn |

> ### 🔴 Lỗi thiết kế tìm được khi đánh giá lại (spec S1.1) — đã sửa, ra FR-60
>
> Mỗi người nghe **mỗi vùng đúng một lần** (ràng buộc ở §10.2). Danh sách trả lời trước đây lại **đúng bằng bốn vùng đó**. Hệ quả: nhớ ba câu trước là lượt 4 chỉ còn **một** lựa chọn, lượt 3 còn hai — ~25% lượt gần như không mang thông tin. Tỉ lệ đúng bị thổi lên không do nghe được gì, cặp cùng-đúng tăng, McNemar mất lực, và **không phép kiểm nào trên log phát hiện được** vì log vẫn đầy đủ. Không tài liệu nào trước đó nhắc tới (grep `loại trừ|elimination` → 0).
>
> **Sửa:** `data/distractors.json` (Sa Pa, Phố cổ Hội An, Đà Lạt, Đảo Phú Quốc — đề xuất, VH chốt) + `src/research/answer-options.js` (ghép và xáo có seed, 11 test) + `session.js` nhận `answerOptions` tách khỏi `locations`, ghi thứ tự đã hiện vào log + `experiment-view.js` vẽ theo `trial.answer_options`, ném lỗi nếu thiếu nhãn, test khoá "ô thật và ô nhiễu dựng giống hệt". Câu *"Danh sách để chọn có nhiều địa điểm hơn số đoạn bạn sẽ nghe"* có ở màn đồng thuận và `phap-ly/07` — giết phím tắt mà không lừa ai.
>
> **Vì sao nhiễu cùng vùng, không phải vùng khác:** nếu nhiễu toàn ở vùng khác thì nhận ra *vùng* là đủ để loại hết nhiễu, và loại trừ quay lại ở mức vùng. Cùng vùng thì phải nhận ra *nơi*. `correct` vì thế là **mức nơi** (`guess === location_id`); mức vùng suy được lúc phân tích từ `region` của hai tệp dữ liệu, ghi là thước đo phụ. Mức đoán mò đổi từ ≈52% (trung bình có loại trừ) xuống ≈16% — cỡ mẫu tính lại ở `nghien-cuu/ke-hoach-phan-tich.md` §7.

> ✅ **Đã dựng: `src/research/stimulus.js`.** FR-56/57/58 kiểm bằng `checkStimulusBalance`, FR-59 kiểm bằng `checkRecipeCoverage` — đã nối vào `npm run validate`, hiện báo **còn thiếu 8 bản trộn** (mỗi vùng mới có 1/3).
>
> Số sự kiện âm đếm theo **lịch phát thật** từ bộ sinh có seed, không dùng ước lượng `thời lượng / khoảng cách trung bình`: FR-56 cần con số khớp thật giữa các điều kiện, mà ước lượng thì lệch. Mỗi lớp tín hiệu dùng một seed dẫn xuất riêng (`seed + chỉ số lớp`) — dùng chung một seed thì mọi lớp tín hiệu phát trùng khớp nhau, nghe như một sự kiện và đếm cũng sai.

### 10.5 Tái lập được — lý do bản trộn phải kết xuất sẵn

Lớp signal phát ngẫu nhiên (FR-15) nghĩa là **mỗi người tham gia nghe một thứ khác nhau** → không phải thực nghiệm có kiểm soát. Bắt buộc:

| Mã | Yêu cầu |
|---|---|
| FR-52 | Kích thích thực nghiệm được **kết xuất sẵn** thành tệp cố định; mọi người tham gia nghe tệp giống hệt nhau (đối chiếu bằng SHA-256) |
| FR-15b | Bộ sinh số ngẫu nhiên phải có seed; `recipe + seed → chuỗi trigger xác định` |

> ✅ **FR-52 đã dựng và đã chứng minh.** `buildVariants` trả về **kịch bản kết xuất phẳng, đã chốt thời điểm** — không còn `trigger` nào để bộ kết xuất tự diễn giải. `buildRenderCommand` (`src/research/render-graph.js`) đổi kịch bản thành lệnh ffmpeg; `npm run render:stimuli -- --placeholder --verify` kết xuất **12 kích thích** rồi kết xuất lại lần hai và so băm:
>
> ```
> ✓ 12/12 tệp khớp băm chính xác
> Độ to: mục tiêu −23 LUFS · lệch giữa các kích thích 0,04 LU ✓ đạt FR-57
> ```
>
> Đây là phép chứng minh, không phải ý định: **kết xuất lại cho ra đúng byte cũ**, nên bảng kê SHA-256 có giá trị đối chiếu và mọi người tham gia chắc chắn nghe cùng một tệp. Ba chi tiết làm nên tính xác định đó, mỗi cái đều là một chỗ dễ mất:
>
> | Chi tiết | Không có thì sao |
> |---|---|
> | Cờ `-fflags +bitexact -flags +bitexact -map_metadata -1` | ffmpeg ghi tên phiên bản vào tệp ⇒ SHA-256 đổi theo phiên bản ffmpeg ⇒ bảng kê băm vô nghĩa |
> | `amix=…:normalize=0` | amix mặc định **chia biên độ cho số nguồn** ⇒ bản 7 lớp nhỏ hơn bản 5 lớp ⇒ độ to thành yếu tố gây nhiễu (FR-57) |
> | `apad` rồi `-t` | kịch bản `isolated` kết thúc sớm ⇒ tệp ngắn hơn ⇒ lệch thời lượng ngay ở bước kết xuất (FR-56) |
>
> Dịch trái phải dùng **luật đẳng công suất** giống `StereoPannerNode`, để bản kết xuất nghe khớp bộ trộn thời gian thực. Luật tuyến tính sẽ làm âm hụt ~3 dB ở giữa, và vì mỗi điều kiện dịch khác nhau, chỗ hụt đó biến thành lệch độ to giữa các điều kiện.
>
> ⚠️ **Một điều chỉnh so với bản BA đầu:** bản đầu nói kết xuất *"bằng `OfflineAudioContext`"*. Đó là chi tiết cài đặt, và nếu hiểu thành "mỗi máy tự kết xuất khi chạy" thì **sai mục đích**: `OfflineAudioContext` không bảo đảm cho ra byte giống nhau giữa các trình duyệt và các phiên bản (khác cách nội suy khi đổi tần số mẫu, khác cách xử lý số cực nhỏ). Điều FR-52 thật sự cần là **kết xuất một lần, ở một chỗ, rồi phát tệp đó cho mọi người** — nên nên kết xuất phía máy chủ bằng ffmpeg để chạy lại được trong CI. Yêu cầu đã sửa lại thành "kết xuất sẵn", bỏ ràng buộc công cụ.

Bộ trộn thời gian thực chỉ dùng cho **chế độ khám phá tự do**, không dùng làm kích thích thực nghiệm.

---

## 11. Pháp lý, đạo đức, quyền riêng tư

> **Bộ hồ sơ đã soạn xong ở `phap-ly/`** (việc A0.2) — 7 văn bản: phiếu đồng thuận ghi âm, thoả thuận ghi công cộng đồng, cam kết quyền người đóng góp, quy trình yêu cầu xoá, nhật ký thực địa, phiếu cho cộng tác viên, và thông báo đồng thuận tham gia nghiên cứu.
>
> ⚠️ Đó là **bản thảo vận hành, không phải tư vấn pháp lý** — cần người có chuyên môn rà lại. Nhưng **mọi số điều khoản đã được điền từ toàn văn** (việc A0.3, hoàn tất 06/08): toàn văn ba văn bản luật lưu ở `phap-ly/nguon/`, không dẫn theo trí nhớ và không dẫn theo bài phân tích thứ cấp.
>
> Ba mức đồng thuận đã thành **luật máy kiểm được** trong `src/data/clip-schema.js`: mẫu có giọng người nhận dạng được không xuất bản được khi chưa có đồng thuận; biểu đạt văn hoá truyền thống bắt buộc `community_agreed` + `community_credit`, đồng thuận cá nhân không đủ; mẫu `withdrawn` **không bao giờ** xuất bản được.
>
> **Danh mục dữ liệu nhạy cảm cũng đã thành luật máy** (`checkSensitiveData`): ba nhóm `ethnic_origin` / `religious_belief` / `biometric` theo NĐ 356 Điều 4 khoản 1; máy bắt mâu thuẫn giữa `contains_identifiable_voice` và `biometric`; dữ liệu nhạy cảm **không bao giờ** được khai `not_required`; và xuất bản đòi hai xác nhận `sensitive_notice_given` + `recording_notice_given`. Xem trạng thái bằng `npm run validate` — báo cáo có mục riêng cho 6 mẫu nhạy cảm.
>
> ### 🔴 Ba nghĩa vụ có mốc thời gian, chưa có trong lộ trình cũ
>
> Chỉ lộ ra khi đọc toàn văn. Chi tiết `phap-ly/08` §8:
>
> | Nghĩa vụ | Căn cứ | Mốc |
> |---|---|---|
> | Nộp **hồ sơ đánh giá tác động xử lý dữ liệu cá nhân** cho Cục A05, Bộ Công an | Luật 91/2025 Điều 21 khoản 1 | **60 ngày** kể từ ngày xử lý dữ liệu cá nhân đầu tiên — tức từ mẫu âm có giọng người đầu tiên, **không** phải từ ngày ra mắt web |
> | **Cử người phụ trách** bảo vệ dữ liệu cá nhân | Luật Điều 33 khoản 2; NĐ 356 Điều 13, 14 | trước khi thu mẫu đầu |
> | **Phối hợp với Sở VHTTDL** nơi có di sản | Luật Di sản văn hoá 45/2024 Điều 16 khoản 3 | trước thực địa |
>
> Đề tài xử lý **dữ liệu cá nhân nhạy cảm** nên **không** được hưởng miễn trừ dành cho doanh nghiệp nhỏ ở Luật Điều 38 khoản 2–3 / NĐ 356 Điều 41. Mốc 60 ngày này chạy **trước** cả cột mốc ra mắt web trong lộ trình — cần hỏi phòng pháp chế của trường xác nhận cách tính.


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
