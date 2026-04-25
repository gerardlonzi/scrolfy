import type { AppProfile, ShieldConfig, Stats, Subscription, WatchedApp } from './appModel';

export const DEFAULT_PROFILE: AppProfile = {
  completedOnboarding: false,
  situation: 'student',
  level: 'Doctorat',
  subject: 'Philosophie',
  proTopics: [],
  customGoal: '',
};

export const DEFAULT_SUBSCRIPTION: Subscription = {
  isPremium: false,
};

export const DEFAULT_APPS: WatchedApp[] = [
  { id: 'instagram', name: 'Instagram', category: 'Réseau Social', scheme: 'instagram://' },
  { id: 'facebook', name: 'Facebook', category: 'Réseau Social', scheme: 'fb://' },
  { id: 'telegram', name: 'Telegram', category: 'Messagerie', scheme: 'tg://' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'Messagerie', scheme: 'whatsapp://' },
  { id: 'snapchat', name: 'Snapchat', category: 'Réseau Social', scheme: 'snapchat://' },
  { id: 'x', name: 'X (Twitter)', category: 'Actualités', scheme: 'twitter://' },
  { id: 'reddit', name: 'Reddit', category: 'Communautés', scheme: 'reddit://' },
  { id: 'youtube', name: 'YouTube', category: 'Divertissement', scheme: 'youtube://' },
  { id: 'tiktok', name: 'TikTok', category: 'Vidéo', premium: true, scheme: 'tiktok://' },
];

export const DEFAULT_SHIELD: ShieldConfig = {
  enabled: false,
  watchedAppIds: [],
  apps: DEFAULT_APPS,
  limits: {
    sessionMaxMinutes: 60,
    dailyMaxMinutes: 120,
    remindAfterMinutes: 120,
  },
  todayScrollMinutes: 0,
  permissions: {
    notificationsRequested: false,
    notificationsGranted: false,
    accessibilityAcknowledged: false,
    overlayAcknowledged: false,
    accessibilityGuided: false,
  },
};

export const DEFAULT_STATS: Stats = {
  savedMinutes: 0,
  streakDays: 0,
  answered: 0,
  correct: 0,
  askedQuestionIds: [],
};

export function dayKey(ts = Date.now()) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

