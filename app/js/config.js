// Configuration publique du prototype. Ne jamais placer de clé ou de secret ici :
// ce fichier est envoyé au navigateur et versionné dans GitHub.
export const CONFIG = {
  // Adresse d'une fonction serveur qui appelle l'API de traduction avec une clé gardée côté serveur.
  // Exemple futur : '/api/translate'. null = aucun service branché (prototype).
  translationEndpoint: null,
  // Délai maximal pour obtenir la position du navigateur.
  geolocationTimeoutMs: 10000,
};
