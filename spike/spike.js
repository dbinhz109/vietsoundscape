/**
 * Spike M0 — chỉ để trả lời hai câu của cổng G0:
 *   1. Lớp âm nền có lặp liền mạch được không?
 *   2. Điện thoại tầm trung có tải nổi 5 lớp đồng thời không?
 *
 * Cố tình KHÔNG làm giao diện. Mọi thứ ở đây là dụng cụ đo, không phải sản phẩm.
 * Trang này phơi ra `window.spike` để kịch bản tự động cũng đọc được số đo.
 */

import { createSoundscapeEngine } from '../src/audio/engine.js';
import { scheduleTriggers } from '../src/audio/trigger.js';
import { findLoopPoints, measureLoopQuality } from '../src/audio/loop.js';

const BEDS = [
  { id: 'traffic', file: 'bed-traffic.wav', krauseClass: 'anthrophony', pan: 0 },
  { id: 'water', file: 'bed-water.wav', krauseClass: 'geophony', pan: -0.3 },
  { id: 'cicada', file: 'bed-cicada.wav', krauseClass: 'biophony', pan: 0.35 },
  { id: 'wind', file: 'bed-wind.wav', krauseClass: 'geophony', pan: 0.15 },
  { id: 'market', file: 'bed-market.wav', krauseClass: 'anthrophony', pan: -0.15 },
  { id: 'temple', file: 'bed-temple.wav', krauseClass: 'anthrophony', pan: 0.05 },
];

const SIGNALS = [
  { id: 'bell', file: 'signal-bell.wav', krauseClass: 'anthrophony', meanIntervalS: 17, jitterS: 6 },
  { id: 'cry', file: 'signal-cry.wav', krauseClass: 'anthrophony', meanIntervalS: 24, jitterS: 8 },
];

const MARK = { id: 'gong', file: 'mark-gong.wav', krauseClass: 'anthrophony' };
const BAD_BED = { id: 'traffic', file: 'bed-traffic-BAD-LOOP.wav', krauseClass: 'anthrophony' };

const BYTES_PER_SAMPLE = 4; // Float32 — cách trình duyệt giữ bộ đệm đã giải nén
const SEED = 20260805;

const state = {
  context: null,
  engine: null,
  buffers: new Map(),
  activeLayers: [],
  startedAt: null,
  frames: { count: 0, lastReport: 0, fps: 0, worstFrameMs: 0 },
};

const el = (id) => document.getElementById(id);
const log = (message) => {
  const box = el('log');
  box.textContent = `${new Date().toLocaleTimeString('vi-VN')}  ${message}\n${box.textContent}`;
};

async function loadBuffer(file) {
  if (state.buffers.has(file)) return state.buffers.get(file);
  const response = await fetch(`audio/${file}`);
  if (!response.ok) throw new Error(`Không tải được audio/${file} (${response.status})`);
  const bytes = await response.arrayBuffer();
  const buffer = await state.context.decodeAudioData(bytes);
  state.buffers.set(file, buffer);
  return buffer;
}

/** Bộ nhớ thật mà các bộ đệm đã giải nén đang chiếm — con số NFR-04 nói tới. */
function decodedBytes() {
  let total = 0;
  for (const buffer of state.buffers.values()) {
    total += buffer.length * buffer.numberOfChannels * BYTES_PER_SAMPLE;
  }
  return total;
}

function teardown() {
  if (state.engine) state.engine.dispose();
  state.engine = null;
  state.activeLayers = [];
  state.startedAt = null;
}

/**
 * @param {object} options
 * @param {number} options.bedCount số lớp âm nền cần bật
 * @param {boolean} [options.useBadBed] dùng bản đối chứng có khe hở
 * @param {number} [options.loopWindowS] cắt loop ngắn để chỗ nối lặp lại thường xuyên
 * @param {boolean} [options.naiveLoop] loop cả tệp, bỏ qua việc tìm điểm cắt không
 * @param {boolean} [options.withReverb]
 */
