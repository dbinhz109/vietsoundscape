# Spec việc cần làm — theo hai lần đánh giá lại

**Ngày lập:** 07/08/2026 (theo dấu thời gian tệp; đồng hồ hệ thống không đáng tin — xem S0.5)
**Nguồn:** hai lần đánh giá lại dự án, kiểm bằng `stat`, `grep`, `npm test`, không dựa trí nhớ
**Quan hệ với lộ trình:** tệp này **không thay** `LO-TRINH-VietSoundscape.md`. Nó liệt kê những việc mà lộ trình **thiếu, đánh dấu sai, hoặc xếp sai thứ tự** — làm xong thì hợp nhất ngược vào lộ trình.

## Cách đọc

Mỗi việc có bốn phần cố định: **Vì sao** (một câu, kèm bằng chứng), **Làm gì**, **Đạt khi** (điều kiện đo được — không có thì chưa xong), **Vai / Công / Chặn bởi**.

Vai: **NC** nghiên cứu · **ÂT** âm thanh & dữ liệu · **PM** lập trình · **VH** văn hoá & khảo sát.

Thứ tự ưu tiên **không phải** thứ tự giá trị. Nó là thứ tự **rủi ro nếu không làm**: S0 mất công đã làm, S1 hỏng phép đo chính, S2 chưa qua cổng go/no-go, S3 đường găng chưa nhúc nhích, S4 dọn dẹp.

---

## S0 — Hạ tầng: dừng phơi công sức ra rủi ro *(hôm nay, ~2 giờ)*

### S0.1 — Đưa vào git

**Vì sao:** `git rev-parse` → `fatal: not a git repository`. 12.750 dòng / 144 tệp / 3 ngày công nằm trên một ổ ext4, không thư mục đồng bộ nào. `.gitignore` đã có 16 dòng — tức là đã định làm mà chưa làm. Đây là việc B0.3 của lộ trình, hạn tuần 2.

**Làm gì:**
- `git init`, commit đầu tiên với toàn bộ hiện trạng, message `chore: khởi tạo repo từ hiện trạng ngày 07/08`
- Tạo remote riêng tư (GitHub/GitLab), `git push -u origin main`
- Kiểm `.gitignore` đã loại `node_modules/`, `build/`, `dist/`, `spike/audio/`, `coverage/`, `.playwright-mcp/` — **và thêm** `.remember/`

**Đạt khi:**
- [x] `git log --oneline | wc -l` ≥ 1 và `git remote -v` có URL — `https://github.com/dbinhz109/vietsoundscape` (private)
- [x] `git status` sạch sau commit — 101 tệp, 24.916 dòng, tệp lớn nhất 184 KB
- [x] Clone về máy khác, `npm ci && npm test` xanh 433/433 — clone sạch vào thư mục tạm: 23 tệp test, 433/433, không lọt `.remember`/`build`/`dist`

**Vai:** PM · **Công:** 15 phút · **Chặn bởi:** không

### S0.2 — README

**Vì sao:** không có. Người mới nhận repo không biết chạy lệnh nào trước.

**Làm gì:** một trang: mục đích, cài đặt, bảng 16 lệnh `npm run` với một dòng mô tả mỗi cái, trỏ tới BA / lộ trình / `phap-ly/` / `nghien-cuu/`.

**Đạt khi:**
- [x] Người chưa từng mở repo chạy được `npm run dev` và `npm test` chỉ bằng đọc README — kiểm bằng clone sạch vào thư mục tạm, làm đúng 4 lệnh mục "Chạy lần đầu": `npm ci` → `npm test` → `gen:audio` (10 tệp) → `dev`; `/`, `/thuc-nghiem`, `data/`, âm đều trả 200

**Vai:** PM · **Công:** 30 phút · **Chặn bởi:** S0.1

### S0.3 — CI tối thiểu

**Vì sao:** 16 lệnh kiểm tra, không lệnh nào tự chạy. Một thay đổi làm hỏng `validate` hay phá băm kích thích thì chỉ ai nhớ chạy tay mới biết.

**Làm gì:** một workflow chạy trên mỗi push: `npm ci` → `npm test` → `npm run validate` → `npm run build`. Chưa cần `render:stimuli` trong CI (cần ffmpeg + 198 MB).

