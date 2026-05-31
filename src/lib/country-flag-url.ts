/** ISO 3166-1 alpha-2 bayrak görseli (flagcdn) */
export function countryFlagUrl(countryCode: string, width = 80): string {
  return `https://flagcdn.com/w${width}/${countryCode.toLowerCase()}.png`;
}
