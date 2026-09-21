# Bản đồ âm thanh Việt Nam — báo cáo nghiên cứu

**Trạng thái:** 🟡 khung · **Mục 1–4 viết xong** (không phụ thuộc dữ liệu) · **Mục 5–7 chờ dữ liệu**
**Lập:** 21/09/2026 · **Việc:** C7.1 của lộ trình

> **Vì sao viết Phương pháp trước khi có dữ liệu.** Đây là nghiên cứu **đăng ký trước**: giả thuyết, phép kiểm, cỡ mẫu và tiêu chí loại đều chốt trong `ke-hoach-phan-tich.md` *trước* lượt nghe đầu tiên. Mọi thứ ở mục 3 và 4 vì thế đã cố định — viết bây giờ không phải đoán trước, mà là chép lại quyết định đã ghi. Viết sau khi thấy dữ liệu mới là chỗ dễ vô tình kể lại câu chuyện cho khớp kết quả.
>
> Chỗ `⟨…⟩` là số liệu chỉ điền được sau khi thu. Chỗ `【…】` là đoạn phải viết sau khi có kết quả, kèm sẵn cấu trúc và những gì **bắt buộc** phải báo cáo dù kết quả ra sao.

---

## Tóm tắt

⟨Viết sau cùng, 200–250 từ, theo thứ tự: vấn đề → khoảng trống → cách làm → kết quả chính kèm cỡ hiệu ứng → ý nghĩa. Không viết "kết quả cho thấy có ý nghĩa thống kê" mà không kèm cỡ hiệu ứng.⟩

**Từ khoá:** cảnh quan âm thanh, sinh thái học âm thanh, di sản văn hoá phi vật thể, Web Audio, nhận diện vùng miền, ISO 12913.

## 1. Đặt vấn đề

Mỗi vùng miền Việt Nam có một chân dung âm thanh riêng: tiếng rao hàng rong phố cổ Hà Nội, tiếng máy đuôi tôm và tiếng rao trên chợ nổi Cửu Long, tiếng đại hồng chung và ve trưa hè ở Huế, tiếng cồng chiêng và gió rừng Tây Nguyên. Những âm này là một phần di sản văn hoá phi vật thể, và chúng mai một nhanh hơn di sản vật thể vì không ai kịp nhận ra chúng đang mất.

Ba vấn đề cụ thể:

1. **Mất nhanh, không ai đo được tốc độ.** Tiếng tàu điện leng keng Hà Nội — dấu ấn âm thanh mà chính thuyết minh đề tài nêu làm ví dụ — đã không còn tồn tại từ năm 1991. Không có bản ghi có hệ thống nào để đối chiếu.
2. **Bản ghi Việt Nam nằm rải rác, không phân loại.** Radio Aporee có vài điểm ghi lẻ; Cities and Memory hướng phối lại nghệ thuật; British Library Sounds có biên mục nhưng không gắn bản đồ và không mô phỏng. Không nền tảng nào đồng thời có phân loại khoa học, bộ trộn phân lớp, và kiểm chứng thực nghiệm cho vùng miền Việt Nam.
3. **"Nghe" một vùng đất chưa được khai thác như một hình thức giới thiệu văn hoá**, trong khi Web Audio API cho phép tái tạo ngay trên trình duyệt.

**Câu hỏi nghiên cứu.** Có thể xây dựng một nền tảng web thu thập, phân loại và mô phỏng không gian âm thanh vùng miền Việt Nam không? Và không gian âm thanh **mô phỏng phân lớp** có giúp người nghe nhận diện đúng vùng miền tốt hơn nghe các âm rời rạc không?

**Giả thuyết.**

- **H1.** Soundscape mô phỏng bằng cách phân lớp có chủ đích các nhóm âm theo Krause (geophony + biophony + anthrophony) giúp người nghe nhận diện đúng vùng miền với tỉ lệ cao hơn có ý nghĩa so với nghe các âm đơn lẻ.
- **H2.** Người nghe cảm nhận bản phân lớp khác biệt so với bản âm rời, đo trên hai chiều *dễ chịu* và *sôi động* của ISO/TS 12913-3.

## 2. Cơ sở khoa học

