import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, Switch, FlatList,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColors } from "@/hooks/use-colors";
import { WorkoutStore } from "@/lib/store/workout-store";
import { ScreenContainer } from "@/components/screen-container";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ALL_TITLES, getUnlockedTitles, getCurrentTitle, getNextTitle,
  buildTitleStats, type Title,
} from "@/lib/data/titles";

const NICKNAME_KEY = "@neckcare_nickname";

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

export default function ProfileScreen() {
  const colors = useColors();

  const [nickname] = useState("颈椎健康达人");
  const [airpodsEnabled, setAirpodsEnabled] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [stats, setStats] = useState({ totalDays: 0, totalSeconds: 0, totalSessions: 0 });
  const [titleStats, setTitleStats] = useState(() =>
    buildTitleStats({ totalDays: 0, totalSeconds: 0, totalSessions: 0 }, 0, 0, 0, 0, 0, 0, 0, 0, 0)
  );
  const [showAllTitles, setShowAllTitles] = useState(false);

  const loadData = useCallback(async () => {
    const [s, totalReps, maxAngle, streakInfo, timeSlots, diffCounts] = await Promise.all([
      WorkoutStore.getTotalStats(),
      WorkoutStore.getTotalReps(),
      WorkoutStore.getMaxAngle(),
      WorkoutStore.getStreakInfo(),
      WorkoutStore.getTimeSlotCounts(),
      WorkoutStore.getDifficultyCounts(),
    ]);
    setStats(s);
    setTitleStats(buildTitleStats(
      s, totalReps, maxAngle,
      streakInfo.streakDays, streakInfo.maxStreak,
      timeSlots.morningCount, timeSlots.nightCount,
      diffCounts.lightCount, diffCounts.moderateCount, diffCounts.intenseCount,
    ));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const unlockedTitles = getUnlockedTitles(titleStats);
  const currentTitle = getCurrentTitle(titleStats);
  const nextTitle = getNextTitle(titleStats);
  const displayTitles = showAllTitles ? ALL_TITLES : ALL_TITLES.slice(0, 8);

  const settingRow = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: (v: boolean) => void,
    desc?: string
  ) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
          {desc && <Text style={[styles.settingDesc, { color: colors.muted }]}>{desc}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + "80" }}
        thumbColor={value ? colors.primary : colors.muted}
      />
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-primary">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{currentTitle.emoji}</Text>
          </View>
          <Text style={styles.nicknameText}>{nickname}</Text>
          {/* 当前称号 */}
          <View style={[styles.currentTitleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={[styles.currentTitleTier, { color: TIER_COLOR[currentTitle.tier] }]}>
              {TIER_LABEL[currentTitle.tier]}
            </Text>
            <Text style={styles.currentTitleName}>{currentTitle.name}</Text>
          </View>
          <Text style={styles.currentTitleFlavor}>{currentTitle.flavor}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>累计数据</Text>
          <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{stats.totalDays}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>坚持天数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{stats.totalSessions}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>锻炼次数</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {Math.round(stats.totalSeconds / 60)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>总分钟数</Text>
            </View>
          </View>
        </View>

        {/* ── 称号系统 ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              称号收集 {unlockedTitles.length}/{ALL_TITLES.length}
            </Text>
            <Pressable onPress={() => setShowAllTitles((v) => !v)}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {showAllTitles ? "收起" : "查看全部"}
              </Text>
            </Pressable>
          </View>

          {/* 下一个即将解锁 */}
          {nextTitle && (
            <View style={[styles.nextTitleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.nextTitleLabel}>🎯 距离下一个称号</Text>
              <View style={styles.nextTitleRow}>
                <Text style={styles.nextTitleEmoji}>{nextTitle.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nextTitleName, { color: colors.foreground }]}>{nextTitle.name}</Text>
                  <Text style={[styles.nextTitleDesc, { color: colors.muted }]}>{nextTitle.description}</Text>
                </View>
                <View style={[styles.tierBadge, { backgroundColor: TIER_COLOR[nextTitle.tier] + "20" }]}>
                  <Text style={[styles.tierBadgeText, { color: TIER_COLOR[nextTitle.tier] }]}>
                    {TIER_LABEL[nextTitle.tier]}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 称号列表 */}
          <View style={[styles.titlesGrid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {displayTitles.map((title, idx) => {
              const isUnlocked = unlockedTitles.some((u) => u.id === title.id);
              return (
                <View key={title.id}>
                  {idx > 0 && <View style={[styles.titleDivider, { backgroundColor: colors.border }]} />}
                  <View style={[styles.titleRow, !isUnlocked && styles.titleRowLocked]}>
                    <View style={[
                      styles.titleEmojiBox,
                      {
                        backgroundColor: isUnlocked
                          ? TIER_COLOR[title.tier] + "20"
                          : colors.border + "40",
                      },
                    ]}>
                      <Text style={[styles.titleEmoji, { opacity: isUnlocked ? 1 : 0.3 }]}>
                        {title.emoji}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.titleNameRow}>
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
                            styles.tierBadgeText,
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
                      <Text style={[styles.titleUnlockedMark, { color: colors.success }]}>✓</Text>
                    )}
                  </View>
                </View>
              );
            })}
            {!showAllTitles && ALL_TITLES.length > 8 && (
              <Pressable
                onPress={() => setShowAllTitles(true)}
                style={[styles.showMoreBtn, { borderTopColor: colors.border }]}
              >
                <Text style={[styles.showMoreText, { color: colors.primary }]}>
                  还有 {ALL_TITLES.length - 8} 个称号待探索 →
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── AirPods Status ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AirPods 运动传感器</Text>
          <View style={[styles.airpodsCard, {
            backgroundColor: airpodsEnabled ? colors.primary + "12" : colors.surface,
            borderColor: airpodsEnabled ? colors.primary + "40" : colors.border,
          }]}>
            <View style={styles.airpodsTop}>
              <Text style={styles.airpodsIcon}>{airpodsEnabled ? "🎧" : "🎵"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.airpodsTitle, { color: colors.foreground }]}>
                  {airpodsEnabled ? "AirPods 已连接" : "未检测到 AirPods"}
                </Text>
                <Text style={[styles.airpodsDesc, { color: colors.muted }]}>
                  {airpodsEnabled
                    ? "将使用 AirPods 陀螺仪记录精准头部运动数据"
                    : "连接 AirPods Pro 或 AirPods Max 以获得精准运动追踪"}
                </Text>
              </View>
              <Switch
                value={airpodsEnabled}
                onValueChange={setAirpodsEnabled}
                trackColor={{ false: colors.border, true: colors.primary + "80" }}
                thumbColor={airpodsEnabled ? colors.primary : colors.muted}
              />
            </View>
            <View style={[styles.airpodsFeatures, { borderTopColor: airpodsEnabled ? colors.primary + "20" : colors.border }]}>
              {["精准俯仰角检测", "头部旋转追踪", "活动度分析报告"].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Text style={[styles.featureCheck, { color: airpodsEnabled ? colors.primary : colors.error }]}>
                    {airpodsEnabled ? "✓" : "✗"}
                  </Text>
                  <Text style={[styles.featureText, { color: colors.muted, opacity: airpodsEnabled ? 1 : 0.5 }]}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Settings ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>设置</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {settingRow("🔔", "每日锻炼提醒", notifyEnabled, setNotifyEnabled, "每天提醒你进行颈椎锻炼")}
            {settingRow("🎧", "AirPods 运动追踪", airpodsEnabled, setAirpodsEnabled, "使用 AirPods 陀螺仪记录头部运动")}
          </View>
        </View>

        {/* ── About ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>关于</Text>
          <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              ["应用版本", "1.0.0"],
              ["课程数量", "6 套课程"],
              ["健康贴士", "60 条"],
              ["称号数量", `${ALL_TITLES.length} 个`],
              ["传感器支持", "陀螺仪 + AirPods"],
            ].map(([label, value], idx, arr) => (
              <View key={label}>
                <View style={styles.aboutRow}>
                  <Text style={[styles.aboutLabel, { color: colors.muted }]}>{label}</Text>
                  <Text style={[styles.aboutValue, { color: colors.foreground }]}>{value}</Text>
                </View>
                {idx < arr.length - 1 && <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={[styles.disclaimer, { backgroundColor: colors.warning + "12", borderColor: colors.warning + "30" }]}>
          <Text style={styles.disclaimerIcon}>⚠️</Text>
          <Text style={[styles.disclaimerText, { color: colors.muted }]}>
            本应用仅供辅助锻炼参考，不构成医疗建议。如有严重颈椎问题，请咨询专业医生。
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 10,
  },
  avatarEmoji: { fontSize: 36 },
  nicknameText: { fontSize: 20, fontWeight: "700", color: "#fff" },
  currentTitleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  currentTitleTier: { fontSize: 11, fontWeight: "800" },
  currentTitleName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  currentTitleFlavor: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: "500" },
  statsCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    justifyContent: "space-around",
  },
  statItem: { alignItems: "center" },
  statNum: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 40, alignSelf: "center" },

  // 称号系统
  nextTitleCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  nextTitleLabel: { fontSize: 12, color: "#FF9500", fontWeight: "600", marginBottom: 8 },
  nextTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nextTitleEmoji: { fontSize: 28 },
  nextTitleName: { fontSize: 15, fontWeight: "700" },
  nextTitleDesc: { fontSize: 12, marginTop: 2 },
  titlesGrid: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  titleRowLocked: { opacity: 0.55 },
  titleDivider: { height: 1, marginHorizontal: 14 },
  titleEmojiBox: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  titleEmoji: { fontSize: 22 },
  titleNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  titleName: { fontSize: 14, fontWeight: "700" },
  titleDesc: { fontSize: 11, lineHeight: 16 },
  titleUnlockedMark: { fontSize: 16, fontWeight: "800" },
  tierBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierBadgeText: { fontSize: 10, fontWeight: "800" },
  showMoreBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 1,
  },
  showMoreText: { fontSize: 13, fontWeight: "600" },

  // AirPods
  airpodsCard: { borderRadius: 16, padding: 14, borderWidth: 1 },
  airpodsTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  airpodsIcon: { fontSize: 28 },
  airpodsTitle: { fontSize: 15, fontWeight: "600" },
  airpodsDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  airpodsFeatures: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureCheck: { fontSize: 14, fontWeight: "700" },
  featureText: { fontSize: 13 },

  // Settings
  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  settingDesc: { fontSize: 12, marginTop: 1 },

  // About
  aboutCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: "500" },
  aboutDivider: { height: 1, marginHorizontal: 16 },

  // Disclaimer
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    margin: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  disclaimerIcon: { fontSize: 16 },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
