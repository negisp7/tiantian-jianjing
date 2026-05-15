import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function WorkoutTooShortScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 16);
  const params = useLocalSearchParams<{
    courseTitle: string;
    durationSeconds: string;
    minSeconds: string;
  }>();

  const duration = Number(params.durationSeconds);
  const minSec   = Number(params.minSeconds);

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={[styles.container, { paddingBottom: safeBottom }]}>
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: colors.warning + "18" }]}>
          <Text style={styles.icon}>⏱️</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>锻炼时间太短</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>
          本次锻炼仅 {duration} 秒，不足 {minSec} 秒，{"\n"}
          记录未保存。
        </Text>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>本次时长</Text>
            <Text style={[styles.infoVal, { color: colors.warning }]}>{duration} 秒</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>最短有效时长</Text>
            <Text style={[styles.infoVal, { color: colors.success }]}>{minSec} 秒</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>课程</Text>
            <Text style={[styles.infoVal, { color: colors.foreground }]} numberOfLines={1}>
              {params.courseTitle}
            </Text>
          </View>
        </View>

        {/* Tip */}
        <View style={[styles.tipCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <Text style={[styles.tipText, { color: colors.primary }]}>
            💡 完成至少 {minSec} 秒的锻炼，系统才会保存记录并计入日历统计。坚持完整课程效果更好！
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.btnGroup}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.primary },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.primaryBtnText}>重新开始</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>返回首页</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  icon: { fontSize: 44 },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  sub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  infoCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  infoLabel: { fontSize: 14 },
  infoVal: { fontSize: 14, fontWeight: "600", maxWidth: 160 },
  infoDivider: { height: 1, marginHorizontal: 16 },
  tipCard: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  tipText: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  btnGroup: { width: "100%", gap: 10, marginTop: 4 },
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
