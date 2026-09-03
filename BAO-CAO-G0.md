# Báo cáo cổng G0 — spike âm thanh M0

**Ngày:** 2026-08-05 · **Tài liệu liên quan:** `BA-VietSoundscape.md` · `LO-TRINH-VietSoundscape.md` §M0

Cổng G0 chỉ hỏi hai câu. Spike này không làm giao diện, chỉ đo.

---

## 1. Kết luận

| Câu hỏi của cổng G0 | Kết quả |
|---|---|
| Lớp âm nền có lặp liền mạch được không? | ✅ **Được** — bước nhảy biên độ `1.5e-14` … `1.5e-12`, tức là ở mức sai số dấu phẩy động của máy |
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
| 1 | **Cài `ffmpeg`** (`sudo apt install ffmpeg`) | Chặn đường ống xử lý A1.3 ở mốc M1 — cần `ffmpeg -af loudnorm` để đo LUFS (NFR-30). Không có cách thay thế hợp lý |
| 2 | Chốt **Q1** — thiết bị thu và định dạng gốc | Chặn chuyến thực địa đầu tiên |
| 3 | Chốt **Q7** — React hay JS thuần | Chưa chặn: bộ máy âm thanh đã độc lập khung giao diện. Cần trước mốc M2 |
| 4 | Chạy G0-a…G0-d ở §5 | Chặn việc chính thức đóng cổng G0 |
