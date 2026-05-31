import * as THREE from "three";
import { countryFlagUrl } from "@/lib/country-flag-url";

/** Küre yarıçapına göre (~100) okunabilir bayrak boyutu */
const FLAG_WIDTH = 2.6;
const FLAG_HEIGHT = 1.75;

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, THREE.Texture>();
const meshCache = new Map<string, THREE.Mesh>();

function getCountryFlagTexture(countryCode: string): THREE.Texture {
  const key = countryCode.toLowerCase();
  let texture = textureCache.get(key);
  if (!texture) {
    texture = textureLoader.load(countryFlagUrl(key, 80));
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(key, texture);
  }
  return texture;
}

function buildFlagMesh(countryCode: string): THREE.Mesh {
  const texture = getCountryFlagTexture(countryCode);
  const geometry = new THREE.PlaneGeometry(FLAG_WIDTH, FLAG_HEIGHT);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 2;
  return mesh;
}

export function createCountryFlagObject(countryCode: string): THREE.Object3D {
  const key = countryCode.toLowerCase();
  let mesh = meshCache.get(key);
  if (!mesh) {
    mesh = buildFlagMesh(key);
    meshCache.set(key, mesh);
  }
  return mesh.clone();
}
