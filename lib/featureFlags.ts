function envYes(name: string, fallback = false) {
  const raw = String(process.env[name] ?? '').trim().toLowerCase();
  if (!raw) return fallback;
  return raw === 'yes' || raw === 'true' || raw === '1';
}

export function premiumFeatureFlags() {
  return {
    scheduleBlocking: envYes('EXPO_PUBLIC_PREMIUM_SCHEDULE_BLOCKING', true),
    unlockDelay: envYes('EXPO_PUBLIC_PREMIUM_UNLOCK_DELAY', true),
    behaviorPenalty: envYes('EXPO_PUBLIC_PREMIUM_BEHAVIOR_PENALTY', true),
    strictMode: envYes('EXPO_PUBLIC_PREMIUM_STRICT_MODE', true),
  };
}

