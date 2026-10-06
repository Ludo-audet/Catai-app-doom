// Langues de lecture et d'écriture proposées.
export const LANGUAGES = [
  { code: 'fr', label: 'Français', name: 'Français' },
  { code: 'en', label: 'English', name: 'Anglais' },
  { code: 'zh-Hant', label: '中文', name: 'Mandarin' },
];

export const DEFAULT_LANGUAGE = 'fr';

export function languageByCode(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}
