// Compile le prototype dans dist/ : copie l'application et les seules ressources publiques du paquet.
import { cpSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_DIR, DIST_DIR, PACKAGE_DIR, PUBLIC_ASSET_DIRS } from './paths.mjs';

rmSync(DIST_DIR, { recursive: true, force: true });
cpSync(APP_DIR, DIST_DIR, { recursive: true });
for (const folder of PUBLIC_ASSET_DIRS) {
  mkdirSync(join(DIST_DIR, 'assets'), { recursive: true });
  cpSync(join(PACKAGE_DIR, folder), join(DIST_DIR, 'assets', folder), { recursive: true });
}
// GitHub Pages : ne pas traiter le site avec Jekyll.
writeFileSync(join(DIST_DIR, '.nojekyll'), '');
console.log(`Prototype compilé dans ${DIST_DIR}/`);