**Đạt khi:**
- [x] Push một commit cố ý làm hỏng một test → CI đỏ — nhánh tạm `ci-smoke`, commit `77520c2`, run 33733892690 **failure**, log ghi đúng `1 failed | 433 passed` tại bước `npm test`
- [x] Sửa lại → CI xanh — hoàn lại (`6fd7598`), run 33734010401 **success**; main `491d57b` run 33733873122 **success**. Nhánh tạm đã xoá

**Vai:** PM · **Công:** 45 phút · **Chặn bởi:** S0.1

### S0.4 — Đồng bộ lộ trình với thực tế

**Vì sao:** luồng B ghi 2/19 xong; kiểm code thì ≥ 10/19. Tám việc đã có code nhưng chưa đánh dấu: B0.1, B0.3 (một phần), B1.1, B1.3, B2.1, B2.2, B2.3, B2.5. Lộ trình là công cụ quyết định làm gì tiếp — nó đang sai thì quyết định sai.

**Làm gì:** đi từng dòng luồng B, đối chiếu code, đánh dấu `XONG` kèm đường dẫn tệp làm bằng chứng. Đánh dấu B0.3 là **XONG một phần** (JS thuần đã chốt; repo/CI là S0.1–S0.3).

**Đạt khi:**
- [x] Mỗi dòng `XONG` có ít nhất một đường dẫn tệp — 8 dòng B0.1, B0.3, B1.1, B1.3, B2.1, B2.2, B2.3, B2.5 cập nhật trong commit `9afd09e`; dòng nào còn phần chưa làm (điện thoại thật, iOS Safari, formatter, trình đọc màn hình) ghi 🔴 ngay trong dòng
- [x] Không dòng nào có code chạy được mà còn để trống — B0.2 (thu thử) để trống là đúng: chưa có bản thu nào

**Vai:** PM · **Công:** 30 phút · **Chặn bởi:** không

### S0.5 — Xác định ngày thật

**Vì sao:** `date` → 2026-09-03; mọi tệp mã → 2026-08-07. Đồng hồ nhảy ngay trong một phiên. Lộ trình tính theo tuần, nên không biết đang ở tuần 1 hay tuần 5 là không biết mình trễ hay không.

**Làm gì:** người thật xác nhận hôm nay là ngày nào; chỉnh đồng hồ máy; ghi ngày đúng vào đầu tệp này.

**Đạt khi:**
- [ ] Dòng "Ngày lập" ở trên được sửa bằng ngày đã xác nhận
- [ ] Nếu là tháng 9: mở việc **S0.6 — giải thích 4 tuần đứng im** và xếp lại lộ trình

**Vai:** NC · **Công:** 5 phút · **Chặn bởi:** không

---

## S1 — Sửa phép đo chính *trước* khi ký kế hoạch phân tích *(tuần này)*

### S1.1 — Phương án nhiễu trong danh sách trả lời

**Vì sao:** `assignment.js` cho mỗi vùng nghe **đúng một lần**; `experiment-view.js` cho danh sách trả lời **đúng bốn vùng đó**. Người tham gia nhớ ba câu trước thì lượt 4 còn một lựa chọn, lượt 3 còn hai. Không tài liệu nào nhắc tới (grep `loại trừ|elimination` → 0). Tỉ lệ đúng bị thổi lên ⇒ cặp cùng-đúng tăng ⇒ McNemar mất lực ⇒ con số 96 người là lạc quan. ~25% lượt gần như không mang thông tin.

**Làm gì:**
- Thêm `data/distractors.json`: ≥ 4 địa danh Việt Nam **thật, quen, có không gian âm thanh phân biệt được** nhưng **không** nằm trong bộ kích thích (gợi ý: Sa Pa, Hội An, Đà Lạt, Phú Quốc — VH chốt)
- `experiment-view.js`: danh sách trả lời = 4 vùng thật + phương án nhiễu, **xáo thứ tự theo seed** `participantIndex × order` để tái lập được và không học được vị trí
- `session.js`: nhận `answerOptions` tách khỏi `locations`; `guess` chỉ cần nằm trong `answerOptions`; `correct` vẫn là `guess === trial.location_id`
- Màn đồng thuận nói rõ: *"Danh sách có nhiều địa điểm hơn số đoạn bạn sẽ nghe."* — giết heuristic loại trừ mà không lừa dối
- **TDD:** test trước cho từng điểm trên

