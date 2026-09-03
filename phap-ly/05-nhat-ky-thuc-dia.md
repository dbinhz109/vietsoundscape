# Nhật ký thực địa

> **In ra mang theo.** Điền **ngay tại chỗ**, không để về nhà mới ghi — ghi sau thì sai hoặc mất.
>
> Mọi trường ở đây đều là trường bắt buộc trong `data/clips.json` (BA §8.2). Thiếu một trường là mẫu âm không xuất bản được.

---

## Phiếu cho một buổi thu

| | |
|---|---|
| Ngày | |
| Địa điểm | |
| Người thu | |
| Thiết bị | |
| App / cấu hình | |
| Định dạng gốc | ☐ WAV ☐ khác: ⟨…⟩ |
| Tần số / độ sâu bit | |
| AGC đã tắt | ☐ có ☐ không tắt được |
| Khử ồn đã tắt | ☐ có ☐ không tắt được |
| Chắn gió | ☐ có ☐ không |
| Đã chạy `npm run check:recorder` trên thiết bị này | ☐ rồi, kết quả: ⟨…⟩ ☐ chưa |

## ⚠️ Trước khi bấm nút thu: nghĩa vụ thông báo

**Luật Bảo vệ dữ liệu cá nhân Điều 32 khoản 2** buộc phải *"thông báo hoặc bằng hình thức thông tin khác để chủ thể dữ liệu cá nhân biết được mình đang bị ghi âm"* — kể cả khi ghi ở nơi công cộng và **kể cả khi không cần xin đồng thuận**. Đây là nghĩa vụ riêng, không nằm trong phiếu 01.

Chọn ít nhất một cách và đánh dấu:

| Cách thông báo | Dùng khi | ☐ |
|---|---|---|
| **Nói to** với những người có mặt trước khi thu, và **ghi âm luôn câu nói đó** vào đầu bản ghi | nhóm nhỏ, quán, ghe, nhà nghệ nhân | ☐ |
| **Biển giấy A5** đặt cạnh máy: *"Đang ghi âm phục vụ đề tài nghiên cứu Bản đồ âm thanh Việt Nam. Liên hệ ⟨tên⟩ ⟨số điện thoại⟩."* | chợ, phố, nơi đông người qua lại | ☐ |
| **Báo với người quản lý địa điểm** (ban quản lý chợ, nhà chùa, ban tổ chức) và ghi tên người tiếp nhận | di tích, cơ sở tôn giáo, sự kiện có tổ chức | ☐ |

Người tiếp nhận thông báo / cách đã dùng: ______________________________

> **Mẹo:** ghi âm chính câu thông báo vào đầu tệp gốc là cách rẻ nhất để sau này chứng minh đã thông báo. Cắt bỏ ở bản công bố, giữ nguyên ở bản gốc.
>
> **Chùa Thiên Mụ (HU-05) và các cơ sở tôn giáo:** Điều 32 **không** thay thế việc xin phép nhà chùa. Luật Di sản văn hoá (Điều 1–63) không có quy định riêng về ghi âm trong cơ sở tôn giáo, nên áp dụng nội quy của cơ sở và Luật Tín ngưỡng, tôn giáo. **Xin phép trực tiếp, bằng văn bản nếu được.**

## Từng mẫu âm

Sao chép khối này cho mỗi mẫu.

```
Mã mẫu (tạm)      : ______________________
Tên tệp gốc       : ______________________
Thu cái gì        : ______________________________________________
Giờ bắt đầu       : ______  (giờ Việt Nam, ghi cả phút)
Thời lượng        : ______ giây
Toạ độ            : ______________  ☐ đã chụp ảnh bản đồ điện thoại
Hướng micro       : ______________  Độ cao đặt máy: ______ m
Khoảng cách nguồn : ______ m
Mức đỉnh cao nhất : ______ dBFS   ☐ không vượt ngưỡng
Thời tiết         : ______________________
Đông / vắng       : ______________________
Ồn chen vào       : ______________________________________________

Phân loại  — nhóm Krause : ☐ geophony  ☐ biophony  ☐ anthrophony
           — vai Schafer : ☐ keynote  ☐ signal  ☐ soundmark
Mức mai một            : ☐ stable ☐ declining ☐ rare ☐ critical ☐ lost

Có giọng người nhận ra được không?     ☐ không  ☐ CÓ
   → nếu CÓ: đã ký phiếu 01 chưa?      ☐ rồi   ☐ chưa
Là biểu đạt văn hoá của cộng đồng?     ☐ không  ☐ CÓ
   → nếu CÓ: đã có thoả thuận 02 chưa? ☐ rồi   ☐ chưa
   → tên cộng đồng chủ thể: ______________________________

DỮ LIỆU NHẠY CẢM? (Nghị định 356/2025 Điều 4 khoản 1 — đánh dấu nếu có)
   ☐ a — tiết lộ nguồn gốc dân tộc (nhạc cụ/làn điệu của một dân tộc)
   ☐ b — tiết lộ tôn giáo, tín ngưỡng (tụng kinh, lễ nghi)
   ☐ đ — giọng nói nhận ra được người
   → nếu đánh dấu bất kỳ ô nào: tệp gốc để thư mục hạn chế truy cập,
     và phiếu 01 phải có mục 5 đánh dấu tương ứng (Nghị định 356 Điều 6 khoản 4)

Ý nghĩa văn hoá (viết cho thẻ thông tin trên web):
______________________________________________________________
______________________________________________________________

Đang mai một thế nào (người địa phương nói gì):
______________________________________________________________
```

## Nhắc trước khi rời địa điểm

- ☐ Đã thu **âm nền trống** 2–3 phút, không có sự kiện gì nổi lên? *(Đây chính là lớp keynote của bộ trộn. Chỉ thu những âm "hay" thì sẽ không có nền nào để trộn.)*
- ☐ Đã thu **dài gấp 3 lần** lượng cần dùng?
- ☐ Đã ghé **ít nhất 2 thời điểm** trong ngày?
- ☐ Đã nghe lại một mẫu bằng tai nghe để chắc không bị gió đập hay méo tiếng?
- ☐ Đã sao lưu tệp sang chỗ thứ hai **trước khi** rời địa điểm?
- ☐ Đã ký đủ phiếu đồng thuận cho những mẫu cần?
- ☐ **Đã chụp / quét phiếu đồng thuận và lưu cùng chỗ với tệp âm?** *(Nghị định 356 Điều 6 khoản 2: khi có tranh chấp, **nhóm nghiên cứu là bên phải chứng minh** đã có đồng thuận, đồng thuận lúc nào và nội dung gì. Phiếu giấy để trong balo rồi mất là mất luôn cơ sở pháp lý của mẫu âm đó.)*
- ☐ **Đã thông báo cho người có mặt biết đang ghi âm**, và ghi lại đã thông báo bằng cách nào? *(Điều 32 khoản 2 — xem đầu phiếu này)*

## Sau khi về

1. Sao lưu bản gốc, **không bao giờ sửa lên bản gốc**.
2. Chạy `npm run process <tệp> --out=build/audio` để đo LUFS và tìm điểm loop.
3. Nhập vào `data/clips.json`, rồi `npm run validate`.
