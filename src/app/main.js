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

import { createSoundMap } from './map/sound-map.js';
import { createListeningRoom } from './room/listening-room.js';
import { parseUrlState, toSearchParams } from './state/url-state.js';
import { indexClipsById, validateRecipe } from '../data/recipe-schema.js';

const el = (id) => document.getElementById(id);

const state = { locationId: null, recipeId: null, layerSliders: {} };

const json = async (url) => {
  const response = await fetch(url);
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
    json('/data/locations.geojson'),
    json('/data/clips.json'),
    json('/data/recipes/index.json'),
    json('/data/vietnam-outline.geojson'),
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

  const room = createListeningRoom({
    container: el('room'),
    onMixChange: (sliders) => {
      state.layerSliders = sliders;
      syncUrl();
    },
  });

  const soundMap = createSoundMap({ element: el('map'), onSelect: (id) => select(id) });
  soundMap.addOutline(outline);
  soundMap.addLocations(locations);

  // FR-04: danh sách văn bản tương đương chức năng với bản đồ. Đây là đường vào
  // dùng được bằng bàn phím và trình đọc màn hình.
  const list = el('location-list');
  for (const feature of locations.features) {
    const { location_id: id, name_vi: name, region, signature_vi: signature } = feature.properties;
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'location-button';
    button.dataset.locationId = id;

    const title = document.createElement('span');
    title.className = 'location-name';
    title.textContent = name;
    const meta = document.createElement('span');
    meta.className = 'location-signature';
    meta.textContent = signature;

    button.append(title, meta);
    button.addEventListener('click', () => select(id));
    item.append(button);
    item.dataset.region = region;
    list.append(item);
  }

  async function select(locationId) {
    const location = byLocation.get(locationId);
    const recipes = recipesByLocation.get(locationId) ?? [];
    if (!location || recipes.length === 0) {
      setStatus(`Địa điểm "${locationId}" chưa có bản trộn nào.`, 'warn');
      return;
    }

    const wanted = recipes.find((r) => r.id === state.recipeId) ?? recipes[0];
    setStatus(`Đang tải "${wanted.title_vi}"…`);

    for (const button of list.querySelectorAll('.location-button')) {
      button.setAttribute('aria-current', String(button.dataset.locationId === locationId));
    }

    try {
      const recipe = await json(`/data/recipes/${wanted.id}.json`);
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

      soundMap.focus(locationId);
      syncUrl();

      const summary = (state) =>
        `${location.name_vi} — ${state} · RAM âm thanh ` +
        `${(room.audioBytes() / 1e6).toFixed(1)} MB · ` +
        (check.experimentReady ? 'dùng được cho H1' : 'chưa dùng được cho H1 (chưa có mẫu xác minh)');

      // Có tiếng rồi thì báo ngay, đừng đợi lớp phụ: cả điểm của việc phát dần
      // là người nghe không phải chờ (B2.4).
      setStatus(summary(`${result.layerCount}/${result.totalLayers} lớp đang phát, còn tải…`));

      result.ready.then(
        (full) => {
          if (!full.cancelled) setStatus(summary(`${full.layerCount} lớp đang phát`));
        },
        // Lớp phụ hỏng thì nhạc vẫn chạy — báo cho biết, đừng đánh sập phiên.
        (error) => setStatus(`${location.name_vi} — đang phát, nhưng ${error.message}`, 'warn'),
      );
    } catch (error) {
      setStatus(`Không mở được phòng nghe: ${error.message}`, 'error');
    }
  }

  el('stop').addEventListener('click', () => {
    room.close();
    setStatus('Đã dừng và ngắt kết nối để giải phóng bộ nhớ.');
  });

  // Trạng thái từ URL: chỉ ghi nhận, không tự phát — trình duyệt chặn phát âm
  // khi chưa có hành động của người dùng (NFR-21).
  const fromUrl = parseUrlState(location.search);
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

main().catch((error) => {
  setStatus(`Lỗi khởi động: ${error.message}`, 'error');
  throw error;
});
