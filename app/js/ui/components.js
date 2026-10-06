// Composants d'interface partagés (chaînes HTML). Tout texte dynamique passe par esc().
import { ICONS } from './icons.js';
import { PARTICIPANT_AVATARS } from '../data/events.js';
import { participantCount, isJoined, store } from '../services/store.js';
import { locator } from '../services/location.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function icon(name, cls = '') {
  return `<span class="icon ${cls}" aria-hidden="true">${ICONS[name] || ''}</span>`;
}

const MONTHS_SHORT = ['JANV', 'FÉVR', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];
const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function parts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

export const fmt = {
  dayShort: (iso) => { const { m, d } = parts(iso); return `${String(d).padStart(2, '0')} ${MONTHS_SHORT[m - 1]}`; },
  dayLong: (iso) => { const { m, d } = parts(iso); return `${d} ${MONTHS_LONG[m - 1]}`; },
  // « 20:00 » -> « 20 h », « 14:22 » -> « 14 h 22 »
  // Heure d'un message, toujours avec les minutes : « 14 h 05 »
  clock: (hhmm) => { const [h, m] = hhmm.split(':'); return `${Number(h)} h ${m}`; },
  time: (hhmm) => { const [h, m] = hhmm.split(':'); return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`; },
};

export function avatarStack(event, size = 'md') {
  const count = participantCount(event);
  const own = isJoined(event.id) ? store.get().profile?.photo : null;
  const pics = (own ? [own, ...PARTICIPANT_AVATARS] : PARTICIPANT_AVATARS).slice(0, size === 'sm' ? 3 : 4);
  const more = Math.max(0, count - pics.length);
  return `<div class="avatars avatars--${size}">
    <div class="avatars__stack" aria-hidden="true">
      ${pics.map((src) => `<img src="${esc(src)}" alt="" loading="lazy">`).join('')}
      ${more ? `<span class="avatars__more">+${more}</span>` : ''}
    </div>
    <span class="avatars__count" data-testid="participants">${count} participants</span>
  </div>`;
}

export function kindBadge(event, cls = '') {
  if (event.minimumAge) return `<span class="badge ${cls}">${event.minimumAge}+</span>`;
  return `<span class="badge ${cls}">Meet-up</span>`;
}

export function fictionalTag(event) {
  return event.fictional ? `<span class="tag-fictional">Exemple fictif</span>` : '';
}

export function demoNote(text) {
  return `<p class="demo-note" role="note"><span class="demo-note__label">Mode démo</span> ${esc(text)}</p>`;
}

export function photo(src, alt, cls = '') {
  return `<div class="photo ${cls}"><img src="${esc(src)}" alt="${esc(alt)}" loading="lazy"></div>`;
}

/** Ligne de localisation sous le logo. */
export function locationLine() {
  const { status } = locator.get();
  const zone = locator.zone();
  const pin = icon('pin', 'icon--sm');
  switch (status) {
    case 'ready':
      return `<p class="loc-line" data-testid="loc-line">${pin}<span>${esc(zone.label)}</span></p>`;
    case 'locating':
      return `<p class="loc-line" data-testid="loc-line" aria-live="polite">${pin}<span>Localisation…</span></p>`;
    case 'prompt':
    case 'idle':
      return `<p class="loc-line" data-testid="loc-line"><button class="loc-line__action" data-action="locate">${pin}<span>Activer ma localisation</span></button></p>`;
    case 'outside':
      return `<p class="loc-line" data-testid="loc-line">${pin}<span>Hors des zones Catai</span></p>`;
    case 'denied':
      return `<p class="loc-line" data-testid="loc-line">${pin}<span>Localisation refusée</span></p>`;
    default:
      return `<p class="loc-line" data-testid="loc-line">${pin}<span>Position indisponible</span></p>`;
  }
}

const GATE = {
  idle: { title: 'Où es-tu ?', text: 'Catai utilise ta position pour afficher les événements de ta ville. Ta position précise n’est pas conservée.', action: 'Autoriser la localisation' },
  prompt: { title: 'Où es-tu ?', text: 'Catai utilise ta position pour afficher les événements de ta ville. Ta position précise n’est pas conservée.', action: 'Autoriser la localisation' },
  denied: { title: 'Localisation refusée', text: 'Sans ta position, Catai ne peut pas choisir les événements à afficher. Autorise la localisation pour ce site dans les réglages de ton navigateur, puis réessaie.', action: 'Réessayer' },
  unavailable: { title: 'Position indisponible', text: 'Ton appareil n’a pas trouvé ta position. Vérifie que la localisation est activée, puis réessaie.', action: 'Réessayer' },
  outside: { title: 'Catai n’est pas encore dans ta région', text: 'Catai est offert à Québec pour le projet pilote, puis à Taïwan. Si tu viens d’arriver dans une de ces zones, réessaie.', action: 'Réessayer' },
  unsupported: { title: 'Localisation non prise en charge', text: 'Ce navigateur ne permet pas la localisation. Ouvre Catai dans un navigateur récent pour voir les événements près de toi.', action: null },
};

/** État explicite lorsque la zone n'est pas connue. Ne choisit jamais une zone par défaut. */
export function locationGate() {
  const { status } = locator.get();
  if (status === 'locating') {
    return `<section class="state" data-testid="loc-gate" data-state="locating" aria-live="polite">
      <div class="spinner" aria-hidden="true"></div>
      <h2 class="state__title">Recherche de ta position…</h2>
      <p class="state__text">Accepte la demande de ton navigateur si elle apparaît.</p>
    </section>`;
  }
  const g = GATE[status] || GATE.unavailable;
  return `<section class="state" data-testid="loc-gate" data-state="${esc(status)}">
    <div class="state__icon">${icon('pin')}</div>
    <h2 class="state__title">${esc(g.title)}</h2>
    <p class="state__text">${esc(g.text)}</p>
    ${g.action ? `<button class="btn btn--primary" data-action="locate">${esc(g.action)}</button>` : `<a class="btn btn--ghost" href="#/">Retour à l’accueil</a>`}
  </section>`;
}

export function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('toast--out'), 2600);
  setTimeout(() => el.remove(), 3100);
}
