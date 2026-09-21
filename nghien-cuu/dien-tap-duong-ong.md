# Diễn tập trọn đường ống thực nghiệm — 21/09/2026

**Việc:** rào chắn trước C4.1 (pilot) và C5.1 (thu dữ liệu) · **Chạy bằng:** máy, một phiên thật trong trình duyệt + 95 phiên giả lập

> ## ⚠️ MỌI CON SỐ Ở ĐÂY LÀ GIẢ LẬP — KHÔNG PHẢI KẾT QUẢ NGHIÊN CỨU
>
> 95 trên 96 phiên do máy sinh, với tỉ lệ đúng **bịa sẵn** (`layered` 0,62 · `isolated` 0,34 · `scrambled` 0,28) đúng bằng kịch bản "vừa phải" của kế hoạch phân tích §2.1. Phân tích tất nhiên cho kết quả dương tính — đó là **điều đã cài vào đầu vào**, không phải phát hiện. Mục đích duy nhất: kiểm xem đường ống có chạy không.
>
> Không trích con số nào trong tệp này vào báo cáo. Kết quả thật chỉ có sau khi 96 người thật nghe.

---

## Vì sao diễn tập

Tuyển 96 người là khoản đầu tư lớn nhất còn lại của đề tài, và nó **không hoàn lại được**: một người đã nghe bộ kích thích thì không mời lại được. Nếu có mắt xích gãy trong chuỗi *kết xuất → phục vụ → phiên nghe → log → phân tích*, phát hiện sau khi thu là mất cả mẻ.

## Chuỗi đã chạy

| Bước | Cách kiểm | Kết quả |
|---|---|---|
| 1. Kết xuất kích thích | `npm run render:stimuli -- --placeholder` | **36 tệp** (12 bản trộn × 3 điều kiện), 594 MB, 36/36 mã băm khác nhau |
| 2. Cân bằng kích thích | Đọc bảng kê | Thời lượng **60 s đều tất cả**; LUFS −23,07…−22,98 (lệch **0,09 LU**, đạt FR-57); **12/12 bản trộn có ba điều kiện cùng số sự kiện** (đạt FR-56) |
| 3. Phục vụ | `npx vite` + tải bảng kê | 200, tệp âm phát được |
| 4. Phiên nghe **thật trong trình duyệt** | Playwright, `?nguoi=1` | Màn đồng thuận 3 ô → 4 lượt → mỗi lượt 8 lựa chọn đã xáo → 8 thuộc tính → màn kết thúc |
| 5. Khoá chống bỏ qua | Thử bấm gửi sớm | Nút **khoá** tới khi nghe hết 60 s; mở khoá đúng lúc |
| 6. Chống lộ đáp án | Tìm chuỗi trong log | Không có `signature_vi` hay mô tả vùng nào lọt vào log |
| 7. Tải log | Sự kiện tải của trình duyệt | `nguoi-001.json` tải về, đủ trường |
| 8. Gộp 96 log | `npm run analyse -- build/log-dientap/` | **384 lượt · 96 người** |
| 9. Phân tích | như trên | Cả 6 phép kiểm chạy, có cỡ hiệu ứng kèm khoảng tin cậy |

## 🔴 Lỗi tìm được — và đó là lý do diễn tập

**`npm run analyse` chỉ đọc tệp log ĐẦU TIÊN, im lặng.**

Trang phiên nghe cho **mỗi người tải về một tệp riêng**, nên đến lúc phân tích nhóm sẽ có 96 tệp và sẽ gõ `npm run analyse -- build/log/*.json`. Bản cũ dùng `args.find(...)`, lấy đúng một đối số. Lệnh chạy trót lọt, in ra bảng kết quả trông bình thường, và báo **n = 1**.

Phần tệ nhất là **im lặng**: không lỗi, không cảnh báo. Một bảng "p = 1,0000, không có ý nghĩa" từ n = 1 rất dễ bị đọc thành "giả thuyết sai" thay vì "vừa vứt 95 người".

**Đã sửa** (`src/research/merge-logs.js`, 10 test): nhận nhiều tệp hoặc cả một thư mục, gộp lại, và **chặn cứng ba thứ** làm hỏng phân tích mà không báo lỗi — trùng mã người tham gia (mã quyết định điều kiện được phân), lẫn hai thiết kế, đổi bộ câu hỏi giữa chừng. Phiên không hoàn tất bị loại theo tiêu chí §3 và **được đếm, in ra**, không biến mất lặng lẽ.

## Những gì diễn tập này KHÔNG kiểm được

| Không kiểm | Vì sao | Ai đóng |
|---|---|---|
| Người thật có hiểu hướng dẫn không | Máy bấm không phải người đọc | Pilot 5–8 người (C4.1) |
| Vật liệu thật có phân biệt được vùng không | Đang là âm tổng hợp giữ chỗ | Thực địa đợt 1 và 2 |
| `scrambled` có nghe "sai" thật không | như trên | Tai người, sau thực địa |
| Phiên trên điện thoại thật | Chạy trên Chromium máy tính | S2.3 |
| Đối chiếu R | R chưa cài trên máy này | Đã chạy trước đây với R 4.6.1 trên log giả lập, 6/6 giá trị p trùng 4 chữ số |

## Một dấu vết của giả lập, để không ai đọc nhầm

Rank-biserial bằng **1,000 ở cả bốn phép Wilcoxon** là dấu hiệu rõ của dữ liệu bịa: máy cộng đúng một bậc cho `layered` ở mọi người, nên mọi cặp lệch cùng chiều. Dữ liệu người thật không bao giờ đều như vậy. Nếu kết quả thật cũng cho 1,000 thì đó là lỗi, không phải phát hiện.

## Cách chạy lại

```bash
npm run render:stimuli -- --placeholder   # 36 kích thích, ~600 MB, cần ffmpeg
npx vite                                   # phục vụ /thuc-nghiem?nguoi=N
npm run analyse -- build/log/              # gộp cả thư mục
```

Log diễn tập nằm ở `build/log-dientap/` — **ngoài git** như mọi thứ trong `build/`. Xoá được, sinh lại được.