**Phân loại theo chức năng — Schafer.** R. Murray Schafer chia âm trong một cảnh quan âm thanh thành **âm nền** (keynote, nghe mà không để ý, định hình cảm giác về nơi chốn), **tín hiệu âm** (sound signal, nổi lên có chủ ý, được chú ý), và **dấu ấn âm thanh** (soundmark, mang bản sắc riêng của một nơi, đáng được bảo vệ như một mốc di sản).

**Phân loại theo nguồn phát — Krause.** Bernie Krause chia theo nguồn: **geophony** (gió, nước, mưa), **biophony** (chim, ve, ếch), **anthrophony** (giao thông, chợ búa, tôn giáo, âm nhạc).

Hai khung này **trực giao**: một tiếng chuông chùa là anthrophony theo nguồn và soundmark theo chức năng. Đề tài dùng cả hai làm hai chiều phân loại độc lập, và chính tính trực giao đó cho phép bộ trộn có ba bus âm lượng theo Krause trong khi hành vi phát (lặp hay phát một lần) quyết định theo Schafer.

**Đo cảm nhận — ISO 12913.** ISO/TS 12913-2 Phương pháp A dùng 8 thuộc tính (dễ chịu, hỗn loạn, sống động, ít chuyện xảy ra, yên bình, gây khó chịu, nhiều chuyện xảy ra, đơn điệu) trên thang đồng ý 5 mức; ISO/TS 12913-3 cho công thức suy ra hai chiều trực giao *pleasantness* và *eventfulness*. Đề tài dùng nguyên bộ này thay vì tự soạn thang — một thang tự chế không so sánh được với nghiên cứu khác và không có bằng chứng về tính giá trị.

**Khoảng trống.** Ba nền tảng quốc tế đã nêu đều thiếu ít nhất một trong ba: phân loại theo khung khoa học thống nhất, bộ trộn phân lớp tương tác, kiểm chứng thực nghiệm với người nghe. Đề tài lấp vào **tổ hợp** cả ba, giới hạn ở vùng miền Việt Nam.

## 3. Phương pháp — hệ thống

### 3.1 Nguồn vật liệu: mô hình lai

Chia theo **vai Schafer**, không theo sự thuận tiện:

| Vai | Nguồn | Lý do |
|---|---|---|
| Âm nền | Kho có giấy phép mở (CC0, CC BY) | Ít mang bản sắc vùng, sẵn bản dài chất lượng tốt, chiếm phần lớn thời lượng nghe |
| Tín hiệu âm và dấu ấn | **Nhóm tự thu, xác minh tại chỗ** | Đây là phần làm nên bản sắc nơi chốn, và là phần kho quốc tế gần như không có bản Việt Nam đáng tin |

Cách chia này khai thác việc **hai kiểu lỗi bù trừ cho nhau**: bẫy của điện thoại (tự động chỉnh âm lượng làm dâng nền ồn, khử ồn ăn mất ambience) phá nặng nhất đúng loại âm nền lặng và dài; bẫy của vật liệu tải về (không xác minh được nơi chốn) phá nặng nhất đúng loại âm mang bản sắc.

Mọi mẫu tải về đều mang `location_verified: false` — một tệp gắn nhãn "chợ nổi Việt Nam" trên kho quốc tế có thể thu ở nơi khác và không có cách nào kiểm chứng. Chỉ mẫu nhóm tự thu mới được khai đã xác minh, và bộ kiểm dữ liệu chặn cứng việc khai ngược lại.

### 3.2 Bốn địa điểm

| Địa điểm | Vùng | Dấu ấn chính |
|---|---|---|
| Phố cổ Hà Nội (Hàng Bạc, Hàng Bồ, Đồng Xuân) | Bắc Bộ | Tiếng gõ búa thợ bạc; tiếng rao đêm |
| Chợ nổi Cái Răng, Cần Thơ | Đồng bằng sông Cửu Long | Máy đuôi tôm; tiếng rao trên ghe |
| Huế — chùa Thiên Mụ và sông Hương | Trung Bộ | Đại hồng chung; ca Huế |
| Buôn Ê Đê, Buôn Ma Thuột | Tây Nguyên | Cồng chiêng; đàn t'rưng |

### 3.3 Siêu dữ liệu và tính tái lập

Mỗi mẫu âm mang: toạ độ, thời gian có múi giờ, thời điểm trong ngày, thiết bị, thông số kỹ thuật, độ to đo theo EBU R128, giấy phép và chủ quyền, trạng thái đồng thuận, nguồn gốc, mã băm SHA-256, nhật ký chỉnh sửa, mức mai một theo từ vựng có kiểm soát. Các ràng buộc này **được máy cưỡng chế**, không dựa vào kỷ luật cá nhân: một mẫu có giọng người mà không khai thuộc nhóm dữ liệu sinh trắc học sẽ làm bộ kiểm dữ liệu báo lỗi.

