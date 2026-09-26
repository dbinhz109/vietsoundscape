# Demo đầy đủ → dữ liệu thật, không sửa mã

## 1. Chạy ngay với dữ liệu mô phỏng

Cần Node ≥ 22, ffmpeg, ffprobe, Python 3 và numpy (`python3 -m pip install numpy`).

```bash
npm ci
npm run setup:demo
npm run dev
```

Mở phòng nghe tại http://localhost:5174/ và phiên thử tại
http://localhost:5174/thuc-nghiem.html?nguoi=0. Số `nguoi` bắt đầu từ 0.
Dùng đuôi `.html` để URL chạy trên cả máy phát triển lẫn máy chủ tĩnh.

Lệnh setup thực hiện toàn bộ:

1. Sinh **32 WAV tổng hợp** theo mã mẫu, seed cố định.
2. Đo LUFS, áp gain, tìm điểm loop, xuất Opus/AAC cho web và WAV không mất dữ liệu cho nghiên cứu.
3. Nối **12 bản trộn / 4 địa điểm** với âm đã xử lý.
4. Kết xuất **36 kích thích**, mỗi kích thích 60 giây, tên tệp theo băm.
5. Sinh **96 log / 384 lượt** qua cùng máy trạng thái của trang thực nghiệm.
6. Chạy phân tích, ghi báo cáo minh họa ở `build/demo/analysis.txt`.

Lần đầu mất vài phút, cần khoảng 1–2 GB trống khi kết xuất và build.
Âm tổng hợp là vật liệu thử chức năng, không tái tạo trung thực giọng nói, nhạc hay
đặc trưng văn hóa địa phương. Log giả có nhãn `synthetic: true`, đồng thuận giả có
`consent_simulated: true`. Các điều kiện dùng cùng phân phối trả lời; không cài trước
kết luận nghiên cứu. Báo cáo luôn giữ nhãn mô phỏng.

```bash
npm run validate:runtime
npm run analyse:demo
npm run build
npm run preview
```

Build kèm dữ liệu, âm web và kích thích nên cả hai trang dùng được trên máy chủ tĩnh.
Vite tự dùng `build/runtime/data/` khi đã prepare; chưa prepare thì dùng `data/`.
Khởi động lại dev/preview sau khi đổi bộ dữ liệu.
Các WAV thực nghiệm dùng HTTP Range nên cần máy chủ chạy (dev/preview cũng dùng
được khi tắt wifi); không dựa vào cache PWA để bảo đảm phiên thực nghiệm ngoại tuyến. Không commit `build/`, `dist/` hay WAV.

## 2. Thay bằng âm thật

Tạo thư mục `input/audio/`, đặt **32 WAV** theo đúng mã trong `data/clips.json`:
`HN-01.wav` … `HN-08.wav`, `CR-01.wav` … `CR-08.wav`,
`HU-01.wav` … `HU-08.wav`, `TN-01.wav` … `TN-08.wav`.

```bash
mkdir -p input/audio
cp templates/audio-metadata.json input/audio/metadata.json
```

Điền metadata thực tế trong `input/audio/metadata.json`. Đây là dữ liệu đầu vào,
không phải mã nguồn. Mỗi khóa là một mã mẫu, giá trị là các trường cần cập nhật:

- Mẫu tải từ kho: bắt buộc `source_url`, `source_uploader`, `downloaded_at`.
- Mẫu tự thu: điền thời gian, thiết bị, tọa độ, người sở hữu và thông tin thực địa.
- `location_verified`, giấy phép và đồng thuận chỉ điền theo bằng chứng thật.
- Nếu thay nguồn kho bằng tự thu, cập nhật `provenance` và các trường liên quan.
- Pipeline đo lại thời lượng, LUFS, điểm loop, SHA-256; không cần nhập tay các số này.
- Khi muốn chuyển `status` sang `published`, phải điền đủ các trường xuất bản theo
  `src/data/clip-schema.js`; pipeline giữ nguyên các kiểm tra hiện có.

