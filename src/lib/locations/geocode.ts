import type { PlaceEntry } from "./location-aliases";

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

export async function geocodePlace(place: PlaceEntry): Promise<{ lat: number; lng: number } | null> {
  return COUNTRY_COORDS[place.countryCode] ?? null;
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
