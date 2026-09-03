/**
 * Bộ máy trộn soundscape trên Web Audio API.
 *
 * Cấu trúc đồ thị bám đúng hai khung phân loại khoa học của đề tài:
 *   - Krause (geophony / biophony / anthrophony) → ba bus âm lượng.
 *   - Schafer (keynote / signal / soundmark)     → hành vi phát của từng lớp.
 *
 *                                          ┌─► gain khô ──────────────┐
 * Nguồn ─► gain lớp ─► panner ─► bus Krause ┤                          ├─► master ─► đầu ra
 *                                          └─► bộ vang ─► gain ướt ───┘
 *
 * Module này KHÔNG phụ thuộc khung giao diện nào. Đó là điều kiện để sau này
 * bọc thành PWA hoặc Capacitor mà không phải viết lại (xem lộ trình §8).
 */

import { DEFAULT_REVERB_MIX, reverbMixGains, sliderToGain } from './gain.js';
import { KRAUSE_CLASSES, LOOPING_ROLES } from '../domain/taxonomy.js';

export { KRAUSE_CLASSES, LOOPING_ROLES };

/** Hằng số thời gian làm mượt khi đổi âm lượng, giây (NFR-32). */
const SMOOTHING_S = 0.02;

/**
 * @param {BaseAudioContext} context
 * @param {object} [options]
 * @param {AudioBuffer} [options.reverbBuffer] phản hồi xung của không gian
 * @param {number} [options.masterSlider] vị trí thanh trượt tổng ban đầu
 * @param {number} [options.reverbMix] 0 (khô hẳn) … 1 (ướt hẳn); xem `gain.js`
 */