async function play({
  bedCount,
  useBadBed = false,
  loopWindowS = 0,
  naiveLoop = false,
  withReverb = false,
}) {
  if (!state.context) {
    // Phải khởi tạo trong một hành động của người dùng, nếu không trình duyệt chặn.
    state.context = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (state.context.state === 'suspended') await state.context.resume();

  teardown();

  const beds = useBadBed ? [BAD_BED] : BEDS.slice(0, bedCount);
  const files = [...beds, ...SIGNALS, MARK].map((layer) => layer.file);
  await Promise.all(files.map(loadBuffer));

  let reverbBuffer;
  if (withReverb) reverbBuffer = makeImpulseResponse(state.context, 1.8, 3.2);

  state.engine = createSoundscapeEngine(state.context, { reverbBuffer, masterSlider: 0.85 });

  const seams = [];
  for (const bed of beds) {
    const buffer = state.buffers.get(bed.file);
    const samples = buffer.getChannelData(0);

    // Loop "thô" = cách làm mặc định khi chỉ đặt source.loop = true. Giữ lại để
    // đối chứng, vì đây đúng là cái sẽ xảy ra nếu bỏ qua bước tìm điểm loop.
    const detected = naiveLoop
      ? null
      : findLoopPoints(samples, buffer.sampleRate, {
          maxDurationS: loopWindowS > 0 ? loopWindowS : undefined,
        });
    const loopStartS = detected ? detected.startS : 0;
    const loopEndS = detected ? detected.endS : buffer.duration;

    state.engine.addLayer({
      id: bed.id,
      krauseClass: bed.krauseClass,
      schaferRole: 'keynote',
      buffer,
      pan: bed.pan ?? 0,
      slider: 0.7,
      loopStartS,
      loopEndS,
    });
    state.activeLayers.push({ id: bed.id, kind: 'keynote', krauseClass: bed.krauseClass });
    seams.push({
      id: bed.id,
      file: bed.file,
      mode: naiveLoop ? 'loop thô cả tệp' : 'điểm cắt không đã tính',
      loopStartS,
      loopEndS,
      ...measureLoopQuality(samples, buffer.sampleRate, { startS: loopStartS, endS: loopEndS }),
    });
  }

  for (const signal of SIGNALS) {
    state.engine.addLayer({
      id: signal.id,
      krauseClass: signal.krauseClass,
      schaferRole: 'signal',
      buffer: state.buffers.get(signal.file),
      slider: 0.6,
    });
    state.activeLayers.push({ id: signal.id, kind: 'signal', krauseClass: signal.krauseClass });
  }

  state.engine.addLayer({
    id: MARK.id,
    krauseClass: MARK.krauseClass,
    schaferRole: 'soundmark',
    buffer: state.buffers.get(MARK.file),
    slider: 0.8,
  });
  state.activeLayers.push({ id: MARK.id, kind: 'soundmark', krauseClass: MARK.krauseClass });

  state.engine.start();
  state.startedAt = performance.now();
  scheduleSignals();
  renderLayerControls();

  for (const seam of seams) {
    log(
      `${seam.id} [${seam.mode}] loop ${seam.loopStartS.toFixed(4)}→${seam.loopEndS.toFixed(4)}s | ` +
        `bước nhảy ${seam.seamJump.toExponential(2)} | im lặng cuối ${seam.tailSilenceMs.toFixed(1)}ms | ` +
        `${seam.seamless ? 'LIỀN MẠCH' : 'KHÔNG ĐẠT'}`,
    );
  }
  log(`Đang phát ${state.activeLayers.length} lớp, RAM âm thanh ${(decodedBytes() / 1e6).toFixed(1)} MB`);
  return { seams, layers: state.activeLayers.length, decodedBytes: decodedBytes() };
}

/** Phản hồi xung tổng hợp — chỉ để thử chi phí CPU của bộ vang, không phải IR thật. */
function makeImpulseResponse(context, durationS, decay) {
  const length = Math.round(context.sampleRate * durationS);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay;
    }
  }
  return buffer;
}

