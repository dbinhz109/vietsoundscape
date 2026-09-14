# Báo cáo cổng G0 — spike âm thanh M0

**Ngày:** 2026-08-05 · **Tài liệu liên quan:** `BA-VietSoundscape.md` · `LO-TRINH-VietSoundscape.md` §M0

Cổng G0 chỉ hỏi hai câu. Spike này không làm giao diện, chỉ đo.

---

## 1. Kết luận

| Câu hỏi của cổng G0 | Kết quả |
|---|---|
| Lớp âm nền có lặp liền mạch được không? | ✅ **Được** — bước nhảy biên độ `1.5e-14` … `1.5e-12`, tức là ở mức sai số dấu phẩy động của máy. **Đã kiểm lại trên bản thu thật 14/09, cùng bậc sai số — §7.2** |
| Điện thoại tầm trung có tải nổi 5 lớp không? | ⚠️ **Chưa kết luận được** — trên Chromium máy tính: 9 lớp / 23,1 MB / 61 fps, đạt thoải mái. **Còn phải đo trên điện thoại thật** |

**Đi tiếp được sang M1**, với một việc chưa xong: đo trên máy thật (§5).

---

## 2. Số đo

Chromium (Playwright), tần số thiết bị 44 100 Hz, độ trễ nền 11,6 ms.

### 2.1 Chất lượng loop

Hai phép đo cho hai kiểu lỗi khác nhau. Ngưỡng đạt: bước nhảy < `1e-3`, im lặng cuối < 5 ms.

| Trường hợp | Bước nhảy biên độ | Im lặng cuối | Liền mạch |
|---|---|---|---|
| Nền 20 s, điểm loop đã tính | `2.6e-15` … `1.5e-12` | 0 ms | ✅ |
| Cắt ngắn còn ~2 s (lùi về điểm cắt không) | `1.6e-14` | 0 ms | ✅ |
| Cắt ngắn còn ~5 s | `1.6e-14` | 0 ms | ✅ |
| **Tệp có 80 ms đệm ở cuối + loop thô cả tệp** | `1.1e-1` | **79,9 ms** | ❌ |
| **Cùng tệp xấu đó nhưng qua bước tìm điểm loop** | `6.7e-13` | 0 ms | ✅ |
| ~~Cắt cứng đúng mốc "start + 2 s"~~ (cách làm sai) | `1.1e-2` | 0 ms | ❌ |

### 2.2 Tải đồng thời — trường hợp nặng nhất

6 nền + 2 tín hiệu âm + 1 dấu ấn âm thanh + bộ vang (ConvolverNode):

| Chỉ số | Đo được | Ngưỡng |
|---|---|---|
| Số lớp đồng thời | 9 | ≥ 5 |
| RAM bộ đệm đã giải nén | **23,1 MB** | ≤ 150 MB (NFR-04) |
| Nền liền mạch | 6/6 | 6/6 |
| Khung hình / giây | 61 | ≥ 30 |
| Khung chậm nhất | 50 ms (lúc khởi tạo) | — |
| Thời gian dựng đồ thị | 245 ms | — |
| Trạng thái AudioContext | `running` | `running` |

---

## 3. Hai phát hiện đáng giá

### 3.1 Thuật toán tìm điểm loop **tự sửa** được vật liệu có khoảng đệm

Tệp đối chứng có 80 ms im lặng ở cuối — mô phỏng đúng khoảng đệm mà bộ mã hoá MP3 chèn vào, thứ mà BA §NFR-33 xếp là rủi ro số một. Kết quả: loop thô cho `1.1e-1` + 79,9 ms khe hở (nghe rõ); qua bước tìm điểm cắt không thì còn `6.7e-13` + 0 ms.

**Nghĩa là:** khoảng đệm của bộ mã hoá **không còn là rủi ro chặn đường**, miễn là đường ống xử lý (A1.3) luôn chạy bước tìm điểm loop và ghi `loopStart`/`loopEnd` vào metadata. Rủi ro R-01 hạ từ **Cao** xuống **Thấp** — nhưng chỉ khi bước đó là bắt buộc trong đường ống, không phải làm tay từng tệp.

### 3.2 Không được chọn độ dài loop tuỳ ý — đây là bug tôi tự mắc rồi tự bắt

Lần đo đầu, chế độ "cửa sổ 2 giây" cắt cứng ở `start + 2 s` và cho bước nhảy `1.1e-2` — **gấp 10 lần ngưỡng, nghe được**. Mốc thời gian tuỳ ý rơi vào giữa dốc sóng.

