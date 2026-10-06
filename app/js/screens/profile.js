// Profil étudiant : modifier les informations et la langue, voir ses événements.
import { esc, icon, fmt, demoNote, photo } from '../ui/components.js';
import { eventById } from '../data/events.js';
import { store } from '../services/store.js';
import { locator } from '../services/location.js';
import { profileComplete } from '../services/participation.js';
import { profileForm } from './signup.js';

export function profileScreen() {
  const { profile, joined } = store.get();
  if (!profileComplete(profile)) {
    return {
      title: 'Profil',
      nav: 'profile',
      html: `<div class="page page--narrow">
        <h1 class="page__title page__title--xl">Profil</h1>
        <section class="state" data-testid="no-profile">
          <div class="state__icon">${icon('profile')}</div>
          <h2 class="state__title">Crée ton profil étudiant</h2>
          <p class="state__text">Ton profil te permet de rejoindre les partys et les rencontres, et de lire les discussions dans ta langue.</p>
          <a class="btn btn--primary" href="#/inscription">Créer mon profil</a>
        </section>
      </div>`,
    };
  }
  const form = profileForm('edit');
  const events = joined.map(eventById).filter(Boolean);
  const zone = locator.zone();
  const ageLabel = { adult: '18 ans et plus (confirmation simulée)', minor: 'Moins de 18 ans (confirmation simulée)' }[profile.ageCheck] || 'Non confirmé';
  return {
    title: 'Profil',
    nav: 'profile',
    html: `<div class="page page--narrow">
      <h1 class="page__title page__title--xl">Profil</h1>
      <dl class="facts" data-testid="profile-facts">
        <div><dt>Courriel</dt><dd>${esc(profile.email)} · ${profile.emailVerified ? 'vérifié (simulation)' : '<a href="#/verification">à vérifier</a>'}</dd></div>
        <div><dt>Âge</dt><dd>${ageLabel}</dd></div>
        <div><dt>Zone</dt><dd>${zone ? esc(zone.label) : 'Non détectée'}</dd></div>
      </dl>
      ${form.html}
      <h2 class="section-title">Mes événements</h2>
      ${events.length ? `<ul class="threads">${events.map((e) => `<li><a class="thread-row" href="#/evenement/${esc(e.id)}">
          ${photo(e.photo, '', 'photo--thumb')}
          <span class="thread-row__body"><span class="thread-row__title">${esc(e.title)}</span>
          <span class="thread-row__preview">${fmt.dayLong(e.date)} · ${fmt.time(e.time)}</span></span>
          ${icon('chevron-right', 'icon--sm')}</a></li>`).join('')}</ul>`
        : `<p class="state__text">Aucun événement rejoint pour l’instant.</p>`}
      <a class="link-row" href="#/demarches">${icon('graduation')}<span>Démarches universitaires</span>${icon('chevron-right', 'icon--sm')}</a>
      ${demoNote('Profil enregistré dans ce navigateur seulement.')}
      <button class="btn btn--ghost btn--block" data-action="reset" data-testid="reset">Réinitialiser la démo</button>
    </div>`,
    mount(root, rerender, navigate) {
      form.mount(root, rerender, navigate);
      // Confirmation dans la page : certaines intégrations bloquent window.confirm().
      const reset = root.querySelector('[data-action="reset"]');
      reset.addEventListener('click', () => {
        if (reset.dataset.armed) {
          store.reset();
          navigate('#/');
          return;
        }
        reset.dataset.armed = 'true';
        reset.textContent = 'Confirmer : effacer profil, participations et messages';
        reset.classList.add('btn--danger');
      });
    },
    onState: form.onState,
  };
}
