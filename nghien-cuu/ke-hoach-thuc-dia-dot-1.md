# Kế hoạch thực địa đợt 1 — Hà Nội phố cổ và chợ nổi Cái Răng

**Việc:** A1.1 của lộ trình · S3.3 của spec · **Ngày lập khung:** 21/09/2026 (máy) · **Trạng thái:** 🟡 khung, **chưa có ngày và tên người**
**Đọc kèm:** `VAT-LIEU-4-DIA-DIEM.md` §3.1–3.2, §5 · `phap-ly/05-nhat-ky-thuc-dia.md` · `phap-ly/06-phieu-thu-am-cong-tac-vien.md`

Tệp này chỉ còn thiếu hai thứ máy không điền được: **ngày** và **tên người**. Mọi ô `⟨…⟩` là chỗ đó. Danh sách mẫu lấy thẳng từ `data/clips.json` (`provenance: field_recording`, hai địa điểm đầu), đối chiếu được bằng mắt.

Giả định đang dùng: nhóm ở **Hà Nội** (lộ trình xếp Hà Nội là địa điểm 1, ghé được nhiều lần). Sai thì đảo thứ tự hai mục dưới.

---

## 0. Trước khi đi — làm ở nhà, nửa ngày

| # | Việc | Đạt khi | Ai |
|---|---|---|---|
| 0.1 | **Chấm máy thu** (S2.2): thu 60 s theo mẫu 25 s lặng → 10 s có âm → 25 s lặng bằng đúng máy + app sẽ mang đi; chạy `npm run check:recorder -- <tệp>` | Kết luận DÙNG ĐƯỢC, ghi tên máy + app vào `BAO-CAO-G0.md`. Nếu KHÔNG: đổi máy, chấm lại, **không đi với máy chưa chấm** | ÂT |
| 0.2 | **Cài đặt máy**: WAV 48 kHz nếu app cho; tắt AGC, tắt khử ồn; chế độ máy bay; chắn gió (vải mỏng cũng được) | Ghi vào phiếu 05 mục "Phiếu cho một buổi thu" | ÂT |
| 0.3 | **In phiếu**: `phap-ly/05` (mọi buổi, mỗi mẫu một khối) · `phap-ly/01` ×3 (cho HN-04, dự phòng) · **biển A5** "Đang ghi âm phục vụ đề tài nghiên cứu Bản đồ âm thanh Việt Nam. Liên hệ ⟨tên⟩ ⟨số điện thoại⟩" | Có trong túi | VH |
| 0.4 | **Thẻ nhớ / dung lượng**: mỗi mẫu thu **dài gấp 3** mức cần (nền 60 s cần → thu 3 phút); WAV 48 kHz stereo ≈ 11,5 MB/phút | ≥ 2 GB trống | ÂT |
| 0.5 | Điền **ngày** và **tên người** vào §1, §2 dưới đây; commit | Không còn `⟨…⟩` ở hai cột đó | NC |

---

## 1. Hà Nội phố cổ — khu Hàng Bạc · Hàng Bồ · Đồng Xuân (21,0345 N · 105,8535 E, xác minh GPS tại chỗ)

### 1.1 Mẫu phải thu (theo `clips.json`)

| Mã | Mẫu | Vai | Khung giờ nên thu | Phiếu cần | Lưu ý tại chỗ |
|---|---|---|---|---|---|
| **HN-05** ⭐ | Tiếng gõ búa thợ bạc phố Hàng Bạc | dấu ấn · anthro | **9:00–11:30** hoặc **14:00–17:00** (giờ làm) | 05 · biển A5 · **xin phép chủ tiệm** (nơi kinh doanh, không phải nơi công cộng thuần) | Đứng 1–2 m, không che micro; thu ≥ 3 phút liền; ghi tên tiệm và số nhà |
| **HN-04** ⭐🎤 | Tiếng rao đêm ("xôi lạc bánh khúc", "bánh mì") | tín hiệu · anthro | **20:30–23:30**; dự phòng rao sáng **6:00–7:30** | 05 · **01 đồng thuận ghi âm** (giọng người, `consent_status: pending`) · biển A5 | Xin đồng thuận **trước** khi bấm; ghi âm luôn câu xin phép vào đầu tệp; mua hàng của người đó là phép lịch sự đúng chỗ |
| **HN-07** | Chim sẻ mái hiên / chim lồng quán trà | tín hiệu · bio | **5:30–7:00** | 05 | Chọn ngõ vắng xe; nếu là chim lồng quán trà thì hỏi chủ quán |