**Đạt khi:**
- [x] Trong DOM mỗi lượt có ≥ 8 ô trả lời, đúng 4 ô là vùng thật — test `experiment-view.test.js` + đo trong trình duyệt thật `/thuc-nghiem?nguoi=3`: 8 ô, 4 thật, mọi ô cùng hình dạng DOM, 0 chuỗi lộ
- [x] Thứ tự ô khác nhau giữa `order` 1 và 2 của cùng người, nhưng **giống nhau** khi dựng lại cùng `participantIndex` + `order` — `answer-options.test.js` (12 người × 4 lượt đều khác; 48 × 4 không lệch vị trí), `session.test.js`, `experiment-view.test.js`
- [x] Chọn phương án nhiễu → `session.submit` nhận, `correct: false`, không ném lỗi — test ở cả session và view
- [x] `npm run analyse -- --demo` vẫn chạy (demo phải sinh cả câu đoán nhiễu) — 95 câu sai: 33 vào vùng thật khác, 62 vào nhiễu; `analyse` nay in dòng này cho mọi log
- [x] Test không lộ đáp án vẫn xanh: mã vùng thật không xuất hiện khác cách với mã nhiễu — test mới "ô vùng thật và ô nhiễu dựng GIỐNG HỆT nhau" + thiếu nhãn thì ném lỗi; 466/466 xanh, `validate` ĐẠT

**Vai:** PM + VH · **Công:** 3 giờ · **Chặn bởi:** không

### S1.2 — Tính lại cỡ mẫu với mức ngẫu nhiên mới

**Vì sao:** mức đoán mò đổi từ 25% thành 4/(4+D). Ba kịch bản `p01`/`p10` trong `plan-sample.mjs` lập trên giả định cũ.

**Làm gì:** cập nhật ba kịch bản với lý giải mới; chạy `npm run plan:sample`; ghi kết quả vào `nghien-cuu/ke-hoach-phan-tich.md` §2.1 bằng **một mục §7 Sửa đổi** ghi ngày và lý do — không sửa đè.

**Đạt khi:**
- [x] §7 có dòng sửa đổi dẫn tới S1.1 — "Sửa đổi 1" + mục §7.1 với bảng mới; §2.1 giữ nguyên, chỉ thêm dòng trỏ sang §7
- [x] Con số 96 được xác nhận lại hoặc thay bằng con số mới, kèm bảng lực mới — **96 xác nhận lại**: sàn 84 (mô phỏng), 96 → 86,1%; cùng mức "biết" thiết kế cũ cần 286. Kịch bản khai bằng "biết + đoán mò" (`guessing-model.js`, 12 test) thay cho p01/p10 khai thẳng
- [x] `LO-TRINH` C5.1 và BA §10.2 cùng một con số — cả hai đang là 96, không phải sửa

**Vai:** NC · **Công:** 1 giờ · **Chặn bởi:** S1.1

### S1.3 — Quyết định: vang áp theo lớp hay theo bản trộn

**Vì sao:** bản thu thực địa đã mang sẵn âm học nơi đó — chồng thêm vang cùng chỗ là áp hai lần. Vang chỉ có việc thật với lớp tải từ kho. Nếu quy tắc là "áp theo lớp", `render-graph.js` và `engine.js` phải đổi cấu trúc (BA §5.2b). Đây là quyết định nghiên cứu, không phải kỹ thuật.

**Làm gì:** NC quyết một trong ba: (a) áp theo bản trộn như hiện tại, (b) áp theo lớp, chỉ lớp `licensed_archive`, (c) bỏ vang khỏi kích thích thực nghiệm, chỉ giữ ở phòng nghe. Ghi vào BA §5.2b kèm lý do.

**Đạt khi:**
- [ ] BA §5.2b có dòng "Đã chốt: …" với chữ ký NC
- [ ] Nếu (b): mở việc kỹ thuật riêng, ước 4 giờ, TDD

**Vai:** NC · **Công:** 30 phút quyết định · **Chặn bởi:** không (nhưng nên có S2.1 để nghe thử trước khi quyết)

