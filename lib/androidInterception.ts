import { NativeModules, Platform } from 'react-native';

type AndroidInterceptionBridge = {
  startMonitoring: (packages: string[]) => Promise<boolean>;
  stopMonitoring: () => Promise<boolean>;
  isAppBlocked: (packageName: string) => Promise<boolean>;
};

const bridge = NativeModules.ScrolfyInterceptionBridge as AndroidInterceptionBridge | undefined;

export function getMonitoredPackageNames() {
  return String(
    process.env.EXPO_PUBLIC_MONITORED_PACKAGES ??
      'com.instagram.android,com.google.android.youtube,com.zhiliaoapp.musically,com.snapchat.android,com.facebook.katana,com.android.chrome',
  )
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function startMonitoring() {
  if (Platform.OS !== 'android' || !bridge?.startMonitoring) return false;
  return bridge.startMonitoring(getMonitoredPackageNames());
}

export async function stopMonitoring() {
  if (Platform.OS !== 'android' || !bridge?.stopMonitoring) return false;
  return bridge.stopMonitoring();
}

export async function isAppBlocked(packageName: string) {
  if (Platform.OS !== 'android' || !bridge?.isAppBlocked) return false;
  return bridge.isAppBlocked(packageName);
}