### 1.2 Thu thêm vì đang ở đó — thay ứng viên kho lệch địa lý (30 phút mỗi mẫu)

Ba mẫu này đang là `licensed_archive`, nhưng ứng viên tải về không phải Hà Nội. Nhóm ở ngay đó thì tự thu rẻ hơn và trung thực hơn. Thu được thì đổi `provenance` → `field_recording` trong `clips.json` (kèm lý do ở sổ quyết định).

| Mã | Mẫu | Vì sao nên tự thu | Khung giờ |
|---|---|---|---|
| **HN-01** | Rì rầm xe máy phố hẹp | Ứng viên ⭐ #451508 tên tệp gốc ghi *"…perspective **India**"* — còi và giọng Ấn Độ, không phải Hà Nội | 7:30–9:00 hoặc 17:00–18:30 (giờ đông), đứng trong ngõ hẹp, không đứng ngã tư |
| **HN-02** | Nền quán cà phê vỉa hè | Ứng viên là *university* và *Paris*; quán vỉa hè Hà Nội có ghế nhựa, tiếng chén, xe máy sát bên — khác | 8:00–10:00; hỏi chủ quán; tránh quán có loa nhạc (vướng bản quyền) |
| **HN-06** | Còi xe, chuông xe đạp | Ứng viên chỉ là chuông xe đạp đơn lẻ 23–30 s trong phòng | Cùng buổi HN-01 |

**HN-03** mưa mái hiên: tuỳ thời tiết, có mưa thì thu, không thì dùng bản kho (mưa là geophony, ít mang thông tin vùng — chấp nhận được).

### 1.3 Lịch đề xuất — hai buổi, cùng một ngày hoặc hai ngày

| Buổi | Giờ | Thu | Người |
|---|---|---|---|
| Sáng | 5:30–7:30 | HN-07 chim → HN-04 rao sáng (dự phòng) | ⟨…⟩ |
| Sáng | 8:00–11:30 | HN-02 cà phê → HN-01 + HN-06 xe máy → **HN-05 thợ bạc** | ⟨…⟩ |
| Tối | 20:30–23:30 | **HN-04 rao đêm** | ⟨…⟩ (đi 2 người) |

**Ngày:** ⟨…/…/2026⟩ · **Ngày dự phòng nếu mưa:** ⟨…⟩

### 1.4 Đạt khi

- [ ] HN-04, HN-05, HN-07 mỗi mã có ≥ 1 tệp WAV gốc, dài ≥ 3× mức cần, tên tệp ghi mã tạm
- [ ] Mỗi tệp có khối "Từng mẫu âm" trong phiếu 05 điền **tại chỗ**: giờ (cả phút), toạ độ, hướng micro, khoảng cách, thời tiết, ồn chen
- [ ] HN-04 có phiếu 01 ký; câu xin phép nằm ở đầu tệp gốc
- [ ] Về nhà: `npm run process -- <tệp…> --out=build/audio` chạy không lỗi; `findLoopPoints` không `null` với mẫu nền
- [ ] `clips.json`: đổi `status` khỏi `planned` theo từ vựng `CLIP_STATUSES` (`src/domain/taxonomy.js`), điền `location_verified: true`, `recording_notice_given: true`; `npm run validate` ĐẠT
- [ ] **Ghi ngày thu mẫu có giọng đầu tiên** (HN-04) vào đầu tệp này — mốc tham chiếu cho sổ quyết định Q-25

---

## 2. Chợ nổi Cái Răng, Cần Thơ (10,0086 N · 105,7561 E)

**Quyết trước:** nhóm **đi** hay nhờ **cộng tác viên tại chỗ** (`phap-ly/06`)? `VAT-LIEU` §5.2 xếp Cái Răng vào nhóm cộng tác viên làm được — nhưng CR-04 và CR-05 là ⭐ phải `must_verify_on_site`, nên cộng tác viên phải ghi toạ độ + ảnh bản đồ để `location_verified: true` có căn cứ. **Chọn:** ☐ nhóm đi · ☐ cộng tác viên ⟨tên, liên hệ⟩

### 2.1 Mẫu phải thu

