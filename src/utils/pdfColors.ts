export interface PDFColorStyle {
  bg: string;
  text: string;
  border?: string;
}

// Preset color mapping matching user's reference image for companies and giros
export const COMPANY_COLOR_PRESETS: Record<string, PDFColorStyle> = {
  'TALLER COTEYUC': { bg: '#FF00FF', text: '#000000', border: '#000000' }, // Bright Pink / Magenta
  'TALLER PROYECTA': { bg: '#965A28', text: '#FFFFFF', border: '#000000' }, // Brown
  'PROYECTA': { bg: '#FFB703', text: '#000000', border: '#000000' }, // Gold / Orange
  'COTEYUC': { bg: '#00B0FF', text: '#000000', border: '#000000' }, // Bright Blue
  'PUBLIKREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Bright Yellow
  'PUBLICREA': { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Bright Yellow
  'OTROS': { bg: '#FFF9A6', text: '#000000', border: '#000000' }, // Light Cream / Yellow
  'LOCAL HOCABA': { bg: '#E0E0E0', text: '#000000', border: '#000000' }, // Light Gray
  'HOCABA': { bg: '#E0E0E0', text: '#000000', border: '#000000' }, // Light Gray
  'DESPACHO': { bg: '#90EE90', text: '#000000', border: '#000000' }, // Light Green
  'JS CONTADORES': { bg: '#C7D2FE', text: '#000000', border: '#000000' }, // Soft Indigo
};

// Vibrant fallback palette to color-code rows when no preset matches
export const VIBRANT_PDF_PALETTE: PDFColorStyle[] = [
  { bg: '#FF00FF', text: '#000000', border: '#000000' }, // Magenta
  { bg: '#965A28', text: '#FFFFFF', border: '#000000' }, // Brown
  { bg: '#FFB703', text: '#000000', border: '#000000' }, // Gold / Orange
  { bg: '#00B0FF', text: '#000000', border: '#000000' }, // Bright Blue
  { bg: '#FFFF00', text: '#000000', border: '#000000' }, // Bright Yellow
  { bg: '#FFF9A6', text: '#000000', border: '#000000' }, // Soft Yellow
  { bg: '#E0E0E0', text: '#000000', border: '#000000' }, // Light Gray
  { bg: '#90EE90', text: '#000000', border: '#000000' }, // Light Green
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
