import { describe, expect, test } from 'vitest';
import { materializeClip, materializeRecipe } from './runtime-dataset.js';
const original = { id: 'HN-01', status: 'planned', location_verified: false, consent_status: 'pending' };
const report = { id: 'HN-01', duration_s: 12, sample_rate: 48000, sha256: 'measured',
  files: ['standard', 'research', 'fallback'].map((quality) => ({ quality, path: `stage/HN-01.${quality}.hash.wav` })) };
const recipe = { id: 'hanoi', placeholder: true, layers: [{ clip_id: 'HN-01', placeholder_audio: '/old.wav', slider: 0.7 }] };
const options = { synthetic: true, audioPrefix: '/build/runtime/audio/' };

describe('thay dữ liệu không sửa mã', () => {
  test('demo và âm thật có cùng hợp đồng URL; bản thật bỏ hoàn toàn đường âm giữ chỗ', () => {
    const demo = materializeClip(original, report, options);
    const real = materializeClip(original, report, { ...options, synthetic: false });
    expect(real.audio).toBe(demo.audio);
    const mixed = materializeRecipe(recipe, { 'HN-01': real }, false);
    expect(mixed.placeholder).toBe(false);
    expect(mixed.layers[0]).not.toHaveProperty('placeholder_audio');
    expect(mixed.layers[0].audio).toBe(real.audio);
    expect(recipe.layers[0].placeholder_audio).toBe('/old.wav');
  });
  test('demo không giả xác minh hay đồng thuận; metadata thật được giữ', () => {
    const metadata = { location_verified: true, consent_status: 'obtained', rights_holder: 'Chủ bản thu' };
    expect(materializeClip(original, report, { ...options, metadata }).location_verified).toBe(false);
    const real = materializeClip(original, report, { ...options, synthetic: false, metadata });
    expect(real).toMatchObject({ synthetic: false, status: 'processed', ...metadata });
    expect(materializeClip(original, report, options).consent_status).toBe('pending');
  });
  test('số đo thực tế thắng số liệu nhập tay và không cho metadata đổi mã mẫu', () => {
    const clip = materializeClip(original, report, { ...options, metadata: { id: 'WRONG', duration_s: 100 } });
    expect(clip.id).toBe('HN-01');
    expect(clip.duration_s).toBe(12);
  });
  test('thiếu bản âm nghiên cứu thì lỗi trước khi xuất bản', () => {
    expect(() => materializeClip(original, { ...report, files: report.files.slice(0, 1) }, options)).toThrow(/research/);
    expect(() => materializeRecipe(recipe, {}, false)).toThrow(/HN-01/);
  });
});
