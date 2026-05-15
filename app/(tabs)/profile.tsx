import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, StyleSheet, Switch,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useColors } from "@/hooks/use-colors";
import { WorkoutStore } from "@/lib/store/workout-store";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NICKNAME_KEY = "@neckcare_nickname";

export default function ProfileScreen() {
  const colors = useColors();
  const colorScheme = useColorScheme();

  const [nickname, setNickname] = useState("颈椎健康达人");
  const [airpodsEnabled, setAirpodsEnabled] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [stats, setStats] = useState({ totalDays: 0, totalSeconds: 0, totalSessions: 0 });

  const loadData = useCallback(async () => {
    const [s, name] = await Promise.all([
      WorkoutStore.getTotalStats(),
      AsyncStorage.getItem(NICKNAME_KEY),
    ]);
    setStats(s);
    if (name) setNickname(name);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const DIFFICULTY_LABEL: Record<string, string> = { light: "轻度", moderate: "中度", intense: "重度" };

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
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🧑‍💻</Text>
          </View>
          <Text style={styles.nicknameText}>{nickname}</Text>
          <Text style={styles.headerSub}>颈椎健康守护者</Text>
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
                  <Text style={[styles.featureText, { color: airpodsEnabled ? colors.muted : colors.muted, opacity: airpodsEnabled ? 1 : 0.5 }]}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Settings ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>设置</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {settingRow(
              "🔔", "每日锻炼提醒", notifyEnabled, setNotifyEnabled,
              "每天提醒你进行颈椎锻炼"
            )}
            {settingRow(
              "🎧", "AirPods 运动追踪", airpodsEnabled, setAirpodsEnabled,
              "使用 AirPods 陀螺仪记录头部运动"
            )}
          </View>
        </View>

        {/* ── About ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>关于</Text>
          <View style={[styles.aboutCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.muted }]}>应用版本</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>1.0.0</Text>
            </View>
            <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.muted }]}>课程数量</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>6 套课程</Text>
            </View>
            <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.muted }]}>健康贴士</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>30 条</Text>
            </View>
            <View style={[styles.aboutDivider, { backgroundColor: colors.border }]} />
            <View style={styles.aboutRow}>
              <Text style={[styles.aboutLabel, { color: colors.muted }]}>传感器支持</Text>
              <Text style={[styles.aboutValue, { color: colors.foreground }]}>陀螺仪 + AirPods</Text>
            </View>
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
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
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
  airpodsCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  airpodsTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  airpodsIcon: { fontSize: 28 },
  airpodsTitle: { fontSize: 15, fontWeight: "600" },
  airpodsDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  airpodsFeatures: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, gap: 6 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureCheck: { fontSize: 14, fontWeight: "700" },
  featureText: { fontSize: 13 },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
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
  aboutCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
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
