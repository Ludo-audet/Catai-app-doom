// Écran 06 (inscription) et petits écrans du parcours : vérification du courriel, âge, confirmation.
// Comptes, courriel et âge sont simulés dans ce prototype et identifiés comme tels.
import { esc, icon, fmt, demoNote, photo, toast } from '../ui/components.js';
import { eventById } from '../data/events.js';
import { LANGUAGES } from '../data/languages.js';
import { ZONES } from '../data/zones.js';
import { locator } from '../services/location.js';
import { store } from '../services/store.js';
import { nextJoinStep } from '../services/participation.js';
import { notFound } from './not-found.js';

const ALL_UNIVERSITIES = ZONES.flatMap((z) => z.universities);

export function validateProfile(values) {
  const errors = {};
  if (!values.photo) errors.photo = 'Ajoute une photo de profil.';
  if (!values.firstName || values.firstName.trim().length < 2) errors.firstName = 'Indique ton prénom.';
  if (!values.university || !values.university.trim()) errors.university = 'Indique ton université.';
  const email = (values.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Indique un courriel valide.';
  } else {
    const known = ALL_UNIVERSITIES.find((u) => u.name.toLowerCase() === values.university.trim().toLowerCase());
    if (known && !known.domains.some((d) => email.endsWith('@' + d) || email.endsWith('.' + d))) {
      errors.email = `Utilise ton courriel de ${known.name} (@${known.domains[0]}).`;
    }
  }
  if (!LANGUAGES.some((l) => l.code === values.language)) errors.language = 'Choisis ta langue.';
  return errors;
}