### S1.4 — Ký và ghi ngày kế hoạch phân tích

**Vì sao:** `nghien-cuu/ke-hoach-phan-tich.md` đang 🟡 bản thảo. Chưa ký thì chưa có giá trị "đăng ký trước". Ký trước khi sửa S1.1 là đăng ký một thiết kế có lỗ.

**Làm gì:** sau S1.1–S1.3, NC đọc lại toàn bộ, điền ngày, đổi trạng thái sang 🟢 Đã chốt. Commit riêng, tag `pre-registration-v1`.

**Đạt khi:**
- [ ] `git tag` có `pre-registration-v1` và tệp trong tag đó có ngày
- [ ] Mọi sửa sau đó chỉ nằm ở §7

**Vai:** NC · **Công:** 1 giờ đọc · **Chặn bởi:** S0.1, S1.1, S1.2, S1.3

---

## S2 — Đóng cổng G0 bằng vật liệu thật *(tuần này — không cần đi xa)*

### S2.1 — Một tệp âm thật qua toàn bộ đường ống

**Vì sao:** mọi thứ — 12 kích thích, 433 test, hai phiên chạy thật trong trình duyệt — đều trên `np.sin` và nhiễu numpy. Chưa **một** giả định nào về âm thật được kiểm: tìm điểm loop trên tiếng chợ, chuẩn hoá LUFS có làm bẹt tiếng rao, `scrambled` có nghe "sai" thật.

**Làm gì:** thu 60 giây ở nơi gần nhất có tiếng nền liên tục (quán cà phê, ngã tư, chợ) bằng điện thoại; chạy `npm run process`; khai một bản trộn tạm dùng tệp đó làm keynote; mở trong phòng nghe; nghe loop 5 phút.

**Đạt khi:**
- [ ] `npm run process` chạy xong không lỗi trên tệp thật, xuất Opus 72k + 144k
- [ ] `findLoopPoints` trả về điểm loop (không `null`) — ghi lại `startS`/`endS`
- [ ] Nghe 5 phút, ghi vào `BAO-CAO-G0.md`: có nghe ra điểm nối không, ở giây thứ mấy
- [ ] So kích cỡ: WAV vs Opus 72k, để chứng minh hay bác con số "0,9 s" của B2.4

**Vai:** ÂT · **Công:** 2 giờ · **Chặn bởi:** không

### S2.2 — `check:recorder` trên bản thu S2.1

**Vì sao:** việc A0.1 của lộ trình, hạn tuần 2. Công cụ dựng xong, chưa chạy trên bản thu nào. Không biết AGC/khử ồn của thiết bị có tắt thật.

**Làm gì:** thu theo đúng mẫu 25 s lặng → 10 s có âm → 25 s lặng; chạy `npm run check:recorder`.

**Đạt khi:**
- [ ] Kết quả ghi vào `BAO-CAO-G0.md` kèm tên thiết bị, kèm kết luận "dùng được / không"
- [ ] Nếu "không": chốt thiết bị khác trước A1.1

**Vai:** ÂT · **Công:** 30 phút · **Chặn bởi:** không

### S2.3 — Trộn 5 lớp trên điện thoại thật tầm trung

**Vì sao:** điều kiện 2 của cổng G0. Chưa đo trên thiết bị nào. RAM âm thanh hiện báo 12 MB trên máy tính với 5 lớp WAV 20 s — trên điện thoại chưa biết.

**Làm gì:** mở `npm run dev` qua mạng LAN trên một điện thoại Android tầm trung (≈ 3–4 triệu, ≥ 3 năm tuổi); mở địa điểm có 5 lớp; đọc `RAM âm thanh` trên thanh trạng thái; nghe 2 phút xem có rớt tiếng.

**Đạt khi:**
- [ ] Ghi vào `BAO-CAO-G0.md`: tên máy, RAM âm thanh đọc được, có rớt tiếng không
- [ ] RAM ≤ 150 MB **và** không rớt tiếng ⇒ điều kiện 2 đạt; ngược lại mở việc "đổi chiến lược âm" theo đúng lời lộ trình

**Vai:** PM + ÂT · **Công:** 1 giờ · **Chặn bởi:** không

