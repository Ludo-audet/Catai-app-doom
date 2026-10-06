// Exemples multilingues de discussion de groupe.
// Les deux premiers messages viennent de 07-documentation/donnees-exemple.json ;
// les deux suivants reprennent la maquette 07-discussion-traduction.
// Les traductions sont écrites à l'avance : la traduction IA est simulée dans ce prototype.
const MEI = { name: 'Mei', avatar: 'assets/03-avatars/discussion-mei.png' };
const ALEX = { name: 'Alex', avatar: 'assets/03-avatars/discussion-alex.png' };
const LEA = { name: 'Léa', avatar: 'assets/03-avatars/profil-lea.png' };

const GREETING = {
  sender: MEI, time: '14:22', sourceLanguage: 'zh-Hant', source: '大家好！我剛到魁北克。',
  translations: { fr: 'Salut ! Je viens d’arriver à Québec.', en: 'Hi! I just arrived in Quebec City.' },
};

export const SAMPLE_CHATS = {
  'cafe-nouveaux': [
    GREETING,
    {
      sender: ALEX, time: '14:28', sourceLanguage: 'en', source: 'Let’s meet at the café at 4 pm.',
      translations: { fr: 'On se retrouve au café à 16 h.', 'zh-Hant': '我們下午四點在咖啡館見。' },
    },
    {
      sender: LEA, time: '14:30', sourceLanguage: 'fr', source: 'Parfait, à bientôt !',
      translations: { en: 'Perfect, see you soon!', 'zh-Hant': '太好了，待會見！' },
    },
    {
      sender: MEI, time: '14:31', sourceLanguage: 'zh-Hant', source: '待會見！',
      translations: { fr: 'À bientôt !', en: 'See you soon!' },
    },
  ],
  'party-bienvenue': [GREETING],
};
