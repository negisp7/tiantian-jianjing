import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView, Text, View, Pressable,
  StyleSheet, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { DAILY_TIPS, getTodayTip } from "@/lib/data/tips";
import { COURSES } from "@/lib/data/courses";
import { WorkoutStore } from "@/lib/store/workout-store";
import { DailyTip } from "@/lib/types";

const { width: SCREEN_W } = Dimensions.get("window");
const DIFFICULTY_LABEL: Record<string, string> = { light: "轻度", moderate: "中度", intense: "重度" };
const DIFFICULTY_COLOR: Record<string, string> = { light: "#4ECBA0", moderate: "#FFB347", intense: "#FF6B8A" };
const DIFFICULTY_BG: Record<string, string> = { light: "#E8F9F4", moderate: "#FFF4E0", intense: "#FFE8ED" };
const DIFFICULTY_ICON: Record<string, string> = { light: "🌿", moderate: "🔥", intense: "💪" };
const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"];

const GREETING_ICONS: Record<string, string> = {
  morning: "🌸",
  afternoon: "☀️",
  evening: "🌙",
};

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const [todayTip, setTodayTip] = useState<DailyTip>(getTodayTip());
  const [tipIndex, setTipIndex] = useState(todayTip.id);
  const [weekData, setWeekData] = useState<number[]>(Array(7).fill(0));
  const [totalStats, setTotalStats] = useState({ totalDays: 0, totalSeconds: 0, totalSessions: 0 });

  const today = new Date();
  const hour = today.getHours();
  const greetingKey = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const greeting = hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
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
  const todayCourses = COURSES.slice(0, 3);

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={["#FF6B8A", "#FF9BAD", "#FFB8C6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* 装饰气泡 */}
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />
          <View style={[styles.bubble, styles.bubble3]} />

          <View style={styles.headerContent}>
            <View style={{ flex: 1 }}>
              <View style={styles.greetingRow}>
                <Text style={styles.greetingIcon}>{GREETING_ICONS[greetingKey]}</Text>
                <Text style={styles.greetingText}>{greeting}！</Text>
              </View>
              <Text style={styles.dateText}>{dateStr} · {weekDayStr}</Text>
              <Text style={styles.motivationText}>
                {totalStats.totalDays === 0
                  ? "开始你的颈椎健康之旅吧 ✨"
                  : `已坚持 ${totalStats.totalDays} 天，继续加油！🎉`}
              </Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNum}>{totalStats.totalDays}</Text>
              <Text style={styles.streakLabel}>天</Text>
              <Text style={styles.streakSub}>连续打卡</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Content Area ── */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>

          {/* ── This Week Chart ── */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>📊</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>本周锻炼</Text>
            </View>
            <View style={[styles.weekCard, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
              <View style={styles.weekBars}>
                {weekData.map((sec, i) => {
                  const isToday = i === today.getDay();
                  const hasData = sec > 0;
                  const barH = Math.max(6, (sec / maxWeek) * 60);
                  return (
                    <View key={i} style={styles.weekBarCol}>
                      <View style={[
                        styles.weekBarBg,
                        { backgroundColor: colors.border },
                      ]}>
                        <View style={[
                          styles.weekBarFill,
                          {
                            height: barH,
                            backgroundColor: isToday ? "#FF6B8A" : hasData ? "#FFB8C6" : colors.border,
                          },
                        ]} />
                      </View>
                      <View style={[
                        styles.weekDayDot,
                        { backgroundColor: isToday ? "#FF6B8A" : "transparent" },
                      ]} />
                      <Text style={[
                        styles.weekDayLabel,
                        { color: isToday ? "#FF6B8A" : colors.muted, fontWeight: isToday ? "700" : "400" },
                      ]}>
                        {WEEK_DAYS[i]}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View style={[styles.weekDivider, { backgroundColor: colors.border }]} />
              <View style={styles.weekStatsRow}>
                {[
                  { num: totalStats.totalSessions, label: "总次数", icon: "🏃" },
                  { num: Math.round(totalStats.totalSeconds / 60), label: "总分钟", icon: "⏱️" },
                  { num: totalStats.totalDays, label: "坚持天", icon: "🔥" },
                ].map((item, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <View style={[styles.weekStatDivider, { backgroundColor: colors.border }]} />}
                    <View style={styles.weekStatItem}>
                      <Text style={styles.weekStatIcon}>{item.icon}</Text>
                      <Text style={[styles.weekStatNum, { color: colors.foreground }]}>{item.num}</Text>
                      <Text style={[styles.weekStatLabel, { color: colors.muted }]}>{item.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>

          {/* ── Daily Tip Card ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>💡</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>每日健康贴士</Text>
            </View>
            <Pressable
              onPress={handleTipNext}
              style={({ pressed }) => [
                styles.tipCard,
                { backgroundColor: "#FFF0F3", borderColor: "#FFD6DF" },
                pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
              ]}
            >
              <View style={styles.tipHeader}>
                <View style={styles.tipIconWrap}>
                  <Text style={styles.tipIcon}>{todayTip.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tipTitle, { color: "#2D1B24" }]}>{todayTip.title}</Text>
                  <View style={styles.tipCategoryBadge}>
                    <Text style={styles.tipCategoryText}>
                      {todayTip.category === "posture" ? "🧍 姿势" :
                       todayTip.category === "exercise" ? "🏃 锻炼" :
                       todayTip.category === "lifestyle" ? "🌿 生活" : "🔬 科学"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.tipSwipe, { color: "#FF9BAD" }]}>换一条 →</Text>
              </View>
              <Text style={[styles.tipContent, { color: "#7A5060" }]}>{todayTip.content}</Text>
            </Pressable>
          </View>

          {/* ── Recommended Courses ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.sectionEmoji}>🎯</Text>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>推荐课程</Text>
              </View>
              <Pressable
                onPress={() => router.push("/(tabs)/courses")}
                style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.seeAllText}>查看全部 →</Text>
              </Pressable>
            </View>
            {todayCourses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => handleStartCourse(course.id)}
                style={({ pressed }) => [
                  styles.courseCard,
                  { backgroundColor: colors.surface, shadowColor: colors.primary },
                  pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
                ]}
              >
                {/* 左侧彩色竖条 */}
                <View style={[styles.courseAccent, { backgroundColor: DIFFICULTY_COLOR[course.difficulty] }]} />
                <View style={styles.courseCardBody}>
                  <View style={styles.courseCardTop}>
                    <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_BG[course.difficulty] }]}>
                      <Text style={styles.diffBadgeIcon}>{DIFFICULTY_ICON[course.difficulty]}</Text>
                      <Text style={[styles.diffBadgeText, { color: DIFFICULTY_COLOR[course.difficulty] }]}>
                        {DIFFICULTY_LABEL[course.difficulty]}
                      </Text>
                    </View>
                    <Text style={[styles.courseDuration, { color: colors.muted }]}>
                      ⏱ {course.durationMinutes} 分钟
                    </Text>
                  </View>
                  <Text style={[styles.courseTitle, { color: colors.foreground }]}>{course.title}</Text>
                  <Text style={[styles.courseMeta, { color: colors.muted }]} numberOfLines={1}>
                    {course.exercises.length} 个动作 · {course.description.slice(0, 20)}…
                  </Text>
                </View>
                <View style={[styles.startBtn, { backgroundColor: DIFFICULTY_COLOR[course.difficulty] }]}>
                  <Text style={styles.startBtnText}>开始</Text>
                  <Text style={styles.startBtnArrow}>›</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    overflow: "hidden",
    position: "relative",
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  bubble1: { width: 80, height: 80, top: -20, right: 60 },
  bubble2: { width: 50, height: 50, top: 30, right: 20 },
  bubble3: { width: 120, height: 120, top: -40, right: -30 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    position: "relative",
    zIndex: 1,
  },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  greetingIcon: { fontSize: 22 },
  greetingText: { fontSize: 22, fontWeight: "800", color: "#fff" },
  dateText: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginBottom: 6 },
  motivationText: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
  streakBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 72,
  },
  streakNum: { fontSize: 30, fontWeight: "900", color: "#fff", lineHeight: 34 },
  streakLabel: { fontSize: 16, fontWeight: "700", color: "#fff", lineHeight: 18 },
  streakSub: { fontSize: 10, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionEmoji: { fontSize: 18, marginRight: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAllBtn: {
    backgroundColor: "#FFE8ED",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  seeAllText: { fontSize: 13, color: "#FF6B8A", fontWeight: "600" },
  // Week card
  weekCard: {
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  weekBars: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 80 },
  weekBarCol: { alignItems: "center", flex: 1, gap: 4 },
  weekBarBg: { width: 18, height: 60, borderRadius: 9, justifyContent: "flex-end", overflow: "hidden" },
  weekBarFill: { width: "100%", borderRadius: 9 },
  weekDayDot: { width: 5, height: 5, borderRadius: 3 },
  weekDayLabel: { fontSize: 11 },
  weekDivider: { height: 1, marginVertical: 12 },
  weekStatsRow: { flexDirection: "row", justifyContent: "space-around" },
  weekStatItem: { alignItems: "center", gap: 2 },
  weekStatIcon: { fontSize: 16 },
  weekStatNum: { fontSize: 20, fontWeight: "800" },
  weekStatLabel: { fontSize: 11 },
  weekStatDivider: { width: 1, height: 36, alignSelf: "center" },
  // Tip card
  tipCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
  },
  tipHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  tipIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,107,138,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  tipIcon: { fontSize: 26 },
  tipTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  tipCategoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,107,138,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tipCategoryText: { fontSize: 11, color: "#FF6B8A", fontWeight: "600" },
  tipSwipe: { fontSize: 11, fontWeight: "500", marginTop: 2 },
  tipContent: { fontSize: 14, lineHeight: 22 },
  // Course card
  courseCard: {
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  courseAccent: { width: 5, alignSelf: "stretch" },
  courseCardBody: { flex: 1, padding: 14, gap: 5 },
  courseCardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  diffBadgeIcon: { fontSize: 12 },
  diffBadgeText: { fontSize: 11, fontWeight: "700" },
  courseDuration: { fontSize: 12 },
  courseTitle: { fontSize: 15, fontWeight: "700" },
  courseMeta: { fontSize: 12 },
  startBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    minWidth: 56,
  },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  startBtnArrow: { color: "rgba(255,255,255,0.8)", fontSize: 18, lineHeight: 20 },
});
