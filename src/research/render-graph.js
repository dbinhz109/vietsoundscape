/**
 * Dựng lệnh ffmpeg kết xuất một kịch bản kích thích thành tệp cố định (FR-52).
 *
 * ## Vì sao kết xuất phía máy chủ, không phải trên máy người tham gia
 *
 * Bản BA đầu ghi kết xuất *"bằng `OfflineAudioContext`"*. Nếu hiểu thành "mỗi máy
 * tự kết xuất khi chạy" thì sai mục đích: `OfflineAudioContext` **không** bảo đảm
 * cho ra byte giống nhau giữa các trình duyệt và các phiên bản — khác cách nội
 * suy khi đổi tần số mẫu, khác cách xử lý số cực nhỏ. Điều FR-52 cần là **kết
 * xuất một lần, ở một chỗ, rồi phát đúng tệp đó cho mọi người**, đối chiếu bằng
 * SHA-256. Làm bằng ffmpeg thì chạy lại được trong CI.
 *
 * ## Tách logic khỏi việc gọi tiến trình
 *
 * Module này **không** gọi ffmpeg. Nó chỉ trả về danh sách tham số, nên kiểm được
 * bằng test đơn vị. Việc gọi tiến trình và băm tệp nằm ở `scripts/render-stimuli.mjs`.
 *
 * @see BA §10.5 · `variants.js` sinh ra kịch bản mà module này kết xuất
 */

import { DEFAULT_REVERB_MIX, reverbMixGains } from '../audio/gain.js';

/** Kết xuất bản gốc: 48 kHz, stereo, PCM 24-bit — cùng chuẩn với bản thu thật. */
export const RENDER_FORMAT = Object.freeze({
  sampleRate: 48000,
  channels: 2,
  codec: 'pcm_s24le',
});

const fixed = (value) => value.toFixed(6);

/**
 * Luật dịch trái phải **đẳng công suất** cho nguồn mono.
 *
 * Cùng luật với `StereoPannerNode` của Web Audio, để bản kết xuất nghe giống bộ
 * trộn thời gian thực. Luật tuyến tính (`L = 1−p`, `R = p`) sẽ làm âm **hụt ở
 * giữa** khoảng 3 dB, và vì mỗi điều kiện có cách dịch khác nhau, chỗ hụt đó biến
 * thành lệch độ to giữa các điều kiện — đúng thứ FR-57 phải khử.
 *
 * @param {number} pan −1 (hết trái) … 0 (giữa) … 1 (hết phải)
 * @returns {{left: number, right: number}}
 */
export function panGains(pan) {
  const angle = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
  return { left: Math.cos(angle), right: Math.sin(angle) };
}

/**
 * @param {object} plan Kịch bản từ `buildVariants`.
 * @param {object} options
 * @param {(clipId: string) => string | undefined} options.sourceFor Đường dẫn tệp âm của một mẫu.
 * @param {string} options.outputPath
 * @param {string} [options.impulsePath] tệp phản hồi xung của không gian
 * @param {number} [options.reverbMix] 0 (khô hẳn) … 1 (ướt hẳn)
 * @returns {{args: string[], filterComplex: string, inputCount: number}}
 */
