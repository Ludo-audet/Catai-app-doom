// Écrans 02 et 03 : listes des partys et des rencontres de la zone détectée.
import { esc, icon, fmt, avatarStack, kindBadge, fictionalTag, locationGate, photo } from '../ui/components.js';
import { eventsFor, MEETUP_CATEGORIES, PARTY_FILTERS } from '../data/events.js';
import { locator } from '../services/location.js';

// Filtres retenus pendant la session pour conserver le contexte au retour.
const remembered = { party: 'all', meetup: 'all' };

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Du jour courant jusqu'au dimanche inclus. */
export function isThisWeek(iso, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(y, m - 1, d);
  const start = startOfDay(now);
  const end = new Date(start);
  end.setDate(start.getDate() + ((7 - start.getDay()) % 7));
  return day >= start && day <= end;
}

function meta(event, withAge) {
  const age = withAge && event.minimumAge ? ` · ${event.minimumAge}+` : '';
  return `<span class="meta">${icon('calendar', 'icon--sm')}<span>${fmt.dayShort(event.date)} · ${fmt.time(event.time)}${age}</span></span>`;
}

function place(event) {
  return `<span class="meta meta--muted">${icon('pin', 'icon--sm')}<span>${esc(event.place)}</span></span>`;
}

function featuredCard(event) {
  const cta = event.kind === 'party' ? 'Voir le party' : 'Voir la rencontre';
  return `<article class="event-card event-card--featured" data-testid="event-card" data-event="${esc(event.id)}">
    <div class="event-card__media">
      ${photo(event.photo, '', 'photo--featured')}
      ${kindBadge(event, 'badge--corner')}
    </div>
    <div class="event-card__body">
      <h2 class="event-card__title">${esc(event.title)} ${fictionalTag(event)}</h2>
      <div class="event-card__meta">${meta(event, false)}${place(event)}</div>
      <div class="event-card__foot">
        ${avatarStack(event, 'sm')}
        <a class="btn btn--primary btn--sm" href="#/evenement/${esc(event.id)}">${cta} ${icon('chevron-right', 'icon--sm')}</a>
      </div>
    </div>
  </article>`;
}

function compactCard(event) {
  return `<a class="event-row" href="#/evenement/${esc(event.id)}" data-testid="event-card" data-event="${esc(event.id)}">
    ${photo(event.photo, '', 'photo--row')}
    <span class="event-row__body">
      <span class="event-row__title">${esc(event.title)}</span>
      ${fictionalTag(event)}
      ${meta(event, true)}
      ${place(event)}
    </span>
    <span class="event-row__go">${icon('chevron-right')}</span>
  </a>`;
}

function filters(list, active) {
  return `<div class="chips" role="group" aria-label="Filtres">
    ${list.map((f) => `<button class="chip ${f.id === active ? 'chip--active' : ''}" data-filter="${f.id}" aria-pressed="${f.id === active}">${esc(f.label)}</button>`).join('')}
  </div>`;
}

export function listScreen(kind) {
  const isParty = kind === 'party';
  const heading = isParty ? 'Partys' : 'Rencontres';
  const zone = locator.zone();
  let body;
  if (!zone) {
    body = locationGate();
  } else {
    const active = remembered[kind];
    const all = eventsFor(zone.id, kind);
    const shown = all.filter((e) => {
      if (active === 'all') return true;
      if (isParty) return isThisWeek(e.date);
      return e.category === active;
    });
    const emptyText = isParty ? 'Aucun party cette semaine.' : 'Aucune rencontre dans cette catégorie pour l’instant.';
    const [first, ...rest] = shown;
    body = `
      ${filters(isParty ? PARTY_FILTERS : MEETUP_CATEGORIES, active)}
      ${zone.fictionalExamples ? `<p class="info-note">Zone d’expansion : les événements affichés ici sont des exemples fictifs.</p>` : ''}
      <div class="event-list" data-testid="event-list">
        ${shown.length === 0 ? `<section class="state state--compact" data-testid="empty-list">
            <h2 class="state__title">${emptyText}</h2>
            <button class="btn btn--ghost" data-filter="all">Voir tout</button>
          </section>` : ''}
        ${first ? featuredCard(first) : ''}
        ${rest.length ? `<div class="event-list__rest">${rest.map(compactCard).join('')}</div>` : ''}
      </div>`;
  }
  return {
    title: heading,
    nav: 'home',
    back: '#/',
    live: true,
    html: `<div class="page">
      <h1 class="page__title page__title--xl">${heading}</h1>
      ${zone ? `<p class="page__sub">${icon('pin', 'icon--sm')}<span>${esc(zone.label)} · ${esc(zone.institution)}</span></p>` : ''}
      ${body}
    </div>`,
    mount(root, rerender) {
      root.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => {
        remembered[kind] = b.dataset.filter;
        rerender();
      }));
    },
  };
}
