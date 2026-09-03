// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createListeningRoom } from './listening-room.js';
import { FakeAudioContext } from '../../../test/fake-audio-context.js';

const SAMPLE_RATE = 48000;

/** Bộ đệm giả có dữ liệu thật đủ để hàm tìm điểm loop chạy được. */
function decodedBuffer(durationS = 4) {
  const length = Math.round(durationS * SAMPLE_RATE);
  const data = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    data[i] = 0.6 * Math.sin((2 * Math.PI * 220 * i) / SAMPLE_RATE);
  }
  return {
    duration: durationS,
    sampleRate: SAMPLE_RATE,
    length,
    numberOfChannels: 1,
    getChannelData: () => data,
  };
}

const CLIPS = {
  'A-01': { id: 'A-01', title_vi: 'Nền A', krause_class: 'geophony', schafer_role: 'keynote' },
  'A-02': { id: 'A-02', title_vi: 'Tín hiệu A', krause_class: 'anthrophony', schafer_role: 'signal' },
  'A-03': {
    id: 'A-03',
    title_vi: 'Dấu ấn A',
    krause_class: 'anthrophony',
    schafer_role: 'soundmark',
    endangerment_level: 'lost',
  },
  'B-01': { id: 'B-01', title_vi: 'Nền B', krause_class: 'biophony', schafer_role: 'keynote' },
};

const recipeA = {
  id: 'a-mix',
  location_id: 'a',
  title_vi: 'Bản trộn A',
  seed: 7,
  layers: [
    { clip_id: 'A-01', slider: 0.7, placeholder_audio: '/audio/a1.wav' },
    { clip_id: 'A-02', slider: 0.6, placeholder_audio: '/audio/a2.wav', trigger: { mean_interval_s: 10, jitter_s: 2 } },
    { clip_id: 'A-03', slider: 0.8, placeholder_audio: '/audio/a3.wav' },
  ],
};

const recipeB = {
  id: 'b-mix',
  location_id: 'b',
  title_vi: 'Bản trộn B',
  layers: [{ clip_id: 'B-01', slider: 0.5, placeholder_audio: '/audio/b1.wav' }],
};

let context;
let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.replaceChildren(container);

  context = new FakeAudioContext({ sampleRate: SAMPLE_RATE });
  context.decodeAudioData = vi.fn(async () => decodedBuffer());
  vi.stubGlobal('AudioContext', vi.fn(() => context));
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const open = (room, recipe) =>
  room.open({ recipe, location: { name_vi: 'X' }, clipsById: CLIPS });

