# Bộ hồ sơ pháp lý — VietSoundscape

**Việc A0.2 của lộ trình** · Phải hoàn thành **trước chuyến thực địa đầu tiên**

---

## ⚠️ Đọc trước khi dùng

**Tôi không phải luật sư và đây không phải tư vấn pháp lý.** Các văn bản trong thư mục này là **bản thảo vận hành** — soạn để nhóm có thứ mang đi thực địa ngay và để quy trình rõ ràng. Trước khi dùng chính thức:

1. **Nhờ người có chuyên môn pháp lý rà lại** — phòng pháp chế của trường, giảng viên luật, hoặc luật sư.
2. **Điền các chỗ `⟨…⟩` còn lại** — giờ chỉ còn tên người, liên hệ, tên địa điểm. Các chỗ chờ **số điều khoản đã điền xong** (ngày 06/08).
3. Nếu trường có **hội đồng đạo đức nghiên cứu**, nộp bộ này để xin phê duyệt trước khi thu dữ liệu người tham gia.

**Không bịa số điều khoản.** Mọi số điều trong bộ hồ sơ này đều trích từ **toàn văn** đã tải về, lưu ở [`nguon/`](nguon/). Đọc gì, chưa đọc gì thì [văn bản 08 §0](08-can-cu-phap-ly.md) ghi rõ.

> ### 🔴 Ba việc gấp, làm trước chuyến thực địa
>
> Đọc toàn văn Luật mới lòi ra ba nghĩa vụ mà lộ trình chưa có. Chi tiết ở [văn bản 08 §8](08-can-cu-phap-ly.md):
>
> 1. **Hồ sơ đánh giá tác động xử lý dữ liệu — nộp trong 60 ngày** kể từ ngày xử lý dữ liệu cá nhân **đầu tiên** (Luật Điều 21 khoản 1). Đề tài xử lý dữ liệu nhạy cảm nên **không được miễn**. Mốc này chạy trước cả ngày ra mắt web. **Hỏi phòng pháp chế của trường ngay.**
> 2. **Cử người phụ trách bảo vệ dữ liệu cá nhân** (Luật Điều 33 khoản 2). Điền tên vào văn bản 01, 04, 07 — hiện đang trống.
> 3. **Liên hệ Sở VHTTDL** Thừa Thiên Huế và Đắk Lắk (Luật Di sản văn hoá Điều 16 khoản 3).

---

## Bảy văn bản, dùng khi nào

| # | Văn bản | Dùng khi | Ai giữ |
|---|---|---|---|
| 01 | [Phiếu đồng thuận ghi âm](01-phieu-dong-thuan-ghi-am.md) | Thu âm có **giọng người nhận dạng được**: tiếng rao, tụng kinh | Bản gốc nhóm giữ, bản chụp gửi người đồng thuận |
| 02 | [Thoả thuận ghi công cộng đồng](02-thoa-thuan-ghi-cong-cong-dong.md) | Thu **biểu đạt văn hoá truyền thống**: cồng chiêng, ca Huế, đàn t'rưng | Hai bên mỗi bên một bản |
| 03 | [Cam kết quyền của người đóng góp](03-cam-ket-quyen-nguoi-dong-gop.md) | Người ngoài nhóm gửi bản ghi lên web | Hệ thống lưu cùng bản ghi |
| 04 | [Quy trình yêu cầu xoá / rút bản ghi](04-quy-trinh-yeu-cau-xoa.md) | Có ai yêu cầu rút | Sổ ghi vết công khai |
| 05 | [Nhật ký thực địa](05-nhat-ky-thuc-dia.md) | **Mọi lần** thu âm | Nhóm giữ, nhập vào `data/clips.json` |
| 06 | [Phiếu thu âm cho cộng tác viên](06-phieu-thu-am-cong-tac-vien.md) | Nhờ người ở tỉnh khác thu | Gửi kèm khi nhờ |
| 07 | [Thông báo và đồng thuận tham gia nghiên cứu](07-dong-thuan-tham-gia-nghien-cuu.md) | Trước khảo sát H1/H2 (mốc M4–M5) | Lưu điện tử cùng dữ liệu khảo sát |
| 08 | [Căn cứ pháp lý — kết quả tra cứu toàn văn](08-can-cu-phap-ly.md) | **Đọc trước tất cả** — nêu văn bản nào đang có hiệu lực | — |
| 09 | [Quyết định giấy phép](09-quyet-dinh-giay-phep.md) | Khi chọn giấy phép cho mẫu âm | — |
| — | [`nguon/`](nguon/) | Toàn văn ba văn bản luật đã tải, để tra lại khi cần | — |

---

## Ba mức đồng thuận — đừng lẫn

Đây là chỗ dễ sai nhất, và máy đã kiểm được (`src/data/clip-schema.js`):

| Mức | Dùng cho | Văn bản | Giá trị trong dữ liệu |
|---|---|---|---|
| **Không cần** | Tiếng gió, nước, mưa, ve, chim, ồn giao thông chung — không ai nhận ra được cá nhân nào | — | `consent_status: not_required` |
| **Đồng thuận cá nhân** | Giọng của một người cụ thể: tiếng rao, tụng kinh | 01 | `consent_status: obtained` |
| **Thoả thuận cộng đồng** | Biểu đạt văn hoá của một cộng đồng: cồng chiêng, ca Huế, hát ru | 02 | `consent_status: community_agreed` + `community_credit` |

