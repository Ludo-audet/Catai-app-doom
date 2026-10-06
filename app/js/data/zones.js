// Zones couvertes par Catai. La zone affichée est déterminée par la géolocalisation du navigateur.
// Aucune zone n'est utilisée par défaut : sans position, l'application affiche un état explicite.
export const ZONES = [
  {
    id: 'quebec',
    label: 'Québec',
    detectedLabel: 'Québec détectée',
    institution: 'Université Laval',
    status: 'pilot',
    // Cercle de 40 km autour du campus de l'Université Laval.
    area: { type: 'radius', center: { lat: 46.7817, lng: -71.2747 }, km: 40 },
    universities: [{ name: 'Université Laval', domains: ['ulaval.ca'] }],
    fictionalExamples: false,
  },
  {
    id: 'taiwan',
    label: 'Taïwan',
    detectedLabel: 'Taïwan détectée',
    institution: 'National Taiwan University',
    status: 'expansion',
    // Île principale de Taïwan, Penghu et îles proches.
    area: { type: 'box', south: 21.8, north: 25.4, west: 119.3, east: 122.1 },
    universities: [{ name: 'National Taiwan University', domains: ['ntu.edu.tw'] }],
    // Les événements de Taïwan sont des exemples fictifs, séparés des informations officielles.
    fictionalExamples: true,
  },
];

function distanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function contains(area, point) {
  if (area.type === 'radius') return distanceKm(area.center, point) <= area.km;
  return point.lat >= area.south && point.lat <= area.north && point.lng >= area.west && point.lng <= area.east;
}

/** Retourne la zone couverte qui contient la position, ou null si la position est hors zone. */
export function zoneForPosition(point) {
  return ZONES.find((z) => contains(z.area, point)) || null;
}

export function zoneById(id) {
  return ZONES.find((z) => z.id === id) || null;
}
