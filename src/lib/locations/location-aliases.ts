import { CITY_ALIASES_DATA, cityKeysByCountry } from "./city-aliases-data";

export type PlaceEntry = {
  type: "country" | "city";
  countryCode: string;
  countryName: string;
  city?: string;
  geocodeQuery: string;
  confidence: number;
};

/** Kaydedilecek minimum güven — altındakiler atılır */
export const MIN_LOCATION_CONFIDENCE = 0.85;

export const CITY_ALIASES = CITY_ALIASES_DATA;

/** Sadece gerçek ülke adları — şehir adları burada OLMAMALI */
export const COUNTRY_ALIASES: Record<string, { code: string; name: string }> = {
  fas: { code: "MA", name: "Morocco" },
  morocco: { code: "MA", name: "Morocco" },

  ispanya: { code: "ES", name: "Spain" },
  spain: { code: "ES", name: "Spain" },

  brezilya: { code: "BR", name: "Brazil" },
  brazil: { code: "BR", name: "Brazil" },

  sili: { code: "CL", name: "Chile" },
  chile: { code: "CL", name: "Chile" },

  arjantin: { code: "AR", name: "Argentina" },
  argentina: { code: "AR", name: "Argentina" },

  peru: { code: "PE", name: "Peru" },

  kolombiya: { code: "CO", name: "Colombia" },
  colombia: { code: "CO", name: "Colombia" },

  meksika: { code: "MX", name: "Mexico" },
  mexico: { code: "MX", name: "Mexico" },

  hindistan: { code: "IN", name: "India" },
  india: { code: "IN", name: "India" },

  japonya: { code: "JP", name: "Japan" },
  japan: { code: "JP", name: "Japan" },

  kore: { code: "KR", name: "South Korea" },
  korea: { code: "KR", name: "South Korea" },

  cin: { code: "CN", name: "China" },
  china: { code: "CN", name: "China" },

  tayland: { code: "TH", name: "Thailand" },
  thailand: { code: "TH", name: "Thailand" },

  vietnam: { code: "VN", name: "Vietnam" },

  endonezya: { code: "ID", name: "Indonesia" },
  indonesia: { code: "ID", name: "Indonesia" },

  malezya: { code: "MY", name: "Malaysia" },
  malaysia: { code: "MY", name: "Malaysia" },

  singapur: { code: "SG", name: "Singapore" },
  singapore: { code: "SG", name: "Singapore" },

  filipinler: { code: "PH", name: "Philippines" },
  philippines: { code: "PH", name: "Philippines" },

  misir: { code: "EG", name: "Egypt" },
  egypt: { code: "EG", name: "Egypt" },

  guneyafrika: { code: "ZA", name: "South Africa" },
  southafrica: { code: "ZA", name: "South Africa" },

  kenya: { code: "KE", name: "Kenya" },
  tanzanya: { code: "TZ", name: "Tanzania" },
  tanzania: { code: "TZ", name: "Tanzania" },

  nijerya: { code: "NG", name: "Nigeria" },
  nigeria: { code: "NG", name: "Nigeria" },

  gana: { code: "GH", name: "Ghana" },
  ghana: { code: "GH", name: "Ghana" },

  senegal: { code: "SN", name: "Senegal" },

  turkiye: { code: "TR", name: "Turkey" },
  turkey: { code: "TR", name: "Turkey" },

  yunanistan: { code: "GR", name: "Greece" },
  greece: { code: "GR", name: "Greece" },

  italya: { code: "IT", name: "Italy" },
  italy: { code: "IT", name: "Italy" },

  fransa: { code: "FR", name: "France" },
  france: { code: "FR", name: "France" },

  almanya: { code: "DE", name: "Germany" },
  germany: { code: "DE", name: "Germany" },

  hollanda: { code: "NL", name: "Netherlands" },
  netherlands: { code: "NL", name: "Netherlands" },

  belcika: { code: "BE", name: "Belgium" },
  belgium: { code: "BE", name: "Belgium" },

  ingiltere: { code: "GB", name: "United Kingdom" },
  uk: { code: "GB", name: "United Kingdom" },

  portekiz: { code: "PT", name: "Portugal" },
  portugal: { code: "PT", name: "Portugal" },

  isvicre: { code: "CH", name: "Switzerland" },
  switzerland: { code: "CH", name: "Switzerland" },

  avusturya: { code: "AT", name: "Austria" },
  austria: { code: "AT", name: "Austria" },

  cekya: { code: "CZ", name: "Czechia" },

  polonya: { code: "PL", name: "Poland" },
  poland: { code: "PL", name: "Poland" },

  macaristan: { code: "HU", name: "Hungary" },
  hungary: { code: "HU", name: "Hungary" },

  gurcistan: { code: "GE", name: "Georgia" },
  georgia: { code: "GE", name: "Georgia" },

  azerbaycan: { code: "AZ", name: "Azerbaijan" },
  azerbaijan: { code: "AZ", name: "Azerbaijan" },

  ozbekistan: { code: "UZ", name: "Uzbekistan" },
  uzbekistan: { code: "UZ", name: "Uzbekistan" },

  iran: { code: "IR", name: "Iran" },
  urdun: { code: "JO", name: "Jordan" },
  jordan: { code: "JO", name: "Jordan" },

  lubnan: { code: "LB", name: "Lebanon" },
  lebanon: { code: "LB", name: "Lebanon" },

  dubai: { code: "AE", name: "United Arab Emirates" },
  uae: { code: "AE", name: "United Arab Emirates" },

  abd: { code: "US", name: "United States" },
  usa: { code: "US", name: "United States" },
  amerika: { code: "US", name: "United States" },

  kanada: { code: "CA", name: "Canada" },
  canada: { code: "CA", name: "Canada" },

  kuba: { code: "CU", name: "Cuba" },
  cuba: { code: "CU", name: "Cuba" },

  rusya: { code: "RU", name: "Russia" },
  russia: { code: "RU", name: "Russia" },

  sirbistan: { code: "RS", name: "Serbia" },
  serbia: { code: "RS", name: "Serbia" },

  avustralya: { code: "AU", name: "Australia" },
  australia: { code: "AU", name: "Australia" },
};

