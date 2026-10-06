// Écran 01 : accueil. Deux portes d'entrée uniquement, Partys et Rencontres.
import { icon, locationLine } from '../ui/components.js';

function entryCard(href, label, img, testid) {
  return `<a class="entry-card" href="${href}" data-testid="${testid}">
    <img class="entry-card__img" src="${img}" alt="">
    <span class="entry-card__label">${label}</span>
    <span class="entry-card__go" aria-hidden="true">${icon('arrow-right')}</span>
  </a>`;
}

export function homeScreen() {
  return {
    title: 'Accueil',
    nav: null,
    live: true,
    header: 'home',
    html: `<div class="home">
      <header class="home__head">
        <img class="logo logo--home" src="img/catai-logo.png" alt="Catai">
        ${locationLine()}
      </header>
      <h1 class="home__title">On fait quoi ?</h1>
      <nav class="home__cards" aria-label="Choisir une activité">
        ${entryCard('#/partys', 'PARTYS', 'assets/02-photos/accueil-party.png', 'entry-partys')}
        ${entryCard('#/rencontres', 'RENCONTRES', 'assets/02-photos/accueil-rencontre.png', 'entry-rencontres')}
      </nav>
    </div>`,
  };
}
