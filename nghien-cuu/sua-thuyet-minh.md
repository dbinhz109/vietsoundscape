# Sửa thuyết minh gốc — văn bản thay thế sẵn để dán

**Việc:** C7.1 của lộ trình · căn cứ **BA §16** (sáu lỗi) · **Soạn:** 21/09/2026 (máy) · **Trạng thái:** 🟡 nháp, NC duyệt từng đoạn rồi dán vào `BanDoAmThanh_VietNam.docx`
**Nguồn nguyên văn:** trích thẳng từ tệp `.docx` (92 đoạn), không chép lại từ trí nhớ.

Mỗi mục: **Hiện tại** (nguyên văn) → **Thay bằng** (dán được) → **Vì sao** (một câu, trỏ về BA). Chữ trong `⟨…⟩` là chỗ NC điền.

---

## 1. Đánh số lại — thiếu hẳn mục 9

**Hiện tại:** mục 8 "Kiến trúc và giải pháp kỹ thuật" nhảy thẳng sang mục 10 "Tính mới và tính sáng tạo", rồi 11 "Sản phẩm dự kiến". Mục 4 có câu *"xem Mục 9"* trỏ vào chỗ không tồn tại.

**Thay bằng:** đánh số liên tục 1 → 13 theo bảng dưới (thêm bốn mục mới ở §3 tệp này):

| Số cũ | Số mới | Tên mục |
|---|---|---|
| 1–8 | 1–8 | giữ nguyên |
| 10 | **9** | Tính mới và tính sáng tạo |
| 11 | **10** | Sản phẩm dự kiến |
| — | **11** | Kế hoạch thực hiện và phân công *(mới)* |
| — | **12** | Kinh phí và rủi ro *(mới)* |
| — | **13** | Tài liệu tham khảo *(mới)* |

Tham chiếu "xem Mục 9" ở mục 4 tự hết khi xoá câu H3 (§5 dưới).

## 2. Lĩnh vực

**Hiện tại (mục 1, hàng "Lĩnh vực"):** *"Phần mềm hệ thống — liên ngành với văn hóa và khoa học hành vi"*

**Thay bằng:** *"Công nghệ thông tin — **ứng dụng web và đa phương tiện**; liên ngành với văn hoá học (di sản phi vật thể) và khoa học hành vi (thực nghiệm cảm nhận)"*

**Vì sao:** "phần mềm hệ thống" là hệ điều hành, trình biên dịch, driver — không phải đề tài này. Xếp sai lĩnh vực là bị chấm bằng tiêu chí của lĩnh vực khác (BA §16.2). ⟨NC đối chiếu với **danh mục lĩnh vực của chính cuộc thi** trước khi chốt tên gọi.⟩

## 3. Ba mục thường bắt buộc mà thuyết minh thiếu

### 3.1 Mục 11 (mới) — Kế hoạch thực hiện và phân công

**Thay bằng:**

> **Kế hoạch theo mốc** (chi tiết: `LO-TRINH-VietSoundscape.md`):
>
> | Mốc | Nội dung | Kết quả kiểm được |
> |---|---|---|
> | M0 | Nền tảng: lược đồ dữ liệu, bộ máy Web Audio, đường ống xử lý âm, hồ sơ pháp lý, khảo sát kho mở | `npm test` xanh; `npm run validate` ĐẠT; 9 văn bản pháp lý |
> | M1 | Thực địa đợt 1 (Hà Nội, Cái Răng); tệp âm thật qua toàn bộ đường ống | ≥ 6 mẫu ⭐ xác minh tại chỗ; cổng G0 đóng |
> | M2 | Web công khai: bản đồ, phòng nghe, lọc/tìm, thẻ văn hoá, ghi công | Link công khai chạy trên điện thoại tầm trung |
> | M3 | Thực địa đợt 2 (Huế, Buôn Ê Đê) với thoả thuận cộng đồng; đủ 12 bản trộn | 4 địa điểm × ≥ 3 bản trộn |
> | M4 | Pilot 5–8 người; ký kế hoạch phân tích (đăng ký trước) | Tag `pre-registration-v1` |
> | M5 | Thu dữ liệu 96 người | Đủ cỡ mẫu tính trước |
> | M6 | Phân tích McNemar / Wilcoxon, cỡ hiệu ứng + CI | Báo cáo kết quả |
> | M7 | Công bố bộ dữ liệu (Zenodo, DOI); báo cáo; bảo vệ | DOI; bản demo ngoại tuyến |
>
> **Phân công:** ⟨tên⟩ — nghiên cứu, thiết kế thực nghiệm, phân tích (NC) · ⟨tên⟩ — âm thanh, thu âm, dữ liệu (ÂT) · ⟨tên⟩ — lập trình web (PM) · ⟨tên⟩ — văn hoá, khảo sát, liên hệ cộng đồng (VH). *Bốn vai có thể do ít người hơn kiêm.*

