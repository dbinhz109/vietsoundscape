# Kế hoạch phân tích — đăng ký trước

> **Việc C1.2.** Văn bản này phải được **chốt và ghi ngày trước khi thu lượt nghe
> đầu tiên**. Sau đó chỉ được sửa bằng cách thêm mục "sửa đổi" ở cuối, ghi rõ ngày
> và lý do — không sửa đè.
>
> Lý do không phải hình thức: chọn phép kiểm sau khi đã thấy dữ liệu thì dù thật
> lòng không có ý gì, người phản biện vẫn có quyền coi là chọn cho vừa kết quả, và
> không có cách nào bác lại. Chốt trước là cách duy nhất giữ được quyền nói
> "chúng tôi định kiểm thế này từ đầu".

| | |
|---|---|
| **Ngày chốt** | _(điền khi ký — phải trước lượt nghe đầu tiên)_ |
| **Trạng thái** | 🟡 Bản thảo, chờ chốt |
| **Sinh lại các con số** | `npm run plan:sample` (seed 20260807, chạy lại cho ra đúng số cũ) |

---

## 1. Giả thuyết và phép kiểm — chốt trước

| Giả thuyết | Biến phụ thuộc | Phép kiểm | Cỡ hiệu ứng báo kèm |
|---|---|---|---|
| **H1** — nghe phân lớp giúp nhận diện vùng miền đúng hơn nghe âm rời rạc | đúng/sai, `layered` vs `isolated` | McNemar (tự chuyển sang bản chính xác khi cặp bất đồng < 25) | chênh tỉ lệ + CI 95%; tỉ số odds khi cả bốn ô > 0 |
| **FR-58** — hiệu ứng đến từ tính **mạch lạc vùng miền**, không chỉ từ lượng thông tin | đúng/sai, `layered` vs `scrambled` | như trên | như trên |
| **H2** — khung cảnh phân lớp được cảm nhận khác biệt | hai chiều ISO/TS 12913-3 suy từ 8 thuộc tính | Wilcoxon dấu-hạng | rank-biserial + Hodges–Lehmann kèm CI |

α = 0,05 hai phía cho mọi phép kiểm. **Bốn phép kiểm chính**: 2 phép so sánh ×
(1 tỉ lệ đúng + 2 chiều cảm nhận) = 6 — xem §5 về nhiều phép kiểm.

Cả ba phép đều đã cài và có kiểm thử: `src/research/statistics.js`,
`src/research/effect-size.js`, `src/research/soundscape-scale.js`. Chạy bằng
`npm run analyse -- <tệp log>`.

### Vì sao hai phép so sánh, không phải một

Chỉ chạy `layered` vs `isolated` thì kết quả dương tính vẫn giải thích được bằng
*"nhiều thông tin hơn thì đoán đúng hơn"* — không đụng đến chữ **"có chủ đích"**
trong phát biểu của H1. `scrambled` có **đúng bằng ấy lớp, đúng bằng ấy sự kiện,
đúng bằng ấy độ to**, chỉ khác ở chỗ các lớp lấy từ vùng khác nhau. Hai phép so
sánh cùng dương tính mới kết luận được về tính mạch lạc.

---

## 2. Cỡ mẫu

**Chốt: 96 người tham gia** — 85 là mức tối thiểu cho lực 80% ở kịch bản "vừa
phải", nhưng vòng cân bằng đầy đủ là **12 người** (4 địa điểm × 3 điều kiện) nên
cỡ mẫu phải là bội của 12 để mọi ô của vuông Latin có số người bằng nhau.

| n | bội của 12 | lực H1 | |
|---|---|---|---|
| 84 | ✓ | 79,8% | mức **sàn** — chênh với 85 nằm trong nhiễu mô phỏng |
| 85 | | 80,0% | tối thiểu về lực, nhưng lẻ vòng |
| **96** | ✓ | **85,8%** | **chốt** — có biên cho người bị loại |

Chọn 96 chứ không 84: §3 có tiêu chí loại người tham gia, mà loại vài người ở mức
84 là tụt ngay xuống dưới 80%.

### 2.1 Con số

> ⚠ Bảng dưới là **bản gốc**, giữ nguyên để đối chiếu. Ba cặp `p01`/`p10` ở đây
> được khai thẳng, không nói mức đoán mò; sau khi sửa lỗi danh sách trả lời
> (spec S1.1) chúng được tính lại từ mô hình "biết + đoán mò" — xem **§7, sửa
> đổi 1**. Con số chốt **96** không đổi.

