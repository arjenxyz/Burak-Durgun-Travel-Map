type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

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

function separationWeight(locked?: boolean) {
  return locked ? 1 : 0.28;
}

/** Bitişik ülkelerde bayrakların üst üste binmesini azaltır. */
export function spreadGlobeMarkers<T extends { lat: number; lng: number; locked?: boolean }>(
  markers: T[],
  minSeparationRad = 0.044,
  maxIterations = 12,
): T[] {
  if (markers.length < 2) return markers;

  const vecs = markers.map((marker) => latLngToVec(marker.lat, marker.lng));
  const cosMin = Math.cos(minSeparationRad);

  for (let iter = 0; iter < maxIterations; iter++) {
    let adjusted = false;

    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const cosAngle = dot(vecs[i]!, vecs[j]!);
        if (cosAngle <= cosMin) continue;

        const angle = Math.acos(clamp(cosAngle, -1, 1));
        const deficit = minSeparationRad - angle;
        if (deficit <= 0) continue;

        let axis = cross(vecs[i]!, vecs[j]!);
        const axisLen = Math.hypot(axis[0], axis[1], axis[2]);
        if (axisLen < 1e-6) {
          axis = normalize(cross(vecs[i]!, [0, 0, 1]));
          if (Math.hypot(axis[0], axis[1], axis[2]) < 1e-6) {
            axis = [0, 1, 0];
          }
        } else {
          axis = [axis[0] / axisLen, axis[1] / axisLen, axis[2] / axisLen];
        }

        const weightI = separationWeight(markers[i]!.locked);
        const weightJ = separationWeight(markers[j]!.locked);
        const total = weightI + weightJ;

        vecs[i] = rotateAroundAxis(vecs[i]!, axis, (deficit * weightI) / total);
        vecs[j] = rotateAroundAxis(vecs[j]!, axis, (-deficit * weightJ) / total);
        adjusted = true;
      }
    }

    if (!adjusted) break;
  }

  return markers.map((marker, index) => {
    const { lat, lng } = vecToLatLng(vecs[index]!);
    return { ...marker, lat, lng };
  });
}
