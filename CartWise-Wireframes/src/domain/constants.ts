import type {Account, PlanStatus, ProfileTab} from './types';

export const AUTH_EMAIL = 'test@gmail.com';
export const AUTH_PASS = 'pass123';

export const STORAGE_KEYS = {
  auth: 'cartwise_demo_auth',
  basket: 'cartwise_web_basket',
  history: 'cartwise_web_history',
  account: 'cartwise_web_account',
  budget: 'cartwise_web_budget',
  confirmed: 'cartwise_web_confirmed',
  lists: 'cartwise_web_lists',
  pantry: 'cartwise_web_pantry',
} as const;

export const SUGERENCIAS = ['leche', 'arroz', 'aceite', 'fideos', 'cerveza'];

export const COMUNAS = [
  'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Lo Barnechea', 'Ñuñoa',
  'La Reina', 'Macul', 'Peñalolén', 'La Florida', 'Puente Alto', 'Maipú',
  'Estación Central', 'Quinta Normal', 'Recoleta', 'Independencia', 'Conchalí',
  'Huechuraba', 'Quilicura', 'Renca', 'Cerrillos', 'Pudahuel', 'San Miguel',
  'San Joaquín', 'La Cisterna', 'El Bosque', 'La Granja', 'San Bernardo',
];

export const SNAPSHOT_FECHA = '2026-06-24';
export const TRANSPARENCY_SNAPSHOT = `Precios referenciales según el último snapshot disponible (${SNAPSHOT_FECHA}).`;

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  pending: 'Pendiente',
  purchased: 'Comprado',
  discarded: 'Descartado',
};

export const PAISES = ['Chile', 'Argentina', 'Perú', 'Bolivia', 'Colombia', 'México', 'España', 'Uruguay'];
export const IDIOMAS = ['Español', 'English', 'Português'];
export const ZONAS_HORARIAS = [
  'America/Santiago (GMT-4)',
  'America/Argentina/Buenos_Aires (GMT-3)',
  'America/Lima (GMT-5)',
  'America/Mexico_City (GMT-6)',
  'Europe/Madrid (GMT+2)',
];
export const MONEDAS = ['CLP — Peso chileno', 'ARS — Peso argentino', 'PEN — Sol', 'USD — Dólar', 'EUR — Euro'];

export const DEFAULT_ACCOUNT: Account = {
  avatarUrl: '',
  username: 'usuario_demo',
  firstName: '',
  lastName: '',
  email: AUTH_EMAIL,
  phone: '',
  country: 'Chile',
  region: 'Región Metropolitana',
  city: 'Santiago',
  address: '',
  postalCode: '',
  language: 'Español',
  timezone: 'America/Santiago (GMT-4)',
  currency: 'CLP — Peso chileno',
  notifyEmail: true,
  notifyPush: false,
  priceAlerts: true,
  twoFactor: false,
};

export const PROFILE_TABS: {id: ProfileTab; label: string}[] = [
  {id: 'cuenta', label: 'Datos de cuenta'},
  {id: 'ubicacion', label: 'Ubicación'},
  {id: 'notificaciones', label: 'Notificaciones'},
  {id: 'seguridad', label: 'Seguridad'},
];

// Supermercados realmente integrados al snapshot. NO incluir Tottus ni Líder
// como cubiertos (plan §6.3): aún no están en el mart.
export const COVERED_STORES = ['Jumbo', 'Santa Isabel', 'Unimarc', 'El Trébol'];
export const COMING_SOON_STORES = ['Tottus', 'Líder'];
