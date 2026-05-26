/** Relative luminance (sRGB) in 0..1. */
export function rgbToLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Build a row-major luminance buffer from ImageData (0..1). */
export function imageDataToLuminance(image: ImageData): Float32Array {
  const { width, height, data } = image;
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      out[y * width + x] = rgbToLuminance(
        data[i]! / 255,
        data[i + 1]! / 255,
        data[i + 2]! / 255,
      );
    }
  }
  return out;
}

export function luminanceAt(
  buffer: Float32Array,
  width: number,
  x: number,
  y: number,
): number {
  const px = Math.max(0, Math.min(width - 1, x));
  const py = Math.max(0, Math.min(buffer.length / width - 1, y));
  return buffer[py * width + px]!;
}
