# Câu hỏi phản biện dự kiến — và câu trả lời có bằng chứng

**Việc:** C7.2 (chuẩn bị bảo vệ) · **Soạn:** 21/09/2026 (máy, từ BA / sổ quyết định / kế hoạch phân tích) · **Trạng thái:** 🟡 bản nháp, NC đọc lại và tập nói
**Cách dùng:** mỗi câu có *trả lời 30 giây* (nói), *bằng chứng* (mở được ngay trên máy hoặc web), và *điểm yếu thật* (nói trước, đừng để bị hỏi). Không câu nào được trả lời bằng "sẽ làm" nếu có thể trả lời bằng "đã làm, đây".

---

## 1. "Phần lớn âm là tải từ kho quốc tế. Vậy nhóm tự thu được gì? Đóng góp ở đâu?"

**Trả lời 30 giây.** Nhóm chia theo *vai* của âm, không theo sự thuận tiện: nền (gió, mưa, ồn giao thông) tải từ kho mở vì ít mang bản sắc vùng; **dấu ấn và tín hiệu** — tiếng gõ búa thợ bạc Hàng Bạc, máy đuôi tôm Cái Răng, chuông Thiên Mụ, cồng chiêng Ê Đê — **nhóm tự thu và xác minh tại chỗ**, vì kho quốc tế gần như không có bản Việt Nam đáng tin. Đóng góp chính không nằm ở số tệp mà ở ba thứ không phụ thuộc nguồn vật liệu: **hệ thống hoá** theo Krause × Schafer, **mô phỏng phân lớp** có tái lập, và **kiểm chứng bằng thực nghiệm** có đăng ký trước.

**Bằng chứng.** `BA-VietSoundscape.md` §5.4 (mô hình lai, lý do hai kiểu lỗi bù trừ) · `data/clips.json`: 32 mẫu, **15 `field_recording`**, **12 mẫu ⭐ `must_verify_on_site`** · trường `provenance` hiển thị công khai trên từng lớp âm (thẻ "Nguồn, giấy phép và trích dẫn" trong phòng nghe) · luật R-10: bản trộn không có mẫu ⭐ đã xác minh thì `npm run validate` từ chối cho làm kích thích thực nghiệm.

**Điểm yếu thật.** Đến 21/09 **chưa thu được mẫu nào**; kế hoạch thực địa đợt 1 có khung nhưng chưa có ngày (`nghien-cuu/ke-hoach-thuc-dia-dot-1.md`). Nói thẳng: "đây là đường găng, và chúng tôi biết".

## 2. "Thuyết minh ghi 'thống kê mô tả'. Thống kê mô tả không chứng minh được 'có ý nghĩa'."

**Trả lời 30 giây.** Đúng, và thuyết minh gốc sai ở chỗ đó — đã sửa. H1 là dữ liệu nhị phân trên cùng một người nghe qua các điều kiện nên dùng **McNemar**; H2 là thang thứ bậc nên dùng **Wilcoxon signed-rank**, không dùng t-test cho Likert đơn mục. Báo cáo **cỡ hiệu ứng kèm khoảng tin cậy** ngay dưới mỗi giá trị p, không chỉ p.

**Bằng chứng.** `nghien-cuu/ke-hoach-phan-tich.md` §1 · `src/research/statistics.js`, `effect-size.js` (đối chiếu độc lập với R: `nghien-cuu/doi-chieu.R`, khớp 12 chữ số có nghĩa) · chạy tại chỗ: `npm run analyse -- --demo`.

**Điểm yếu thật.** Kế hoạch phân tích **chưa ký, chưa tag** `pre-registration-v1` (spec S1.4). Cần ký trước lượt nghe đầu tiên, và phải nói được ngày ký.

## 3. "Cỡ mẫu 96 người lấy từ đâu? Không tuyển đủ thì sao?"

**Trả lời 30 giây.** Tính bằng mô phỏng theo thiết kế trong-người, ba điều kiện, giả định tỉ lệ đúng và tỉ lệ đoán mò khai rõ; kết quả **96 người (sàn 84) cho lực 80%**. Công thức trong sách giáo khoa cho con số thiếu 5–8 điểm lực vì bỏ qua tương quan trong người. Nếu không đủ: ba lựa chọn đã chốt **trước** khi thu — tăng lượt/người lên 8, chấp nhận lực 78% với 80 người và khai báo, hoặc hạ H1 xuống thăm dò. Điều **không** làm: thu thêm tới khi p < 0,05.

**Bằng chứng.** `nghien-cuu/ke-hoach-phan-tich.md` §2.1–2.4 · `src/research/power.js` (26 test) · `npm run plan:sample` in bảng ba kịch bản.

**Điểm yếu thật.** 96 người là nhiều với một đề tài sinh viên; tuyển người **chưa bắt đầu** (lộ trình C2.1).

## 4. "Bản phân lớp dài hơn, to hơn, nhiều thông tin hơn bản âm rời — đoán đúng hơn là đương nhiên, đâu chứng minh được 'có chủ đích'?"

