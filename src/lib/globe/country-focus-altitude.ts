/** globe.gl pointOfView altitude — düşük = daha yakın */

const EXTRA_LARGE = new Set([
  "RU", "US", "CA", "BR", "AU", "CN", "IN", "AR", "KZ", "DZ", "GL", "SA", "MX",
]);

const LARGE = new Set([
  "TR", "IR", "ID", "MN", "ZA", "EG", "FR", "ES", "SE", "NO", "FI", "UA", "PL",
  "DE", "IT", "GB", "MM", "TH", "PE", "CO", "VE", "MY", "NG", "TD", "NE", "ML",
  "MR", "BO", "CL", "SD", "ET", "KE", "TZ", "AO", "CD", "LY", "PK", "AF", "MA",
  "NZ", "JP", "VN", "PH", "PG", "YE", "OM", "IQ", "SY", "UZ", "TM", "BY", "RO",
]);

const SMALL = new Set([
  "BE", "NL", "IL", "LB", "AL", "ME", "MK", "SI", "SK", "HR", "BA", "RS", "BG",
  "MD", "AM", "GE", "AZ", "CY", "QA", "BH", "KW", "SG", "LU", "MT", "EE", "LV",
  "LT", "CH", "AT", "CZ", "HU", "PT", "GR", "IE", "DK", "JO", "PS", "TN", "CR",
  "PA", "DO", "HT", "CU", "GT", "HN", "SV", "NI", "EC", "UY", "PY", "KG", "TJ",
]);

const TINY = new Set(["MC", "VA", "SM", "AD", "LI", "MV", "BH", "SG", "MT"]);

type CountrySize = "extraLarge" | "large" | "medium" | "small" | "tiny";

function getCountrySize(countryCode: string): CountrySize {
  const code = countryCode.toUpperCase();
  if (EXTRA_LARGE.has(code)) return "extraLarge";
  if (LARGE.has(code)) return "large";
  if (TINY.has(code)) return "tiny";
  if (SMALL.has(code)) return "small";
  return "medium";
}

/** Liste / panelden seçim — ülke sınırlarına çok yakın */
const LIST_ALTITUDE: Record<CountrySize, number> = {
  extraLarge: 0.38,
  large: 0.22,
  medium: 0.16,
  small: 0.12,
  tiny: 0.09,
};

/** Haritadaki bayrağa tıklama — orta yakınlık */
const GLOBE_ALTITUDE: Record<CountrySize, number> = {
  extraLarge: 0.95,
  large: 0.62,
  medium: 0.48,
  small: 0.38,
  tiny: 0.26,
};

export type FocusZoomSource = "list" | "globe";

export function getCountryFocusAltitude(
  countryCode: string,
  source: FocusZoomSource = "globe",
): number {
  const size = getCountrySize(countryCode);
  return source === "list" ? LIST_ALTITUDE[size] : GLOBE_ALTITUDE[size];
}