/** Lên lịch tín hiệu âm cho 60 giây tới, dùng RNG có seed (FR-15). */
function scheduleSignals() {
  const horizonS = 60;
  for (const signal of SIGNALS) {
    const times = scheduleTriggers({
      seed: SEED,
      meanIntervalS: signal.meanIntervalS,
      jitterS: signal.jitterS,
      durationS: horizonS,
    });
    for (const time of times) {
      state.engine.triggerOnce(signal.id, state.context.currentTime + time);
    }
    log(`${signal.id}: lên lịch ${times.length} lần trong ${horizonS}s (seed ${SEED})`);
  }
}

function renderLayerControls() {
  const box = el('layers');
  box.replaceChildren();
  for (const layer of state.activeLayers) {
    const row = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = `${layer.id} (${layer.kind}, ${layer.krauseClass}) `;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.01';
    slider.value = layer.kind === 'keynote' ? '0.7' : '0.6';
    slider.addEventListener('input', () => {
      state.engine.setLayerSlider(layer.id, Number(slider.value));
    });
    row.append(label, slider);
    if (layer.kind !== 'keynote') {
      const button = document.createElement('button');
      button.textContent = 'phát';
      button.addEventListener('click', () => state.engine.triggerOnce(layer.id));
      row.append(' ', button);
    }
    box.append(row);
  }
}

function tickMetrics(now) {
  const frames = state.frames;
  if (frames.lastReport === 0) frames.lastReport = now;
  const delta = now - frames.lastFrame;
  if (frames.lastFrame && delta > frames.worstFrameMs) frames.worstFrameMs = delta;
  frames.lastFrame = now;
  frames.count += 1;

  if (now - frames.lastReport >= 1000) {
    frames.fps = Math.round((frames.count * 1000) / (now - frames.lastReport));
    frames.count = 0;
    frames.lastReport = now;
  }

  const elapsedS = state.startedAt ? (now - state.startedAt) / 1000 : 0;
  el('metrics').textContent = [
    `lớp đang phát       ${state.activeLayers.length}`,
    `RAM âm thanh        ${(decodedBytes() / 1e6).toFixed(1)} MB   (ngưỡng NFR-04: 150 MB)`,
    `tần số lấy mẫu      ${state.context ? state.context.sampleRate : '—'} Hz`,
    `độ trễ nền          ${state.context ? (state.context.baseLatency * 1000).toFixed(1) : '—'} ms`,
    `trạng thái ngữ cảnh ${state.context ? state.context.state : '—'}`,
    `khung hình / giây   ${frames.fps}`,
    `khung chậm nhất     ${frames.worstFrameMs.toFixed(1)} ms`,
    `đã phát             ${Math.floor(elapsedS / 60)}p ${String(Math.floor(elapsedS % 60)).padStart(2, '0')}s   (FR-14 cần nghe 5 phút)`,
  ].join('\n');

  requestAnimationFrame(tickMetrics);
}
requestAnimationFrame(tickMetrics);

el('play5').addEventListener('click', () => play({ bedCount: 5 }));
el('play6reverb').addEventListener('click', () => play({ bedCount: 6, withReverb: true }));
el('loopGood').addEventListener('click', () => play({ bedCount: 1, loopWindowS: 2 }));
el('loopBad').addEventListener('click', () =>
  play({ bedCount: 1, useBadBed: true, naiveLoop: true }),
);
el('loopFixed').addEventListener('click', () => play({ bedCount: 1, useBadBed: true }));
el('stop').addEventListener('click', () => {
  teardown();
  el('layers').replaceChildren();
  log('đã dừng và ngắt kết nối');
});

for (const krauseClass of ['geophony', 'biophony', 'anthrophony']) {
  el(`bus-${krauseClass}`).addEventListener('input', (event) => {
    if (state.engine) state.engine.setBusSlider(krauseClass, Number(event.target.value));
  });
}

// Cửa cho kịch bản đo tự động.
window.spike = { play, teardown, decodedBytes, state, findLoopPoints, measureLoopQuality };
log('sẵn sàng — bấm một nút để khởi tạo AudioContext (trình duyệt chặn tự phát)');
