import { describe, expect, it } from "vitest";

import { MAX_UPLOAD_BYTES } from "../constants";
import { UploadValidationError, validateImageFile } from "../validate";

function file(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateImageFile", () => {
  it("accepts common image types", () => {
    expect(() =>
      validateImageFile(file("photo.jpg", "image/jpeg", 1024)),
    ).not.toThrow();
    expect(() =>
      validateImageFile(file("photo.png", "image/png", 1024)),
    ).not.toThrow();
    expect(() =>
      validateImageFile(file("photo.webp", "image/webp", 1024)),
    ).not.toThrow();
    expect(() =>
      validateImageFile(file("anim.gif", "image/gif", 1024)),
    ).not.toThrow();
  });

  it("rejects oversize files with a friendly message", () => {
    expect(() =>
      validateImageFile(file("big.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1)),
    ).toThrow(UploadValidationError);
    try {
      validateImageFile(file("big.jpg", "image/jpeg", MAX_UPLOAD_BYTES + 1));
    } catch (error) {
      expect(error).toMatchObject({ code: "size" });
      expect((error as Error).message).toContain("15 MB");
    }
  });

  it("rejects unsupported mime types", () => {
    expect(() =>
      validateImageFile(file("doc.pdf", "application/pdf", 1024)),
    ).toThrow(UploadValidationError);
  });

  it("rejects empty files", () => {
    expect(() => validateImageFile(file("empty.png", "image/png", 0))).toThrow(
      UploadValidationError,
    );
  });
});
