#!/usr/bin/env python3
"""Sinh âm thử tổng hợp cho spike M0 — để phần mềm không phải chờ thực địa.

Mẹo then chốt: nền âm được dựng trong miền tần số rồi biến đổi Fourier ngược.
Mọi thành phần tần số vì thế đều là bội nguyên của 1/thời-lượng, nên cả bộ đệm
tuần hoàn chính xác ở mức mẫu → lặp liền mạch tuyệt đối.

Nhờ vậy spike phân biệt được hai nguyên nhân khe hở hoàn toàn khác nhau:
  - khe hở do thuật toán tìm điểm loop sai, và
  - khe hở do bản thân vật liệu (khoảng đệm bộ mã hoá, im lặng ở cuối).
Khi mẫu thu thật về thì chỉ việc thay tệp, không sửa mã.
"""

from __future__ import annotations

import json
import struct
import wave
from dataclasses import dataclass
from pathlib import Path

import numpy as np

SAMPLE_RATE = 48_000
BED_DURATION = 20.0
OUT_DIR = Path(__file__).resolve().parent.parent / "spike" / "audio"


def periodic_bed(
    duration: float,
    seed: int,
    low_hz: float,
    high_hz: float,
    tilt: float = 1.2,
    peak: float = 0.5,
) -> np.ndarray:
    """Nền tuần hoàn chính xác, dựng bằng phổ có pha ngẫu nhiên.

    Biên độ giảm theo tần số (tilt) để nghe giống tiếng ồn có màu, không giống
    hợp âm đàn.
    """
    length = int(round(duration * SAMPLE_RATE))
    num_bins = length // 2 + 1
    bin_hz = SAMPLE_RATE / length

    freqs = np.arange(num_bins) * bin_hz
    magnitude = np.zeros(num_bins)
    band = (freqs >= low_hz) & (freqs <= high_hz)
    # Bỏ qua bin 0 (thành phần một chiều) để không lệch đường không.
    magnitude[band] = (freqs[band] / low_hz) ** -tilt

    rng = np.random.default_rng(seed)
    phase = rng.uniform(0, 2 * np.pi, num_bins)
    spectrum = magnitude * np.exp(1j * phase)
    spectrum[0] = 0.0

    samples = np.fft.irfft(spectrum, n=length)
    return normalise(samples, peak)


def amplitude_modulate(
    samples: np.ndarray, duration: float, cycles: int, depth: float = 0.6
) -> np.ndarray:
    """Điều biên bằng tần số cũng là bội nguyên của 1/duration → vẫn tuần hoàn."""
    t = np.arange(len(samples)) / SAMPLE_RATE
    mod_hz = cycles / duration
    envelope = (1 - depth) + depth * (0.5 + 0.5 * np.sin(2 * np.pi * mod_hz * t))
    return samples * envelope


def struck_tone(
    duration: float, partials: list[tuple[float, float]], decay_s: float, peak: float = 0.7
) -> np.ndarray:
    """Âm phát một lần: đánh rồi tắt dần — cho tín hiệu âm và dấu ấn âm thanh."""
    t = np.arange(int(round(duration * SAMPLE_RATE))) / SAMPLE_RATE
    signal = np.zeros_like(t)
    for freq, weight in partials:
        signal += weight * np.sin(2 * np.pi * freq * t)
    signal *= np.exp(-t / decay_s)

    # Vuốt nhỏ ở cuối để không cắt ngang tín hiệu.
    fade = int(0.01 * SAMPLE_RATE)
    signal[-fade:] *= np.linspace(1, 0, fade)
    return normalise(signal, peak)


def normalise(samples: np.ndarray, peak: float) -> np.ndarray:
    largest = np.max(np.abs(samples))
    if largest == 0:
        return samples
    return samples * (peak / largest)


def with_trailing_silence(samples: np.ndarray, silence_s: float) -> np.ndarray:
    """Bản cố tình làm sai: chèn im lặng ở cuối, mô phỏng khoảng đệm của bộ mã hoá MP3."""
    pad = np.zeros(int(round(silence_s * SAMPLE_RATE)))
    return np.concatenate([samples, pad])


