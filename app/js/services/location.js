// Détection de la zone par la géolocalisation du navigateur, avec l'autorisation de la personne.
// Les coordonnées servent uniquement à choisir la zone, puis sont oubliées.
import { CONFIG } from '../config.js';
import { zoneForPosition, zoneById } from '../data/zones.js';

// status : idle | prompt | locating | ready | outside | denied | unavailable | unsupported
let state = { status: 'idle', zoneId: null };
const listeners = new Set();

function set(next) {
  state = { ...state, ...next };
  listeners.forEach((l) => l(state));
}

export const locator = {
  get: () => state,
  zone: () => (state.status === 'ready' ? zoneById(state.zoneId) : null),
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

function geolocation() {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator ? navigator.geolocation : null;
}

/** Vérifie la permission existante sans afficher de demande. Localise seulement si elle est déjà accordée. */
export async function initLocation() {
  if (!geolocation()) return set({ status: 'unsupported' });
  try {
    const permission = await navigator.permissions?.query({ name: 'geolocation' });
    if (permission?.state === 'granted') return requestLocation();
    if (permission?.state === 'denied') return set({ status: 'denied' });
  } catch {
    // API Permissions absente : on attend l'action explicite de la personne.
  }
  set({ status: 'prompt' });
}

/** Demande la position (déclenche la fenêtre d'autorisation du navigateur si nécessaire). */
export function requestLocation() {
  const geo = geolocation();
  if (!geo) return set({ status: 'unsupported' });
  set({ status: 'locating' });
  geo.getCurrentPosition(
    (pos) => {
      const zone = zoneForPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      set(zone ? { status: 'ready', zoneId: zone.id } : { status: 'outside', zoneId: null });
    },
    (err) => set({ status: err && err.code === 1 ? 'denied' : 'unavailable', zoneId: null }),
    { enableHighAccuracy: false, timeout: CONFIG.geolocationTimeoutMs, maximumAge: 10 * 60 * 1000 },
  );
}