/** Redimensionne la photo choisie pour qu'elle reste légère dans le stockage local. */
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('type'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode'));
      img.onload = () => {
        const size = 320;
        const scale = Math.max(size / img.width, size / img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function field(name, label, value, attrs = '') {
  return `<div class="field">
    <label class="field__label" for="f-${name}">${label}</label>
    <input class="field__input" id="f-${name}" name="${name}" value="${esc(value)}" aria-describedby="err-${name}" ${attrs}>
    <p class="field__error" id="err-${name}" data-error="${name}"></p>
  </div>`;
}

function locationInfo() {
  const { status } = locator.get();
  const zone = locator.zone();
  if (zone) {
    return `<div class="loc-info" data-testid="loc-info">${icon('pin')}<div><p class="loc-info__title">${esc(zone.detectedLabel)}</p><p class="loc-info__sub">Localisation autorisée</p></div></div>`;
  }
  const label = { denied: 'Localisation refusée', unavailable: 'Position indisponible', outside: 'Hors des zones Catai', locating: 'Localisation…' }[status] || 'Localisation non détectée';
  const canRetry = status !== 'locating' && status !== 'unsupported';
  return `<div class="loc-info" data-testid="loc-info">${icon('pin')}<div><p class="loc-info__title">${label}</p>
    ${canRetry ? `<button type="button" class="btn btn--link btn--inline" data-action="locate">Autoriser la localisation</button>` : ''}</div></div>`;
}

/** Formulaire de profil : inscription (mode 'signup') ou modification (mode 'edit'). */
export function profileForm(mode, eventId) {
  const zone = locator.zone();
  const p = store.get().profile || {};
  const values = {
    firstName: p.firstName || '',
    university: p.university || zone?.institution || '',
    email: p.email || '',
    language: p.language || 'fr',
    photo: p.photo || null,
  };
  const html = `<form class="form" novalidate data-testid="profile-form">
    <div class="photo-pick">
      <label class="photo-pick__circle" for="f-photo">
        ${values.photo ? `<img src="${esc(values.photo)}" alt="Ta photo de profil" data-testid="photo-preview">` : `<span class="photo-pick__empty">${icon('profile')}</span>`}
        <span class="photo-pick__plus" aria-hidden="true">${icon('plus')}</span>
      </label>
      <input class="visually-hidden" type="file" id="f-photo" name="photo" accept="image/*" aria-describedby="err-photo" data-testid="photo-input">
      <label class="photo-pick__label" for="f-photo">${values.photo ? 'Changer la photo' : 'Ajouter une photo'}</label>
      <p class="field__error" id="err-photo" data-error="photo"></p>
    </div>
    ${field('firstName', 'Prénom', values.firstName, 'autocomplete="given-name" placeholder="Léa"')}
    ${field('university', 'Université', values.university, 'list="universities" autocomplete="organization"')}
    <datalist id="universities">${ALL_UNIVERSITIES.map((u) => `<option value="${esc(u.name)}">`).join('')}</datalist>
    ${field('email', 'Courriel universitaire', values.email, 'type="email" inputmode="email" autocomplete="email" placeholder="prenom@ulaval.ca"')}
    <fieldset class="field">
      <legend class="field__label">Ta langue</legend>
      <div class="segmented">
        ${LANGUAGES.map((l) => `<label class="segmented__opt"><input type="radio" name="language" value="${l.code}" ${l.code === values.language ? 'checked' : ''}><span lang="${l.code}">${esc(l.label)}</span></label>`).join('')}
      </div>
      <p class="field__error" data-error="language"></p>
    </fieldset>
    <div data-slot="loc-info">${locationInfo()}</div>
    <button class="btn btn--primary btn--block btn--lg" type="submit" data-testid="submit">${mode === 'signup' ? 'Recevoir mon code' : 'Enregistrer'}</button>
    ${mode === 'signup' ? `<p class="hint">Un code sera envoyé à ton courriel universitaire.</p>` : ''}
  </form>`;

  function mount(root, rerender, navigate) {
    const form = root.querySelector('form');
    let currentPhoto = values.photo;
    const input = form.querySelector('#f-photo');
    input.addEventListener('change', async () => {
      const err = form.querySelector('[data-error="photo"]');
      try {
        currentPhoto = await readPhoto(input.files[0]);
        const circle = form.querySelector('.photo-pick__circle');
        circle.querySelector('img, .photo-pick__empty')?.remove();
        circle.insertAdjacentHTML('afterbegin', `<img src="${currentPhoto}" alt="Ta photo de profil" data-testid="photo-preview">`);
        form.querySelector('.photo-pick__label').textContent = 'Changer la photo';
        err.textContent = '';
      } catch {
        err.textContent = 'Ce fichier n’est pas une image lisible. Choisis une photo.';
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const next = {
        firstName: String(fd.get('firstName') || '').trim(),
        university: String(fd.get('university') || '').trim(),
        email: String(fd.get('email') || '').trim().toLowerCase(),
        language: String(fd.get('language') || ''),
        photo: currentPhoto,
      };
      const errors = validateProfile(next);
      form.querySelectorAll('[data-error]').forEach((el) => { el.textContent = errors[el.dataset.error] || ''; });
      form.querySelectorAll('.field__input').forEach((el) => el.setAttribute('aria-invalid', errors[el.name] ? 'true' : 'false'));
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        (form.querySelector(`[name="${firstInvalid}"]`) || form.querySelector('#f-photo'))?.focus();
        return;
      }
      const prev = store.get().profile;
      const emailChanged = !prev || prev.email !== next.email;
      store.update((d) => {
        d.profile = { ...(d.profile || {}), ...next, emailVerified: emailChanged ? false : Boolean(prev?.emailVerified) };
      });
      const q = eventId ? `?event=${encodeURIComponent(eventId)}` : '';
      if (emailChanged) {
        newDemoCode();
        navigate(`#/verification${q}`);
      } else if (mode === 'signup' && eventId) {
        navigate(nextJoinStep(eventId));
      } else {
        toast('Profil enregistré.');
        rerender();
      }
    });
  }

  function onState(root) {
    const slot = root.querySelector('[data-slot="loc-info"]');
    if (slot) slot.innerHTML = locationInfo();
  }

  return { html, mount, onState };
}

export function signupScreen({ params }) {
  const eventId = params.get('event');
  const event = eventId ? eventById(eventId) : null;
  const form = profileForm('signup', event?.id);
  return {
    title: 'Ton profil étudiant',
    nav: null,
    back: event ? `#/evenement/${event.id}` : '#/profil',
    html: `<div class="page page--narrow">
      <h1 class="page__title page__title--lg">Ton profil étudiant</h1>
      <p class="page__lead">${event ? `Pour rejoindre « ${esc(event.title)} ».` : 'Pour rejoindre les événements.'}</p>
      ${demoNote('Ton profil reste dans ce navigateur. Aucun compte réel n’est créé.')}
      ${form.html}
    </div>`,
    mount: form.mount,
    onState: form.onState,
  };
}

// --- Vérification du courriel (simulée) ---
const CODE_KEY = 'catai-demo-code';
let memoryCode = null;

function newDemoCode() {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  memoryCode = code;
  try { sessionStorage.setItem(CODE_KEY, code); } catch { /* mémoire seulement */ }
  return code;
}

function currentDemoCode() {
  try { return sessionStorage.getItem(CODE_KEY) || memoryCode || newDemoCode(); } catch { return memoryCode || newDemoCode(); }
}

export function verificationScreen({ params }) {
  const { profile } = store.get();
  const eventId = params.get('event');
  const q = eventId ? `?event=${encodeURIComponent(eventId)}` : '';
  if (!profile) return { redirect: `#/inscription${q}` };
  const code = currentDemoCode();
  return {
    title: 'Vérifie ton courriel',
    nav: null,
    back: `#/inscription${q}`,
    html: `<div class="page page--narrow">
      <div class="state__icon state__icon--lg">${icon('mail')}</div>
      <h1 class="page__title page__title--lg">Vérifie ton courriel</h1>
      <p class="page__lead">Entre le code à 6 chiffres prévu pour <strong>${esc(profile.email)}</strong>.</p>
      <div class="demo-code" role="note" data-testid="demo-code-box">
        <p class="demo-code__label">Mode démo · aucun courriel n’est envoyé</p>
        <p class="demo-code__text">Ton code de démonstration : <strong data-testid="demo-code">${code}</strong></p>
      </div>
      <form class="form" novalidate data-testid="code-form">
        <div class="field">
          <label class="field__label" for="f-code">Code reçu</label>
          <input class="field__input field__input--code" id="f-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" aria-describedby="err-code">
          <p class="field__error" id="err-code" data-error="code"></p>
        </div>
        <button class="btn btn--primary btn--block btn--lg" type="submit">Vérifier</button>
        <button class="btn btn--link" type="button" data-action="resend">Renvoyer un code</button>
      </form>
    </div>`,
    mount(root, rerender, navigate) {
      const form = root.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = form.code.value.replace(/\s/g, '');
        const err = form.querySelector('[data-error="code"]');
        if (!/^\d{6}$/.test(value)) { err.textContent = 'Le code contient 6 chiffres.'; form.code.focus(); return; }
        if (value !== currentDemoCode()) { err.textContent = 'Ce code ne correspond pas. Vérifie-le et réessaie.'; form.code.focus(); return; }
        store.update((d) => { d.profile.emailVerified = true; });
        toast('Courriel vérifié (simulation).');
        navigate(eventId ? nextJoinStep(eventId) : '#/profil');
      });
      root.querySelector('[data-action="resend"]').addEventListener('click', () => {
        newDemoCode();
        rerender();
        toast('Nouveau code de démonstration généré.');
      });
    },
  };
}

// --- Confirmation d'âge (simulée), seulement pour les partys réservés aux adultes ---
export function ageOn(birthIso, now = new Date()) {
  const [y, m, d] = birthIso.split('-').map(Number);
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age -= 1;
  return age;
}

export function ageScreen({ params }) {
  const event = eventById(params.get('event'));
  if (!event) return notFound();
  if (!store.get().profile) return { redirect: `#/inscription?event=${event.id}` };
  return {
    title: 'Confirmation d’âge',
    nav: null,
    back: `#/evenement/${event.id}`,
    html: `<div class="page page--narrow">
      <div class="state__icon state__icon--lg">${icon('lock')}</div>
      <h1 class="page__title page__title--lg">Ton âge</h1>
      <p class="page__lead">« ${esc(event.title)} » est réservé aux ${event.minimumAge} ans et plus.</p>
      ${demoNote('Confirmation d’âge simulée : aucune pièce d’identité n’est vérifiée. Ton courriel universitaire ne prouve pas ton âge.')}
      <form class="form" novalidate data-testid="age-form">
        <div class="field">
          <label class="field__label" for="f-birth">Date de naissance</label>
          <input class="field__input" type="date" id="f-birth" name="birth" max="${new Date().toISOString().slice(0, 10)}" aria-describedby="err-birth">
          <p class="field__error" id="err-birth" data-error="birth"></p>
        </div>
        <button class="btn btn--primary btn--block btn--lg" type="submit">Confirmer mon âge</button>
        <p class="hint">Seul le résultat (adulte ou non) est gardé dans la démo.</p>
      </form>
    </div>`,
    mount(root, rerender, navigate) {
      const form = root.querySelector('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = form.birth.value;
        const err = form.querySelector('[data-error="birth"]');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) { err.textContent = 'Indique ta date de naissance.'; form.birth.focus(); return; }
        const age = ageOn(value);
        if (age < 0 || age > 120) { err.textContent = 'Cette date n’est pas valide.'; form.birth.focus(); return; }
        const adult = age >= event.minimumAge;
        store.update((d) => { d.profile.ageCheck = adult ? 'adult' : 'minor'; });
        navigate(adult ? nextJoinStep(event.id) : `#/evenement/${event.id}`);
      });
    },
  };
}