def write_wav(path: Path, samples: np.ndarray) -> float:
    pcm = np.clip(samples, -1.0, 1.0)
    pcm = (pcm * 32767).astype("<i2")
    with wave.open(str(path), "wb") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SAMPLE_RATE)
        handle.writeframes(pcm.tobytes())
    return len(samples) / SAMPLE_RATE


@dataclass
class Clip:
    file: str
    note: str
    samples: np.ndarray


def build_clips() -> list[Clip]:
    d = BED_DURATION
    return [
        Clip(
            "bed-traffic.wav",
            "anthrophony / keynote — ồn giao thông, thay cho nền phố cổ",
            periodic_bed(d, seed=1001, low_hz=40, high_hz=4000, tilt=1.5, peak=0.45),
        ),
        Clip(
            "bed-water.wav",
            "geophony / keynote — nước chảy",
            amplitude_modulate(
                periodic_bed(d, seed=2002, low_hz=300, high_hz=9000, tilt=0.7, peak=0.40),
                d,
                cycles=7,
                depth=0.35,
            ),
        ),
        Clip(
            "bed-cicada.wav",
            "biophony / keynote — tiếng ve",
            amplitude_modulate(
                periodic_bed(d, seed=3003, low_hz=3800, high_hz=5600, tilt=0.4, peak=0.30),
                d,
                cycles=120,
                depth=0.80,
            ),
        ),
        Clip(
            "bed-wind.wav",
            "geophony / keynote — gió",
            amplitude_modulate(
                periodic_bed(d, seed=4004, low_hz=60, high_hz=1200, tilt=1.1, peak=0.42),
                d,
                cycles=3,
                depth=0.50,
            ),
        ),
        Clip(
            "bed-market.wav",
            "anthrophony / keynote — rì rầm chợ",
            amplitude_modulate(
                periodic_bed(d, seed=5005, low_hz=150, high_hz=3500, tilt=1.0, peak=0.40),
                d,
                cycles=19,
                depth=0.30,
            ),
        ),
        Clip(
            "bed-temple.wav",
            "anthrophony / keynote — nền sân chùa",
            periodic_bed(d, seed=6006, low_hz=80, high_hz=2400, tilt=1.3, peak=0.35),
        ),
        Clip(
            "signal-bell.wav",
            "anthrophony / signal — chuông",
            struck_tone(
                3.0,
                [(523.25, 1.0), (1046.5, 0.55), (1567.98, 0.30), (2093.0, 0.18)],
                decay_s=0.9,
            ),
        ),
        Clip(
            "signal-cry.wav",
            "anthrophony / signal — thay cho tiếng rao",
            struck_tone(2.0, [(320.0, 1.0), (640.0, 0.40), (1180.0, 0.25)], decay_s=0.6),
        ),
        Clip(
            "mark-gong.wav",
            "anthrophony / soundmark — thay cho cồng chiêng",
            struck_tone(
                6.0,
                [(196.0, 1.0), (233.08, 0.70), (392.0, 0.45), (587.33, 0.25), (880.0, 0.12)],
                decay_s=2.4,
            ),
        ),
    ]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    clips = build_clips()
    manifest = []

    for clip in clips:
        seconds = write_wav(OUT_DIR / clip.file, clip.samples)
        manifest.append({"file": clip.file, "note": clip.note, "seconds": round(seconds, 3)})
        print(f"  {clip.file:<26} {seconds:6.2f}s  {clip.note}")

    traffic = next(c for c in clips if c.file == "bed-traffic.wav")
    bad = with_trailing_silence(traffic.samples, 0.08)
    seconds = write_wav(OUT_DIR / "bed-traffic-BAD-LOOP.wav", bad)
    manifest.append(
        {
            "file": "bed-traffic-BAD-LOOP.wav",
            "note": "ĐỐI CHỨNG — thêm 80ms im lặng ở cuối, mô phỏng khoảng đệm bộ mã hoá",
            "seconds": round(seconds, 3),
        }
    )
    print(f"  {'bed-traffic-BAD-LOOP.wav':<26} {seconds:6.2f}s  (đối chứng có khe hở)")

    (OUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    total_mb = sum(f.stat().st_size for f in OUT_DIR.glob("*.wav")) / 1e6
    print(f"\n{len(manifest)} tệp, {total_mb:.1f} MB trong {OUT_DIR}")


if __name__ == "__main__":
    main()
