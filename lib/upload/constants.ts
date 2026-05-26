/** Maximum upload size (locked decision #11). */
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const MAX_UPLOAD_LABEL = "15 MB";

/** Pixels per character cell in the working image (~2× grid sampling resolution). */
export const PIXELS_PER_CELL_AXIS = 2;

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AcceptedImageMimeType = (typeof ACCEPTED_IMAGE_MIME_TYPES)[number];

export const ACCEPTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

export const ACCEPTED_FILE_INPUT =
  "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif";
