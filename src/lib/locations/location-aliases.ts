import {
  COUNTRY_ALIASES_DATA,
  COUNTRY_KEYS_SORTED,
  ISO2_COUNTRY,
  type CountryDef,
} from "./country-aliases-data";
import { getCountryDisplayName } from "./country-display-names";

export type PlaceEntry = {
  type: "country";
  countryCode: string;
  countryName: string;
  geocodeQuery: string;
  confidence: number;
  source?: "parser" | "playlist";
};

/** Kaydedilecek minimum güven — altındakiler atılır */
export const MIN_LOCATION_CONFIDENCE = 0.85;

export const COUNTRY_ALIASES = COUNTRY_ALIASES_DATA;

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

const MIN_COUNTRY_KEY_LENGTH = 3;

function normalizeKey(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function toDisplayCountry(country: CountryDef) {
  return {
    code: country.code,
    name: getCountryDisplayName(country.code, country.name),
  };
}

function extractHashtags(text: string): string[] {
  const matches = text.match(/#([\wçğıöşüÇĞİÖŞÜ]+)/gi) ?? [];
  return matches.map((tag) => normalizeKey(tag.slice(1)));
}

function resolveCountry(alias: string) {
  return COUNTRY_ALIASES[normalizeKey(alias)] ?? null;
}

function parseTitleCountry(title: string) {
  for (const pattern of TITLE_COUNTRY_PATTERNS) {
    const match = title.match(pattern);
    if (!match?.[1]) continue;
    const country = resolveCountry(match[1]);
    if (country) {
      return {
        code: country.code,
        name: getCountryDisplayName(country.code, country.name),
        geocodeQuery: country.name,
        confidence: 0.95,
      };
    }
  }
  return null;
}

function dedupePlaces(places: PlaceEntry[]): PlaceEntry[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    if (seen.has(p.countryCode)) return false;
    seen.add(p.countryCode);
    return true;
  });
}

function matchesAnchor(countryCode: string, anchorCode: string | null): boolean {
  return !anchorCode || countryCode === anchorCode;
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
    countryName: getCountryDisplayName(country.code, country.name),
    geocodeQuery: country.name,
    confidence,
    source: "parser",
  });
}

/** Oynatma listesi başlığı veya serbest metinden ülke adları çıkarır */
export function parseCountriesFromText(text: string): Array<{ code: string; name: string }> {
  const normalized = normalizeKey(text);
  const found: Array<{ code: string; name: string }> = [];
  const seen = new Set<string>();

  for (const key of COUNTRY_KEYS_SORTED) {
    if (key.length < MIN_COUNTRY_KEY_LENGTH) continue;
    if (!normalized.includes(key)) continue;

    const country = COUNTRY_ALIASES[key];
    if (seen.has(country.code)) continue;
    seen.add(country.code);
    found.push(toDisplayCountry(country));
  }

  return found;
}

/** Playlist başlıkları için daha agresif ülke eşleme (emoji, |, ISO kod) */
export function parseCountriesFromPlaylistTitle(title: string): Array<{ code: string; name: string }> {
  const found = new Map<string, { code: string; name: string }>();

  function addCountries(countries: Array<{ code: string; name: string }>) {
    for (const country of countries) {
      found.set(country.code, country);
    }
  }

  addCountries(parseCountriesFromText(title));

  const cleaned = title.replace(/\p{Extended_Pictographic}/gu, " ");
  const segments = cleaned
    .split(/[|/\-–—•·:,()[\]]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const segment of segments) {
    addCountries(parseCountriesFromText(segment));

    for (const token of segment.split(/\s+/).filter(Boolean)) {
      const upper = token.toUpperCase();
      if (/^[A-Z]{2}$/.test(upper) && ISO2_COUNTRY[upper]) {
        const country = toDisplayCountry(ISO2_COUNTRY[upper]);
        found.set(country.code, country);
      }
    }
  }

  return [...found.values()];
}

export type PlaylistCountryRef = { code: string; name: string };

/** Ülke: öncelik oynatma listesi → yoksa başlık parser */
export function resolveVideoPlaces(
  title: string,
  description: string,
  playlistCountries: PlaylistCountryRef[] = [],
): PlaceEntry[] {
  if (playlistCountries.length > 0) {
    return playlistCountries.map((country) => ({
      type: "country" as const,
      countryCode: country.code,
      countryName: getCountryDisplayName(country.code, country.name),
      geocodeQuery: country.name,
      confidence: 0.97,
      source: "playlist" as const,
    }));
  }

  return parseLocationsFromVideo(title, description);
}

/** Başlık/açıklama hashtag'lerinden ülke — şehir yok */
export function parseLocationsFromVideo(title: string, description = ""): PlaceEntry[] {
  const places: PlaceEntry[] = [];
  const titleCountry = parseTitleCountry(title);
  const anchorCode = titleCountry?.code ?? null;

  if (titleCountry) {
    places.push({
      type: "country",
      countryCode: titleCountry.code,
      countryName: titleCountry.name,
      geocodeQuery: titleCountry.geocodeQuery,
      confidence: titleCountry.confidence,
      source: "parser",
    });
  }

  for (const tag of extractHashtags(title)) {
    addCountryFromTag(places, tag, anchorCode, anchorCode ? 0.9 : 0.88);
  }

  if (anchorCode) {
    const descHead = description.split("\n").slice(0, 3).join("\n");
    for (const tag of extractHashtags(descHead)) {
      addCountryFromTag(places, tag, anchorCode, 0.88);
    }
  }

  return dedupePlaces(places).filter((p) => p.confidence >= MIN_LOCATION_CONFIDENCE);
}
