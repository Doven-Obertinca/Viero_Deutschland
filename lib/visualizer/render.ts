import { inversePlane } from "./geometry";
import { loadImage } from "./image";
import type { Material, Point, Wall } from "./model";

function surface(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d", { willReadFrequently: true })!;
}

function polygon(context: CanvasRenderingContext2D, points: Point[]) {
  points.forEach(([x, y], index) => {
    const position = [
      x * context.canvas.width,
      y * context.canvas.height,
    ] as const;
    if (index === 0) context.moveTo(...position);
    else context.lineTo(...position);
  });
  context.closePath();
}

export function wallMask(wall: Wall, width: number, height: number) {
  const context = surface(width, height);
  context.beginPath();
  polygon(context, wall.outline);
  wall.holes?.forEach((hole) => polygon(context, hole));
  context.fill("evenodd");
  context.lineCap = "round";
  context.lineJoin = "round";
  for (const stroke of wall.strokes) {
    const size = stroke.size * Math.min(width, height);
    context.globalCompositeOperation = stroke.erase
      ? "destination-out"
      : "source-over";
    context.lineWidth = size;
    context.beginPath();
    stroke.points.forEach(([x, y], index) =>
      index === 0
        ? context.moveTo(x * width, y * height)
        : context.lineTo(x * width, y * height),
    );
    context.stroke();
    context.beginPath();
    const [x, y] = stroke.points[0];
    context.arc(x * width, y * height, size / 2, 0, 2 * Math.PI);
    context.fill();
  }
  return context;
}

const textures = new Map<string, Promise<ImageData>>();
function textureFor(
  url: string,
  crop: NonNullable<Material["photoSample"]>["crop"] = [0, 0, 1, 1],
) {
  const key = `${url}:${crop.join(",")}`;
  let texture = textures.get(key);
  if (!texture) {
    texture = loadImage(url)
      .then((image) => {
        const [x, y, w, h] = crop;
        const width = image.width * w;
        const height = image.height * h;
        const context = surface(
          Math.max(1, Math.min(768, Math.round(width))),
          Math.max(1, Math.min(768, Math.round(height))),
        );
        context.drawImage(
          image,
          image.width * x,
          image.height * y,
          width,
          height,
          0,
          0,
          context.canvas.width,
          context.canvas.height,
        );
        return context.getImageData(
          0,
          0,
          context.canvas.width,
          context.canvas.height,
        );
      })
      .catch((error) => {
        textures.delete(key);
        throw error;
      });
    if (textures.size >= 12) textures.delete(textures.keys().next().value!);
    textures.set(key, texture);
  }
  return texture;
}

