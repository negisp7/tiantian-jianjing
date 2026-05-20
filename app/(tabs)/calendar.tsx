import React, { useState, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, FlatList, StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { WorkoutStore } from "@/lib/store/workout-store";
import { WorkoutRecord } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";

const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_NAMES = ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
const DIFFICULTY_LABEL: Record<string, string> = { light: "轻度", moderate: "中度", intense: "重度" };
const DIFFICULTY_COLOR: Record<string, string> = { light: "#34C759", moderate: "#FF9500", intense: "#FF3B30" };

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const colors = useColors();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());
  const [selectedRecords, setSelectedRecords] = useState<WorkoutRecord[]>([]);
  const [monthStats, setMonthStats] = useState({ days: 0, totalSeconds: 0, totalReps: 0 });

  const loadMonth = useCallback(async () => {
    const [dates, records] = await Promise.all([
      WorkoutStore.getDatesWithWorkouts(),
      WorkoutStore.getByMonth(viewYear, viewMonth + 1),
    ]);
    setWorkoutDates(dates);
    const days = new Set(records.map((r) => r.startTime.slice(0, 10))).size;
    const totalSeconds = records.reduce((s, r) => s + r.durationSeconds, 0);
    const totalReps = records.reduce((s, r) => s + (r.completedExercises ?? 0), 0);
    setMonthStats({ days, totalSeconds, totalReps });
  }, [viewYear, viewMonth]);

  const loadSelected = useCallback(async () => {
    const records = await WorkoutStore.getByDate(selectedDate);
    setSelectedRecords(records);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadMonth();
      loadSelected();
    }, [loadMonth, loadSelected]),
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>锻炼日历</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>追踪你的颈椎健康之旅</Text>
        </View>

        {/* ── Month Stats ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={[styles.statsRow, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "25" }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{monthStats.days}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>本月锻炼天</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.primary + "30" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {Math.round(monthStats.totalSeconds / 60)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>本月总分钟</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.primary + "30" }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{monthStats.totalReps}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>颈部运动次</Text>
            </View>
          </View>
        </View>

        {/* ── Calendar ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={handlePrevMonth}
              style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.6 }]}
            >
              <IconSymbol name="chevron.left" size={18} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.monthTitle, { color: colors.foreground }]}>
              {viewYear}年 {MONTH_NAMES[viewMonth]}
            </Text>
            <Pressable
              onPress={handleNextMonth}
              style={({ pressed }) => [styles.navBtn, { backgroundColor: colors.surface }, pressed && { opacity: 0.6 }]}
            >
              <IconSymbol name="chevron.right" size={18} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Week Labels */}
          <View style={styles.weekRow}>
            {WEEK_LABELS.map((d) => (
              <Text key={d} style={[styles.weekLabel, { color: colors.muted }]}>{d}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={[styles.calGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <View key={row} style={styles.calRow}>
                {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                  if (!day) return <View key={col} style={styles.calCell} />;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const hasWorkout = workoutDates.has(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;
                  return (
                    <Pressable
                      key={col}
                      onPress={() => setSelectedDate(dateStr)}
                      style={[
                        styles.calCell,
                        isSelected && { backgroundColor: colors.primary },
                        isToday && !isSelected && { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 12 },
                      ]}
                    >
                      <Text style={[
                        styles.calDayText,
                        { color: isSelected ? "#fff" : isToday ? colors.primary : colors.foreground },
                      ]}>
                        {day}
                      </Text>
                      {hasWorkout && (
                        <View style={[
                          styles.dot,
                          { backgroundColor: isSelected ? "#fff" : colors.success },
                        ]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* ── Selected Day Records ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {selectedDate === todayStr ? "今日锻炼" : `${selectedDate.slice(5).replace("-", "月")}日`}
          </Text>
          {selectedRecords.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIcon}>🏃</Text>
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {selectedDate === todayStr ? "今天还没有锻炼记录，快去开始吧！" : "这天没有锻炼记录"}
              </Text>
            </View>
          ) : (
            selectedRecords.map((record) => {
              const start = new Date(record.startTime);
              const timeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
              const diffColor = DIFFICULTY_COLOR[record.difficulty];
              return (
                <View
                  key={record.id}
                  style={[styles.recordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.recordTop}>
                    <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
                      <Text style={[styles.diffText, { color: diffColor }]}>
                        {DIFFICULTY_LABEL[record.difficulty]}
                      </Text>
                    </View>
                    <Text style={[styles.recordTime, { color: colors.muted }]}>{timeStr}</Text>
                  </View>
                  <Text style={[styles.recordTitle, { color: colors.foreground }]}>{record.courseTitle}</Text>
                  {/* 颈部运动次数 — 突出展示 */}
                  <View style={[styles.repsRow, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
                    <Text style={styles.repsIcon}>🔁</Text>
                    <Text style={[styles.repsLabel, { color: colors.muted }]}>颈部运动次数</Text>
                    <Text style={[styles.repsVal, { color: colors.primary }]}>
                      {record.completedExercises} 次
                    </Text>
                    <Text style={[styles.repsTotal, { color: colors.muted }]}>
                      / 共 {record.totalExercises} 个动作
                    </Text>
                  </View>
                  <View style={styles.recordMeta}>
                    <Text style={[styles.recordMetaText, { color: colors.muted }]}>
                      ⏱ {Math.floor(record.durationSeconds / 60)}:{String(record.durationSeconds % 60).padStart(2, "0")} 真实时长
                    </Text>
                    {record.usedAirPods && (
                      <Text style={[styles.recordMetaText, { color: colors.muted }]}>🎧 AirPods</Text>
                    )}
                    {record.motionData && (
                      <Text style={[styles.recordMetaText, { color: colors.muted }]}>
                        📡 最大活动角 {record.motionData.maxAngle}°
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerSub: { fontSize: 13, marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 40, alignSelf: "center" },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  monthTitle: { fontSize: 17, fontWeight: "700" },
  weekRow: { flexDirection: "row", marginBottom: 4 },
  weekLabel: { flex: 1, textAlign: "center", fontSize: 12, fontWeight: "500", paddingVertical: 4 },
  calGrid: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    padding: 4,
  },
  calRow: { flexDirection: "row" },
  calCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    margin: 1,
  },
  calDayText: { fontSize: 14, fontWeight: "500" },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  emptyCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: { fontSize: 14, textAlign: "center" },
  recordCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  recordTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffText: { fontSize: 11, fontWeight: "700" },
  recordTime: { fontSize: 12 },
  recordTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  recordMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  recordMetaText: { fontSize: 12 },
  repsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  repsIcon: { fontSize: 14 },
  repsLabel: { fontSize: 12, flex: 1 },
  repsVal: { fontSize: 16, fontWeight: "800" },
  repsTotal: { fontSize: 12 },
});
