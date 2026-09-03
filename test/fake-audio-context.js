/**
 * AudioContext giả để kiểm thử bộ máy âm thanh ngoài trình duyệt (NFR-51).
 *
 * Chỉ ghi lại cấu trúc đồ thị và các lời gọi lên AudioParam — không tổng hợp
 * âm. Nhờ vậy kiểm được đúng những thứ đắt tiền khi làm sai: nối sai bus, gán
 * gain trực tiếp thay vì làm mượt, quên bật loop.
 */

class FakeParam {
  constructor(value) {
    this.value = value;
    this.targetCalls = [];
    this.rampCalls = [];
    this.directWrites = 0;
  }

  setTargetAtTime(target, startTime, timeConstant) {
    this.targetCalls.push({ target, startTime, timeConstant });
    this.value = target;
  }

  linearRampToValueAtTime(value, time) {
    this.rampCalls.push({ value, time });
    this.value = value;
  }

  setValueAtTime(value) {
    this.value = value;
  }

  cancelScheduledValues() {}
}

class FakeNode {
  constructor(type) {
    this.type = type;
    this.outputs = [];
    this.disconnected = false;
  }

  connect(destination) {
    this.outputs.push(destination);
    return destination;
  }

  disconnect() {
    this.disconnected = true;
    this.outputs = [];
  }
}

class FakeGainNode extends FakeNode {
  constructor() {
    super('gain');
    this.gain = new FakeParam(1);
  }
}

class FakeStereoPannerNode extends FakeNode {
  constructor() {
    super('panner');
    this.pan = new FakeParam(0);
  }
}

class FakeBufferSourceNode extends FakeNode {
  constructor() {
    super('bufferSource');
    this.buffer = null;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.startCalls = [];
    this.stopCalls = [];
  }

  start(when = 0, offset = 0) {
    this.startCalls.push({ when, offset });
  }

  stop(when = 0) {
    this.stopCalls.push({ when });
  }
}

class FakeConvolverNode extends FakeNode {
  constructor() {
    super('convolver');
    this.buffer = null;
  }
}

export class FakeAudioContext {
  constructor({ sampleRate = 48000 } = {}) {
    this.sampleRate = sampleRate;
    this.currentTime = 0;
    this.state = 'running';
    this.destination = new FakeNode('destination');
    this.created = [];
    this.resumeCalls = 0;
  }

  #track(node) {
    this.created.push(node);
    return node;
  }

  createGain() {
    return this.#track(new FakeGainNode());
  }

  createStereoPanner() {
    return this.#track(new FakeStereoPannerNode());
  }

  createBufferSource() {
    return this.#track(new FakeBufferSourceNode());
  }

  createConvolver() {
    return this.#track(new FakeConvolverNode());
  }

  async resume() {
    this.resumeCalls += 1;
    this.state = 'running';
  }
}

/** Có đường đi từ `from` tới `to` qua các lời gọi connect hay không. */
export function pathExists(from, to) {
  if (from === to) return true;
  return from.outputs.some((next) => pathExists(next, to));
}

/** Bộ đệm âm thanh giả, chỉ cần đủ thuộc tính cho bộ máy đọc. */
export function fakeBuffer({ duration = 30, sampleRate = 48000, numberOfChannels = 1 } = {}) {
  return { duration, sampleRate, numberOfChannels, length: duration * sampleRate };
}
