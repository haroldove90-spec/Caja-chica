export interface PDFColorStyle {
  bg: string;
  text: string;
  border?: string;
}

// Preset color mapping matching user's reference image for companies and giros
export const COMPANY_COLOR_PRESETS: Record<string, PDFColorStyle> = {
  'TALLER COTEYUC': { bg: '#5CE1E6', text: '#000000', border: '#000000' }, // Celeste Cian (Pantone 310 C)
  'TALLER PROYECTA': { bg: '#C779C7', text: '#000000', border: '#000000' }, // Lila / Orquidea (Pantone 251 C)
  'PROYECTA': { bg: '#FFA800', text: '#000000', border: '#000000' }, // Naranja Ambar (Pantone 137 C)
  'COTEYUC': { bg: '#00AEEF', text: '#000000', border: '#000000' }, // Azul Cielo Vibrante (Pantone 299 C)
  'PUBLIKREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario (Pantone Yellow C)
  'PUBLICREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario (Pantone Yellow C)
  'OTROS': { bg: '#FFD1D1', text: '#000000', border: '#000000' }, // Rosa Palido (Pantone 705 C)
  'LOCAL HOCABA': { bg: '#D9D9D9', text: '#000000', border: '#000000' }, // Gris Claro (Pantone Cool Gray 3 C)
  'HOCABA': { bg: '#D9D9D9', text: '#000000', border: '#000000' }, // Gris Claro (Pantone Cool Gray 3 C)
  'DESPACHO': { bg: '#A8D5A2', text: '#000000', border: '#000000' }, // Verde Menta / Pistache (Pantone 358 C)
  'JS CONTADORES': { bg: '#C7D2FE', text: '#000000', border: '#000000' }, // Soft Indigo
};

// Vibrant fallback palette to color-code rows when no preset matches
export const VIBRANT_PDF_PALETTE: PDFColorStyle[] = [
  { bg: '#5CE1E6', text: '#000000', border: '#000000' }, // Celeste Cian
  { bg: '#C779C7', text: '#000000', border: '#000000' }, // Lila / Orquidea
  { bg: '#FFA800', text: '#000000', border: '#000000' }, // Naranja Ambar
  { bg: '#00AEEF', text: '#000000', border: '#000000' }, // Azul Cielo
  { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario
  { bg: '#FFD1D1', text: '#000000', border: '#000000' }, // Rosa Palido
  { bg: '#D9D9D9', text: '#000000', border: '#000000' }, // Gris Claro
  { bg: '#A8D5A2', text: '#000000', border: '#000000' }, // Verde Menta
  { bg: '#F472B6', text: '#000000', border: '#000000' }, // Pink
  { bg: '#38BDF8', text: '#000000', border: '#000000' }, // Sky Blue
  { bg: '#FB923C', text: '#000000', border: '#000000' }, // Light Orange
  { bg: '#A78BFA', text: '#000000', border: '#000000' }, // Purple
];

export function getPdfRowColor(label?: string | null, index: number = 0): PDFColorStyle {
  if (!label || typeof label !== 'string') {
    return VIBRANT_PDF_PALETTE[index % VIBRANT_PDF_PALETTE.length];
  }

  const cleanLabel = label.trim().toUpperCase();

  // 1. Check exact preset keys or substring matches
  for (const [key, style] of Object.entries(COMPANY_COLOR_PRESETS)) {
    if (cleanLabel === key || cleanLabel.includes(key) || key.includes(cleanLabel)) {
      return style;
    }
  }

  // 2. Specific keyword matches
  if (cleanLabel.includes('TALLER') && cleanLabel.includes('COTEYUC')) return COMPANY_COLOR_PRESETS['TALLER COTEYUC'];
  if (cleanLabel.includes('TALLER') && cleanLabel.includes('PROYECTA')) return COMPANY_COLOR_PRESETS['TALLER PROYECTA'];
  if (cleanLabel.includes('PROYECTA')) return COMPANY_COLOR_PRESETS['PROYECTA'];
  if (cleanLabel.includes('COTEYUC')) return COMPANY_COLOR_PRESETS['COTEYUC'];
  if (cleanLabel.includes('PUBLI') || cleanLabel.includes('PUBLICREA')) return COMPANY_COLOR_PRESETS['PUBLIKREA'];
  if (cleanLabel.includes('DESPACHO')) return COMPANY_COLOR_PRESETS['DESPACHO'];
  if (cleanLabel.includes('HOCABA')) return COMPANY_COLOR_PRESETS['LOCAL HOCABA'];
  if (cleanLabel.includes('OTRO') || cleanLabel.includes('VARIO') || cleanLabel.includes('GENERAL')) return COMPANY_COLOR_PRESETS['OTROS'];

  // 3. Fallback to palette cycle
  return VIBRANT_PDF_PALETTE[index % VIBRANT_PDF_PALETTE.length];
}
