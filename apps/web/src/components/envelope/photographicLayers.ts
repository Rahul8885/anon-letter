import type { TemplateId } from "@anonletter/shared";

type Rect = readonly [number, number, number, number];

export interface Stationery {
  action: string;
  released: string;
  gesture: "ribbon" | "wax" | "thread" | "band" | "tape";
  hotspot: Rect;
  patches: readonly Rect[];
  flap: string;
  hinge: number;
  bounds: Rect;
  stock: Rect;
}

export const STATIONERY: Record<TemplateId, Stationery> = {
  "soft-bloom": {
    action: "Untie the ribbon",
    released: "The ribbon is loose. Lift the flap.",
    gesture: "ribbon",
    hotspot: [0.25, 0.36, 0.28, 0.25],
    patches: [
      [0.352, 0.105, 0.048, 0.792],
      [0.051, 0.439, 0.897, 0.075],
      [0.21, 0.367, 0.2, 0.16],
      [0.2, 0.51, 0.2, 0.23],
      [0.37, 0.49, 0.19, 0.25],
    ],
    flap: "M .054 .105 L .948 .105 C .935 .252 .793 .312 .59 .541 C .527 .617 .505 .643 .455 .61 C .35 .535 .224 .342 .128 .29 C .075 .241 .054 .174 .054 .105 Z",
    hinge: 0.105,
    bounds: [0.054, 0.105, 0.894, 0.787],
    stock: [0.52, 0.17, 0.14, 0.09],
  },
  "old-letter": {
    action: "Break the wax seal",
    released: "The seal is broken. Lift the flap.",
    gesture: "wax",
    hotspot: [0.435, 0.48, 0.13, 0.18],
    patches: [[0.432, 0.482, 0.13, 0.166]],
    flap: "M .048 .116 L .956 .116 C .95 .193 .903 .223 .852 .266 L .51 .576 C .478 .598 .458 .584 .434 .567 L .118 .285 C .062 .239 .049 .19 .048 .116 Z",
    hinge: 0.116,
    bounds: [0.048, 0.116, 0.908, 0.764],
    stock: [0.31, 0.17, 0.24, 0.12],
  },
  "night-thought": {
    action: "Unwind the thread",
    released: "The thread is free. Lift the flap.",
    gesture: "thread",
    hotspot: [0.448, 0.265, 0.108, 0.45],
    patches: [
      [0.442, 0.263, 0.117, 0.389],
      [0.477, 0.59, 0.035, 0.213],
    ],
    flap: "M .042 .111 L .957 .111 L .95 .407 Q .949 .424 .937 .425 L .064 .425 Q .054 .426 .05 .411 Z",
    hinge: 0.111,
    bounds: [0.042, 0.111, 0.915, 0.77],
    stock: [0.64, 0.16, 0.2, 0.19],
  },
  "quiet-garden": {
    action: "Slide off the band",
    released: "The band is off. Lift the flap.",
    gesture: "band",
    hotspot: [0.57, 0.147, 0.161, 0.71],
    patches: [[0.57, 0.145, 0.162, 0.709]],
    flap: "M .055 .148 L .946 .148 C .924 .285 .849 .351 .765 .416 L .64 .555 Q .622 .584 .599 .584 L .375 .584 Q .35 .583 .326 .553 L .151 .35 C .091 .285 .064 .22 .055 .148 Z",
    hinge: 0.148,
    bounds: [0.055, 0.145, 0.891, 0.716],
    stock: [0.3, 0.19, 0.18, 0.17],
  },
  "confetti-love": {
    action: "Peel back the tape",
    released: "The tape is peeled away. Lift the flap.",
    gesture: "tape",
    hotspot: [0.274, 0.43, 0.25, 0.19],
    patches: [[0.279, 0.432, 0.251, 0.186]],
    flap: "M .05 .1 L .951 .1 C .932 .19 .902 .228 .852 .256 L .369 .596 Q .346 .624 .326 .604 L .117 .302 C .073 .235 .056 .176 .05 .1 Z",
    hinge: 0.1,
    bounds: [0.05, 0.1, 0.901, 0.783],
    stock: [0.49, 0.17, 0.2, 0.15],
  },
};

export type PhotoLayer =
  | "interior"
  | "pocket"
  | "flap"
  | "flap-inner"
  | "closure-left"
  | "closure-right";

interface Layers {
  image: HTMLImageElement;
  canvases: Record<PhotoLayer, HTMLCanvasElement>;
}

const cache = new Map<TemplateId, Promise<Layers>>();

function canvas(width: number, height: number) {
  const element = document.createElement("canvas");
  element.width = width;
  element.height = height;
  return element;
}

/**
 * Lift fasteners from the existing photograph in memory. Nearby stock supplies
 * lighting; a clear patch of the same paper supplies grain. No raster files.
 */