export function createRenderer(photo: HTMLImageElement, maxSide: number) {
  const ratio = Math.min(1, maxSide / Math.max(photo.width, photo.height));
  const width = Math.max(1, Math.round(photo.width * ratio));
  const height = Math.max(1, Math.round(photo.height * ratio));
  const original = surface(width, height);
  original.drawImage(photo, 0, 0, width, height);
  const source = original.getImageData(0, 0, width, height);
  // Low-frequency luminance retains room shading and soft shadows while
  // reducing the visibility of the original finish's grain.
  const light = surface(
    Math.max(1, Math.round(width / 6)),
    Math.max(1, Math.round(height / 6)),
  );
  light.drawImage(
    original.canvas,
    0,
    0,
    light.canvas.width,
    light.canvas.height,
  );
  const shading = surface(width, height);
  shading.drawImage(light.canvas, 0, 0, width, height);
  const lighting = shading.getImageData(0, 0, width, height).data;
  const maskCache = new Map<
    string,
    {
      outline: Wall["outline"];
      holes: Wall["holes"];
      strokes: Wall["strokes"];
      pixels: Uint8ClampedArray;
    }
  >();

  async function render(
    walls: Wall[],
    materials: Material[],
    { watermark = false, markStudies = false } = {},
  ) {
    const output = surface(width, height);
    const image = output.createImageData(width, height);
    image.data.set(source.data);
    for (const wall of walls) {
      const material = materials.find((item) => item.id === wall.material);
      if (
        !material ||
        (!material.texture &&
          !material.photoSample &&
          !material.id.startsWith("study-"))
      )
        continue;
      const matrix = inversePlane(wall.plane);
      if (!matrix) continue;
      const texture = material.texture
        ? await textureFor(material.texture)
        : material.photoSample
          ? await textureFor(
              material.photoSample.src,
              material.photoSample.crop,
            )
          : null;
      let cached = maskCache.get(wall.id);
      if (
        !cached ||
        cached.outline !== wall.outline ||
        cached.holes !== wall.holes ||
        cached.strokes !== wall.strokes
      ) {
        const mask = wallMask(wall, width, height);
        cached = {
          outline: wall.outline,
          holes: wall.holes,
          strokes: wall.strokes,
          pixels: mask.getImageData(0, 0, width, height).data,
        };
        maskCache.set(wall.id, cached);
      }
      const mask = cached.pixels;
      const angle = (wall.rotation * Math.PI) / 180,
        cos = Math.cos(angle),
        sin = Math.sin(angle);
      const hex = material.pigment || "#b8a389";
      const color = [1, 3, 5].map((index) =>
        parseInt(hex.slice(index, index + 2), 16),
      );
      let sum = 0,
        count = 0;
      for (let i = 3; i < mask.length; i += 36)
        if (mask[i] > 200) {
          sum += luminance(lighting, i - 3);
          count++;
        }
      const reference = Math.max(28, sum / Math.max(count, 1));
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const alpha = (mask[i + 3] / 255) * wall.intensity;
          if (!alpha) continue;
          const px = (x + 0.5) / width,
            py = (y + 0.5) / height;
          const divisor = matrix[6] * px + matrix[7] * py + matrix[8];
          if (Math.abs(divisor) < 1e-9) continue;
          const u = (matrix[0] * px + matrix[1] * py + matrix[2]) / divisor;
          const v = (matrix[3] * px + matrix[4] * py + matrix[5]) / divisor;
          const tx = (u * cos - v * sin) / wall.scale;
          const ty = (u * sin + v * cos) / wall.scale;
          const grain = texture
            ? 0
            : 11 * Math.sin(ty * 98 + 2 * Math.sin(tx * 24)) +
              7 * Math.sin(tx * 33 + ty * 61) +
              5 * Math.sin(tx * 149 - ty * 211);
          const textureIndex = texture
            ? 4 *
              (mirror(ty * 2, texture.height) * texture.width +
                mirror(tx * 2, texture.width))
            : 0;
          const illumination = Math.max(
            0.18,
            Math.min(1.65, luminance(lighting, i) / reference),
          );
          for (let channel = 0; channel < 3; channel++) {
            const pigment = texture
              ? texture.data[textureIndex + channel]
              : color[channel] + grain;
            const shaded = Math.min(255, pigment * illumination);
            image.data[i + channel] +=
              (shaded - image.data[i + channel]) * alpha;
          }
        }
    }
    output.putImageData(image, 0, 0);
    const usesStudy =
      markStudies && walls.some((wall) => wall.material?.startsWith("study-"));
    const usesPhotoSample =
      markStudies &&
      walls.some((wall) =>
        materials.some(
          (item) =>
            item.id === wall.material && item.photoSample && !item.texture,
        ),
      );
    if (watermark || usesStudy || usesPhotoSample) {
      const size = Math.max(14, Math.round(width * 0.027));
      output.font = `bold ${size}px sans-serif`;
      output.textAlign = "right";
      output.fillStyle = "#2d2926";
      const label = usesPhotoSample
        ? watermark
          ? "VIERO STUDIO · FOTOVORSCHAU"
          : "FOTOVORSCHAU"
        : usesStudy
          ? watermark
            ? "VIERO STUDIO · STRUKTURSTUDIE"
            : "STRUKTURSTUDIE"
          : "VIERO DEUTSCHLAND";
      const labelWidth = output.measureText(label).width;
      output.fillRect(
        width - labelWidth - size * 1.8,
        height - size * 2.3,
        labelWidth + size,
        size * 1.6,
      );
      output.fillStyle = "#fff";
      output.fillText(label, width - size * 1.3, height - size * 1.15);
    }
    return output.canvas;
  }
  return { original: original.canvas, render };
}

function luminance(bytes: Uint8ClampedArray, index: number) {
  return (
    0.2126 * bytes[index] +
    0.7152 * bytes[index + 1] +
    0.0722 * bytes[index + 2]
  );
}

function mirror(value: number, size: number) {
  const cycle = ((value % 2) + 2) % 2;
  return Math.min(size - 1, Math.floor((cycle < 1 ? cycle : 2 - cycle) * size));
}