### 3.2 Mục 12 (mới) — Kinh phí và rủi ro

**Thay bằng:**

> **Dự toán** (⟨NC điền số⟩):
>
> | Khoản | Ước tính | Ghi chú |
> |---|---|---|
> | Thiết bị thu âm | ⟨0 đ hoặc …⟩ | Dùng điện thoại đã chấm bằng `check:recorder`; mua máy ghi chỉ khi điện thoại không đạt |
> | Đi lại Hà Nội (nội thành) | ⟨…⟩ | 2 buổi |
> | Cần Thơ: đi lại + thuê ghe 2 buổi | ⟨…⟩ | Hoặc cộng tác viên tại chỗ (phiếu 06) |
> | Huế, Buôn Ma Thuột (đợt 2) | ⟨…⟩ | Kèm quà/thù lao nghệ nhân theo thoả thuận cộng đồng |
> | In phiếu đồng thuận, biển thông báo | ⟨…⟩ | |
> | Hosting, tên miền | 0 đ | GitHub Pages |
> | Thù lao người tham gia thực nghiệm (96 người) | ⟨…⟩ | Nếu có |
>
> **Rủi ro chính và cách xử lý** (đầy đủ: BA §15, sổ quyết định):
>
> | Rủi ro | Xử lý |
> |---|---|
> | Không tuyển đủ 96 người | Ba lựa chọn chốt trước trong kế hoạch phân tích §2.4; không "thu tới khi có ý nghĩa" |
> | Vật liệu kho mở lệch địa lý (đã gặp: ứng viên "Hà Nội" thu ở Ấn Độ) | Dấu ấn và tín hiệu **bắt buộc** tự thu và xác minh tại chỗ; nền tải về ghi rõ `location_verified: false` |
> | Dữ liệu cá nhân nhạy cảm (giọng người, cồng chiêng, tôn giáo) | Phiếu 01/02, thông báo ghi âm, quyền rút; máy tự bắt khai thiếu |
> | Điện thoại tầm trung không tải nổi 5 lớp | Cổng G0 đo trước; phương án nén Opus, giảm lớp |
> | Dấu ấn đã mất (tàu điện Hà Nội) | Mức `lost`, hiển thị như lớp đã tắt — là luận điểm, không phải lỗ hổng |

### 3.3 Mục 13 (mới) — Tài liệu tham khảo

**Thay bằng** (⟨NC kiểm lại năm/ấn bản/trang trước khi nộp⟩):

> 1. Schafer, R. M. (1994). *The Soundscape: Our Sonic Environment and the Tuning of the World*. Destiny Books. (Nguyên bản: *The Tuning of the World*, 1977.)
> 2. Krause, B. (2012). *The Great Animal Orchestra: Finding the Origins of Music in the World's Wild Places*. Little, Brown.
> 3. Pijanowski, B. C., Villanueva-Rivera, L. J., Dumyahn, S. L., Farina, A., Krause, B. L., Napoletano, B. M., Gage, S. H., & Pieretti, N. (2011). Soundscape ecology: The science of sound in the landscape. *BioScience*, 61(3), 203–216.
> 4. ISO 12913-1:2014. *Acoustics — Soundscape — Part 1: Definition and conceptual framework*.
> 5. ISO/TS 12913-2:2018. *Acoustics — Soundscape — Part 2: Data collection and reporting requirements*.
> 6. ISO/TS 12913-3:2019. *Acoustics — Soundscape — Part 3: Data analysis*.
> 7. Axelsson, Ö., Nilsson, M. E., & Berglund, B. (2010). A principal components model of soundscape perception. *Journal of the Acoustical Society of America*, 128(5), 2836–2846.
> 8. EBU R 128. *Loudness normalisation and permitted maximum level of audio signals*. European Broadcasting Union.
> 9. McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. *Psychometrika*, 12(2), 153–157.
> 10. Wilcoxon, F. (1945). Individual comparisons by ranking methods. *Biometrics Bulletin*, 1(6), 80–83.
> 11. W3C. *Web Audio API*. W3C Recommendation. https://www.w3.org/TR/webaudio/
> 12. Radio Aporee — Maps. https://aporee.org/maps/ · Cities and Memory. https://citiesandmemory.com/ · British Library Sounds. https://sounds.bl.uk/
> 13. Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15.
> 14. Nghị định 356/2025/NĐ-CP quy định chi tiết một số điều của Luật Bảo vệ dữ liệu cá nhân.
> 15. Luật Di sản văn hoá 2024.
> 16. Luật Sở hữu trí tuệ (sửa đổi, bổ sung 2022), Điều 29 — quyền nhân thân của người biểu diễn.

