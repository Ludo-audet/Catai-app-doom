# Catai : prototype cliquable V1

Catai rapproche les étudiants locaux et les étudiants étrangers qui arrivent dans un nouveau pays.
Pilote : Québec et Université Laval. Première expansion : Taïwan.

Ce dépôt contient le premier prototype cliquable, construit à partir du paquet graphique
`Catai-Graphic-Package-V1/` (les huit maquettes de `01-maquettes-reference` sont la référence).
C’est une application web statique, pensée d’abord pour le téléphone, **avec des données d’exemple**.
Les comptes, la vérification du courriel, la confirmation d’âge et la traduction IA sont **simulés** et identifiés comme tels à l’écran.

## Lancer le prototype

Prérequis : Node.js 20 ou plus récent. Aucune dépendance n’est nécessaire pour l’application elle-même.

```bash
npm run dev        # http://localhost:5173/
```

Pour tester la localisation sur un téléphone, ouvre l’adresse publiée (HTTPS) : les navigateurs refusent la géolocalisation sur une adresse HTTP autre que `localhost`.

## Vérifications

```bash
npm install
npx playwright install chromium   # une seule fois
npm test                          # tests sur téléphone (Pixel 7) et ordinateur (1280 px)
npm run build                     # version publiable dans dist/
npm run preview                   # sert dist/ sur http://localhost:5173/
```

Les tests couvrent les deux parcours depuis l’accueil, les retours, les filtres, l’inscription avec reprise de l’événement choisi,
les doubles inscriptions, le retrait, la discussion dans les trois langues, la restriction 18+ simulée,
la localisation (accordée, demandée, refusée, indisponible, hors zone, Taïwan), les liens officiels,
l’absence de défilement horizontal et la mise en page sur ordinateur.
Les positions de test sont simulées dans `tests/helpers.js` ; l’interface publique n’a aucun sélecteur de pays.

## Publication (GitHub Pages)

Le flux `.github/workflows/deploy-pages.yml` publie `dist/` à chaque mise à jour de `main`.
Réglage unique, à faire une fois par une personne administratrice du dépôt :

1. GitHub > dépôt **Catai-app-doom** > **Settings** > **Pages**.
2. Sous **Build and deployment**, choisir **Source : GitHub Actions**.
3. Fusionner la PR dans `main` (ou lancer **Actions > Publier le prototype (GitHub Pages) > Run workflow**).
4. L’adresse s’affiche dans l’exécution du flux, normalement `https://ludo-audet.github.io/Catai-app-doom/`.

Tout hébergeur statique convient aussi (Netlify, Vercel, Cloudflare Pages) : commande `npm run build`, dossier `dist`.

## Structure

```
app/                     application (HTML, CSS, JavaScript sans framework)
  index.html
  css/app.css            styles ; variables de base dans assets/06-style/catai-theme.css
  img/catai-logo.png     logo de référence du paquet, fond rendu transparent
  js/main.js             routeur (#/…), mise en page, barre Accueil / Messages / Profil
  js/config.js           configuration publique (aucun secret)
  js/data/               données centralisées : zones, langues, événements, discussions, guides
  js/services/           stockage local, localisation, traduction, participation
  js/screens/            écrans
  js/ui/                 composants et icônes (générées depuis 05-icones)
scripts/                 serveur local, compilation, génération des icônes
tests/                   tests Playwright
Catai-Graphic-Package-V1/ paquet graphique d’origine (non modifié)
```

En développement, `/assets/` pointe vers les dossiers publics du paquet (`02-photos` à `06-style`).
La compilation copie seulement ces dossiers : les maquettes, les archives et le PDF ne sont pas publiés.

Modifier le contenu :
- événements : `app/js/data/events.js` ;
- zones couvertes : `app/js/data/zones.js` ;
- exemples de discussion et leurs traductions : `app/js/data/chats.js` ;
- démarches et liens officiels : `app/js/data/guides.js`.

## Ce qui fonctionne

- Accueil avec deux choix (Partys, Rencontres) et la zone détectée.
- Localisation automatique avec autorisation : Québec (pilote) ou Taïwan (expansion), sinon état explicite
  (demande, refus, position indisponible, hors zone, navigateur incompatible). Les coordonnées ne sont jamais enregistrées.
- Listes filtrables (Tous / Cette semaine ; Tous / Café / Langues / Sorties), badges 18+ et Meet-up, détails complets.
- Parcours de participation : profil (photo réelle depuis l’appareil, prénom, université, courriel universitaire, langue),
  code de vérification, confirmation d’âge pour les partys 18+, confirmation, ouverture de la discussion.
  L’événement choisi est conservé dans l’adresse à chaque étape, même après un rechargement.
- Une seule inscription par événement ; compteur et bouton mis à jour à l’inscription et au retrait.
- Discussions de groupe réservées aux participants, lecture en français, anglais ou mandarin, texte d’origine visible,
  envoi de messages.
- Onglets Messages (discussions rejointes) et Profil (modifier les informations et la langue, réinitialiser la démo).
- Démarches universitaires avec étapes cochables et lien vers le site officiel.
- Mise en page téléphone et ordinateur.

## Ce qui reste simulé

| Fonction | Dans le prototype | À intégrer |
|---|---|---|
| Comptes | Profil gardé dans le navigateur (`localStorage`) | Authentification et base de données |
| Vérification du courriel | Code affiché à l’écran, aucun courriel envoyé | Service d’envoi de code (ex. Supabase Auth, Firebase Auth, Resend) |
| Âge | Date de naissance déclarée ; seul le résultat est gardé | Vrai contrôle d’âge (pièce d’identité ou service spécialisé), distinct du courriel universitaire |
| Traduction | Exemples traduits à l’avance ; les nouveaux messages restent en version originale | Fonction serveur qui appelle une API de traduction (voir ci-dessous) |
| Discussions | Messages gardés dans le navigateur, sans autres participants réels | Messagerie temps réel |
| Événements de Taïwan | Exemples fictifs, identifiés à l’écran | Vrais événements et ambassadeurs |
| Création d’événements | Absente (réservée à l’équipe et aux ambassadeurs) | Outil d’administration |

## Brancher la traduction plus tard

`app/js/services/translation.js` isole la traduction. Pour l’activer :
1. créer une fonction serveur (ex. `/api/translate`) qui garde la clé de l’API de traduction dans ses variables d’environnement ;
2. elle reçoit `{ text, from, to: [langues] }` et renvoie `{ translations: { en: "...", "zh-Hant": "..." } }` ;
3. renseigner `translationEndpoint` dans `app/js/config.js`.

Aucune clé ne doit apparaître dans le navigateur ni dans GitHub.

## Points à valider

- Les liens officiels (`ulaval.ca/admission`, `admissions.ntu.edu.tw`) viennent de `07-documentation/decisions-et-parcours.txt` et doivent être revus avant une publication réelle.
  La section « Préparer ton arrivée » attend ses liens officiels.
- Les photos et avatars sont des extraits des maquettes générées par IA, en résolution limitée. La présence du nom Université Laval ne signifie pas un partenariat.
- Le comportement final hors des zones desservies reste à définir.
- L’interface est en français ; seule la lecture des discussions change de langue dans cette version.
