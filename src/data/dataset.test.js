import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { validateClip, validateDataset } from './clip-schema.js';
import { composeAnswerOptions } from '../research/answer-options.js';

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

describe('phương án nhiễu — data/distractors.json (spec S1.1)', () => {
  // Danh sách trả lời của phiên nghe = 4 vùng thật + các địa danh này. Không có
  // chúng thì người tham gia loại trừ dần: lượt 4 chỉ còn một lựa chọn.
  const { distractors } = read('distractors.json');
  const regions = new Set(locations.features.map((f) => f.properties.region));

  test('có ít nhất 4 phương án nhiễu (≥ 8 ô trả lời mỗi lượt)', () => {
    expect(distractors.length).toBeGreaterThanOrEqual(4);
  });

  test('không phương án nào trùng địa điểm thật của bộ kích thích', () => {
    expect(distractors.filter((d) => locationIds.has(d.location_id))).toEqual([]);
  });

  test('mã không trùng nhau', () => {
    const ids = distractors.map((d) => d.location_id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('mỗi phương án có mã kebab-case, tên tiếng Việt, và vùng thuộc từ vựng của locations.geojson', () => {
    for (const d of distractors) {
      expect(d.location_id, JSON.stringify(d)).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(typeof d.name_vi === 'string' && d.name_vi.trim().length > 0, d.location_id).toBe(true);
      expect(regions.has(d.region), `${d.location_id}: vùng "${d.region}"`).toBe(true);
      expect(typeof d.why_vi === 'string' && d.why_vi.length > 20, d.location_id).toBe(true);
    }
  });

  test('mỗi vùng của bộ kích thích có ít nhất một phương án nhiễu CÙNG vùng', () => {
    // Nếu nhiễu toàn ở vùng khác thì nhận ra vùng là đủ để loại hết nhiễu, và
    // heuristic loại trừ quay lại ở mức vùng. Cùng vùng thì phải nhận ra NƠI.
    for (const region of regions) {
      expect(
        distractors.filter((d) => d.region === region).length,
        `vùng ${region} không có phương án nhiễu`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test('ghép được với địa điểm thật thành danh sách trả lời hợp lệ', () => {
    const options = composeAnswerOptions(
      [...locationIds],
      distractors.map((d) => d.location_id),
    );
    expect(options.length).toBe(locationIds.size + distractors.length);
  });
});

describe('mục lục bản trộn và từ vựng vùng (FR-03)', () => {
  const index = read('recipes/index.json');

  test('mỗi mục trong index.json có time_of_day khớp với tệp bản trộn', () => {
    // Bộ lọc "thời điểm trong ngày" đọc từ index để không phải tải hết bản
    // trộn; lệch nhau là lọc sai mà không ai báo.
    for (const entry of index) {
      const recipe = read(`recipes/${entry.id}.json`);
      expect(entry.time_of_day, `${entry.id} thiếu time_of_day trong index`).toBe(recipe.time_of_day);
      expect(entry.location_id).toBe(recipe.location_id);
    }
  });

  test('vùng của mọi địa điểm nằm trong REGIONS của taxonomy', async () => {
    const { REGIONS } = await import('../domain/taxonomy.js');
    for (const feature of locations.features) {
      expect(REGIONS, `${feature.properties.location_id}: vùng "${feature.properties.region}"`).toContain(
        feature.properties.region,
      );
    }
  });
});