function liftClosure(image: HTMLCanvasElement, stationery: Stationery) {
  const width = image.width;
  const height = image.height;
  const clean = canvas(width, height);
  const context = clean.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Photographic layers are unavailable.");
  context.drawImage(image, 0, 0);
  const original = context.getImageData(0, 0, width, height);
  const restored = new ImageData(new Uint8ClampedArray(original.data), width, height);
  const mask = new Uint8Array(width * height);
  const feather = new Float32Array(width * height);
  const [bx, by, bw, bh] = stationery.bounds;

  for (const [left, top, rectWidth, rectHeight] of stationery.patches) {
    for (
      let y = Math.max(0, Math.floor(top * height) - 16);
      y < Math.min(height, Math.ceil((top + rectHeight) * height) + 16);
      y += 1
    ) {
      for (
        let x = Math.max(0, Math.floor(left * width) - 16);
        x < Math.min(width, Math.ceil((left + rectWidth) * width) + 16);
        x += 1
      ) {
        const distance = Math.max(
          0,
          left * width - x,
          x - (left + rectWidth) * width,
          top * height - y,
          y - (top + rectHeight) * height,
        );
        mask[y * width + x] = 1;
        feather[y * width + x] = Math.max(feather[y * width + x], Math.max(0, 1 - distance / 16));
      }
    }
  }

  const flapMask = canvas(width, height);
  const flapContext = flapMask.getContext("2d");
  if (!flapContext) throw new Error("Photographic layers are unavailable.");
  flapContext.scale(width, height);
  flapContext.fill(new Path2D(stationery.flap));
  const material = flapContext.getImageData(0, 0, width, height).data;
  const isInside = (x: number, y: number) =>
    x >= bx * width && x < (bx + bw) * width && y >= by * height && y < (by + bh) * height;
  const average = (x: number, y: number, channel: number) => {
    let total = 0;
    let count = 0;
    for (let dy = -3; dy <= 3; dy += 2) {
      for (let dx = -3; dx <= 3; dx += 2) {
        const sx = Math.max(0, Math.min(width - 1, Math.round(x + dx)));
        const sy = Math.max(0, Math.min(height - 1, Math.round(y + dy)));
        total += original.data[(sy * width + sx) * 4 + channel];
        count += 1;
      }
    }
    return total / count;
  };
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-0.7, -0.7],
    [0.7, -0.7],
    [-0.7, 0.7],
    [0.7, 0.7],
  ];
  const [tx, ty, tw, th] = stationery.stock;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = y * width + x;
      if (!mask[at]) continue;
      if (!isInside(x, y)) {
        restored.data[at * 4 + 3] = 0;
        continue;
      }
      const part = material[at * 4 + 3] > 127;
      const samples: [number, number, number][] = [];
      for (const [dx, dy] of directions) {
        for (let distance = 18; distance < 350; distance += 10) {
          const sx = Math.round(x + dx * distance);
          const sy = Math.round(y + dy * distance);
          if (!isInside(sx, sy)) break;
          const sampleAt = sy * width + sx;
          if (mask[sampleAt] || material[sampleAt * 4 + 3] > 127 !== part) continue;
          // Leave the fastener's cast shadow behind as well.
          const farX = Math.round(sx + dx * 12);
          const farY = Math.round(sy + dy * 12);
          if (!isInside(farX, farY) || mask[farY * width + farX]) continue;
          samples.push([farX, farY, 1 / (distance * distance)]);
          break;
        }
      }
      const grainX = Math.floor(tx * width) + (x % Math.max(1, Math.floor(tw * width)));
      const grainY = Math.floor(ty * height) + (y % Math.max(1, Math.floor(th * height)));
      for (let channel = 0; channel < 3; channel += 1) {
        let total = 0;
        let weight = 0;
        for (const [sx, sy, amount] of samples) {
          total += average(sx, sy, channel) * amount;
          weight += amount;
        }
        const grain =
          original.data[(grainY * width + grainX) * 4 + channel] - average(grainX, grainY, channel);
        const replacement =
          (weight ? total / weight : average(grainX, grainY, channel)) + grain * 0.8;
        restored.data[at * 4 + channel] =
          replacement * feather[at] + original.data[at * 4 + channel] * (1 - feather[at]);
      }
      restored.data[at * 4 + 3] =
        stationery.gesture === "band"
          ? original.data[(y * width + Math.floor(width * 0.2)) * 4 + 3]
          : 255;
    }
  }
  context.putImageData(restored, 0, 0);
  // Soften sampling boundaries, then return photographed grain to the repair.
  const smooth = canvas(width, height);
  const smoothContext = smooth.getContext("2d");
  if (!smoothContext) throw new Error("Photographic layers are unavailable.");
  smoothContext.filter = "blur(8px)";
  smoothContext.drawImage(clean, 0, 0);
  const softened = smoothContext.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const at = y * width + x;
      if (!mask[at] || !isInside(x, y)) continue;
      const gx = Math.floor(tx * width) + (x % Math.max(1, Math.floor(tw * width)));
      const gy = Math.floor(ty * height) + (y % Math.max(1, Math.floor(th * height)));
      for (let channel = 0; channel < 3; channel += 1) {
        const grain = original.data[(gy * width + gx) * 4 + channel] - average(gx, gy, channel);
        restored.data[at * 4 + channel] =
          (softened.data[at * 4 + channel] + grain * 0.6) * feather[at] +
          original.data[at * 4 + channel] * (1 - feather[at]);
      }
    }
  }
  context.putImageData(restored, 0, 0);
  return { clean, original, mask };
}

