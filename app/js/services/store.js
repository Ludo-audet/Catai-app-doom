// Stockage local de la démonstration (profil, participations, messages, progression des guides).
// Rien n'est envoyé à un serveur. La position précise n'est jamais enregistrée.
const KEY = 'catai-demo-v1';
const listeners = new Set();

const empty = () => ({ profile: null, joined: [], messages: {}, guideProgress: {} });

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

let data = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Stockage indisponible (navigation privée, quota) : la démo continue en mémoire.
  }
}

export const store = {
  get: () => data,
  update(fn) {
    fn(data);
    save();
    listeners.forEach((l) => l());
  },
  reset() {
    data = empty();
    save();
    listeners.forEach((l) => l());
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

export function isJoined(eventId) {
  return data.joined.includes(eventId);
}

export function participantCount(event) {
  return event.participants + (isJoined(event.id) ? 1 : 0);
}

export function readingLanguage() {
  return data.profile?.language || 'fr';
}