**Trả lời 30 giây.** Chính vì thế thực nghiệm có **ba** điều kiện, không phải hai: `layered` (phân lớp đúng vùng), `isolated` (âm rời), và **`scrambled`** — phân lớp *sai vùng*, trộn lớp từ nhiều vùng, **cùng thời lượng, cùng số sự kiện, cùng mức LUFS**. Nếu `layered` chỉ thắng `isolated` mà không thắng `scrambled`, thì thứ giúp người nghe là "nhiều thông tin", không phải "có chủ đích" — và chúng tôi sẽ báo cáo đúng như vậy.

**Bằng chứng.** BA §10.4 FR-56…58 · sổ quyết định Q-18 · `src/research/variants.js` (cân bằng do cách dựng, `npm run experiment -- 48 --placeholder` cho 6/6/6 sự kiện) · `src/research/stimulus.js` nối vào `npm run validate`.

## 5. "Nghe 4 lượt, danh sách trả lời 4 vùng — lượt cuối còn một lựa chọn, đúng 100% là chắc?"

**Trả lời 30 giây.** Đây là lỗi thiết kế nhóm **tự tìm ra khi đánh giá lại** và đã sửa: danh sách trả lời gồm 4 vùng thật **cộng 4 phương án nhiễu** là địa danh thật cùng vùng (Sa Pa, Hội An, Đà Lạt, Phú Quốc), xáo theo (người × lượt) có seed, ô thật và ô nhiễu dựng giống hệt trong DOM, người tham gia được báo trước danh sách dài hơn số đoạn.

**Bằng chứng.** Sổ quyết định **Q-19** · FR-60 · `data/distractors.json` · `src/research/answer-options.js` (11 test) · `npm run validate` in dòng "Danh sách trả lời: 8 ô".

## 6. "Ghi âm giọng người bán hàng, cồng chiêng của người Ê Đê, tiếng tụng kinh trong chùa — có vi phạm Luật bảo vệ dữ liệu cá nhân 2025 không?"

**Trả lời 30 giây.** Nhóm xếp ba loại đó vào **dữ liệu nhạy cảm** theo Nghị định 356/2025 Điều 4 khoản 1 (giọng người → sinh trắc; cồng chiêng → nguồn gốc dân tộc; tụng kinh → tôn giáo) và **máy tự bắt mâu thuẫn**: có giọng người mà không khai `biometric` là `validate` đỏ. Mỗi loại có phiếu riêng: phiếu 01 đồng thuận cá nhân, phiếu 02 thoả thuận cộng đồng chủ thể (cộng đồng quyết giấy phép, được ghi công), xin phép cơ sở tôn giáo, và **thông báo đang ghi âm** ở nơi công cộng theo Luật Điều 32 khoản 2. Người trong bản ghi có quyền rút bất cứ lúc nào (phiếu 04) — giấy phép mở không xoá quyền đó.

**Bằng chứng.** `phap-ly/01`, `02`, `04`, `05`, `08` (căn cứ pháp lý, trích điều khoản) · `src/domain/taxonomy.js` `SENSITIVE_CATEGORIES` · `src/data/clip-schema.js` luật đồng thuận.

**Điểm yếu thật.** Hồ sơ đánh giá tác động xử lý dữ liệu cá nhân (Luật Điều 21) **chưa lập**; mốc 60 ngày tính từ mẫu có giọng người đầu tiên. Ghi trong sổ quyết định Q-25 và kế hoạch thực địa §1.4 (ghi ngày mẫu đầu tiên).

## 7. "Giấy phép NC an toàn hơn cho di sản, sao chọn CC BY?"

**Trả lời 30 giây.** NC nghe an toàn nhưng **chặn luôn** những giá trị thuyết minh hứa: du lịch địa phương, sách giáo dục có bán, bảo tàng bán vé, báo chí — và ranh giới "thương mại" mờ nên người thiện chí bỏ đi thay vì hỏi. CC BY buộc **ghi công**, là thứ cộng đồng chủ thể và nhóm thật sự cần. Ngoại lệ có chủ ý: **biểu đạt văn hoá do cộng đồng chủ thể quyết**, muốn NC thì tôn trọng. NC bị chặn ở tầng dữ liệu để không lọt vào do vô tình; SA tránh vì lây sang cả bản trộn.

**Bằng chứng.** `phap-ly/09` · `ALLOWED_LICENSES` trong `taxonomy.js` · `effectiveMixLicense()` cảnh báo SA lây, hiển thị ngay trong phòng nghe ("Giấy phép hiệu lực của bản trộn") · `LICENSE` MIT cho mã.

## 8. "Người khác chạy lại thực nghiệm được không? Kích thích có tái lập không?"

**Trả lời 30 giây.** Có, ở ba mức. **Mã:** clone sạch, `npm ci && npm test` xanh 570 test, CI chạy trên mỗi push. **Kích thích:** kết xuất sẵn từ bản trộn + seed, `npm run render:stimuli -- --verify` kết xuất lại và **so mã băm** — lệch một byte là đỏ. **Phân tích:** log lượt nghe có định dạng chốt, `npm run analyse` chạy thẳng trên log.

