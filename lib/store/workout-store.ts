import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutRecord } from '../types';

const STORAGE_KEY = '@neckcare_workouts';

export const WorkoutStore = {
  async getAll(): Promise<WorkoutRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async save(record: WorkoutRecord): Promise<void> {
    const all = await this.getAll();
    all.unshift(record);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  },

  async getByDate(dateStr: string): Promise<WorkoutRecord[]> {
    const all = await this.getAll();
    return all.filter((r) => r.startTime.startsWith(dateStr));
  },

  async getByMonth(year: number, month: number): Promise<WorkoutRecord[]> {
    const all = await this.getAll();
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return all.filter((r) => r.startTime.startsWith(prefix));
  },

  async getDatesWithWorkouts(): Promise<Set<string>> {
    const all = await this.getAll();
    return new Set(all.map((r) => r.startTime.slice(0, 10)));
  },

  async getTotalStats(): Promise<{ totalDays: number; totalSeconds: number; totalSessions: number }> {
    const all = await this.getAll();
    const dates = new Set(all.map((r) => r.startTime.slice(0, 10)));
    const totalSeconds = all.reduce((sum, r) => sum + r.durationSeconds, 0);
    return { totalDays: dates.size, totalSeconds, totalSessions: all.length };
  },

  async getThisWeekSeconds(): Promise<number[]> {
    const all = await this.getAll();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const weekData = Array(7).fill(0);
    for (const r of all) {
      const d = new Date(r.startTime);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) {
        const idx = (dayOfWeek - diff + 7) % 7;
        weekData[idx] += r.durationSeconds;
      }
    }
    return weekData;
  },
};
