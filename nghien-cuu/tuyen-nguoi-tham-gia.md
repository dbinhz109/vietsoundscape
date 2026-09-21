# Tuyển người tham gia thực nghiệm — quy trình, thư mời, theo dõi

**Việc:** C2.1 (mở danh sách chờ) · C3.2 (tuyển đủ) · C5.2 (theo dõi hằng tuần) · **Soạn:** 21/09/2026 (máy) · **Trạng thái:** 🟡 quy trình sẵn, **chưa mở** — chờ ba điều kiện ở §1
**Đọc kèm:** `ke-hoach-phan-tich.md` §2 (cỡ mẫu), §3 (tiêu chí loại) · `phap-ly/07` (màn đồng thuận) · `src/research/assignment.js` (phân điều kiện theo mã)

---

## 1. Chưa gửi thư mời khi chưa có ba thứ này

| # | Điều kiện | Vì sao | Kiểm |
|---|---|---|---|
| 1 | **Kích thích thật** — 12 bản trộn từ vật liệu thật, không phải `placeholder` | Người nghe âm tổng hợp là một lượt nghe **mất**, và không được mời lại (đã biết bộ kích thích) | `npm run render:stimuli -- --verify` không có `--placeholder` |
| 2 | **Kế hoạch phân tích đã ký**, tag `pre-registration-v1` | Đăng ký trước chỉ có giá trị khi ký **trước** lượt nghe đầu tiên | `git tag` |
| 3 | **Pilot 5–8 người xong**, bộ câu hỏi đóng băng (C4.1, C4.2) | Sửa câu hỏi giữa chừng là hai nửa mẫu đo hai thứ khác nhau | Sổ quyết định có mục "đóng băng" |

**Được làm ngay từ bây giờ:** mở danh sách chờ (ghi tên người *muốn* tham gia), liên hệ lớp/khoa/câu lạc bộ để xin một khung giờ. Người trong danh sách chờ chỉ nhận link khi cả ba ô trên xong.

## 2. Con số

| | Số | Nguồn |
|---|---|---|
| Mục tiêu | **96 người** (8 vòng × 12) | `ke-hoach-phan-tich.md` §2.1 |
| Sàn | 84 (7 vòng) — dưới sàn thì theo §2.4, không "thu tới khi có ý nghĩa" | §2.3–2.4 |
| Một vòng cân bằng | **12 người** = 4 địa điểm × 3 điều kiện, mỗi người một hàng của hình vuông La Tinh | `assignment.js` |
| Dự phòng loại | thêm ~10% (khoảng 10 người) vì tiêu chí loại §3 loại sau khi nghe | §3 |
| Pilot | 5–8 người **ngoài** 96, không tính vào mẫu | lộ trình C4.1 |
| Một phiên | ~10 phút: đồng thuận → 4 đoạn ≈ 1 phút → mỗi đoạn đoán nơi (8 lựa chọn) + chấm 8 thuộc tính ISO 12913-2 → 3 câu tự khai cuối | `experiment-view.js` |

## 3. Ai tham gia được

- Người lớn, nghe bằng **tai nghe** (nhét tai hay chụp đầu đều được), ở nơi yên tĩnh, một mình.
- **Không** loại theo kết quả. Chỉ loại theo §3 kế hoạch phân tích: phiên không hoàn tất (máy), chấm y hệt một giá trị cho cả 8 thuộc tính ở cả 4 lượt (máy), tự khai vấn đề thính lực hoặc nghe loa ngoài nơi ồn (hỏi cuối phiên).
- Mỗi người **một lần**. Người đã pilot không tham gia đợt chính.
- Tránh tuyển **toàn** người đã biết dự án (đã nghe nhóm kể về bốn địa điểm) — họ đoán theo trí nhớ, không theo tai. Trộn ít nhất một nửa từ lớp/khoa khác.

## 4. Quy trình một người

1. **Đăng ký** → thêm một dòng vào `nghien-cuu/danh-sach-cho.csv` (ngoài git, mẫu cột `mau-danh-sach-cho.csv`), `trang_thai = cho`. Mã `id` tuần tự, **không tái dùng** mã của người bỏ giữa chừng — mã quyết định điều kiện được phân.
2. **Gửi link** `https://dbinhz109.github.io/vietsoundscape/thuc-nghiem?nguoi=⟨id⟩` kèm thư mời §5. Một mã một người; gửi nhầm hai người cùng mã là hỏng phân điều kiện.
3. Người nghe **tự làm** ~10 phút. Màn đầu là `phap-ly/07`; không đồng ý thì trang dừng.
4. Cuối phiên trang **tải xuống** `nguoi-⟨id⟩.json` — người tham gia gửi lại tệp đó cho nhóm (Zalo/email). Tệp không có tên hay liên hệ, chỉ có mã và câu trả lời.
5. Nhóm lưu tệp vào `build/log/` (ngoài git), đổi dòng CSV thành `da_nghe`, điền `ngay_nghe`, `thiet_bi`, `tai_nghe`. Người tự khai thính lực/loa ngoài → `loai` kèm ghi chú, **trước** khi nhìn câu trả lời.
6. Hằng tuần: `npm run participants -- nghien-cuu/danh-sach-cho.csv --deadline ⟨YYYY-MM-DD⟩` → đọc còn thiếu mấy, vòng 12 đang hở mấy, cần mấy người/tuần.