/** Trend / alakasız hashtag'ler — yok sayılır */
const IGNORED_HASHTAGS = new Set([
  "shorts",
  "short",
  "viral",
  "trend",
  "trending",
  "fyp",
  "foryou",
  "foryoupage",
  "reels",
  "youtube",
  "vlog",
  "travel",
  "gezi",
  "seyahat",
  "kesfet",
  "video",
  "blog",
]);

const TITLE_COUNTRY_PATTERNS = [
  /^([A-ZÇĞİÖŞÜ]{3,})'A\s+GELD/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'[A-ZÇĞİÖŞÜ]*\s+(GELD|GID)/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'IN\s+/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'[TD]A\b/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'[TD]E\b/i,
  /^([A-ZÇĞİÖŞÜ]{4,})\s*[:|]/,
];

/** Başlıktaki şehir kalıpları — FES'TE, ANTALYA'YA GELDİM */
const TITLE_CITY_PATTERNS = [
  /^([A-ZÇĞİÖŞÜ]{3,})'[TD][AE]\b/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'YA\s+GELD/i,
  /^([A-ZÇĞİÖŞÜ]{3,})'[A-ZÇĞİÖŞÜ]*\s+(GEZ|GEL|KAL|BUL|YAS)/i,
];

const CITY_KEYS_BY_COUNTRY = cityKeysByCountry();
const MIN_CITY_KEY_LENGTH = 4;

function normalizeKey(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#([\wçğıöşüÇĞİÖŞÜ]+)/gi) ?? [];
  return matches.map((tag) => normalizeKey(tag.slice(1)));
}

function resolveCountry(alias: string) {
  return COUNTRY_ALIASES[normalizeKey(alias)] ?? null;
}

function resolveCity(alias: string) {
  return CITY_ALIASES[normalizeKey(alias)] ?? null;
}

function toCityPlace(city: (typeof CITY_ALIASES)[string], confidence: number): PlaceEntry {
  return {
    type: "city",
    countryCode: city.countryCode,
    countryName: city.countryName,
    city: city.city,
    geocodeQuery: city.geocodeQuery,
    confidence,
  };
}

function parseTitleCountry(title: string) {
  for (const pattern of TITLE_COUNTRY_PATTERNS) {
    const match = title.match(pattern);
    if (!match?.[1]) continue;
    const country = resolveCountry(match[1]);
    if (country) return { ...country, confidence: 0.95 };
  }
  return null;
}