Đã sửa: `findLoopPoints` nhận `maxDurationS` và **lùi điểm kết về điểm cắt không gần nhất trước mốc đó** (2 s → 1,9969 s, bước nhảy về `1.6e-14`).

Bài học cho đường ống A1.3: mọi tham số độ dài loop là *mức tối đa*, không phải *giá trị đúng*. Độ dài thật do vật liệu quyết định.

---

## 4. Đã dựng gì

```
src/audio/          bộ máy âm thanh — độc lập khung giao diện (NFR-50)
  gain.js           ánh xạ thanh trượt theo thang dB (NFR-31)
  trigger.js        lịch phát có seed cho tín hiệu âm (FR-15, FR-52)
  loop.js           tìm điểm loop + chấm chất lượng loop (FR-14, NFR-33)
  engine.js         đồ thị Web Audio: 3 bus Krause, vai Schafer, reverb (BA §5.2)
test/
  fake-audio-context.js   AudioContext giả, kiểm được ngoài trình duyệt (NFR-51)
scripts/
  gen_test_audio.py       sinh âm thử tuần hoàn chính xác bằng numpy
  serve.mjs               máy chủ tĩnh, không phụ thuộc gói ngoài
spike/
  index.html, spike.js    dụng cụ đo cổng G0 (cố tình không có thiết kế)
```

**56 kiểm thử đơn vị, phủ 98% câu lệnh trên `src/`** (ngưỡng 80% đã cấu hình trong `vitest.config.js`, build đỏ nếu tụt xuống dưới).

Toàn bộ viết theo TDD: mỗi hàm có test đỏ trước. Hai lỗi thiết kế bị bắt bằng cách này:

1. **`AudioBufferSourceNode` chỉ phát được một lần.** Bản đầu tạo nguồn ở `addLayer` rồi gọi `start()` lại cho mỗi lần kích hoạt — trong trình duyệt thật sẽ ném `InvalidStateError`, nghĩa là tiếng rao chỉ vang đúng một lần rồi im mãi. Đã sửa: mỗi lần kích hoạt tạo nguồn mới, lớp phát một lần không tạo nguồn nào cho tới khi cần.
2. **Bug độ dài loop tuỳ ý** ở §3.2.

Cả hai đều là loại lỗi chỉ lộ ra khi chạy thật hoặc khi bị test ép — không lộ ra khi đọc code.

## 4.1 Cách chạy

```bash
npm test              # 56 kiểm thử
npm run coverage      # phủ, có ngưỡng 80%
npm run gen:audio     # sinh lại âm thử (cần python3 + numpy)
npm run spike         # mở http://localhost:5173
```

---

## 5. Việc còn nợ trước khi đóng cổng G0

| # | Việc | Vì sao chưa làm được ở đây |
|---|---|---|
| G0-a | **Đo trên điện thoại thật tầm trung** | Chromium máy tính không đại diện được cho RAM và bộ giải mã của điện thoại. Mở `npm run spike` trên điện thoại cùng mạng LAN, bấm "6 nền + bộ vang", đọc ô số đo |
| G0-b | **Nghe loop liên tục 5 phút** (FR-14) | Phép đo cho thấy liền mạch ở mức số học, nhưng tiêu chí nghiệm thu là tai người. Trang spike có đồng hồ đếm |
| G0-c | **Kiểm iOS Safari** | Chính sách autoplay của iOS khắt khe hơn; mã đã xử lý `suspended → resume()` nhưng chưa chạy thật trên iOS |
| G0-d | Kéo thanh trượt khi đang phát, nghe xem có tiếng rè bậc thang | `setTargetAtTime` đã dùng và có test, nhưng vẫn cần xác nhận bằng tai |

### Suy ra cho vật liệu thật — hai NFR là ràng buộc sống còn

Đo được 23,1 MB cho 6 nền × 20 s **đơn kênh**. Ngoại suy:

| Vật liệu | RAM bộ đệm | Kết luận |
|---|---|---|
| 6 nền × 20 s, mono (đang đo) | 23 MB | ✅ thoải mái |
| 6 nền × 60 s, mono | ~64 MB | ✅ còn dư |
| 6 nền × 60 s, **stereo** | ~127 MB | ⚠️ sát ngưỡng 150 MB |
| 6 nền × 5 phút, stereo | **~635 MB** | ❌ điện thoại bị hệ điều hành giết tab |

