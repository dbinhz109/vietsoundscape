# Đánh giá VietSoundscape như một dự án trong hồ sơ CS của học sinh THPT

Ngày kiểm tra và hậu kiểm: 26/09/2026. Đánh giá bản local hiện tại gồm các thay đổi
chưa commit, đồng thời kiểm tra riêng đường dẫn công khai trong README. Các lỗi được
ghi bên dưới là kết quả kiểm tra ban đầu; mỗi mục ghi rõ trạng thái sau sửa. Đây là
rubric của người review, không phải thang tuyển sinh chính thức hay dự đoán xác suất
trúng tuyển.

## Kết luận của giám khảo

**Dự án đáng đưa vào portfolio và đủ mạnh để tạo một cuộc phỏng vấn CS có chiều sâu.**
Ý tưởng có bản sắc, phần kỹ thuật vượt rõ mức CRUD thông thường, luồng tương tác local
đã qua hậu kiểm trình duyệt thật. Điều còn thiếu để biến nó thành bằng chứng hồ sơ rất
mạnh là bản deploy mới hoạt động đúng, vật liệu thu thật, thử nghiệm với người thật và
phân định đóng góp cá nhân.

Không yêu cầu một học sinh THPT phải làm sản phẩm doanh nghiệp hoặc công bố nghiên
cứu mới được đánh giá tốt. Bản demo có ghi nhãn là hợp lệ; 96 log tổng hợp chỉ chứng
minh pipeline chạy, không tính thành 96 người dùng hay bằng chứng tác động.

MIT mô tả Maker Portfolio là nơi đánh giá dự án do ứng viên thiết kế/thực hiện,
nhấn mạnh bằng chứng quá trình làm, phần đã hoàn thành và demo hoạt động; dự án
đang làm vẫn được chấp nhận để xem xét phần đã xong. Stanford mô tả tuyển sinh tổng
thể, xem năng lực học thuật, bối cảnh, chiều sâu hoạt động và sự tò mò trí tuệ.
Các nguồn này hỗ trợ cách nhìn về portfolio, không cung cấp điểm số cho dự án này.