**Vì sao mức 3 không thể thay bằng mức 2:** cồng chiêng không phải tài sản của người ghi âm, cũng không phải của một nghệ nhân đơn lẻ. Xin phép một người rồi công bố cả di sản của cộng đồng là lấy nhầm chủ thể. `npm run validate` sẽ **từ chối** xuất bản mẫu `cultural_expression` nếu chỉ có đồng thuận cá nhân.

## Mẫu nào cần gì — trạng thái hiện tại

Cả 6 mẫu dưới đây đều là **dữ liệu cá nhân nhạy cảm** — căn cứ từng điểm ở [văn bản 08 §4.2](08-can-cu-phap-ly.md).

| Mẫu | Loại | Nhạy cảm vì | Cần văn bản |
|---|---|---|---|
| HN-04 Tiếng rao đêm | giọng người | điểm đ (còn tranh cãi) | 01 |
| CR-05 Tiếng rao trên ghe | giọng người | điểm đ (còn tranh cãi) | 01 |
| HU-05 Mõ và tụng kinh gần | giọng người | **điểm b** — tôn giáo, tín ngưỡng | 01 + xin phép nhà chùa |
| HU-06 Ca Huế trên sông Hương | biểu đạt văn hoá + giọng người | điểm a hoặc đ | **02** + 01 cho từng nghệ nhân |
| TN-05 Cồng chiêng | biểu đạt văn hoá | **điểm a** — nguồn gốc dân tộc | **02** + 01 cho từng nghệ nhân |
| TN-06 Đàn t'rưng | biểu đạt văn hoá | **điểm a** — nguồn gốc dân tộc | **02** + 01 cho từng nghệ nhân |
| 26 mẫu còn lại | không có giọng người | — | không cần |

Điểm a/b/đ là Nghị định 356/2025/NĐ-CP Điều 4 khoản 1, và **đã khai vào `data/clips.json`** — `npm run validate` in ra mục riêng "Dữ liệu cá nhân NHẠY CẢM" và **chặn xuất bản** nếu thiếu.

Ba luật máy đang chặn (trong `src/data/clip-schema.js`):

| Luật | Căn cứ |
|---|---|
| Có giọng người nhận ra được ⇒ **buộc khai** nhóm `biometric`; khai `biometric` mà không có giọng ⇒ báo mâu thuẫn | NĐ 356 Điều 4.1.đ |
| Mẫu nhạy cảm **không bao giờ** được khai `consent_status: not_required` | Luật Điều 19 không có ngoại lệ nghiên cứu |
| Xuất bản mẫu nhạy cảm đòi **hai xác nhận riêng**: `sensitive_notice_given` (NĐ 356 Điều 6.4) và `recording_notice_given` (Luật Điều 32.2, chỉ với mẫu tự thu) | hai nghĩa vụ khác nhau, dễ nhầm là một |

---

## A0.3 — đã đọc toàn văn, bốn câu treo đã trả lời

Kết quả đầy đủ ở [văn bản 08](08-can-cu-phap-ly.md). Đã đọc trọn **39 điều Luật 91/2025/QH15**, **42 điều Nghị định 356/2025/NĐ-CP**, **Điều 1–63 Luật Di sản văn hoá 45/2024/QH15**. Sáu điểm quan trọng nhất:

1. ⚠️ **Nghị định 13/2023/NĐ-CP đã hết hiệu lực từ 01/01/2026** — thay bằng **Nghị định 356/2025/NĐ-CP** (Điều 42 khoản 2 của Nghị định mới). Ai còn dẫn 13/2023 là dẫn văn bản chết.
2. ⚠️ **Bản tra ngày 05/08 sai ba chỗ.** Điều 31 khoản 2 **không** liệt kê "giọng nói"; danh mục nhạy cảm nằm ở **Nghị định 356 Điều 4**, không nằm trong Luật. Xem [văn bản 08 §1](08-can-cu-phap-ly.md).
3. **Luật có hẳn Điều 32 cho ghi âm nơi công cộng** — cho phép ghi và xử lý **không cần đồng thuận** với biểu diễn nghệ thuật và hoạt động công cộng, **nhưng buộc phải thông báo** cho người ta biết đang bị ghi (khoản 2), và **chỉ được lưu trong thời gian cần thiết** (khoản 4 — chỗ này căng với mục tiêu lưu giữ lâu dài của đề tài).
4. **Đề tài chắc chắn xử lý dữ liệu nhạy cảm** — không qua đường "giọng nói là sinh trắc học" (vẫn tranh cãi) mà qua **nguồn gốc dân tộc** (cồng chiêng Ê Đê) và **tôn giáo** (tụng kinh). Hai đường này không cãi được.
5. **Không có ngoại lệ cho nghiên cứu khoa học.** Luật Điều 19 liệt kê đủ, và không có. Cơ sở hợp pháp chỉ có hai: đồng thuận, hoặc Điều 32.
6. **Đã có số ngày cụ thể** cho quyền rút và quyền xoá — Nghị định 356 Điều 5, đã điền vào văn bản 04 và 07.

## A0.4 — đã quyết

Chi tiết ở [văn bản 09](09-quyet-dinh-giay-phep.md). Tóm lại: **CC BY 4.0** cho mẫu tự thu, **CC0** cho metadata, **MIT** cho mã nguồn. **Không dùng NC** — nó chặn luôn giá trị quảng bá du lịch mà đề tài nêu ra. **Tránh SA** cho vật liệu đem trộn vì copyleft lây sang cả bản trộn. Riêng biểu đạt văn hoá thì **cộng đồng chủ thể quyết**.
