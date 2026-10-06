// Outils de test : positions simulées (aucun sélecteur de pays dans l'interface publique).
export const POSITIONS = {
  quebec: { latitude: 46.7817, longitude: -71.2747 },
  taipei: { latitude: 25.0173, longitude: 121.5397 },
  paris: { latitude: 48.8566, longitude: 2.3522 },
};

/**
 * Remplace la géolocalisation du navigateur avant le chargement de la page.
 * mode : 'granted' (position fournie), 'prompt' (permission à demander puis accordée),
 *        'denied' (refus), 'unavailable' (position introuvable).
 */
export async function mockGeolocation(page, mode, position = POSITIONS.quebec) {
  await page.addInitScript(({ mode, position }) => {
    let permission = mode === 'granted' ? 'granted' : mode === 'denied' ? 'denied' : 'prompt';
    const geo = {
      getCurrentPosition(success, error) {
        setTimeout(() => {
          if (mode === 'denied') return error({ code: 1, message: 'denied' });
          if (mode === 'unavailable') return error({ code: 2, message: 'unavailable' });
          permission = 'granted';
          success({ coords: { latitude: position.latitude, longitude: position.longitude, accuracy: 30 }, timestamp: Date.now() });
        }, 50);
      },
      watchPosition() { return 0; },
      clearWatch() {},
    };
    Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true });
    const query = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = (desc) => (desc && desc.name === 'geolocation' ? Promise.resolve({ state: permission }) : query(desc));
  }, { mode, position });
}

export async function setToday(page) {
  await page.clock.setFixedTime(new Date('2026-10-06T10:00:00'));
}

export async function createProfile(page, { name = 'Léa', email = 'lea@ulaval.ca' } = {}) {
  await page.setInputFiles('[data-testid="photo-input"]', 'Catai-Graphic-Package-V1/03-avatars/profil-lea.png');
  await page.getByLabel('Prénom').fill(name);
  await page.getByLabel('Courriel universitaire').fill(email);
  await page.getByRole('button', { name: 'Recevoir mon code' }).click();
  const code = await page.getByTestId('demo-code').textContent();
  await page.getByLabel('Code reçu').fill(code);
  await page.getByRole('button', { name: 'Vérifier' }).click();
}

export async function noHorizontalScroll(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
}
