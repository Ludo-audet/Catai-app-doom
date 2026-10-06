// Écran 07 : discussion de groupe traduite, et liste des discussions (onglet Messages).
import { esc, icon, fmt, photo, demoNote } from '../ui/components.js';
import { eventById } from '../data/events.js';
import { SAMPLE_CHATS } from '../data/chats.js';
import { LANGUAGES, languageByCode } from '../data/languages.js';
import { zoneById } from '../data/zones.js';
import { store, isJoined, participantCount, readingLanguage } from '../services/store.js';
import { presentMessage, translateText, isTranslationServiceConfigured } from '../services/translation.js';
import { notFound } from './not-found.js';

function messagesFor(eventId) {
  return [...(SAMPLE_CHATS[eventId] || []), ...(store.get().messages[eventId] || [])];
}

function bubble(message, reader) {
  const shown = presentMessage(message, reader);
  const own = message.own;
  const lang = shown.kind === 'translated' ? reader : message.sourceLanguage;
  let extra = '';
  if (shown.kind === 'translated' && !own) {
    extra = `<div class="bubble__orig" data-testid="original"><p class="bubble__orig-label">Original · ${esc(languageByCode(message.sourceLanguage).label)}</p><p lang="${esc(message.sourceLanguage)}">${esc(shown.original)}</p></div>`;
  } else if (shown.kind === 'unavailable' && !own) {
    extra = `<p class="bubble__note" data-testid="no-translation">Traduction non disponible · texte original</p>`;
  } else if (own) {
    extra = message.translationStatus === 'ok'
      ? `<p class="bubble__note">Traduit pour le groupe</p>`
      : `<p class="bubble__note" data-testid="no-translation">Traduction non disponible · texte original envoyé</p>`;
  }
  return `<div class="bubble ${own ? 'bubble--own' : ''}"><p class="bubble__text" lang="${esc(lang)}">${esc(shown.text)}</p>${extra}</div>`;
}

function messageItem(message, reader) {
  const time = fmt.clock(message.time);
  if (message.own) {
    return `<li class="msg msg--own" data-testid="message">
      <p class="msg__time msg__time--own"><time>${time}</time>${icon('check', 'icon--xs')}</p>
      ${bubble(message, reader)}
    </li>`;
  }
  return `<li class="msg" data-testid="message">
    <img class="msg__avatar" src="${esc(message.sender.avatar)}" alt="">
    <div class="msg__main">
      <p class="msg__head"><span class="msg__name">${esc(message.sender.name)}</span><time>${time}</time></p>
      ${bubble(message, reader)}
    </div>
  </li>`;
}