export function buildRenderCommand(plan, {
  sourceFor,
  outputPath,
  impulsePath = null,
  reverbMix = DEFAULT_REVERB_MIX,
}) {
  const events = Array.isArray(plan.events) ? plan.events : [];
  if (events.length === 0) {
    throw new Error(`Kịch bản "${plan.id}" không có sự kiện nào để kết xuất.`);
  }

  /** @type {string[]} */
  const inputArgs = [];
  /** @type {string[]} */
  const chains = [];

  events.forEach((event, index) => {
    const source = sourceFor(event.clip_id);
    if (!source) {
      throw new Error(
        `Không tìm được tệp âm cho mẫu "${event.clip_id}" trong kịch bản "${plan.id}". ` +
          'Chưa có tệp thì không kết xuất được kích thích — kiểm lại đường dẫn hoặc chạy ' +
          '`npm run process` để sinh bản đã xử lý.',
      );
    }

    // Lớp nền chỉ dài vài chục giây mà phải phủ trọn khung, nên phải lặp nguồn.
    // Cắt bằng `-t` **trước** `-i` để ffmpeg chỉ đọc đúng phần cần, và để lần
    // lặp cuối bị cắt gọn thay vì tràn ra ngoài khung.
    if (event.loops) inputArgs.push('-stream_loop', '-1');
    inputArgs.push('-t', fixed(event.length_s), '-i', source);

    const { left, right } = panGains(event.pan ?? 0);
    const steps = [
      `volume=${fixed(event.gain_db ?? 0)}dB`,
      `pan=stereo|c0=${fixed(left)}*c0|c1=${fixed(right)}*c0`,
    ];

    const delayMs = Math.round((event.start_s ?? 0) * 1000);
    if (delayMs > 0) steps.push(`adelay=${delayMs}:all=1`);

    chains.push(`[${index}:a]${steps.join(',')}[a${index}]`);
  });

  const labels = events.map((_, index) => `[a${index}]`).join('');
  // `normalize=0` là bắt buộc: mặc định amix chia biên độ cho số nguồn, nên bản
  // 6 lớp sẽ nhỏ hơn bản 2 lớp và độ to thành yếu tố gây nhiễu (FR-57).
  const stages = [
    ...chains,
    `${labels}amix=inputs=${events.length}:duration=longest:normalize=0[mix]`,
  ];

  let mixed = '[mix]';
  if (impulsePath) {
    // Phản hồi xung là nguồn **cuối cùng**: các chỉ số 0…n−1 đã thuộc về sự kiện,
    // chèn vào giữa là lệch hết đồ thị.
    const irIndex = events.length;
    inputArgs.push('-i', impulsePath);
    const { dryGain, wetGain } = reverbMixGains(reverbMix);
    // `gtype=none` tắt tự chỉnh gain của afir. Để mặc định (`peak`) thì hệ số
    // khuếch đại phụ thuộc nội dung IR theo cách không lường trước được, nên hai
    // bản trộn cùng tỉ lệ vang lại ra độ to khác nhau — đúng thứ FR-57 phải khử.
    // Khô/ướt lấy từ `reverbMixGains`, **chung một hàm** với bộ máy phòng nghe.
    stages.push(
      `[mix][${irIndex}:a]afir=dry=${fixed(dryGain)}:wet=${fixed(wetGain)}:gtype=none[wetted]`,
    );
    mixed = '[wetted]';
  }

  // `apad` + `-t` cho tệp dài đúng khung, kể cả khi sự kiện cuối kết thúc sớm.
  // Đặt SAU bộ vang: đuôi vang của sự kiện cuối cũng phải nằm trong khung.
  stages.push(`${mixed}apad[out]`);
  const filterComplex = stages.join(';');

  return {
    inputCount: events.length + (impulsePath ? 1 : 0),
    filterComplex,
    args: [
      // Không có mấy cờ này thì ffmpeg ghi tên phiên bản vào tệp, và SHA-256 đổi
      // theo phiên bản ffmpeg — bảng kê băm của FR-52 mất ý nghĩa.
      '-hide_banner',
      '-nostdin',
      '-fflags',
      '+bitexact',
      '-flags',
      '+bitexact',
      ...inputArgs,
      '-filter_complex',
      filterComplex,
      '-map',
      '[out]',
      '-map_metadata',
      '-1',
      '-ar',
      String(RENDER_FORMAT.sampleRate),
      '-ac',
      String(RENDER_FORMAT.channels),
      '-c:a',
      RENDER_FORMAT.codec,
      '-t',
      fixed(plan.duration_s),
      '-y',
      outputPath,
    ],
  };
}
