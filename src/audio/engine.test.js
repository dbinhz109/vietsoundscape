import { beforeEach, describe, expect, test } from 'vitest';
import { KRAUSE_CLASSES, createSoundscapeEngine } from './engine.js';
import { FakeAudioContext, fakeBuffer, pathExists } from '../../test/fake-audio-context.js';
import { sliderToGain } from './gain.js';

const keynote = (overrides = {}) => ({
  id: 'traffic-bed',
  krauseClass: 'anthrophony',
  schaferRole: 'keynote',
  buffer: fakeBuffer({ duration: 30 }),
  loopStartS: 1.5,
  loopEndS: 28.25,
  ...overrides,
});

describe('createSoundscapeEngine', () => {
  /** @type {FakeAudioContext} */
  let context;
  /** @type {ReturnType<typeof createSoundscapeEngine>} */
  let engine;

  beforeEach(() => {
    context = new FakeAudioContext();
    engine = createSoundscapeEngine(context);
  });

  test('dựng đúng ba bus theo khung phân loại Krause', () => {
    expect(Object.keys(engine.buses).sort()).toEqual([...KRAUSE_CLASSES].sort());
  });

  test('mỗi bus có đường đi tới đầu ra của thiết bị', () => {
    for (const bus of Object.values(engine.buses)) {
      expect(pathExists(bus, context.destination)).toBe(true);
    }
  });

  test('lớp âm nối vào đúng bus theo nhóm nguồn phát của nó', () => {
    engine.addLayer(keynote({ krauseClass: 'biophony' }));
    const source = context.created.find((node) => node.type === 'bufferSource');

    expect(pathExists(source, engine.buses.biophony)).toBe(true);
    expect(pathExists(source, engine.buses.geophony)).toBe(false);
  });

  test('lớp âm đi qua một bộ chỉnh trái phải riêng', () => {
    engine.addLayer(keynote({ pan: -0.4 }));
    const panner = context.created.find((node) => node.type === 'panner');

    expect(panner.pan.value).toBeCloseTo(-0.4, 6);
  });

  test('lớp âm nền bật lặp và nhận đúng điểm loop đã tính', () => {
    engine.addLayer(keynote());
    const source = context.created.find((node) => node.type === 'bufferSource');

    expect(source.loop).toBe(true);
    expect(source.loopStart).toBeCloseTo(1.5, 6);
    expect(source.loopEnd).toBeCloseTo(28.25, 6);
  });

  test('lớp dấu ấn âm thanh không lặp — nó là âm phát một lần', () => {
    engine.addLayer(keynote({ id: 'tram-bell', schaferRole: 'soundmark' }));
    engine.triggerOnce('tram-bell');
    const source = context.created.find((node) => node.type === 'bufferSource');

    expect(source.loop).toBe(false);
  });

  test('lớp phát một lần chưa tạo nguồn nào cho tới khi được kích hoạt', () => {
    // Nguồn tạo sẵn rồi không dùng là bộ nhớ đổ đi (NFR-04).
    engine.addLayer(keynote({ id: 'tram-bell', schaferRole: 'soundmark' }));

    expect(context.created.filter((node) => node.type === 'bufferSource')).toHaveLength(0);
  });

  test('kích hoạt lần thứ hai phải tạo nguồn mới, không dùng lại nguồn cũ', () => {
    // AudioBufferSourceNode chỉ phát được một lần. Gọi start() lần hai trên
    // cùng một nguồn sẽ ném InvalidStateError trong trình duyệt thật — nghĩa là
    // tiếng rao chỉ vang đúng một lần rồi im (FR-15).
    engine.addLayer(keynote({ id: 'street-cry', schaferRole: 'signal' }));
    engine.triggerOnce('street-cry');
    engine.triggerOnce('street-cry');

    const sources = context.created.filter((node) => node.type === 'bufferSource');
    expect(sources).toHaveLength(2);
    for (const source of sources) expect(source.startCalls).toHaveLength(1);
  });

  test('nguồn phát một lần vẫn đi qua gain và panner của lớp đó', () => {
    engine.addLayer(keynote({ id: 'street-cry', schaferRole: 'signal', krauseClass: 'biophony' }));
    engine.triggerOnce('street-cry');

    const source = context.created.find((node) => node.type === 'bufferSource');
    expect(pathExists(source, engine.buses.biophony)).toBe(true);
  });

  test('thanh trượt lớp âm đi qua ánh xạ theo thang dB', () => {
    engine.addLayer(keynote());
    engine.setLayerSlider('traffic-bed', 0.9);

    expect(engine.layerGain('traffic-bed')).toBeCloseTo(sliderToGain(0.9), 6);
  });

  test('đổi âm lượng luôn làm mượt, không gán trực tiếp — chống tiếng rè bậc thang', () => {
    engine.addLayer(keynote());
    engine.setLayerSlider('traffic-bed', 0.5);

    const gainNode = context.created.find(
      (node) => node.type === 'gain' && node.gain.targetCalls.length > 0,
    );
    expect(gainNode).toBeDefined();
    expect(gainNode.gain.targetCalls.at(-1).timeConstant).toBeGreaterThan(0);
  });

  test('kéo thanh trượt bus về 0 làm im cả nhóm', () => {
    engine.addLayer(keynote({ id: 'wind', krauseClass: 'geophony' }));
    engine.setBusSlider('geophony', 0);

    expect(engine.buses.geophony.gain.value).toBe(0);
  });

  test('từ chối lớp âm không thuộc nhóm nguồn phát nào', () => {
    expect(() => engine.addLayer(keynote({ krauseClass: 'techno-phony' }))).toThrow(
      /nhóm nguồn phát/i,
    );
  });

  test('từ chối hai lớp âm cùng mã', () => {
    engine.addLayer(keynote());
    expect(() => engine.addLayer(keynote())).toThrow(/đã tồn tại/i);
  });

  test('bắt đầu phát thì mọi lớp lặp đều được kích hoạt', () => {
    engine.addLayer(keynote({ id: 'a' }));
    engine.addLayer(keynote({ id: 'b', krauseClass: 'geophony' }));
    engine.start();

    const sources = context.created.filter((node) => node.type === 'bufferSource');
    expect(sources).toHaveLength(2);
    for (const source of sources) expect(source.startCalls).toHaveLength(1);
  });

  test('dispose ngắt kết nối để giải phóng bộ nhớ khi rời địa điểm', () => {
    engine.addLayer(keynote());
    engine.start();
    engine.dispose();

    for (const bus of Object.values(engine.buses)) expect(bus.disconnected).toBe(true);
    const source = context.created.find((node) => node.type === 'bufferSource');
    expect(source.stopCalls).toHaveLength(1);
  });

  test('nối bộ vang khi có bộ đệm phản hồi của không gian', () => {
    const reverb = fakeBuffer({ duration: 2 });
    const withReverb = createSoundscapeEngine(new FakeAudioContext(), { reverbBuffer: reverb });
    const convolver = withReverb.nodes.convolver;

    expect(convolver).toBeDefined();
    expect(convolver.buffer).toBe(reverb);
  });

  test('có ĐƯỜNG KHÔ song song với đường vang', () => {
    // Nối hết bus vào convolver rồi chỉ convolver ra master là **100% ướt**:
    // không còn tí âm trực tiếp nào, nghe như đứng ngoài phòng vọng vào. Đó
    // không phải "bước vào không gian" — nó là mất luôn nguồn âm.
    const context = new FakeAudioContext();
    const withReverb = createSoundscapeEngine(context, { reverbBuffer: fakeBuffer({ duration: 2 }) });
    const { convolver, master } = withReverb.nodes;

    for (const bus of Object.values(withReverb.buses)) {
      // Đường ướt: có đi qua bộ vang.
      expect(pathExists(bus, convolver)).toBe(true);
      // Đường khô: tới được master mà KHÔNG đi qua bộ vang.
      const dryOnly = bus.outputs.filter((node) => !pathExists(node, convolver));
      expect(dryOnly.some((node) => pathExists(node, master))).toBe(true);
    }
  });

  test('tỉ lệ ướt là VỊ TRÍ điều khiển, gain suy ra — hai đầu mút phải đúng', () => {
    // `reverbMix` là vị trí trên một dải 0…1 giống thanh dịch trái phải, không
    // phải hệ số gain. Kiểm hai đầu mút và tính đơn điệu, chứ không kiểm gain
    // bằng đúng số vị trí — làm thế là chép lại công thức vào test.
    const build = (reverbMix) =>
      createSoundscapeEngine(new FakeAudioContext(), {
        reverbBuffer: fakeBuffer({ duration: 2 }),
        reverbMix,
      }).nodes;

    const fullyDry = build(0);
    expect(fullyDry.wet.gain.value).toBeCloseTo(0, 12);
    expect(fullyDry.dry.gain.value).toBeCloseTo(1, 12);

    const fullyWet = build(1);
    expect(fullyWet.wet.gain.value).toBeCloseTo(1, 12);
    expect(fullyWet.dry.gain.value).toBeCloseTo(0, 12);

    let previous = -1;
    for (const mix of [0, 0.25, 0.5, 0.75, 1]) {
      const wet = build(mix).wet.gain.value;
      expect(wet).toBeGreaterThan(previous);
      previous = wet;
    }
  });

  test('mặc định nghiêng hẳn về khô — nhận ra nguồn âm là việc người tham gia phải làm', () => {
    const nodes = createSoundscapeEngine(new FakeAudioContext(), {
      reverbBuffer: fakeBuffer({ duration: 2 }),
    }).nodes;
    expect(nodes.dry.gain.value).toBeGreaterThan(nodes.wet.gain.value);
    expect(nodes.wet.gain.value).toBeGreaterThan(0);
  });

  test('tổng khô + ướt giữ nguyên công suất, không để bật vang là to hẳn lên', () => {
    // Cộng thẳng khô 1 + ướt 0,25 là bật vang lên thì to hơn — mà độ to chính là
    // yếu tố gây nhiễu FR-57. Giữ tổng công suất bằng luật đẳng công suất.
    for (const reverbMix of [0, 0.25, 0.5, 1]) {
      const engine = createSoundscapeEngine(new FakeAudioContext(), {
        reverbBuffer: fakeBuffer({ duration: 2 }),
        reverbMix,
      });
      const dry = engine.nodes.dry.gain.value;
      const wet = engine.nodes.wet.gain.value;
      expect(dry * dry + wet * wet).toBeCloseTo(1, 10);
    }
  });

  test('tỉ lệ ướt ngoài [0, 1] thì chặn', () => {
    for (const reverbMix of [-0.1, 1.5, Number.NaN, 'nhiều']) {
      expect(() =>
        createSoundscapeEngine(new FakeAudioContext(), {
          reverbBuffer: fakeBuffer({ duration: 2 }),
          reverbMix,
        }),
      ).toThrow();
    }
  });

  test('không có bộ vang thì không dựng nút khô/ướt thừa', () => {
    expect(engine.nodes.wet).toBeUndefined();
    expect(engine.nodes.dry).toBeUndefined();
  });

  test('dispose ngắt cả nhánh vang, không sót nút nào', () => {
    // Sót một nút là còn tham chiếu tới bộ đệm phản hồi xung — mà IR đo thật dài
    // vài giây stereo, tức vài MB không giải phóng được (NFR-04).
    const withReverb = createSoundscapeEngine(new FakeAudioContext(), {
      reverbBuffer: fakeBuffer({ duration: 2 }),
    });
    withReverb.dispose();
    for (const name of ['convolver', 'wet', 'dry', 'master']) {
      expect(withReverb.nodes[name].disconnected).toBe(true);
    }
  });

  test('không dựng bộ vang khi không có bộ đệm — tiết kiệm CPU trên điện thoại', () => {
    expect(engine.nodes.convolver).toBeUndefined();
  });
});