**Vì sao:** thuyết minh nêu Schafer, Krause, ISO, ba dự án quốc tế trong nội dung mà không có mục trích dẫn (BA §16.3).

## 4. Thu hẹp phát biểu "chưa có bản đồ âm thanh cho Việt Nam"

**Hiện tại (mục 2, vấn đề 2):** *"Chưa có kho lưu trữ âm thanh có hệ thống cho Việt Nam gắn với bản đồ địa lý."*
**Hiện tại (mục 10 cũ, gạch đầu dòng 3):** *"Theo tìm hiểu của nhóm, chưa có bản đồ âm thanh có hệ thống theo vùng miền dành riêng cho Việt Nam với công cụ mô phỏng tương tác."*

**Thay bằng (mục 2):** *"Bản ghi âm thanh Việt Nam hiện nằm rải rác trên các nền tảng quốc tế (Radio Aporee có một số điểm ghi lẻ tẻ; Cities and Memory hướng phối lại nghệ thuật; British Library Sounds có biên mục nhưng không gắn bản đồ tương tác), không được phân loại theo khung khoa học thống nhất, không định vị theo vùng miền, và không có công cụ mô phỏng phân lớp."*

**Thay bằng (mục 9 mới):** *"Theo khảo sát của nhóm trên ba nền tảng bản đồ/kho âm thanh lớn (Radio Aporee, Cities and Memory, British Library Sounds — chi tiết ở tài liệu phân tích §1.1), chưa nền tảng nào **đồng thời** có: phân loại theo Krause × Schafer, bộ trộn phân lớp tương tác, và kiểm chứng bằng thực nghiệm với người nghe, dành riêng cho các vùng miền Việt Nam."*

**Vì sao:** "chưa có" tuyệt đối là phát biểu không bảo vệ được; khoảng trống thật là **tổ hợp** ba thứ (BA §1.1, Q-01).

## 5. Xoá câu H3 (AI)

**Hiện tại (mục 4, đoạn cuối):** *"(Tùy chọn) Có thể mở rộng bằng giả thuyết H3 về khả năng nhận diện vùng miền của mô hình AI và việc so sánh AI với con người – xem Mục 9."*

**Thay bằng:** **xoá hẳn**, không để lại dưới dạng "hướng phát triển". Mục 4 sau khi xoá kết thúc ở H2.

**Vì sao:** hạng mục AI đã bỏ (BA §2). Một câu AI bỏ lửng mời hội đồng hỏi về cỡ dữ liệu huấn luyện và cách chia train/test — tự mở điểm yếu cho phần không làm (BA §16.5).

## 6. Sửa đóng góp ở mục 5 và mục 9 (cũ 10) cho khớp mô hình lai

### 6.1 Mục 5 — mục tiêu cụ thể, gạch đầu dòng 1

**Hiện tại:** *"Xây dựng thư viện âm thanh số có phân loại khoa học (theo vùng miền × nhóm nguồn âm × chức năng) cho 3–5 địa điểm/vùng đại diện."*

**Thay bằng:** *"Xây dựng thư viện âm thanh số có phân loại khoa học (vùng miền × nhóm nguồn phát Krause × vai Schafer) cho **4 địa điểm** đại diện, theo **mô hình lai**: âm nền (geophony, ồn giao thông, rì rầm chợ) lấy từ kho có giấy phép mở CC0/CC BY và ghi rõ nguồn gốc công khai; **dấu ấn âm thanh và tín hiệu âm** — phần làm nên bản sắc nơi chốn — **do nhóm tự thu và xác minh tại chỗ** (mục tiêu ≥ 12 mẫu), vì kho quốc tế gần như không có bản Việt Nam đáng tin."*

