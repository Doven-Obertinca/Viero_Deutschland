import { newWall, type Point, type Wall } from "./model";

export const maxUpload = 20 * 1024 * 1024;
export const maxImageSide = 2400;

export function imageFormat(bytes: Uint8Array) {
  const ascii = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpeg";
  if (ascii(0, 8) === "\x89PNG\r\n\x1a\n") return "png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (
    ascii(4, 8) === "ftyp" &&
    /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(ascii(8, 12))
  )
    return "heic";
  return null;
}

export async function normalize(file: File): Promise<Blob> {
  if (!file.size || file.size > maxUpload)
    throw new Error("Bitte wählen Sie ein Foto mit höchstens 20 MB.");
  const format = imageFormat(
    new Uint8Array(await file.slice(0, 16).arrayBuffer()),
  );
  if (!format)
    throw new Error("Bitte wählen Sie ein JPG-, PNG-, WebP- oder HEIC-Foto.");
  const url = URL.createObjectURL(file);
  try {
    const photo = await loadImage(url);
    if (photo.width * photo.height > 48_000_000)
      throw new Error("Das Foto darf höchstens 48 Megapixel haben.");
    const ratio = Math.min(
      1,
      maxImageSide / Math.max(photo.width, photo.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(photo.width * ratio));
    canvas.height = Math.max(1, Math.round(photo.height * ratio));
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(photo, 0, 0, canvas.width, canvas.height);
    return await canvasBlob(canvas, "image/jpeg");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = src;
  return image.decode().then(
    () => image,
    () => {
      throw new Error(
        "Das Bild konnte in diesem Browser nicht geöffnet werden.",
      );
    },
  );
}

export function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Das Bild konnte nicht erstellt werden.")),
      type,
      0.94,
    ),
  );
}

export interface SegmentationProvider {
  detect(image: Blob): Promise<Wall[]>;
}

export const localWallSuggestions: SegmentationProvider = {
  async detect(image) {
    const worker = new Worker("/visualizer/wall-suggestions.js");
    try {
      return await new Promise<Wall[]>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error("Die Analyse hat zu lange gedauert.")),
          6000,
        );
        worker.onmessage = (event: MessageEvent<Point[][] | null>) => {
          clearTimeout(timeout);
          resolve(
            (event.data ?? []).map((points, index) =>
              newWall(String(index + 1).padStart(2, "0"), points),
            ),
          );
        };
        worker.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Die lokale Analyse ist nicht verfügbar."));
        };
        worker.postMessage(image);
      });
    } finally {
      worker.terminate();
    }
  },
};
