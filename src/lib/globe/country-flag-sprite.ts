import * as THREE from "three";
import { countryFlagUrl } from "@/lib/country-flag-url";

export type GlobeCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
};

const TEXTURE_SIZE = 64;
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
      /* fallback canvas already set */
    });

  return texture;
}

export async function preloadRoundFlagTextures(codes: string[]): Promise<void> {
  await Promise.all(
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

/** sizeAttenuation:false → ekranda sabit piksel, uzakta küçülmez */
export function markerSizeForAltitude(altitude: number): number {
  return Math.round(Math.min(28, Math.max(20, 16 + altitude * 3)));
}

export function applyFlagSpriteSize(sprite: THREE.Sprite, sizePx: number, selected = false) {
  const scale = selected ? sizePx * 1.12 : sizePx;
  sprite.scale.set(scale, scale, 1);
  sprite.userData.selected = selected;
}

export function createFlagSprite(countryCode: string, sizePx: number): THREE.Sprite {
  const key = countryCode.toUpperCase();
  const material = new THREE.SpriteMaterial({
    map: getRoundFlagTexture(key),
    sizeAttenuation: false,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  sprite.center.set(0.5, 0.5);
  sprite.renderOrder = 10;
  sprite.userData = { countryCode: key, isFlagMarker: true };
  applyFlagSpriteSize(sprite, sizePx, false);
  return sprite;
}

export function updateAllFlagSprites(
  scene: THREE.Scene,
  options: { altitude: number; selectedCode?: string },
) {
  const sizePx = markerSizeForAltitude(options.altitude);
  const selected = options.selectedCode?.toUpperCase();

  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Sprite) || !obj.userData?.isFlagMarker) return;
    applyFlagSpriteSize(obj, sizePx, obj.userData.countryCode === selected);
  });
}
