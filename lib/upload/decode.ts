import { validateImageFile, UploadValidationError } from "./validate";

export { UploadValidationError };

/**
 * Decode an image file to a drawable source (first frame for animated GIF).
 */
export async function decodeImageFile(file: File): Promise<HTMLImageElement> {
  validateImageFile(file);

  const url = URL.createObjectURL(file);
  try {
    const image = await loadImageElement(url);
    if (image.naturalWidth < 1 || image.naturalHeight < 1) {
      throw new UploadValidationError(
        "Could not read that image. Try another JPG, PNG, WebP, or GIF.",
        "empty",
      );
    }
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => {
      reject(
        new UploadValidationError(
          "Could not read that image. Try another JPG, PNG, WebP, or GIF.",
          "type",
        ),
      );
    };
    image.src = src;
  });
}