describe('createListeningRoom', () => {
  test('mở bản trộn thì dựng đủ số lớp âm', async () => {
    // Hợp đồng mới của `open()`: trả về khi **đã có tiếng** (lớp nền xong), còn
    // `ready` mới là lúc đủ lớp. Xem nhóm "phát dần" bên dưới.
    const room = createListeningRoom({ container });
    const result = await open(room, recipeA);
    expect(room.isOpen).toBe(true);
    expect(result.totalLayers).toBe(3);

    expect((await result.ready).layerCount).toBe(3);
  });

  test('tính điểm loop khi metadata của mẫu chưa có', async () => {
    // Đường ống xử lý và trình duyệt phải cho ra cùng điểm loop, nên phòng nghe
    // gọi đúng hàm mà đường ống dùng thay vì đoán.
    const room = createListeningRoom({ container });
    await open(room, recipeA);

    const looping = context.created.find((node) => node.type === 'bufferSource' && node.loop);
    expect(looping.loopStart).toBeGreaterThan(0);
    expect(looping.loopEnd).toBeGreaterThan(looping.loopStart);
  });

  test('dùng điểm loop trong metadata khi đã có', async () => {
    const withPoints = {
      ...CLIPS,
      'A-01': { ...CLIPS['A-01'], loop_start_s: 1.25, loop_end_s: 3.5 },
    };
    const room = createListeningRoom({ container });
    await room.open({ recipe: recipeA, location: {}, clipsById: withPoints });

    const looping = context.created.find((node) => node.type === 'bufferSource' && node.loop);
    expect(looping.loopStart).toBeCloseTo(1.25, 6);
    expect(looping.loopEnd).toBeCloseTo(3.5, 6);
  });

  test('chỉ lên lịch phát cho lớp tín hiệu âm', async () => {
    const room = createListeningRoom({ container });
    await (await open(room, recipeA)).ready;

    // Nguồn phát một lần chỉ sinh ra khi được kích hoạt. Lớp tín hiệu được lên
    // lịch nhiều lần, lớp dấu ấn thì không tự phát.
    const oneShots = context.created.filter((node) => node.type === 'bufferSource' && !node.loop);
    expect(oneShots.length).toBeGreaterThan(1);
  });

  test('bỏ bộ đệm không còn dùng khi đổi bản trộn — chống cộng dồn bộ nhớ', async () => {
    // Không dọn thì 4 địa điểm × 6 nền sẽ vượt ngưỡng 150 MB của NFR-04.
    const room = createListeningRoom({ container });
    // Chờ A tải ĐỦ, không chỉ chờ có tiếng — nếu không thì A mới có 1 bộ đệm và
    // phép so sánh chẳng chứng minh được gì.
    await (await open(room, recipeA)).ready;
    const afterA = room.audioBytes();

    const b = await open(room, recipeB);
    await b.ready;
    const afterB = room.audioBytes();

    expect(afterA).toBeGreaterThan(0);
    // B chỉ có 1 lớp, A có 3 ⇒ nếu còn giữ bộ đệm của A thì con số phải lớn hơn.
    expect(afterB).toBeLessThan(afterA);
  });

  test('đóng phòng nghe thì giải phóng hết bộ đệm', async () => {
    const room = createListeningRoom({ container });
    await open(room, recipeA);
    room.close();

    expect(room.audioBytes()).toBe(0);
    expect(room.isOpen).toBe(false);
  });

  test('gọi lại hàm thông báo khi người dùng kéo thanh trượt lớp âm', async () => {
    const onMixChange = vi.fn();
    const room = createListeningRoom({ container, onMixChange });
    await open(room, recipeA);

    const slider = container.querySelector('#layer-A-01');
    slider.value = '0.3';
    slider.dispatchEvent(new Event('input', { bubbles: true }));

    expect(onMixChange).toHaveBeenCalledWith(expect.objectContaining({ 'A-01': 0.3 }));
  });

  test('vị trí thanh trượt từ URL thắng giá trị mặc định của bản trộn', async () => {
    const room = createListeningRoom({ container });
    await room.open({
      recipe: recipeA,
      location: {},
      clipsById: CLIPS,
      sliderOverrides: { 'A-01': 0.15 },
    });

    expect(container.querySelector('#layer-A-01').value).toBe('0.15');
  });

  test('gắn nhãn cho lớp âm đã không còn tồn tại', async () => {
    // Tiếng tàu điện Hà Nội: giữ trong hệ thống nhưng phải nói rõ nó đã mất.
    const room = createListeningRoom({ container });
    // Nhãn nằm trên lớp dấu ấn — lớp phụ, nên chỉ hiện sau khi tải xong.
    await (await open(room, recipeA)).ready;

    expect(container.querySelector('.badge-lost')).not.toBeNull();
  });

  test('không dựng thanh trượt nhóm cho nhóm nguồn phát không có lớp nào', async () => {
    const room = createListeningRoom({ container });
    await open(room, recipeB); // chỉ có biophony

    expect(container.querySelector('#bus-biophony')).not.toBeNull();
    expect(container.querySelector('#bus-geophony')).toBeNull();
  });

  test('báo lỗi rõ ràng khi không tải được tệp âm', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const room = createListeningRoom({ container });

    await expect(open(room, recipeA)).rejects.toThrow(/404/);
  });
});