export function confirmationScreen({ id }) {
  const event = eventById(id);
  if (!event) return notFound();
  if (!store.get().joined.includes(id)) return { redirect: `#/evenement/${id}` };
  return {
    title: 'Participation confirmée',
    nav: 'home',
    back: `#/evenement/${id}`,
    html: `<div class="page page--narrow confirm">
      <div class="confirm__check" aria-hidden="true">${icon('check')}</div>
      <h1 class="page__title page__title--lg">C’est confirmé !</h1>
      <p class="page__lead">Tu participes à « ${esc(event.title)} ».</p>
      <div class="confirm__card">
        ${photo(event.photo, '', 'photo--thumb')}
        <div>
          <p class="confirm__title">${esc(event.title)}</p>
          <p class="meta">${icon('calendar', 'icon--sm')}<span>${fmt.dayLong(event.date)} · ${fmt.time(event.time)}</span></p>
          <p class="meta meta--muted">${icon('pin', 'icon--sm')}<span>${esc(event.place)}</span></p>
        </div>
      </div>
      ${demoNote('Inscription enregistrée dans ce navigateur seulement.')}
      <a class="btn btn--primary btn--block btn--lg" href="#/discussion/${esc(id)}" data-testid="open-chat">Ouvrir la discussion</a>
      <a class="btn btn--link" href="#/evenement/${esc(id)}">Retour à l’événement</a>
    </div>`,
  };
}

