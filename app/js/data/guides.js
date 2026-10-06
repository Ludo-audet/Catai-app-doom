// Démarches universitaires par zone. Liens officiels fournis dans 07-documentation/decisions-et-parcours.txt.
// Les guides officiels doivent être revus par l'équipe avant une publication réelle.
export const GUIDES = {
  quebec: {
    institution: 'Université Laval',
    photo: 'assets/02-photos/campus-guide.png',
    admission: {
      title: 'Préparer ton admission',
      steps: [
        { title: 'Choisir ton programme', text: 'Consulte les conditions d’admission.' },
        { title: 'Préparer ton dossier', text: 'Rassemble les documents demandés.' },
        { title: 'Déposer ta demande', text: 'Passe par le portail officiel.' },
      ],
      officialUrl: 'https://www.ulaval.ca/admission',
      source: 'Université Laval · ulaval.ca',
    },
    arrival: {
      title: 'Préparer ton arrivée',
      steps: [
        { title: 'Vérifier tes documents', text: 'Garde ta lettre d’admission et tes papiers d’immigration à portée de main.' },
        { title: 'Trouver un logement', text: 'Prévois ton premier hébergement avant ton départ.' },
        { title: 'Rejoindre un événement', text: 'Rencontre d’autres étudiants dès ta première semaine.' },
      ],
      officialUrl: null,
    },
  },
  taiwan: {
    institution: 'National Taiwan University',
    photo: 'assets/02-photos/echange-langues.png',
    admission: {
      title: 'Préparer ton admission',
      steps: [
        { title: 'Choisir ton programme', text: 'Consulte les conditions d’admission internationales.' },
        { title: 'Préparer ton dossier', text: 'Rassemble les documents demandés.' },
        { title: 'Déposer ta demande', text: 'Passe par le portail officiel.' },
      ],
      officialUrl: 'https://admissions.ntu.edu.tw/',
      source: 'National Taiwan University · admissions.ntu.edu.tw',
    },
    arrival: {
      title: 'Préparer ton arrivée',
      steps: [
        { title: 'Vérifier tes documents', text: 'Garde ta lettre d’admission et ton visa à portée de main.' },
        { title: 'Trouver un logement', text: 'Prévois ton premier hébergement avant ton départ.' },
        { title: 'Rejoindre un événement', text: 'Rencontre d’autres étudiants dès ta première semaine.' },
      ],
      officialUrl: null,
    },
  },
};
