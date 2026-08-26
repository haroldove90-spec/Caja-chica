export interface PDFColorStyle {
  bg: string;
  text: string;
  border?: string;
}

// Preset color mapping matching user's reference image for companies and giros with warmer, more saturated vibrant tones
export const COMPANY_COLOR_PRESETS: Record<string, PDFColorStyle> = {
  'TALLER COTEYUC': { bg: '#18E0F7', text: '#000000', border: '#000000' }, // Celeste Cian Brillante Vivo (Pantone 305 C)
  'TALLER PROYECTA': { bg: '#D870D8', text: '#000000', border: '#000000' }, // Lila / Orquídea Cálido Saturado (Pantone 245 C)
  'PROYECTA': { bg: '#FF9900', text: '#000000', border: '#000000' }, // Amarillo-Naranja / Ámbar Intenso (Pantone 1375 C)
  'COTEYUC': { bg: '#0099FF', text: '#000000', border: '#000000' }, // Azul Cielo Intenso Saturado (Pantone 2925 C)
  'PUBLIKREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario Eléctrico (Pantone Process Yellow C)
  'PUBLICREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario Eléctrico (Pantone Process Yellow C)
  'OTROS': { bg: '#FFB8C6', text: '#000000', border: '#000000' }, // Rosa Pálido Cálido Intenso (Pantone 706 C)
  'LOCAL HOCABA': { bg: '#CCCCCC', text: '#000000', border: '#000000' }, // Gris Medio Sólido (Pantone Cool Gray 4 C)
  'HOCABA': { bg: '#CCCCCC', text: '#000000', border: '#000000' }, // Gris Medio Sólido (Pantone Cool Gray 4 C)
  'DESPACHO': { bg: '#92E088', text: '#000000', border: '#000000' }, // Verde Pistache / Menta Cálido y Vivo (Pantone 366 C)
  'JS CONTADORES': { bg: '#B4C6FC', text: '#000000', border: '#000000' }, // Soft Indigo
};

// Vibrant fallback palette to color-code rows when no preset matches
export const VIBRANT_PDF_PALETTE: PDFColorStyle[] = [
  { bg: '#18E0F7', text: '#000000', border: '#000000' }, // Celeste Cian Vivo
  { bg: '#D870D8', text: '#000000', border: '#000000' }, // Lila / Orquídea Cálido
  { bg: '#FF9900', text: '#000000', border: '#000000' }, // Amarillo-Naranja Ámbar Intenso
  { bg: '#0099FF', text: '#000000', border: '#000000' }, // Azul Cielo Intenso
  { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Amarillo Canario
  { bg: '#FFB8C6', text: '#000000', border: '#000000' }, // Rosa Pálido Cálido
  { bg: '#CCCCCC', text: '#000000', border: '#000000' }, // Gris Medio Sólido
  { bg: '#92E088', text: '#000000', border: '#000000' }, // Verde Pistache / Menta Cálido
  { bg: '#FF69B4', text: '#000000', border: '#000000' }, // Hot Pink
  { bg: '#00BFFF', text: '#000000', border: '#000000' }, // Deep Sky Blue
  { bg: '#FF8C00', text: '#000000', border: '#000000' }, // Dark Orange
  { bg: '#BA55D3', text: '#000000', border: '#000000' }, // Medium Orchid
];

export function getPdfRowColor(label?: string | null, index: number = 0): PDFColorStyle {
  if (!label || typeof label !== 'string') {
    return VIBRANT_PDF_PALETTE[index % VIBRANT_PDF_PALETTE.length];
  }

  const cleanLabel = label.trim().toUpperCase();

  // 1. Exact matches first
  if (COMPANY_COLOR_PRESETS[cleanLabel]) {
    return COMPANY_COLOR_PRESETS[cleanLabel];
  }

  // 2. Specific compound keyword matches
  if (cleanLabel.includes('TALLER') && cleanLabel.includes('COTEYUC')) return COMPANY_COLOR_PRESETS['TALLER COTEYUC'];
  if (cleanLabel.includes('TALLER') && cleanLabel.includes('PROYECTA')) return COMPANY_COLOR_PRESETS['TALLER PROYECTA'];
  if (cleanLabel.includes('PROYECTA')) return COMPANY_COLOR_PRESETS['PROYECTA'];
  if (cleanLabel.includes('COTEYUC')) return COMPANY_COLOR_PRESETS['COTEYUC'];
  if (cleanLabel.includes('PUBLI') || cleanLabel.includes('PUBLICREA')) return COMPANY_COLOR_PRESETS['PUBLIKREA'];
  if (cleanLabel.includes('DESPACHO')) return COMPANY_COLOR_PRESETS['DESPACHO'];
  if (cleanLabel.includes('HOCABA')) return COMPANY_COLOR_PRESETS['LOCAL HOCABA'];
  if (cleanLabel.includes('OTRO') || cleanLabel.includes('VARIO') || cleanLabel.includes('GENERAL')) return COMPANY_COLOR_PRESETS['OTROS'];

  // 3. Substring match against keys
  for (const [key, style] of Object.entries(COMPANY_COLOR_PRESETS)) {
    if (cleanLabel.includes(key) || key.includes(cleanLabel)) {
      return style;
    }
  }

  // 4. Fallback to palette cycle
  return VIBRANT_PDF_PALETTE[index % VIBRANT_PDF_PALETTE.length];
}
