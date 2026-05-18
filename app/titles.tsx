import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { WorkoutStore } from "@/lib/store/workout-store";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  ALL_TITLES, getUnlockedTitles, buildTitleStats, type Title,
} from "@/lib/data/titles";

const TIER_COLOR: Record<Title["tier"], string> = {
  bronze: "#CD7F32",
  silver: "#A8A9AD",
  gold: "#FFD700",
  platinum: "#E5E4E2",
  special: "#9B59B6",
};

const TIER_LABEL: Record<Title["tier"], string> = {
  bronze: "铜",
  silver: "银",
  gold: "金",
  platinum: "铂金",
  special: "特殊",
};

type FilterTab = "all" | "unlocked" | "locked";

export default function TitlesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 16);

  const [filter, setFilter] = useState<FilterTab>("all");
  const [unlockedTitles, setUnlockedTitles] = useState<Title[]>([]);

  const loadData = useCallback(async () => {
    const [s, totalReps, maxAngle, streakInfo, timeSlots, diffCounts] = await Promise.all([
      WorkoutStore.getTotalStats(),
      WorkoutStore.getTotalReps(),
      WorkoutStore.getMaxAngle(),
      WorkoutStore.getStreakInfo(),
      WorkoutStore.getTimeSlotCounts(),
      WorkoutStore.getDifficultyCounts(),
    ]);
    const ts = buildTitleStats(
      s, totalReps, maxAngle,
      streakInfo.streakDays, streakInfo.maxStreak,
      timeSlots.morningCount, timeSlots.nightCount,
      diffCounts.lightCount, diffCounts.moderateCount, diffCounts.intenseCount,
    );
    setUnlockedTitles(getUnlockedTitles(ts));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const unlockedIds = new Set(unlockedTitles.map((t) => t.id));

  const filteredTitles = ALL_TITLES.filter((t) => {
    if (filter === "unlocked") return unlockedIds.has(t.id);
    if (filter === "locked") return !unlockedIds.has(t.id);
    return true;
  });

  const renderItem = ({ item: title, index }: { item: Title; index: number }) => {
    const isUnlocked = unlockedIds.has(title.id);
    return (
      <View key={title.id}>
        {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        <View style={[styles.titleRow, !isUnlocked && styles.titleRowLocked]}>
          <View style={[
            styles.emojiBox,
            {
              backgroundColor: isUnlocked
                ? TIER_COLOR[title.tier] + "20"
                : colors.border + "40",
            },
          ]}>
            <Text style={[styles.emoji, { opacity: isUnlocked ? 1 : 0.3 }]}>
              {title.emoji}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={[
                styles.titleName,
                { color: isUnlocked ? colors.foreground : colors.muted },
              ]}>
                {isUnlocked ? title.name : "???"}
              </Text>
              <View style={[
                styles.tierBadge,
                { backgroundColor: isUnlocked ? TIER_COLOR[title.tier] + "20" : colors.border },
              ]}>
                <Text style={[
                  styles.tierText,
                  { color: isUnlocked ? TIER_COLOR[title.tier] : colors.muted },
                ]}>
                  {TIER_LABEL[title.tier]}
                </Text>
              </View>
            </View>
            <Text style={[styles.titleDesc, { color: colors.muted }]}>
              {isUnlocked ? title.flavor : title.description}
            </Text>
          </View>
          {isUnlocked && (
            <Text style={[styles.checkMark, { color: colors.success }]}>✓</Text>
          )}
        </View>
      </View>
    );
  };

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: `全部 (${ALL_TITLES.length})` },
    { key: "unlocked", label: `已解锁 (${unlockedTitles.length})` },
    { key: "locked", label: `未解锁 (${ALL_TITLES.length - unlockedTitles.length})` },
  ];

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
        <Text style={[styles.navTitle, { color: colors.foreground }]}>称号收集</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* 进度横幅 */}
      <View style={[styles.progressBanner, { backgroundColor: colors.primary + "12", borderBottomColor: colors.primary + "20" }]}>
        <Text style={[styles.progressText, { color: colors.primary }]}>
          🏆 已解锁 {unlockedTitles.length} / {ALL_TITLES.length} 个称号
        </Text>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View style={[
            styles.progressBarFill,
            {
              backgroundColor: colors.primary,
              width: `${Math.round((unlockedTitles.length / ALL_TITLES.length) * 100)}%` as any,
            },
          ]} />
        </View>
      </View>

      {/* 筛选 Tab */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setFilter(tab.key)}
            style={({ pressed }) => [
              styles.filterTab,
              filter === tab.key && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[
              styles.filterTabText,
              { color: filter === tab.key ? colors.primary : colors.muted },
            ]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 称号列表 */}
      <FlatList
        data={filteredTitles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { backgroundColor: colors.surface, paddingBottom: safeBottom + 16 },
        ]}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔒</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {filter === "unlocked" ? "还没有解锁任何称号，继续加油！" : "全部称号已解锁，太厉害了！"}
            </Text>
          </View>
        }
      />
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
    borderBottomWidth: 0.5,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: 60,
  },
  backText: { fontSize: 16, marginLeft: 2 },
  navTitle: { fontSize: 17, fontWeight: "600" },
  progressBanner: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 8,
  },
  progressText: { fontSize: 14, fontWeight: "600" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 4,
  },
  filterRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
  },
  filterTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: { height: 0.5, marginHorizontal: 16 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  titleRowLocked: { opacity: 0.65 },
  emojiBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  titleName: { fontSize: 15, fontWeight: "600", flex: 1 },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: { fontSize: 11, fontWeight: "700" },
  titleDesc: { fontSize: 12, lineHeight: 17 },
  checkMark: { fontSize: 16, fontWeight: "700", marginLeft: 4 },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, textAlign: "center" },
});
