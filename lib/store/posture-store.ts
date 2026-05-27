import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@neckcare_posture_daily";
const CALIBRATION_KEY = "@neckcare_posture_calibration";

export type PostureDailyRecord = {
  date: string;
  monitorSeconds: number;
  lowHeadSeconds: number;
  alertCount: number;
};

export type PostureCalibration = {
  baselinePitch: number;
  calibratedAt: string;
};

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getMap(): Promise<Record<string, PostureDailyRecord>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export const PostureStore = {
  async getToday(): Promise<PostureDailyRecord> {
    const date = todayKey();
    const map = await getMap();
    return map[date] ?? { date, monitorSeconds: 0, lowHeadSeconds: 0, alertCount: 0 };
  },

  async addToday(delta: Partial<Omit<PostureDailyRecord, "date">>) {
    const date = todayKey();
    const map = await getMap();
    const current = map[date] ?? { date, monitorSeconds: 0, lowHeadSeconds: 0, alertCount: 0 };
    const next: PostureDailyRecord = {
      date,
      monitorSeconds: current.monitorSeconds + (delta.monitorSeconds ?? 0),
      lowHeadSeconds: current.lowHeadSeconds + (delta.lowHeadSeconds ?? 0),
      alertCount: current.alertCount + (delta.alertCount ?? 0),
    };
    map[date] = next;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    return next;
  },

  async getByDate(date: string): Promise<PostureDailyRecord | null> {
    const map = await getMap();
    return map[date] ?? null;
  },

  async getByMonth(year: number, month: number): Promise<PostureDailyRecord[]> {
    const map = await getMap();
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return Object.values(map).filter((record) => record.date.startsWith(prefix));
  },

  async getDatesWithPosture(): Promise<Set<string>> {
    const map = await getMap();
    return new Set(
      Object.values(map)
        .filter((record) => record.monitorSeconds > 0 || record.lowHeadSeconds > 0)
        .map((record) => record.date),
    );
  },

  async getCalibration(): Promise<PostureCalibration | null> {
    try {
      const raw = await AsyncStorage.getItem(CALIBRATION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async saveCalibration(baselinePitch: number): Promise<PostureCalibration> {
    const calibration = {
      baselinePitch,
      calibratedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibration));
    return calibration;
  },
};