Mỗi người đóng góp **đúng 1 cặp cho mỗi phép so sánh**: bốn lượt liên tiếp trong
vòng xoay 3 điều kiện luôn phủ đủ cả ba điều kiện. Nên *số cặp = số người*.

| Kịch bản | p01 | p10 | chênh | công thức Connor | **mô phỏng** |
|---|---|---|---|---|---|
| dè dặt | 0,25 | 0,15 | 10 đpt | 312 | **325** |
| vừa phải | 0,30 | 0,10 | 20 đpt | 77 | **85** |
| lạc quan | 0,35 | 0,05 | 30 đpt | 33 | **35** |

`p01` = tỉ lệ người đoán **đúng ở `layered` mà sai ở `isolated`**; `p10` là chiều
ngược lại. Đây là tỉ lệ **cặp bất đồng**, không phải tỉ lệ đúng của từng điều
kiện — McNemar bỏ qua mọi cặp cùng đúng hoặc cùng sai, nên nhầm chỗ này là hỏng
cả bài tính.

Cho H2 (Wilcoxon, d Cohen trên chênh lệch từng cặp): d = 0,3 → 92 người ·
d = 0,5 → 35 · d = 0,8 → 15.

### 2.2 🔴 Công thức trong sách cho con số THIẾU

Hai cột trên không bằng nhau, và chênh **có hướng cố định**:

| n | lực theo công thức | lực thật (mô phỏng) | chênh |
|---|---|---|---|
| 48 | 59,6% | 52,1% | −7,5 đpt |
| 77 | **80,5%** | **75,4%** | −5,1 đpt |
| 100 | 89,8% | 87,5% | −2,3 đpt |
| 200 | 99,6% | 99,8% | +0,2 đpt |

Nguyên nhân: công thức Connor (1987) giả định xấp xỉ chuẩn **không hiệu chỉnh**,
còn phép kiểm thật dùng bản **chính xác** khi ít cặp bất đồng và bản chi bình
phương **có hiệu chỉnh** khi nhiều — cả hai đều thận trọng hơn. Đo được: sai số
loại I thực tế **3,0%** chứ không phải 5,0%. Phép kiểm tiêu ít hơn α danh nghĩa,
nên cũng nhận lại ít lực hơn.

Chênh teo dần khi n lớn, đúng như kỳ vọng với một xấp xỉ tiệm cận. Nhưng ở đúng
khoảng n mà đề tài quan tâm thì nó đáng 5–8 điểm phần trăm lực.

**⇒ Lấy con số mô phỏng.** Mô phỏng chạy chính `mcnemarTest` mà `npm run analyse`
sẽ dùng, nên nó trả lời đúng câu cần hỏi: *phép kiểm này, trên dữ liệu này, phát
hiện được gì*. Có kiểm thử khoá lại phát hiện này (`src/research/power.test.js`).

### 2.3 🔴 "40–60 người" trong lộ trình là KHÔNG ĐỦ

| n | lực cho H1 (kịch bản vừa phải) | lực cho H2 (d = 0,5) |
|---|---|---|
| 30 | 30,3% | 73,0% |
| 40 | 43,7% | 85,9% ✓ |
| **48** | **52,1%** | 92,0% ✓ |
| 60 | 63,3% | 96,8% ✓ |
| 80 | 77,6% | 99,1% ✓ |
| 100 | 87,5% ✓ | 99,7% ✓ |

Với 48 người, xác suất **bỏ sót một hiệu ứng có thật** của H1 là gần một nửa. Kết
quả "không có ý nghĩa thống kê" khi đó không nói được gì về H1 — chỉ nói mẫu nhỏ.

H2 thì ngược lại: 40 người đã đủ. Ràng buộc nằm ở H1, vì tỉ lệ đúng/sai là biến
nhị phân nên tốn mẫu hơn hẳn biến liên tục.

### 2.4 Lựa chọn nếu không tuyển đủ 85 người

Xếp theo mức tôi khuyến nghị:

