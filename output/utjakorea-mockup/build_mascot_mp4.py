from pathlib import Path
import sys

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageSequence

source = Path(sys.argv[1])
target = Path(sys.argv[2])
fps = 20
frame_count = 4 * fps
source_frame_duration = 0.1

with Image.open(source) as gif:
    source_frames = [frame.convert("RGB").copy() for frame in ImageSequence.Iterator(gif)]

if not source_frames:
    raise SystemExit("No GIF frames found")

width = source_frames[0].width
height = source_frames[0].height
output_height = height if height % 2 == 0 else height + 1

with imageio.get_writer(
    target,
    fps=fps,
    codec="libx264",
    quality=8,
    pixelformat="yuv420p",
    ffmpeg_params=["-movflags", "+faststart"],
) as writer:
    for index in range(frame_count):
        source_index = min(int((index / fps) / source_frame_duration), len(source_frames) - 1)
        frame = source_frames[source_index]
        canvas = Image.new("RGB", (width, output_height), "white")
        canvas.paste(frame, (0, 0))
        writer.append_data(np.asarray(canvas))

print(f"created={target}")
print(f"duration=4.0 fps={fps} frames={frame_count} size={width}x{output_height}")
