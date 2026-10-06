// Parcours de participation : profil -> courriel vérifié (simulé) -> âge (simulé, partys 18+) -> confirmation.
// L'événement choisi est transmis dans l'adresse (?event=…) à chaque étape.
import { eventById } from '../data/events.js';
import { store, isJoined } from './store.js';

export function profileComplete(profile) {
  return Boolean(profile && profile.firstName && profile.photo && profile.university && profile.email && profile.language);
}

/** Âge requis non confirmé ? 'needed' | 'blocked' | 'ok' */
export function ageStatus(event) {
  if (!event?.minimumAge) return 'ok';
  const check = store.get().profile?.ageCheck;
  if (check === 'adult') return 'ok';
  if (check === 'minor') return 'blocked';
  return 'needed';
}

/** Prochaine route du parcours pour rejoindre l'événement. */
export function nextJoinStep(eventId) {
  const event = eventById(eventId);
  if (!event) return '#/';
  if (isJoined(eventId)) return `#/discussion/${eventId}`;
  const { profile } = store.get();
  const q = `?event=${encodeURIComponent(eventId)}`;
  if (!profileComplete(profile)) return `#/inscription${q}`;
  if (!profile.emailVerified) return `#/verification${q}`;
  const age = ageStatus(event);
  if (age === 'needed') return `#/age${q}`;
  if (age === 'blocked') return `#/evenement/${eventId}`;
  join(eventId);
  return `#/confirmation/${eventId}`;
}

export function join(eventId) {
  if (isJoined(eventId)) return false; // Empêche les inscriptions répétées.
  store.update((d) => { d.joined.push(eventId); });
  return true;
}

export function leave(eventId) {
  store.update((d) => { d.joined = d.joined.filter((id) => id !== eventId); });
}
