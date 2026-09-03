/**
 * Trích đường viền Việt Nam và các nước lân cận ra GeoJSON.
 *
 * Vì sao không dùng tile raster: bản đồ âm thanh không cần chi tiết đường phố.
 * Bỏ tile thì hết luôn ba vấn đề cùng lúc — không cần khoá API, không vướng tile
 * usage policy của OpenStreetMap (BA §5.3), và tải tức thì vì chỉ là mấy KB
 * đường vector thay vì hàng chục ảnh.
 *
 * Nguồn: Natural Earth qua gói `world-atlas`. Natural Earth là **public domain**
 * (không cần xin phép, không cần ghi công — nhưng vẫn ghi cho đúng phép).
 *
 * Đây là script chạy một lần: kết quả ghi vào data/, sau đó gỡ được cả hai gói
 * world-atlas và topojson-client khỏi phụ thuộc.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { feature } from 'topojson-client';

const ROOT = join(import.meta.dirname, '..');

// Mã ISO 3166-1 numeric.
const VIETNAM = '704';
const NEIGHBOURS = { 116: 'Campuchia', 418: 'Lào', 156: 'Trung Quốc', 764: 'Thái Lan' };

const topology = JSON.parse(
  readFileSync(join(ROOT, 'node_modules/world-atlas/countries-50m.json'), 'utf-8'),
);
const countries = feature(topology, topology.objects.countries);

const pick = (id) => countries.features.find((f) => f.id === String(id));

/** Khung nhìn của bản đồ. Phần đất ngoài khung này không bao giờ hiện ra. */
const VIEW = { lonMin: 96, lonMax: 122, latMin: 4, latMax: 27 };

/** 3 chữ số thập phân ≈ 100 m — quá đủ cho đường viền quốc gia ở mức zoom này. */
const PRECISION = 3;

const round = (value) => Number(value.toFixed(PRECISION));

const ringIntersectsView = (ring) =>
  ring.some(
    ([lon, lat]) =>
      lon >= VIEW.lonMin && lon <= VIEW.lonMax && lat >= VIEW.latMin && lat <= VIEW.latMax,
  );

/** Bỏ phần đất ngoài khung nhìn, rồi làm gọn toạ độ. */
function simplify(geometry) {
  const trimRing = (ring) => ring.map(([lon, lat]) => [round(lon), round(lat)]);

  if (geometry.type === 'Polygon') {
    if (!ringIntersectsView(geometry.coordinates[0])) return null;
    return { type: 'Polygon', coordinates: geometry.coordinates.map(trimRing) };
  }

  const polygons = geometry.coordinates
    .filter((polygon) => ringIntersectsView(polygon[0]))
    .map((polygon) => polygon.map(trimRing));

  if (polygons.length === 0) return null;
  return { type: 'MultiPolygon', coordinates: polygons };
}

const vietnam = pick(VIETNAM);
if (!vietnam) throw new Error('Không tìm thấy Việt Nam trong bộ dữ liệu.');

const outline = {
  type: 'FeatureCollection',
  metadata: {
    source: 'Natural Earth 1:50m qua gói npm world-atlas',
    license: 'public domain',
    note: 'Đường viền dùng thay tile raster — xem scripts/extract-vietnam-outline.mjs',
  },
  features: [
    {
      type: 'Feature',
      id: vietnam.id,
      geometry: simplify(vietnam.geometry),
      properties: { name_vi: 'Việt Nam', role: 'focus' },
    },
    ...Object.entries(NEIGHBOURS)
      .map(([id, name]) => {
        const country = pick(id);
        if (!country) return null;
        const geometry = simplify(country.geometry);
        return geometry
          ? { type: 'Feature', id: country.id, geometry, properties: { name_vi: name, role: 'context' } }
          : null;
      })
      .filter(Boolean),
  ],
};

const path = join(ROOT, 'data', 'vietnam-outline.geojson');
writeFileSync(path, `${JSON.stringify(outline)}\n`);

const sizeKb = (JSON.stringify(outline).length / 1024).toFixed(1);
console.log(`${outline.features.length} vùng, ${sizeKb} KB → data/vietnam-outline.geojson`);
for (const f of outline.features) {
  const rings = f.geometry.type === 'Polygon' ? 1 : f.geometry.coordinates.length;
  console.log(`  ${f.properties.name_vi.padEnd(14)} ${f.geometry.type} · ${rings} phần`);
}
