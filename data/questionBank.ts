export type QuizQuestion = {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  philosophie: [
    {
      id: 'philo-kant-1',
      topic: 'Philosophie',
      prompt: "Selon Kant, qu’est-ce que l’impératif catégorique ?",
      options: [
        'Une règle morale universelle à suivre indépendamment des conséquences',
        'Une stratégie pour maximiser le bonheur individuel',
        'Une norme sociale qui varie selon les cultures',
        'Un conseil pratique pour réussir ses objectifs',
      ],
      correctIndex: 0,
      explanation: "Pour Kant, l’impératif catégorique commande d’agir selon une maxime que l’on peut vouloir ériger en loi universelle.",
    },
  ],
  mathematiques: [
    {
      id: 'math-derivee-1',
      topic: 'Mathématiques',
      prompt: 'Que représente la dérivée d’une fonction en un point ?',
      options: ['La pente de la tangente', 'La surface sous la courbe', 'La valeur moyenne', 'Le maximum global'],
      correctIndex: 0,
    },
  ],
  anglais: [
    {
      id: 'en-grammar-1',
      topic: 'Anglais',
      prompt: "Quelle phrase est correcte ?",
      options: ['He don’t like it.', 'He doesn’t like it.', 'He doesn’t likes it.', 'He not like it.'],
      correctIndex: 1,
    },
  ],
  management: [
    {
      id: 'mgmt-1',
      topic: 'Management',
      prompt: 'Quel est le principe central de la méthode Pomodoro ?',
      options: [
        'Travailler 4 heures sans interruption',
        'Alterner travail focalisé et pauses courtes',
        'Écouter de la musique pendant la tâche',
        'Réviser uniquement avant de dormir',
      ],
      correctIndex: 1,
    },
  ],
  leadership: [
    {
      id: 'lead-1',
      topic: 'Leadership',
      prompt: 'Quel comportement est le plus associé au leadership serviteur ?',
      options: ['Commander', 'Écouter et soutenir', 'Contrôler', 'Éviter les feedbacks'],
      correctIndex: 1,
    },
  ],
  'gestion de projet': [
    {
      id: 'pm-1',
      topic: 'Gestion de Projet',
      prompt: 'À quoi sert un backlog produit ?',
      options: ['À lister et prioriser les besoins/fonctionnalités', 'À écrire du code', 'À tester en production', 'À éviter les sprints'],
      correctIndex: 0,
    },
  ],
};

