/**
 * Điểm vào của ứng dụng — lát dọc mốc M2.
 *
 * Nối: dữ liệu tĩnh → bản đồ + danh sách văn bản → phòng nghe → trạng thái URL.
 * JS thuần, không khung giao diện. Bộ máy âm thanh và luật dữ liệu đều nằm ngoài
 * tầng này.
 */

import 'leaflet/dist/leaflet.css';
import '../styles/tokens.css';
import '../styles/app.css';

import { assetUrl } from './asset-url.js';
import { createSoundMap } from './map/sound-map.js';
import { createListeningRoom } from './room/listening-room.js';
import { parseUrlState, toSearchParams } from './state/url-state.js';
import { createLocationFilter, filterLocations } from './ui/location-filter.js';
import { createRecipeChooser } from './ui/recipe-chooser.js';
import { registerOfflineSupport } from './offline/register.js';
import { indexClipsById, validateRecipe } from '../data/recipe-schema.js';
import { REGION_LABEL } from '../domain/labels.js';

const el = (id) => document.getElementById(id);

const state = { locationId: null, recipeId: null, layerSliders: {}, filter: {} };

const json = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Không tải được ${url} (${response.status})`);
  return response.json();
};

function syncUrl() {
  const params = toSearchParams(state);
  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : location.pathname);
}

function setStatus(message, kind = 'info') {
  const box = el('status');
  box.textContent = message;
  box.dataset.kind = kind;
}

async function main() {
  const [locations, clipsFile, recipeIndex, outline] = await Promise.all([
    json(assetUrl('/data/locations.geojson')),
    json(assetUrl('/data/clips.json')),
    json(assetUrl('/data/recipes/index.json')),
    json(assetUrl('/data/vietnam-outline.geojson')),
  ]);

  const clipsById = indexClipsById(clipsFile.clips);
  const byLocation = new Map();
  for (const feature of locations.features) {
    byLocation.set(feature.properties.location_id, feature.properties);
  }
  const recipesByLocation = new Map();
  for (const entry of recipeIndex) {
    if (!recipesByLocation.has(entry.location_id)) recipesByLocation.set(entry.location_id, []);
    recipesByLocation.get(entry.location_id).push(entry);
  }

  // Đọc URL sớm để bộ lọc dựng ra đúng trạng thái người ta gửi; còn địa điểm
  // thì chỉ ghi nhận, không tự phát (NFR-21) — xử lý ở cuối.
  const fromUrl = parseUrlState(location.search);
  state.filter = fromUrl.filter;

  const player = el('player');
  const playerTitle = el('player-title');
  const playerMaster = el('player-master');
  const playPause = el('play-pause');
  let selectionVersion = 0;
  let activeController = null;
  let paused = false;

  const room = createListeningRoom({
    container: el('room'),
    externalMaster: true,
    onMixChange: (sliders) => {
      state.layerSliders = sliders;
      syncUrl();
    },
    onMasterChange: (value) => {
      playerMaster.value = String(value);
      playerMaster.setAttribute('aria-valuetext', `${Math.round(value * 100)} phần trăm`);
    },
    citationContext: {
      datasetVersion: clipsFile.dataset_version ?? 'chưa có',
      siteUrl: new URL(assetUrl('/'), location.href).href,
      accessed: new Date().toISOString().slice(0, 10),
    },
  });

  function showEmptyRoom() {
    const heading = document.createElement('h2');
    heading.id = 'room-heading';
    heading.textContent = 'Chưa mở cảnh âm nào';
    const hint = document.createElement('p');
    hint.textContent = 'Chọn một địa điểm ở trên để bước vào không gian nghe.';
    el('room').replaceChildren(heading, hint);
  }

  const soundMap = createSoundMap({ element: el('map'), onSelect: (id) => select(id) });
  soundMap.addOutline(outline);
  soundMap.addLocations(locations);

  // FR-04: danh sách văn bản tương đương chức năng với bản đồ. Đây là đường vào
  // dùng được bằng bàn phím và trình đọc màn hình.
  const list = el('location-list');
  locations.features.forEach((feature, index) => {
    const {
      location_id: id,
      name_vi: name,
      region,
      detail_vi: detail,
      signature_vi: signature,
    } = feature.properties;
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'location-button';
    button.dataset.locationId = id;

    const number = document.createElement('span');
    number.className = 'location-number';
    number.textContent = String(index + 1).padStart(2, '0');
    const copy = document.createElement('span');
    copy.className = 'location-copy';
    const overline = document.createElement('span');
    overline.className = 'location-overline';
    overline.textContent = `${REGION_LABEL[region]} · ${detail}`;
    const title = document.createElement('span');
    title.className = 'location-name';
    title.textContent = name;
    const meta = document.createElement('span');
    meta.className = 'location-signature';
    meta.textContent = signature;

    copy.append(overline, title, meta);
    const arrow = document.createElement('span');
    arrow.className = 'location-arrow';
    arrow.textContent = 'Nghe →';
    button.append(number, copy, arrow);
    button.addEventListener('click', () => select(id));
    item.append(button);
    item.dataset.region = region;
    item.dataset.locationId = id;
    list.append(item);
  });

  // FR-03: lọc và tìm. Danh sách và bản đồ cùng nghe một bộ lọc, trạng thái
  // lọc nằm trên URL để chia sẻ được một góc nhìn ("chỉ dấu ấn đã mất").
  const locationProps = locations.features.map((feature) => feature.properties);
  const applyFilter = () => {
    const matched = filterLocations({
      locations: locationProps,
      clips: clipsFile.clips,
      recipes: recipeIndex,
      filter: state.filter,
    });
    const keep = new Set(matched);
    for (const item of list.children) item.hidden = !keep.has(item.dataset.locationId);
    soundMap.setVisible(keep);
    filterForm.setResultCount(matched.length, locationProps.length);
  };
  const filterForm = createLocationFilter({
    value: state.filter,
    onChange: (filter) => {
      state.filter = filter;
      applyFilter();
      syncUrl();
    },
  });
  el('filter').replaceChildren(filterForm);
  applyFilter();

  async function select(locationId) {
    const version = ++selectionVersion;
    activeController?.abort();
    activeController = new AbortController();
    const location = byLocation.get(locationId);
    const recipes = recipesByLocation.get(locationId) ?? [];
    if (!location || recipes.length === 0) {
      setStatus(`Địa điểm "${locationId}" chưa có bản trộn nào.`, 'warn');
      return;
    }

    // Ưu tiên: bản trộn trên URL → bản khớp thời điểm đang lọc (lọc "Đêm" rồi
    // mở một nơi thì nghe bản đêm) → bản đầu theo thứ tự thời điểm trong ngày.
    const wanted =
      recipes.find((r) => r.id === state.recipeId) ??
      recipes.find((r) => state.filter.timeOfDay && r.time_of_day === state.filter.timeOfDay) ??
      recipes[0];
    setStatus(`Đang mở cảnh âm “${wanted.title_vi}”…`);

    for (const button of list.querySelectorAll('.location-button')) {
      button.setAttribute('aria-current', String(button.dataset.locationId === locationId));
    }

    try {
      const recipe = await json(assetUrl(`/data/recipes/${wanted.id}.json`), {
        signal: activeController.signal,
      });
      if (version !== selectionVersion) return;
      const check = validateRecipe(recipe, clipsById);
      if (!check.valid) {
        setStatus(`Bản trộn "${recipe.id}" không hợp lệ: ${check.errors[0].message}`, 'error');
        return;
      }

      const isNewLocation = state.locationId !== locationId;
      state.locationId = locationId;
      state.recipeId = recipe.id;
      if (isNewLocation) state.layerSliders = {};

      const result = await room.open({
        recipe,
        location,
        clipsById,
        sliderOverrides: state.layerSliders,
      });
      if (version !== selectionVersion || result.cancelled) return;

      soundMap.focus(locationId);
      syncUrl();
      player.hidden = false;
      document.body.classList.add('has-player');
      playerTitle.textContent = recipe.title_vi;
      paused = false;
      playPause.textContent = 'Tạm dừng';
      player.classList.remove('is-paused');

      // FR-59: một nơi có nhiều bản trộn theo thời điểm — cho chọn ngay trên đầu
      // phòng nghe. Đổi bản trộn giữ nguyên địa điểm nên giữ vị trí thanh trượt.
      const chooser = createRecipeChooser({
        recipes,
        currentId: recipe.id,
        onChoose: (recipeId) => {
          state.recipeId = recipeId;
          select(locationId);
        },
      });
      el('recipe-chooser').replaceChildren(...(chooser ? [chooser] : []));

      const summary = (state) =>
        `${location.name_vi} · ${state}` +
        (recipe.placeholder ? ' · bản nghe mô phỏng' : '');

      // Có tiếng rồi thì báo ngay, đừng đợi lớp phụ: cả điểm của việc phát dần
      // là người nghe không phải chờ (B2.4).
      setStatus(summary(`${result.layerCount}/${result.totalLayers} lớp đang phát, còn tải…`));

      result.ready.then(
        (full) => {
          if (!full.cancelled && version === selectionVersion) {
            setStatus(summary(`${full.layerCount} lớp âm đang phát`));
          }
        },
        // Lớp phụ hỏng thì nhạc vẫn chạy — báo cho biết, đừng đánh sập phiên.
        (error) => {
          if (version === selectionVersion) {
            setStatus(`${location.name_vi} — đang phát, nhưng ${error.message}`, 'warn');
          }
        },
      );

      if (matchMedia('(max-width: 60rem)').matches) {
        const heading = el('room-heading');
        heading.tabIndex = -1;
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        heading.focus({ preventScroll: true });
      }
    } catch (error) {
      if (version !== selectionVersion || error.name === 'AbortError') return;
      setStatus(`Không mở được cảnh âm: ${error.message}`, 'error');
    }
  }

  el('stop').addEventListener('click', () => {
    selectionVersion += 1;
    activeController?.abort();
    room.close();
    showEmptyRoom();
    player.hidden = true;
    document.body.classList.remove('has-player');
    el('recipe-chooser').replaceChildren();
    setStatus('Đã dừng. Chọn một địa điểm để nghe tiếp.');
  });

  playerMaster.addEventListener('input', () => room.setMasterSlider(Number(playerMaster.value)));
  playPause.addEventListener('click', async () => {
    if (paused) await room.resume();
    else await room.pause();
    paused = !paused;
    playPause.textContent = paused ? 'Phát tiếp' : 'Tạm dừng';
    player.classList.toggle('is-paused', paused);
  });
  el('reset-mix').addEventListener('click', () => room.resetMix());
  el('share-mix').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      el('share-mix').textContent = 'Đã chép';
      setTimeout(() => { el('share-mix').textContent = 'Chép liên kết'; }, 1600);
    } catch {
      setStatus('Không thể chép tự động — hãy sao chép địa chỉ trên trình duyệt.', 'warn');
    }
  });

  // Trạng thái từ URL: chỉ ghi nhận, không tự phát — trình duyệt chặn phát âm
  // khi chưa có hành động của người dùng (NFR-21).
  Object.assign(state, fromUrl);
  if (fromUrl.locationId && byLocation.has(fromUrl.locationId)) {
    soundMap.focus(fromUrl.locationId);
    setStatus(
      `Liên kết trỏ tới ${byLocation.get(fromUrl.locationId).name_vi}. ` +
        'Bấm vào địa điểm để bắt đầu nghe.',
    );
  } else {
    setStatus('Chọn một địa điểm để bước vào phòng nghe.');
  }
}

// PWA ngoại tuyến (A5.1): chỉ ở bản dựng, thất bại thì trang vẫn chạy như thường.
registerOfflineSupport({ swUrl: assetUrl('/sw.js') });

main().catch((error) => {
  setStatus(`Lỗi khởi động: ${error.message}`, 'error');
  throw error;
});
