import { test, expect } from '@playwright/test';
import { mockGeolocation, setToday, createProfile, noHorizontalScroll, POSITIONS } from './helpers.js';

test.describe('accueil et parcours', () => {
  test.beforeEach(async ({ page }) => {
    await setToday(page);
    await mockGeolocation(page, 'granted', POSITIONS.quebec);
  });

  test('l’accueil montre seulement deux choix, sans menu ni sélecteur de pays', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'On fait quoi ?' })).toBeVisible();
    await expect(page.getByTestId('loc-line')).toHaveText('Québec');
    const cards = page.locator('.home__cards a');
    await expect(cards).toHaveCount(2);
    await expect(page.getByTestId('entry-partys')).toContainText('PARTYS');
    await expect(page.getByTestId('entry-rencontres')).toContainText('RENCONTRES');
    await expect(page.locator('.tabbar')).toHaveCount(0);
    await expect(page.getByText(/Taïwan/)).toHaveCount(0);
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test('parcours Partys : filtres, détails et retour avec le filtre conservé', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('entry-partys').click();
    await expect(page.getByRole('heading', { name: 'Partys' })).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(3);
    await expect(page.locator('.badge').first()).toHaveText('18+');
    await page.getByRole('button', { name: 'Cette semaine' }).click();
    await expect(page.getByTestId('event-card')).toHaveCount(1);
    await page.getByRole('link', { name: /Voir le party/ }).click();
    await expect(page.getByRole('heading', { name: 'Party de bienvenue' })).toBeVisible();
    await expect(page.getByText('Organisé par Mei')).toBeVisible();
    await expect(page.getByTestId('age-restriction')).toContainText('Réservé aux 18 ans et plus');
    await expect(page.getByTestId('participants')).toHaveText('32 participants');
    await expect(page.getByRole('button', { name: 'Rejoindre le party' })).toBeVisible();
    await page.getByRole('link', { name: 'Retour' }).click();
    await expect(page.getByRole('button', { name: 'Cette semaine' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('link', { name: 'Retour' }).click();
    await expect(page.getByRole('heading', { name: 'On fait quoi ?' })).toBeVisible();
  });

  test('parcours Rencontres : catégories et cartes vers les détails', async ({ page }) => {
    await page.goto('/#/rencontres');
    await expect(page.getByTestId('event-card')).toHaveCount(3);
    for (const [label, title] of [['Café', 'Café des nouveaux'], ['Langues', 'Échange de langues'], ['Sorties', 'Balade entre étudiants']]) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByTestId('event-card')).toHaveCount(1);
      await expect(page.getByTestId('event-card')).toContainText(title);
    }
    await page.getByRole('button', { name: 'Tous', exact: true }).click();
    await page.locator('[data-event="echange-langues"]').click();
    await expect(page.getByRole('heading', { name: 'Échange de langues' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rejoindre la rencontre' })).toBeVisible();
    await expect(page.getByText('Français · Anglais · Mandarin')).toBeVisible();
  });

  test('une même photo pour un événement dans la liste, les détails et la discussion', async ({ page }) => {
    await page.goto('/#/partys');
    const listSrc = await page.locator('[data-event="party-bienvenue"] img').first().getAttribute('src');
    await page.goto('/#/evenement/party-bienvenue');
    expect(await page.locator('.photo--detail img').getAttribute('src')).toBe(listSrc);
  });
});

test.describe('inscription et participation', () => {
  test.beforeEach(async ({ page }) => {
    await setToday(page);
    await mockGeolocation(page, 'granted', POSITIONS.quebec);
  });

  test('rejoindre une rencontre : profil, code simulé, confirmation, discussion', async ({ page }) => {
    await page.goto('/#/evenement/cafe-nouveaux');
    await expect(page.getByTestId('participants')).toHaveText('12 participants');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await expect(page.getByRole('heading', { name: 'Ton profil étudiant' })).toBeVisible();
    await expect(page.getByText('Pour rejoindre « Café des nouveaux ».')).toBeVisible();
    await expect(page.getByTestId('loc-info')).toContainText('Québec détectée');
    await expect(page.getByLabel('Université')).toHaveValue('Université Laval');
    await expect(page.getByText('Mode démo').first()).toBeVisible();

    // Erreurs de formulaire
    await page.getByRole('button', { name: 'Recevoir mon code' }).click();
    await expect(page.getByText('Ajoute une photo de profil.')).toBeVisible();
    await expect(page.getByText('Indique ton prénom.')).toBeVisible();
    await expect(page.getByText('Indique un courriel valide.')).toBeVisible();
    await page.getByLabel('Courriel universitaire').fill('lea@gmail.com');
    await page.getByRole('button', { name: 'Recevoir mon code' }).click();
    await expect(page.getByText('Utilise ton courriel de Université Laval (@ulaval.ca).')).toBeVisible();

    // Photo
    await page.setInputFiles('[data-testid="photo-input"]', 'Catai-Graphic-Package-V1/03-avatars/profil-lea.png');
    await expect(page.getByTestId('photo-preview')).toHaveAttribute('src', /^data:image\/jpeg/);
    await page.getByLabel('Prénom').fill('Léa');
    await page.getByLabel('Courriel universitaire').fill('lea@ulaval.ca');
    await page.getByRole('radio', { name: 'English' }).check({ force: true });
    await page.getByRole('button', { name: 'Recevoir mon code' }).click();

    // Vérification simulée, avec reprise de l'événement après rechargement
    await expect(page).toHaveURL(/#\/verification\?event=cafe-nouveaux/);
    await expect(page.getByTestId('demo-code-box')).toContainText('aucun courriel n’est envoyé');
    await page.reload();
    await page.getByLabel('Code reçu').fill('000000');
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await expect(page.getByText('Ce code ne correspond pas')).toBeVisible();
    const code = await page.getByTestId('demo-code').textContent();
    await page.getByLabel('Code reçu').fill(code);
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByRole('heading', { name: 'C’est confirmé !' })).toBeVisible();
    await expect(page.getByText('Tu participes à « Café des nouveaux ».')).toBeVisible();
    await page.getByTestId('open-chat').click();
    await expect(page).toHaveURL(/#\/discussion\/cafe-nouveaux/);
    await expect(page.getByText('13 participants')).toBeVisible();

    // Retour au détail : statut et compteur mis à jour, pas de double inscription
    await page.goto('/#/evenement/cafe-nouveaux');
    await expect(page.getByTestId('joined')).toBeVisible();
    await expect(page.getByTestId('participants')).toHaveText('13 participants');
    await expect(page.getByRole('button', { name: 'Rejoindre la rencontre' })).toHaveCount(0);
    await page.goto('/#/confirmation/cafe-nouveaux');
    const joined = await page.evaluate(() => JSON.parse(localStorage.getItem('catai-demo-v1')).joined);
    expect(joined).toEqual(['cafe-nouveaux']);

    // Retrait
    await page.goto('/#/evenement/cafe-nouveaux');
    await page.getByRole('button', { name: 'Me retirer de la rencontre' }).click();
    await expect(page.getByTestId('participants')).toHaveText('12 participants');
    await expect(page.getByRole('button', { name: 'Rejoindre la rencontre' })).toBeVisible();
    await page.goto('/#/discussion/cafe-nouveaux');
    await expect(page.getByText('Rejoins l’événement pour ouvrir sa discussion.')).toBeVisible();
  });

  test('l’université est proposée quand la zone est détectée après l’ouverture du formulaire', async ({ page }) => {
    await page.goto('/#/inscription');
    await expect(page.getByTestId('loc-info')).toContainText('Québec détectée');
    await expect(page.getByLabel('Université')).toHaveValue('Université Laval');
  });

  test('un profil existant rejoint directement un autre événement', async ({ page }) => {
    await page.goto('/#/evenement/cafe-nouveaux');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await createProfile(page);
    await page.goto('/#/evenement/echange-langues');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await expect(page.getByText('Tu participes à « Échange de langues ».')).toBeVisible();
    await page.getByTestId('tab-messages').click();
    await expect(page.getByTestId('thread')).toHaveCount(2);
  });

  test('party 18+ : une personne mineure est bloquée (contrôle simulé)', async ({ page }) => {
    await page.goto('/#/evenement/party-bienvenue');
    await page.getByRole('button', { name: 'Rejoindre le party' }).click();
    await createProfile(page);
    await expect(page.getByRole('heading', { name: 'Ton âge' })).toBeVisible();
    await expect(page.getByText(/Confirmation d’âge simulée/)).toBeVisible();
    await page.getByLabel('Date de naissance').fill('2010-05-01');
    await page.getByRole('button', { name: 'Confirmer mon âge' }).click();
    await expect(page.getByTestId('age-blocked')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rejoindre le party' })).toHaveCount(0);
    await expect(page.getByTestId('participants')).toHaveText('32 participants');
    // Les rencontres restent ouvertes aux mineurs.
    await page.goto('/#/evenement/balade-etudiants');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await expect(page.getByRole('heading', { name: 'C’est confirmé !' })).toBeVisible();
  });

  test('party 18+ : une personne adulte rejoint après la confirmation simulée', async ({ page }) => {
    await page.goto('/#/evenement/party-bienvenue');
    await page.getByRole('button', { name: 'Rejoindre le party' }).click();
    await createProfile(page);
    await page.getByLabel('Date de naissance').fill('2000-05-01');
    await page.getByRole('button', { name: 'Confirmer mon âge' }).click();
    await expect(page.getByText('Tu participes à « Party de bienvenue ».')).toBeVisible();
    await page.goto('/#/evenement/party-bienvenue');
    await expect(page.getByTestId('participants')).toHaveText('33 participants');
  });
});

test.describe('discussion traduite', () => {
  test.beforeEach(async ({ page }) => {
    await setToday(page);
    await mockGeolocation(page, 'granted', POSITIONS.quebec);
    await page.goto('/#/evenement/cafe-nouveaux');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await createProfile(page);
    await page.getByTestId('open-chat').click();
  });

  test('les exemples changent selon la langue de lecture, avec le texte d’origine', async ({ page }) => {
    await expect(page.getByText('Traduction IA simulée')).toBeVisible();
    const mei = page.getByTestId('message').first();
    await expect(mei).toContainText('Salut ! Je viens d’arriver à Québec.');
    await expect(mei.getByTestId('original')).toContainText('大家好！我剛到魁北克。');

    await page.getByTestId('reading-language').selectOption('en');
    await expect(mei).toContainText('Hi! I just arrived in Quebec City.');
    const alex = page.getByTestId('message').nth(1);
    await expect(alex).toContainText('Let’s meet at the café at 4 pm.');
    await expect(alex.getByTestId('original')).toHaveCount(0);

    await page.getByTestId('reading-language').selectOption('zh-Hant');
    await expect(alex).toContainText('我們下午四點在咖啡館見。');
    await expect(alex.getByTestId('original')).toContainText('Let’s meet at the café at 4 pm.');
    await expect(mei.getByTestId('original')).toHaveCount(0);

    // La langue choisie est enregistrée dans le profil.
    await page.getByTestId('tab-profile').click();
    await expect(page.getByRole('radio', { name: '中文' })).toBeChecked();
  });

  test('un nouveau message garde son texte original, sans traduction inventée', async ({ page }) => {
    await page.getByPlaceholder('Écris dans ta langue…').fill('Bonjour à tous !');
    await page.getByRole('button', { name: 'Envoyer' }).click();
    const mine = page.locator('.msg--own').last();
    await expect(mine).toContainText('Bonjour à tous !');
    await expect(mine.getByTestId('no-translation')).toContainText('Traduction non disponible');
    await page.getByTestId('reading-language').selectOption('en');
    await expect(mine).toContainText('Bonjour à tous !');
    await page.reload();
    await expect(page.locator('.msg--own').last()).toContainText('Bonjour à tous !');
  });
});

test.describe('localisation', () => {
  test.beforeEach(async ({ page }) => { await setToday(page); });

  test('demande explicite puis zone Québec', async ({ page }) => {
    await mockGeolocation(page, 'prompt', POSITIONS.quebec);
    await page.goto('/#/partys');
    await expect(page.getByTestId('loc-gate')).toHaveAttribute('data-state', 'prompt');
    await expect(page.getByTestId('event-card')).toHaveCount(0);
    await page.getByRole('button', { name: 'Autoriser la localisation' }).click();
    await expect(page.getByText('Québec · Université Laval')).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(3);
  });

  test('Taïwan : zone d’expansion avec exemples fictifs et lien officiel NTU', async ({ page }) => {
    await mockGeolocation(page, 'granted', POSITIONS.taipei);
    await page.goto('/');
    await expect(page.getByTestId('loc-line')).toHaveText('Taïwan');
    await page.getByTestId('entry-rencontres').click();
    await expect(page.getByText('exemples fictifs')).toBeVisible();
    await expect(page.getByTestId('event-card').first()).toContainText('Exemple fictif');
    await expect(page.getByText('Café des nouveaux')).toHaveCount(0);
    await page.goto('/#/demarches');
    await expect(page.getByTestId('official-link')).toHaveAttribute('href', 'https://admissions.ntu.edu.tw/');
  });

  test('permission refusée : état explicite, aucune position inventée', async ({ page }) => {
    await mockGeolocation(page, 'denied');
    await page.goto('/#/rencontres');
    await expect(page.getByTestId('loc-gate')).toHaveAttribute('data-state', 'denied');
    await expect(page.getByText('Localisation refusée')).toBeVisible();
    await expect(page.getByTestId('event-card')).toHaveCount(0);
    await page.goto('/');
    await expect(page.getByTestId('loc-line')).toHaveText('Localisation refusée');
  });

  test('position indisponible : état explicite et nouvel essai', async ({ page }) => {
    await mockGeolocation(page, 'unavailable');
    await page.goto('/#/partys');
    await page.getByRole('button', { name: 'Autoriser la localisation' }).click();
    await expect(page.getByTestId('loc-gate')).toHaveAttribute('data-state', 'unavailable');
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
  });

  test('hors des zones couvertes', async ({ page }) => {
    await mockGeolocation(page, 'granted', POSITIONS.paris);
    await page.goto('/#/partys');
    await expect(page.getByTestId('loc-gate')).toHaveAttribute('data-state', 'outside');
    await expect(page.getByText('Catai n’est pas encore dans ta région')).toBeVisible();
  });

  test('géolocalisation réelle du navigateur (permission accordée)', async ({ browser }) => {
    const context = await browser.newContext({ geolocation: POSITIONS.quebec, permissions: ['geolocation'] });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByTestId('loc-line')).toHaveText('Québec');
    await context.close();
  });

  test('aucune coordonnée précise n’est enregistrée', async ({ page }) => {
    await mockGeolocation(page, 'granted', POSITIONS.quebec);
    await page.goto('/#/partys');
    await expect(page.getByTestId('event-card')).toHaveCount(3);
    const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
    expect(stored).not.toMatch(/46\.78|71\.27|latitude/);
  });
});

test.describe('navigation, guides et mise en page', () => {
  test.beforeEach(async ({ page }) => {
    await setToday(page);
    await mockGeolocation(page, 'granted', POSITIONS.quebec);
  });

  test('démarches universitaires depuis un détail, lien officiel et retour', async ({ page }) => {
    await page.goto('/#/evenement/cafe-nouveaux');
    await page.getByTestId('guides-link').click();
    await expect(page.getByRole('heading', { name: 'Tes démarches' })).toBeVisible();
    const link = page.getByTestId('official-link');
    await expect(link).toHaveAttribute('href', 'https://www.ulaval.ca/admission');
    await expect(link).toHaveAttribute('target', '_blank');
    await page.locator('[data-step="0"]').click();
    await expect(page.locator('[data-step="0"]')).toHaveAttribute('aria-pressed', 'true');
    await page.getByTestId('arrival-link').click();
    await expect(page.getByRole('heading', { name: 'Préparer ton arrivée' })).toBeVisible();
    await page.getByRole('link', { name: 'Retour' }).click();
    await page.getByRole('link', { name: 'Retour' }).click();
    await expect(page.getByRole('heading', { name: 'Café des nouveaux' })).toBeVisible();
  });

  test('le bouton du site officiel ouvre la bonne ressource', async ({ page, context }) => {
    // Le réseau de test bloque les sites externes : on vérifie l'adresse demandée par le nouvel onglet.
    await context.route('https://www.ulaval.ca/**', (route) => route.fulfill({ status: 200, body: 'ok' }));
    await page.goto('/#/demarches');
    const [popup] = await Promise.all([context.waitForEvent('page'), page.getByTestId('official-link').click()]);
    expect(popup.url()).toBe('https://www.ulaval.ca/admission');
  });

  test('Messages et Profil sans compte : états vides avec action', async ({ page }) => {
    await page.goto('/#/partys');
    await page.getByTestId('tab-messages').click();
    await expect(page.getByTestId('no-threads')).toBeVisible();
    await page.getByTestId('tab-profile').click();
    await expect(page.getByTestId('no-profile')).toBeVisible();
    await page.getByTestId('tab-home').click();
    await expect(page.getByRole('heading', { name: 'On fait quoi ?' })).toBeVisible();
  });

  test('profil : modifier la langue puis réinitialiser la démo', async ({ page }) => {
    await page.goto('/#/evenement/cafe-nouveaux');
    await page.getByRole('button', { name: 'Rejoindre la rencontre' }).click();
    await createProfile(page);
    await page.getByTestId('tab-profile').click();
    await page.locator('.segmented__opt', { hasText: 'English' }).click();
    await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
    await page.getByRole('button', { name: 'Enregistrer' }).click();
    await expect(page.getByText('Profil enregistré.')).toBeVisible();
    await page.goto('/#/discussion/cafe-nouveaux');
    await expect(page.getByTestId('message').first()).toContainText('Hi! I just arrived in Quebec City.');
    await page.goto('/#/profil');
    await page.getByTestId('reset').click();
    await page.getByTestId('reset').click();
    await expect(page.getByRole('heading', { name: 'On fait quoi ?' })).toBeVisible();
    await page.goto('/#/profil');
    await expect(page.getByTestId('no-profile')).toBeVisible();
  });

  test('aucun prix, paiement, swipe ni création d’événement', async ({ page }) => {
    for (const hash of ['#/', '#/partys', '#/rencontres', '#/evenement/party-bienvenue', '#/evenement/cafe-nouveaux']) {
      await page.goto('/' + hash);
      await expect(page.locator('body')).not.toContainText(/\$|€|prix|payer|paiement|swipe|Créer un événement/i);
    }
  });

  test('aucun défilement horizontal sur les écrans principaux', async ({ page }) => {
    for (const hash of ['#/', '#/partys', '#/rencontres', '#/evenement/party-bienvenue', '#/evenement/cafe-nouveaux', '#/inscription', '#/demarches', '#/messages', '#/profil']) {
      await page.goto('/' + hash);
      await page.waitForTimeout(100);
      expect(await noHorizontalScroll(page), hash).toBe(true);
    }
  });

  test('sur ordinateur, les deux cartes de l’accueil sont côte à côte', async ({ page }, info) => {
    test.skip(info.project.name !== 'ordinateur');
    await page.goto('/');
    const a = await page.getByTestId('entry-partys').boundingBox();
    const b = await page.getByTestId('entry-rencontres').boundingBox();
    expect(Math.abs(a.y - b.y)).toBeLessThan(2);
    expect(b.x).toBeGreaterThan(a.x + a.width);
  });
});
