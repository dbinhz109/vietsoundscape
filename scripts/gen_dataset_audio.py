#!/usr/bin/env python3
"""32 tệp tổng hợp theo mã mẫu; cùng hợp đồng đầu vào với bản thu WAV thật."""
import json
from pathlib import Path
from gen_test_audio import periodic_bed, amplitude_modulate, struck_tone, write_wav

root = Path(__file__).resolve().parent.parent
out = root / 'build/demo-sources'
out.mkdir(parents=True, exist_ok=True)
clips = json.loads((root / 'data/clips.json').read_text())['clips']
for i, clip in enumerate(clips):
    if clip['schafer_role'] == 'keynote':
        low, high = {'geophony': (80, 5000), 'biophony': (2200, 6500),
                     'anthrophony': (100, 3200)}[clip['krause_class']]
        samples = amplitude_modulate(
            periodic_bed(12, 260926 + i, low, high, peak=0.35), 12, 3 + i, 0.4)
    else:
        hz = 180 + i * 19
        samples = struck_tone(4, [(hz, 1), (hz * 2.17, 0.35), (hz * 3.1, 0.15)], 0.8)
    write_wav(out / f"{clip['id']}.wav", samples)
print(f'{len(clips)} mẫu tổng hợp có seed cố định → {out}')
