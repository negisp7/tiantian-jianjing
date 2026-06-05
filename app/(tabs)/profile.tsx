import React, { useState, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, Switch, Modal, TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";
import { WorkoutStore } from "@/lib/store/workout-store";
import { ScreenContainer } from "@/components/screen-container";
import { useHeadphoneMotion } from "@/hooks/use-headphone-motion";
import { LinearGradient } from "expo-linear-gradient";
import {
  ALL_TITLES, getUnlockedTitles, getCurrentTitle, getNextTitle,
  buildTitleStats, type Title,
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
const NICKNAME_KEY = "@neckcare_nickname";
const DEFAULT_NICKNAME = "天天肩颈用户";

const TIER_GRADIENT: Record<Title["tier"], [string, string]> = {
  bronze: ["#CD7F32", "#A0522D"],
  silver: ["#C0C0C0", "#808080"],
  gold: ["#FFD700", "#FFA500"],
  platinum: ["#E5E4E2", "#B0B0B0"],
  special: ["#9B59B6", "#6C3483"],
};

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 16) + 72;

  const [nickname, setNickname] = useState(DEFAULT_NICKNAME);
  const [nicknameDraft, setNicknameDraft] = useState(DEFAULT_NICKNAME);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const {
    available: airpodsEnabled,
    supported: airpodsMotionSupported,
    worn: headphonesWorn,
  } = useHeadphoneMotion(true);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [stats, setStats] = useState({ totalDays: 0, totalSeconds: 0, totalSessions: 0 });
  const [titleStats, setTitleStats] = useState(() =>
    buildTitleStats({ totalDays: 0, totalSeconds: 0, totalSessions: 0 }, 0, 0, 0, 0, 0, 0, 0, 0, 0)
  );

  const loadData = useCallback(async () => {
    const [savedNickname, s, totalReps, maxAngle, streakInfo, timeSlots, diffCounts] = await Promise.all([
      AsyncStorage.getItem(NICKNAME_KEY),
      WorkoutStore.getTotalStats(),
      WorkoutStore.getTotalReps(),
      WorkoutStore.getMaxAngle(),
      WorkoutStore.getStreakInfo(),
      WorkoutStore.getTimeSlotCounts(),
      WorkoutStore.getDifficultyCounts(),
    ]);
    const nextNickname = savedNickname?.trim() || DEFAULT_NICKNAME;
    setNickname(nextNickname);
    setNicknameDraft(nextNickname);
    setStats(s);
    setTitleStats(buildTitleStats(
      s, totalReps, maxAngle,
      streakInfo.streakDays, streakInfo.maxStreak,
      timeSlots.morningCount, timeSlots.nightCount,
      diffCounts.lightCount, diffCounts.moderateCount, diffCounts.intenseCount,
    ));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const unlockedTitles = getUnlockedTitles(titleStats);
  const currentTitle = getCurrentTitle(titleStats);
  const nextTitle = getNextTitle(titleStats);

  const openNicknameEditor = () => {
    setNicknameDraft(nickname);
    setIsEditingNickname(true);
  };

  const saveNickname = async () => {
    const nextNickname = nicknameDraft.trim() || DEFAULT_NICKNAME;
    setNickname(nextNickname);
    setNicknameDraft(nextNickname);
    setIsEditingNickname(false);
    await AsyncStorage.setItem(NICKNAME_KEY, nextNickname);
  };

  const settingRow = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: (v: boolean) => void,
    desc?: string,
    disabled = false,
  ) => (
    <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
          {desc && <Text style={[styles.settingDesc, { color: colors.muted }]}>{desc}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: "#FF9BAD" }}
        thumbColor={value ? "#FF6B8A" : colors.muted}
      />
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Gradient Header ── */}
        <LinearGradient
          colors={["#A78BFA", "#C4B5FD", "#DDD6FE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* 装饰气泡 */}
          <View style={[styles.bubble, styles.bubble1]} />
          <View style={[styles.bubble, styles.bubble2]} />

          {/* 头像 */}
          <View style={styles.avatarOuter}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmoji}>{currentTitle.emoji}</Text>
            </View>
          </View>
          <Pressable
            onPress={openNicknameEditor}
            style={({ pressed }) => [styles.nicknameButton, pressed && { opacity: 0.75 }]}
          >
            <Text style={styles.nicknameText}>{nickname}</Text>
          </Pressable>
          {/* 当前称号 */}
          <LinearGradient
            colors={TIER_GRADIENT[currentTitle.tier]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.currentTitleBadge}
          >
            <Text style={styles.currentTitleTier}>{TIER_LABEL[currentTitle.tier]}</Text>
            <Text style={styles.currentTitleName}>{currentTitle.name}</Text>
          </LinearGradient>

          <Text style={styles.currentTitleFlavor}>{currentTitle.flavor}</Text>
        </LinearGradient>

        {/* ── Content ── */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>

          {/* ── Stats ── */}
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>📈</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>累计数据</Text>
            </View>
            <View style={styles.statsRow}>
              {[
                { icon: "🔥", num: stats.totalDays, label: "坚持天数", colors: ["#FF6B8A", "#FF4D70"] as [string, string] },
                { icon: "🏃", num: stats.totalSessions, label: "锻炼次数", colors: ["#4ECBA0", "#2DB88A"] as [string, string] },
                { icon: "⏱️", num: Math.round(stats.totalSeconds / 60), label: "总分钟", colors: ["#A78BFA", "#8B5CF6"] as [string, string] },
              ].map((item) => (
                <LinearGradient
                  key={item.label}
                  colors={item.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCard}
                >
                  <Text style={styles.statCardIcon}>{item.icon}</Text>
                  <Text style={styles.statCardNum}>{item.num}</Text>
                  <Text style={styles.statCardLabel}>{item.label}</Text>
                </LinearGradient>
              ))}
            </View>
          </View>

          {/* ── 称号系统 ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <View style={styles.titleSectionHeading}>
                <Text style={styles.sectionEmoji}>🏆</Text>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  称号收集 {unlockedTitles.length}/{ALL_TITLES.length}
                </Text>
              </View>
              <Pressable
                onPress={() => router.push("/titles")}
                style={({ pressed }) => [styles.seeAllBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.seeAllText}>查看全部 →</Text>
              </Pressable>
            </View>

            {/* 下一个即将解锁 */}
            {nextTitle && (
              <View style={[styles.nextTitleCard, { backgroundColor: colors.surface, shadowColor: TIER_COLOR[nextTitle.tier] }]}>
                <Text style={[styles.nextTitleHint, { color: colors.muted }]}>🎯 距离下一个称号</Text>
                <View style={styles.nextTitleRow}>
                  <View style={[styles.nextTitleEmojiBox, { backgroundColor: TIER_COLOR[nextTitle.tier] + "20" }]}>
                    <Text style={styles.nextTitleEmoji}>{nextTitle.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.nextTitleName, { color: colors.foreground }]}>{nextTitle.name}</Text>
                    <Text style={[styles.nextTitleDesc, { color: colors.muted }]}>{nextTitle.description}</Text>
                  </View>
                  <LinearGradient
                    colors={TIER_GRADIENT[nextTitle.tier]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.tierBadge}
                  >
                    <Text style={styles.tierBadgeText}>{TIER_LABEL[nextTitle.tier]}</Text>
                  </LinearGradient>
                </View>
              </View>
            )}

            {/* 未解锁时提示 */}
            {unlockedTitles.length === 0 && (
              <View style={[styles.emptyTitles, { backgroundColor: "#FFF0F3", borderColor: "#FFD6DF" }]}>
                <Text style={styles.emptyEmoji}>🔒</Text>
                <Text style={[styles.emptyText, { color: colors.muted }]}>完成第一次锻炼，解锁你的第一个称号！</Text>
              </View>
            )}
          </View>

          {/* ── AirPods Status ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>🎧</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AirPods 运动传感器</Text>
            </View>
            <View style={[styles.airpodsCard, {
              backgroundColor: airpodsEnabled ? "#F0F0FF" : colors.surface,
              borderColor: airpodsEnabled ? "#A78BFA40" : colors.border,
            }]}>
              <View style={styles.airpodsTop}>
                <View style={[styles.airpodsIconBox, { backgroundColor: airpodsEnabled ? "#A78BFA20" : colors.border + "40" }]}>
                  <Text style={styles.airpodsIcon}>{airpodsEnabled ? "🎧" : "🎵"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.airpodsTitle, { color: colors.foreground }]}>
                    {airpodsEnabled
                      ? "AirPods 运动传感器已启用"
                      : airpodsMotionSupported
                        ? "请佩戴支持头动的 AirPods"
                        : headphonesWorn
                          ? "当前耳机不支持头动传感器"
                          : "未检测到支持头动的 AirPods"}
                  </Text>
                  <Text style={[styles.airpodsDesc, { color: colors.muted }]}>
                    {airpodsEnabled
                      ? "将使用 AirPods 头动传感器记录精准头部运动数据"
                      : "仅支持带头部运动传感器的苹果耳机，普通蓝牙耳机不会启用运动追踪"}
                  </Text>
                </View>
                <Switch
                  value={airpodsEnabled}
                  disabled
                  trackColor={{ false: colors.border, true: "#C4B5FD" }}
                  thumbColor={airpodsEnabled ? "#A78BFA" : colors.muted}
                />
              </View>
              <View style={[styles.airpodsFeatures, { borderTopColor: airpodsEnabled ? "#A78BFA20" : colors.border }]}>
                {["精准俯仰角检测", "头部旋转追踪", "活动度分析报告"].map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Text style={[styles.featureCheck, { color: airpodsEnabled ? "#A78BFA" : colors.error }]}>
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
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>⚙️</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>设置</Text>
            </View>
            <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {settingRow("🔔", "每日锻炼提醒", notifyEnabled, setNotifyEnabled, "每天提醒你进行颈椎锻炼")}
              {settingRow("🎧", "AirPods 运动追踪", airpodsEnabled, () => {}, "根据支持头动的 AirPods 佩戴状态自动切换", true)}
            </View>
          </View>

          {/* ── About ── */}
          <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionEmoji}>ℹ️</Text>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>关于</Text>
            </View>
            <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                ["应用版本", "1.0.0"],
                ["课程数量", "6 套课程"],
                ["健康贴士", "60 条"],
                ["称号数量", `${ALL_TITLES.length} 个`],
                ["传感器支持", "AirPods 头动传感器"],
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
          <View style={[styles.disclaimer, { backgroundColor: "#FFF8E1", borderColor: "#FFE082" }]}>
            <Text style={styles.disclaimerIcon}>⚠️</Text>
            <Text style={[styles.disclaimerText, { color: "#8B6914" }]}>
              本应用仅供辅助锻炼参考，不构成医疗建议。如有严重颈椎问题，请咨询专业医生。
            </Text>
          </View>

        </View>
      </ScrollView>

      <Modal
        visible={isEditingNickname}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditingNickname(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.nicknameModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>修改昵称</Text>
            <TextInput
              value={nicknameDraft}
              onChangeText={setNicknameDraft}
              autoFocus
              maxLength={16}
              placeholder="输入昵称"
              placeholderTextColor={colors.muted}
              returnKeyType="done"
              onSubmitEditing={saveNickname}
              style={[styles.nicknameInput, {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.background,
              }]}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsEditingNickname(false)}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.background }, pressed && { opacity: 0.75 }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>取消</Text>
              </Pressable>
              <Pressable
                onPress={saveNickname}
                style={({ pressed }) => [styles.modalBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.modalSaveText}>保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingVertical: 32,
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
  avatarOuter: {
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#A78BFA",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarInner: {
    width: 76, height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: { fontSize: 40 },
  nicknameButton: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 30,
    paddingHorizontal: 12,
  },
  nicknameText: { fontSize: 20, fontWeight: "800", color: "#fff" },
  currentTitleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  currentTitleTier: { fontSize: 12, fontWeight: "800", color: "#fff" },
  currentTitleName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  currentTitleFlavor: { fontSize: 12, color: "rgba(255,255,255,0.8)", textAlign: "center" },
  content: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 4,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  titleSectionHeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  sectionEmoji: { fontSize: 18, marginRight: 6 },
  sectionTitle: { fontSize: 17, fontWeight: "700", flex: 1 },
  seeAllBtn: {
    flexShrink: 0,
    backgroundColor: "#FFE8ED",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  seeAllText: { fontSize: 13, color: "#FF6B8A", fontWeight: "600" },
  // Stats
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statCardIcon: { fontSize: 24 },
  statCardNum: { fontSize: 24, fontWeight: "900", color: "#fff" },
  statCardLabel: { fontSize: 11, color: "rgba(255,255,255,0.9)", fontWeight: "600" },
  // Next Title
  nextTitleCard: {
    borderRadius: 18,
    padding: 14,
    gap: 8,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  nextTitleHint: { fontSize: 12, fontWeight: "500" },
  nextTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  nextTitleEmojiBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  nextTitleEmoji: { fontSize: 28 },
  nextTitleName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  nextTitleDesc: { fontSize: 12, lineHeight: 17 },
  tierBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  tierBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  emptyTitles: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  // AirPods
  airpodsCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  airpodsTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  airpodsIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  airpodsIcon: { fontSize: 26 },
  airpodsTitle: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  airpodsDesc: { fontSize: 12, lineHeight: 17 },
  airpodsFeatures: {
    borderTopWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureCheck: { fontSize: 14, fontWeight: "700", width: 16 },
  featureText: { fontSize: 13 },
  // Settings
  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  settingIcon: { fontSize: 20 },
  settingLabel: { fontSize: 15, fontWeight: "500" },
  settingDesc: { fontSize: 12, marginTop: 2 },
  // About
  aboutCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  aboutLabel: { fontSize: 14 },
  aboutValue: { fontSize: 14, fontWeight: "500" },
  aboutDivider: { height: 0.5, marginHorizontal: 16 },
  // Disclaimer
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    margin: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  disclaimerIcon: { fontSize: 16 },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  nicknameModal: {
    width: "100%",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 14 },
  nicknameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 12,
  },
  modalCancelText: { fontSize: 15, fontWeight: "700" },
  modalSaveText: { fontSize: 15, fontWeight: "800", color: "#fff" },
});
