# Sổ quyết định — VietSoundscape

Tách từ `BA-VietSoundscape.md` (spec S4.1). BA giữ **yêu cầu hiện hành** (FR/NFR, mô
hình dữ liệu, sơ đồ đã sửa); sổ này giữ **lý do, bằng chứng và lịch sử suy nghĩ**
đứng sau từng quyết định. Đọc BA để biết *phải làm gì*; đọc sổ để biết *vì sao*.

## Cách dùng

- Mỗi mục một quyết định, mã `Q-nn`, có ngày, vị trí trong BA và các FR/§ bị ảnh hưởng.
- Thân mục là **nguyên văn** ghi chú trong BA tại thời điểm tách — không viết lại, để
  không mất thông tin (kiểm: tổng số từ hai tệp ≥ 95% BA cũ). Muốn cô đặc thành đúng
  bốn dòng *Quyết định / Vì sao / Bằng chứng / Ảnh hưởng* thì làm ở một lượt sau, có
  người đọc lại.
- Quyết định mới: thêm mục cuối, **không sửa** mục cũ. Đổi ý thì thêm mục mới dẫn
  ngược tới mục cũ.
- Ngày ghi "theo dấu thời gian tệp" là vì BA không ghi ngày cho ghi chú đó; đồng hồ
  máy nhảy giữa 07/08 và 03/09 (spec S0.5) nên cần người thật xác nhận.

## Mục lục