Chuẩn hoá độ to dùng `loudnorm` để **đo**, rồi áp một gain tuyến tính duy nhất về −23 LUFS. Không dùng chế độ chuẩn hoá động của nó: nén động làm biến dạng đúng thứ cần bảo tồn, là quan hệ độ to giữa âm nền lặng và tín hiệu âm nổi lên.

**Bản trộn là dữ liệu, không phải trạng thái giao diện.** Mỗi bản trộn khai danh sách lớp, vị trí thanh trượt, vị trí trái phải, và một **seed** cho lịch phát của các lớp tín hiệu. Cùng seed cho cùng chuỗi thời điểm phát, nên hai người nghe cùng một bản trộn nghe đúng cùng một thứ, và kết xuất lại cho ra **cùng mã băm**.

### 3.4 Kiến trúc

JavaScript thuần, không khung giao diện; Vite chỉ để gói. Bản đồ dùng Leaflet với đường viền vector từ Natural Earth, **không dùng tile raster** — không cần khoá API, không vướng chính sách sử dụng tile, và tải tức thì. Bộ máy âm thanh nằm trong module độc lập không đụng DOM, nên đóng gói lại thành ứng dụng di động sau này không phải viết lại. Toàn bộ chạy tĩnh trên GitHub Pages, có service worker nên dùng được khi mất mạng.

## 4. Phương pháp — thực nghiệm

### 4.1 Thiết kế

**Trong-người**, mỗi người nghe cả ba điều kiện. Thiết kế này kiểm soát được khác biệt cá nhân về thính lực, thiết bị nghe và mức quen thuộc với từng vùng — những thứ mà thiết kế giữa-người phải đánh đổi bằng cỡ mẫu lớn hơn nhiều.

**Ba điều kiện:**

| Điều kiện | Nội dung |
|---|---|
| `layered` | Soundscape phân lớp **đúng vùng miền** |
| `isolated` | Các âm rời rạc, không phân lớp |
| `scrambled` | Phân lớp **sai vùng miền** — lớp lấy từ nhiều vùng khác nhau |

Điều kiện thứ ba là phần thuyết minh gốc thiếu, và nó mới là phép thử đúng cho chữ **"có chủ đích"** trong H1. Không có nó thì `layered` thắng `isolated` chỉ chứng minh "nhiều thông tin hơn thì đoán đúng hơn" — một kết luận tầm thường, không phải điều H1 phát biểu.

### 4.2 Khử yếu tố gây nhiễu

Ba điều kiện được cân bằng **tổng thời lượng**, **tổng số sự kiện âm riêng biệt**, và **mức LUFS**. Số sự kiện đếm theo lịch phát thật do bộ sinh có seed tạo ra, không ước lượng. Ràng buộc này được kiểm tự động trước khi kết xuất; bản trộn nào lệch quá ngưỡng thì không được dùng làm kích thích.

Mỗi vùng có **≥ 3 bản trộn khác nhau** (12 bản tổng), và phiên nghe xoay vòng bản trộn theo mã người tham gia. Không có ràng buộc này thì một kết quả dương tính có thể chỉ phản ánh đúng một bản trộn cụ thể chứ không phản ánh vùng miền.

### 4.3 Nhiệm vụ và đo lường

Mỗi người nghe **4 đoạn** (một mỗi vùng), mỗi đoạn khoảng 60 giây, thứ tự điều kiện theo hình vuông Latin cân bằng.

Sau mỗi đoạn:

1. **Đoán nơi thu** từ danh sách **8 lựa chọn** — 4 vùng thật cộng 4 phương án nhiễu là địa danh thật, quen thuộc, mỗi vùng một nơi cùng vùng (Sa Pa, Hội An, Đà Lạt, Phú Quốc). Danh sách dài hơn số đoạn, và người tham gia được báo trước điều đó.
2. **Chấm 8 thuộc tính ISO** trên thang đồng ý 5 mức. Log ghi điểm **thô**; hai chiều *dễ chịu* và *sôi động* suy ra lúc phân tích theo công thức ISO/TS 12913-3.

