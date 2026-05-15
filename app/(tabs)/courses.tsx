import React, { useState } from "react";
import {
  FlatList, Text, View, Pressable, StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { COURSES } from "@/lib/data/courses";
import { Course, DifficultyLevel } from "@/lib/types";

const DIFFICULTIES: { key: DifficultyLevel; label: string; desc: string; color: string }[] = [
  { key: "light",    label: "轻度",  desc: "5-8 分钟 · 放松为主",  color: "#34C759" },
  { key: "moderate", label: "中度",  desc: "10-15 分钟 · 拉伸强化", color: "#FF9500" },
  { key: "intense",  label: "重度",  desc: "15-20 分钟 · 深度康复", color: "#FF3B30" },
];

const MOTION_ICONS: Record<string, string> = {
  forward: "⬇️", backward: "⬆️", left: "⬅️", right: "➡️",
  "rotate-cw": "🔄", "rotate-ccw": "🔃", shoulder: "🙆", static: "🧘",
};

export default function CoursesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [selected, setSelected] = useState<DifficultyLevel>("light");

  const filtered = COURSES.filter((c) => c.difficulty === selected);

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
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.diffBadge, { backgroundColor: diff.color + "20" }]}>
            <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
          </View>
          <Text style={[styles.duration, { color: colors.muted }]}>
            {item.durationMinutes} 分钟
          </Text>
        </View>

        {/* Title */}
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
        <Text style={[styles.cardDesc, { color: colors.muted }]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Exercise preview */}
        <View style={styles.exerciseRow}>
          {item.exercises.slice(0, 5).map((ex) => (
            <View key={ex.id} style={[styles.exChip, { backgroundColor: colors.background }]}>
              <Text style={styles.exIcon}>{MOTION_ICONS[ex.motionType] ?? "🔵"}</Text>
            </View>
          ))}
          {item.exercises.length > 5 && (
            <Text style={[styles.moreText, { color: colors.muted }]}>+{item.exercises.length - 5}</Text>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerMeta, { color: colors.muted }]}>
            {item.exercises.length} 个动作
          </Text>
          <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.startBtnText}>开始锻炼 →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer containerClassName="bg-surface">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>颈椎课程</Text>
        <Text style={[styles.headerSub, { color: colors.muted }]}>根据不适程度选择适合你的课程</Text>

        {/* Segmented Control */}
        <View style={[styles.segmented, { backgroundColor: colors.background }]}>
          {DIFFICULTIES.map((d) => (
            <Pressable
              key={d.key}
              onPress={() => handleSelect(d.key)}
              style={[
                styles.segItem,
                selected === d.key && { backgroundColor: d.color },
              ]}
            >
              <Text style={[
                styles.segLabel,
                { color: selected === d.key ? "#fff" : colors.muted },
              ]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Difficulty description */}
        <Text style={[styles.diffDesc, { color: colors.muted }]}>
          {DIFFICULTIES.find((d) => d.key === selected)?.desc}
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCourse}
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      />
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
  headerSub: { fontSize: 13, marginTop: 2, marginBottom: 14 },
  segmented: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  segItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  segLabel: { fontSize: 14, fontWeight: "600" },
  diffDesc: { fontSize: 12, textAlign: "center" },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  diffText: { fontSize: 12, fontWeight: "700" },
  duration: { fontSize: 13 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  exerciseRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  exChip: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  exIcon: { fontSize: 16 },
  moreText: { fontSize: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerMeta: { fontSize: 13 },
  startBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  startBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
