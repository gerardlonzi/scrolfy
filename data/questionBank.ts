export type QuizQuestion = {
  id: string;
  topic: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export const QUESTION_BANK: Record<string, Record<'easy' | 'medium' | 'hard', QuizQuestion[]>> = {
  philosophie: {
    easy: [
      {
        id: 'philo-platon-1',
        topic: 'Philosophie',
        subject: 'philosophie',
        difficulty: 'easy',
        prompt: 'Quel philosophe a écrit "La République" ?',
        options: ['Platon', 'Descartes', 'Kant', 'Nietzsche'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'philo-kant-1',
      topic: 'Philosophie',
      subject: 'philosophie',
      difficulty: 'medium',
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
    hard: [
      {
        id: 'philo-hegel-1',
        topic: 'Philosophie',
        subject: 'philosophie',
        difficulty: 'hard',
        prompt: 'Dans la dialectique hégélienne, quelle est la troisième étape ?',
        options: ['Antithèse', 'Synthèse', 'Cause', 'Substance'],
        correctIndex: 1,
      },
    ],
  },
  mathematiques: {
    easy: [
      {
        id: 'math-fraction-1',
        topic: 'Mathématiques',
        subject: 'mathematiques',
        difficulty: 'easy',
        prompt: 'Quel est le résultat de 1/2 + 1/2 ?',
        options: ['1', '2', '1/4', '0'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'math-derivee-1',
      topic: 'Mathématiques',
      subject: 'mathematiques',
      difficulty: 'medium',
      prompt: 'Que représente la dérivée d’une fonction en un point ?',
      options: ['La pente de la tangente', 'La surface sous la courbe', 'La valeur moyenne', 'Le maximum global'],
      correctIndex: 0,
    },
    ],
    hard: [
      {
        id: 'math-integrale-1',
        topic: 'Mathématiques',
        subject: 'mathematiques',
        difficulty: 'hard',
        prompt: 'Que représente une intégrale définie sur un intervalle ?',
        options: ['Une pente', 'Une limite', 'Une aire algébrique', 'Une dérivée seconde'],
        correctIndex: 2,
      },
    ],
  },
  anglais: {
    easy: [
      {
        id: 'en-vocab-1',
        topic: 'Anglais',
        subject: 'anglais',
        difficulty: 'easy',
        prompt: 'Quelle est la traduction de "book" ?',
        options: ['Livre', 'Stylo', 'Table', 'École'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'en-grammar-1',
      topic: 'Anglais',
      subject: 'anglais',
      difficulty: 'medium',
      prompt: "Quelle phrase est correcte ?",
      options: ['He don’t like it.', 'He doesn’t like it.', 'He doesn’t likes it.', 'He not like it.'],
      correctIndex: 1,
    },
    ],
    hard: [
      {
        id: 'en-tense-1',
        topic: 'Anglais',
        subject: 'anglais',
        difficulty: 'hard',
        prompt: 'Choisis la phrase au present perfect continue.',
        options: ['I have worked', 'I had worked', 'I have been working', 'I was working'],
        correctIndex: 2,
      },
    ],
  },
  management: {
    easy: [
      {
        id: 'mgmt-priority-1',
        topic: 'Management',
        subject: 'management',
        difficulty: 'easy',
        prompt: 'Quelle matrice aide à prioriser urgent vs important ?',
        options: ['Eisenhower', 'SWOT', 'RACI', 'PERT'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'mgmt-1',
      topic: 'Management',
      subject: 'management',
      difficulty: 'medium',
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
    hard: [
      {
        id: 'mgmt-kpi-1',
        topic: 'Management',
        subject: 'management',
        difficulty: 'hard',
        prompt: 'Quel indicateur mesure le taux de désabonnement client ?',
        options: ['NPS', 'Churn rate', 'CAC', 'LTV'],
        correctIndex: 1,
      },
    ],
  },
  leadership: {
    easy: [
      {
        id: 'lead-team-1',
        topic: 'Leadership',
        subject: 'leadership',
        difficulty: 'easy',
        prompt: 'Un bon leader commence par :',
        options: ['Écouter', 'Punir', 'Ignorer', 'Imposer'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'lead-1',
      topic: 'Leadership',
      subject: 'leadership',
      difficulty: 'medium',
      prompt: 'Quel comportement est le plus associé au leadership serviteur ?',
      options: ['Commander', 'Écouter et soutenir', 'Contrôler', 'Éviter les feedbacks'],
      correctIndex: 1,
    },
    ],
    hard: [
      {
        id: 'lead-style-1',
        topic: 'Leadership',
        subject: 'leadership',
        difficulty: 'hard',
        prompt: 'Quel style de leadership varie selon maturité de l’équipe ?',
        options: ['Autocratique', 'Situationnel', 'Laissez-faire', 'Transactionnel'],
        correctIndex: 1,
      },
    ],
  },
  'gestion de projet': {
    easy: [
      {
        id: 'pm-kanban-1',
        topic: 'Gestion de Projet',
        subject: 'gestion de projet',
        difficulty: 'easy',
        prompt: 'Quel outil visualise les tâches en colonnes ?',
        options: ['Kanban', 'Gantt', 'Mind map', 'WBS'],
        correctIndex: 0,
      },
    ],
    medium: [
    {
      id: 'pm-1',
      topic: 'Gestion de Projet',
      subject: 'gestion de projet',
      difficulty: 'medium',
      prompt: 'À quoi sert un backlog produit ?',
      options: ['À lister et prioriser les besoins/fonctionnalités', 'À écrire du code', 'À tester en production', 'À éviter les sprints'],
      correctIndex: 0,
    },
    ],
    hard: [
      {
        id: 'pm-critical-path-1',
        topic: 'Gestion de Projet',
        subject: 'gestion de projet',
        difficulty: 'hard',
        prompt: 'Le chemin critique correspond à :',
        options: ['La tâche la plus chère', 'La suite la plus longue sans marge', 'La première tâche', 'La dernière tâche'],
        correctIndex: 1,
      },
    ],
  },
};

