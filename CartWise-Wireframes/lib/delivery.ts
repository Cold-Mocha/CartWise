import type { CheckoutLocation, DeliveryQuote, StoreInfo } from "@/types/cartwise";

export const TEMUCO_DEFAULT_LOCATION = {
  latitude: -38.7359,
  longitude: -72.5904,
  address: "Plaza Anibal Pinto, Temuco",
  comunaSector: "Temuco centro",
} as const;

type DemoBranch = {
  storeLabel: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export const TEMUCO_BRANCHES: DemoBranch[] = [
  {
    storeLabel: "Jumbo",
    name: "Jumbo Portal Temuco",
    address: "Av. Alemania 0671, Temuco",
    latitude: -38.7352,
    longitude: -72.6206,
  },
  {
    storeLabel: "Jumbo",
    name: "Jumbo Los Pablos",
    address: "Av. Los Pablos 02190, Temuco",
    latitude: -38.722,
    longitude: -72.6425,
  },
  {
    storeLabel: "Santa Isabel",
    name: "Santa Isabel Centro",
    address: "Manuel Bulnes 619, Temuco",
    latitude: -38.7392,
    longitude: -72.5922,
  },
  {
    storeLabel: "Santa Isabel",
    name: "Santa Isabel Alemania",
    address: "Av. Alemania 0780, Temuco",
    latitude: -38.7361,
    longitude: -72.619,
  },
  {
    storeLabel: "Unimarc",
    name: "Unimarc Alemania",
    address: "Av. Alemania 0611, Temuco",
    latitude: -38.7347,
    longitude: -72.6183,
  },
  {
    storeLabel: "Unimarc",
    name: "Unimarc Javiera Carrera",
    address: "Av. Javiera Carrera 1065, Temuco",
    latitude: -38.7184,
    longitude: -72.5993,
  },
  {
    storeLabel: "El Trébol",
    name: "Supermercado El Trebol Centro",
    address: "Av. Arturo Prat 565, Temuco",
    latitude: -38.7395,
    longitude: -72.5904,
  },
  {
    storeLabel: "El Trébol",
    name: "Supermercado El Trebol Recabarren",
    address: "Av. Luis Durand 02150, Temuco",
    latitude: -38.7546,
    longitude: -72.6112,
  },
];

function normalizeStoreName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .trim();
}

export function haversineKm(
  from: Pick<CheckoutLocation, "latitude" | "longitude">,
  to: Pick<CheckoutLocation, "latitude" | "longitude">,
) {
  const earthRadiusKm = 6371;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRad(to.latitude - from.latitude);
  const deltaLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function deliveryPrice(distanceKm: number) {
  const raw = 1990 + distanceKm * 450;
  const rounded = Math.round(raw / 100) * 100;
  return Math.min(5990, Math.max(1990, rounded));
}

export function nearestBranch(storeLabel: string, location: CheckoutLocation) {
  const normalized = normalizeStoreName(storeLabel);
  const branches = TEMUCO_BRANCHES.filter(
    (branch) => normalizeStoreName(branch.storeLabel) === normalized,
  );
  const candidates = branches.length > 0 ? branches : TEMUCO_BRANCHES;
  return candidates
    .map((branch) => ({
      branch,
      distanceKm: haversineKm(location, branch),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
}

export function buildDeliveryQuote(
  store: StoreInfo,
  location: CheckoutLocation,
  hasProducts: boolean,
): DeliveryQuote {
  const nearest = nearestBranch(store.label, location);
  return {
    storeId: store.id,
    storeLabel: store.label,
    branchName: nearest.branch.name,
    branchAddress: nearest.branch.address,
    branchLatitude: nearest.branch.latitude,
    branchLongitude: nearest.branch.longitude,
    distanceKm: nearest.distanceKm,
    price: deliveryPrice(nearest.distanceKm),
    hasProducts,
  };
}
