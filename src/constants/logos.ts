export interface LogoOption {
  id: string;
  nombre: string;
  url: string | null;
}

export const PROYECTA_LOGO_URL = 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/proyectalogo.png';
export const PROYECTA_ICON_URL = 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/proyectaicono.png';

export const LOGOS_DISPONIBLES: LogoOption[] = [
  {
    id: 'proyecta',
    nombre: 'Proyecta Digital',
    url: 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/proyecta.jpeg'
  },
  {
    id: 'coteyuc',
    nombre: 'Coteyuc',
    url: 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/coteyuc.jpeg'
  },
  {
    id: 'jscontadores',
    nombre: 'JS Contadores',
    url: 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/jscontadores.png'
  },
  {
    id: 'publicrea',
    nombre: 'Publicrea',
    url: 'https://kfhewlurkhxqzgjyelas.supabase.co/storage/v1/object/public/logos/publicrea.jpeg'
  },
  {
    id: 'sin_logo',
    nombre: 'Sin Logo',
    url: null
  }
];
