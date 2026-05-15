import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

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

  // ── 真实时长（秒表计时，非课程预设）────────────────────────────────────────
  const realSeconds  = Number(params.durationSeconds);
  const durationMin  = Math.floor(realSeconds / 60);
  const durationSec  = realSeconds % 60;

  // ── 运动次数（实际完成的步骤数）────────────────────────────────────────────
  const completed    = Number(params.completedExercises);
  const total        = Number(params.totalExercises);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: safeBottom + 24 }} showsVerticalScrollIndicator={false}>

        {/* ── Celebration Header ── */}
        <View style={[styles.hero, { backgroundColor: colors.primary + "12" }]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>锻炼完成！</Text>
          <Text style={[styles.heroSub, { color: colors.muted }]}>{params.courseTitle}</Text>
          <View style={[styles.completionBadge, { backgroundColor: colors.success + "20" }]}>
            <Text style={[styles.completionText, { color: colors.success }]}>
              完成度 {completionRate}%
            </Text>
          </View>
        </View>

        {/* ── Core Stats ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>锻炼统计</Text>
          <View style={[styles.statsGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>

            {/* 真实锻炼时长 */}
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={[styles.statNum, { color: colors.foreground }]}>
                {String(durationMin).padStart(2, "0")}:{String(durationSec).padStart(2, "0")}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>真实时长</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            {/* 颈部运动次数（完成的动作步骤数） */}
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔁</Text>
              <Text style={[styles.statNum, { color: colors.foreground }]}>
                {completed}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>颈部运动次</Text>
            </View>

            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

            {/* 卡路里估算 */}
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={[styles.statNum, { color: colors.foreground }]}>
                {Math.max(1, Math.round(realSeconds / 60 * 2))}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>卡路里</Text>
            </View>
          </View>

          {/* 动作完成进度条 */}
          <View style={[styles.progressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.muted }]}>动作完成进度</Text>
              <Text style={[styles.progressVal, { color: colors.foreground }]}>
                {completed} / {total} 个动作
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[
                styles.progressFill,
                { backgroundColor: colors.success, width: `${completionRate}%` as any },
              ]} />
            </View>
          </View>
        </View>

        {/* ── Motion Data ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>头部运动数据</Text>
            {params.usedAirPods === "1" && (
              <View style={[styles.airpodsBadge, { backgroundColor: colors.primary + "20" }]}>
                <Text style={[styles.airpodsText, { color: colors.primary }]}>🎧 AirPods</Text>
              </View>
            )}
          </View>
          <View style={[styles.motionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { label: "俯仰（前屈/后伸）", value: params.pitchRange, color: "#4A90D9", icon: "↕️" },
              { label: "偏航（左右旋转）",  value: params.yawRange,   color: "#34C759", icon: "↔️" },
              { label: "横滚（侧向倾斜）",  value: params.rollRange,  color: "#FF9500", icon: "🔄" },
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
              <Text style={[styles.maxAngleVal, { color: colors.primary }]}>{params.maxAngle}°</Text>
            </View>
          </View>
        </View>

        {/* ── Encouragement ── */}
        <View style={[styles.encourageCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.encourageText, { color: colors.primary }]}>
            {completionRate >= 100
              ? "🌟 太棒了！你完成了全部动作，坚持锻炼，颈椎会越来越好！"
              : completionRate >= 60
              ? "👍 不错！已完成大部分动作，下次争取全部完成！"
              : "💪 已经很好了！循序渐进，每次进步一点点！"}
          </Text>
        </View>

        {/* ── Actions ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 12 }}>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>返回首页</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>再练一次</Text>
          </Pressable>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  celebrationEmoji: { fontSize: 56, marginBottom: 8 },
  heroTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  heroSub: { fontSize: 15, marginBottom: 12 },
  completionBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  completionText: { fontSize: 14, fontWeight: "700" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  statsGrid: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: "space-around",
    marginBottom: 12,
  },
  statItem: { alignItems: "center", gap: 4 },
  statIcon: { fontSize: 24 },
  statNum: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 48, alignSelf: "center" },
  progressCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 13 },
  progressVal: { fontSize: 13, fontWeight: "600" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },
  airpodsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  airpodsText: { fontSize: 12, fontWeight: "600" },
  motionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  motionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  motionRowIcon: { fontSize: 16, width: 24 },
  motionRowLabel: { fontSize: 12, width: 100 },
  motionBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  motionBarFill: { height: 6, borderRadius: 3 },
  motionRowVal: { fontSize: 13, fontWeight: "600", width: 36, textAlign: "right" },
  maxAngleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  maxAngleLabel: { fontSize: 13 },
  maxAngleVal: { fontSize: 18, fontWeight: "700" },
  encourageCard: {
    margin: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  encourageText: { fontSize: 14, lineHeight: 22, textAlign: "center" },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" },
});
