// Couche de traduction des messages écrits.
// Prototype : les exemples du paquet contiennent des traductions écrites à l'avance (traduction IA simulée).
// Les nouveaux messages ne sont traduits que si un service serveur est configuré (CONFIG.translationEndpoint).
// La clé de l'API de traduction doit rester sur le serveur : jamais dans le navigateur ni dans GitHub.
import { CONFIG } from '../config.js';

export function isTranslationServiceConfigured() {
  return Boolean(CONFIG.translationEndpoint);
}

/**
 * Traduit un texte vers les langues demandées.
 * Retourne { status: 'ok', translations } ou { status: 'unavailable' }. N'invente jamais de traduction.
 */
export async function translateText({ text, from, to }) {
  if (!isTranslationServiceConfigured()) return { status: 'unavailable' };
  try {
    const res = await fetch(CONFIG.translationEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, from, to }),
    });
    if (!res.ok) return { status: 'unavailable' };
    const body = await res.json();
    return { status: 'ok', translations: body.translations || {} };
  } catch {
    return { status: 'unavailable' };
  }
}

/**
 * Prépare l'affichage d'un message pour une langue de lecture.
 * kind : 'original' (même langue), 'translated' (traduction disponible), 'unavailable' (aucune traduction).
 */
export function presentMessage(message, readerLanguage) {
  if (message.sourceLanguage === readerLanguage) {
    return { kind: 'original', text: message.source, original: null };
  }
  const translated = message.translations?.[readerLanguage];
  if (translated) return { kind: 'translated', text: translated, original: message.source };
  return { kind: 'unavailable', text: message.source, original: null };
}
