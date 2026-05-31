import * as THREE from "three";
import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
};

const TEXTURE_SIZE = 64;
/** Küre yarıçapına (~100) göre okunabilir yuvarlak bayrak */
const DISC_RADIUS = 2.2;

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

function getRoundFlagTexture(countryCode: string): THREE.Texture {
  const key = countryCode.toUpperCase();
  let texture = textureCache.get(key);
  if (texture) return texture;

  const canvas = drawRoundFlagCanvas(null, key);
  texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, texture);

  loadImage(countryFlagUrl(key, 80))
    .then((img) => {
      const nextCanvas = drawRoundFlagCanvas(img, key);
      texture!.image = nextCanvas;
      texture!.needsUpdate = true;
    })
    .catch(() => {
      /* turuncu fallback canvas */
    });

  return texture;
}

export async function preloadRoundFlagTextures(codes: string[]): Promise<void> {
  await Promise.allSettled(
    codes.map(async (code) => {
      const key = code.toUpperCase();
      if (textureCache.has(key)) return;

      let img: HTMLImageElement | null = null;
      try {
        img = await loadImage(countryFlagUrl(key, 80));
      } catch {
        img = null;
      }

      const canvas = drawRoundFlagCanvas(img, key);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(key, texture);
    }),
  );
}

export function createFlagDiscObject(countryCode: string): THREE.Mesh {
  const key = countryCode.toUpperCase();
  const geometry = new THREE.CircleGeometry(DISC_RADIUS, 32);
  const material = new THREE.MeshBasicMaterial({
    map: getRoundFlagTexture(key),
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 5;
  return mesh;
}
