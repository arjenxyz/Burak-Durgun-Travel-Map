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

export function getCountryFocusAltitude(countryCode: string): number {
  const code = countryCode.toUpperCase();
  if (EXTRA_LARGE.has(code)) return 0.95;
  if (LARGE.has(code)) return 0.62;
  if (TINY.has(code)) return 0.26;
  if (SMALL.has(code)) return 0.38;
  return 0.48;
}
