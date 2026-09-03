import { describe, expect, test } from 'vitest';
import { buildRenderCommand, panGains } from './render-graph.js';

const plan = (overrides = {}) => ({
  id: 'hue-trua-he--layered',
  recipe_id: 'hue-trua-he',
  condition: 'layered',
  duration_s: 60,
  events: [
    { clip_id: 'HU-01', start_s: 0, length_s: 60, gain_db: -18, pan: 0, loops: true },
    { clip_id: 'HU-05', start_s: 17.25, length_s: 3, gain_db: -9, pan: -0.5, loops: false },
  ],
  ...overrides,
});

const sourceFor = (clipId) => `spike/audio/${clipId}.wav`;
const build = (overrides = {}, options = {}) =>
  buildRenderCommand(plan(overrides), { sourceFor, outputPath: 'out.wav', ...options });

describe('panGains — luật dịch trái phải đẳng công suất', () => {
  test('giữa thì hai bên bằng nhau, tổng công suất giữ nguyên', () => {
    const { left, right } = panGains(0);
    expect(left).toBeCloseTo(Math.SQRT1_2, 6);
    expect(right).toBeCloseTo(Math.SQRT1_2, 6);
    expect(left ** 2 + right ** 2).toBeCloseTo(1, 6);
  });

  test('hết trái và hết phải', () => {
    expect(panGains(-1)).toMatchObject({ left: 1 });
    expect(panGains(-1).right).toBeCloseTo(0, 6);
    expect(panGains(1).left).toBeCloseTo(0, 6);
    expect(panGains(1).right).toBeCloseTo(1, 6);
  });

  test('giữ công suất không đổi ở mọi vị trí', () => {
    // Cùng luật với StereoPannerNode của Web Audio cho nguồn mono, để bản kết
    // xuất nghe giống bộ trộn thời gian thực.
    for (const p of [-0.8, -0.3, 0.15, 0.62]) {
      const { left, right } = panGains(p);
      expect(left ** 2 + right ** 2).toBeCloseTo(1, 6);
    }
  });
});

describe('buildRenderCommand — dựng lệnh ffmpeg từ kịch bản', () => {
  test('mỗi sự kiện là một nguồn vào', () => {
    const { args, inputCount } = build();
    expect(inputCount).toBe(2);
    expect(args.filter((a) => a === '-i')).toHaveLength(2);
    expect(args).toContain('spike/audio/HU-01.wav');
    expect(args).toContain('spike/audio/HU-05.wav');
  });

  test('lớp nền được lặp để phủ trọn độ dài của nó', () => {
    // Nền chỉ dài 20 giây mà phải phủ 60 giây: không lặp thì 40 giây cuối im lặng.
    const args = build().args;
    expect(args).toContain('-stream_loop');
    expect(args[args.indexOf('-stream_loop') + 1]).toBe('-1');
  });

  test('âm phát một lần KHÔNG được lặp', () => {
    const oneShotOnly = build({
      events: [{ clip_id: 'HU-05', start_s: 0, length_s: 3, gain_db: 0, pan: 0, loops: false }],
    });
    expect(oneShotOnly.args).not.toContain('-stream_loop');
  });

  test('mỗi nguồn vào bị cắt đúng độ dài sự kiện', () => {
    const args = build().args;
    const durations = args.filter((a, i) => args[i - 1] === '-t');
    expect(durations).toContain('60.000000');
    expect(durations).toContain('3.000000');
  });

  test('mỗi sự kiện có một chuỗi lọc riêng: âm lượng, trái phải, độ trễ', () => {
    const { filterComplex } = build();
    expect(filterComplex).toContain('volume=-18.000000dB');
    expect(filterComplex).toContain('volume=-9.000000dB');
    expect(filterComplex).toContain('pan=stereo');
    expect(filterComplex).toMatch(/adelay=17250/); // 17,25 giây → 17250 ms
  });

  test('sự kiện bắt đầu ở giây 0 không cần độ trễ', () => {
    const chains = build().filterComplex.split(';');
    expect(chains[0]).not.toContain('adelay');
  });

  test('trộn bằng amix với normalize=0', () => {
    // Thiếu normalize=0 thì amix chia biên độ cho số nguồn — bản 6 lớp sẽ nhỏ
    // hơn bản 2 lớp, và độ to trở thành yếu tố gây nhiễu (FR-57).
    expect(build().filterComplex).toContain('amix=inputs=2:duration=longest:normalize=0');
  });

  test('đệm im lặng rồi cắt đúng thời lượng khung', () => {
    // Kịch bản isolated có thể kết thúc trước hết khung; thiếu apad thì tệp
    // ngắn hơn, và FR-56 lệch thời lượng ngay ở bước kết xuất.
    const { filterComplex, args } = build();
    expect(filterComplex).toContain('apad');
    expect(args[args.lastIndexOf('-t') + 1]).toBe('60.000000');
  });

  test('bật cờ bitexact để chạy lại ra đúng byte cũ', () => {
    // Không có mấy cờ này thì ffmpeg ghi tên phiên bản vào tệp, và SHA-256 đổi
    // theo phiên bản ffmpeg — bảng kê băm của FR-52 mất ý nghĩa.
    const args = build().args;
    expect(args).toContain('-fflags');
    expect(args).toContain('+bitexact');
    expect(args).toContain('-map_metadata');
    expect(args).toContain('-1');
  });

  test('kết xuất 48 kHz stereo, PCM 24-bit', () => {
    const args = build().args;
    expect(args[args.indexOf('-ar') + 1]).toBe('48000');
    expect(args[args.indexOf('-ac') + 1]).toBe('2');
    expect(args[args.indexOf('-c:a') + 1]).toBe('pcm_s24le');
  });

  test('cùng kịch bản thì cùng lệnh — điều kiện cần của tái lập', () => {
    expect(build()).toEqual(build());
  });

  test('báo lỗi khi kịch bản không có sự kiện nào', () => {
    expect(() => build({ events: [] })).toThrow(/không có sự kiện/i);
  });

  test('báo lỗi khi không tìm được tệp âm cho một mẫu', () => {
    expect(() => build({}, { sourceFor: () => undefined })).toThrow(/HU-01/);
  });
});