describe('tải song song — FR/NFR "tiếng đầu tiên ≤ 5 s trên 4G"', () => {
  /** Mạng giả: mỗi tệp mất đúng `delayMs`, và ghi lại lúc bắt đầu / kết thúc. */
  const slowNetwork = (delayMs) => {
    const log = [];
    let now = 0;
    const clock = () => now;
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      const started = clock();
      log.push({ url, event: 'start', at: started });
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      log.push({ url, event: 'end', at: clock() });
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    }));
    return { log, tick: (ms) => { now += ms; } };
  };

  test('các lớp NỀN tải song song với nhau', async () => {
    // Tuần tự thì thời gian có tiếng = TỔNG thời gian tải các nền; song song thì
    // = nền tải LÂU NHẤT.
    const { log } = slowNetwork(5);
    const twoBeds = {
      ...recipeA,
      layers: [
        { clip_id: 'A-01', slider: 0.7, placeholder_audio: '/audio/a1.wav' },
        { clip_id: 'B-01', slider: 0.5, placeholder_audio: '/audio/b1.wav' },
      ],
    };
    const room = createListeningRoom({ container });
    await open(room, twoBeds);

    const firstEnd = log.findIndex((entry) => entry.event === 'end');
    const startsBeforeFirstEnd = log.slice(0, firstEnd).filter((e) => e.event === 'start').length;
    expect(startsBeforeFirstEnd).toBe(2);
  });

  test('lớp phụ KHÔNG khởi động trước khi lớp nền tải xong', async () => {
    // Bài học từ phép đo trong trình duyệt: băng thông là nút cổ chai **dùng
    // chung**. Thả cả 5 tệp ra cùng lúc thì chúng chia nhau đường truyền, nền
    // xong gần như cùng lúc với mọi thứ khác, và "phát dần" chẳng lợi gì.
    // Nền phải được đi trước MỘT MÌNH thì thời gian có tiếng mới thật sự giảm.
    const { log } = slowNetwork(5);
    const room = createListeningRoom({ container });
    const result = await open(room, recipeA);

    const bedEnd = log.findIndex((e) => e.event === 'end' && e.url === '/audio/a1.wav');
    const earlyStarts = log.slice(0, bedEnd).filter((e) => e.event === 'start');
    expect(earlyStarts.map((e) => e.url)).toEqual(['/audio/a1.wav']);

    await result.ready;
    expect(fetch.mock.calls.map(([url]) => url).sort()).toEqual(
      ['/audio/a1.wav', '/audio/a2.wav', '/audio/a3.wav'],
    );
  });

  test('hai lớp dùng chung một tệp thì chỉ tải MỘT lần, kể cả khi chạy song song', async () => {
    // Tải song song mở ra lỗi mà tải tuần tự không có: hai lớp cùng URL cùng
    // khởi động một lúc, thấy bộ nhớ đệm còn trống nên cùng đi tải. Trên 4G đó
    // là trả tiền băng thông hai lần cho cùng một tệp.
    const shared = {
      id: 'shared-mix',
      location_id: 'a',
      title_vi: 'Dùng chung tệp',
      layers: [
        { clip_id: 'A-01', slider: 0.7, placeholder_audio: '/audio/same.wav' },
        { clip_id: 'B-01', slider: 0.5, placeholder_audio: '/audio/same.wav' },
      ],
    };
    const room = createListeningRoom({ container });
    await open(room, shared);

    const calls = fetch.mock.calls.filter(([url]) => url === '/audio/same.wav');
    expect(calls).toHaveLength(1);
  });

  test('nhiều tệp hỏng thì liệt kê HẾT, không dừng ở cái đầu tiên', async () => {
    // Báo từng cái một thì người sửa dữ liệu phải sửa – chạy lại – sửa tiếp,
    // mỗi vòng một tệp. Liệt kê hết để sửa một lượt.
    const twoBeds = {
      ...recipeA,
      layers: [
        { clip_id: 'A-01', slider: 0.7, placeholder_audio: '/audio/a1.wav' },
        { clip_id: 'B-01', slider: 0.5, placeholder_audio: '/audio/b1.wav' },
      ],
    };
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 404 })));
    const room = createListeningRoom({ container });
    const error = await open(room, twoBeds).catch((e) => e);
    expect(error.message).toMatch(/a1\.wav/);
    expect(error.message).toMatch(/b1\.wav/);
  });
});

