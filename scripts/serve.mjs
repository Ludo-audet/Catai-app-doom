// Petit serveur statique sans dépendance.
//   node scripts/serve.mjs         -> sert app/ et les ressources du paquet (développement)
//   node scripts/serve.mjs dist    -> sert la version compilée
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { APP_DIR, PACKAGE_DIR, PUBLIC_ASSET_DIRS } from './paths.mjs';

const root = resolve(process.argv[2] || APP_DIR);
const useDist = Boolean(process.argv[2]);
const port = Number(process.env.PORT || 5173);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

function resolvePath(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  if (!useDist && clean.startsWith('assets/')) {
    const [, folder] = clean.split(/[/\\]/);
    if (!PUBLIC_ASSET_DIRS.includes(folder)) return null;
    return resolve(PACKAGE_DIR, clean.slice('assets/'.length));
  }
  const file = resolve(root, clean || 'index.html');
  return file.startsWith(root) ? file : null;
}

createServer(async (req, res) => {
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  let file = resolvePath(urlPath);
  try {
    if (!file) throw new Error('forbidden');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Introuvable');
  }
}).listen(port, () => console.log(`Catai prototype : http://localhost:${port}/`));