1. **Tăng số lượt mỗi người từ 4 lên 8** (mỗi vùng nghe 2 lần, bản trộn khác và
   điều kiện khác). Mỗi người đóng góp 2 cặp thay vì 1 ⇒ cần khoảng một nửa số
   người. Đổi lại: phiên dài gấp đôi (8 phút âm + 64 câu Likert thay vì 32), và
   **cần đủ 12 bản trộn** (việc A3.3) để không ai nghe lại cùng một bản.
   *Cần kiểm: nghe cùng một vùng hai lần có làm người ta nhận ra không.*
2. **Chấp nhận lực 78% với 80 người.** Thấp hơn chuẩn 80% một chút, nhưng khai
   báo thẳng trong báo cáo thì vẫn là một nghiên cứu trung thực.
3. **Hạ H1 xuống giả thuyết thăm dò**, báo cáo cỡ hiệu ứng kèm CI thay vì kết
   luận có/không. Ít tham vọng hơn nhưng không sai.

Điều **không** được làm: thu 48 người, thấy p = 0,08, rồi tuyển thêm cho tới khi
p < 0,05. Đó là "p-hacking" bằng cách dừng linh hoạt, và nó đẩy sai số loại I
thật lên xa trên 5%. Nếu cần dừng giữa chừng thì phải chốt quy tắc dừng **ngay
trong văn bản này**, trước khi thu.

### 2.5 Giả định nào đang chống đỡ con số này

Nói thẳng: **chưa có số liệu mồi**. Ba kịch bản ở §2.1 là phán đoán, không phải
ước lượng từ dữ liệu. Việc **C4.1 (pilot 5–8 người)** là để thay phán đoán bằng
số đo — sau pilot phải chạy lại `npm run plan:sample` với `p01`/`p10` quan sát
được và cập nhật §2.1 bằng một mục sửa đổi.

Một yếu tố làm con số **dè dặt hơn thực tế có thể cần**: trong một cặp, hai điều
kiện rơi vào **hai địa điểm khác nhau** (ví dụ `layered`@Huế so với
`isolated`@Hà Nội). Không tránh được — cho một người nghe cùng một vùng hai lần
là họ nhận ra. Hệ quả: chênh lệch giữa các vùng cộng thêm nhiễu vào từng cặp.
Thiết kế xoay vòng cân bằng chuyện này **giữa** những người tham gia, nhưng
**trong** một cặp thì nhiễu vẫn còn, nên `p01`/`p10` thật có thể gần nhau hơn giả
định — tức cần nhiều người hơn nữa.

---

## 3. Tiêu chí loại lượt và loại người tham gia — chốt trước

Chốt trước vì đây là chỗ dễ loại "những người làm hỏng kết quả" mà không nhận ra
mình đang làm thế.

| Loại | Điều kiện | Máy hay người quyết |
|---|---|---|
| Loại **lượt** | Không có — giao diện đã chặn nộp khi chưa nghe hết đoạn âm, chưa đoán vùng, hoặc chưa chấm đủ 8 thuộc tính | máy (`experiment-view.js`) |
| Loại **người** | Phiên không hoàn tất (`complete: false`) | máy |
| Loại **người** | Chấm y hệt một giá trị cho cả 8 thuộc tính ở **cả 4 lượt** | máy — quy tắc cơ giới, quyết định trước khi nhìn dữ liệu |
| Loại **người** | Tự khai có vấn đề về thính lực hoặc nghe bằng loa ngoài trong môi trường ồn | tự khai, hỏi ở cuối phiên |

Không có tiêu chí loại nào dựa trên **kết quả** của người đó. Loại người đoán sai
nhiều, hay loại "người có vẻ không nghiêm túc" theo cảm nhận, là cách chắc chắn
nhất để tự tạo ra kết quả mình muốn.

Số người bị loại và lý do **phải báo cáo**, kể cả khi bằng 0.

---

## 4. Dữ liệu thiếu

- Thiếu một lượt ⇒ người đó mất cặp ở phép so sánh liên quan; các phép khác vẫn
  dùng được. `pairResponses` xử lý sẵn và đếm số cặp bị bỏ.
- **Không** bù dữ liệu thiếu bằng ước lượng. Với 4 lượt/người thì mọi phép bù đều
  dựa trên quá ít thông tin để đáng tin.
- Số cặp bỏ đi phải in ra trong báo cáo — `npm run analyse` đã in sẵn.

---

## 5. Nhiều phép kiểm

