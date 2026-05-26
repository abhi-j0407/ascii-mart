import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  type AcceptedImageMimeType,
} from "./constants";

export class UploadValidationError extends Error {
  readonly code: "size" | "type" | "empty";

  constructor(
    message: string,
    code: "size" | "type" | "empty",
  ) {
    super(message);
    this.name = "UploadValidationError";
    this.code = code;
  }
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  if (dot < 0) {
    return "";
  }
  return name.slice(dot).toLowerCase();
}

function isAcceptedMime(mime: string): mime is AcceptedImageMimeType {
  return (ACCEPTED_IMAGE_MIME_TYPES as readonly string[]).includes(mime);
}

function isAcceptedExtension(name: string): boolean {
  const ext = extensionOf(name);
  return (ACCEPTED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
}

export function validateImageFile(file: File): void {
  if (file.size === 0) {
    throw new UploadValidationError(
      "That file is empty. Choose a JPG, PNG, WebP, or GIF image.",
      "empty",
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError(
      `Image must be ${MAX_UPLOAD_LABEL} or smaller (this file is ${formatBytes(file.size)}).`,
      "size",
    );
  }

  const mime = file.type.toLowerCase();
  if (mime && !isAcceptedMime(mime)) {
    throw new UploadValidationError(
      "Unsupported format. Use JPG, PNG, WebP, or GIF.",
      "type",
    );
  }

  if (!mime && !isAcceptedExtension(file.name)) {
    throw new UploadValidationError(
      "Unsupported format. Use JPG, PNG, WebP, or GIF.",
      "type",
    );
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
}
