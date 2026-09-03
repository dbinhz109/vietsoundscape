# Quyết định giấy phép

**Việc A0.4** · Quyết định ngày 2026-08-05 · **Có thể sửa** — nhưng sửa sau khi đã công bố thì rất tốn

---

## Quyết định

| Loại tài sản | Giấy phép | Lý do |
|---|---|---|
| **Mẫu âm nhóm tự thu** (dấu ấn, tín hiệu) | **CC BY 4.0** | Cho phép dùng lại rộng nhất mà vẫn buộc ghi công |
| **Mẫu âm là biểu đạt văn hoá** (cồng chiêng, ca Huế, đàn t'rưng) | **Cộng đồng chủ thể quyết**, mặc định đề xuất CC BY 4.0 | Không phải tài sản của nhóm — không được tự quyết. Ô chọn có trong văn bản 02 |
| **Mẫu âm tải từ kho** | Giữ nguyên giấy phép nguồn. Chỉ nhận **CC0** hoặc **CC BY** | Đã cưỡng chế trong `taxonomy.js` |
| **Metadata, bản trộn, GeoJSON** | **CC0 1.0** | Dữ liệu mô tả nên mở tối đa; đây là phần giúp nghiên cứu khác tái lập |
| **Mã nguồn** | **MIT** | Đơn giản, quen thuộc, không lây ràng buộc sang phần dữ liệu |
| **Tài liệu** (BA, lộ trình, bộ hồ sơ pháp lý) | **CC BY 4.0** | |

## Vì sao CC BY 4.0 chứ không phải NC

Đây là quyết định tôi đã cảnh báo từ đầu (rủi ro **LG-03**), và nó vẫn là chỗ dễ chọn sai nhất.

**NC (phi thương mại) nghe có vẻ an toàn hơn.** Nó ngăn người khác kiếm lời từ di sản. Nhưng nó cũng **chặn luôn**:

- công ty du lịch địa phương dùng bản ghi để giới thiệu vùng đất — mà "quảng bá du lịch" là một trong bốn giá trị thực tiễn đề tài nêu ở mục 10 thuyết minh;
- nhà xuất bản làm sách giáo dục có bán;
- bảo tàng có bán vé dùng trong trưng bày;
- báo chí có doanh thu quảng cáo đưa tin về đề tài.

Tệ hơn: **ranh giới "thương mại" của NC không rõ**, nên người dùng thiện chí thường bỏ qua thay vì đi hỏi. Kết quả là NC làm giảm mức được dùng lại mà không thật sự bảo vệ được gì — bên muốn khai thác xấu thì cũng chẳng đọc giấy phép.

**CC BY buộc ghi công**, và ghi công là thứ đề tài thật sự cần: để cộng đồng chủ thể và nhóm nghiên cứu được nhận đúng phần của mình.

> ⚠️ **Ngoại lệ có chủ ý:** với biểu đạt văn hoá, nếu cộng đồng chủ thể **muốn** NC thì tôn trọng quyết định của họ. Đó là di sản của họ. Ghi rõ vào văn bản 02 và cập nhật `ALLOWED_LICENSES` khi cần.

## Vì sao tránh SA cho vật liệu đem trộn

**Copyleft lây sang cả bản trộn.** Nếu tải một tệp nền CC BY-SA về trộn cùng bản ghi cồng chiêng nhóm tự thu, thì **cả bản trộn** bị ràng buộc chia sẻ lại cùng điều kiện — nhóm mất quyền tự quyết với chính bản ghi của mình trong bản trộn đó.

Đã biến thành luật máy kiểm: `effectiveMixLicense()` trong `src/data/recipe-schema.js` tính giấy phép hiệu lực của bản trộn và **cảnh báo** khi lớp tự thu bị SA của tệp tải về ràng buộc.

```
Thứ tự ràng buộc:  CC0  →  CC BY  →  CC BY-SA
                  (lỏng)              (chặt, lây sang)
```

Nên khi khảo sát kho (việc A0.1b): **ưu tiên CC0, rồi CC BY. Chỉ lấy SA khi không có lựa chọn khác** — và khi đó nhớ là bản trộn chứa nó sẽ thành SA.

## Ghi công thế nào

Mỗi mẫu âm trên web hiển thị:

```
⟨Tên mẫu âm⟩
Nguồn: ⟨tự thu bởi …⟩ hoặc ⟨tên người tải lên, tên kho, liên kết⟩
Cộng đồng chủ thể: ⟨tên buôn/làng/nhóm nghệ nhân⟩   ← chỉ với biểu đạt văn hoá
Giấy phép: ⟨mã⟩ · ⟨liên kết tới toàn văn giấy phép⟩
```

Với **bản trộn**, hiển thị thêm giấy phép hiệu lực của cả bản trộn và danh sách giấy phép từng lớp — `effectiveMixLicense()` trả về sẵn cả hai.

Với **bộ dữ liệu** khi nộp Zenodo: ghi công cả cộng đồng chủ thể trong phần tác giả, không chỉ ghi tên nhóm nghiên cứu.

## Điều giấy phép KHÔNG thay thế được

Giấy phép nói về **quyền sao chép**. Nó không thay thế:

| | Điều chỉnh bởi |
|---|---|
| Đồng thuận của người có giọng nói trong bản ghi | Luật bảo vệ dữ liệu cá nhân (văn bản 08) |
| Quyền nhân thân của người biểu diễn | Luật SHTT Điều 29 — **không chuyển nhượng được**, giấy phép nào cũng không xoá được |
| Nghĩa vụ với di sản văn hoá phi vật thể | Luật Di sản văn hoá 2024 |
| Quyền rút bản ghi | Thoả thuận ở văn bản 01, 02, 04 |

Nghĩa là: một mẫu âm CC BY vẫn phải rút nếu người trong bản ghi yêu cầu. Giấy phép mở **không** làm mất quyền đó.

---

## Trạng thái trong dữ liệu

`src/domain/taxonomy.js` — `ALLOWED_LICENSES`:

```
CC0-1.0 · CC-BY-4.0 · CC-BY-3.0 · CC-BY-SA-4.0 · CC-BY-SA-3.0 · proprietary-own
```

Mọi biến thể **NC bị chặn cứng** ở tầng dữ liệu — `npm run validate` từ chối, kèm thông điệp giải thích lý do và trỏ về LG-03. Muốn mở NC cho một mẫu cụ thể theo yêu cầu của cộng đồng thì phải sửa `ALLOWED_LICENSES` một cách có ý thức, không lọt vào do vô tình.