## 5. Thư mời — dán vào Zalo / email

> **Mời bạn nghe 4 đoạn âm thanh (10 phút) cho một nghiên cứu sinh viên**
>
> Nhóm mình đang làm đề tài *Bản đồ âm thanh Việt Nam* — tìm hiểu xem người nghe có nhận ra một vùng miền chỉ qua âm thanh không. Bạn sẽ nghe **4 đoạn, mỗi đoạn khoảng 1 phút**, đoán đoạn đó thu ở đâu, và chấm vài câu cảm nhận. Không có đúng sai; mình cần cảm nhận thật của bạn.
>
> Cần: **tai nghe**, một chỗ yên, 10 phút không bị ngắt. Mở link này trên điện thoại hoặc máy tính: ⟨link có mã⟩. Xong, trang sẽ tải về một tệp nhỏ `nguoi-⟨N⟩.json` — gửi lại cho mình là xong.
>
> Tệp đó không có tên bạn, chỉ có mã số và câu trả lời. Bạn dừng lúc nào cũng được, và có thể yêu cầu xoá dữ liệu bất cứ khi nào (cách làm ghi trong trang đầu). Cảm ơn bạn nhiều!
>
> — ⟨tên⟩, ⟨lớp/khoa⟩, ⟨liên hệ⟩

Bản ngắn cho tin nhắn: *"Bạn có 10 phút và tai nghe không? Nghe 4 đoạn âm thanh, đoán xem ở đâu, giúp nhóm mình làm đề tài Bản đồ âm thanh Việt Nam. Link: ⟨…⟩ (mỗi link một người, đừng chuyển tiếp)."*

## 6. Kênh và lịch đề xuất

| Tuần | Việc | Mục tiêu cộng dồn |
|---|---|---|
| 0 | Mở danh sách chờ; xin lớp/khoa/CLB một khung giờ tập thể (một buổi 20 người ngồi cùng phòng, mỗi người tai nghe riêng là cách nhanh nhất) | 30 tên trong danh sách chờ |
| 1 | Pilot 5–8 người; đóng băng câu hỏi | pilot xong |
| 2–3 | Đợt 1: hai buổi tập thể + link lẻ | 36 (3 vòng) |
| 4–5 | Đợt 2 | 72 (6 vòng) |
| 6–7 | Đợt 3 + bù người bị loại tới **bội của 12** | 96 (8 vòng) |
| 8 | Khoá danh sách; `npm run analyse` | — |

Người tham gia thấy gì, không thấy gì: trang phiên nghe **không** nạp mô tả vùng (`signature_vi`) — đáp án không lọt ra DOM (kiểm ở `bootstrap.test.js`). Người nghe nhiều buổi cùng phòng: tai nghe riêng, không bàn với nhau tới khi nộp.

## 7. Dữ liệu cá nhân

- CSV có tên/liên hệ **chỉ** nằm trên máy nhóm, ngoài git (`.gitignore` chặn `nghien-cuu/danh-sach-cho*.csv`). Log câu trả lời chỉ có mã.
- Bảng đối chiếu mã ↔ người là thứ cho phép **xoá theo yêu cầu** (`phap-ly/04`, `07` "Quyền của bạn"). Giữ tới khi phân tích xong và báo cáo nộp, rồi xoá; ghi ngày xoá vào sổ quyết định.
- Không hỏi tuổi chính xác, giới, ngành — không cần cho H1/H2, hỏi thêm là thu thừa.

## 8. Đạt khi

- [ ] Danh sách chờ có ≥ 30 tên trước khi pilot
- [ ] Ba điều kiện §1 xong, ghi ngày vào đây: kích thích thật ⟨…⟩ · ký kế hoạch ⟨…⟩ · pilot ⟨…⟩
- [ ] `npm run participants` chạy hằng tuần, con số chép vào `LO-TRINH` C5.2
- [ ] 96 `da_nghe`, hoặc ≥ 84 kèm quyết định theo §2.4 ghi trong sổ quyết định
