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

  /** 获取累计颈部运动次数 */
  async getTotalReps(): Promise<number> {
    const all = await this.getAll();
    return all.reduce((sum, r) => sum + r.completedExercises, 0);
  },

  /** 获取历史最大活动角度 */
  async getMaxAngle(): Promise<number> {
    const all = await this.getAll();
    return all.reduce((max, r) => Math.max(max, r.motionData?.maxAngle ?? 0), 0);
  },

  /** 获取当前连续锻炼天数和历史最长连续天数 */
  async getStreakInfo(): Promise<{ streakDays: number; maxStreak: number }> {
    const all = await this.getAll();
    if (all.length === 0) return { streakDays: 0, maxStreak: 0 };
    const dates = Array.from(new Set(all.map((r) => r.startTime.slice(0, 10)))).sort().reverse();
    // 当前连续天数
    let streakDays = 0;
    const today = new Date();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff === i) streakDays++;
      else break;
    }
    // 历史最长连续天数
    let maxStreak = 0;
    let cur = 1;
    const sorted = [...dates].sort();
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      const gap = Math.floor((curr.getTime() - prev.getTime()) / 86400000);
      if (gap === 1) { cur++; maxStreak = Math.max(maxStreak, cur); }
      else cur = 1;
    }
    maxStreak = Math.max(maxStreak, cur, streakDays);
    return { streakDays, maxStreak };
  },

  /** 按时段统计锻炼次数 */
  async getTimeSlotCounts(): Promise<{ morningCount: number; nightCount: number }> {
    const all = await this.getAll();
    let morningCount = 0, nightCount = 0;
    for (const r of all) {
      const h = new Date(r.startTime).getHours();
      if (h >= 6 && h < 10) morningCount++;
      if (h >= 21) nightCount++;
    }
    return { morningCount, nightCount };
  },

  /** 按难度统计完成次数 */
  async getDifficultyCounts(): Promise<{ lightCount: number; moderateCount: number; intenseCount: number }> {
    const all = await this.getAll();
    let lightCount = 0, moderateCount = 0, intenseCount = 0;
    for (const r of all) {
      if (r.difficulty === 'light') lightCount++;
      else if (r.difficulty === 'moderate') moderateCount++;
      else if (r.difficulty === 'intense') intenseCount++;
    }
    return { lightCount, moderateCount, intenseCount };
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