Nghĩa là **NFR-02 (loop 30–60 s) và NFR-03 (phần lớn lớp dùng mono) không phải khuyến nghị mà là ràng buộc cứng** — số đo đã xác nhận. Bed dài buộc phải đi qua `MediaElementAudioSourceNode` (NFR-01), không được giải nén vào RAM.

---

## 6. Việc cần bạn làm

| # | Việc | Chặn cái gì |
|---|---|---|
| 1 | ~~**Cài `ffmpeg`**~~ **XONG** — `ffmpeg 4.4.2`, đã chạy trọn đường ống trên bản thu thật (§7) | — |
| 2 | Chốt **Q1** — thiết bị thu và định dạng gốc | Chặn chuyến thực địa đầu tiên. `check:recorder` nay đã chạy được trên âm thật (§7.4) nhưng **chưa chấm máy của nhóm** |
| 3 | Chốt **Q7** — React hay JS thuần | Chưa chặn: bộ máy âm thanh đã độc lập khung giao diện. Cần trước mốc M2 |
| 4 | Chạy G0-a…G0-d ở §5 | Chặn việc chính thức đóng cổng G0 |

---

## 7. Chạy trên vật liệu thật — lần đầu *(bổ sung 14/09/2026, việc S2.1 + S2.2)*

Mọi số đo ở §2 đều lấy trên âm tổng hợp `np.sin` + nhiễu numpy. Mục này là lần đầu đường ống gặp một bản thu thật.

### 7.1 Vật liệu

| | |
|---|---|
| Bản ghi | *Départ Ferry Hai Phong, Mai 1999* — `aporee_26366_30456` trên Internet Archive |
| Người thu | Emmanuel Faivre · mic Sony stereo + Minidisc Walkman |
| Nơi thu | 7 Ngô Quyền, Máy Chai, Hải Phòng · 20,88°N 106,70°E · 13/05/1999 |
| Giấy phép | **CC BY 3.0** — hợp lệ theo `phap-ly/09` |
| Tệp gốc | WAV 44,1 kHz · stereo · 16-bit · 553,75 s · 93,2 MiB |

**Đây là vật liệu thử đường ống, không phải mẫu cho bộ dữ liệu** — Hải Phòng không nằm trong bốn địa điểm. Chọn nó vì đây là bản thu thật tại Việt Nam duy nhất tìm được vừa có giấy phép sạch vừa còn tệp WAV gốc (xem `nghien-cuu/ung-vien-kho-am.md` §3).

Ngoài tệp đầy đủ còn cắt ba lát 30 giây ở phút 1, phút 4,5 và phút 8 — vì lớp nền thật sẽ dài cỡ đó, không phải 9 phút.

### 7.2 Đường ống chạy được trên âm thật

| Tệp | LUFS đo | Gain | LUFS ra | Đỉnh ra | Điểm loop (s) | Bước nhảy | Lặng cuối | Liền mạch |
|---|---|---|---|---|---|---|---|---|
| Đầy đủ 553 s | −20,47 | −2,53 | −23,00 | −2,38 | 0,2824→551,6031 | `4,7e-13` | 0,7 ms | ✅ |
| Lát phút 1 | −13,17 | −9,83 | −23,00 | −9,68 | 0,0037→29,9954 | `4,2e-15` | 0,8 ms | ✅ |
| Lát giữa | −12,27 | −10,73 | −23,00 | −10,90 | 0,0049→29,9996 | `4,3e-12` | 0 ms | ✅ |
| Lát cuối | −34,62 | **+11,62** | −23,00 | −7,19 | 0,0001→29,9977 | `2,1e-13` | 0,1 ms | ✅ |

Ba điều đọc ra được:

1. **`findLoopPoints` không xuống cấp trên âm thật.** Bước nhảy `4,2e-15 … 4,3e-12` — **cùng bậc** với dải `1,5e-14 … 1,5e-12` đo trên âm tổng hợp ở §2.1. Đây chính là giả định S2.1 nói là chưa ai kiểm. Nay đã kiểm, trên tiếng đám đông + nước + động cơ + nền ồn máy Minidisc cũ.
2. **Gain chạy đúng cả hai chiều.** Lát cuối là đoạn vắng, phải **nâng 11,62 dB**; lát giữa là đoạn đông, phải **hạ 10,73 dB**. Cả bốn đều ra đúng −23,00 LUFS, đỉnh cao nhất −2,38 dBTP — không tệp nào vượt ngưỡng. NFR-34 giữ được trên vật liệu thật.
3. **Không lỗi, không cảnh báo.** Tổng 12 tệp mã hoá, 27,19 MB.