Sáu phép kiểm chính (2 phép so sánh × 3 biến phụ thuộc). Xử lý:

- **H1 là giả thuyết chính**, kiểm bằng `layered` vs `isolated` trên tỉ lệ đúng.
  Không hiệu chỉnh — chỉ có một phép.
- Năm phép còn lại là **khẳng định phụ**, báo cáo p thô **kèm nhãn rõ là phụ**.
  Không dùng chúng để tuyên bố phát hiện độc lập.
- Đã tránh được một nguồn tăng phát nghiêm trọng ở chỗ khác: hỏi 8 thuộc tính ISO
  nhưng **kiểm trên 2 chiều suy ra**, không kiểm cả 8. Kiểm 8 thuộc tính × 2 phép
  so sánh sẽ là 16 phép, và xác suất có ít nhất một dương tính giả ≈ 56%.

---

## 6. Những gì đã cố định bằng máy, không cần tin vào kỷ luật

Ghi ở đây để người phản biện kiểm lại được:

| Việc | Cách bảo đảm |
|---|---|
| Mọi người nghe **đúng cùng một tệp** | `npm run render:stimuli -- --verify` kết xuất lại và so SHA-256: 12/12 khớp byte |
| Độ to không thành yếu tố gây nhiễu | đo trên tệp đã kết xuất: lệch 0,04 LU giữa 12 kích thích (FR-57, ngưỡng 1 LU) |
| Thời lượng và số sự kiện cân bằng giữa ba điều kiện | `checkStimulusBalance`, đạt với ngưỡng 0 |
| Thứ tự nghe cân bằng giữa người tham gia | vuông Latin xoay vòng, `assignment.js` |
| Người tham gia không đoán được đáp án từ trang web | tên tệp theo băm nội dung + giao diện ném lỗi nếu URL lộ; đo trong trình duyệt thật: 0/7 chuỗi bí mật trong DOM |
| Không sửa được câu trả lời sau khi nghe lượt sau | máy trạng thái phiên không có `back()` |
| Đúng/sai do máy chấm | `correct: guess === trial.location_id`, người tham gia không tự khai |
| Không loại trừ được đáp án qua các lượt | danh sách trả lời 8 ô = 4 vùng thật + 4 phương án nhiễu (`data/distractors.json`), xáo theo (người, lượt) có seed; `session.js` từ chối cấu hình không có nhiễu; ô thật và ô nhiễu dựng giống hệt (test khoá) — thêm ở sửa đổi 1 |

---

## 7. Sửa đổi

_(Thêm mục mới ở đây, ghi ngày và lý do. Không sửa đè phần trên.)_

| Ngày | Sửa gì | Vì sao |
|---|---|---|
| 03/09/2026 *(ngày hệ thống — xem spec S0.5)* | **Sửa đổi 1** — tính lại cỡ mẫu §2.1 theo mô hình "biết + đoán mò" sau khi sửa lỗi danh sách trả lời (spec S1.1); thêm một dòng vào §6 | Danh sách trả lời cũ = đúng 4 vùng sẽ nghe ⇒ lượt 4 chắc chắn đúng, mức đoán mò trung bình ≈ 52%. Ba cặp p01/p10 cũ khai thẳng nên không sửa được theo thiết kế mới |

### 7.1 Sửa đổi 1 — cỡ mẫu tính lại với phương án nhiễu (spec S1.1 → S1.2)

**Kết luận trước:** giữ **96 người**. Sàn mới là **84** (mô phỏng, kịch bản vừa
phải, thiết kế mới) — đúng bằng sàn cũ; 96 cho lực **86,1%**. Con số không đổi
nhưng **cơ sở** của nó đổi, và cơ sở mới vững hơn.

**Lỗi được sửa.** Mỗi người nghe mỗi vùng đúng một lần (§2.5), mà danh sách trả
lời đúng bằng bốn vùng đó. Người nhớ ba câu trước thấy lượt 4 còn một lựa chọn.
Mức đoán mò trung bình qua bốn lượt, giả định loại trừ hoàn hảo:
(1/4 + 1/3 + 1/2 + 1/1)/4 ≈ **52,1%**. Sau S1.1 (8 ô): (1/8 + 1/7 + 1/6 + 1/5)/4
≈ **15,9%**. `src/research/guessing-model.js` (12 test) cài hai phép tính này.

