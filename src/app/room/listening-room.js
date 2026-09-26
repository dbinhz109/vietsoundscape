/**
 * Phòng nghe — nạp một bản trộn, dựng bộ máy âm thanh, hiện bộ điều khiển.
 *
 * Tầng này **chỉ nối dây**: mọi logic âm thanh nằm trong `src/audio/`, mọi luật
 * dữ liệu nằm trong `src/data/`. Nhờ vậy bộ máy âm thanh vẫn độc lập khung giao
 * diện và sau này bọc PWA/Capacitor không phải viết lại (NFR-50).
 */

import { createSoundscapeEngine } from '../../audio/engine.js';
import { assetUrl } from '../asset-url.js';
import { scheduleTriggers } from '../../audio/trigger.js';
import { findLoopPoints } from '../../audio/loop.js';
import { KRAUSE_CLASSES, LOOPING_ROLES } from '../../domain/taxonomy.js';
import { createLayerSlider } from '../ui/layer-slider.js';
import { createClipDetails, createMixLicenseNote } from '../ui/clip-details.js';
import { SCHAFER_LABEL } from '../../domain/labels.js';
import { createLayerStack } from '../ui/layer-stack.js';

const KRAUSE_LABEL = {
  geophony: 'Âm tự nhiên — gió, nước, mưa',
  biophony: 'Âm sinh vật — chim, ve, ếch',
  anthrophony: 'Âm do con người — chợ, giao thông, tôn giáo',
};

/** Tệp âm của một lớp: bản giữ chỗ nếu có, không thì bản thật. */
const urlOf = (layer) => assetUrl(layer.placeholder_audio ?? layer.audio);

const SIGNAL_HORIZON_S = 90;
const BYTES_PER_SAMPLE = 4;

/** Ngữ cảnh trích dẫn khi `main.js` chưa truyền — đủ để không sập, không bịa. */
const defaultCitationContext = () => ({
  datasetVersion: 'chưa có',
  siteUrl: `${globalThis.location?.origin ?? ''}/`,
  accessed: new Date().toISOString().slice(0, 10),
});

/**
 * @param {object} options
 * @param {HTMLElement} options.container
 * @param {(sliders: Record<string, number>) => void} [options.onMixChange]
 * @param {{ datasetVersion: string, siteUrl: string, accessed: string }} [options.citationContext]
 *   cho trích dẫn FR-27 trong thẻ chi tiết mỗi lớp
 */
