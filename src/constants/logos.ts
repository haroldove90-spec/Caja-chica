export interface LogoOption {
  id: string;
  nombre: string;
  url: string | null;
}

export const LOGOS_DISPONIBLES: LogoOption[] = [
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
    id: 'proyecta',
    nombre: 'Proyecta Digital',
    url: 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyecta.jpeg'
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