export function createSoundscapeEngine(context, options = {}) {
  const { reverbBuffer, masterSlider = 1, reverbMix = DEFAULT_REVERB_MIX } = options;

  const nodes = {};
  const master = context.createGain();
  master.gain.value = sliderToGain(masterSlider);
  master.connect(context.destination);
  nodes.master = master;

  // Hai đường song song, không phải một. Nối hết bus vào bộ vang rồi chỉ bộ vang
  // ra master là **100% ướt**: mất sạch âm trực tiếp, nghe như đứng ngoài phòng
  // vọng vào. "Bước vào một không gian" cần cả âm trực tiếp lẫn âm phản xạ.
  /** @type {AudioNode[]} chỗ mỗi bus Krause đổ vào */
  const busTargets = [master];
  if (reverbBuffer) {
    const { dryGain, wetGain } = reverbMixGains(reverbMix);

    const convolver = context.createConvolver();
    convolver.buffer = reverbBuffer;

    const wet = context.createGain();
    wet.gain.value = wetGain;
    convolver.connect(wet);
    wet.connect(master);

    const dry = context.createGain();
    dry.gain.value = dryGain;
    dry.connect(master);

    nodes.convolver = convolver;
    nodes.wet = wet;
    nodes.dry = dry;
    busTargets.length = 0;
    busTargets.push(dry, convolver);
  }

  const buses = {};
  for (const krauseClass of KRAUSE_CLASSES) {
    const bus = context.createGain();
    for (const target of busTargets) bus.connect(target);
    buses[krauseClass] = bus;
  }

  /** @type {Map<string, {gain: GainNode, panner: StereoPannerNode, buffer: AudioBuffer, looping: boolean, loopStartS?: number, loopEndS?: number, source?: AudioBufferSourceNode}>} */
  const layers = new Map();
  /** Nguồn phát một lần đang sống — giữ để dừng được khi dispose. */
  const transientSources = new Set();
  let started = false;

  function rampTo(param, value) {
    param.setTargetAtTime(value, context.currentTime, SMOOTHING_S);
  }

  function addLayer(layer) {
    const { id, krauseClass, schaferRole, buffer, pan = 0, slider = 1, loopStartS, loopEndS } = layer;

    if (!KRAUSE_CLASSES.includes(krauseClass)) {
      throw new Error(
        `Lớp âm "${id}" có nhóm nguồn phát không hợp lệ: "${krauseClass}". ` +
          `Phải là một trong ${KRAUSE_CLASSES.join(', ')}.`,
      );
    }
    if (layers.has(id)) {
      throw new Error(`Lớp âm "${id}" đã tồn tại trong bản trộn.`);
    }

    const looping = LOOPING_ROLES.includes(schaferRole);

    const gain = context.createGain();
    gain.gain.value = sliderToGain(slider);

    const panner = context.createStereoPanner();
    panner.pan.value = pan;

    gain.connect(panner);
    panner.connect(buses[krauseClass]);

    const record = { gain, panner, buffer, looping, loopStartS, loopEndS };

    // Lớp âm nền cần một nguồn sống suốt phiên. Lớp phát một lần thì KHÔNG tạo
    // nguồn ở đây: AudioBufferSourceNode chỉ phát được một lần, nên mỗi lần
    // kích hoạt phải là một nguồn mới (xem triggerOnce).
    if (looping) {
      record.source = createLoopingSource(record);
      if (started) record.source.start(0, loopStartS ?? 0);
    }

    layers.set(id, record);
    return id;
  }

  function createLoopingSource({ buffer, gain, loopStartS, loopEndS }) {
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    if (loopStartS !== undefined && loopEndS !== undefined) {
      source.loopStart = loopStartS;
      source.loopEnd = loopEndS;
    }
    source.connect(gain);
    return source;
  }

  function requireLayer(id) {
    const layer = layers.get(id);
    if (!layer) throw new Error(`Không có lớp âm nào mang mã "${id}".`);
    return layer;
  }

  return {
    buses,
    nodes,

    addLayer,

    /** Vị trí thanh trượt của một lớp âm, 0 đến 1. */
    setLayerSlider(id, position) {
      rampTo(requireLayer(id).gain.gain, sliderToGain(position));
    },

    /** Biên độ hiện tại của một lớp âm — dùng để kiểm tra và hiển thị. */
    layerGain(id) {
      return requireLayer(id).gain.gain.value;
    },

    /** Vị trí thanh trượt của cả một nhóm nguồn phát. */
    setBusSlider(krauseClass, position) {
      const bus = buses[krauseClass];
      if (!bus) throw new Error(`Không có bus nào mang tên "${krauseClass}".`);
      rampTo(bus.gain, sliderToGain(position));
    },

    /** Vị trí thanh trượt tổng. */
    setMasterSlider(position) {
      rampTo(master.gain, sliderToGain(position));
    },

    /** Bắt đầu phát mọi lớp lặp. Phải gọi trong một hành động của người dùng. */
    start() {
      started = true;
      for (const layer of layers.values()) {
        if (layer.looping) layer.source.start(0, layer.loopStartS ?? 0);
      }
    },

    /**
     * Phát một lần cho lớp tín hiệu âm hoặc dấu ấn âm thanh.
     *
     * Luôn tạo nguồn mới: một AudioBufferSourceNode đã start() thì không dùng
     * lại được, gọi lần hai sẽ ném InvalidStateError.
     *
     * @param {string} id
     * @param {number} [when] thời điểm phát theo đồng hồ của AudioContext
     */
    triggerOnce(id, when = 0) {
      const layer = requireLayer(id);
      const source = context.createBufferSource();
      source.buffer = layer.buffer;
      source.loop = false;
      source.connect(layer.gain);
      source.onended = () => {
        source.disconnect();
        transientSources.delete(source);
      };
      transientSources.add(source);
      source.start(when);
      return source;
    },

    /** Ngắt toàn bộ đồ thị và dừng nguồn để giải phóng bộ nhớ (NFR-04). */
    dispose() {
      for (const source of transientSources) {
        source.stop(0);
        source.disconnect();
      }
      transientSources.clear();

      for (const layer of layers.values()) {
        if (layer.source) {
          layer.source.stop(0);
          layer.source.disconnect();
        }
        layer.gain.disconnect();
        layer.panner.disconnect();
      }
      layers.clear();
      for (const bus of Object.values(buses)) bus.disconnect();
      // Sót một nút của nhánh vang là còn giữ tham chiếu tới bộ đệm phản hồi
      // xung — IR đo thật dài vài giây stereo, tức vài MB không giải phóng được.
      for (const name of ['convolver', 'wet', 'dry']) nodes[name]?.disconnect();
      master.disconnect();
      started = false;
    },
  };
}
