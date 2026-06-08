import React from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getCourseById } from "@/lib/data/courses";
import { IconSymbol } from "@/components/ui/icon-symbol";

const DIFFICULTY_LABEL: Record<string, string> = { light: "轻度", moderate: "中度", intense: "重度" };
const DIFFICULTY_COLOR: Record<string, string> = { light: "#34C759", moderate: "#FF9500", intense: "#FF3B30" };
const MOTION_ICONS: Record<string, string> = {
  forward: "⬇️", backward: "⬆️", left: "⬅️", right: "➡️",
  "left-lat": "↙️", "right-lat": "↘️",
  trapezius: "↔️",
  "rotate-cw": "🔄", "rotate-ccw": "🔃", shoulder: "🙆", static: "🧘",
};
const MOTION_LABELS: Record<string, string> = {
  forward: "前屈", backward: "后伸", left: "左侧", right: "右侧",
  "left-lat": "左侧屈", "right-lat": "右侧屈",
  trapezius: "斜方肌",
  "rotate-cw": "顺转", "rotate-ccw": "逆转", shoulder: "肩部", static: "静力",
};

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const course = getCourseById(id);

  if (!course) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>课程不存在</Text>
        </View>
      </ScreenContainer>
    );
  }

  const diffColor = DIFFICULTY_COLOR[course.difficulty];
  const totalSeconds = course.exercises.reduce((s, e) => s + e.durationSeconds, 0);

  const handleStart = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/exercise/${course.id}`);
  };

  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      {/* Nav Bar */}
      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>返回</Text>
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.foreground }]}>课程详情</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 + safeBottom }} showsVerticalScrollIndicator={false}>
        {/* 常驻警示横幅 */}
        <View style={[styles.warningBanner, { backgroundColor: "#FFF3CD", borderColor: "#F59E0B50" }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={[styles.warningText, { color: "#92400E" }]}>
            如有颈椎疾病史或身体不适，请先和医生确认后再使用。出现疼痛加重、头晕或麻木请立即停止。
          </Text>
        </View>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: diffColor + "15" }]}>
          <View style={[styles.diffBadge, { backgroundColor: diffColor }]}>
            <Text style={styles.diffBadgeText}>{DIFFICULTY_LABEL[course.difficulty]}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{course.title}</Text>
          <Text style={[styles.heroDesc, { color: colors.muted }]}>{course.description}</Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatIcon}>⏱️</Text>
              <Text style={[styles.heroStatNum, { color: colors.foreground }]}>{course.durationMinutes}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.muted }]}>分钟</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatIcon}>🏃</Text>
              <Text style={[styles.heroStatNum, { color: colors.foreground }]}>{course.exercises.length}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.muted }]}>个动作</Text>
            </View>
            <View style={[styles.heroStatDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatIcon}>🔥</Text>
              <Text style={[styles.heroStatNum, { color: colors.foreground }]}>{Math.round(totalSeconds / 60)}</Text>
              <Text style={[styles.heroStatLabel, { color: colors.muted }]}>总秒数/60</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {course.tags.map((tag) => (
              <View key={tag} style={[styles.tag, { backgroundColor: colors.surface }]}>
                <Text style={[styles.tagText, { color: colors.muted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercise List */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>动作列表</Text>
          {course.exercises.map((ex, idx) => (
            <View
              key={ex.id}
              style={[styles.exRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.exIndex, { backgroundColor: diffColor + "20" }]}>
                <Text style={[styles.exIndexText, { color: diffColor }]}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.exTitleRow}>
                  <Text style={styles.exMotionIcon}>{MOTION_ICONS[ex.motionType] ?? "🔵"}</Text>
                  <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name}</Text>
                </View>
                <Text style={[styles.exDesc, { color: colors.muted }]} numberOfLines={2}>
                  {ex.description}
                </Text>
              </View>
              <View style={[styles.exDuration, { backgroundColor: colors.background }]}>
                <Text style={[styles.exDurationText, { color: colors.primary }]}>{ex.durationSeconds}s</Text>
              </View>
            </View>
          ))}
        </View>

        {/* AirPods Motion Notice */}
        <View style={[styles.gyroNotice, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
          <Text style={styles.gyroIcon}>🎧</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.gyroTitle, { color: colors.primary }]}>头部运动记录</Text>
            <Text style={[styles.gyroDesc, { color: colors.muted }]}>
              佩戴支持头部运动的 AirPods 开始锻炼，可通过耳机传感器记录俯仰角、偏转角等头部运动数据。未佩戴时仅记录锻炼时长和动作次数。
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={[styles.startBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: safeBottom + 16 }]}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startBtn,
            { backgroundColor: diffColor },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
        >
          <Text style={styles.startBtnText}>开始锻炼</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: "row", alignItems: "center", width: 60 },
  backText: { fontSize: 16, marginLeft: 2 },
  navTitle: { fontSize: 16, fontWeight: "600" },
  hero: { padding: 20, margin: 16, borderRadius: 20 },
  diffBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  diffBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  heroTitle: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  heroDesc: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
  heroStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 14 },
  heroStatItem: { alignItems: "center", gap: 2 },
  heroStatIcon: { fontSize: 20 },
  heroStatNum: { fontSize: 22, fontWeight: "700" },
  heroStatLabel: { fontSize: 11 },
  heroStatDivider: { width: 1, height: 40, alignSelf: "center" },
  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  exRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  exIndex: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  exIndexText: { fontSize: 14, fontWeight: "700" },
  exTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 },
  exMotionIcon: { fontSize: 16 },
  exName: { fontSize: 15, fontWeight: "600" },
  exDesc: { fontSize: 12, lineHeight: 17 },
  exDuration: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  exDurationText: { fontSize: 13, fontWeight: "600" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  warningIcon: { fontSize: 14, marginTop: 1 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "500" },
  gyroNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  gyroIcon: { fontSize: 24 },
  gyroTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  gyroDesc: { fontSize: 12, lineHeight: 18 },
  startBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  startBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