export function chatScreen({ id }) {
  const event = eventById(id);
  if (!event) return notFound();
  if (!isJoined(id)) return { redirect: `#/evenement/${id}?notice=members-only` };
  const reader = readingLanguage();
  const messages = messagesFor(id);
  const zone = zoneById(event.zone);
  const service = isTranslationServiceConfigured();
  return {
    title: `Discussion · ${event.title}`,
    nav: 'messages',
    back: `#/evenement/${id}`,
    html: `<div class="page chat">
      <a class="chat-head" href="#/evenement/${esc(id)}">
        ${photo(event.photo, '', 'photo--chat')}
        <span class="chat-head__body">
          <span class="chat-head__title">${esc(event.title)}</span>
          <span class="meta meta--muted">${icon('pin', 'icon--sm')}<span>${esc(zone?.label || '')} · ${participantCount(event)} participants</span></span>
        </span>
      </a>
      <section class="translate-bar" aria-label="Traduction">
        <span class="translate-bar__icon">${icon('translation')}</span>
        <div class="translate-bar__body">
          <p class="translate-bar__title">${service ? 'Traduction IA active' : 'Traduction IA simulée'}</p>
          <p class="translate-bar__text">${service ? 'Les messages sont traduits automatiquement pour tout le monde.' : 'Mode démo : exemples traduits à l’avance. Tes messages restent en version originale.'}</p>
        </div>
        <label class="translate-bar__lang">
          <select data-testid="reading-language" aria-label="Langue de lecture">
            ${LANGUAGES.map((l) => `<option value="${l.code}" ${l.code === reader ? 'selected' : ''}>${esc(l.label)}</option>`).join('')}
          </select>
          <span>Langue de lecture</span>
        </label>
      </section>
      <ol class="messages" data-testid="messages" aria-live="polite">
        ${messages.length ? messages.map((m) => messageItem(m, reader)).join('') : `<li class="state state--compact"><p class="state__text">Aucun message pour l’instant. Présente-toi au groupe !</p></li>`}
      </ol>
      <form class="composer" data-testid="composer">
        <label class="visually-hidden" for="f-message">Message</label>
        <input id="f-message" name="message" class="composer__input" placeholder="Écris dans ta langue…" autocomplete="off" maxlength="500">
        <button class="composer__send" type="submit" aria-label="Envoyer">${icon('send')}</button>
      </form>
      <p class="composer__note">Messages écrits seulement. Pas de vocal ni d’appel dans cette version.</p>
    </div>`,
    mount(root, rerender) {
      const list = root.querySelector('.messages');
      list.lastElementChild?.scrollIntoView({ block: 'end' });
      root.querySelector('[data-testid="reading-language"]').addEventListener('change', (e) => {
        store.update((d) => { if (d.profile) d.profile.language = e.target.value; });
      });
      const form = root.querySelector('form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = form.message.value.trim();
        if (!text) { form.message.focus(); return; }
        const now = new Date();
        const from = readingLanguage();
        const result = await translateText({ text, from, to: LANGUAGES.map((l) => l.code).filter((c) => c !== from) });
        store.update((d) => {
          d.messages[id] = d.messages[id] || [];
          d.messages[id].push({
            own: true,
            sender: { name: d.profile?.firstName || 'Moi', avatar: d.profile?.photo || '' },
            time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
            sourceLanguage: from,
            source: text,
            translations: result.status === 'ok' ? result.translations : {},
            translationStatus: result.status,
          });
        });
        root.querySelector('#f-message')?.focus();
      });
    },
  };
}

export function messagesScreen() {
  const { joined, profile } = store.get();
  const reader = readingLanguage();
  const events = joined.map(eventById).filter(Boolean);
  const items = events.map((event) => {
    const msgs = messagesFor(event.id);
    const last = msgs[msgs.length - 1];
    const preview = last ? presentMessage(last, reader).text : 'Aucun message pour l’instant';
    return `<li><a class="thread-row" href="#/discussion/${esc(event.id)}" data-testid="thread">
      ${photo(event.photo, '', 'photo--thumb')}
      <span class="thread-row__body">
        <span class="thread-row__title">${esc(event.title)}</span>
        <span class="thread-row__preview">${last && !last.own ? `${esc(last.sender.name)} : ` : ''}${esc(preview)}</span>
      </span>
      ${icon('chevron-right', 'icon--sm')}
    </a></li>`;
  });
  return {
    title: 'Messages',
    nav: 'messages',
    back: null,
    html: `<div class="page page--narrow">
      <h1 class="page__title page__title--xl">Messages</h1>
      <p class="page__lead">Les discussions des événements que tu as rejoints.</p>
      ${items.length ? `<ul class="threads">${items.join('')}</ul>` : `<section class="state" data-testid="no-threads">
        <div class="state__icon">${icon('message')}</div>
        <h2 class="state__title">Aucune discussion pour l’instant</h2>
        <p class="state__text">${profile ? 'Rejoins un party ou une rencontre pour ouvrir sa discussion de groupe.' : 'Choisis un party ou une rencontre, puis rejoins-le pour ouvrir sa discussion.'}</p>
        <a class="btn btn--primary" href="#/">Voir les événements</a>
      </section>`}
      ${items.length ? demoNote('Discussions de démonstration enregistrées dans ce navigateur.') : ''}
    </div>`,
  };
}
