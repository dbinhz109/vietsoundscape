/** Hợp đồng dùng chung khi thay âm tổng hợp bằng bản thu thật. */
export function materializeClip(original, report, { metadata = {}, synthetic, audioPrefix }) {
  if (!report || report.id !== original.id) throw new Error(`Thiếu báo cáo xử lý ${original.id}`);
  const clip = { ...original, ...metadata, id: original.id };
  for (const key of ['sample_rate', 'channels', 'duration_s', 'loudness_lufs', 'true_peak_dbtp',
    'loop_start_s', 'loop_end_s', 'sha256', 'editing_log']) clip[key] = report[key];
  const audio = (quality) => {
    const file = report.files.find((item) => item.quality === quality);
    if (!file) throw new Error(`${original.id} thiếu bản mã hoá ${quality}`);
    return audioPrefix + file.path.split('/').at(-1);
  };
  clip.audio = audio('standard');
  clip.research_audio = audio('research');
  clip.audio_fallback = audio('fallback');
  clip.synthetic = synthetic;
  clip.status = synthetic ? 'planned' : (clip.status === 'published' ? 'published' : 'processed');
  if (synthetic) clip.location_verified = false;
  return clip;
}

export function materializeRecipe(original, clipsById, synthetic) {
  return { ...original, placeholder: synthetic, layers: original.layers.map((originalLayer) => {
    const { placeholder_audio: _placeholder, ...layer } = originalLayer;
    const clip = clipsById[layer.clip_id];
    if (!clip?.audio) throw new Error(`Thiếu âm cho ${layer.clip_id}`);
    return { ...layer, audio: clip.audio };
  }) };
}