export function createListeningRoom({
  container,
  onMixChange,
  citationContext,
  externalMaster = false,
  onMasterChange,
}) {
  const citation = citationContext ?? defaultCitationContext();
  let context = null;
  let engine = null;
  const buffers = new Map();
  let current = null;
  let masterValue = null;
  let busValues = {};
  let activePrepared = [];
  /** Phiên mở hiện tại — dùng để bỏ kết quả tải về muộn của phiên cũ. */
  let openSession = null;
  /** URL mà phiên hiện tại cần giữ trong bộ đệm. */
  let keepUrls = new Set();
  /** Hình xếp chồng dạng sóng của phiên hiện tại — vẽ lại khi kéo thanh trượt. */
  let layerStack = null;

  /**
   * Yêu cầu đang bay, khoá theo URL.
   *
   * Cần đúng vì tải song song: hai lớp dùng chung một tệp sẽ cùng khởi động một
   * lúc, cùng thấy bộ nhớ đệm còn trống, rồi cùng đi tải. Trên 4G đó là trả tiền
   * băng thông hai lần cho cùng một tệp. Tải tuần tự không có lỗi này — nên nó
   * ra đời cùng lúc với việc chuyển sang song song.
   *
   * @type {Map<string, Promise<AudioBuffer>>}
   */
  const inFlight = new Map();

  function decode(url) {
    if (buffers.has(url)) return Promise.resolve(buffers.get(url));
    if (inFlight.has(url)) return inFlight.get(url);

    const pending = (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Không tải được ${url} (${response.status})`);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (keepUrls.has(url)) buffers.set(url, buffer);
      return buffer;
    })().finally(() => inFlight.delete(url));

    inFlight.set(url, pending);
    return pending;
  }

  /**
   * Tải mọi lớp **song song**, giữ nguyên thứ tự khai.
   *
   * Tuần tự thì thời gian có tiếng đầu tiên = **tổng** thời gian tải; song song
   * thì = thời gian tải **lâu nhất**. Với 6 lớp trên 4G, khác nhau là 3 giây so
   * với 18 giây — tức đạt hay trượt hẳn ngưỡng 5 giây của B2.4.
   *
   * Dùng `allSettled` chứ không `all`: `all` bỏ cuộc ở lỗi đầu tiên nên chỉ báo
   * được một tệp, mà người sửa dữ liệu cần biết **hết** tệp nào hỏng để sửa một
   * lượt thay vì sửa từng cái rồi chạy lại.
   */
  async function decodeAll(urls) {
    const results = await Promise.allSettled(urls.map(decode));
    const failed = results
      .map((result, index) => ({ result, url: urls[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failed.length > 0) {
      throw new Error(
        `Không mở được ${failed.length} tệp âm:\n` +
          failed.map(({ url, result }) => `  · ${url} — ${result.reason.message}`).join('\n'),
      );
    }
    return results.map((result) => result.value);
  }

  const audioBytes = () =>
    [...buffers.values()].reduce(
      (sum, b) => sum + b.length * b.numberOfChannels * BYTES_PER_SAMPLE,
      0,
    );

  function teardown() {
    openSession = null;
    layerStack = null;
    if (engine) engine.dispose();
    engine = null;
    current = null;
    container.replaceChildren();
  }

  /**
   * Bỏ các bộ đệm không còn dùng.
   *
   * Không dọn thì đổi địa điểm là cộng dồn bộ nhớ: 4 địa điểm × 6 nền sẽ vượt
   * ngưỡng 150 MB của NFR-04 trên điện thoại. Giữ lại đúng những tệp bản trộn
   * mới cần nên vẫn tận dụng được cache khi quay lại cùng địa điểm.
   *
   * @param {Set<string>} keep
   */
  function evictUnused(keep) {
    for (const url of [...buffers.keys()]) {
      if (!keep.has(url)) buffers.delete(url);
    }
  }

  /**
   * @param {object} args
   * @param {object} args.recipe
   * @param {object} args.location
   * @param {Record<string, object>} args.clipsById
   * @param {Record<string, number>} [args.sliderOverrides] từ URL
   */
  async function open({ recipe, location, clipsById, sliderOverrides = {} }) {
    teardown();
    const session = {};
    openSession = session;
    const cancelled = () => ({ cancelled: true, ready: Promise.resolve({ cancelled: true }) });
    await unlock();
    if (openSession !== session) return cancelled();
    keepUrls = new Set(recipe.layers.map(urlOf));
    evictUnused(keepUrls);
    masterValue ??= recipe.master_slider ?? 0.85;
    onMasterChange?.(masterValue);
    busValues = Object.fromEntries(KRAUSE_CLASSES.map((key) => [key, 1]));
    engine = createSoundscapeEngine(context, { masterSlider: masterValue });
    const sessionEngine = engine;
    const sliders = {};
    const prepared = [];

    /** Dựng một lớp từ bộ đệm đã giải mã và nối vào bộ máy. */
    function attach(layer, buffer) {
      const clip = clipsById[layer.clip_id];

      // Điểm loop lấy từ metadata nếu đã có; chưa có thì tính tại đây bằng đúng
      // hàm mà đường ống xử lý dùng, nên kết quả giống nhau.
      let loopStartS = clip.loop_start_s;
      let loopEndS = clip.loop_end_s;
      if (loopStartS === undefined || loopStartS === null) {
        const detected = findLoopPoints(buffer.getChannelData(0), buffer.sampleRate);
        loopStartS = detected ? detected.startS : 0;
        loopEndS = detected ? detected.endS : buffer.duration;
      }

      const slider = sliderOverrides[layer.clip_id] ?? layer.slider ?? 0.7;
      sliders[layer.clip_id] = slider;

      sessionEngine.addLayer({
        id: layer.clip_id,
        krauseClass: clip.krause_class,
        schaferRole: clip.schafer_role,
        buffer,
        pan: layer.pan ?? 0,
        slider,
        loopStartS,
        loopEndS,
      });
      prepared.push({ layer, clip });
    }

    // Chia hai đợt theo vai Schafer. Băng thông là nút cổ chai **dùng chung**,
    // nên tải song song không rút ngắn tổng thời gian tải — nó chỉ giấu độ trễ
    // vòng. Thứ đưa "tiếng đầu tiên" xuống dưới 5 giây là phát ngay khi lớp
    // **nền** xong: chờ một tệp thay vì chờ năm (B2.4).
    const isBed = (layer) => LOOPING_ROLES.includes(clipsById[layer.clip_id]?.schafer_role);
    const beds = recipe.layers.filter(isBed);
    const rest = recipe.layers.filter((layer) => !isBed(layer));

    if (beds.length === 0) {
      throw new Error(
        `Bản trộn "${recipe.id}" không có lớp nền nào. Không có nền thì không có gì phát liên ` +
          'tục, và phòng nghe chỉ im lặng chờ những tiếng rời rạc.',
      );
    }

    // Lớp nền đi TRƯỚC, và đi một mình. Thả cả năm tệp ra cùng lúc thì chúng
    // **chia nhau băng thông** — nền xong gần như cùng lúc với mọi thứ khác, và
    // phát dần chẳng lợi gì. Đo trong trình duyệt với băng thông giả lập 5 Mbit/s
    // đã cho thấy đúng như vậy. Nhường hết đường truyền cho nền mới là thứ kéo
    // "tiếng đầu tiên" từ ~15 giây xuống còn thời gian tải riêng phần nền.
    //
    // Tổng thời gian tải không đổi — nhưng tổng chưa bao giờ là ràng buộc của
    // B2.4; thời gian tới tiếng đầu tiên mới là.
    let bedBuffers;
    try {
      bedBuffers = await decodeAll(beds.map(urlOf));
    } catch (error) {
      if (openSession !== session) return cancelled();
      teardown();
      keepUrls = new Set();
      evictUnused(keepUrls);
      throw error;
    }
    if (openSession !== session) {
      evictUnused(keepUrls);
      return cancelled();
    }
    beds.forEach((layer, index) => attach(layer, bedBuffers[index]));

    sessionEngine.start();
    current = { recipe, location, clipsById, sliders };
    render(prepared);

    /** Nốt phần còn lại, chạy nền. Không ai phải chờ nó để nghe được. */
    const ready = (async () => {
      const results = await Promise.allSettled(rest.map((layer) => decode(urlOf(layer))));
      // Người dùng có thể đã bấm dừng hoặc đổi địa điểm trong lúc chờ — nhét lớp
      // vào một bộ máy đã huỷ là ném lỗi, hoặc tệ hơn: phát chồng lên phiên mới.
      if (openSession !== session) {
        // Tệp về muộn của phiên đã bỏ vẫn nằm trong bộ đệm — `evictUnused` chạy
        // lúc mở nên không thấy chúng. Không dọn lại thì đổi địa điểm liên tục
        // là cộng dồn bộ nhớ, đúng thứ NFR-04 phải chặn.
        evictUnused(keepUrls);
        return { cancelled: true, layerCount: prepared.length };
      }

      const failed = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') attach(rest[index], result.value);
        else failed.push(`  · ${urlOf(rest[index])} — ${result.reason.message}`);
      });

      scheduleSignalLayers(recipe, prepared);
      render(prepared);

      if (failed.length > 0) {
        // Không đánh sập phiên: mất một tiếng chuông thì phòng nghe vẫn dùng
        // được. Nhưng cũng không nuốt lỗi — người sửa dữ liệu phải biết.
        throw new Error(`Thiếu ${failed.length} lớp phụ, phòng nghe vẫn chạy:\n${failed.join('\n')}`);
      }
      return { cancelled: false, audioBytes: audioBytes(), layerCount: prepared.length };
    })();
    ready.catch(() => {});

    return {
      audioBytes: audioBytes(),
      layerCount: prepared.length,
      totalLayers: recipe.layers.length,
      ready,
    };
  }

  function scheduleSignalLayers(recipe, prepared) {
    for (const { layer, clip } of prepared) {
      if (clip.schafer_role !== 'signal' || !layer.trigger) continue;
      const times = scheduleTriggers({
        seed: recipe.seed,
        meanIntervalS: layer.trigger.mean_interval_s,
        jitterS: layer.trigger.jitter_s ?? 0,
        durationS: SIGNAL_HORIZON_S,
      });
      for (const time of times) engine.triggerOnce(layer.clip_id, context.currentTime + time);
    }
  }

  function setLayerSlider(clipId, value) {
    engine.setLayerSlider(clipId, value);
    current.sliders[clipId] = value;
    // Hình phải đổi theo tay người kéo, nếu không nó nói dối về thứ đang nghe.
    layerStack?.update(current.sliders);
    onMixChange?.(current.sliders);
  }

  function render(prepared) {
    activePrepared = prepared;
    const focused = container.contains(document.activeElement) ? document.activeElement.id : null;
    const expanded = new Set(
      [...container.querySelectorAll('details[open]')]
        .map((node) => node.dataset.key)
        .filter(Boolean),
    );
    const heading = document.createElement('h2');
    heading.id = 'room-heading';
    heading.textContent = current.recipe.title_vi;

    const meta = document.createElement('p');
    meta.className = 'room-meta';
    meta.textContent = current.recipe.placeholder
      ? 'Bản nghe mô phỏng · Âm tổng hợp để khám phá cách phối lớp.'
      : `${prepared.length} lớp âm`;

    // Giấy phép hiệu lực của cả bản trộn — `phap-ly/09` đòi hiện cùng giấy
    // phép từng lớp, và đây là chỗ cảnh báo SA lây sang lớp tự thu lộ ra.
    const mixLicense = createMixLicenseNote(current.recipe, current.clipsById);

    // Lập luận thị giác cho H1: thấy được cấu trúc phân lớp, không chỉ nghe (A5.1).
    layerStack = createLayerStack({
      layers: prepared.map(({ layer, clip }) => ({
        id: clip.id,
        label: clip.title_vi,
        krauseClass: clip.krause_class,
        schaferRole: clip.schafer_role,
        buffer: buffers.get(urlOf(layer)),
        slider: current.sliders[clip.id],
      })),
    });

    const byBus = document.createElement('details');
    byBus.dataset.key = 'buses';
    byBus.open = expanded.has('buses');
    byBus.className = 'bus-group';
    const busHeading = document.createElement('summary');
    busHeading.textContent = 'Điều chỉnh theo nhóm âm';
    byBus.append(busHeading);
    for (const krauseClass of KRAUSE_CLASSES) {
      if (!prepared.some(({ clip }) => clip.krause_class === krauseClass)) continue;
      byBus.append(
        createLayerSlider({
          id: `bus-${krauseClass}`,
          label: KRAUSE_LABEL[krauseClass],
          value: busValues[krauseClass],
          onInput: (value) => {
            busValues[krauseClass] = value;
            engine.setBusSlider(krauseClass, value);
          },
        }),
      );
    }

    const byLayer = document.createElement('div');
    byLayer.className = 'layer-group';
    const layerHeading = document.createElement('h3');
    layerHeading.textContent = 'Pha một không gian của riêng bạn';
    byLayer.append(layerHeading);

    for (const { clip } of prepared) {
      const row = createLayerSlider({
        id: `layer-${clip.id}`,
        label: clip.title_vi,
        hint: SCHAFER_LABEL[clip.schafer_role],
        description: clip.cultural_note_vi,
        value: current.sliders[clip.id],
        onInput: (value) => setLayerSlider(clip.id, value),
      });

      row.dataset.group = clip.krause_class;
      if (clip.schafer_role !== 'keynote') {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'trigger-button';
        button.textContent = 'Phát ngay';
        button.setAttribute('aria-label', `Phát ngay: ${clip.title_vi}`);
        button.addEventListener('click', () => engine.triggerOnce(clip.id));
        row.append(button);
      }
      if (clip.endangerment_level === 'lost') {
        const badge = document.createElement('span');
        badge.className = 'badge badge-lost';
        badge.textContent = 'đã không còn tồn tại';
        row.append(badge);
      }
      // FR-25: mọi trường bắt buộc hiển thị hoặc ghi rõ "chưa có"; FR-27:
      // trích dẫn sao chép được. Gập lại để phòng nghe vẫn gọn.
      const detail = createClipDetails(clip, citation);
      detail.dataset.key = clip.id; detail.open = expanded.has(clip.id);
      row.append(detail);
      byLayer.append(row);
    }

    const master = createLayerSlider({
      id: 'master-slider',
      label: 'Âm lượng tổng',
      value: masterValue,
      onInput: setMasterSlider,
    });

    const sourceInfo = document.createElement('details');
    sourceInfo.className = 'mix-source';
    sourceInfo.dataset.key = 'sources';
    sourceInfo.open = expanded.has('sources');
    const sourceHeading = document.createElement('summary');
    sourceHeading.textContent = 'Nguồn và giấy phép của bản trộn';
    sourceInfo.append(sourceHeading, mixLicense);
    container.replaceChildren(...[heading, meta, layerStack, byLayer, byBus,
      externalMaster ? null : master, sourceInfo].filter(Boolean));
    if (focused) {
      container
        .querySelector(`[id="${CSS.escape(focused)}"]`)
        ?.focus({ preventScroll: true });
    }
  }

  function unlock() {
    context ??= new (window.AudioContext || window.webkitAudioContext)();
    return context.state === 'suspended' ? context.resume() : Promise.resolve();
  }

  function setMasterSlider(value) {
    masterValue = value;
    engine?.setMasterSlider(value);
    onMasterChange?.(value);
  }

  return {
    open,
    unlock,
    setMasterSlider,
    async pause() {
      if (engine) await context.suspend();
    },
    async resume() {
      if (engine) await context.resume();
    },
    resetMix() {
      if (!current) return;
      for (const { layer } of activePrepared) setLayerSlider(layer.clip_id, layer.slider ?? 0.7);
      for (const key of KRAUSE_CLASSES) {
        busValues[key] = 1;
        engine.setBusSlider(key, 1);
      }
      setMasterSlider(current.recipe.master_slider ?? 0.85);
      render(activePrepared);
    },
    close() {
      teardown();
      keepUrls = new Set();
      evictUnused(keepUrls);
    },
    get isOpen() {
      return engine !== null;
    },
    audioBytes,
  };
}