describe('phát dần — "tải lười theo lớp" của B2.4', () => {
  /** Cho phép giữ từng tệp lại tới khi test thả ra. */
  const gatedNetwork = () => {
    const gates = new Map();
    vi.stubGlobal('fetch', vi.fn((url) => {
      let release;
      const promise = new Promise((resolve) => {
        release = () => resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
      });
      gates.set(url, release);
      return promise;
    }));
    return {
      release: (url) => gates.get(url)(),
      releaseAll: () => { for (const release of gates.values()) release(); },
      requested: () => [...gates.keys()],
    };
  };

  test('có TIẾNG khi lớp nền xong, không chờ lớp tín hiệu', async () => {
    // Băng thông là nút cổ chai dùng chung, nên tải song song KHÔNG rút ngắn
    // tổng thời gian tải — nó chỉ giấu độ trễ vòng. Thứ thật sự đưa "tiếng đầu
    // tiên" xuống dưới 5 giây là phát ngay khi lớp NỀN xong: một tệp thay vì năm.
    const net = gatedNetwork();
    const room = createListeningRoom({ container });
    const opening = open(room, recipeA);

    // Chỉ lớp nền được yêu cầu lúc đầu — lớp phụ chưa đụng tới đường truyền.
    await vi.waitFor(() => expect(net.requested()).toEqual(['/audio/a1.wav']));
    net.release('/audio/a1.wav');

    const result = await opening;
    expect(result.layerCount).toBe(1);
    expect(result.totalLayers).toBe(3);
    expect(room.isOpen).toBe(true);

    net.releaseAll();
    const full = await result.ready;
    expect(full.layerCount).toBe(3);
  });

  test('lớp đến sau vẫn được xếp lịch phát, không bị bỏ quên', async () => {
    const net = gatedNetwork();
    const room = createListeningRoom({ container });
    const opening = open(room, recipeA);
    await vi.waitFor(() => expect(net.requested()).toHaveLength(1));
    net.release('/audio/a1.wav');
    const result = await opening;

    await vi.waitFor(() => expect(net.requested()).toHaveLength(3));
    net.releaseAll();
    await result.ready;
    // A-02 là lớp tín hiệu có trigger — phải có nguồn phát một lần được hẹn giờ.
    expect(context.created.filter((n) => n.type === 'bufferSource').length).toBeGreaterThan(1);
  });

  test('lớp nền hỏng thì mở thất bại — không có nền thì không có gì để nghe', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url === '/audio/a1.wav') return { ok: false, status: 500 };
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    }));
    const room = createListeningRoom({ container });
    await expect(open(room, recipeA)).rejects.toThrow(/a1\.wav/);
  });

  test('lớp phụ hỏng thì NHẠC VẪN CHẠY, lỗi báo qua `ready`', async () => {
    // Mất một tiếng chuông thì phòng nghe vẫn dùng được. Đánh sập cả phiên vì
    // một tệp phụ là phản ứng quá tay.
    vi.stubGlobal('fetch', vi.fn(async (url) => {
      if (url === '/audio/a3.wav') return { ok: false, status: 404 };
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    }));
    const room = createListeningRoom({ container });
    const result = await open(room, recipeA);
    expect(room.isOpen).toBe(true);
    await expect(result.ready).rejects.toThrow(/a3\.wav/);
    expect(room.isOpen).toBe(true);
  });

  test('đóng phòng giữa lúc còn tải thì KHÔNG nhét lớp vào bộ máy đã huỷ', async () => {
    // Đây là cuộc đua thật mà tải song song mới sinh ra: người dùng bấm "dừng"
    // hoặc chọn địa điểm khác trong lúc lớp phụ còn đang bay.
    const net = gatedNetwork();
    const room = createListeningRoom({ container });
    const opening = open(room, recipeA);
    await vi.waitFor(() => expect(net.requested()).toHaveLength(1));
    net.release('/audio/a1.wav');
    const result = await opening;

    await vi.waitFor(() => expect(net.requested()).toHaveLength(3));
    room.close();
    net.releaseAll();
    await expect(result.ready).resolves.toMatchObject({ cancelled: true });
    expect(room.isOpen).toBe(false);
  });
});