**Vì sao phải đổi cách khai kịch bản.** Ba cặp `p01`/`p10` ở §2.1 khai thẳng tỉ
lệ cặp bất đồng, không nói mức đoán mò. Đổi thiết kế thì không biết sửa chúng
thế nào. Nay kịch bản khai **tỉ lệ người thật sự nhận ra nơi đó** (`biết`) ở từng
điều kiện; mức đoán mò do thiết kế quyết định; `p01`/`p10` suy ra với giả định
**tương quan cực đại trong người** (ai biết ở điều kiện khó thì biết ở điều kiện
dễ — cặp bất đồng ít nhất, cỡ mẫu không nhỏ hơn thật). Dạng đóng:

> p01 − p10 = (biết_L − biết_I) × (1 − đoán mò)

Đoán mò 52% bào mất **nửa** hiệu ứng; 16% bào mất một phần sáu.

**Bảng mới** (`npm run plan:sample`, seed 20260807, 4000 lượt/ô; `biết_I` = 35%):

| Kịch bản | biết_L | Thiết kế | đoán mò | p01 | p10 | chênh | Connor | **mô phỏng** |
|---|---|---|---|---|---|---|---|---|
| dè dặt (+10 đpt) | 45% | cũ | 52,1% | 0,185 | 0,137 | 4,8 đpt | 1100 | **> 1000** |
| dè dặt (+10 đpt) | 45% | **mới** | 15,9% | 0,158 | 0,073 | 8,4 đpt | 254 | **273** |
| vừa phải (+20 đpt) | 55% | cũ | 52,1% | 0,208 | 0,112 | 9,6 đpt | 272 | **286** |
| vừa phải (+20 đpt) | 55% | **mới** | 15,9% | 0,228 | 0,060 | 16,8 đpt | 78 | **84** |
| lạc quan (+30 đpt) | 65% | cũ | 52,1% | 0,231 | 0,087 | 14,4 đpt | 119 | **129** |
| lạc quan (+30 đpt) | 65% | **mới** | 15,9% | 0,299 | 0,047 | 25,2 đpt | 41 | **44** |

Lực theo n, kịch bản vừa phải:

| n | H1 thiết kế cũ | **H1 thiết kế mới** | H2 (d = 0,5) |
|---|---|---|---|
| 48 | 15,8% | 51,9% | 92,0% ✓ |
| 72 | 23,1% | 73,4% | 98,5% ✓ |
| 84 | 26,9% | **80,3% ✓** | 99,3% ✓ |
| **96** | 30,9% | **86,1% ✓** | 99,7% ✓ |
| 108 | 35,8% | 89,5% ✓ | 99,9% ✓ |

**Hai điều bảng này nói mà bảng cũ không nói:**

1. Với thiết kế cũ, 96 người chỉ cho lực **31%** ở cùng mức "biết". Cặp
   `p01 = 0,30 / p10 = 0,10` của kịch bản "vừa phải" cũ, dịch ngược qua mô hình,
   tương ứng chênh "biết" khoảng **42 điểm** — lạc quan hơn nhiều so với nhãn
   "chênh 20 điểm" của nó. Con số 96 cũ đứng được là nhờ sự lạc quan ngầm đó;
   con số 96 mới đứng trên mức đoán mò đã hạ.
2. Thiết kế mới với 4 phương án nhiễu **chưa đủ** cho kịch bản dè dặt (273
   người). Nếu pilot C4.1 cho chênh "biết" dưới 15 điểm thì phải chọn: tăng
   4 → 8 lượt/người (§2.4 mục 1), hoặc tăng số phương án nhiễu (12 ô ⇒ đoán mò
   ≈ 10%), hoặc hạ H1 xuống thăm dò. Quyết sau pilot, ghi bằng sửa đổi 2.

**Giả định còn treo:** `biết_I` = 35% là phán đoán; mô hình bỏ qua nhiễu do hai
điều kiện của một cặp rơi vào hai địa điểm khác nhau (§2.5). Pilot phải đo cả
tỉ lệ đúng theo điều kiện **và** tỉ lệ câu sai rơi vào phương án nhiễu
(`npm run analyse` in sẵn dòng này): nếu gần 0 là người tham gia vẫn loại trừ
được — xem lại danh sách nhiễu trước khi tuyển đại trà.
