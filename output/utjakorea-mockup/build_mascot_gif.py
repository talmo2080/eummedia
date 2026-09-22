from pathlib import Path
import sys
from PIL import Image

frames_dir = Path(sys.argv[1])
output_path = Path(sys.argv[2])
frames = []

for path in sorted(frames_dir.glob("frame-*.png")):
    image = Image.open(path).convert("RGB")
    image.thumbnail((1000, 1000), Image.Resampling.LANCZOS)
    frames.append(image.copy())

if not frames:
    raise SystemExit("No frames found")

frames[0].save(
    output_path,
    save_all=True,
    append_images=frames[1:],
    duration=100,
    loop=0,
    optimize=True,
)

print(f"created={output_path}")
print(f"frames={len(frames)} size={frames[0].size}")