| Mã | Mẫu | Vai | Khung giờ | Phiếu | Lưu ý |
|---|---|---|---|---|---|
| **CR-04** ⭐ | Máy đuôi tôm chạy gần | dấu ấn · anthro | **5:00–7:00** (chợ đông) | 05 | Thu từ ghe mình, máy đuôi tôm ghe khác đi ngang 3–5 m; thu ≥ 5 lần vì mỗi lần ngắn |
| **CR-05** ⭐🎤 | Tiếng rao trên ghe ("hủ tiếu", "cà phê") | tín hiệu · anthro | 5:00–7:00 | 05 · **01** | Mua hàng rồi xin đồng thuận; ghi câu xin phép đầu tệp |
| **CR-02** | Nền chợ trên sông, động cơ xa | nền · anthro | 5:00–7:00 **và** 9:00–10:00 (chợ tan — soundscape khác hẳn, BA §8.2 "thời điểm trong ngày") | 05 · biển A5 trên ghe | Thu liền ≥ 5 phút mỗi lần, ghe tắt máy |
| **CR-06** | Mái chèo, va mạn thuyền | tín hiệu · anthro | Bất kỳ | 05 | Ghe chèo tay ngày càng ít — hỏi chủ ghe |
| CR-01 *(nếu Q-28 chốt tự thu)* | Nước vỗ mạn ghe gỗ | nền · geo | Bất kỳ, ghe tắt máy | 05 | Ứng viên kho đều là thuyền buồm biển |
| CR-03 *(nếu Q-28 chốt tự thu)* | Chim nước / miệt vườn buổi sớm | nền · bio | **5:00–6:00** trước khi chợ ồn, hoặc bờ kênh vắng | 05 | Ứng viên kho đều là chim ôn đới |

### 2.2 Lịch đề xuất

| Buổi | Giờ | Thu | Người |
|---|---|---|---|
| Rạng sáng | 4:30 thuê ghe · 5:00–7:00 | CR-03 → **CR-04**, **CR-05**, CR-02 (đông) → CR-06 | ⟨…⟩ |
| Giữa buổi | 9:00–10:00 | CR-02 (chợ tan) → CR-01 | ⟨…⟩ |

**Ngày:** ⟨…/…/2026⟩ · Thuê ghe: ⟨…⟩ · Chi phí dự kiến: ⟨…⟩

### 2.3 Đạt khi

- [ ] CR-04, CR-05, CR-02 (hai thời điểm), CR-06 mỗi mã ≥ 1 WAV gốc + khối phiếu 05
- [ ] CR-05 có phiếu 01 ký
- [ ] Nếu cộng tác viên: tệp + ảnh bản đồ + phiếu 06 điền đủ, người thu ghi vào `contributor`
- [ ] `process` chạy, `validate` ĐẠT như §1.4

---

## 3. Không nằm trong đợt 1

| Việc | Vì sao để sau |
|---|---|
| **A1.1b đo phản hồi xung** (quét hình sin tại chỗ) | Chỉ cần nếu S1.3 chốt còn dùng vang trong kích thích. Khuyến nghị hiện tại là bỏ vang khỏi kích thích ⇒ không đo. Nếu NC chốt ngược, thêm 20 phút mỗi địa điểm, cần loa phát và tệp quét |
| Huế (HU-01, 03, 04⭐, 05🎤⚠️, 06⭐🎤⚠️) và Buôn Ê Đê (TN-04, 05⭐⚠️, 06⭐⚠️) | Đợt 2 (A3.1). Cả hai nơi có mẫu **nhạy cảm** (tôn giáo, dân tộc) và cần **phiếu 02** ghi công cộng đồng + xin phép nhà chùa / gặp nghệ nhân — không nhờ cộng tác viên thay được (`VAT-LIEU` §5.2) |

---

## 4. Việc sau đợt 1 mà đợt 1 mở khoá

1. **Bản trộn Hà Nội thật đầu tiên** = nền kho đã duyệt (hoặc HN-01/02 tự thu) + HN-05 ⭐ + HN-04 → `render:stimuli` không `--placeholder` → **nghe `scrambled` có "sai" thật không** (câu treo cuối của G0, `BAO-CAO-G0.md` §7.6)
2. Câu treo thứ hai của §7.6 — *"chuẩn hoá LUFS có làm bẹt tiếng rao"* — trả lời được ngay khi HN-04 đi qua `process`
3. Thẻ văn hoá (VH2.1) cho 3–6 mẫu vừa thu, viết khi ký ức còn mới
