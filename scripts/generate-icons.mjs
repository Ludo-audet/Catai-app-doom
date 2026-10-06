// Génère app/js/ui/icons.js à partir des icônes SVG du paquet graphique.
// Les icônes sont intégrées en ligne pour hériter de la couleur du texte (currentColor).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';

const dir = 'Catai-Graphic-Package-V1/05-icones';
const icons = {};
for (const file of readdirSync(dir).filter((f) => f.endsWith('.svg') && !f.startsWith('badge-')).sort()) {
  icons[basename(file, '.svg')] = readFileSync(join(dir, file), 'utf8').trim();
}
const body = `// Fichier généré par scripts/generate-icons.mjs. Ne pas modifier à la main.
// Source : Catai-Graphic-Package-V1/05-icones
export const ICONS = ${JSON.stringify(icons, null, 2)};
`;
writeFileSync('app/js/ui/icons.js', body);
console.log(`${Object.keys(icons).length} icônes écrites dans app/js/ui/icons.js`);
