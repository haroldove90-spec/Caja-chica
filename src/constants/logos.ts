export interface LogoOption {
  id: string;
  nombre: string;
  url: string | null;
}

export const PROYECTA_LOGO_URL = 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyectalogo.png';
export const PROYECTA_ICON_URL = 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyectaicono.png';

export const LOGOS_DISPONIBLES: LogoOption[] = [
  {
    id: 'proyecta',
    nombre: 'Proyecta Digital',
    url: PROYECTA_LOGO_URL
  },
  {
    id: 'coteyuc',
    nombre: 'Coteyuc',
    url: 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/coteyuc.jpeg'
  },
  {
    id: 'jscontadores',
    nombre: 'JS Contadores',
    url: 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/jscontadores.png'
  },
  {
    id: 'publicrea',
    nombre: 'Publicrea',
    url: 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/publicrea.jpeg'
  },
  {
    id: 'sin_logo',
    nombre: 'Sin Logo',
    url: null
  }
];