describe('vang không gian — phòng nghe và kích thích phải khớp nhau', () => {
  const plan = {
    id: 'hue-trua-he--layered',
    duration_s: 60,
    events: [
      { clip_id: 'HU-01', start_s: 0, length_s: 60, gain_db: -6, pan: 0, loops: true },
      { clip_id: 'HU-04', start_s: 12, length_s: 3, gain_db: -3, pan: 0.4, loops: false },
    ],
  };
  const options = { sourceFor: (id) => `/am/${id}.wav`, outputPath: '/ra/x.wav' };

  test('không khai vang thì lệnh y như cũ — không tự thêm gì', () => {
    const command = buildRenderCommand(plan, options);
    expect(command.filterComplex).not.toContain('afir');
    expect(command.inputCount).toBe(2);
  });

  test('có vang thì thêm tệp phản hồi xung làm nguồn vào cuối', () => {
    const command = buildRenderCommand(plan, { ...options, impulsePath: '/ir/hue.wav' });
    expect(command.args).toContain('/ir/hue.wav');
    expect(command.inputCount).toBe(3);
    // Phản hồi xung phải là nguồn CUỐI: các chỉ số nguồn của sự kiện đã dùng
    // 0…n−1, chèn vào giữa là lệch hết.
    expect(command.filterComplex).toContain('[2:a]afir=');
  });

  test('dùng ĐÚNG luật đẳng công suất như bộ máy phòng nghe', () => {
    // Hai chỗ lệch nhau thì người tham gia nghe một đằng, trang web trình diễn
    // một nẻo — mà H2 nói về chính cái cảm giác không gian đó.
    const command = buildRenderCommand(plan, {
      ...options, impulsePath: '/ir/hue.wav', reverbMix: 0.25,
    });
    const match = command.filterComplex.match(/afir=dry=([\d.]+):wet=([\d.]+)/);
    expect(match).not.toBeNull();
    const [dry, wet] = [Number(match[1]), Number(match[2])];
    expect(dry * dry + wet * wet).toBeCloseTo(1, 5);
    expect(dry).toBeGreaterThan(wet); // mặc định nghiêng về khô
  });

  test('tỉ lệ vang ngoài [0, 1] thì chặn', () => {
    for (const reverbMix of [-0.2, 1.4, 'ướt']) {
      expect(() =>
        buildRenderCommand(plan, { ...options, impulsePath: '/ir/x.wav', reverbMix }),
      ).toThrow();
    }
  });

  test('tắt tự chỉnh gain của afir — nếu không thì băm đổi theo nội dung IR một cách không lường được', () => {
    const command = buildRenderCommand(plan, { ...options, impulsePath: '/ir/hue.wav' });
    expect(command.filterComplex).toContain('gtype=none');
  });
});
