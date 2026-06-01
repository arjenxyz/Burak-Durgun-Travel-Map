const COUNTRIES_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type CountryPolygonProperties = {
  ISO_A2?: string;
  ADMIN?: string;
  NAME_TR?: string;
  LABEL_X?: number;
  LABEL_Y?: number;
  HOMEPART?: number;
};

export type VisitedCountryPolygon = GeoJSON.Feature & {
  properties: CountryPolygonProperties;
};

let geoJsonPromise: Promise<GeoJSON.FeatureCollection> | null = null;

function loadCountryGeoJson(): Promise<GeoJSON.FeatureCollection> {
  if (!geoJsonPromise) {
    geoJsonPromise = fetch(COUNTRIES_GEOJSON_URL).then(async (res) => {
      if (!res.ok) throw new Error("Ülke sınırları yüklenemedi");
      return res.json() as Promise<GeoJSON.FeatureCollection>;
    });
  }
  return geoJsonPromise;
}

export async function loadVisitedCountryPolygons(
  countryCodes: string[],
): Promise<VisitedCountryPolygon[]> {
  const visited = new Set(countryCodes.map((code) => code.toUpperCase()));
  const geojson = await loadCountryGeoJson();

  return (geojson.features as VisitedCountryPolygon[]).filter((feature) => {
    const iso = feature.properties?.ISO_A2?.toUpperCase();
    return iso && iso !== "-99" && visited.has(iso);
  });
}

export type UnvisitedCountryMarker = {
  lat: number;
  lng: number;
  label: string;
  countryCode: string;
  locked: true;
};

export type CountryLabelPoint = {
  lat: number;
  lng: number;
};

export async function loadCountryLabelPoints(): Promise<Map<string, CountryLabelPoint>> {
  const geojson = await loadCountryGeoJson();
  const byCode = pickCountryFeatureByIso(geojson.features as VisitedCountryPolygon[]);
  const points = new Map<string, CountryLabelPoint>();

  for (const [iso, feature] of byCode) {
    const lat = feature.properties?.LABEL_Y;
    const lng = feature.properties?.LABEL_X;
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }
    points.set(iso, { lat, lng });
  }

  return points;
}

function pickCountryFeatureByIso(
  features: VisitedCountryPolygon[],
): Map<string, VisitedCountryPolygon> {
  const byCode = new Map<string, VisitedCountryPolygon>();

  for (const feature of features) {
    const iso = feature.properties?.ISO_A2?.toUpperCase();
    if (!iso || iso === "-99") continue;

    const existing = byCode.get(iso);
    if (!existing) {
      byCode.set(iso, feature);
      continue;
    }

    const isHomeland = feature.properties?.HOMEPART === 1;
    const existingIsHomeland = existing.properties?.HOMEPART === 1;
    if (isHomeland && !existingIsHomeland) {
      byCode.set(iso, feature);
    }
  }

  return byCode;
}

export async function loadUnvisitedCountryMarkers(
  visitedCountryCodes: string[],
  getDisplayName: (code: string, fallback?: string) => string,
): Promise<UnvisitedCountryMarker[]> {
  const visited = new Set(visitedCountryCodes.map((code) => code.toUpperCase()));
  const geojson = await loadCountryGeoJson();
  const byCode = pickCountryFeatureByIso(geojson.features as VisitedCountryPolygon[]);

  const markers: UnvisitedCountryMarker[] = [];

  for (const [iso, feature] of byCode) {
    if (visited.has(iso)) continue;

    const lat = feature.properties?.LABEL_Y;
    const lng = feature.properties?.LABEL_X;
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      continue;
    }

    const fallbackName = feature.properties?.NAME_TR ?? feature.properties?.ADMIN;
    markers.push({
      lat,
      lng,
      countryCode: iso,
      label: getDisplayName(iso, fallbackName),
      locked: true,
    });
  }

  return markers.sort((a, b) => a.label.localeCompare(b.label, "tr"));
}

export function getVisitedPolygonCapColor(
  isoCode: string | undefined,
  selectedCode?: string,
): string {
  if (!isoCode) return "rgba(249, 115, 22, 0)";
  if (isoCode === selectedCode) return "rgba(249, 115, 22, 0.55)";
  return "rgba(249, 115, 22, 0.32)";
}

export const VISITED_POLYGON_SIDE_COLOR = "rgba(234, 88, 12, 0.28)";
export const VISITED_POLYGON_STROKE_COLOR = "rgba(253, 186, 116, 0.75)";