- [Q-01 — Rủi ro phát biểu](#q-01--rủi-ro-phát-biểu)
- [Q-02 — Hệ quả tích cực của việc bỏ AI](#q-02--hệ-quả-tích-cực-của-việc-bỏ-ai)
- [Q-03 — Nhận định kiến trúc quan trọng](#q-03--nhận-định-kiến-trúc-quan-trọng)
- [Q-04 — Sơ đồ này đã sửa so với bản BA đầu](#q-04--sơ-đồ-này-đã-sửa-so-với-bản-ba-đầu)
- [Q-05 — Cách xác minh AGC/khử ồn đã tắt thật — đo, không đọc thông số máy](#q-05--cách-xác-minh-agckhử-ồn-đã-tắt-thật--đo-không-đọc-thông-số-máy)
- [Q-06 — Tin tốt từ spike M0](#q-06--tin-tốt-từ-spike-m0)
- [Q-07 — Đã dựng: `src/research/statistics.js`](#q-07--đã-dựng-srcresearchstatisticsjs)
- [Q-08 — Máy trạng thái phiên — `src/app/experiment/session.js`](#q-08--máy-trạng-thái-phiên--srcappexperimentsessionjs)
- [Q-09 — Giao diện — `src/app/experiment/experiment-view.js`](#q-09--giao-diện--srcappexperimentexperiment-viewjs)
- [Q-10 — Trang phiên nghe — `/thuc-nghiem`](#q-10--trang-phiên-nghe--thuc-nghiem)
- [Q-11 — Cỡ hiệu ứng và khoảng tin cậy — `src/research/effect-size.js`](#q-11--cỡ-hiệu-ứng-và-khoảng-tin-cậy--srcresearcheffect-sizejs)
- [Q-12 — Không dùng Cohen's d; khoảng Hodges–Lehmann tính bằng cắt đuôi, không nghịch đảo kiểm định](#q-12--không-dùng-cohens-d-khoảng-hodgeslehmann-tính-bằng-cắt-đuôi-không-nghịch-đảo-kiểm-định)
- [Q-13 — Đã dựng: `src/research/assignment.js`](#q-13--đã-dựng-srcresearchassignmentjs)
- [Q-14 — 🔴 Đã tính thật, và con số 40–60 ở trên là KHÔNG ĐỦ](#q-14--đã-tính-thật-và-con-số-4060-ở-trên-là-không-đủ)
- [Q-15 — Công thức trong sách cho con số thiếu](#q-15--công-thức-trong-sách-cho-con-số-thiếu)
- [Q-16 — Giả định nào đang chống đỡ con số](#q-16--giả-định-nào-đang-chống-đỡ-con-số)
- [Q-17 — Đã dựng — câu Q3 / việc C0.2 chốt theo hướng ISO](#q-17--đã-dựng--câu-q3--việc-c02-chốt-theo-hướng-iso)
- [Q-18 — Ba điều kiện, định nghĩa thao tác được](#q-18--ba-điều-kiện-định-nghĩa-thao-tác-được)
- [Q-19 — 🔴 Lỗi thiết kế tìm được khi đánh giá lại (spec S1.1) — đã sửa, ra FR-60](#q-19--lỗi-thiết-kế-tìm-được-khi-đánh-giá-lại-spec-s11--đã-sửa-ra-fr-60)
- [Q-20 — Đã dựng: `src/research/stimulus.js`](#q-20--đã-dựng-srcresearchstimulusjs)
- [Q-21 — FR-52 đã dựng và đã chứng minh](#q-21--fr-52-đã-dựng-và-đã-chứng-minh)
- [Q-22 — Bộ hồ sơ đã soạn xong ở `phap-ly/`](#q-22--bộ-hồ-sơ-đã-soạn-xong-ở-phap-ly)
- [Q-23 — 🔴 Ba nghĩa vụ có mốc thời gian, chưa có trong lộ trình cũ](#q-23--ba-nghĩa-vụ-có-mốc-thời-gian-chưa-có-trong-lộ-trình-cũ)

---

## Q-01 — Rủi ro phát biểu

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 1.1 Định vị so với các nền tảng đã có |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

⚠️ **Rủi ro phát biểu.** Câu "chưa có bản đồ âm thanh cho Việt Nam" trong thuyết minh là **quá rộng và dễ bị phản biện** — Radio Aporee đã có điểm ghi tại Việt Nam. Phải thu hẹp phát biểu thành: *"chưa có bản đồ âm thanh **có phân loại khoa học theo khung Krause × Schafer**, **có công cụ mô phỏng phân lớp tương tác**, dành riêng cho các vùng miền Việt Nam"*. Trước khi bảo vệ, phải khảo sát và liệt kê thực tế các điểm ghi VN đang có trên các nền tảng trên (bằng chứng, không phỏng đoán).

---

## Q-02 — Hệ quả tích cực của việc bỏ AI

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 2. Mục tiêu nghiệp vụ và chỉ số đo |
| **Ảnh hưởng tới** | §10.5, §8.2, §9.4 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

**Hệ quả tích cực của việc bỏ AI:** toàn bộ công suất nhóm dồn vào ba việc thực sự quyết định kết quả — chất lượng âm (§9.4), chế độ thực nghiệm (§10.5) và độ chắc của dữ liệu (§8.2). Không còn phải giải trình về cỡ dữ liệu quá nhỏ so với yêu cầu huấn luyện mô hình, cũng không còn rủi ro rò rỉ dữ liệu khi chia train/test.

---

## Q-03 — Nhận định kiến trúc quan trọng

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 4. Từ vựng nghiệp vụ (bắt buộc dùng thống nhất trong code và tài liệu) |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

**Nhận định kiến trúc quan trọng:** hai khung phân loại khoa học *ánh xạ trực tiếp* sang kiến trúc âm thanh. Krause (geophony/biophony/anthrophony) → **cấu trúc bus của bộ trộn**. Schafer (keynote/signal/soundmark) → **hành vi phát của lớp âm**. Thuyết minh gốc chưa nói ra liên kết này; đây là ý tưởng kỹ thuật mạnh nhất có thể rút ra và nên viết hẳn vào đề tài.

---

## Q-04 — Sơ đồ này đã sửa so với bản BA đầu

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 5.2 Đồ thị Web Audio (thiết kế bắt buộc) |
| **Ảnh hưởng tới** | §5.2b |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

⚠️ **Sơ đồ này đã sửa so với bản BA đầu.** Bản đầu vẽ `bus ──► Convolver ──► master` — tức **100% ướt**, không còn đường khô nào. Đó không phải "bước vào một không gian" mà là **mất sạch âm trực tiếp**, nghe như đứng ngoài phòng vọng vào. Mã nguồn đã cài đúng theo sơ đồ sai đó và tồn tại qua nhiều đợt vì mọi bản trộn đều để `reverb_ir: null`, nên nhánh vang chưa bao giờ chạy. Chi tiết ở §5.2b.

---

## Q-05 — Cách xác minh AGC/khử ồn đã tắt thật — đo, không đọc thông số máy

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 5.4.2 Thông số khi nhóm tự thu |
| **Ảnh hưởng tới** | §5.4 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

**Cách xác minh AGC/khử ồn đã tắt thật — đo, không đọc thông số máy.** Thông số máy hầu như không nói có tắt được hay không. Chạy `npm run check:recorder <bản-thu-thử>`:

1. Thu **60 giây** bằng đúng thiết bị + app sẽ dùng: **25 s im lặng → 10 s có âm đều** (vỗ tay chậm hoặc nói liên tục) **→ 25 s im lặng**.
2. Công cụ tách ba đoạn rồi tìm hai dấu vết: nền ồn **dâng dần** trong đoạn lặng ⇒ AGC đang bật; nền ồn bị **cắt hẳn** xuống dưới −80 dBFS ⇒ khử ồn đang bật.
3. Kết luận `DÙNG ĐƯỢC` / `KHÔNG DÙNG ĐƯỢC` kèm số đo cụ thể (nền ồn phòng, mức dâng, tỉ lệ khối bị cắt).

Nếu không tắt được: điện thoại **chỉ dùng cho dấu ấn âm thanh** (âm to, ngắn — AGC/khử ồn ít phá), còn lớp âm nền lấy từ kho. Đúng mô hình lai ở §5.4.

---

## Q-06 — Tin tốt từ spike M0

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 5.4.2 Thông số khi nhóm tự thu |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

**Tin tốt từ spike M0:** vật liệu tải về thường đã qua nén MP3, mang theo khoảng đệm của bộ mã hoá ở đầu/cuối. Spike đã đo và chứng minh `findLoopPoints` **tự cắt bỏ được khoảng đệm này** (từ 79,9 ms khe hở về 0 ms, bước nhảy từ `1.1e-1` về `6.7e-13`). Nghĩa là vật liệu tải về vẫn loop liền mạch được — miễn là luôn đi qua bước tìm điểm loop.

---

## Q-07 — Đã dựng: `src/research/statistics.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | FR-58 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **Đã dựng: `src/research/statistics.js`** — `npm run analyse -- <tệp log>`, hoặc `--demo` để xem format log.

**Đã đối chiếu độc lập:** 8 giá trị (nhị thức, McNemar ba biến thể, Wilcoxon chính xác và xấp xỉ) khớp tới **12 chữ số có nghĩa** với một bản dựng lại bằng Python dùng `math.erfc` và tổ hợp chính xác. Không phải "tin là đúng" — đã đối chiếu.

**Hai phép so sánh, không phải một.** Script chạy cả `layered` vs `isolated` (tính đồng thời — H1 như thuyết minh phát biểu) **và** `layered` vs `scrambled` (tính mạch lạc vùng miền — FR-58). Chỉ chạy phép đầu thì kết quả dương tính vẫn giải thích được bằng "nhiều thông tin hơn thì đoán đúng hơn".

**Ba chỗ dễ báo sai "có ý nghĩa", đã chặn:**

| Bẫy | Cách chặn |
|---|---|
| Dùng xấp xỉ chi bình phương khi quá ít cặp bất đồng — bản **không hiệu chỉnh cho p nhỏ nhất**, nên là bản dễ tự lừa mình nhất | tự chuyển sang **kiểm định chính xác** khi `b + c < 25` |
| Bỏ cặp không chênh lệch trong Wilcoxon rồi báo `n` như cũ | trả về `dropped`, script in ra bắt buộc |
| Gọi là "exact" khi có chênh lệch **trùng nhau** — phân bố chính xác dựng trên hạng không trùng, nên p không còn chính xác. Với Likert 5 mức thì trùng nhau là chuyện thường | kèm `note` cảnh báo; chế độ tự chọn tránh `exact` khi có trùng và dùng xấp xỉ chuẩn **có hiệu chỉnh phương sai** |

**Một quyết định phương pháp đã ghi vào mã** (`pairResponses`): thiết kế trong-người 4 địa điểm × 3 điều kiện làm mỗi người có **một điều kiện xuất hiện hai lần**. Cặp lấy **lượt đầu** của mỗi điều kiện, để hiệu ứng luyện tập rơi đều lên hai điều kiện đang so sánh. Lượt thừa không bỏ đi nhưng **không** được đưa vào McNemar — làm thế là đếm một người hai lần.

**Chiều phụ thuộc có chủ ý:** `scripts/analyse-results.mjs` định nghĩa luôn format log mà chế độ thực nghiệm phải ghi. Kiểm định quyết định cần ghi gì, chứ không phải ghi được gì thì kiểm cái đó — thiếu một trường là mất một giả thuyết.

✅ **Hợp đồng format đã đóng lại thành vòng kín:** `--demo` chạy qua **chính `createExperimentSession`** mà chế độ thực nghiệm sẽ dùng, không tự bịa cấu trúc log. Máy trạng thái phiên đổi trường nào mà script phân tích không đọc được nữa thì chạy demo là lộ ngay.

---

## Q-08 — Máy trạng thái phiên — `src/app/experiment/session.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | FR-59 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Tách hẳn khỏi giao diện vì đây là chỗ **sai thì hỏng cả bộ dữ liệu, mà hỏng theo kiểu không nhìn ra**: log vẫn đầy đủ, kiểm định vẫn chạy, chỉ có kết quả là vô nghĩa. Bốn luật:

| Luật | Vì sao |
|---|---|
| **Đồng thuận là cổng cứng**, hỏi theo **từng mục đích**, không trả lời = không đồng ý | Luật 91/2025 Điều 9 khoản 4 điểm a/b/d. Thời điểm đồng thuận được ghi vào log — NĐ 356 Điều 6 khoản 2 bắt bên kiểm soát phải chứng minh được |
| **Không có `back()`** | Sửa câu trả lời sau khi đã nghe lượt sau là để thông tin của lượt sau chảy ngược vào lượt trước |
| **Không lộ đúng/sai sau mỗi lượt** | Báo kết quả là dạy người tham gia giữa chừng; các lượt sau không còn đo cùng một thứ với lượt đầu |
| **Đúng/sai do máy đối chiếu đáp án**, không do người tham gia tự khai | Tránh cả nhầm lẫn lẫn thiên lệch muốn làm hài lòng người hỏi |

Và một điểm làm FR-59 thật sự có tác dụng: **bản trộn xoay vòng theo số thứ tự người tham gia**, nên người khác nhau nghe bản trộn khác nhau cho cùng một vùng. Không có chỗ này thì ai cũng nghe đúng một bản, kết quả có thể chỉ phản ánh bản trộn đó chứ không phản ánh vùng miền — và công sức dựng 12 bản trộn thành bỏ phí.

---

## Q-09 — Giao diện — `src/app/experiment/experiment-view.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | §10.3 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Mỏng có chủ ý: mọi luật về trình tự và chấm điểm nằm ở `session.js`. Ở đây chỉ có ba ràng buộc mà **chỉ giao diện mới chặn được**:

| Ràng buộc | Vì sao |
|---|---|
| **Không tích sẵn ô đồng thuận nào**; nút bắt đầu khoá tới khi tích đủ cả ba | NĐ 356 Điều 6 khoản 3 cấm đặt mặc định là đồng ý; Luật Điều 9 khoản 4 điểm d nói im lặng không phải đồng ý |
| **Phải nghe hết đoạn âm mới nộp được** | Bấm bừa qua nhanh cho ra một lượt **trông hợp lệ** mà không đo được gì — tệ hơn thiếu dữ liệu, vì nó lọt qua mọi phép kiểm |
| **Đủ cả 8 thuộc tính ISO mới nộp được** | Công thức ISO/TS 12913-3 cần đủ tám; thiếu một là lượt đó không suy ra được chiều nào ⇒ mất cả cặp của người đó ở phép kiểm (§10.3) |
| **URL kích thích không được chứa điều kiện, mã bản trộn hay mã địa điểm** | Xem dưới |

**Một lỗi tôi tự thiết kế vào, và test bắt được.** Mã kịch bản là `<bản trộn>--<điều kiện>`, mà mã bản trộn lại chứa tên vùng. Đưa thẳng vào `src` của thẻ `<audio>` thì người tham gia mở tab mạng hoặc xem nguồn trang là thấy `hue-trua-he--layered.wav` — biết luôn cả điều kiện lẫn đáp án. Hỏng theo kiểu **không ai biết**, vì log vẫn ghi bình thường và mọi kiểm định vẫn chạy.

Chặn ở hai tầng: `render-stimuli.mjs` đặt tên tệp phục vụ theo **16 ký tự đầu của SHA-256 nội dung** (mờ, nhưng ổn định nên vẫn tái lập được), và `experiment-view.js` **ném lỗi** nếu URL nhận được có chứa bất kỳ ba chuỗi bí mật nào. Tầng thứ hai không thừa: cách đặt tên rò rỉ trông hoàn toàn bình thường lúc viết, và không tầng nào ở dưới bắt được.

---

## Q-10 — Trang phiên nghe — `/thuc-nghiem`

| | |
|---|---|
| **Ngày** | 07/08/2026 |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **Đã nối dây và chạy thật trong trình duyệt** (07/08). Một người tham gia đi hết bốn lượt, bốn tệp WAV tải về đủ (17,3 MB mỗi tệp, HTTP 200), log tải xuống thành `nguoi-003.json`, và `npm run analyse` đọc được thẳng tệp đó. Đường đi khép kín từ thư mời đến bảng kết quả.

**Là trang riêng, không phải một chế độ bên trong trang chính** — vì lý do nghiên cứu chứ không phải kỹ thuật. Trang chính hiện `signature_vi`, câu mô tả đặc trưng âm thanh của từng vùng ("tiếng rao, xe máy, chuông chùa…"). Đó chính là **đáp án viết sẵn**. Tách trang bảo đảm không có đường nào để chữ đó lọt vào mắt người tham gia; đo trong trình duyệt thật cho 0/7 chuỗi bí mật xuất hiện trong DOM. Phần lợi kỹ thuật (không nạp Leaflet: 10 kB thay vì 165 kB) chỉ là hệ quả.

Ba quyết định của phần nối dây nằm ở `bootstrap.js` chứ không nằm trong tệp điểm vào, vì cả ba đều **sai được mà không để lại dấu vết nào trong log**:

| Quyết định | Nếu làm cẩu thả |
|---|---|
| Số thứ tự người tham gia lấy từ `?nguoi=`, **không có giá trị mặc định** | Mặc định 0 ⇒ ai cũng nghe cùng một thứ tự ⇒ phép đảo thứ tự cân bằng của `assignment.js` biến mất, log vẫn trông bình thường |
| Kiểm tên tệp mờ **lúc nạp bảng kê**, không đợi tầng hiển thị | Lỗi ở tầng hiển thị nổ ra giữa lúc người tham gia đang ngồi trước máy; ở đây nổ trước khi hỏi đồng thuận |
| Kiểm đủ **cả 12 tệp** của thiết kế, không chỉ 4 lượt của người này | Thiếu tệp mà phát hiện ở người thứ mười hai thì mười một người trước đã nghe xong rồi |

Thêm một chốt chặn: tải lại trang là **mất phiên** (không giữ trạng thái qua lần tải lại). Người đó đã nghe rồi, nghe lại thì các lượt sau không còn đo cùng một thứ. Nên có `beforeunload` hỏi lại khi đang giữa phiên — thà hỏi lại còn hơn mất lặng lẽ một người tham gia. Chưa xong hoặc đã xong thì để rời tự do.

⚠️ **Kích thích không nằm trong bản dựng web.** 12 tệp WAV 48k/24-bit ≈ **198 MB** — gói vào là bản dựng không dùng được. Phiên nghe chạy tại chỗ bằng máy chủ phát triển (`npm run dev`, đúng cách một thực nghiệm nghe có kiểm soát vẫn làm), hoặc `build/stimuli/` được phục vụ riêng. Máy chủ tĩnh khi triển khai cần luật viết lại `/thuc-nghiem` → `/thuc-nghiem.html`; máy chủ phát triển đã có sẵn trong `vite.config.js`.

Trang chính **không** đặt liên kết sang đây: không có `?nguoi=` thì trang báo lỗi và dừng, nên một liên kết công khai chỉ dẫn người ta vào ngõ cụt. Người tham gia nhận địa chỉ kèm số thứ tự trong thư mời (việc C3.2).

---

## Q-11 — Cỡ hiệu ứng và khoảng tin cậy — `src/research/effect-size.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

p trả lời "hiệu ứng có thật không". Nó **không** trả lời "lớn bao nhiêu". Với n = 48, một hiệu ứng nhỏ đến mức vô nghĩa thực tiễn vẫn ra `p < 0,05`, và người đọc chỉ thấy p thì không có cách nào biết. Nên `npm run analyse` in cỡ hiệu ứng **ngay dưới mỗi p**, không để mục riêng cuối báo cáo:

```
p = 0.0169 · ✓ CÓ ý nghĩa · nghiêng về layered · kiểm định: exact
  chênh tỉ lệ 24.5% · CI 95% [6.6%, 42.4%]
  tỉ số odds 3.40 · CI [1.25, 9.22]
```

| Giả thuyết | Cỡ hiệu ứng | Khoảng tin cậy |
|---|---|---|
| H1 | **chênh tỉ lệ** (dễ hiểu) + **tỉ số odds** (so được với tài liệu) | Wald **hiệu chỉnh Agresti–Min** · logit |
| H2 | **rank-biserial** | **Hodges–Lehmann** + cắt đuôi phân bố signed-rank |

---

## Q-12 — Không dùng Cohen's d; khoảng Hodges–Lehmann tính bằng cắt đuôi, không nghịch đảo kiểm định

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.1 Giả thuyết hiện không kiểm được bằng sản phẩm như đang mô tả |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Không dùng Cohen's d: nó giả định thang khoảng và phân bố chuẩn, mà dữ liệu ở đây là nhị phân và thứ bậc. Khoảng chênh tỉ lệ mặc định là bản **hiệu chỉnh** vì Wald thuần có tỉ lệ phủ thật thấp hơn danh nghĩa — nó cho khoảng **hẹp hơn thực tế**, và hẹp quá là sai theo hướng nguy hiểm. Cả hai đều trả về để đối chiếu.

**Một lỗi tìm ra nhờ nghi ngờ kết quả trông "quá đẹp".** Bản đầu tính khoảng Hodges–Lehmann bằng **nghịch đảo kiểm định tại** các trung bình Walsh — nghe chắc chắn hơn vì đó là định nghĩa. Nhưng thử đúng tại một trung bình Walsh thì có `dᵢ − θ = 0`, cặp bị loại, `n` giảm, phép kiểm đổi hẳn. Với thang Likert (tập Walsh chỉ có vài giá trị) khoảng co thành **một điểm** `[1,5; 1,5]` — mà khoảng tin cậy không bao giờ là một điểm. Đối chiếu ba trường hợp cho thấy nghịch đảo tại **điểm giữa** hai trung bình Walsh liền nhau cho khoảng mở, và bao đóng của nó khớp chính xác công thức cắt đuôi:

| n | nghịch đảo tại điểm giữa | cắt đuôi |
|---|---|---|
| 12 | (3,25 ; 6,25) | **[3 ; 6,5]** |
| 5 | (−3,5 ; 4,5) | **[−4 ; 5]** |
| Likert 39 | (1,25 ; 1,25) | **[1 ; 1,5]** |

Hai đường thật ra là một; công thức cắt đuôi vừa đúng vừa rẻ hơn. Và `uninformative: true` khi không cắt được đuôi nào — ở n = 5 khoảng trải hết tập Walsh, tức **nó không cho biết gì**, và báo cáo phải nói thế thay vì in ra một khoảng rộng như thể nó là kết quả.

---

## Q-13 — Đã dựng: `src/research/assignment.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.2 Cỡ mẫu — phải tính trước, không thu bừa |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **Đã dựng: `src/research/assignment.js`** — xem kế hoạch bằng `npm run experiment -- 48`.

**Một ràng buộc mà thiết kế trong-người thông thường không có.** Bình thường mỗi người sẽ nghe **mọi** tổ hợp địa điểm × điều kiện. Ở đây thì **không được**: nhiệm vụ là đoán vùng miền, nên nghe Huế lần thứ hai là đã biết đáp án — lượt đó không đo được gì. Nên mỗi người chỉ nghe **mỗi địa điểm đúng một lần**, điều kiện xoay vòng theo hình vuông La Tinh. Hệ quả: **một vòng cân bằng đầy đủ là 12 người** (4 địa điểm × 3 điều kiện), nên cỡ mẫu nên là bội của 12 — 48 là lựa chọn tự nhiên trong khoảng 40–60.

Phân điều kiện lấy theo **số thứ tự** người tham gia, không lấy ngẫu nhiên: với n = 40–60 thì gán ngẫu nhiên lệch nhóm là chuyện thường và lệch bao nhiêu không kiểm soát được, còn xoay vòng cho cân bằng chính xác — đồng thời dựng lại được đúng phiên của người thứ k mà không cần lưu thêm gì.

---

## Q-14 — 🔴 Đã tính thật, và con số 40–60 ở trên là KHÔNG ĐỦ

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.2 Cỡ mẫu — phải tính trước, không thu bừa |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Việc C1.2 xong: `src/research/power.js` (26 test) + `npm run plan:sample` + `nghien-cuu/ke-hoach-phan-tich.md`. Con số 40–60 trong đoạn trên là ước đoán từ kinh nghiệm chung về thiết kế trong-người, không phải phép tính cho *thiết kế này*. Tính ra thì:

| n | lực cho **H1** (kịch bản vừa phải) | lực cho **H2** (d = 0,5) |
|---|---|---|
| 40 | **43,7%** | 85,9% ✓ |
| 48 | **52,1%** | 92,0% ✓ |
| 60 | **63,3%** | 96,8% ✓ |
| 85 | **80,0%** ✓ | 99,3% ✓ |

Với 48 người, xác suất bỏ sót một hiệu ứng H1 có thật là **gần một nửa**. Ràng buộc nằm ở H1 chứ không ở H2: tỉ lệ đúng/sai là biến nhị phân nên tốn mẫu hơn hẳn biến liên tục. **Cỡ mẫu chốt: 85 người.** Vòng cân bằng đầy đủ là 12 người nên bội của 12 mới tròn: **84 cho 79,8%** — thực chất bằng 85, chênh nằm trong nhiễu mô phỏng — còn **96 cho 85,8%**. Chốt **96** nếu tuyển được, **84** là mức sàn.

---

## Q-15 — Công thức trong sách cho con số thiếu

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.2 Cỡ mẫu — phải tính trước, không thu bừa |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Bài tính chạy **hai đường**: công thức khép kín của Connor (1987), và mô phỏng chạy **chính `mcnemarTest`** mà `npm run analyse` sẽ dùng. Hai đường không khớp, và chênh có **hướng cố định**:

| n | công thức | thật (mô phỏng) | chênh |
|---|---|---|---|
| 48 | 59,6% | 52,1% | −7,5 đpt |
| **77** | **80,5%** | **75,4%** | **−5,1 đpt** |
| 200 | 99,6% | 99,8% | +0,2 đpt |

Nguyên nhân đo được: công thức giả định xấp xỉ chuẩn **không hiệu chỉnh**, còn phép kiểm thật dùng bản **chính xác** khi ít cặp bất đồng và bản chi bình phương **có hiệu chỉnh** khi nhiều. Cả hai đều thận trọng hơn — sai số loại I thực tế chỉ **3,0%** chứ không phải 5,0%, nên phép kiểm cũng nhận lại ít lực hơn. Chênh teo dần khi n lớn, đúng như một xấp xỉ tiệm cận phải thế; nhưng ở đúng khoảng n mà đề tài quan tâm thì nó đáng 5–8 điểm phần trăm.

Nếu chỉ tra công thức trong sách, nhóm sẽ tuyển 77 người, tin rằng mình có 80% lực, và thật ra có 75%. Có kiểm thử khoá phát hiện này lại.

---

## Q-16 — Giả định nào đang chống đỡ con số

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.2 Cỡ mẫu — phải tính trước, không thu bừa |
| **Ảnh hưởng tới** | §2.4 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Nói thẳng: **chưa có số liệu mồi**. Ba kịch bản (chênh 10 / 20 / 30 điểm phần trăm giữa hai loại cặp bất đồng) là phán đoán. Pilot ở C4.1 là để thay phán đoán bằng số đo — sau pilot phải chạy lại `npm run plan:sample` và cập nhật kế hoạch bằng một mục sửa đổi, không sửa đè.

Và một yếu tố đẩy con số **lên** chứ không xuống: trong một cặp, hai điều kiện rơi vào **hai địa điểm khác nhau** (`layered`@Huế so với `isolated`@Hà Nội) — không tránh được, vì cho nghe lại cùng một vùng là họ nhận ra. Chênh lệch giữa các vùng vì thế cộng thêm nhiễu vào từng cặp. Thiết kế xoay vòng cân bằng chuyện đó **giữa** những người tham gia, nhưng **trong** một cặp thì nhiễu vẫn còn.

Nếu không tuyển đủ 85 người, ba lựa chọn xếp theo mức khuyến nghị nằm ở `nghien-cuu/ke-hoach-phan-tich.md` §2.4 — trong đó phương án tốt nhất là **tăng số lượt mỗi người từ 4 lên 8**, cần khoảng một nửa số người nhưng đòi đủ 12 bản trộn (việc A3.3).

---

## Q-17 — Đã dựng — câu Q3 / việc C0.2 chốt theo hướng ISO

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.3 Thang đo cho H2 — đừng tự phát minh |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **Đã dựng — câu Q3 / việc C0.2 chốt theo hướng ISO** (`src/research/soundscape-scale.js`, 14 test). Phiên nghe hỏi đủ **8 thuộc tính**, thang đồng ý 5 mức của Phương pháp A (Phụ lục C), **giữ nguyên thứ tự của bộ chuẩn** — đảo thứ tự cho "đỡ nhàm" là mất chính cái tính so sánh được vốn là lý do dùng bộ này.

**Không hỏi thẳng "dễ chịu?" và "nhiều sự kiện?"** dù đó là hai chiều cần cho H2. Ba lý do, xếp theo mức quan trọng:

| | |
|---|---|
| **Trực giao** | Hai chiều của ISO trực giao **theo cách dựng** — pleasant ở 0°, vibrant 45°, eventful 90°, chaotic 135°… Hỏi thẳng hai câu thì hai câu trả lời tương quan với nhau theo cách không kiểm soát được, và hết là hai trục độc lập. Có test khẳng định điều này: hồ sơ dễ chịu cực đại cho `eventfulness = 0`, và ngược lại |
| **Số phép kiểm** | 8 thuộc tính × 2 phép so sánh = **16 kiểm định**; với α = 0,05 thì xác suất có ít nhất một dương tính giả ≈ **56%**. Suy ra 2 chiều rồi kiểm 2 chiều đó là **4 kiểm định** — và đó cũng là cách ISO/TS 12913-3 định dùng bộ này |
| **Không so sánh được** | Hỏi thẳng là thang tự soạn, tức đúng thứ mục này khuyên bỏ |

Công thức ISO/TS 12913-3, điểm 1–5 tâm hoá về −2…+2, chia cho 4 + √32 để nằm gọn trong [−1, 1]:

```
P = [(dễ chịu − khó chịu) + cos45°(yên bình − hỗn loạn) + cos45°(sống động − đơn điệu)] / (4 + √32)
E = [(nhiều − ít chuyện xảy ra) + cos45°(hỗn loạn − yên bình) + cos45°(sống động − đơn điệu)] / (4 + √32)
```

Phép kiểm đáng nói nhất trong bộ test: **quét cạn cả 5⁸ = 390 625 tổ hợp trả lời**, khẳng định không tổ hợp nào ra ngoài [−1, 1] và biên ±1 thật sự đạt được. Một hệ số sai dấu sẽ lọt qua vài ca thử tay nhưng không lọt qua phép quét này.

**Log ghi 8 điểm thô, suy diễn xảy ra lúc phân tích.** Nghĩa là đổi công thức không phải thu lại dữ liệu — và nhóm khác muốn tính lại theo cách khác thì vẫn có nguyên liệu.

---

## Q-18 — Ba điều kiện, định nghĩa thao tác được

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.4 Yếu tố gây nhiễu phải khử — nếu không H1 vô nghĩa |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Thuyết minh gốc nói H1 so sánh "soundscape phân lớp" với "âm đơn lẻ" nhưng **chưa bao giờ định nghĩa** điều kiện đối chứng là gì cụ thể. Đã định nghĩa và dựng trong `src/research/variants.js`:

| Điều kiện | Mẫu âm | Tính đồng thời | Vùng miền |
|---|---|---|---|
| `layered` | của vùng gốc | **chồng lấp** | mạch lạc |
| `isolated` | **y hệt** `layered` | **lần lượt, không chồng** | mạch lạc |
| `scrambled` | vai giống, **vùng khác** | chồng lấp | bị phá |

`layered` vs `isolated` cô lập **tính đồng thời**. `layered` vs `scrambled` cô lập **tính mạch lạc vùng miền** — tức chữ *"có chủ đích"*. Mỗi cặp chỉ khác nhau **một** biến.

**Cân bằng do cách dựng, không do đo lại.** Cả ba suy ra từ **cùng một danh sách sự kiện**, nên số sự kiện và thời lượng khớp *chính xác* — `npm run experiment -- 48 --placeholder` cho `6/6/6 · 7/7/7 · 5/5/5 sự kiện · cân bằng`, và test tích hợp chạy `checkStimulusBalance` với ngưỡng **0** vẫn đạt. Cách ngược lại (dựng riêng từng điều kiện rồi đi đo xem có khớp) gần như chắc chắn lệch, và mỗi lần lệch là một lần phải thu thêm hoặc cắt bớt vật liệu.

**Hai chỗ tôi làm sai rồi phải sửa** — ghi lại vì cả hai đều "trông hợp lý":
1. *Chia khung `isolated` thành các ô bằng nhau.* Nó gán cho tiếng chuông 3 giây một ô 12 giây ⇒ bộ kết xuất kéo dài hoặc lặp nó ⇒ `isolated` không còn tương đương. Cách đúng: **âm phát một lần giữ nguyên thời lượng thật, lớp nền hút phần dư** (nền liên tục nên co giãn được mà vẫn là chính nó).
2. *Lấy độ dài sự kiện là "từ đây tới hết khung".* Tiếng chuông ở giây 17 thành dài 43 giây. Và `soundmark` không có `trigger` bị coi như nền lặp vô hạn — một tiếng cồng ngân 60 giây. Cách đúng: phân nhánh theo **vai Schafer**, không theo việc có `trigger`.

---

## Q-19 — 🔴 Lỗi thiết kế tìm được khi đánh giá lại (spec S1.1) — đã sửa, ra FR-60

| | |
|---|---|
| **Ngày** | 03/09/2026 (ngày hệ thống — xem spec S0.5) |
| **Vị trí trong BA** | 10.4 Yếu tố gây nhiễu phải khử — nếu không H1 vô nghĩa |
| **Ảnh hưởng tới** | FR-60 · §10.2, §7 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Mỗi người nghe **mỗi vùng đúng một lần** (ràng buộc ở §10.2). Danh sách trả lời trước đây lại **đúng bằng bốn vùng đó**. Hệ quả: nhớ ba câu trước là lượt 4 chỉ còn **một** lựa chọn, lượt 3 còn hai — ~25% lượt gần như không mang thông tin. Tỉ lệ đúng bị thổi lên không do nghe được gì, cặp cùng-đúng tăng, McNemar mất lực, và **không phép kiểm nào trên log phát hiện được** vì log vẫn đầy đủ. Không tài liệu nào trước đó nhắc tới (grep `loại trừ|elimination` → 0).

**Sửa:** `data/distractors.json` (Sa Pa, Phố cổ Hội An, Đà Lạt, Đảo Phú Quốc — đề xuất, VH chốt) + `src/research/answer-options.js` (ghép và xáo có seed, 11 test) + `session.js` nhận `answerOptions` tách khỏi `locations`, ghi thứ tự đã hiện vào log + `experiment-view.js` vẽ theo `trial.answer_options`, ném lỗi nếu thiếu nhãn, test khoá "ô thật và ô nhiễu dựng giống hệt". Câu *"Danh sách để chọn có nhiều địa điểm hơn số đoạn bạn sẽ nghe"* có ở màn đồng thuận và `phap-ly/07` — giết phím tắt mà không lừa ai.

**Vì sao nhiễu cùng vùng, không phải vùng khác:** nếu nhiễu toàn ở vùng khác thì nhận ra *vùng* là đủ để loại hết nhiễu, và loại trừ quay lại ở mức vùng. Cùng vùng thì phải nhận ra *nơi*. `correct` vì thế là **mức nơi** (`guess === location_id`); mức vùng suy được lúc phân tích từ `region` của hai tệp dữ liệu, ghi là thước đo phụ. Mức đoán mò đổi từ ≈52% (trung bình có loại trừ) xuống ≈16% — cỡ mẫu tính lại ở `nghien-cuu/ke-hoach-phan-tich.md` §7.

---

## Q-20 — Đã dựng: `src/research/stimulus.js`

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.4 Yếu tố gây nhiễu phải khử — nếu không H1 vô nghĩa |
| **Ảnh hưởng tới** | FR-56, FR-59 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **Đã dựng: `src/research/stimulus.js`.** FR-56/57/58 kiểm bằng `checkStimulusBalance`, FR-59 kiểm bằng `checkRecipeCoverage` — đã nối vào `npm run validate`, hiện báo **còn thiếu 8 bản trộn** (mỗi vùng mới có 1/3).

Số sự kiện âm đếm theo **lịch phát thật** từ bộ sinh có seed, không dùng ước lượng `thời lượng / khoảng cách trung bình`: FR-56 cần con số khớp thật giữa các điều kiện, mà ước lượng thì lệch. Mỗi lớp tín hiệu dùng một seed dẫn xuất riêng (`seed + chỉ số lớp`) — dùng chung một seed thì mọi lớp tín hiệu phát trùng khớp nhau, nghe như một sự kiện và đếm cũng sai.

---

## Q-21 — FR-52 đã dựng và đã chứng minh

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 10.5 Tái lập được — lý do bản trộn phải kết xuất sẵn |
| **Ảnh hưởng tới** | FR-52, FR-56, FR-57 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

✅ **FR-52 đã dựng và đã chứng minh.** `buildVariants` trả về **kịch bản kết xuất phẳng, đã chốt thời điểm** — không còn `trigger` nào để bộ kết xuất tự diễn giải. `buildRenderCommand` (`src/research/render-graph.js`) đổi kịch bản thành lệnh ffmpeg; `npm run render:stimuli -- --placeholder --verify` kết xuất **12 kích thích** rồi kết xuất lại lần hai và so băm:

```
✓ 12/12 tệp khớp băm chính xác
Độ to: mục tiêu −23 LUFS · lệch giữa các kích thích 0,04 LU ✓ đạt FR-57
```

Đây là phép chứng minh, không phải ý định: **kết xuất lại cho ra đúng byte cũ**, nên bảng kê SHA-256 có giá trị đối chiếu và mọi người tham gia chắc chắn nghe cùng một tệp. Ba chi tiết làm nên tính xác định đó, mỗi cái đều là một chỗ dễ mất:

| Chi tiết | Không có thì sao |
|---|---|
| Cờ `-fflags +bitexact -flags +bitexact -map_metadata -1` | ffmpeg ghi tên phiên bản vào tệp ⇒ SHA-256 đổi theo phiên bản ffmpeg ⇒ bảng kê băm vô nghĩa |
| `amix=…:normalize=0` | amix mặc định **chia biên độ cho số nguồn** ⇒ bản 7 lớp nhỏ hơn bản 5 lớp ⇒ độ to thành yếu tố gây nhiễu (FR-57) |
| `apad` rồi `-t` | kịch bản `isolated` kết thúc sớm ⇒ tệp ngắn hơn ⇒ lệch thời lượng ngay ở bước kết xuất (FR-56) |

Dịch trái phải dùng **luật đẳng công suất** giống `StereoPannerNode`, để bản kết xuất nghe khớp bộ trộn thời gian thực. Luật tuyến tính sẽ làm âm hụt ~3 dB ở giữa, và vì mỗi điều kiện dịch khác nhau, chỗ hụt đó biến thành lệch độ to giữa các điều kiện.

⚠️ **Một điều chỉnh so với bản BA đầu:** bản đầu nói kết xuất *"bằng `OfflineAudioContext`"*. Đó là chi tiết cài đặt, và nếu hiểu thành "mỗi máy tự kết xuất khi chạy" thì **sai mục đích**: `OfflineAudioContext` không bảo đảm cho ra byte giống nhau giữa các trình duyệt và các phiên bản (khác cách nội suy khi đổi tần số mẫu, khác cách xử lý số cực nhỏ). Điều FR-52 thật sự cần là **kết xuất một lần, ở một chỗ, rồi phát tệp đó cho mọi người** — nên nên kết xuất phía máy chủ bằng ffmpeg để chạy lại được trong CI. Yêu cầu đã sửa lại thành "kết xuất sẵn", bỏ ràng buộc công cụ.

---

## Q-22 — Bộ hồ sơ đã soạn xong ở `phap-ly/`

| | |
|---|---|
| **Ngày** | 06/08/2026 |
| **Vị trí trong BA** | 11. Pháp lý, đạo đức, quyền riêng tư |
| **Ảnh hưởng tới** | — |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

**Bộ hồ sơ đã soạn xong ở `phap-ly/`** (việc A0.2) — 7 văn bản: phiếu đồng thuận ghi âm, thoả thuận ghi công cộng đồng, cam kết quyền người đóng góp, quy trình yêu cầu xoá, nhật ký thực địa, phiếu cho cộng tác viên, và thông báo đồng thuận tham gia nghiên cứu.

⚠️ Đó là **bản thảo vận hành, không phải tư vấn pháp lý** — cần người có chuyên môn rà lại. Nhưng **mọi số điều khoản đã được điền từ toàn văn** (việc A0.3, hoàn tất 06/08): toàn văn ba văn bản luật lưu ở `phap-ly/nguon/`, không dẫn theo trí nhớ và không dẫn theo bài phân tích thứ cấp.

Ba mức đồng thuận đã thành **luật máy kiểm được** trong `src/data/clip-schema.js`: mẫu có giọng người nhận dạng được không xuất bản được khi chưa có đồng thuận; biểu đạt văn hoá truyền thống bắt buộc `community_agreed` + `community_credit`, đồng thuận cá nhân không đủ; mẫu `withdrawn` **không bao giờ** xuất bản được.

**Danh mục dữ liệu nhạy cảm cũng đã thành luật máy** (`checkSensitiveData`): ba nhóm `ethnic_origin` / `religious_belief` / `biometric` theo NĐ 356 Điều 4 khoản 1; máy bắt mâu thuẫn giữa `contains_identifiable_voice` và `biometric`; dữ liệu nhạy cảm **không bao giờ** được khai `not_required`; và xuất bản đòi hai xác nhận `sensitive_notice_given` + `recording_notice_given`. Xem trạng thái bằng `npm run validate` — báo cáo có mục riêng cho 6 mẫu nhạy cảm.

---

## Q-23 — 🔴 Ba nghĩa vụ có mốc thời gian, chưa có trong lộ trình cũ

| | |
|---|---|
| **Ngày** | 05–07/08/2026 (theo dấu thời gian tệp; BA không ghi ngày cụ thể) |
| **Vị trí trong BA** | 11. Pháp lý, đạo đức, quyền riêng tư |
| **Ảnh hưởng tới** | §8 |

**Vì sao & bằng chứng** *(nguyên văn từ BA lúc tách, không viết lại)*:

Chỉ lộ ra khi đọc toàn văn. Chi tiết `phap-ly/08` §8:

| Nghĩa vụ | Căn cứ | Mốc |
|---|---|---|
| Nộp **hồ sơ đánh giá tác động xử lý dữ liệu cá nhân** cho Cục A05, Bộ Công an | Luật 91/2025 Điều 21 khoản 1 | **60 ngày** kể từ ngày xử lý dữ liệu cá nhân đầu tiên — tức từ mẫu âm có giọng người đầu tiên, **không** phải từ ngày ra mắt web |
| **Cử người phụ trách** bảo vệ dữ liệu cá nhân | Luật Điều 33 khoản 2; NĐ 356 Điều 13, 14 | trước khi thu mẫu đầu |
| **Phối hợp với Sở VHTTDL** nơi có di sản | Luật Di sản văn hoá 45/2024 Điều 16 khoản 3 | trước thực địa |

Đề tài xử lý **dữ liệu cá nhân nhạy cảm** nên **không** được hưởng miễn trừ dành cho doanh nghiệp nhỏ ở Luật Điều 38 khoản 2–3 / NĐ 356 Điều 41. Mốc 60 ngày này chạy **trước** cả cột mốc ra mắt web trong lộ trình — cần hỏi phòng pháp chế của trường xác nhận cách tính.

---

## Q-24 — Thẻ văn hoá: BA §8.2 và FR-26 nói ngược nhau, chốt theo FR-26

| | |
|---|---|
| **Ngày** | 14/09/2026 |
| **Vị trí trong BA** | 7. Yêu cầu chức năng — FR-26 · 8.2 `SoundClip` |
| **Ảnh hưởng tới** | `src/data/clip-schema.js` · `src/app/ui/layer-slider.js` · `src/app/room/listening-room.js` · việc VH2.1 của lộ trình |

**Mâu thuẫn:** FR-26 đòi *"mỗi mẫu âm có ≥ 1 đoạn giải thích"*, nhưng §8.2 lại xếp `cultural_note_vi/en` vào nhóm trường **không** bắt buộc. Một trong hai phải nhường.

**Quyết định:** chốt theo FR-26, nhưng gắn vào **trạng thái**:

- `cultural_note_vi` **bắt buộc khi `status: published`** — vào cùng nhóm với `sha256`, `license`, `editing_log`
- **không** bắt buộc khi `planned` — nội dung là việc VH2.1, viết sau khi đã thu được mẫu; bắt buộc từ lúc lên kế hoạch chỉ đẻ ra 32 chỗ điền cho có
- `cultural_note_en` và `tags[]` vẫn tuỳ chọn; có thì phải đúng dạng

**Vì sao có ngưỡng độ dài** (`CULTURAL_NOTE_MIN_CHARS = 60`): yêu cầu "một đoạn giải thích" mà không đo được thì `"tiếng rao"` cũng qua. Ngưỡng này chỉ chặn chỗ điền cho có — nó **không** thay được việc người đọc lại, và cố tình đặt thấp để không biến thành trò đếm chữ.

**Vì sao đoạn văn nằm ngay dưới thanh trượt, không nằm trong tooltip:** nội dung văn hoá là **một phần của đề tài**, không phải chú thích phụ; và tooltip thì bàn phím lẫn trình đọc màn hình đều với tới khó. Đoạn văn được nối vào thanh trượt bằng `aria-describedby`, nên FR-63 (*"văn bản mô tả từng âm, thay cho việc phải nhìn nhãn"*) được trả luôn ở cùng chỗ.

**Ảnh hưởng sang việc khác:** VH2.1 (*"viết thẻ văn hoá cho mẫu đợt 1"*) trước đây **không có chỗ để đổ nội dung vào** — nay có. Hiện mới có đúng một thẻ: HN-08 tàu điện, lấy nguyên từ `VAT-LIEU-4-DIA-DIEM.md` §4 **kèm nguyên chỗ còn ngờ** ("mốc năm này còn phải tra lại từ nguồn chính thống"). 31 mẫu còn lại để trống có chủ ý — không bịa nội dung văn hoá thay người phụ trách văn hoá.