### 7.3 So kích cỡ — con số "nén 7×" của B2.4 quá bi quan

| Tệp | WAV | Opus 72k | Tỉ số | Opus 144k | Tỉ số |
|---|---|---|---|---|---|
| Đầy đủ 553 s | 94 MB | 4,5 MB | **21,14×** | 9,1 MB | 10,33× |
| Lát phút 1 | 5,1 MB | 285 KB | 18,16× | 560 KB | 9,24× |
| Lát giữa *(đông nhất)* | 5,1 MB | 341 KB | **15,19×** | 688 KB | 7,51× |
| Lát cuối | 5,1 MB | 240 KB | 21,57× | 487 KB | 10,61× |

Khớp lý thuyết: WAV 44,1 kHz stereo 16-bit là 1411 kbps, chia cho 72 kbps ra 19,6×.

**Con số 7× trong B2.4 thực ra là tỉ số của Opus *144k* ở đoạn đông nhất (7,51×), không phải 72k.** Với 72k tỉ số thật là **15–21×**. Nghĩa là phép chiếu "6,4 s → 0,9 s" của B2.4 là **ước lượng dè dặt**, không phải lạc quan.

⚠️ **Nhưng chưa đóng được B2.4.** Thời gian tải không tỉ lệ thuần với số byte — còn bắt tay TLS và độ trễ đầu tiên. Phải đo lại trong trình duyệt với tệp Opus thật ở 5 Mbit/s chia nhau. Điều mục này chứng minh chỉ là: **ngân sách byte không phải chỗ chặn**, và mốc 5 giây của FR-21 nằm trong tầm.

Lưu ý cho ngân sách: đoạn **đông người nén kém nhất** (15,19×). Tính ngân sách phải lấy con số đó, không lấy 21×.

### 7.4 `check:recorder` trên âm thật *(một phần S2.2)*

| Chỉ số | Đo được |
|---|---|
| Kết luận | **DÙNG ĐƯỢC** |
| Nền ồn phòng | −35,1 dBFS |
| Nền dâng trong lặng | 0,6 dB |
| Khối bị cắt | 3% |
| AGC | không thấy |
| Khử ồn | không thấy |

**Không đóng được S2.2.** Mục đích của S2.2 là chấm **chiếc máy nhóm sẽ mang đi thu**, mà đây là máy của người khác từ năm 1999. Máy Minidisc thời đó không có AGC hay khử ồn để mà phát hiện, nên đây là bài thử *nhẹ* cho bộ dò. Cái nó chứng minh được: công cụ chạy trọn trên tệp 9 phút và không cho ra kết luận vô lý.

Đáng ghi làm mốc so sánh: **3% khối bị cắt** và nền ồn −35,1 dBFS là mức của một bản thu đám đông ngoài trời bằng thiết bị tiêu dùng — bản thu của nhóm nên tốt hơn con số này.

### 7.5 Bốn ô của S2.1

| Ô | Trạng thái |
|---|---|
| `npm run process` chạy không lỗi, xuất Opus 72k + 144k | ✅ |
| `findLoopPoints` trả về điểm loop không `null`, ghi `startS`/`endS` | ✅ — bảng §7.2 |
| So kích cỡ WAV vs Opus 72k | ✅ — bảng §7.3, **bác con số 7×** |
| Nghe 5 phút, ghi có nghe ra điểm nối không, ở giây thứ mấy | 🔴 **cần tai người** |

### 7.6 Ba giả định S2.1 nêu — trả lời được mấy

| Giả định chưa kiểm | Nay |
|---|---|
| "tìm điểm loop trên tiếng chợ" | ✅ **trả lời rồi** — §7.2, bốn trên bốn |
| "chuẩn hoá LUFS có làm bẹt tiếng rao" | 🟡 **chưa** — bản ghi này không có tiếng rao. Mới chứng minh được gain tuyến tính giữ đúng mức và không cắt đỉnh; câu hỏi thật là về **dải động của lớp signal**, phải chờ một bản thu có tiếng rao |
| "`scrambled` có nghe sai thật" | 🔴 **chưa** — cần kết xuất kích thích trên vật liệu thật rồi nghe |

Tệp âm không đưa vào git (quy ước repo). Dựng lại bằng:

```bash
curl -sSL -o pha.wav https://archive.org/download/aporee_26366_30456/FerryAllerHaiphongAlongmai1999.wav
npm run process -- pha.wav --out=build/audio
npm run check:recorder -- pha.wav
```
