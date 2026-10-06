export function notFound() {
  return {
    title: 'Page introuvable',
    nav: 'home',
    back: '#/',
    html: `<div class="page"><section class="state">
      <h1 class="state__title">Page introuvable</h1>
      <p class="state__text">Cet événement ou cette page n’existe pas dans la démo.</p>
      <a class="btn btn--primary" href="#/">Retour à l’accueil</a>
    </section></div>`,
  };
}
