export const GOOGLE_FONTS = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Lato',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather'
] as const

export type GoogleFont = typeof GOOGLE_FONTS[number]

// URL pour charger les fonts depuis Google Fonts
export function getGoogleFontsUrl(fonts: string[]): string {
  const fontParams = fonts.map(f => f.replace(' ', '+')).join('&family=')
  return `https://fonts.googleapis.com/css2?family=${fontParams}&display=swap`
}