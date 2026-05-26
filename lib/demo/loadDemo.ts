import {
  prepareImageUpload,
  type PreparedImage,
} from "@/lib/upload/prepare";

import { DEMO_IMAGE_PATH } from "./constants";

export type DemoImagePayload = PreparedImage;

/**
 * Fetch and prepare the bundled demo image (same path as user uploads).
 */
export async function loadDemoImage(
  density: number,
): Promise<DemoImagePayload> {
  const response = await fetch(DEMO_IMAGE_PATH, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error("Could not load the demo image.");
  }

  const blob = await response.blob();
  const file = new File([blob], "macaw.jpg", {
    type: blob.type || "image/jpeg",
  });

  return prepareImageUpload(file, density);
}