> **Một lỗi thiết kế nhóm tự tìm ra và đã sửa.** Bản đầu cho danh sách trả lời đúng bằng 4 vùng sẽ nghe, nên đến lượt thứ tư người tham gia chỉ còn một lựa chọn và đúng 100% vì loại trừ. Phương án nhiễu xoá bỏ lỗi này. Ô thật và ô nhiễu dựng giống hệt nhau trong mã trang để không phân biệt được bằng cách xem nguồn.

### 4.4 Cỡ mẫu

**96 người**, bội của 12 để tròn vòng cân bằng; sàn 84. Con số tính bằng **mô phỏng** theo đúng thiết kế, không dùng công thức sách: công thức Connor cho 77 người ở kịch bản vừa phải, mô phỏng cho **85** — thiếu 5 đến 8 điểm lực. Với H2, d = 0,3 cần 92 người.

Nếu không tuyển đủ, ba phương án đã chốt **trước** khi thu: tăng số lượt mỗi người từ 4 lên 8; chấp nhận lực 78% với 80 người và khai báo thẳng; hoặc hạ H1 xuống giả thuyết thăm dò, báo cáo cỡ hiệu ứng kèm khoảng tin cậy thay vì kết luận có hoặc không. Điều **không** làm: thu thêm cho tới khi p < 0,05.

### 4.5 Phân tích

| Giả thuyết | Phép kiểm | Cỡ hiệu ứng báo kèm |
|---|---|---|
| H1 (`layered` vs `isolated`) | McNemar, tự chuyển sang bản chính xác khi số cặp bất đồng < 25 | Chênh tỉ lệ kèm khoảng tin cậy 95%; tỉ số odds |
| Tính mạch lạc (`layered` vs `scrambled`) | như trên | như trên |
| H2 (hai chiều ISO) | Wilcoxon dấu-hạng | Rank-biserial; Hodges–Lehmann kèm khoảng tin cậy |

α = 0,05 hai phía. Sáu phép kiểm chính; cách xử lý vấn đề nhiều phép kiểm đã chốt trước trong kế hoạch phân tích.

**Tiêu chí loại, chốt trước và không dựa trên kết quả:** phiên không hoàn tất; chấm y hệt một giá trị cho cả 8 thuộc tính ở cả 4 lượt; tự khai có vấn đề thính lực hoặc nghe loa ngoài nơi ồn. Số người bị loại và lý do **phải báo cáo, kể cả khi bằng 0**.

Bộ công cụ phân tích cài bằng JavaScript trong cùng kho mã, đối chiếu độc lập với Python đến 12 chữ số có nghĩa và với R trên dữ liệu giả lập 48 người: 6 trên 6 giá trị p trùng đến 4 chữ số.

### 4.6 Đạo đức và pháp lý

Đồng thuận có thông tin trước mỗi phiên. Log chỉ mang mã số, không mang tên hay liên hệ; bảng đối chiếu mã và người giữ riêng trên máy nhóm để thực hiện quyền xoá, và xoá sau khi báo cáo nộp.

Với vật liệu âm: mẫu có giọng người nhận dạng được cần phiếu đồng thuận cá nhân; **biểu đạt văn hoá truyền thống** (cồng chiêng, ca Huế) cần thoả thuận với **cộng đồng chủ thể**, trong đó cộng đồng tự quyết giấy phép công bố, được ghi công, có quyền yêu cầu không công bố một phần, và có quyền rút bất cứ lúc nào. Căn cứ: Luật Di sản văn hoá 45/2024, Luật Sở hữu trí tuệ Điều 29 về quyền nhân thân không chuyển nhượng được của người biểu diễn, Luật Bảo vệ dữ liệu cá nhân 91/2025 và Nghị định 356/2025.

## 5. Kết quả

【Chỉ viết sau khi khoá dữ liệu. **Bắt buộc báo cáo dù kết quả ra sao:** số người mời, số hoàn tất, số bị loại kèm lý do từng nhóm; thiết bị nghe và tỉ lệ dùng tai nghe; tỉ lệ đúng từng điều kiện kèm khoảng tin cậy; **cả sáu** giá trị p đã định trước, không chỉ những cái có ý nghĩa; cỡ hiệu ứng kèm khoảng tin cậy ngay cạnh mỗi p.】

**5.1 Người tham gia.** ⟨N mời, N hoàn tất, N loại — bảng lý do⟩

