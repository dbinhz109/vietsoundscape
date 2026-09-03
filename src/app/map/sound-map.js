/**
 * Bản đồ âm thanh (FR-01, FR-02).
 *
 * **Không dùng tile raster.** Bản đồ âm thanh không cần chi tiết đường phố, nên
 * bỏ tile thì hết ba vấn đề cùng lúc:
 *   - không cần khoá API của nhà cung cấp,
 *   - không vướng tile usage policy của OpenStreetMap (BA §5.3),
 *   - tải tức thì vì chỉ là ~72 KB đường vector thay vì hàng chục ảnh.
 *
 * Đường viền lấy từ Natural Earth (public domain) qua
 * `scripts/extract-vietnam-outline.mjs`.
 *
 * Bản đồ là **một** đường vào, không phải đường duy nhất: `main.js` dựng thêm
 * danh sách văn bản tương đương chức năng (FR-04). Giao diện lấy bản đồ làm
 * trung tâm là mẫu kém tiếp cận nhất có thể chọn, mà đề tài lại hứa giá trị cho
 * người khiếm thị.
 */

import L from 'leaflet';

const VIETNAM_CENTER = [16.2, 107.5];
const INITIAL_ZOOM = 5;
const FOCUS_ZOOM = 7;

/** Giới hạn kéo bản đồ theo đúng vùng có dữ liệu đường viền. */
const VIEW_BOUNDS = L.latLngBounds([4, 96], [27, 122]);

const style = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export function createSoundMap({ element, onSelect }) {
  const map = L.map(element, {
    center: VIETNAM_CENTER,
    zoom: INITIAL_ZOOM,
    minZoom: 4,
    maxZoom: 9,
    maxBounds: VIEW_BOUNDS,
    maxBoundsViscosity: 0.9,
    zoomControl: true,
    attributionControl: true,
    // Bản đồ không phải đường vào duy nhất nên không bắt phím ở đây — để tab đi
    // thẳng tới danh sách văn bản cho nhanh.
    keyboard: false,
  });

  map.attributionControl.addAttribution(
    'Đường viền: <a href="https://www.naturalearthdata.com/">Natural Earth</a> (public domain)',
  );

  const markers = new Map();

  /** @param {object} outline GeoJSON đường viền quốc gia */
  function addOutline(outline) {
    L.geoJSON(outline, {
      style: (feature) =>
        feature.properties.role === 'focus'
          ? {
              color: style('--accent-strong') || '#2a5f6e',
              weight: 1.4,
              fillColor: style('--paper-raised') || '#fdfdfb',
              fillOpacity: 1,
            }
          : {
              color: style('--ink-300') || '#b9c4c8',
              weight: 0.8,
              fillColor: style('--paper-sunk') || '#eef0ea',
              fillOpacity: 0.75,
              dashArray: '2 3',
            },
      // Nước lân cận chỉ để lấy bối cảnh — không cho bấm, không cho trình đọc
      // màn hình dừng lại ở đó.
      interactive: false,
    }).addTo(map);
  }

  function addLocations(geojson) {
    L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const { location_id: id, name_vi: name, clip_count: clipCount } = feature.properties;

        // Hai vòng: vòng ngoài mờ tạo cảm giác âm lan ra, vòng trong là điểm ghi.
        const halo = L.circleMarker(latlng, {
          radius: 16,
          stroke: false,
          fillColor: style('--accent') || '#4fb3c8',
          fillOpacity: 0.16,
          interactive: false,
        });
        const dot = L.circleMarker(latlng, {
          radius: 6,
          weight: 2,
          color: style('--accent-strong') || '#2a5f6e',
          fillColor: style('--accent') || '#4fb3c8',
          fillOpacity: 1,
        });

        dot.bindTooltip(`${name} · ${clipCount} mẫu âm`, { direction: 'top', offset: [0, -8] });
        dot.on('click', () => onSelect(id));

        markers.set(id, { dot, halo });
        return L.layerGroup([halo, dot]);
      },
    }).addTo(map);
  }

  function focus(locationId) {
    const entry = markers.get(locationId);
    if (!entry) return;

    const target = entry.dot.getLatLng();
    // Tôn trọng thiết lập giảm chuyển động của hệ điều hành (FR-64).
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) map.setView(target, FOCUS_ZOOM);
    else map.flyTo(target, FOCUS_ZOOM, { duration: 0.7 });

    for (const [id, { dot }] of markers) {
      dot.setStyle({ radius: id === locationId ? 8 : 6, weight: id === locationId ? 3 : 2 });
    }
    entry.dot.openTooltip();
  }

  return { addOutline, addLocations, focus, map };
}
