// Événements d'exemple. Québec : données du paquet graphique (07-documentation/donnees-exemple.json).
// Taïwan : exemples fictifs pour la zone d'expansion, identifiés comme tels dans l'interface.
// Seuls l'équipe et les ambassadeurs approuvés créent des événements : aucun écran de création ici.
const P = 'assets/02-photos/';

export const ORGANIZERS = {
  mei: { name: 'Mei', role: 'Ambassadrice Catai', avatar: 'assets/03-avatars/organisatrice-mei.png' },
  alex: { name: 'Alex', role: 'Ambassadeur Catai', avatar: 'assets/03-avatars/organisateur-alex.png' },
};

export const PARTICIPANT_AVATARS = [
  'assets/03-avatars/participant-01.png',
  'assets/03-avatars/participant-02.png',
  'assets/03-avatars/participant-03.png',
  'assets/03-avatars/discussion-alex.png',
];

export const MEETUP_CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'cafe', label: 'Café' },
  { id: 'langues', label: 'Langues' },
  { id: 'sorties', label: 'Sorties' },
];

export const PARTY_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'week', label: 'Cette semaine' },
];

export const EVENTS = [
  {
    id: 'party-bienvenue', zone: 'quebec', kind: 'party', title: 'Party de bienvenue',
    date: '2026-10-10', time: '20:00', place: 'Quartier universitaire', minimumAge: 18,
    participants: 32, organizer: 'mei', photo: P + 'party-bienvenue-detail.png',
    description: 'Une soirée pour rencontrer les étudiants du campus.', featured: true,
  },
  {
    id: 'soiree-internationale', zone: 'quebec', kind: 'party', title: 'Soirée internationale',
    date: '2026-10-17', time: '21:00', place: 'Quartier universitaire', minimumAge: 18,
    participants: 24, organizer: 'mei', photo: P + 'soiree-internationale.png',
    description: 'Musique du monde et nouveaux amis de tous les pays.',
  },
  {
    id: 'campus-en-fete', zone: 'quebec', kind: 'party', title: 'Campus en fête',
    date: '2026-10-24', time: '20:00', place: 'Quartier universitaire', minimumAge: 18,
    participants: 40, organizer: 'alex', photo: P + 'campus-en-fete.png',
    description: 'La grande fête de la rentrée sur le campus.',
  },
  {
    id: 'cafe-nouveaux', zone: 'quebec', kind: 'meetup', category: 'cafe', title: 'Café des nouveaux',
    date: '2026-10-08', time: '16:00', place: 'Campus Laval', minimumAge: null,
    participants: 12, organizer: 'alex', photo: P + 'cafe-nouveaux-detail.png',
    description: 'Un café pour faire connaissance, dans ta langue.', featured: true,
  },
  {
    id: 'echange-langues', zone: 'quebec', kind: 'meetup', category: 'langues', title: 'Échange de langues',
    date: '2026-10-12', time: '17:00', place: 'Campus Laval', minimumAge: null,
    participants: 15, organizer: 'mei', photo: P + 'echange-langues.png',
    description: 'Pratique le français, l’anglais ou le mandarin en petit groupe.',
  },
  {
    id: 'balade-etudiants', zone: 'quebec', kind: 'meetup', category: 'sorties', title: 'Balade entre étudiants',
    date: '2026-10-14', time: '14:00', place: 'Campus Laval', minimumAge: null,
    participants: 9, organizer: 'alex', photo: P + 'balade-etudiants.png',
    description: 'Une promenade pour découvrir le campus et la ville.',
  },
  // Taïwan : exemples fictifs.
  {
    id: 'tw-welcome-party', zone: 'taiwan', kind: 'party', title: 'Welcome party internationale',
    date: '2026-10-16', time: '21:00', place: 'Da’an, Taipei', minimumAge: 18,
    participants: 28, organizer: 'mei', photo: P + 'soiree-internationale.png',
    description: 'Exemple fictif : une soirée pour les étudiants qui arrivent à Taïwan.', featured: true, fictional: true,
  },
  {
    id: 'tw-cafe-arrivants', zone: 'taiwan', kind: 'meetup', category: 'cafe', title: 'Café des arrivants',
    date: '2026-10-09', time: '15:00', place: 'Gongguan, Taipei', minimumAge: null,
    participants: 10, organizer: 'mei', photo: P + 'cafe-discussion-miniature.png',
    description: 'Exemple fictif : un café pour se présenter et poser ses questions.', featured: true, fictional: true,
  },
  {
    id: 'tw-echange-langues', zone: 'taiwan', kind: 'meetup', category: 'langues', title: 'Échange de langues',
    date: '2026-10-13', time: '18:00', place: 'Gongguan, Taipei', minimumAge: null,
    participants: 14, organizer: 'alex', photo: P + 'echange-langues.png',
    description: 'Exemple fictif : mandarin, anglais et français autour d’une table.', fictional: true,
  },
];

export function eventById(id) {
  return EVENTS.find((e) => e.id === id) || null;
}

export function eventsFor(zoneId, kind) {
  return EVENTS.filter((e) => e.zone === zoneId && e.kind === kind)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.date.localeCompare(b.date));
}
