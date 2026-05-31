export type PlaceEntry = {
  type: "country" | "city";
  countryCode: string;
  countryName: string;
  city?: string;
  geocodeQuery: string;
  confidence: number;
};

/** Turkish + English aliases → ISO country */
export const COUNTRY_ALIASES: Record<string, { code: string; name: string }> = {
  fas: { code: "MA", name: "Morocco" },
  morocco: { code: "MA", name: "Morocco" },
  marakesh: { code: "MA", name: "Morocco" },
  marrakech: { code: "MA", name: "Morocco" },

  ispanya: { code: "ES", name: "Spain" },
  spain: { code: "ES", name: "Spain" },
  sevilla: { code: "ES", name: "Spain" },
  seville: { code: "ES", name: "Spain" },
  barselona: { code: "ES", name: "Spain" },
  barcelona: { code: "ES", name: "Spain" },
  madrid: { code: "ES", name: "Spain" },

  brezilya: { code: "BR", name: "Brazil" },
  brazil: { code: "BR", name: "Brazil" },
  rio: { code: "BR", name: "Brazil" },

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
  tokyo: { code: "JP", name: "Japan" },
  osaka: { code: "JP", name: "Japan" },

  kore: { code: "KR", name: "South Korea" },
  korea: { code: "KR", name: "South Korea" },
  seoul: { code: "KR", name: "South Korea" },

  cin: { code: "CN", name: "China" },
  china: { code: "CN", name: "China" },

  tayland: { code: "TH", name: "Thailand" },
  thailand: { code: "TH", name: "Thailand" },
  bangkok: { code: "TH", name: "Thailand" },

  vietnam: { code: "VN", name: "Vietnam" },

  endonezya: { code: "ID", name: "Indonesia" },
  indonesia: { code: "ID", name: "Indonesia" },
  bali: { code: "ID", name: "Indonesia" },

  malezya: { code: "MY", name: "Malaysia" },
  malaysia: { code: "MY", name: "Malaysia" },

  singapur: { code: "SG", name: "Singapore" },
  singapore: { code: "SG", name: "Singapore" },

  filipinler: { code: "PH", name: "Philippines" },
  philippines: { code: "PH", name: "Philippines" },

  misir: { code: "EG", name: "Egypt" },
  egypt: { code: "EG", name: "Egypt" },
  kahire: { code: "EG", name: "Egypt" },
  cairo: { code: "EG", name: "Egypt" },

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
  istanbul: { code: "TR", name: "Turkey" },
  izmir: { code: "TR", name: "Turkey" },

  yunanistan: { code: "GR", name: "Greece" },
  greece: { code: "GR", name: "Greece" },
  atina: { code: "GR", name: "Greece" },
  athens: { code: "GR", name: "Greece" },

  italya: { code: "IT", name: "Italy" },
  italy: { code: "IT", name: "Italy" },
  roma: { code: "IT", name: "Italy" },
  rome: { code: "IT", name: "Italy" },

  fransa: { code: "FR", name: "France" },
  france: { code: "FR", name: "France" },
  paris: { code: "FR", name: "France" },

  almanya: { code: "DE", name: "Germany" },
  germany: { code: "DE", name: "Germany" },
  berlin: { code: "DE", name: "Germany" },

  hollanda: { code: "NL", name: "Netherlands" },
  netherlands: { code: "NL", name: "Netherlands" },
  amsterdam: { code: "NL", name: "Netherlands" },

  belcika: { code: "BE", name: "Belgium" },
  belgium: { code: "BE", name: "Belgium" },

  ingiltere: { code: "GB", name: "United Kingdom" },
  uk: { code: "GB", name: "United Kingdom" },
  london: { code: "GB", name: "United Kingdom" },
  londra: { code: "GB", name: "United Kingdom" },

  portekiz: { code: "PT", name: "Portugal" },
  portugal: { code: "PT", name: "Portugal" },

  isvicre: { code: "CH", name: "Switzerland" },
  switzerland: { code: "CH", name: "Switzerland" },

  avusturya: { code: "AT", name: "Austria" },
  austria: { code: "AT", name: "Austria" },

  cekya: { code: "CZ", name: "Czechia" },
  prague: { code: "CZ", name: "Czechia" },

  polonya: { code: "PL", name: "Poland" },
  poland: { code: "PL", name: "Poland" },

  macaristan: { code: "HU", name: "Hungary" },
  hungary: { code: "HU", name: "Hungary" },
  budapest: { code: "HU", name: "Hungary" },

  gurcistan: { code: "GE", name: "Georgia" },
  georgia: { code: "GE", name: "Georgia" },
  tbilisi: { code: "GE", name: "Georgia" },

  azerbaycan: { code: "AZ", name: "Azerbaijan" },
  azerbaijan: { code: "AZ", name: "Azerbaijan" },
  baku: { code: "AZ", name: "Azerbaijan" },

  ozbekistan: { code: "UZ", name: "Uzbekistan" },
  uzbekistan: { code: "UZ", name: "Uzbekistan" },
  taskent: { code: "UZ", name: "Uzbekistan" },

  iran: { code: "IR", name: "Iran" },
  urdun: { code: "JO", name: "Jordan" },
  jordan: { code: "JO", name: "Jordan" },
  israil: { code: "IL", name: "Israel" },
  israel: { code: "IL", name: "Israel" },
  lubnan: { code: "LB", name: "Lebanon" },
  lebanon: { code: "LB", name: "Lebanon" },
  beirut: { code: "LB", name: "Lebanon" },

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
  moskova: { code: "RU", name: "Russia" },

  sirbistan: { code: "RS", name: "Serbia" },
  serbia: { code: "RS", name: "Serbia" },
  belgrad: { code: "RS", name: "Serbia" },

  avustralya: { code: "AU", name: "Australia" },
  australia: { code: "AU", name: "Australia" },
};