- [MIT — Creative portfolios](https://mitadmissions.org/apply/firstyear/portfolios-additional-material/)
- [Stanford — Holistic Admission](https://admission.stanford.edu/apply/overview/index.html)

## Điểm đánh giá chủ quan

| Mặt đánh giá | Điểm /10 | Lý do |
|---|---:|---|
| Ý tưởng và bản sắc | 8 | Gắn âm thanh, không gian và văn hóa Việt Nam; có câu hỏi để khám phá |
| Chiều sâu kỹ thuật của mã hiện có | 8 | Web Audio, DSP cơ bản, pipeline media, state machine, schema, thống kê và phân bổ thực nghiệm |
| Thị giác | 8 | Bố cục triển lãm hai cột, typography có chủ đích, bản đồ Việt Nam và waveform tạo bản sắc |
| Trải nghiệm người dùng | 8 | Player cố định, mobile tự đưa phòng nghe vào tầm nhìn, lọc nâng cao gập lại, có pause/reset/share |
| Độ tin cậy của luồng đã thử | 8 | Test module mạnh; hậu kiểm browser đạt race, stop, offline, mobile và chống tua |
| Tác động/nghiên cứu đã chứng minh | Chưa đủ bằng chứng | Âm và log hiện là mô phỏng; chưa xác nhận sử dụng thực tế |
| Năng lực riêng của học sinh | Chưa thể chấm | Cần phân biệt phần tự làm, thư viện, người hỗ trợ và AI |

Không cộng các điểm thành điểm tuyển sinh. Thiếu bằng chứng không đồng nghĩa học
sinh thiếu năng lực; cũng không thể quy toàn bộ chất lượng repo thành năng lực của
người nộp hồ sơ. Trong cuộc trao đổi này, phần pipeline demo đã có AI hỗ trợ viết.

## Phạm vi kiểm tra và bằng chứng

- Chrome headless thật trên bản build Vite ở `http://127.0.0.1:4173`.
- Desktop 1440×900; viewport 320, 375, 390, 768 px; có giả lập touch cho bài kiểm mobile.
- 20 kịch bản/quan sát gồm luồng bình thường, đổi địa điểm, tải chậm có kiểm soát,
  offline, bàn phím, tìm kiếm, trích dẫn, phiên thực nghiệm và bố cục.
- `npm test`: **687 test / 38 file đạt** sau sửa. Lần chạy coverage trước sửa đạt
  **680 test / 38 file**; statements/lines **98,94%**,
  branches **92,26%**, functions **98,24%** trong phạm vi cấu hình coverage.
- `npm run lint`, `npm run validate:runtime`: đạt.
- Coverage không bao gồm scripts và một số entrypoint, bản đồ, service-worker wiring
  theo `vitest.config.js`; không phải 98,94% của toàn bộ hệ thống.
- Không đo chất lượng nghe chủ quan, không kiểm thiết bị Android/iPhone thật,
  không phỏng vấn học sinh hoặc xác minh hồ sơ học thuật.

Bằng chứng cục bộ, được lưu ngoài Git trong `build/judge-review/`:

- `browser-results.json`, `browser-run.log`, `browser-audit.mjs`.
- `ux-results.json`, `ux-run.log`, `ux-audit.mjs`.
- `assignment-audit.json`, `public-site.json`.
- `final-audit.mjs`, `final-desktop.png`, `final-mobile.png` — hậu kiểm sau sửa.
- Ảnh desktop/mobile/dark mode và các trạng thái lỗi.

Các harness dùng Playwright có sẵn trong môi trường review, không phải bộ E2E đã
được cấu hình trong CI. Đường dẫn import Playwright trong harness là đường dẫn của
máy này. Bài master-slider đã được chạy lại với route regex và chờ đủ **5/5 lớp**;
không dùng kết quả chạy ban đầu khi chuỗi “2/5 lớp” bị nhận nhầm là đã tải xong.

## Những tính năng người dùng đã chạy được

1. Mở đủ **12 bản trộn**: ba thời điểm tại mỗi một trong bốn địa điểm.
2. Chọn bằng danh sách hoặc điểm trên bản đồ.
3. Phát riêng lớp âm bằng nút, chỉnh slider và dùng phím mũi tên.
4. Tìm “hue” tìm được Huế; chuỗi không khớp trả danh sách rỗng.
5. Chia sẻ URL giữ giá trị lớp âm: đặt 0,23, mở lại link rồi chọn địa điểm vẫn là 0,23.
6. Mở metadata và sao chép trích dẫn vào clipboard.
7. Bố cục không tràn ngang ở các viewport đã thử; có dark mode và focus bàn phím.

Đây là những điểm cộng thật. Ứng dụng có chức năng, không chỉ là một mockup đẹp.

## Các phát hiện ban đầu và trạng thái sau sửa

### P1 — Dừng trong lúc tải không hủy được thao tác đang chờ — **ĐÃ SỬA**

Sau sửa, phiên mở có mã thế hệ riêng, request recipe dùng `AbortController`, kết quả
audio về muộn bị bỏ. Unit test và browser test với độ trễ có kiểm soát đều đạt.

Cách tái hiện A: giữ request JSON bản trộn Hà Nội 1,2 giây → chọn Hà Nội → bấm Dừng.
Ngay sau bấm: “Đã dừng…”. Sau khi request về: phòng nghe dựng lại và báo “5 lớp đang phát”.

Cách tái hiện B: trì hoãn tải WebM 1 giây → chọn Hà Nội → bấm Dừng sau khi request âm bắt đầu.
Kết quả: `Cannot read properties of null (reading 'addLayer')` hiện trong thông báo lỗi.

Vị trí: `src/app/main.js:158`, `src/app/main.js:213`,
`src/app/room/listening-room.js:219`. Kiểm hủy ở pha tải lớp phụ không bảo vệ pha tải nền.
Cần cơ chế vô hiệu hóa request/phiên cũ xuyên suốt từ chọn địa điểm đến gắn audio.

### P1 — Chọn Cái Răng nhưng phòng nghe lại là Hà Nội — **ĐÃ SỬA**

Lựa chọn mới vô hiệu hóa toàn bộ callback của lựa chọn cũ. Hậu kiểm trì hoãn Hà Nội
1,2 giây rồi chọn Cái Răng giữ đúng thẻ, tiêu đề và state Cái Răng.

Trì hoãn request recipe Hà Nội 1,5 giây → bấm Hà Nội rồi Cái Răng.
Kết quả: danh sách đánh dấu **Cái Răng**; tiêu đề phòng nghe và URL lại là **Hà Nội**.
Đây là lỗi “request cũ về muộn thắng lựa chọn mới”, không phải cảm nhận thẩm mỹ.
Vị trí chính: `src/app/main.js:158` đến cập nhật state/phòng nghe.

### P1 — Chưa nghe đủ vẫn nộp được câu trả lời — **ĐÃ SỬA**

Giao diện nay gộp các khoảng trong `audio.played` và đòi ít nhất 90% thời lượng thực
sự đã phát. Tua tới 59,8 giây chỉ ghi 0% và nút gửi vẫn bị khóa.

Ở một trial 60 giây, điền câu trả lời → tua tới 59,8 giây → phát 0,2 giây cuối.
Nút nộp mở khóa và chuyển sang “Đoạn 2 trên 4”. `audio.played` ghi `[59.8, 60]`.
Bài kiểm mô phỏng thao tác tua bằng media API, không sửa `listened` hoặc gọi submit trực tiếp.

Vị trí: `src/app/experiment/experiment-view.js:248` coi `ended` là đã nghe đủ.
Cần ghi nhận khoảng thực sự đã phát và điều kiện đủ nghe theo protocol trước khi
thu dữ liệu thật. Việc kết thúc timeline không đồng nghĩa đã nghe toàn bộ.

### P2 — Slider tổng báo sai sau khi tải lớp phụ — **ĐÃ SỬA**

Giá trị master và bus được giữ trong state của phòng nghe. Browser test kéo master
về 0,2 trong lúc tải dần và xác nhận giá trị vẫn là 0,2 sau khi đủ lớp.

Giữ ba request lớp phụ 2 giây → khi đã có 2/5 lớp, kéo âm lượng tổng về 0.
Sau khi đủ 5/5 lớp, slider hiển thị **0,85**. Phát hiện xác nhận trạng thái hiển thị
bị reset; không kết luận âm lượng thực tế đã tự tăng trở lại.

Vị trí: `src/app/room/listening-room.js:366`: render dựng lại slider từ recipe,
không từ giá trị người dùng đang chỉnh. Bus sliders có cùng mẫu code cần kiểm thêm.

### P2 — Offline ngay sau lượt mở đầu tiên không hoạt động như lời hứa — **ĐÃ SỬA**

Bản build sinh `offline-assets.json`; service worker cất trước HTML, JS, CSS, icon và
dữ liệu. Context trình duyệt mới mở một lần, ngắt mạng rồi reload vẫn dựng đủ bốn thẻ.

Context mới → mở trang → đợi worker ready và controller → ngắt mạng → reload.
Trang còn “Đang tải…”, không có nút địa điểm. Cache chỉ chứa HTML và manifest,
không có JS/CSS/dữ liệu đã tải trước khi worker kiểm soát trang.

Vị trí: `src/app/offline/cache-policy.js:46`, `src/app/offline/sw.js:13`.
Cần chuẩn bị đủ tài nguyên hoặc hiển thị rõ trạng thái đã sẵn sàng offline.
Không nhầm lỗi này với demo qua máy chủ localhost vẫn chạy khi tắt wifi.

### P2 — Bản công khai chưa có phiên thực nghiệm dùng được — **CHỜ DEPLOY BẢN MỚI**

Kiểm tra endpoint ngày 26/09/2026:

| Endpoint dưới `https://dbinhz109.github.io/vietsoundscape/` | Kết quả |
|---|---|
| `/` | 200 |
| `data/clips.json` | 200, phiên bản `0.1-planned` |
| `thuc-nghiem.html?nguoi=0` | 200 cho HTML |
| `build/stimuli/manifest.json` | **404** |

Đây là bản công khai khác bản local mới kiểm. Không ghi “demo đầy đủ online” trong
hồ sơ cho tới khi triển khai và kiểm lại đúng link mà giám khảo sẽ mở.

### P3 — Nhãn truy cập phòng nghe tham chiếu phần tử không tồn tại — **ĐÃ SỬA**

`room-heading` nay tồn tại ở trạng thái rỗng lẫn khi đang phát, và được phục hồi sau
khi dừng. Hậu kiểm không còn tham chiếu ARIA bị thiếu.

`index.html` khai `aria-labelledby="room-heading"`, nhưng không có phần tử id đó.
Bàn phím chỉnh lớp đã đạt, song chưa thể tuyên bố đã kiểm xong tiếp cận cho người
khiếm thị. Cần kiểm screen reader thật nếu coi đây là nhóm người dùng chính.

## Giao diện có đẹp và ấn tượng chưa?

**Sau sửa: đủ ấn tượng để làm mặt tiền portfolio.** Bảng màu ngà/chàm, headline lớn,
bản đồ Việt Nam, thẻ địa điểm và waveform cùng nói một ngôn ngữ thị giác. Giao diện
không cần ảnh trang trí để che chức năng; phần phối lớp âm là điểm nhấn thật của sản
phẩm. Nhận xét này vẫn là phán đoán thiết kế, chưa thay cho nghiên cứu UX với người dùng.

### Desktop

Các nhận xét dưới đây mô tả bản ban đầu. Bản sau sửa tăng cột nội dung lên khoảng
768 px ở viewport 1440 px, chuyển địa điểm thành lưới thẻ, đưa lối vào thí nghiệm
lên hero và dành toàn màn hình còn lại cho bản đồ.

- Cột điều khiển chỉ khoảng **432 px trên màn hình 1440 px**; gần 70% còn lại là bản đồ.
- Với bốn điểm, bản đồ chưa truyền tải nhiều thông tin tương xứng với diện tích.
- Header lớn và bộ lọc chiếm phần trên; phần trộn âm — nơi thể hiện kỹ thuật tốt
  nhất của dự án — phải cuộn xuống mới thấy.
- Nhiều chữ nhỏ 13,12 px và thuật ngữ `keynote`, `anthrophony`, H1, RAM… làm trang
  mang cảm giác công cụ nội bộ. Thiếu một đường hướng dẫn ngắn cho người mới.
- Câu chuyện địa phương mới chủ yếu là tên và mô tả âm; chưa có tư liệu hình ảnh,
  câu chuyện thu âm hoặc lời giải thích ngắn giúp người xem nhớ dự án.

### Mobile

Các số dưới đây là baseline trước sửa. Hậu kiểm sau sửa ở 390×844 ghi nhận tiêu đề
phòng nghe ở **29 px** trong viewport ngay sau chọn, player cố định ở đáy và không
tràn ngang. Nội dung dùng một vùng cuộn trang duy nhất.

Ở viewport **390×844**, sau khi chọn Hà Nội và đủ 5 lớp:

| Phần tử | Mép trên theo viewport lúc vừa chọn |
|---|---:|
| Tiêu đề phòng nghe | 917 px |
| Âm lượng tổng | 2.151 px |
| Nút Dừng | 2.209 px |

Panel cao 844 px nhưng nội dung cuộn bên trong cao 2.268 px, trong khi trang còn
cuộn ra vùng bản đồ bên dưới. Không tràn ngang là tốt, nhưng có hai vùng cuộn và
điều khiển bị khuất. Người dùng vừa chọn một nơi đã có âm phát mà chưa thấy player.
Đây là điểm UX cần ưu tiên hơn thêm animation hoặc đổi màu.

### Những cải thiện đã triển khai

1. Player cố định có pause/resume, master volume, sao chép link, đặt lại và dừng.
2. Khi chọn nơi trên mobile, phòng nghe cuộn vào vùng nhìn và heading nhận focus.
3. Tìm kiếm ở mặt trước; năm bộ lọc chuyên sâu nằm trong vùng mở rộng.
4. Cột nội dung và phòng nghe rộng hơn; từng lớp thành thẻ có mã màu Krause.
5. Nhãn demo viết cho người nghe; thuật ngữ, nguồn và giấy phép nằm trong chi tiết gập.
6. Có đường vào thí nghiệm ngay trên hero, nhưng trang thực nghiệm vẫn tách riêng.

Việc thị giác còn đáng làm khi có dữ liệu thật là bổ sung câu chuyện thu âm và tư
liệu hiện trường có nguồn rõ ràng. Bản tiếng Anh chỉ cần nếu hồ sơ gửi hội đồng không
đọc tiếng Việt.

## Kiểm tra thêm về thiết kế thực nghiệm

Chạy phân điều kiện cho 96 mã người, từ dữ liệu hiện tại:

- Địa điểm × điều kiện: mỗi ô 32 lượt; cân bằng ở mức này.
- Địa điểm × thứ tự: mỗi ô xuất hiện 3 lần trong một vòng 12 người.
- Bản trộn × điều kiện tại n=96: mỗi ô nhận 10–11 lượt, chênh tối đa một.

Phân bổ nay cân bằng cả vị trí lượt, điều kiện và biến thể recipe trong giới hạn
nguyên của cỡ mẫu. Hai regression test khóa các bất biến này trước khi thu dữ liệu.

## Điều cần chứng minh với giám khảo CS

Một demo tổng hợp không phải điểm trừ đạo đức nếu trình bày trung thực. Nó chứng
minh kỹ năng dựng hệ thống thử nghiệm. Tuy nhiên, không được tính dữ liệu mô phỏng
thành người tham gia hoặc kết quả bảo tồn văn hóa đã đạt được.

Bằng chứng có giá trị hơn việc thêm hàng trăm test cùng kiểu:

- Một hoặc hai địa điểm có bản thu thật và nguồn gốc rõ, cùng lý do lựa chọn lớp âm.
- Một đợt thử nhỏ với người thật để quan sát UX, ghi lại thay đổi trước/sau; chưa
  cần gọi đó là nghiên cứu có sức mạnh thống kê hay khái quát ra toàn dân số.
- Nhật ký quyết định và thử nghiệm: cách ban đầu, thất bại cụ thể, phép đo, cách sửa.
- Phân định đóng góp của học sinh, cộng tác viên, thư viện và AI; khả năng tự giải
  thích và sửa một phần code quan trọng tại chỗ.
- Demo công khai hoạt động đúng, hướng dẫn ngắn để giám khảo thấy điểm khó trong
  vài phút, thay vì phải đọc toàn bộ BA và lộ trình.

Các câu hỏi phỏng vấn đề xuất:

1. Vì sao dùng seed? Nó đảm bảo tái lập ở mức lịch sự kiện hay ở mức byte của WAV?
2. Vì sao không coi coverage 99% là không có lỗi? Hãy dùng lỗi đổi địa điểm để minh họa.
3. Khi chọn A rồi B, request A về sau, state nào được phép cập nhật và vì sao?
4. Gain tuyến tính và chuẩn hóa có nén động ảnh hưởng gì tới quan hệ giữa các lớp âm?
5. Vì sao “audio đã ended” không chứng minh người dùng đã nghe toàn bộ?
6. Trong dự án, em tự thiết kế phần nào, AI giúp phần nào, và em đã bác bỏ đầu ra
   nào của AI bằng kiểm thử hoặc lý luận?

## Thứ tự chuẩn bị trước khi nộp hồ sơ

**Ưu tiên 1:** deploy bản mới và kiểm đúng URL công khai bằng một trình duyệt sạch.
**Ưu tiên 2:** có một lát cắt thu âm thật, nguồn gốc rõ và một vòng thử UX nhỏ.
**Ưu tiên 3:** chuẩn bị câu chuyện quá trình học và phân định phần học sinh tự làm,
phần thư viện, cộng tác viên và AI hỗ trợ.

Chưa cần đổi framework, thêm AI classifier, ứng dụng native hoặc làm backend lớn
chỉ để trông phức tạp. Thứ giúp hồ sơ mạnh lên là học sinh hiểu sâu những gì đã xây,
đưa được bằng chứng thử nghiệm và cho người khác dùng trơn tru.