function applyFlap(
  context: CanvasRenderingContext2D,
  stationery: Stationery,
  width: number,
  height: number,
) {
  context.scale(width, height);
  context.clip(new Path2D(stationery.flap));
  context.setTransform(1, 0, 0, 1, 0, 0);
}

async function buildLayers(mood: TemplateId): Promise<Layers> {
  const image = new Image();
  image.src = `/assets/letter-world/${mood}.webp`;
  await image.decode();
  const width = Math.min(720, image.naturalWidth);
  const height = Math.round((image.naturalHeight * width) / image.naturalWidth);
  const workingPhoto = canvas(width, height);
  workingPhoto.getContext("2d")?.drawImage(image, 0, 0, width, height);
  const stationery = STATIONERY[mood];
  const { clean, original, mask } = liftClosure(workingPhoto, stationery);
  const canvases = {} as Layers["canvases"];

  for (const name of ["interior", "pocket", "flap", "flap-inner"] as const) {
    const layer = canvas(width, height);
    const context = layer.getContext("2d");
    if (!context) throw new Error("Photographic layers are unavailable.");
    if (name === "interior" || name === "flap-inner") {
      if (name === "flap-inner") applyFlap(context, stationery, width, height);
      context.drawImage(clean, 0, 0);
      const [sx, sy, sw, sh] = stationery.stock;
      const stock = canvas(Math.floor(sw * width), Math.floor(sh * height));
      stock
        .getContext("2d")
        ?.drawImage(
          clean,
          sx * width,
          sy * height,
          sw * width,
          sh * height,
          0,
          0,
          stock.width,
          stock.height,
        );
      const seamless = canvas(stock.width * 2, stock.height * 2);
      const tile = seamless.getContext("2d");
      if (tile) {
        for (const flipX of [false, true]) {
          for (const flipY of [false, true]) {
            tile.setTransform(
              flipX ? -1 : 1,
              0,
              0,
              flipY ? -1 : 1,
              flipX ? seamless.width : 0,
              flipY ? seamless.height : 0,
            );
            tile.drawImage(stock, 0, 0);
          }
        }
      }
      const pattern = context.createPattern(seamless, "repeat");
      if (pattern) {
        context.globalCompositeOperation = "source-in";
        context.filter = name === "interior" ? "brightness(.72)" : "brightness(.94)";
        context.fillStyle = pattern;
        context.fillRect(0, 0, width, height);
      }
    } else if (name === "flap") {
      applyFlap(context, stationery, width, height);
      context.drawImage(clean, 0, 0);
    } else {
      context.drawImage(clean, 0, 0);
      context.save();
      context.globalCompositeOperation = "destination-out";
      context.scale(width, height);
      context.fill(new Path2D(stationery.flap));
      context.restore();
    }
    canvases[name] = layer;
  }

  const center = stationery.hotspot[0] + stationery.hotspot[2] / 2;
  for (const name of ["closure-left", "closure-right"] as const) {
    const layer = canvas(width, height);
    const context = layer.getContext("2d");
    if (!context) throw new Error("Photographic layers are unavailable.");
    const pixels = new ImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const at = y * width + x;
        if (!mask[at]) continue;
        // A small irregular split makes wax crack; the other materials release
        // along their knot/band/peel direction instead of exploding into particles.
        const split = center + (stationery.gesture === "wax" ? Math.sin(y * 0.13) * 0.006 : 0);
        if (x / width < split !== (name === "closure-left")) continue;
        const i = at * 4;
        pixels.data.set(original.data.subarray(i, i + 4), i);
      }
    }
    context.putImageData(pixels, 0, 0);
    canvases[name] = layer;
  }
  return { image, canvases };
}

export function photoLayers(mood: TemplateId) {
  let layers = cache.get(mood);
  if (!layers) {
    layers = buildLayers(mood).catch((error) => {
      cache.delete(mood);
      throw error;
    });
    if (cache.size >= 2) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(mood, layers);
  }
  return layers;
}
