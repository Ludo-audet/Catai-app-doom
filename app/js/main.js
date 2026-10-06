// Point d'entrée : routeur par ancre (#/…), mise en page commune et rendu des écrans.
import { icon, locationLine } from './ui/components.js';
import { store } from './services/store.js';
import { locator, initLocation, requestLocation } from './services/location.js';
import { homeScreen } from './screens/home.js';
import { listScreen } from './screens/lists.js';
import { detailScreen } from './screens/detail.js';
import { signupScreen, verificationScreen, ageScreen, confirmationScreen } from './screens/signup.js';
import { chatScreen, messagesScreen } from './screens/chat.js';
import { profileScreen } from './screens/profile.js';
import { guidesScreen, arrivalScreen } from './screens/guides.js';
import { notFound } from './screens/not-found.js';

const ROUTES = [
  [/^\/$/, () => homeScreen()],
  [/^\/partys$/, () => listScreen('party')],
  [/^\/rencontres$/, () => listScreen('meetup')],
  [/^\/evenement\/([\w-]+)$/, (ctx) => detailScreen(ctx)],
  [/^\/inscription$/, (ctx) => signupScreen(ctx)],
  [/^\/verification$/, (ctx) => verificationScreen(ctx)],
  [/^\/age$/, (ctx) => ageScreen(ctx)],
  [/^\/confirmation\/([\w-]+)$/, (ctx) => confirmationScreen(ctx)],
  [/^\/discussion\/([\w-]+)$/, (ctx) => chatScreen(ctx)],
  [/^\/messages$/, () => messagesScreen()],
  [/^\/profil$/, () => profileScreen()],
  [/^\/demarches$/, (ctx) => guidesScreen(ctx)],
  [/^\/demarches\/arrivee$/, (ctx) => arrivalScreen(ctx)],
];

const root = document.getElementById('app');
let current = null;

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(qs || '') };
}

export function navigate(hash) {
  if (window.location.hash === hash) render({ routeChange: true });
  else window.location.hash = hash;
}

function resolve() {
  const { path, params } = parseHash();
  for (const [re, screen] of ROUTES) {
    const m = path.match(re);
    if (m) return screen({ id: m[1], params });
  }
  return notFound();
}

function header(view) {
  const back = view.back
    ? `<a class="topbar__back" href="${view.back}" aria-label="Retour">${icon('chevron-left')}</a>`
    : '<span class="topbar__back" aria-hidden="true"></span>';
  return `<header class="topbar">
    ${back}
    <a class="topbar__logo" href="#/"><img class="logo" src="img/catai-logo.png" alt="Catai, accueil"></a>
    <span class="topbar__back" aria-hidden="true"></span>
    ${view.header === 'location' ? `<div class="topbar__loc">${locationLine()}</div>` : ''}
  </header>`;
}

function tab(id, href, label, iconName, active) {
  const on = id === active;
  return `<a class="tabbar__item ${on ? 'tabbar__item--active' : ''}" href="${href}" ${on ? 'aria-current="page"' : ''} data-testid="tab-${id}">
    ${icon(iconName)}<span>${label}</span>
  </a>`;
}

function tabbar(active) {
  return `<nav class="tabbar" aria-label="Navigation principale">
    ${tab('home', '#/', 'Accueil', 'home', active)}
    ${tab('messages', '#/messages', 'Messages', 'message', active)}
    ${tab('profile', '#/profil', 'Profil', 'profile', active)}
  </nav>`;
}

function render({ routeChange }) {
  let view = resolve();
  let guard = 0;
  while (view.redirect && guard++ < 5) {
    window.history.replaceState(null, '', view.redirect);
    view = resolve();
  }
  current = view;
  const scroll = routeChange ? 0 : window.scrollY;
  document.title = view.title ? `${view.title} · Catai` : 'Catai';
  document.body.classList.toggle('has-tabbar', Boolean(view.nav));
  root.innerHTML = `${view.header === 'home' ? '' : header(view)}<main class="main" id="main" tabindex="-1">${view.html}</main>${view.nav ? tabbar(view.nav) : ''}`;
  root.querySelectorAll('[data-action="locate"]').forEach((b) => b.addEventListener('click', requestLocation));
  view.mount?.(root, () => render({ routeChange: false }), navigate);
  window.scrollTo(0, scroll);
  if (routeChange) {
    const h1 = root.querySelector('h1');
    h1?.setAttribute('tabindex', '-1');
    h1?.focus({ preventScroll: true });
  }
}

function onStateChange(source) {
  if (current?.onState) {
    current.onState(root);
    root.querySelectorAll('[data-slot] [data-action="locate"]').forEach((b) => b.addEventListener('click', requestLocation));
    return;
  }
  // Un changement de localisation ne redessine que les écrans qui en dépendent,
  // pour ne jamais effacer une saisie en cours.
  if (source === 'location' && !current?.live && current?.header !== 'location') return;
  render({ routeChange: false });
}

window.addEventListener('hashchange', () => render({ routeChange: true }));
store.subscribe(() => onStateChange('store'));
locator.subscribe(() => onStateChange('location'));

render({ routeChange: true });
initLocation();