### 6.2 Mục 5 — thêm gạch đầu dòng về đăng ký trước

**Hiện tại (gạch đầu dòng 4):** *"Đánh giá hiệu quả của nền tảng qua khảo sát người dùng (nhận diện vùng miền, mức độ gợi cảm xúc, tính hữu dụng)."*

**Thay bằng:** *"Kiểm chứng H1 và H2 bằng **thực nghiệm trong-người ba điều kiện** (phân lớp đúng vùng · âm rời rạc · phân lớp sai vùng), cỡ mẫu tính trước (96 người), kế hoạch phân tích đăng ký trước, kiểm định McNemar và Wilcoxon signed-rank, báo cáo cỡ hiệu ứng kèm khoảng tin cậy."*

### 6.3 Mục 7 — "Phân tích dữ liệu"

**Hiện tại:** *"Phân tích dữ liệu: thống kê mô tả, so sánh tỉ lệ/điểm trung bình giữa hai nhóm để kiểm chứng giả thuyết."*

**Thay bằng:** *"Phân tích dữ liệu: thiết kế trong-người, mỗi người nghe cả ba điều kiện theo hình vuông Latin cân bằng. H1 (nhị phân) kiểm bằng **McNemar**; H2 (thang ISO 12913-2, thứ bậc) kiểm bằng **Wilcoxon signed-rank**; báo cáo cỡ hiệu ứng (chênh tỉ lệ, tỉ số odds; rank-biserial, Hodges–Lehmann) kèm khoảng tin cậy 95%. Tiêu chí loại người, quy tắc dữ liệu thiếu và cỡ mẫu **chốt trước** khi thu (kế hoạch phân tích đăng ký trước, có tag trong kho mã)."*

### 6.4 Mục 7 — "Thực nghiệm đánh giá"

**Hiện tại:** *"Thực nghiệm đánh giá: bài kiểm tra nhận diện (nghe âm đơn lẻ vs soundscape mô phỏng, đoán vùng miền, so sánh tỉ lệ đúng); khảo sát cảm xúc/trải nghiệm bằng thang Likert 5 mức."*

**Thay bằng:** *"Thực nghiệm đánh giá: mỗi người nghe 4 đoạn (một mỗi vùng) ở ba điều kiện — soundscape phân lớp đúng vùng, âm rời rạc, và **soundscape phân lớp sai vùng** (đối chứng cho chữ 'có chủ đích'); ba điều kiện cân bằng thời lượng, số sự kiện âm và mức LUFS. Đoán vùng từ danh sách 8 địa danh (4 thật + 4 phương án nhiễu cùng vùng). Cảm nhận đo bằng **8 thuộc tính của ISO/TS 12913-2 Phương pháp A**, không tự soạn thang."*

### 6.5 Mục 6 — phạm vi: bốn địa điểm đã chốt

**Hiện tại:** *"Chợ nổi / miệt vườn đồng bằng sông Cửu Long; Làng chài / bãi biển miền Trung; Không gian cao nguyên / bản làng Tây Bắc hoặc Tây Nguyên; (Tùy chọn) Một địa điểm gần nơi nghiên cứu…"*

**Thay bằng:** *"Bốn địa điểm đã chốt (tiêu chí và lý do: tài liệu vật liệu §2): **Phố cổ Hà Nội** (đô thị Bắc Bộ); **Chợ nổi Cái Răng**, Cần Thơ (sông nước Tây Nam Bộ); **Huế — chùa Thiên Mụ và sông Hương** (di sản, tôn giáo, Trung Bộ); **Buôn Ê Đê, Buôn Ma Thuột** (cồng chiêng, rừng, Tây Nguyên)."*

**Vì sao:** thuyết minh để mở "3–5 địa điểm, ví dụ…"; dữ liệu và bản trộn đã dựng cho đúng bốn nơi này.

### 6.6 Mục 8 — công nghệ đã chốt

