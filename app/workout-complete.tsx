import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutCompleteScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 16);
  const params = useLocalSearchParams<{
    courseTitle: string;
    durationSeconds: string;
    completedExercises: string;
    totalExercises: string;
    pitchRange: string;
    yawRange: string;
    rollRange: string;
    maxAngle: string;
    usedAirPods: string;
  }>();

  const realSeconds   = Number(params.durationSeconds);
  const durationMin   = Math.floor(realSeconds / 60);
  const durationSec   = realSeconds % 60;
  const completed     = Number(params.completedExercises);
  const total         = Number(params.totalExercises);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const encourageData =
    completionRate >= 100
      ? { emoji: "🏆", text: "太棒了！你完成了全部动作，坚持锻炼，颈椎会越来越好！", colors: ["#FFB347", "#FF9500"] as [string, string] }
      : completionRate >= 60
      ? { emoji: "🌟", text: "不错！已完成大部分动作，下次争取全部完成！", colors: ["#4ECBA0", "#2DB88A"] as [string, string] }
      : { emoji: "💪", text: "已经很好了！循序渐进，每次进步一点点！", colors: ["#A78BFA", "#8B5CF6"] as [string, string] };

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: safeBottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Celebration Header ── */}
        <LinearGradient
          colors={["#FF6B8A", "#FF9BAD", "#FFD6DF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* 装饰气泡 */}
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />

          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.heroTitle}>锻炼完成！</Text>
          <Text style={styles.heroSub}>{params.courseTitle}</Text>

          {/* 完成度环形指示 */}
          <View style={styles.completionRow}>
            <View style={styles.completionBadge}>
              <Text style={styles.completionPct}>{completionRate}%</Text>
              <Text style={styles.completionLabel}>完成度</Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionPct}>
                {String(durationMin).padStart(2, "0")}:{String(durationSec).padStart(2, "0")}
              </Text>
              <Text style={styles.completionLabel}>锻炼时长</Text>
            </View>
            <View style={styles.completionBadge}>
              <Text style={styles.completionPct}>{completed}</Text>
              <Text style={styles.completionLabel}>完成动作</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Content ── */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>

          {/* ── Encouragement Card ── */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <LinearGradient
              colors={encourageData.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.encourageCard}
            >
              <Text style={styles.encourageEmoji}>{encourageData.emoji}</Text>
              <Text style={styles.encourageText}>{encourageData.text}</Text>
            </LinearGradient>
          </View>

          {/* ── Stats Grid ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>📊</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>锻炼统计</Text>
            </View>
            <View style={[styles.statsGrid, { backgroundColor: colors.surface, shadowColor: "#FF6B8A" }]}>
              {[
                { icon: "⏱️", num: `${String(durationMin).padStart(2, "0")}:${String(durationSec).padStart(2, "0")}`, label: "真实时长" },
                { icon: "🔁", num: String(completed), label: "完成动作" },
                { icon: "🔥", num: String(Math.max(1, Math.round(realSeconds / 60 * 2))), label: "卡路里" },
              ].map((item, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <View style={[styles.statDivider, { backgroundColor: colors.border }]} />}
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>{item.icon}</Text>
                    <Text style={[styles.statNum, { color: colors.foreground }]}>{item.num}</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>{item.label}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* ── Progress Bar ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
            <View style={[styles.progressCard, { backgroundColor: colors.surface, shadowColor: "#4ECBA0" }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.muted }]}>动作完成进度</Text>
                <Text style={[styles.progressVal, { color: colors.foreground }]}>
                  {completed} / {total} 个
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <LinearGradient
                  colors={["#4ECBA0", "#2DB88A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${completionRate}%` as any }]}
                />
              </View>
              <Text style={[styles.progressPct, { color: "#4ECBA0" }]}>{completionRate}%</Text>
            </View>
          </View>

          {/* ── Motion Data ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.sectionEmoji}>🧠</Text>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>头部运动数据</Text>
              </View>
              {params.usedAirPods === "1" && (
                <View style={[styles.airpodsBadge, { backgroundColor: "#FFE8ED" }]}>
                  <Text style={[styles.airpodsText, { color: "#FF6B8A" }]}>🎧 AirPods</Text>
                </View>
              )}
            </View>
            <View style={[styles.motionCard, { backgroundColor: colors.surface, shadowColor: "#A78BFA" }]}>
              {[
                { label: "俯仰（前屈/后伸）", value: params.pitchRange, color: "#4A90D9", icon: "↕️" },
                { label: "偏航（左右旋转）",  value: params.yawRange,   color: "#4ECBA0", icon: "↔️" },
                { label: "横滚（侧向倾斜）",  value: params.rollRange,  color: "#FFB347", icon: "🔄" },
              ].map((m) => (
                <View key={m.label} style={styles.motionRow}>
                  <Text style={styles.motionRowIcon}>{m.icon}</Text>
                  <Text style={[styles.motionRowLabel, { color: colors.muted }]}>{m.label}</Text>
                  <View style={[styles.motionBarTrack, { backgroundColor: colors.border }]}>
                    <View style={[
                      styles.motionBarFill,
                      { backgroundColor: m.color, width: `${Math.min(100, Number(m.value) * 1.5)}%` as any },
                    ]} />
                  </View>
                  <Text style={[styles.motionRowVal, { color: m.color }]}>{m.value}°</Text>
                </View>
              ))}
              <View style={[styles.maxAngleRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.maxAngleLabel, { color: colors.muted }]}>最大活动角度</Text>
                <Text style={[styles.maxAngleVal, { color: "#FF6B8A" }]}>{params.maxAngle}°</Text>
              </View>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 28, gap: 12 }}>
            <Pressable
              onPress={() => router.replace("/(tabs)")}
              style={({ pressed }) => [
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={["#FF6B8A", "#FF4D70"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>🏠 返回首页</Text>
              </LinearGradient>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondaryBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>🔄 再练一次</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
    overflow: "hidden",
    position: "relative",
  },
  bubble: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  bubble1: { width: 100, height: 100, top: -30, right: 20 },
  bubble2: { width: 60, height: 60, bottom: 10, left: 30 },
  celebrationEmoji: { fontSize: 60, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 4 },
  heroSub: { fontSize: 15, color: "rgba(255,255,255,0.9)", marginBottom: 20 },
  completionRow: {
    flexDirection: "row",
    gap: 12,
  },
  completionBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
  },
  completionPct: { fontSize: 20, fontWeight: "800", color: "#fff" },
  completionLabel: { fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  content: {
    flex: 1,
    marginTop: -16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionEmoji: { fontSize: 18, marginRight: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  // Encourage
  encourageCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  encourageEmoji: { fontSize: 36 },
  encourageText: { flex: 1, fontSize: 15, color: "#fff", fontWeight: "600", lineHeight: 22 },
  // Stats
  statsGrid: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-around",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statItem: { alignItems: "center", gap: 4 },
  statIcon: { fontSize: 24 },
  statNum: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 48, alignSelf: "center" },
  // Progress
  progressCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13 },
  progressVal: { fontSize: 13, fontWeight: "600" },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: 10, borderRadius: 5 },
  progressPct: { fontSize: 13, fontWeight: "700", textAlign: "right" },
  // Motion
  airpodsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  airpodsText: { fontSize: 12, fontWeight: "600" },
  motionCard: {
    borderRadius: 20,
    padding: 16,
    gap: 12,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  motionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  motionRowIcon: { fontSize: 16, width: 24 },
  motionRowLabel: { fontSize: 12, width: 100 },
  motionBarTrack: { flex: 1, height: 7, borderRadius: 4, overflow: "hidden" },
  motionBarFill: { height: 7, borderRadius: 4 },
  motionRowVal: { fontSize: 13, fontWeight: "700", width: 36, textAlign: "right" },
  maxAngleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  maxAngleLabel: { fontSize: 13 },
  maxAngleVal: { fontSize: 20, fontWeight: "800" },
  // Buttons
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" },
});
