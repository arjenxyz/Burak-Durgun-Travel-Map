import { getMarkerAngularRadius } from "@/lib/globe/country-flag-sprite";

type Vec3 = [number, number, number];

type SpreadableMarker = {
  lat: number;
  lng: number;
  countryCode: string;
  locked?: boolean;
};

const DEG = Math.PI / 180;
const ITERATIONS = 80;
const REPULSION = 1.35;
const PAIR_GAP = 1.75;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function latLngToVec(lat: number, lng: number): Vec3 {
  const phi = lat * DEG;
  const lam = lng * DEG;
  const cosPhi = Math.cos(phi);
  return [cosPhi * Math.cos(lam), Math.sin(phi), cosPhi * Math.sin(lam)];
}

function vecToLatLng([x, y, z]: Vec3): { lat: number; lng: number } {
  return {
    lat: (Math.asin(clamp(y, -1, 1)) * 180) / Math.PI,
    lng: (Math.atan2(z, x) * 180) / Math.PI,
  };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 1e-12) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function geodesicAngle(a: Vec3, b: Vec3): number {
  return Math.acos(clamp(dot(a, b), -1, 1));
}

function rotateAroundAxis(v: Vec3, axis: Vec3, angleRad: number): Vec3 {
  const k = normalize(axis);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const kDotV = dot(k, v);
  const kCrossV = cross(k, v);

  return normalize([
    v[0] * cos + kCrossV[0] * sin + k[0] * kDotV * (1 - cos),
    v[1] * cos + kCrossV[1] * sin + k[1] * kDotV * (1 - cos),
    v[2] * cos + kCrossV[2] * sin + k[2] * kDotV * (1 - cos),
  ]);
}

function tangentToward(from: Vec3, to: Vec3): Vec3 | null {
  const axis = cross(from, to);
  const axisLen = Math.hypot(axis[0], axis[1], axis[2]);
  if (axisLen < 1e-10) return null;

  const unitAxis = [axis[0] / axisLen, axis[1] / axisLen, axis[2] / axisLen] as Vec3;
  let tangent = cross(unitAxis, from);
  const tangentLen = Math.hypot(tangent[0], tangent[1], tangent[2]);
  if (tangentLen < 1e-10) return null;

  tangent = [tangent[0] / tangentLen, tangent[1] / tangentLen, tangent[2] / tangentLen];
  const roughDir = [to[0] - from[0], to[1] - from[1], to[2] - from[2]] as Vec3;
  if (dot(tangent, roughDir) < 0) {
    tangent = [-tangent[0], -tangent[1], -tangent[2]];
  }

  return tangent;
}

function tangentAway(from: Vec3, other: Vec3): Vec3 | null {
  const toward = tangentToward(from, other);
  if (!toward) return null;
  return [-toward[0], -toward[1], -toward[2]];
}

function applyTangentStep(v: Vec3, tangent: Vec3, amount: number): Vec3 {
  if (amount <= 0) return v;
  return normalize([
    v[0] + tangent[0] * amount,
    v[1] + tangent[1] * amount,
    v[2] + tangent[2] * amount,
  ]);
}

function addForce(forces: Vec3[], index: number, tangent: Vec3, amount: number) {
  forces[index] = [
    forces[index]![0] + tangent[0] * amount,
    forces[index]![1] + tangent[1] * amount,
    forces[index]![2] + tangent[2] * amount,
  ];
}

function minPairSeparation(r1: number, r2: number): number {
  return ((r1 + r2) * PAIR_GAP) / 100;
}

function mobility(locked?: boolean) {
  return locked ? 1 : 0.1;
}

function springStrength(locked?: boolean) {
  return locked ? 0.045 : 0.28;
}

function maxDriftRad(locked?: boolean) {
  return locked ? 0.095 : 0.038;
}

function clampDrift(current: Vec3, anchor: Vec3, maxRad: number): Vec3 {
  const drift = geodesicAngle(current, anchor);
  if (drift <= maxRad) return current;

  let axis = cross(current, anchor);
  const axisLen = Math.hypot(axis[0], axis[1], axis[2]);
  if (axisLen < 1e-10) return anchor;
  axis = [axis[0] / axisLen, axis[1] / axisLen, axis[2] / axisLen];

  return rotateAroundAxis(current, axis, -(drift - maxRad));
}

/** Bitişik ülkelerde bayrakların üst üste binmesini azaltır. */
export function spreadGlobeMarkers<T extends SpreadableMarker>(markers: T[]): T[] {
  if (markers.length < 2) return markers;

  const anchors = markers.map((marker) => latLngToVec(marker.lat, marker.lng));
  const vecs = anchors.map((anchor) => [...anchor] as Vec3);
  const discRadii = markers.map((marker) =>
    getMarkerAngularRadius(marker.countryCode, marker.locked) * 100,
  );

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const forces: Vec3[] = markers.map(() => [0, 0, 0]);
    const damping = iter < ITERATIONS * 0.65 ? 1 : 0.55;

    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const angle = geodesicAngle(vecs[i]!, vecs[j]!);
        const minSep = minPairSeparation(discRadii[i]!, discRadii[j]!);
        if (angle >= minSep) continue;

        const overlap = (minSep - angle) * REPULSION * damping;
        const awayI = tangentAway(vecs[i]!, vecs[j]!);
        const awayJ = tangentAway(vecs[j]!, vecs[i]!);

        if (awayI) addForce(forces, i, awayI, overlap * mobility(markers[i]!.locked));
        if (awayJ) addForce(forces, j, awayJ, overlap * mobility(markers[j]!.locked));
      }
    }

    for (let i = 0; i < markers.length; i++) {
      const towardAnchor = tangentToward(vecs[i]!, anchors[i]!);
      if (towardAnchor) {
        const drift = geodesicAngle(vecs[i]!, anchors[i]!);
        addForce(forces, i, towardAnchor, drift * springStrength(markers[i]!.locked));
      }

      const force = forces[i]!;
      const forceLen = Math.hypot(force[0], force[1], force[2]);
      if (forceLen > 1e-8) {
        vecs[i] = applyTangentStep(vecs[i]!, normalize(force), forceLen * 0.9);
      }

      vecs[i] = clampDrift(vecs[i]!, anchors[i]!, maxDriftRad(markers[i]!.locked));
    }
  }

  return markers.map((marker, index) => {
    const { lat, lng } = vecToLatLng(vecs[index]!);
    return { ...marker, lat, lng };
  });
}
