import NetInfo from '@react-native-community/netinfo';
import type { AppProfile } from './appModel';
import { QUESTION_BANK, type QuizQuestion } from '../data/questionBank';

function normalizeKey(s: string) {
  return s.trim().toLowerCase();
}

export async function isOnline() {
  const state = await NetInfo.fetch();
  const connected = Boolean(state.isConnected);
  if (!connected) return false;
  if (state.isInternetReachable === false) return false;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2500);
    const res = await fetch('https://clients3.google.com/generate_204', {
      method: 'GET',
      signal: ac.signal,
    });
    clearTimeout(t);
    return res.ok || res.status === 204;
  } catch {
    return connected;
  }
}

export function pickOfflineQuestion(profile: AppProfile, askedIds: string[] = [], seed = Date.now()): QuizQuestion {
  const topicKey = (() => {
    if (profile.situation === 'student') return normalizeKey(profile.subject ?? 'Philosophie');
    const topics = profile.proTopics ?? [];
    if (topics.length) return normalizeKey(topics[seed % topics.length]);
    return 'management';
  })();

  const pool =
    QUESTION_BANK[topicKey] ??
    QUESTION_BANK[normalizeKey('management')] ??
    Object.values(QUESTION_BANK).flat();

  const asked = new Set(askedIds);
  const unseen = pool.filter((q) => !asked.has(q.id));
  if (unseen.length) return unseen[Math.abs(seed) % unseen.length];
  // Tout le pool a déjà été posé : on évite les répétitions en ajoutant un suffixe d’instance
  const base = pool[Math.abs(seed) % pool.length];
  const suffix =
    typeof globalThis !== 'undefined' && (globalThis as any).crypto?.randomUUID
      ? (globalThis as any).crypto.randomUUID()
      : String(Date.now());
  return { ...base, id: `${base.id}::${suffix}` };
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

async function fetchExternalQuiz(profile: AppProfile, askedIds: string[]): Promise<QuizQuestion | null> {
  const url = (process.env.EXPO_PUBLIC_QUIZ_API_URL ?? '').trim();
  if (!url) return null;
  const apiKey = (process.env.EXPO_PUBLIC_QUIZ_API_KEY ?? '').trim();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ profile, askedIds: askedIds.slice(-50) }),
    });
    if (!res.ok) return null;
    const parsed = (await res.json()) as Partial<QuizQuestion>;
    if (!parsed?.prompt || !Array.isArray(parsed.options) || parsed.options.length !== 4) return null;
    const id = typeof parsed.id === 'string' && parsed.id ? parsed.id : `api:${Date.now()}`;
    return {
      id,
      topic: String(parsed.topic ?? 'API'),
      prompt: String(parsed.prompt),
      options: parsed.options.map(String),
      correctIndex: Math.max(0, Math.min(3, Number(parsed.correctIndex ?? 0))),
      explanation: parsed.explanation ? String(parsed.explanation) : undefined,
    };
  } catch {
    return null;
  }
}

export async function generateQuestion(
  profile: AppProfile,
  askedIds: string[] = [],
): Promise<{ question: QuizQuestion; source: 'offline' | 'ai' }> {
  const online = await isOnline();

  if (online) {
    const external = await fetchExternalQuiz(profile, askedIds);
    if (external) return { question: external, source: 'ai' };
  }

  const key = (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '').trim();
  if (!online || !key) {
    return { question: pickOfflineQuestion(profile, askedIds), source: 'offline' };
  }

  // Minimal Gemini call (optional). If it fails, fallback offline.
  try {
    const topic =
      profile.situation === 'student'
        ? profile.subject ?? 'Philosophie'
        : (profile.proTopics?.[0] ?? 'Management');

    const avoid = askedIds.length ? `Évite de répéter ces IDs ou thèmes déjà posés: ${askedIds.slice(-12).join(', ')}.` : '';
    const prompt = `Génère 1 QCM court (4 choix) en français sur le sujet: ${topic}.
${avoid}
Réponds en JSON strict: {"id": "ai_unique_slug", "prompt": "...", "options": ["...","...","...","..."], "correctIndex": 0, "explanation": "..."}.
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        key,
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 256 },
        }),
      },
    );

    if (!res.ok) throw new Error('gemini_http');
    const data = (await res.json()) as any;
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('gemini_empty');

    const jsonText = extractJsonObject(text);
    if (!jsonText) throw new Error('gemini_no_json');

    const parsed = JSON.parse(jsonText) as {
      id?: string;
      prompt: string;
      options: string[];
      correctIndex: number;
      explanation?: string;
    };
    if (!parsed?.prompt || !Array.isArray(parsed.options) || parsed.options.length !== 4) throw new Error('gemini_bad_json');
    const qid = parsed.id && !askedIds.includes(parsed.id) ? parsed.id : `ai:${Date.now()}`;

    return {
      source: 'ai',
      question: {
        id: qid,
        topic: 'AI',
        prompt: parsed.prompt,
        options: parsed.options,
        correctIndex: Math.max(0, Math.min(3, parsed.correctIndex ?? 0)),
        explanation: parsed.explanation,
      },
    };
  } catch {
    return { question: pickOfflineQuestion(profile, askedIds), source: 'offline' };
  }
}

