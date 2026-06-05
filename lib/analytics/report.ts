import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { AppState, Platform } from "react-native";

const ANALYTICS_ENDPOINT = "https://ultraserverpro.10m.com.cn/base-service/api/v1/analyze/report/batch";
const USER_ID_KEY = "@neckcare_analytics_user_id";
const DEVICE_ID_KEY = "@neckcare_analytics_device_id";
const APP_NAME = "天天肩颈";
const CHANNEL = "AppStore";

type AnalyticsEvent = {
  event: "app_launch";
  eventTime: string;
  extra: string | null;
};

type LaunchType = "cold" | "hot";

function makeLocalId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getStoredId(key: string, prefix: string) {
  const saved = await AsyncStorage.getItem(key);
  if (saved) return saved;

  const next = makeLocalId(prefix);
  await AsyncStorage.setItem(key, next);
  return next;
}

async function getDeviceId() {
  const saved = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (saved) return saved;

  let nativeId: string | null = null;
  try {
    if (Platform.OS === "ios") nativeId = await Application.getIosIdForVendorAsync();
    if (Platform.OS === "android") nativeId = Application.getAndroidId();
  } catch {}

  const next = nativeId || makeLocalId("device");
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function formatEventTime(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + " " + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(":");
}

function getOsName() {
  if (Platform.OS === "ios") return "iOS";
  if (Platform.OS === "android") return "Android";
  return Platform.OS;
}

function getDeviceModel() {
  const platformConstants = Platform.constants as Record<string, unknown>;
  return Constants.deviceName || String(platformConstants.Model || platformConstants.systemName || "");
}

function getLanguage() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return undefined;
  }
}

async function reportEvents(events: AnalyticsEvent[]) {
  if (events.length === 0 || Platform.OS === "web") return;

  const [userId, deviceId] = await Promise.all([
    getStoredId(USER_ID_KEY, "user"),
    getDeviceId(),
  ]);

  await fetch(ANALYTICS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      userId,
      deviceId,
      appName: APP_NAME,
      appVersion: Application.nativeApplicationVersion || Constants.expoConfig?.version,
      os: getOsName(),
      osVersion: String(Platform.Version),
      language: getLanguage(),
      deviceMode: getDeviceModel(),
      channel: CHANNEL,
      events,
    }),
  });
}

export async function reportAppLaunch(launchType: LaunchType) {
  try {
    await reportEvents([
      {
        event: "app_launch",
        eventTime: formatEventTime(),
        extra: JSON.stringify({
          launchType,
          appState: AppState.currentState,
        }),
      },
    ]);
  } catch (error) {
    if (__DEV__) console.warn("[analytics] app_launch report failed", error);
  }
}
