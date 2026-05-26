/** Minimal ImageData shape for Node tests (no DOM required). */
export interface ImageDataLike {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

export function asImageData(image: ImageDataLike): ImageData {
  return image as unknown as ImageData;
}
