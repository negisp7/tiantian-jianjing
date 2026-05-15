import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView, Text, View, Pressable, FlatList,
  StyleSheet, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { DAILY_TIPS, getTodayTip } from "@/lib/data/tips";
import { COURSES } from "@/lib/data/courses";
import { WorkoutStore } from "@/lib/store/workout-store";
import { DailyTip } from "@/lib/types";

const { width: SCREEN_W } = Dimensions.get("window");
const DIFFICULTY_LABEL: Record<string, string> = { light: "轻度", moderate: "中度", intense: "重度" };
const DIFFICULTY_COLOR: Record<string, string> = { light: "#34C759", moderate: "#FF9500", intense: "#FF3B30" };
const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [todayTip, setTodayTip] = useState<DailyTip>(getTodayTip());
  const [tipIndex, setTipIndex] = useState(todayTip.id);
  const [weekData, setWeekData] = useState<number[]>(Array(7).fill(0));
  const [totalStats, setTotalStats] = useState({ totalDays: 0, totalSeconds: 0, totalSessions: 0 });

  const today = new Date();
  const greeting = today.getHours() < 12 ? "早上好" : today.getHours() < 18 ? "下午好" : "晚上好";
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekDayStr = `星期${"日一二三四五六"[today.getDay()]}`;

  const loadStats = useCallback(async () => {
    const [week, stats] = await Promise.all([
      WorkoutStore.getThisWeekSeconds(),
      WorkoutStore.getTotalStats(),
    ]);
    setWeekData(week);
    setTotalStats(stats);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleTipNext = () => {
    const next = (tipIndex + 1) % DAILY_TIPS.length;
    setTipIndex(next);
    setTodayTip(DAILY_TIPS[next]);
  };

  const handleStartCourse = (courseId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/course/${courseId}`);
  };

  const maxWeek = Math.max(...weekData, 1);
  const todayCourses = COURSES.slice(0, 2);

  return (
    <ScreenContainer containerClassName="bg-primary">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.greetingText}>{greeting} 👋</Text>
            <Text style={styles.dateText}>{dateStr} · {weekDayStr}</Text>
          </View>
          <View style={styles.headerStats}>
            <Text style={styles.headerStatNum}>{totalStats.totalDays}</Text>
            <Text style={styles.headerStatLabel}>坚持天数</Text>
          </View>
        </View>

        {/* ── Daily Tip Card ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>每日健康贴士</Text>
          <Pressable
            onPress={handleTipNext}
            style={({ pressed }) => [
              styles.tipCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
          >
            <View style={styles.tipHeader}>
              <Text style={styles.tipIcon}>{todayTip.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, { color: colors.foreground }]}>{todayTip.title}</Text>
                <Text style={[styles.tipCategory, { color: colors.primary }]}>
                  {todayTip.category === "posture" ? "姿势" :
                   todayTip.category === "exercise" ? "锻炼" :
                   todayTip.category === "lifestyle" ? "生活方式" : "科学知识"}
                </Text>
              </View>
              <Text style={[styles.tipSwipe, { color: colors.muted }]}>点击换一条 →</Text>
            </View>
            <Text style={[styles.tipContent, { color: colors.muted }]}>{todayTip.content}</Text>
          </Pressable>
        </View>

        {/* ── This Week ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>本周锻炼</Text>
          <View style={[styles.weekCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.weekBars}>
              {weekData.map((sec, i) => {
                const isToday = i === today.getDay();
                const barH = Math.max(4, (sec / maxWeek) * 56);
                return (
                  <View key={i} style={styles.weekBarCol}>
                    <View style={[
                      styles.weekBar,
                      { height: barH, backgroundColor: isToday ? colors.primary : colors.border },
                    ]} />
                    <Text style={[styles.weekDayLabel, { color: isToday ? colors.primary : colors.muted }]}>
                      {WEEK_DAYS[i]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={[styles.weekDivider, { backgroundColor: colors.border }]} />
            <View style={styles.weekStatsRow}>
              <View style={styles.weekStatItem}>
                <Text style={[styles.weekStatNum, { color: colors.foreground }]}>{totalStats.totalSessions}</Text>
                <Text style={[styles.weekStatLabel, { color: colors.muted }]}>总次数</Text>
              </View>
              <View style={[styles.weekStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.weekStatItem}>
                <Text style={[styles.weekStatNum, { color: colors.foreground }]}>
                  {Math.round(totalStats.totalSeconds / 60)}
                </Text>
                <Text style={[styles.weekStatLabel, { color: colors.muted }]}>总分钟</Text>
              </View>
              <View style={[styles.weekStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.weekStatItem}>
                <Text style={[styles.weekStatNum, { color: colors.foreground }]}>{totalStats.totalDays}</Text>
                <Text style={[styles.weekStatLabel, { color: colors.muted }]}>坚持天</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Recommended Courses ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>推荐课程</Text>
            <Pressable onPress={() => router.push("/(tabs)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>查看全部</Text>
            </Pressable>
          </View>
          {todayCourses.map((course) => (
            <Pressable
              key={course.id}
              onPress={() => handleStartCourse(course.id)}
              style={({ pressed }) => [
                styles.courseCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.courseCardLeft}>
                <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLOR[course.difficulty] + "20" }]}>
                  <Text style={[styles.diffBadgeText, { color: DIFFICULTY_COLOR[course.difficulty] }]}>
                    {DIFFICULTY_LABEL[course.difficulty]}
                  </Text>
                </View>
                <Text style={[styles.courseTitle, { color: colors.foreground }]}>{course.title}</Text>
                <Text style={[styles.courseMeta, { color: colors.muted }]}>
                  {course.durationMinutes} 分钟 · {course.exercises.length} 个动作
                </Text>
              </View>
              <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.startBtnText}>开始</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingText: { fontSize: 22, fontWeight: "700", color: "#fff" },
  dateText: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  headerStats: { alignItems: "center" },
  headerStatNum: { fontSize: 28, fontWeight: "800", color: "#fff" },
  headerStatLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  seeAll: { fontSize: 14, fontWeight: "500" },
  tipCard: {
    borderRadius: 16, padding: 16, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  tipHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  tipIcon: { fontSize: 28 },
  tipTitle: { fontSize: 15, fontWeight: "600" },
  tipCategory: { fontSize: 12, marginTop: 2 },
  tipSwipe: { fontSize: 11, marginTop: 2 },
  tipContent: { fontSize: 14, lineHeight: 21 },
  weekCard: {
    borderRadius: 16, padding: 16, borderWidth: 1,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  weekBars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 72 },
  weekBarCol: { alignItems: "center", flex: 1, gap: 4 },
  weekBar: { width: 20, borderRadius: 6 },
  weekDayLabel: { fontSize: 11 },
  weekDivider: { height: 1, marginVertical: 12 },
  weekStatsRow: { flexDirection: "row", justifyContent: "space-around" },
  weekStatItem: { alignItems: "center" },
  weekStatNum: { fontSize: 20, fontWeight: "700" },
  weekStatLabel: { fontSize: 11, marginTop: 2 },
  weekStatDivider: { width: 1, height: 32, alignSelf: "center" },
  courseCard: {
    borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  courseCardLeft: { flex: 1, gap: 4 },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffBadgeText: { fontSize: 11, fontWeight: "600" },
  courseTitle: { fontSize: 16, fontWeight: "600" },
  courseMeta: { fontSize: 13 },
  startBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 12 },
  startBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