function parseTitleCityPatterns(title: string, anchorCode: string | null): PlaceEntry[] {
  const places: PlaceEntry[] = [];

  for (const pattern of TITLE_CITY_PATTERNS) {
    const match = title.match(pattern);
    if (!match?.[1]) continue;
    const city = resolveCity(match[1]);
    if (city && matchesAnchor(city.countryCode, anchorCode)) {
      places.push(toCityPlace(city, 0.93));
    }
  }

  return places;
}

/** Ana ülke belliyken başlıkta geçen şehir alias'larını tara */
function findCitiesInAnchoredTitle(title: string, anchorCode: string): PlaceEntry[] {
  const normalized = normalizeKey(title);
  const keys = CITY_KEYS_BY_COUNTRY.get(anchorCode) ?? [];
  const places: PlaceEntry[] = [];
  const seenCities = new Set<string>();

  for (const key of keys) {
    if (key.length < MIN_CITY_KEY_LENGTH) continue;
    if (!normalized.includes(key)) continue;

    const city = CITY_ALIASES[key];
    if (seenCities.has(city.city)) continue;
    seenCities.add(city.city);
    places.push(toCityPlace(city, 0.87));
  }

  return places;
}

function dedupePlaces(places: PlaceEntry[]): PlaceEntry[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = `${p.countryCode}|${p.city ?? ""}|${p.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchesAnchor(countryCode: string, anchorCode: string | null): boolean {
  return !anchorCode || countryCode === anchorCode;
}

function addCityFromTag(
  places: PlaceEntry[],
  tag: string,
  anchorCode: string | null,
  confidence: number,
) {
  if (IGNORED_HASHTAGS.has(tag)) return;
  const city = resolveCity(tag);
  if (!city || !matchesAnchor(city.countryCode, anchorCode)) return;

  places.push(toCityPlace(city, confidence));
}

function addCountryFromTag(
  places: PlaceEntry[],
  tag: string,
  anchorCode: string | null,
  confidence: number,
) {
  if (IGNORED_HASHTAGS.has(tag)) return;
  const country = resolveCountry(tag);
  if (!country || !matchesAnchor(country.code, anchorCode)) return;

  places.push({
    type: "country",
    countryCode: country.code,
    countryName: country.name,
    geocodeQuery: country.name,
    confidence,
  });
}

/**
 * Sıkı parser:
 * 1. Başlıktaki ülke kalıbı ana referans (FAS'A GELDİM, FAS'IN ...)
 * 2. Başlıktaki şehir kalıpları + ana ülkeye bağlı şehir taraması
 * 3. Hashtag'ler yalnızca başlıkta veya açıklamanın İLK 3 satırında
 * 4. Açıklama hashtag'leri sadece ana ülke ile eşleşirse kabul
 * 5. Trend hashtag'ler yok sayılır
 */
export function parseLocationsFromVideo(title: string, description = ""): PlaceEntry[] {
  const places: PlaceEntry[] = [];
  const titleCountry = parseTitleCountry(title);
  const anchorCode = titleCountry?.code ?? null;

  if (titleCountry) {
    places.push({
      type: "country",
      countryCode: titleCountry.code,
      countryName: titleCountry.name,
      geocodeQuery: titleCountry.name,
      confidence: titleCountry.confidence,
    });
  }

  places.push(...parseTitleCityPatterns(title, anchorCode));

  if (anchorCode) {
    places.push(...findCitiesInAnchoredTitle(title, anchorCode));
  }

  for (const tag of extractHashtags(title)) {
    addCityFromTag(places, tag, anchorCode, 0.92);
    addCountryFromTag(places, tag, anchorCode, anchorCode ? 0.9 : 0.88);
  }

  for (const word of title.split(/\s+/)) {
    const cleaned = word.replace(/[^A-ZÇĞİÖŞÜa-zçğıöşü]/g, "");
    const city = resolveCity(cleaned);
    if (city && matchesAnchor(city.countryCode, anchorCode)) {
      places.push(toCityPlace(city, 0.88));
    }
  }

  if (anchorCode) {
    const descHead = description.split("\n").slice(0, 3).join("\n");
    for (const tag of extractHashtags(descHead)) {
      addCityFromTag(places, tag, anchorCode, 0.9);
      addCountryFromTag(places, tag, anchorCode, 0.88);
    }
  }

  return dedupePlaces(places).filter((p) => p.confidence >= MIN_LOCATION_CONFIDENCE);
}