**5.2 H1 — nhận diện vùng miền.** ⟨Bảng 2×2 cặp; McNemar; chênh tỉ lệ kèm CI⟩

**5.3 Tính mạch lạc vùng miền.** ⟨`layered` vs `scrambled`, cùng định dạng⟩

**5.4 H2 — cảm nhận.** ⟨Hai chiều ISO, Wilcoxon, rank-biserial kèm CI⟩

**5.5 Khám phá thêm.** ⟨Nếu có. Ghi rõ đây là **thăm dò**, không phải kiểm định đã đăng ký trước.⟩

## 6. Bàn luận

【Cấu trúc bắt buộc, viết sau khi có mục 5.】

**6.1 Trả lời hai giả thuyết.** Bốn khả năng, mỗi khả năng có một kết luận khác nhau và **không** khả năng nào được viết thành "gần có ý nghĩa":

| `layered` vs `isolated` | `layered` vs `scrambled` | Kết luận đúng |
|---|---|---|
| dương | dương | Ủng hộ H1 **kể cả phần "có chủ đích"** |
| dương | không | Phân lớp giúp ích, nhưng **do lượng thông tin**, không do mạch lạc vùng miền. Phải nói thẳng |
| không | dương | Bất thường — kiểm lại việc cân bằng kích thích trước khi diễn giải |
| không | không | Không ủng hộ H1 ở cỡ mẫu này. Báo cáo cỡ hiệu ứng và khoảng tin cậy |

**6.2 Hạn chế.** ⟨Bắt buộc nêu, tối thiểu:⟩ vật liệu nền lấy từ kho quốc tế nên không xác minh được nơi chốn; bốn địa điểm không đại diện cho toàn bộ vùng miền; người tham gia phần lớn là sinh viên nên mức quen thuộc với từng vùng lệch; thiết bị nghe không kiểm soát được; điều kiện `isolated` là một thao tác hoá cụ thể trong nhiều cách có thể.

**6.3 Ý nghĩa.** ⟨Bảo tồn, giáo dục di sản, và phương pháp: bộ dữ liệu cùng mã nguồn mở cho phép nghiên cứu khác tái lập và mở rộng sang vùng khác.⟩

## 7. Kết luận

⟨3 đến 5 câu. Nói được gì, chưa nói được gì, bước tiếp theo.⟩

## Lời cảm ơn

⟨Cộng đồng chủ thể — ghi tên buôn, câu lạc bộ, nhà chùa theo đúng thoả thuận; người thu âm cộng tác; người tải lên các bản kho mở đã dùng; giảng viên hướng dẫn; người tham gia thực nghiệm.⟩

## Tuyên bố về dữ liệu và mã nguồn

Mã nguồn theo giấy phép MIT; siêu dữ liệu, bản trộn và dữ liệu địa điểm theo CC0 1.0; mẫu âm nhóm tự thu theo CC BY 4.0; mẫu tải từ kho giữ nguyên giấy phép nguồn; biểu đạt văn hoá theo giấy phép do cộng đồng chủ thể quyết. Kho mã và bộ dữ liệu: `https://github.com/dbinhz109/vietsoundscape`. Bản web: `https://dbinhz109.github.io/vietsoundscape/`. Kế hoạch phân tích đăng ký trước: thẻ `pre-registration-v1` ⟨điền ngày ký⟩.

## Tài liệu tham khảo

⟨Danh mục 16 mục đã soạn ở `sua-thuyet-minh.md` §3.3 — kiểm lại năm, ấn bản và số trang trước khi nộp.⟩

---

## Việc còn lại của báo cáo này

| Mục | Trạng thái | Mở khoá bởi |
|---|---|---|
| Tóm tắt | chờ | mục 5, 6 |
| 1 Đặt vấn đề · 2 Cơ sở khoa học | **xong** | — |
| 3 Phương pháp hệ thống | **xong**, còn số mẫu thật | thực địa đợt 1 và 2 |
| 4 Phương pháp thực nghiệm | **xong** | — (đã cố định do đăng ký trước) |
| 5 Kết quả | khung | khoá dữ liệu 96 người |
| 6 Bàn luận | khung + bảng bốn khả năng | mục 5 |
| 7 Kết luận · Lời cảm ơn | chờ | mục 6, thoả thuận cộng đồng |
| Tài liệu tham khảo | có danh mục, chờ kiểm | — |