Mẫu metadata để trống những thông tin chưa có; lệnh sẽ báo cụ thể mã và trường thiếu.
Nó không tự xác nhận quyền sử dụng hay thực địa. Bản thật ở trạng thái `processed`
chạy được về kỹ thuật nhưng vẫn cần kiểm tra các điều kiện nghiên cứu trong nghiệm thu.

```bash
npm run setup:real
npm run validate:runtime
npm run build
npm run preview
```

Hoặc lấy WAV/metadata từ thư mục khác:

```bash
npm run setup:real -- --input=/duong/dan/thu-am
```

Bộ thật đi qua đúng đường xử lý của demo. Pipeline đổi URL trong bản trộn, bỏ
`placeholder_audio`, đổi nhãn và kết xuất lại kích thích tự động. Không phải sửa JS.
Đầu vào thiếu hoặc metadata sai sẽ dừng trước khi thay bộ đang dùng. Sau prepare,
kích thích cũ bị bỏ để không vô tình chạy phiên nghe bằng âm của bộ trước.
Nếu kết xuất lỗi, sửa đầu vào hoặc môi trường rồi chạy lại `npm run render:stimuli`.

## 3. Thu và phân tích log thật

Cấp số thứ tự khác nhau cho từng người: `thuc-nghiem.html?nguoi=0`, `?nguoi=1`, …
Trang tải một JSON khi người đó hoàn tất. Lưu các tệp thật vào `input/logs/`
(tự quản lý cục bộ, không đưa vào Git). Không tự sinh câu trả lời cho người thật.

```bash
npm run analyse -- input/logs/ > build/analysis-real.txt
```

Không cần đổi cấu trúc log: trang ghi cùng format như bộ demo, kèm mã phiên bản
bộ dữ liệu và băm các kích thích. Bộ phân tích chặn log trùng người, gộp demo với
thật, và gộp các phiên bản dữ liệu khác nhau. Log thu trên âm demo vẫn mang nhãn demo.
Thay bộ âm giữa đợt thu thì phải tách đợt phân tích.

`setup:real` không xóa log demo và không tạo log người thật. Log demo luôn ở
`build/demo/logs/`; chọn thư mục thật khi chạy analyse.

## 4. Các tệp và lệnh hữu ích

| Đường dẫn / lệnh | Công dụng |
|---|---|
| `data/` | Dữ liệu biên tập gốc, không bị setup ghi đè |
| `templates/audio-metadata.json` | Mẫu metadata cho 32 mã |
| `build/runtime/data/` | Dữ liệu đang phục vụ ứng dụng |
| `build/runtime/audio/` | Các bản âm đã mã hóa, tên kèm băm |
| `build/runtime/processing.json` | Số đo của từng WAV nguồn |
| `build/stimuli/manifest.json` | Bộ kích thích, phiên bản, băm và nhãn demo/thật |
| `build/demo/logs/` | 96 log mô phỏng |
| `build/demo/analysis.txt` | Báo cáo minh họa, không phải kết quả nghiên cứu |
| `npm run prepare:demo` / `prepare:real` | Chỉ xử lý nguồn, chưa kết xuất kích thích |
| `npm run render:stimuli` | Kết xuất từ bộ đã prepare |
| `npm run demo:logs` | Sinh lại 96 log, chỉ dùng khi bộ đang chạy là demo |

Luồng cũ `gen:audio` và `render:stimuli -- --placeholder` dành cho spike vẫn tồn tại.
Để chạy toàn bộ tính năng, dùng `setup:demo` / `setup:real` ở trên.

## Kiểm tra đường nhập dữ liệu

`npm run test:workflow` dùng WAV tổng hợp làm fixture trong thư mục tạm để kiểm
nhánh nhập thật: 32 mã, 12 bản trộn, đường dẫn đầu ra, giữ nguyên dữ liệu biên tập
và giữ bộ đang dùng khi thiếu đầu vào. Nó không tạo bản thu hay bằng chứng thực địa.
CI chạy phép kiểm này cùng test đơn vị. Workflow Pages dựng đầy đủ bộ demo; khi
triển khai dữ liệu thật, dùng bản `dist/` tạo từ `setup:real` theo hướng dẫn trên.
