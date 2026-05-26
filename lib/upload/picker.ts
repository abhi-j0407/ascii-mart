let openPicker: (() => void) | null = null;

export function registerUploadPicker(open: () => void): () => void {
  openPicker = open;
  return () => {
    if (openPicker === open) {
      openPicker = null;
    }
  };
}

export function openUploadPicker(): void {
  openPicker?.();
}
