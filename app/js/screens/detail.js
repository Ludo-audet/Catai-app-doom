// Écrans 04 et 05 : détails d'un party ou d'une rencontre.
import { esc, icon, fmt, avatarStack, kindBadge, fictionalTag, photo, toast } from '../ui/components.js';
import { eventById, ORGANIZERS } from '../data/events.js';
import { LANGUAGES } from '../data/languages.js';
import { isJoined } from '../services/store.js';
import { ageStatus, nextJoinStep, leave } from '../services/participation.js';
import { notFound } from './not-found.js';

export function detailScreen({ id, params }) {
  const event = eventById(id);
  if (!event) return notFound();
  const isParty = event.kind === 'party';
  const org = ORGANIZERS[event.organizer];
  const joined = isJoined(event.id);
  const age = ageStatus(event);
  const notice = params.get('notice');

  let action;
  if (joined) {
    action = `<p class="joined-chip" data-testid="joined">${icon('check', 'icon--sm')} Tu participes</p>
      <a class="btn btn--primary btn--block" href="#/discussion/${esc(event.id)}" data-testid="primary-action">Ouvrir la discussion</a>
      <button class="btn btn--link" data-action="leave">Me retirer ${isParty ? 'du party' : 'de la rencontre'}</button>`;
  } else if (age === 'blocked') {
    action = `<p class="alert" data-testid="age-blocked">Ce party est réservé aux 18 ans et plus. Les rencontres restent ouvertes à tous.</p>
      <a class="btn btn--primary btn--block" href="#/rencontres" data-testid="primary-action">Voir les rencontres</a>`;
  } else {
    action = `<button class="btn btn--primary btn--block" data-action="join" data-testid="primary-action">${isParty ? 'Rejoindre le party' : 'Rejoindre la rencontre'}</button>
      <p class="hint">La discussion du groupe s’ouvre après ton inscription.</p>`;
  }

  const back = isParty ? '#/partys' : '#/rencontres';
  return {
    title: event.title,
    nav: 'home',
    back,
    header: 'location',
    html: `<div class="page detail">
      <div class="detail__media">
        ${photo(event.photo, event.title, 'photo--detail')}
        ${kindBadge(event, isParty ? 'badge--corner' : 'badge--corner-left')}
      </div>
      <div class="detail__body">
        ${notice === 'members-only' ? `<p class="alert" role="status">Rejoins l’événement pour ouvrir sa discussion.</p>` : ''}
        <h1 class="page__title">${esc(event.title)}</h1>
        ${fictionalTag(event)}
        <div class="detail__meta">
          <span class="meta">${icon('calendar', 'icon--sm')}<span>${fmt.dayLong(event.date)} · ${fmt.time(event.time)}</span></span>
          <span class="meta meta--muted">${icon('pin', 'icon--sm')}<span>${esc(event.place)}</span></span>
        </div>
        <p class="detail__desc">${esc(event.description)}</p>
        <div class="organizer">
          <img src="${esc(org.avatar)}" alt="">
          <div><p class="organizer__name">Organisé par ${esc(org.name)}</p><p class="organizer__role">${esc(org.role)}</p></div>
        </div>
        ${avatarStack(event, 'md')}
        ${event.minimumAge ? `<p class="restriction" data-testid="age-restriction"><span class="restriction__badge">${event.minimumAge}+</span>Réservé aux ${event.minimumAge} ans et plus</p>`
          : `<p class="languages-line">${icon('message', 'icon--sm')}<span>${LANGUAGES.map((l) => l.name).join(' · ')}</span></p>`}
        <div class="detail__action">${action}</div>
        <a class="link-row" href="#/demarches?zone=${esc(event.zone)}&from=${esc(event.id)}" data-testid="guides-link">
          ${icon(isParty ? 'graduation' : 'document')}<span>Démarches universitaires</span>${icon('chevron-right', 'icon--sm')}
        </a>
      </div>
    </div>`,
    mount(root, rerender, navigate) {
      root.querySelector('[data-action="join"]')?.addEventListener('click', () => navigate(nextJoinStep(event.id)));
      root.querySelector('[data-action="leave"]')?.addEventListener('click', () => {
        leave(event.id);
        toast(isParty ? 'Tu ne participes plus à ce party.' : 'Tu ne participes plus à cette rencontre.');
      });
    },
  };
}

