export type Situation = 'student' | 'pro';

export type AppProfile = {
  completedOnboarding: boolean;
  situation: Situation;
  purpose?: 'reduce_distractions' | 'study_better' | 'increase_productivity' | 'control_screen_time';
  level?: string;
  subject?: string;
  proTopics?: string[];
  customGoal?: string;
};

export type Limits = {
  sessionMaxMinutes: number; // 0 => disabled
  dailyMaxMinutes: number; // 0 => disabled
  remindAfterMinutes: number; // 0 => disabled
};

export type WatchedApp = {
  id: string;
  name: string;
  category: string;
  premium?: boolean;
  scheme?: string; // custom deeplink scheme to validate
};

export type ShieldConfig = {
  enabled: boolean;
  watchedAppIds: string[]; // enabled toggles
  apps: WatchedApp[]; // catalog + custom entries
  limits: Limits;
  sessionStartedAt?: number; // epoch ms
  todayScrollMinutes: number;
  lastScrollDayKey?: string; // YYYY-MM-DD
  permissions?: {
    notificationsRequested?: boolean;
    /** True after OS grants notification permission */
    notificationsGranted?: boolean;
    /** Android: user confirmed accessibility service is ON */
    accessibilityAcknowledged?: boolean;
    /** Android: user confirmed draw-over / appear on top is configured */
    overlayAcknowledged?: boolean;
    accessibilityGuided?: boolean;
  };
  premium?: {
    strictMode: boolean;
    scheduleBlocking: {
      enabled: boolean;
      startHour: number;
      endHour: number;
      ranges: Array<{ startHour: number; endHour: number }>;
    };
    unlockDelaySeconds: number;
    unlockDelayEnabled: boolean;
    behaviorPenaltyEnabled: boolean;
    behaviorPenaltyFullBlock: boolean;
    behaviorPenaltyScore: number;
    analyticsEnabled: boolean;
  };
};

export type Stats = {
  savedMinutes: number;
  streakDays: number;
  lastQuizDayKey?: string; // YYYY-MM-DD
  lastActiveDayKey?: string; // YYYY-MM-DD
  lastMastery?: { title: string; scorePct: number; at: number };
  answered: number;
  correct: number;
  xp: number;
  level: number;
  askedQuestionIds?: string[];
};

export type Subscription = {
  isPremium: boolean;
};