### S2.4 — Đóng cổng G0 chính thức

**Vì sao:** cổng go/no-go duy nhất của dự án. Bốn ô còn trống trong lộ trình.

**Làm gì:** tích bốn ô ở `LO-TRINH` "Cổng G0", mỗi ô dẫn tới mục tương ứng trong `BAO-CAO-G0.md`. Ô 3 (hồ sơ đồng thuận) đã đủ điều kiện; ô 4 (Q1, Q2, Q3, Q4, Q7) — Q1 chờ S2.2.

**Đạt khi:**
- [ ] 4/4 ô tích, hoặc có ô không đạt kèm quyết định "đổi chiến lược" bằng chữ

**Vai:** NC · **Công:** 30 phút · **Chặn bởi:** S2.1, S2.2, S2.3

---

## S3 — Khởi động đường găng *(bắt đầu tuần này, kéo dài)*

### S3.1 — Khảo sát kho âm mở: điền 17 mẫu

**Vì sao:** 17 mẫu `licensed_archive` — `source_url`: 0, `license`: 0. Nửa "dễ" của mô hình lai chưa động. Việc A0.1b, công cụ `npm run survey` đã dựng.

**Làm gì:** chạy `npm run survey` lấy phiếu; tìm trên Freesound / Wikimedia Commons / kho ISO; với mỗi mẫu điền `source_url`, `license`, `attribution`; mẫu nào không tìm được thì đổi `provenance` sang `field_recording` và ghi lý do.

**Đạt khi:**
- [ ] `npm run validate` ĐẠT với 17/17 có `source_url` + `license`, hoặc đã chuyển sang tự thu
- [ ] Mọi `license` nằm trong danh sách cho phép ở `phap-ly/09` (không NC, tránh SA)

**Vai:** ÂT + VH · **Công:** 1 ngày · **Chặn bởi:** không

### S3.2 — Ba việc pháp lý cần người thật

**Vì sao:** A0.3b/c/d trong lộ trình, đều 🔴. A0.3b có thể **chặn toàn bộ việc thu âm**: nếu phải nộp hồ sơ đánh giá tác động trong 60 ngày kể từ mẫu có giọng người đầu tiên, thì mốc đó chạy từ ngày thu chứ không từ ngày ra mắt.

**Làm gì:** không đổi so với lộ trình. Nêu lại ở đây vì xếp sai thứ tự: phải xong **trước** A1.1, và **trước** S2.1 nếu bản thu thử có giọng người.

**Đạt khi:**
- [ ] A0.3b: câu trả lời bằng văn bản từ phòng pháp chế, lưu vào `phap-ly/nguon/`
- [ ] A0.3c: tên người phụ trách điền vào `phap-ly/01`, `04`, `07`
- [ ] A0.3d: thư đã gửi, có đầu mối trả lời

**Vai:** NC + VH · **Công:** tuỳ phía trường · **Chặn bởi:** không — nhưng **chặn** A1.1

### S3.3 — Kế hoạch thực địa đợt 1, viết ra giấy

**Vì sao:** A1.1 nói "thu đợt 1: địa điểm 1 và 2" nhưng chưa có ngày, chưa có người, chưa có danh sách mẫu cần thu theo giờ trong ngày. Bốn địa điểm trải từ Hà Nội tới Đắk Lắk — không lên lịch là không đi.

**Làm gì:** một trang: địa điểm, ngày, ai đi, danh sách `clip_id` cần thu (lọc `provenance: field_recording` từ `clips.json`), khung giờ cho từng mẫu (tiếng rao sáng ≠ chiều), thiết bị, bản in `phap-ly/01`, `02`, `05`. Kèm mục **đo phản hồi xung** (A1.1b) nếu S1.3 chốt còn dùng vang.

**Đạt khi:**
- [ ] Tệp `nghien-cuu/ke-hoach-thuc-dia-dot-1.md` có ngày cụ thể và tên người
- [ ] Danh sách mẫu khớp `clips.json` (kiểm bằng script nhỏ hoặc tay)

**Vai:** ÂT + VH · **Công:** 2 giờ · **Chặn bởi:** S2.2 (chốt thiết bị), S3.2

---

## S4 — Dọn tài liệu *(khi rảnh, trước khi có người mới)*

