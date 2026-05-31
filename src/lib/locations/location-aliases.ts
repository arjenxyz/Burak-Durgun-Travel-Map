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

/** Sadece gerçek ülke adları */
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

const COUNTRY_KEYS_SORTED = Object.keys(COUNTRY_ALIASES).sort((a, b) => b.length - a.length);
const MIN_COUNTRY_KEY_LENGTH = 3;

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

function parseTitleCountry(title: string) {
  for (const pattern of TITLE_COUNTRY_PATTERNS) {
    const match = title.match(pattern);
    if (!match?.[1]) continue;
    const country = resolveCountry(match[1]);
    if (country) return { ...country, confidence: 0.95 };
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
    countryName: country.name,
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
    found.push({ code: country.code, name: country.name });
  }

  return found;
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
      countryName: country.name,
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
      geocodeQuery: titleCountry.name,
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
