import { describe, expect, test } from 'vitest';
import {
  CONSENT_LABEL,
  ENDANGERMENT_LABEL,
  KRAUSE_LABEL,
  PROVENANCE_LABEL,
  REGION_LABEL,
  SCHAFER_LABEL,
  TIME_OF_DAY_LABEL,
  labelOf,
} from './labels.js';
import {
  CONSENT_STATUSES,
  ENDANGERMENT_LEVELS,
  KRAUSE_CLASSES,
  PROVENANCE,
  REGIONS,
  SCHAFER_ROLES,
  TIMES_OF_DAY,
} from './taxonomy.js';

const covers = (labels, vocab) => vocab.every((code) => typeof labels[code] === 'string' && labels[code]);

describe('nhãn tiếng Việt phủ kín từ vựng có kiểm soát', () => {
  // Một mã không có nhãn là một ô select hiện mã máy cho người dùng. Test này
  // buộc ai thêm mã vào taxonomy.js cũng phải thêm nhãn.
  test('vùng miền', () => expect(covers(REGION_LABEL, REGIONS)).toBe(true));
  test('nhóm Krause', () => expect(covers(KRAUSE_LABEL, KRAUSE_CLASSES)).toBe(true));
  test('vai Schafer', () => expect(covers(SCHAFER_LABEL, SCHAFER_ROLES)).toBe(true));
  test('mức mai một', () => expect(covers(ENDANGERMENT_LABEL, ENDANGERMENT_LEVELS)).toBe(true));
  test('thời điểm trong ngày', () => expect(covers(TIME_OF_DAY_LABEL, TIMES_OF_DAY)).toBe(true));
  test('trạng thái đồng thuận', () => expect(covers(CONSENT_LABEL, CONSENT_STATUSES)).toBe(true));
  test('nguồn vật liệu', () => expect(covers(PROVENANCE_LABEL, PROVENANCE)).toBe(true));
});

describe('labelOf', () => {
  test('trả nhãn khi có, trả nguyên mã khi không có — không bao giờ undefined', () => {
    expect(labelOf(KRAUSE_LABEL, 'geophony')).toBe(KRAUSE_LABEL.geophony);
    expect(labelOf(KRAUSE_LABEL, 'lạ')).toBe('lạ');
  });
  test('mã trống thì trả "chưa có"', () => {
    expect(labelOf(KRAUSE_LABEL, undefined)).toBe('chưa có');
    expect(labelOf(KRAUSE_LABEL, null)).toBe('chưa có');
  });
});

describe('REGIONS', () => {
  test('khớp bốn vùng của bốn địa điểm trong data/locations.geojson', () => {
    expect([...REGIONS].sort()).toEqual(['bac-bo', 'dbscl', 'tay-nguyen', 'trung-bo']);
  });
});