**Bằng chứng.** FR-52, sổ quyết định Q-21 · `.github/workflows/ci.yml` · `scripts/render-stimuli.mjs` · Q-20.

## 9. "'Chưa có bản đồ âm thanh nào cho Việt Nam' — chứng cứ?"

**Trả lời 30 giây.** Phát biểu gốc quá rộng và đã **thu hẹp**: Radio Aporee có bản ghi Việt Nam lẻ tẻ nhưng không phân loại khoa học, không bộ trộn phân lớp; Cities and Memory hướng nghệ thuật; British Library Sounds có biên mục nhưng không bản đồ tương tác, không mô phỏng. Khoảng trống là **tổ hợp**: có hệ thống phân loại + có bộ trộn phân lớp + có kiểm chứng thực nghiệm, dành riêng cho vùng miền Việt Nam.

**Bằng chứng.** BA §1.1 · sổ quyết định Q-01 · `nghien-cuu/sua-thuyet-minh.md` §4 (câu thay thế).

## 10. "Thuyết minh nói 'hỗ trợ người khiếm thị'. Đã kiểm với người khiếm thị chưa?"

**Trả lời 30 giây.** Cơ chế làm từ đầu, không ghép sau: danh sách địa điểm văn bản tương đương bản đồ, mọi thanh trượt đọc được ("Tiếng ve — 40 phần trăm" thay vì "0.4"), thẻ văn hoá nối `aria-describedby`, bộ lọc là form có nhãn, tôn trọng giảm chuyển động. **Chưa kiểm với người dùng thật hay NVDA/VoiceOver.** Nếu tới lúc bảo vệ vẫn chưa kiểm, nhóm **rút tuyên bố** khỏi phần giá trị thực tiễn thay vì giữ một lời hứa chưa kiểm chứng.

**Bằng chứng.** Lộ trình B2.5, B6.1, **B6.2** (quy tắc rút tuyên bố) · `experiment-view.test.js` mục "tiếp cận" · `layer-slider.test.js`.

## 11. "Tiếng tàu điện leng keng của phố cổ — âm đó không còn. Lấy đâu ra?"

**Trả lời 30 giây.** Không lấy được, và đó **chính là luận điểm**: dấu ấn tiêu biểu nhất mà thuyết minh gốc nêu đã mất từ 1991. Lược đồ có mức `lost`; lớp `lost` hiển thị như **lớp đã tắt vĩnh viễn**, không giả lập. Nếu tìm được bản ghi lịch sử có giấy phép rõ thì đưa vào với nhãn nguồn; không có thì để trống **có chủ ý** — một ô trống nói được "đây là cái đã mất" rõ hơn một tiếng chuông tổng hợp.

**Bằng chứng.** `VAT-LIEU-4-DIA-DIEM.md` §4 · `data/clips.json` HN-08 `endangerment_level: lost` · phòng nghe: nhãn "đã không còn tồn tại" · `ung-vien-kho-am.md` §7: HN-08 là 1 trong 2 mẫu **không có** ứng viên nào trong kho.

## 12. "Điện thoại tầm trung chạy được 5 lớp không? Tải bao lâu trên 4G?"

**Trả lời 30 giây.** Trên máy tính: 9 lớp / 23 MB / 61 fps; tiếng đầu tiên 6,4 s ở 5 Mbit/s khi còn phục vụ WAV thô; đường ống đã xuất Opus 72k nén **15–21×** trên âm thật, chiếu ra dưới 1 s. Phát dần: lớp nền đi trước một mình rồi phát ngay, lớp phụ tải nền. **Trên điện thoại thật: chưa đo** — đó là cổng G0 còn mở.

**Bằng chứng.** `BAO-CAO-G0.md` §2, §7.3 · lộ trình B2.4 · `listening-room.js` (tải song song, phát dần, dọn bộ đệm theo NFR-04 ≤ 150 MB).

**Điểm yếu thật.** Con số điện thoại thật là con số đầu tiên hội đồng sẽ hỏi. Đo trước ngày bảo vệ bằng đúng link công khai; ghi tên máy vào `BAO-CAO-G0.md` (spec S2.3).

---

## Ba câu nên tự nói trước khi bị hỏi

1. **Vật liệu thật = 0** đến ngày ⟨…⟩. Kế hoạch đợt 1 là Hà Nội + Cái Răng; ngày ⟨…⟩.
2. **Chưa có lượt nghe nào**; kế hoạch phân tích sẽ ký ngày ⟨…⟩ trước lượt đầu.
3. **Không hỏi phòng pháp chế** (Q-25) — nhóm tự đọc luật và tự chịu; hệ quả ghi trong sổ quyết định.

Nói trước ba điều này biến "bị bắt lỗi" thành "biết mình đang ở đâu" — với hội đồng, đó là hai điểm số rất khác nhau.
