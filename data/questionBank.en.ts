import type { QuizQuestion } from './questionBank';

export const QUESTION_BANK_EN: Record<string, Record<'easy' | 'medium' | 'hard', QuizQuestion[]>> = {
  philosophie: {
    easy: [
      {
        id: 'en-philo-plato-1',
        topic: 'Philosophy',
        subject: 'philosophie',
        difficulty: 'easy',
        prompt: 'Which philosopher wrote "The Republic"?',
        options: ['Plato', 'Descartes', 'Kant', 'Nietzsche'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-philo-kant-1',
        topic: 'Philosophy',
        subject: 'philosophie',
        difficulty: 'medium',
        prompt: 'According to Kant, what is the categorical imperative?',
        options: [
          'A universal moral rule to follow regardless of consequences',
          'A strategy to maximize personal happiness',
          'A social norm that changes by culture',
          'A practical tip to reach goals',
        ],
        correctIndex: 0,
      },
    ],
    hard: [
      {
        id: 'en-philo-hegel-1',
        topic: 'Philosophy',
        subject: 'philosophie',
        difficulty: 'hard',
        prompt: 'In Hegelian dialectics, what is the third step?',
        options: ['Antithesis', 'Synthesis', 'Cause', 'Substance'],
        correctIndex: 1,
      },
    ],
  },
  mathematiques: {
    easy: [
      {
        id: 'en-math-fraction-1',
        topic: 'Mathematics',
        subject: 'mathematiques',
        difficulty: 'easy',
        prompt: 'What is 1/2 + 1/2?',
        options: ['1', '2', '1/4', '0'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-math-derivative-1',
        topic: 'Mathematics',
        subject: 'mathematiques',
        difficulty: 'medium',
        prompt: 'What does the derivative of a function at a point represent?',
        options: ['Slope of the tangent', 'Area under the curve', 'Average value', 'Global maximum'],
        correctIndex: 0,
      },
    ],
    hard: [
      {
        id: 'en-math-integral-1',
        topic: 'Mathematics',
        subject: 'mathematiques',
        difficulty: 'hard',
        prompt: 'A definite integral over an interval represents:',
        options: ['A slope', 'A limit', 'An algebraic area', 'A second derivative'],
        correctIndex: 2,
      },
    ],
  },
  anglais: {
    easy: [
      {
        id: 'en-english-vocab-1',
        topic: 'English',
        subject: 'anglais',
        difficulty: 'easy',
        prompt: 'What is the translation of "book" in French?',
        options: ['Livre', 'Stylo', 'Table', 'Ecole'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-english-grammar-1',
        topic: 'English',
        subject: 'anglais',
        difficulty: 'medium',
        prompt: 'Which sentence is correct?',
        options: ['He don’t like it.', 'He doesn’t like it.', 'He doesn’t likes it.', 'He not like it.'],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        id: 'en-english-tense-1',
        topic: 'English',
        subject: 'anglais',
        difficulty: 'hard',
        prompt: 'Choose the present perfect continuous sentence.',
        options: ['I have worked', 'I had worked', 'I have been working', 'I was working'],
        correctIndex: 2,
      },
    ],
  },
  management: {
    easy: [
      {
        id: 'en-mgmt-priority-1',
        topic: 'Management',
        subject: 'management',
        difficulty: 'easy',
        prompt: 'Which matrix helps prioritize urgent vs important?',
        options: ['Eisenhower', 'SWOT', 'RACI', 'PERT'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-mgmt-pomodoro-1',
        topic: 'Management',
        subject: 'management',
        difficulty: 'medium',
        prompt: 'What is the core principle of the Pomodoro method?',
        options: ['Work 4 hours nonstop', 'Alternate focused work and short breaks', 'Listen to music always', 'Review only before sleep'],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        id: 'en-mgmt-kpi-1',
        topic: 'Management',
        subject: 'management',
        difficulty: 'hard',
        prompt: 'Which KPI measures customer drop-off?',
        options: ['NPS', 'Churn rate', 'CAC', 'LTV'],
        correctIndex: 1,
      },
    ],
  },
  leadership: {
    easy: [
      {
        id: 'en-lead-listen-1',
        topic: 'Leadership',
        subject: 'leadership',
        difficulty: 'easy',
        prompt: 'A good leader starts by:',
        options: ['Listening', 'Punishing', 'Ignoring', 'Imposing'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-lead-servant-1',
        topic: 'Leadership',
        subject: 'leadership',
        difficulty: 'medium',
        prompt: 'Which behavior best matches servant leadership?',
        options: ['Commanding', 'Listening and supporting', 'Controlling', 'Avoiding feedback'],
        correctIndex: 1,
      },
    ],
    hard: [
      {
        id: 'en-lead-style-1',
        topic: 'Leadership',
        subject: 'leadership',
        difficulty: 'hard',
        prompt: 'Which leadership style changes based on team maturity?',
        options: ['Autocratic', 'Situational', 'Laissez-faire', 'Transactional'],
        correctIndex: 1,
      },
    ],
  },
  'gestion de projet': {
    easy: [
      {
        id: 'en-pm-kanban-1',
        topic: 'Project Management',
        subject: 'gestion de projet',
        difficulty: 'easy',
        prompt: 'Which tool displays tasks in columns?',
        options: ['Kanban', 'Gantt', 'Mind map', 'WBS'],
        correctIndex: 0,
      },
    ],
    medium: [
      {
        id: 'en-pm-backlog-1',
        topic: 'Project Management',
        subject: 'gestion de projet',
        difficulty: 'medium',
        prompt: 'What is a product backlog used for?',
        options: ['List and prioritize needs/features', 'Write code', 'Test in production', 'Avoid sprints'],
        correctIndex: 0,
      },
    ],
    hard: [
      {
        id: 'en-pm-critical-path-1',
        topic: 'Project Management',
        subject: 'gestion de projet',
        difficulty: 'hard',
        prompt: 'The critical path is:',
        options: ['Most expensive task', 'Longest sequence with zero slack', 'First task', 'Last task'],
        correctIndex: 1,
      },
    ],
  },
};
