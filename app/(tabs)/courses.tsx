import React, { useState } from "react";
import {
  FlatList, Text, View, Pressable, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { COURSES } from "@/lib/data/courses";
import { Course, DifficultyLevel } from "@/lib/types";

const DIFFICULTIES: {
  key: DifficultyLevel;
  label: string;
  desc: string;
  color: string;
  bgColor: string;
  gradientColors: [string, string];
  icon: string;
}[] = [
  {
    key: "light",
    label: "轻度",
    desc: "5-8 分钟 · 放松为主",
    color: "#4ECBA0",
    bgColor: "#E8F9F4",
    gradientColors: ["#4ECBA0", "#2DB88A"],
    icon: "🌿",
  },
  {
    key: "moderate",
    label: "中度",
    desc: "10-15 分钟 · 拉伸强化",
    color: "#FFB347",
    bgColor: "#FFF4E0",
    gradientColors: ["#FFB347", "#FF9500"],
    icon: "🔥",
  },
  {
    key: "intense",
    label: "重度",
    desc: "15-20 分钟 · 深度康复",
    color: "#FF6B8A",
    bgColor: "#FFE8ED",
    gradientColors: ["#FF6B8A", "#FF4D70"],
    icon: "💪",
  },
];

const MOTION_ICONS: Record<string, string> = {
  forward: "⬇️", backward: "⬆️", left: "⬅️", right: "➡️",
  "left-lat": "↙️", "right-lat": "↘️",
  trapezius: "↔️",
  "rotate-cw": "🔄", "rotate-ccw": "🔃", shoulder: "🙆", static: "🧘",
};

export default function CoursesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selected, setSelected] = useState<DifficultyLevel>("light");

  const filtered = COURSES.filter((c) => c.difficulty === selected);
  const selectedDiff = DIFFICULTIES.find((d) => d.key === selected)!;

  const handleSelect = (key: DifficultyLevel) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(key);
  };

  const handleCourse = (id: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/course/${id}`);
  };

  const renderCourse = ({ item }: { item: Course }) => {
    const diff = DIFFICULTIES.find((d) => d.key === item.difficulty)!;
    return (
      <Pressable
        onPress={() => handleCourse(item.id)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface, shadowColor: diff.color },
          pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] },
        ]}
      >
        {/* 顶部渐变条 */}
        <LinearGradient
          colors={diff.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardTopBar}
        />

        <View style={styles.cardBody}>
          {/* 头部：徽章 + 时长 */}
          <View style={styles.cardHeader}>
            <View style={[styles.diffBadge, { backgroundColor: diff.bgColor }]}>
              <Text style={styles.diffBadgeIcon}>{diff.icon}</Text>
              <Text style={[styles.diffBadgeText, { color: diff.color }]}>{diff.label}</Text>
            </View>
            <View style={styles.durationBadge}>
              <Text style={styles.durationIcon}>⏱</Text>
              <Text style={[styles.durationText, { color: colors.muted }]}>{item.durationMinutes} 分钟</Text>
            </View>
          </View>

          {/* 标题 + 描述 */}
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
          <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>
            {item.description}
          </Text>

          {/* 动作预览 */}
          <View style={styles.exerciseRow}>
            {item.exercises.slice(0, 6).map((ex) => (
              <View key={ex.id} style={[styles.exChip, { backgroundColor: diff.bgColor }]}>
                <Text style={styles.exIcon}>{MOTION_ICONS[ex.motionType] ?? "🔵"}</Text>
              </View>
            ))}
            {item.exercises.length > 6 && (
              <View style={[styles.exChipMore, { backgroundColor: diff.bgColor }]}>
                <Text style={[styles.moreText, { color: diff.color }]}>+{item.exercises.length - 6}</Text>
              </View>
            )}
          </View>

          {/* 底部：动作数 + 开始按钮 */}
          <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerMeta, { color: colors.muted }]}>
              共 {item.exercises.length} 个动作
            </Text>
            <LinearGradient
              colors={diff.gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>开始锻炼 →</Text>
            </LinearGradient>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>🏋️ 颈椎课程</Text>
        <Text style={[styles.headerSub, { color: colors.muted }]}>根据不适程度选择适合你的课程</Text>

        {/* Difficulty Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.surface }]}>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => handleSelect(d.key)}
              style={[styles.tabItem, selected === d.key && { backgroundColor: "transparent" }]}
            >
              {selected === d.key ? (
                <LinearGradient
                  colors={d.gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.tabItemActive}
                >
                  <Text style={styles.tabIconActive}>{d.icon}</Text>
                  <Text style={styles.tabLabelActive}>{d.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabItemInactive}>
                  <Text style={styles.tabIcon}>{d.icon}</Text>
                  <Text style={[styles.tabLabel, { color: colors.muted }]}>{d.label}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* 当前难度说明 */}
        <View style={[styles.diffDescRow, { backgroundColor: selectedDiff.bgColor }]}>
          <Text style={[styles.diffDescText, { color: selectedDiff.color }]}>
            {selectedDiff.icon} {selectedDiff.desc}
          </Text>
        </View>
      </View>

      {/* 安全提示 */}
      <View style={[styles.warningBanner, { backgroundColor: "#FFF8E1" }]}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={[styles.warningText, { color: "#8B6914" }]}>
          如有颈椎疾病史或身体不适，请先咨询医生。锻炼中出现疼痛加重请立即停止。
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  headerSub: { fontSize: 13, marginBottom: 14 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    marginBottom: 10,
    gap: 4,
  },
  tabItem: { flex: 1, borderRadius: 12 },
  tabItemActive: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  tabItemInactive: {
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  tabIcon: { fontSize: 16 },
  tabIconActive: { fontSize: 16 },
  tabLabel: { fontSize: 13, fontWeight: "600" },
  tabLabelActive: { fontSize: 13, fontWeight: "700", color: "#fff" },
  diffDescRow: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
  },
  diffDescText: { fontSize: 13, fontWeight: "600" },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
  },
  warningIcon: { fontSize: 14, marginTop: 1 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: "500" },
  // Card
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  cardTopBar: { height: 5 },
  cardBody: { padding: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  diffBadgeIcon: { fontSize: 13 },
  diffBadgeText: { fontSize: 12, fontWeight: "700" },
  durationBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  durationIcon: { fontSize: 13 },
  durationText: { fontSize: 13 },
  cardTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  cardDesc: { fontSize: 13, lineHeight: 20, marginBottom: 12 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  exChip: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  exChipMore: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  exIcon: { fontSize: 17 },
  moreText: { fontSize: 12, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerMeta: { fontSize: 13 },
  startBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20 },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