### S4.1 — Tách BA thành yêu cầu + sổ quyết định

**Vì sao:** BA 854 dòng, **224 dòng blockquote** (26%) là ghi chú chèn theo thời gian. Người mới đọc không tìm được yêu cầu, chỉ thấy lịch sử suy nghĩ.

**Làm gì:** giữ `BA-VietSoundscape.md` là **yêu cầu hiện hành** (FR/NFR, mô hình dữ liệu, sơ đồ đã sửa); chuyển các khối `>` sang `nghien-cuu/so-quyet-dinh.md`, mỗi khối một mục có ngày, có "Quyết định / Vì sao / Bằng chứng / Ảnh hưởng tới FR nào".

**Đạt khi:**
- [ ] BA còn < 20 dòng blockquote, tất cả là chú thích ngắn trỏ sang sổ
- [ ] Sổ quyết định có ≥ 15 mục, mỗi mục ≤ 30 dòng
- [ ] Không mất thông tin: `wc -w` tổng hai tệp ≥ 95% BA cũ

**Vai:** NC · **Công:** 3 giờ · **Chặn bởi:** không

### S4.2 — Trả lời trước câu "sao không dùng R"

**Vì sao:** 873 dòng thống kê tự cài (`statistics.js` 346 + `effect-size.js` 247 + `power.js` 280). Trong R là ~5 dòng. Người phản biện sẽ hỏi; không có câu trả lời sẵn thì trông như không biết R tồn tại.

**Làm gì:** một đoạn trong `nghien-cuu/ke-hoach-phan-tich.md` §1: vì sao JS thuần (phân tích tái lập trong cùng repo, chạy được trong CI không cần R, đối chiếu độc lập với Python đến 12 chữ số), và **kèm script R 10 dòng** đọc cùng tệp log cho ra cùng số — để ai không tin JS thì chạy R.

**Đạt khi:**
- [ ] `nghien-cuu/doi-chieu.R` chạy trên `nguoi-005.json` cho p trùng `npm run analyse` đến 4 chữ số
- [ ] §1 có đoạn giải thích ≤ 10 dòng

**Vai:** NC · **Công:** 2 giờ · **Chặn bởi:** không

---

## Việc đã nêu, cố ý *chưa* đưa vào

| Việc | Vì sao chưa |
|---|---|
| Phục vụ Opus thay WAV cho web | Không có gì để làm tới khi có vật liệu thật; đường ống đã xuất Opus. S2.1 sẽ cho con số thật |
| Tăng 4 → 8 lượt mỗi người | Chỉ cần nếu S1.2 cho con số không tuyển nổi. Quyết sau S1.2 |
| Đo phản hồi xung tại chỗ (A1.1b) | Phụ thuộc S1.3: bỏ vang thì không cần đo |
| PWA, kiểm thử tiếp cận với người khiếm thị, tối ưu hiệu năng | Đúng chỗ trong lộ trình (M5–M6), không có lý do kéo lên |

---

## Thứ tự làm trong tuần này

```
Ngày 1   S0.1 git ─► S0.5 ngày thật ─► S0.4 đồng bộ lộ trình ─► S0.2 README
Ngày 1–2 S1.1 phương án nhiễu (TDD) ─► S1.2 tính lại cỡ mẫu
Ngày 2   S2.1 một tệp âm thật ─► S2.2 check:recorder  (song song với S1)
Ngày 3   S2.3 điện thoại thật ─► S1.3 quyết vang (sau khi đã nghe S2.1)
Ngày 3   S2.4 đóng G0 ─► S1.4 ký kế hoạch phân tích, tag
Ngày 3+  S3.1 khảo sát kho · S3.2 gửi ba thư pháp lý · S3.3 lịch thực địa
Khi rảnh S0.3 CI · S4.1 tách BA · S4.2 script R
```

Ba việc có thể làm **ngay bây giờ** mà không cần ai khác: S0.1, S0.4, S1.1.

## Kiểm lại tệp này

Tệp này tự nó cũng là một khẳng định cần kiểm. Sau một tuần, đối chiếu từng ô "Đạt khi" — ô nào không tích được thì hoặc việc chưa xong, hoặc tiêu chí viết sai. Cả hai đều phải ghi lại, không xoá.
