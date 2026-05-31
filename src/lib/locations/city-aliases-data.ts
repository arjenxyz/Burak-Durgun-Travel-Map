export type CityAlias = {
  city: string;
  countryCode: string;
  countryName: string;
  geocodeQuery: string;
};

/** Şehir alias'ları — normalizeKey ile eşleşir (Türkçe karakterler dahil) */
export const CITY_ALIASES_DATA: Record<string, CityAlias> = {
  // Morocco
  fes: { city: "Fes", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Fes, Morocco" },
  fez: { city: "Fes", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Fes, Morocco" },
  marakes: { city: "Marrakech", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Marrakech, Morocco" },
  marakesh: { city: "Marrakech", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Marrakech, Morocco" },
  marrakech: { city: "Marrakech", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Marrakech, Morocco" },
  kazablanka: { city: "Casablanca", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Casablanca, Morocco" },
  casablanca: { city: "Casablanca", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Casablanca, Morocco" },
  rabat: { city: "Rabat", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Rabat, Morocco" },
  tanger: { city: "Tangier", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Tangier, Morocco" },
  tangier: { city: "Tangier", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Tangier, Morocco" },
  chefchaouen: { city: "Chefchaouen", countryCode: "MA", countryName: "Morocco", geocodeQuery: "Chefchaouen, Morocco" },

  // Spain
  sevilla: { city: "Seville", countryCode: "ES", countryName: "Spain", geocodeQuery: "Seville, Spain" },
  seville: { city: "Seville", countryCode: "ES", countryName: "Spain", geocodeQuery: "Seville, Spain" },
  barselona: { city: "Barcelona", countryCode: "ES", countryName: "Spain", geocodeQuery: "Barcelona, Spain" },
  barcelona: { city: "Barcelona", countryCode: "ES", countryName: "Spain", geocodeQuery: "Barcelona, Spain" },
  madrid: { city: "Madrid", countryCode: "ES", countryName: "Spain", geocodeQuery: "Madrid, Spain" },
  valencia: { city: "Valencia", countryCode: "ES", countryName: "Spain", geocodeQuery: "Valencia, Spain" },
  granada: { city: "Granada", countryCode: "ES", countryName: "Spain", geocodeQuery: "Granada, Spain" },
  malaga: { city: "Malaga", countryCode: "ES", countryName: "Spain", geocodeQuery: "Malaga, Spain" },
  ibiza: { city: "Ibiza", countryCode: "ES", countryName: "Spain", geocodeQuery: "Ibiza, Spain" },

  // Brazil
  rio: { city: "Rio de Janeiro", countryCode: "BR", countryName: "Brazil", geocodeQuery: "Rio de Janeiro, Brazil" },
  riodejaneiro: { city: "Rio de Janeiro", countryCode: "BR", countryName: "Brazil", geocodeQuery: "Rio de Janeiro, Brazil" },
  saopaulo: { city: "Sao Paulo", countryCode: "BR", countryName: "Brazil", geocodeQuery: "Sao Paulo, Brazil" },
  salvador: { city: "Salvador", countryCode: "BR", countryName: "Brazil", geocodeQuery: "Salvador, Brazil" },

  // Argentina & Chile
  buenosaires: { city: "Buenos Aires", countryCode: "AR", countryName: "Argentina", geocodeQuery: "Buenos Aires, Argentina" },
  santiago: { city: "Santiago", countryCode: "CL", countryName: "Chile", geocodeQuery: "Santiago, Chile" },

  // Colombia & Mexico
  bogota: { city: "Bogota", countryCode: "CO", countryName: "Colombia", geocodeQuery: "Bogota, Colombia" },
  medellin: { city: "Medellin", countryCode: "CO", countryName: "Colombia", geocodeQuery: "Medellin, Colombia" },
  cartagena: { city: "Cartagena", countryCode: "CO", countryName: "Colombia", geocodeQuery: "Cartagena, Colombia" },
  cancun: { city: "Cancun", countryCode: "MX", countryName: "Mexico", geocodeQuery: "Cancun, Mexico" },
  mexicocity: { city: "Mexico City", countryCode: "MX", countryName: "Mexico", geocodeQuery: "Mexico City, Mexico" },

  // Asia
  tokyo: { city: "Tokyo", countryCode: "JP", countryName: "Japan", geocodeQuery: "Tokyo, Japan" },
  osaka: { city: "Osaka", countryCode: "JP", countryName: "Japan", geocodeQuery: "Osaka, Japan" },
  kyoto: { city: "Kyoto", countryCode: "JP", countryName: "Japan", geocodeQuery: "Kyoto, Japan" },
  seoul: { city: "Seoul", countryCode: "KR", countryName: "South Korea", geocodeQuery: "Seoul, South Korea" },
  bangkok: { city: "Bangkok", countryCode: "TH", countryName: "Thailand", geocodeQuery: "Bangkok, Thailand" },
  phuket: { city: "Phuket", countryCode: "TH", countryName: "Thailand", geocodeQuery: "Phuket, Thailand" },
  chiangmai: { city: "Chiang Mai", countryCode: "TH", countryName: "Thailand", geocodeQuery: "Chiang Mai, Thailand" },
  hanoi: { city: "Hanoi", countryCode: "VN", countryName: "Vietnam", geocodeQuery: "Hanoi, Vietnam" },
  hochiminh: { city: "Ho Chi Minh City", countryCode: "VN", countryName: "Vietnam", geocodeQuery: "Ho Chi Minh City, Vietnam" },
  saigon: { city: "Ho Chi Minh City", countryCode: "VN", countryName: "Vietnam", geocodeQuery: "Ho Chi Minh City, Vietnam" },
  bali: { city: "Denpasar", countryCode: "ID", countryName: "Indonesia", geocodeQuery: "Bali, Indonesia" },
  jakarta: { city: "Jakarta", countryCode: "ID", countryName: "Indonesia", geocodeQuery: "Jakarta, Indonesia" },
  kualalumpur: { city: "Kuala Lumpur", countryCode: "MY", countryName: "Malaysia", geocodeQuery: "Kuala Lumpur, Malaysia" },
  singapore: { city: "Singapore", countryCode: "SG", countryName: "Singapore", geocodeQuery: "Singapore" },
  delhi: { city: "New Delhi", countryCode: "IN", countryName: "India", geocodeQuery: "New Delhi, India" },
  mumbai: { city: "Mumbai", countryCode: "IN", countryName: "India", geocodeQuery: "Mumbai, India" },
  goa: { city: "Goa", countryCode: "IN", countryName: "India", geocodeQuery: "Goa, India" },

  // Middle East & Central Asia
  dubai: { city: "Dubai", countryCode: "AE", countryName: "United Arab Emirates", geocodeQuery: "Dubai, UAE" },
  abudhabi: { city: "Abu Dhabi", countryCode: "AE", countryName: "United Arab Emirates", geocodeQuery: "Abu Dhabi, UAE" },
  kahire: { city: "Cairo", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Cairo, Egypt" },
  cairo: { city: "Cairo", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Cairo, Egypt" },
  luxor: { city: "Luxor", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Luxor, Egypt" },
  alexandria: { city: "Alexandria", countryCode: "EG", countryName: "Egypt", geocodeQuery: "Alexandria, Egypt" },
  amman: { city: "Amman", countryCode: "JO", countryName: "Jordan", geocodeQuery: "Amman, Jordan" },
  petra: { city: "Petra", countryCode: "JO", countryName: "Jordan", geocodeQuery: "Petra, Jordan" },
  beirut: { city: "Beirut", countryCode: "LB", countryName: "Lebanon", geocodeQuery: "Beirut, Lebanon" },
  tbilisi: { city: "Tbilisi", countryCode: "GE", countryName: "Georgia", geocodeQuery: "Tbilisi, Georgia" },
  batumi: { city: "Batumi", countryCode: "GE", countryName: "Georgia", geocodeQuery: "Batumi, Georgia" },
  baku: { city: "Baku", countryCode: "AZ", countryName: "Azerbaijan", geocodeQuery: "Baku, Azerbaijan" },
  taskent: { city: "Tashkent", countryCode: "UZ", countryName: "Uzbekistan", geocodeQuery: "Tashkent, Uzbekistan" },
  samarkand: { city: "Samarkand", countryCode: "UZ", countryName: "Uzbekistan", geocodeQuery: "Samarkand, Uzbekistan" },

  // Turkey — major cities & travel destinations
  istanbul: { city: "Istanbul", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Istanbul, Turkey" },
  ankara: { city: "Ankara", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Ankara, Turkey" },
  izmir: { city: "Izmir", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Izmir, Turkey" },
  antalya: { city: "Antalya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Antalya, Turkey" },
  bursa: { city: "Bursa", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Bursa, Turkey" },
  trabzon: { city: "Trabzon", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Trabzon, Turkey" },
  gaziantep: { city: "Gaziantep", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Gaziantep, Turkey" },
  konya: { city: "Konya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Konya, Turkey" },
  adana: { city: "Adana", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Adana, Turkey" },
  mersin: { city: "Mersin", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Mersin, Turkey" },
  diyarbakir: { city: "Diyarbakir", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Diyarbakir, Turkey" },
  eskisehir: { city: "Eskisehir", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Eskisehir, Turkey" },
  kayseri: { city: "Kayseri", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Kayseri, Turkey" },
  bodrum: { city: "Bodrum", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Bodrum, Turkey" },
  fethiye: { city: "Fethiye", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Fethiye, Turkey" },
  marmaris: { city: "Marmaris", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Marmaris, Turkey" },
  alanya: { city: "Alanya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Alanya, Turkey" },
  kusadasi: { city: "Kusadasi", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Kusadasi, Turkey" },
  cesme: { city: "Cesme", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Cesme, Turkey" },
  kapadokya: { city: "Goreme", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Cappadocia, Turkey" },
  cappadocia: { city: "Goreme", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Cappadocia, Turkey" },
  goreme: { city: "Goreme", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Goreme, Turkey" },
  nevsehir: { city: "Nevsehir", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Nevsehir, Turkey" },
  pamukkale: { city: "Pamukkale", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Pamukkale, Turkey" },
  denizli: { city: "Denizli", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Denizli, Turkey" },
  canakkale: { city: "Canakkale", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Canakkale, Turkey" },
  mugla: { city: "Mugla", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Mugla, Turkey" },
  van: { city: "Van", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Van, Turkey" },
  erzurum: { city: "Erzurum", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Erzurum, Turkey" },
  samsun: { city: "Samsun", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Samsun, Turkey" },
  malatya: { city: "Malatya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Malatya, Turkey" },
  sanliurfa: { city: "Sanliurfa", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Sanliurfa, Turkey" },
  urfa: { city: "Sanliurfa", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Sanliurfa, Turkey" },
  mardin: { city: "Mardin", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Mardin, Turkey" },
  antakya: { city: "Antakya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Antakya, Turkey" },
  hatay: { city: "Antakya", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Antakya, Turkey" },
  rize: { city: "Rize", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Rize, Turkey" },
  ayder: { city: "Ayder", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Ayder, Turkey" },
  edirne: { city: "Edirne", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Edirne, Turkey" },
  safranbolu: { city: "Safranbolu", countryCode: "TR", countryName: "Turkey", geocodeQuery: "Safranbolu, Turkey" },

  // Europe
  paris: { city: "Paris", countryCode: "FR", countryName: "France", geocodeQuery: "Paris, France" },
  nice: { city: "Nice", countryCode: "FR", countryName: "France", geocodeQuery: "Nice, France" },
  lyon: { city: "Lyon", countryCode: "FR", countryName: "France", geocodeQuery: "Lyon, France" },
  londra: { city: "London", countryCode: "GB", countryName: "United Kingdom", geocodeQuery: "London, UK" },
  london: { city: "London", countryCode: "GB", countryName: "United Kingdom", geocodeQuery: "London, UK" },
  berlin: { city: "Berlin", countryCode: "DE", countryName: "Germany", geocodeQuery: "Berlin, Germany" },
  munich: { city: "Munich", countryCode: "DE", countryName: "Germany", geocodeQuery: "Munich, Germany" },
  hamburg: { city: "Hamburg", countryCode: "DE", countryName: "Germany", geocodeQuery: "Hamburg, Germany" },
  amsterdam: { city: "Amsterdam", countryCode: "NL", countryName: "Netherlands", geocodeQuery: "Amsterdam, Netherlands" },
  brussels: { city: "Brussels", countryCode: "BE", countryName: "Belgium", geocodeQuery: "Brussels, Belgium" },
  bruxelles: { city: "Brussels", countryCode: "BE", countryName: "Belgium", geocodeQuery: "Brussels, Belgium" },
  rome: { city: "Rome", countryCode: "IT", countryName: "Italy", geocodeQuery: "Rome, Italy" },
  roma: { city: "Rome", countryCode: "IT", countryName: "Italy", geocodeQuery: "Rome, Italy" },
  milan: { city: "Milan", countryCode: "IT", countryName: "Italy", geocodeQuery: "Milan, Italy" },
  milano: { city: "Milan", countryCode: "IT", countryName: "Italy", geocodeQuery: "Milan, Italy" },
  venice: { city: "Venice", countryCode: "IT", countryName: "Italy", geocodeQuery: "Venice, Italy" },
  venedik: { city: "Venice", countryCode: "IT", countryName: "Italy", geocodeQuery: "Venice, Italy" },
  naples: { city: "Naples", countryCode: "IT", countryName: "Italy", geocodeQuery: "Naples, Italy" },
  napoli: { city: "Naples", countryCode: "IT", countryName: "Italy", geocodeQuery: "Naples, Italy" },
  florence: { city: "Florence", countryCode: "IT", countryName: "Italy", geocodeQuery: "Florence, Italy" },
  floransa: { city: "Florence", countryCode: "IT", countryName: "Italy", geocodeQuery: "Florence, Italy" },
  athens: { city: "Athens", countryCode: "GR", countryName: "Greece", geocodeQuery: "Athens, Greece" },
  atina: { city: "Athens", countryCode: "GR", countryName: "Greece", geocodeQuery: "Athens, Greece" },
  santorini: { city: "Santorini", countryCode: "GR", countryName: "Greece", geocodeQuery: "Santorini, Greece" },
  mykonos: { city: "Mykonos", countryCode: "GR", countryName: "Greece", geocodeQuery: "Mykonos, Greece" },
  budapest: { city: "Budapest", countryCode: "HU", countryName: "Hungary", geocodeQuery: "Budapest, Hungary" },
  belgrad: { city: "Belgrade", countryCode: "RS", countryName: "Serbia", geocodeQuery: "Belgrade, Serbia" },
  prague: { city: "Prague", countryCode: "CZ", countryName: "Czechia", geocodeQuery: "Prague, Czechia" },
  praha: { city: "Prague", countryCode: "CZ", countryName: "Czechia", geocodeQuery: "Prague, Czechia" },
  warsaw: { city: "Warsaw", countryCode: "PL", countryName: "Poland", geocodeQuery: "Warsaw, Poland" },
  varsova: { city: "Warsaw", countryCode: "PL", countryName: "Poland", geocodeQuery: "Warsaw, Poland" },
  krakow: { city: "Krakow", countryCode: "PL", countryName: "Poland", geocodeQuery: "Krakow, Poland" },
  vienna: { city: "Vienna", countryCode: "AT", countryName: "Austria", geocodeQuery: "Vienna, Austria" },
  viyana: { city: "Vienna", countryCode: "AT", countryName: "Austria", geocodeQuery: "Vienna, Austria" },
  zurich: { city: "Zurich", countryCode: "CH", countryName: "Switzerland", geocodeQuery: "Zurich, Switzerland" },
  geneva: { city: "Geneva", countryCode: "CH", countryName: "Switzerland", geocodeQuery: "Geneva, Switzerland" },
  cenevre: { city: "Geneva", countryCode: "CH", countryName: "Switzerland", geocodeQuery: "Geneva, Switzerland" },
  lisbon: { city: "Lisbon", countryCode: "PT", countryName: "Portugal", geocodeQuery: "Lisbon, Portugal" },
  lisboa: { city: "Lisbon", countryCode: "PT", countryName: "Portugal", geocodeQuery: "Lisbon, Portugal" },
  porto: { city: "Porto", countryCode: "PT", countryName: "Portugal", geocodeQuery: "Porto, Portugal" },

  // Americas & Oceania
  newyork: { city: "New York", countryCode: "US", countryName: "United States", geocodeQuery: "New York, USA" },
  losangeles: { city: "Los Angeles", countryCode: "US", countryName: "United States", geocodeQuery: "Los Angeles, USA" },
  miami: { city: "Miami", countryCode: "US", countryName: "United States", geocodeQuery: "Miami, USA" },
  lasvegas: { city: "Las Vegas", countryCode: "US", countryName: "United States", geocodeQuery: "Las Vegas, USA" },
  sanfrancisco: { city: "San Francisco", countryCode: "US", countryName: "United States", geocodeQuery: "San Francisco, USA" },
  sydney: { city: "Sydney", countryCode: "AU", countryName: "Australia", geocodeQuery: "Sydney, Australia" },
  melbourne: { city: "Melbourne", countryCode: "AU", countryName: "Australia", geocodeQuery: "Melbourne, Australia" },

  // Africa
  capetown: { city: "Cape Town", countryCode: "ZA", countryName: "South Africa", geocodeQuery: "Cape Town, South Africa" },
  nairobi: { city: "Nairobi", countryCode: "KE", countryName: "Kenya", geocodeQuery: "Nairobi, Kenya" },
  dakar: { city: "Dakar", countryCode: "SN", countryName: "Senegal", geocodeQuery: "Dakar, Senegal" },
};

/** Ülke kodu → o ülkedeki şehir alias anahtarları (uzundan kısaya) */
export function cityKeysByCountry(): Map<string, string[]> {
  const byCountry = new Map<string, string[]>();
  for (const [key, city] of Object.entries(CITY_ALIASES_DATA)) {
    const list = byCountry.get(city.countryCode) ?? [];
    list.push(key);
    byCountry.set(city.countryCode, list);
  }
  for (const [code, keys] of byCountry) {
    byCountry.set(
      code,
      [...keys].sort((a, b) => b.length - a.length),
    );
  }
  return byCountry;
}
