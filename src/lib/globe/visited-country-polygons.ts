const COUNTRIES_GEOJSON_URL =
  "https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson";

type CountryPolygonProperties = {
  ISO_A2?: string;
  ADMIN?: string;
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
