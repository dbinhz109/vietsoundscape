import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { validateClip, validateDataset } from './clip-schema.js';

/**
 * Kiểm thử tích hợp trên chính tệp dữ liệu thật.
 *
 * Nhờ nó, mọi lần sửa `data/clips.json` mà làm sai luật đều làm đỏ `npm test`
 * ngay lập tức — thay vì phát hiện ở tuần 12 khi đã dựng bản trộn.
 */

const ROOT = join(import.meta.dirname, '..', '..');
const read = (name) => JSON.parse(readFileSync(join(ROOT, 'data', name), 'utf-8'));

const { clips } = read('clips.json');
const locations = read('locations.geojson');
const locationIds = new Set(locations.features.map((f) => f.properties.location_id));

describe('bộ dữ liệu thật', () => {
  test('mọi mẫu âm hợp lệ theo lược đồ', () => {
    const result = validateDataset(clips);
    expect(result.errors).toEqual([]);
  });

  test('mọi mẫu trỏ tới một địa điểm có thật', () => {
    const orphans = clips.filter((c) => !locationIds.has(c.location_id));
    expect(orphans.map((c) => c.id)).toEqual([]);
  });

  test('mỗi địa điểm có ít nhất một mẫu bắt buộc xác minh tại chỗ', () => {
    // Điều kiện của rủi ro R-10: bản trộn không có mẫu đã xác minh thì không
    // dùng làm kích thích cho H1 được.
    for (const locationId of locationIds) {
      const stars = clips.filter((c) => c.location_id === locationId && c.must_verify_on_site);
      expect(stars.length, `địa điểm ${locationId} không có mẫu ⭐`).toBeGreaterThanOrEqual(1);
    }
  });

  test('mỗi địa điểm có đủ cả ba nhóm nguồn phát để ba bus đều có việc', () => {
    for (const locationId of locationIds) {
      const classes = new Set(
        clips.filter((c) => c.location_id === locationId).map((c) => c.krause_class),
      );
      expect([...classes].sort(), `địa điểm ${locationId}`).toEqual([
        'anthrophony',
        'biophony',
        'geophony',
      ]);
    }
  });

  test('mỗi địa điểm có ít nhất hai lớp âm nền để trộn', () => {
    for (const locationId of locationIds) {
      const keynotes = clips.filter(
        (c) => c.location_id === locationId && c.schafer_role === 'keynote',
      );
      expect(keynotes.length, `địa điểm ${locationId}`).toBeGreaterThanOrEqual(2);
    }
  });

  test('rào chắn giấy phép thật sự chặn được mẫu phi thương mại', () => {
    // Kiểm chính cái rào chắn, không chỉ kiểm dữ liệu hiện tại đang sạch.
    const smuggled = { ...clips[0], status: 'published', license: 'CC-BY-NC-SA-4.0' };
    const result = validateClip(smuggled);

    expect(result.valid).toBe(false);
    expect(result.errors.find((e) => e.field === 'license').message).toMatch(/LG-03/);
  });
});
