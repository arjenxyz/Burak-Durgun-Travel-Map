import type { PlaceEntry } from "./location-aliases";

const geocodeCache = new Map<string, { lat: number; lng: number }>();

const COUNTRY_COORDS: Record<string, { lat: number; lng: number }> = {
  MA: { lat: 31.7917, lng: -7.0926 },
  ES: { lat: 40.4637, lng: -3.7492 },
  TR: { lat: 38.9637, lng: 35.2433 },
  BR: { lat: -14.235, lng: -51.9253 },
  CL: { lat: -35.6751, lng: -71.543 },
  AR: { lat: -38.4161, lng: -63.6167 },
  PE: { lat: -9.19, lng: -75.0152 },
  CO: { lat: 4.5709, lng: -74.2973 },
  MX: { lat: 23.6345, lng: -102.5528 },
  IN: { lat: 20.5937, lng: 78.9629 },
  JP: { lat: 36.2048, lng: 138.2529 },
  KR: { lat: 35.9078, lng: 127.7669 },
  CN: { lat: 35.8617, lng: 104.1954 },
  TH: { lat: 15.87, lng: 100.9925 },
  VN: { lat: 14.0583, lng: 108.2772 },
  ID: { lat: -0.7893, lng: 113.9213 },
  MY: { lat: 4.2105, lng: 101.9758 },
  SG: { lat: 1.3521, lng: 103.8198 },
  PH: { lat: 12.8797, lng: 121.774 },
  EG: { lat: 26.8206, lng: 30.8025 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  KE: { lat: -0.0236, lng: 37.9062 },
  TZ: { lat: -6.369, lng: 34.8888 },
  NG: { lat: 9.082, lng: 8.6753 },
  GH: { lat: 7.9465, lng: -1.0232 },
  SN: { lat: 14.4974, lng: -14.4524 },
  GR: { lat: 39.0742, lng: 21.8243 },
  IT: { lat: 41.8719, lng: 12.5674 },
  FR: { lat: 46.2276, lng: 2.2137 },
  DE: { lat: 51.1657, lng: 10.4515 },
  NL: { lat: 52.1326, lng: 5.2913 },
  BE: { lat: 50.5039, lng: 4.4699 },
  GB: { lat: 55.3781, lng: -3.436 },
  IE: { lat: 53.4129, lng: -8.2439 },
  PT: { lat: 39.3999, lng: -8.2245 },
  CH: { lat: 46.8182, lng: 8.2275 },
  AT: { lat: 47.5162, lng: 14.5501 },
  CZ: { lat: 49.8175, lng: 15.473 },
  PL: { lat: 51.9194, lng: 19.1451 },
  HU: { lat: 47.1625, lng: 19.5033 },
  RS: { lat: 44.0165, lng: 21.0059 },
  GE: { lat: 42.3154, lng: 43.3569 },
  AZ: { lat: 40.1431, lng: 47.5769 },
  IR: { lat: 32.4279, lng: 53.688 },
  JO: { lat: 30.5852, lng: 36.2384 },
  IL: { lat: 31.0461, lng: 34.8516 },
  LB: { lat: 33.8547, lng: 35.8623 },
  UZ: { lat: 41.3775, lng: 64.5853 },
  AE: { lat: 23.4241, lng: 53.8478 },
  US: { lat: 37.0902, lng: -95.7129 },
  CA: { lat: 56.1304, lng: -106.3468 },
  CU: { lat: 21.5218, lng: -77.7812 },
  RU: { lat: 61.524, lng: 105.3188 },
  AU: { lat: -25.2744, lng: 133.7751 },
};

const PRESET_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Fes, Morocco": { lat: 34.0181, lng: -5.0078 },
  "Marrakech, Morocco": { lat: 31.6295, lng: -7.9811 },
  "Casablanca, Morocco": { lat: 33.5731, lng: -7.5898 },
  "Seville, Spain": { lat: 37.3891, lng: -5.9845 },
  "Barcelona, Spain": { lat: 41.3874, lng: 2.1686 },
  "Madrid, Spain": { lat: 40.4168, lng: -3.7038 },
  "Tokyo, Japan": { lat: 35.6762, lng: 139.6503 },
  "Bangkok, Thailand": { lat: 13.7563, lng: 100.5018 },
  "Bali, Indonesia": { lat: -8.4095, lng: 115.1889 },
  "Dubai, UAE": { lat: 25.2048, lng: 55.2708 },
  "Istanbul, Turkey": { lat: 41.0082, lng: 28.9784 },
  "Tbilisi, Georgia": { lat: 41.7151, lng: 44.8271 },
  "Baku, Azerbaijan": { lat: 40.4093, lng: 49.8671 },
  "Tashkent, Uzbekistan": { lat: 41.2995, lng: 69.2401 },
  "Cairo, Egypt": { lat: 30.0444, lng: 31.2357 },
  "Paris, France": { lat: 48.8566, lng: 2.3522 },
  "London, UK": { lat: 51.5074, lng: -0.1278 },
  "Berlin, Germany": { lat: 52.52, lng: 13.405 },
  "Budapest, Hungary": { lat: 47.4979, lng: 19.0402 },
  "Belgrade, Serbia": { lat: 44.7866, lng: 20.4489 },
  "Beirut, Lebanon": { lat: 33.8938, lng: 35.5018 },
};

let lastNominatimCall = 0;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function nominatimGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const cached = geocodeCache.get(query);
  if (cached) return cached;

  const preset = PRESET_CITY_COORDS[query];
  if (preset) {
    geocodeCache.set(query, preset);
    return preset;
  }

  const elapsed = Date.now() - lastNominatimCall;
  if (elapsed < 1100) await sleep(1100 - elapsed);
  lastNominatimCall = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "BurakTravelMap/1.0 (travel-map-app)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data[0]) return null;
    const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    geocodeCache.set(query, coords);
    return coords;
  } catch {
    return null;
  }
}

export async function geocodePlace(place: PlaceEntry): Promise<{ lat: number; lng: number } | null> {
  if (place.type === "country") {
    const centroid = COUNTRY_COORDS[place.countryCode];
    if (centroid) return centroid;
  }

  const preset = PRESET_CITY_COORDS[place.geocodeQuery];
  if (preset) return preset;

  return nominatimGeocode(place.geocodeQuery);
}

export async function geocodePlaces(
  places: PlaceEntry[],
): Promise<Array<PlaceEntry & { lat: number; lng: number }>> {
  const results: Array<PlaceEntry & { lat: number; lng: number }> = [];

  for (const place of places) {
    const coords = await geocodePlace(place);
    if (coords) results.push({ ...place, ...coords });
  }

  return results;
}
