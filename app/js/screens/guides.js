// Écran 08 : démarches universitaires de la zone, avec liens officiels.
import { esc, icon, photo, locationGate } from '../ui/components.js';
import { GUIDES } from '../data/guides.js';
import { zoneById } from '../data/zones.js';
import { locator } from '../services/location.js';
import { store } from '../services/store.js';

/** Zone du guide : zone détectée, sinon zone de l'événement d'où vient la personne. */
function guideZone(params) {
  return locator.zone() || zoneById(params.get('zone'));
}

function steps(zoneId, guideKey, guide) {
  const progress = store.get().guideProgress[`${zoneId}:${guideKey}`] || [];
  return `<ol class="steps">${guide.steps.map((s, i) => {
    const done = progress.includes(i);
    return `<li class="step ${done ? 'step--done' : ''}">
      <button class="step__check" data-step="${i}" aria-pressed="${done}" aria-label="Étape ${i + 1} terminée">${done ? icon('check') : ''}</button>
      <span class="step__num">${i + 1}</span>
      <div><p class="step__title">${esc(s.title)}</p><p class="step__text">${esc(s.text)}</p></div>
    </li>`;
  }).join('')}</ol>`;
}

function bindSteps(root, key, rerender) {
  root.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    const i = Number(b.dataset.step);
    store.update((d) => {
      const list = new Set(d.guideProgress[key] || []);
      list.has(i) ? list.delete(i) : list.add(i);
      d.guideProgress[key] = [...list];
    });
  }));
}

function query(params) {
  const keep = new URLSearchParams();
  ['zone', 'from'].forEach((k) => params.get(k) && keep.set(k, params.get(k)));
  const s = keep.toString();
  return s ? `?${s}` : '';
}

export function guidesScreen({ params }) {
  const zone = guideZone(params);
  const from = params.get('from');
  const back = from ? `#/evenement/${from}` : '#/profil';
  if (!zone) {
    return { title: 'Tes démarches', nav: 'home', back, live: true, header: 'location',
      html: `<div class="page"><h1 class="page__title page__title--xl">Tes démarches</h1>${locationGate()}</div>` };
  }
  const guide = GUIDES[zone.id];
  const a = guide.admission;
  return {
    title: 'Tes démarches',
    nav: 'home',
    back,
    header: 'location',
    html: `<div class="page guides">
      <h1 class="page__title page__title--xl">Tes démarches</h1>
      <p class="page__lead page__lead--tight">${esc(guide.institution)}</p>
      ${photo(guide.photo, '', 'photo--guide')}
      <section class="card guide-card">
        <h2 class="card__title">${esc(a.title)}</h2>
        <p class="card__sub">${a.steps.length} étapes</p>
        ${steps(zone.id, 'admission', a)}
        <a class="btn btn--primary btn--block btn--lg" href="${esc(a.officialUrl)}" target="_blank" rel="noopener noreferrer" data-testid="official-link">
          Ouvrir le site officiel ${icon('external-link', 'icon--sm')}<span class="visually-hidden">(nouvel onglet)</span>
        </a>
        <p class="card__source">Source : ${esc(a.source)}</p>
      </section>
      ${zone.fictionalExamples ? `<p class="info-note">Ce guide renvoie au site officiel. Les événements Catai de cette zone restent des exemples fictifs.</p>` : ''}
      <a class="card link-card" href="#/demarches/arrivee${query(params)}" data-testid="arrival-link">
        ${icon('book')}<span>Préparer ton arrivée</span>${icon('chevron-right', 'icon--sm')}
      </a>
    </div>`,
    mount(root, rerender) { bindSteps(root, `${zone.id}:admission`, rerender); },
  };
}

export function arrivalScreen({ params }) {
  const zone = guideZone(params);
  if (!zone) return { redirect: `#/demarches${query(params)}` };
  const guide = GUIDES[zone.id].arrival;
  return {
    title: 'Préparer ton arrivée',
    nav: 'home',
    back: `#/demarches${query(params)}`,
    header: 'location',
    html: `<div class="page page--narrow">
      <h1 class="page__title page__title--lg">Préparer ton arrivée</h1>
      <p class="page__lead page__lead--tight">${esc(GUIDES[zone.id].institution)}</p>
      <section class="card guide-card">
        ${steps(zone.id, 'arrival', guide)}
        <p class="info-note">Les liens officiels de cette section seront ajoutés après validation par l’équipe Catai.</p>
        <a class="btn btn--primary btn--block btn--lg" href="#/rencontres">Voir les rencontres</a>
      </section>
    </div>`,
    mount(root, rerender) { bindSteps(root, `${zone.id}:arrival`, rerender); },
  };
}
