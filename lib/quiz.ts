import type { AppProfile } from './appModel';
import { QUESTION_BANK, type QuizQuestion } from '../data/questionBank';
import { QUESTION_BANK_EN } from '../data/questionBank.en';
import i18n from '../i18n/i18n';

function normalizeKey(s: string) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getDifficultyFromScore(correct: number, answered: number): 'easy' | 'medium' | 'hard' {
  if (!answered) return 'easy';
  const score = (correct / answered) * 100;
  if (score < 40) return 'easy';
  if (score <= 80) return 'medium';
  return 'hard';
}

function getSubjectKey(profile: AppProfile, seed = Date.now()) {
  return (() => {
    if (profile.subject) return normalizeKey(profile.subject);
    const topics = profile.proTopics ?? [];
    if (topics.length) return normalizeKey(topics[seed % topics.length]);
    return 'philosophie';
  })();
}

function randomPick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickOfflineQuestion(
  profile: AppProfile,
  askedIds: string[] = [],
  perf?: { correct: number; answered: number },
  seed = Date.now(),
): QuizQuestion {
  const bank = i18n.language?.startsWith('fr') ? QUESTION_BANK : QUESTION_BANK_EN;
  const asked = new Set(askedIds);
  const difficulty = getDifficultyFromScore(perf?.correct ?? 0, perf?.answered ?? 0);
  const subjectKey = getSubjectKey(profile, seed);
  const subjectPool = bank[subjectKey];
  const desired = subjectPool?.[difficulty] ?? [];
  const unseenDesired = desired.filter((q) => !asked.has(q.id));
  if (unseenDesired.length) return randomPick(unseenDesired);

  const subjectFallback = subjectPool
    ? [...subjectPool.easy, ...subjectPool.medium, ...subjectPool.hard].filter((q) => !asked.has(q.id))
    : [];
  if (subjectFallback.length) return randomPick(subjectFallback);

  const globalFallback = Object.values(bank)
    .flatMap((pool) => [...pool.easy, ...pool.medium, ...pool.hard])
    .filter((q) => !asked.has(q.id));
  if (globalFallback.length) return randomPick(globalFallback);

  throw new Error('No unseen questions available');
}

export async function generateQuestion(
  profile: AppProfile,
  askedIds: string[] = [],
  perf?: { correct: number; answered: number },
): Promise<{ question: QuizQuestion; source: 'offline' }> {
  return { question: pickOfflineQuestion(profile, askedIds, perf), source: 'offline' };
}

export function getMotivationalMicroText(correct: boolean) {
  const success = [
    'Excellent choice. Your attention is becoming your advantage.',
    'Great work. You are training your brain to stay focused.',
    'Keep going. Your discipline is paying off.',
  ];
  const retry = [
    'This is one step. Reset and move forward.',
    'Your focus gets stronger one question at a time.',
    'Breathe, retry, improve.',
  ];
  return randomPick(correct ? success : retry);
}

export function getScrollLimitMotivation() {
  return 'You reached your scroll limit. Refocus and invest this time into your goals.';
}

export function getDifficultyLabel(correct: number, answered: number) {
  return getDifficultyFromScore(correct, answered);
}

function extractJsonObject(_text: string) {
  return null;
}

async function fetchExternalQuiz(_profile: AppProfile, _askedIds: string[]): Promise<QuizQuestion | null> {
  return null;
}

/* legacy exports removed */