export const CITY_ALIASES: Record<
  string,
  { city: string; countryCode: string; countryName: string; geocodeQuery: string }
> = {
  fes: { city: "Fes", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Fes, Morocco" },
  fez: { city: "Fes", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Fes, Morocco" },
  marakesh: {
    city: "Marrakech",
    countryCode: "MA",
    countryName: "Morocco",
    geocodeQuery: "Marrakech, Morocco",
  },
  marrakech: {
    city: "Marrakech",
    countryCode: "MA",
    countryName: "Morocco",
    geocodeQuery: "Marrakech, Morocco",
  },
  kazablanka: {
    city: "Casablanca",
    countryCode: "MA",
    countryName: "Morocco",
    geocodeQuery: "Casablanca, Morocco",
  },
  casablanca: {
    city: "Casablanca",
    countryCode: "MA",
    countryName: "Morocco",
    geocodeQuery: "Casablanca, Morocco",
  },
  sevilla: {
    city: "Seville",
    countryCode: "ES",
    countryName: "Spain",
    geocodeQuery: "Seville, Spain",
  },
  seville: {
    city: "Seville",
    countryCode: "ES",
    countryName: "Spain",
    geocodeQuery: "Seville, Spain",
  },
  barselona: {
    city: "Barcelona",
    countryCode: "ES",
    countryName: "Spain",
    geocodeQuery: "Barcelona, Spain",
  },
  barcelona: {
    city: "Barcelona",
    countryCode: "ES",
    countryName: "Spain",
    geocodeQuery: "Barcelona, Spain",
  },
  madrid: { city: "Madrid", countryCode: "ES", countryName: "Spain", geocodeQuery: "Madrid, Spain" },
  tokyo: { city: "Tokyo", countryCode: "JP", countryName: "Japan", geocodeQuery: "Tokyo, Japan" },
  bangkok: {
    city: "Bangkok",
    countryCode: "TH",
    countryName: "Thailand",
    geocodeQuery: "Bangkok, Thailand",
  },
  bali: { city: "Denpasar", countryCode: "ID", countryName: "Indonesia", geocodeQuery: "Bali, Indonesia" },
  dubai: {
    city: "Dubai",
    countryCode: "AE",
    countryName: "United Arab Emirates",
    geocodeQuery: "Dubai, UAE",
  },
  istanbul: {
    city: "Istanbul",
    countryCode: "TR",
    countryName: "Turkey",
    geocodeQuery: "Istanbul, Turkey",
  },
  tbilisi: {
    city: "Tbilisi",
    countryCode: "GE",
    countryName: "Georgia",
    geocodeQuery: "Tbilisi, Georgia",
  },
  baku: { city: "Baku", countryCode: "AZ", countryName: "Azerbaijan", geocodeQuery: "Baku, Azerbaijan" },
  taskent: {
    city: "Tashkent",
    countryCode: "UZ",
    countryName: "Uzbekistan",
    geocodeQuery: "Tashkent, Uzbekistan",
  },
  kahire: { city: "Cairo", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Cairo, Egypt" },
  cairo: { city: "Cairo", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Cairo, Egypt" },
  paris: { city: "Paris", countryCode: "FR", countryName: "France", geocodeQuery: "Paris, France" },
  londra: {
    city: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    geocodeQuery: "London, UK",
  },
  london: {
    city: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    geocodeQuery: "London, UK",
  },
  berlin: { city: "Berlin", countryCode: "DE", countryName: "Germany", geocodeQuery: "Berlin, Germany" },
  budapest: {
    city: "Budapest",
    countryCode: "HU",
    countryName: "Hungary",
    geocodeQuery: "Budapest, Hungary",
  },
  belgrad: {
    city: "Belgrade",
    countryCode: "RS",
    countryName: "Serbia",
    geocodeQuery: "Belgrade, Serbia",
  },
  beirut: {
    city: "Beirut",
    countryCode: "LB",
    countryName: "Lebanon",
    geocodeQuery: "Beirut, Lebanon",
  },
};

const TITLE_COUNTRY_PATTERNS = [
  /^([A-ZÇĞİÖŞÜ]+)'A\s+GELD/i,
  /^([A-ZÇĞİÖŞÜ]+)'IN\s+/i,
  /^([A-ZÇĞİÖŞÜ]{4,})\s*[:|]/,
];

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

function parseTitleCountry(title: string) {
  for (const pattern of TITLE_COUNTRY_PATTERNS) {
    const match = title.match(pattern);
    if (!match?.[1]) continue;
    const country = resolveCountry(match[1]);
    if (country) return { ...country, confidence: 0.85 };
  }
  return null;
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

export function parseLocationsFromVideo(title: string, description = ""): PlaceEntry[] {
  const combined = `${title}\n${description}`;
  const places: PlaceEntry[] = [];

  const titleCountry = parseTitleCountry(title);
  if (titleCountry) {
    places.push({
      type: "country",
      countryCode: titleCountry.code,
      countryName: titleCountry.name,
      geocodeQuery: titleCountry.name,
      confidence: titleCountry.confidence,
    });
  }

  for (const tag of extractHashtags(combined)) {
    const city = resolveCity(tag);
    if (city) {
      places.push({
        type: "city",
        countryCode: city.countryCode,
        countryName: city.countryName,
        city: city.city,
        geocodeQuery: city.geocodeQuery,
        confidence: 0.95,
      });
      continue;
    }

    const country = resolveCountry(tag);
    if (country) {
      places.push({
        type: "country",
        countryCode: country.code,
        countryName: country.name,
        geocodeQuery: country.name,
        confidence: 0.9,
      });
    }
  }

  for (const word of title.split(/\s+/)) {
    const cleaned = word.replace(/[^A-ZÇĞİÖŞÜa-zçğıöşü]/g, "");
    const city = resolveCity(cleaned);
    if (city) {
      places.push({
        type: "city",
        countryCode: city.countryCode,
        countryName: city.countryName,
        city: city.city,
        geocodeQuery: city.geocodeQuery,
        confidence: 0.8,
      });
    }
  }

  return dedupePlaces(places);
}