Sửa ba hàng trong bảng: *"HTML/CSS/JavaScript, có thể dùng React"* → *"HTML/CSS/JavaScript thuần, Vite để gói; không khung giao diện"* · *"Leaflet hoặc Mapbox"* → *"Leaflet, đường viền vector Natural Earth, không dùng tile bên thứ ba"* · *"JSON tĩnh hoặc Firebase / Supabase"* → *"JSON tĩnh trong kho mã, kiểm bằng lược đồ (`npm run validate`)"* · *"Định dạng nén .mp3/.ogg"* → *"Opus 72k / 144k, chuẩn hoá −23 LUFS (EBU R128), điểm loop tính sẵn"* · *"GitHub Pages / Vercel / Netlify"* → *"GitHub Pages (đã triển khai: https://dbinhz109.github.io/vietsoundscape/)"*.

### 6.7 Mục 9 mới (cũ 10) — tính mới

**Hiện tại (gạch đầu dòng 1):** *"Kết hợp bảo tồn di sản văn hóa phi vật thể với công nghệ web audio – hướng tiếp cận liên ngành ít gặp."*

**Thay bằng:** *"Ba đóng góp không phụ thuộc vào nguồn vật liệu: (1) **hệ thống hoá** âm thanh vùng miền Việt Nam theo khung Krause × Schafer với metadata đủ để tái lập (nguồn gốc, giấy phép, mã băm, thời điểm trong ngày, mức mai một); (2) **mô phỏng phân lớp có tái lập** — bản trộn là dữ liệu có seed, kết xuất lại cho ra đúng từng byte; (3) **kiểm chứng bằng thực nghiệm đăng ký trước** với điều kiện đối chứng 'phân lớp sai vùng'. Cộng thêm phần **tự thu và xác minh tại chỗ** các dấu ấn âm thanh mà kho quốc tế không có."*

**Hiện tại (gạch đầu dòng 4):** *"Giá trị thực tiễn: giáo dục di sản, quảng bá du lịch, hỗ trợ người khiếm thị 'hình dung' nơi chốn qua âm thanh."*

**Thay bằng:** *"Giá trị thực tiễn: giáo dục di sản, quảng bá du lịch (giấy phép CC BY, không NC, để dùng lại được), và giao diện dùng được không cần bản đồ / không cần nhìn (danh sách văn bản, thanh trượt đọc được, thẻ văn hoá nối trình đọc màn hình) ⟨**chỉ giữ cụm "hỗ trợ người khiếm thị" nếu đã kiểm với người dùng thật hoặc NVDA/VoiceOver trước ngày nộp — lộ trình B6.2**⟩."*

### 6.8 Mục 10 mới (cũ 11) — sản phẩm dự kiến

**Hiện tại:** *"Website … (có link truy cập công khai). Thư viện âm thanh đã phân loại cho 3–5 địa điểm (mục tiêu ≥ 30–50 mẫu âm). Bộ dữ liệu khảo sát người dùng và kết quả phân tích kiểm chứng giả thuyết."*

**Thay bằng:** *"(1) Website công khai https://dbinhz109.github.io/vietsoundscape/ — bản đồ, phòng nghe phân lớp, lọc/tìm theo 5 tiêu chí, thẻ văn hoá, ghi công và trích dẫn (BibTeX) cho từng mẫu; mã nguồn MIT, mở. (2) Thư viện **≥ 32 mẫu âm** cho 4 địa điểm, 100% có nguồn gốc và giấy phép, **≥ 12 mẫu tự thu xác minh tại chỗ**; metadata CC0. (3) Bộ kích thích thực nghiệm 12 bản trộn, tái lập bằng mã băm. (4) Kế hoạch phân tích đăng ký trước, bộ dữ liệu lượt nghe và kết quả kiểm định H1/H2 kèm cỡ hiệu ứng. (5) Bộ dữ liệu đóng gói nộp Zenodo lấy DOI (bước cuối, sau khi công khai hợp pháp)."*

---

## Kiểm sau khi dán

- [ ] Không còn chữ "Mục 9" trỏ vào chỗ trống
- [ ] Không còn chữ "AI", "H3", "mô hình" trong toàn văn
- [ ] Không còn "3–5 địa điểm" — chỉ có "4"
- [ ] Không còn "thống kê mô tả" đứng một mình
- [ ] Mọi tên riêng trong mục 13 khớp với mục nội dung nhắc tới
- [ ] Cụm "người khiếm thị": đã kiểm → giữ; chưa → đã xoá
