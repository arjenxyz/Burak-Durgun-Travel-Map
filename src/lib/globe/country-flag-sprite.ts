import * as THREE from "three";
import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
  locked?: boolean;
};

const TEXTURE_SIZE = 64;
/** Küre yarıçapına (~100) göre okunabilir yuvarlak bayrak */
const DISC_RADIUS = 1.85;
const LOCKED_DISC_RADIUS = 1.45;

const textureCache = new Map<string, THREE.Texture>();

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawRoundFlagCanvas(img: HTMLImageElement | null, code: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;
  const ctx = canvas.getContext("2d")!;
  const radius = TEXTURE_SIZE / 2;

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2);
  ctx.clip();

  if (img) {
    ctx.drawImage(img, 4, 4, TEXTURE_SIZE - 8, TEXTURE_SIZE - 8);
  } else {
    ctx.fillStyle = "#f97316";
    ctx.fillRect(4, 4, TEXTURE_SIZE - 8, TEXTURE_SIZE - 8);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(code, radius, radius);
  }

  ctx.restore();
  return canvas;
}

function drawLockIcon(ctx: CanvasRenderingContext2D, center: number, size: number) {
  const bodyW = size * 0.52;
  const bodyH = size * 0.38;
  const bodyX = center - bodyW / 2;
  const bodyY = center + size * 0.02;
  const shackleR = bodyW * 0.34;

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, size * 0.07);
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.arc(center, bodyY - bodyH * 0.15, shackleR, Math.PI, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(bodyX, bodyY - bodyH * 0.05, bodyW, bodyH, bodyW * 0.12);
  ctx.fill();
}

function drawLockedRoundFlagCanvas(img: HTMLImageElement | null, code: string): HTMLCanvasElement {
  const canvas = drawRoundFlagCanvas(img, code);
  const ctx = canvas.getContext("2d")!;
  const radius = TEXTURE_SIZE / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "rgba(9, 9, 11, 0.52)";
  ctx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(radius, radius, radius - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(161, 161, 170, 0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawLockIcon(ctx, radius, TEXTURE_SIZE * 0.34);
  return canvas;
}

function textureCacheKey(countryCode: string, locked: boolean) {
  return locked ? `${countryCode.toUpperCase()}:locked` : countryCode.toUpperCase();
}

function getRoundFlagTexture(countryCode: string, locked = false): THREE.Texture {
  const key = textureCacheKey(countryCode, locked);
  let texture = textureCache.get(key);
  if (texture) return texture;

  const code = countryCode.toUpperCase();
  const canvas = locked ? drawLockedRoundFlagCanvas(null, code) : drawRoundFlagCanvas(null, code);
  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);

  loadImage(countryFlagUrl(code, 80))
    .then((img) => {
      const nextCanvas = locked ? drawLockedRoundFlagCanvas(img, code) : drawRoundFlagCanvas(img, code);
      texture!.image = nextCanvas;
      texture!.needsUpdate = true;
    })
    .catch(() => {
      /* turuncu fallback canvas */
    });

  return texture;
}

export async function preloadRoundFlagTextures(
  codes: string[],
  options?: { locked?: boolean },
): Promise<void> {
  const locked = options?.locked ?? false;

  await Promise.allSettled(
    codes.map(async (code) => {
      const key = textureCacheKey(code, locked);
      if (textureCache.has(key)) return;

      const iso = code.toUpperCase();
      let img: HTMLImageElement | null = null;
      try {
        img = await loadImage(countryFlagUrl(iso, 80));
      } catch {
        img = null;
      }

      const canvas = locked ? drawLockedRoundFlagCanvas(img, iso) : drawRoundFlagCanvas(img, iso);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(key, texture);
    }),
  );
}

export function createFlagDiscObject(marker: GlobeCountryMarker | string): THREE.Mesh {
  const countryCode = typeof marker === "string" ? marker : marker.countryCode;
  const locked = typeof marker === "object" && marker.locked === true;
  const key = countryCode.toUpperCase();
  const radius = locked ? LOCKED_DISC_RADIUS : DISC_RADIUS;
  const geometry = new THREE.CircleGeometry(radius, 32);
  const material = new THREE.MeshBasicMaterial({
    map: getRoundFlagTexture(key, locked),
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    opacity: locked ? 0.92 : 1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = locked ? 3 : 5;
  return mesh;
}
