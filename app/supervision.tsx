import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenContainer } from "@/components/screen-container";
import { useAmbientStream } from "@/hooks/use-ambient-stream";
import { useColors } from "@/hooks/use-colors";
import { useHeadphoneMotion } from "@/hooks/use-headphone-motion";
import { useSupervisionAlertAudio } from "@/hooks/use-supervision-alert-audio";
import { PostureCalibration, PostureDailyRecord, PostureStore } from "@/lib/store/posture-store";

const LOW_HEAD_DROP_THRESHOLD = 20;
const RESET_AFTER_UPRIGHT_SECONDS = 10;
const ALERT_MILESTONE_SECONDS = [60, 180, 300, 600] as const;
const STREAM_VOLUME_LEVELS = [
  { label: "关", value: 0 },
  { label: "轻", value: 0.01 },
  { label: "中", value: 0.65 },
  { label: "高", value: 0.9 },
];

function isLowHeadPitch(pitch: number, baselinePitch: number | null) {
  return baselinePitch !== null && pitch <= baselinePitch - LOW_HEAD_DROP_THRESHOLD;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export default function SupervisionScreen() {
  const router = useRouter();
  const colors = useColors();
  const [enabled, setEnabled] = useState(false);
  const [streamVolumeIndex, setStreamVolumeIndex] = useState(2);
  const [calibration, setCalibration] = useState<PostureCalibration | null>(null);
  const [todayRecord, setTodayRecord] = useState<PostureDailyRecord>({
    date: "",
    monitorSeconds: 0,
    lowHeadSeconds: 0,
    alertCount: 0,
  });
  const [lowHeadStreak, setLowHeadStreak] = useState(0);
  const lowHeadStreakRef = useRef(0);
  const uprightStreakRef = useRef(0);
  const motionStateRef = useRef({ available: false, pitch: 0, baselinePitch: null as number | null });
  const { available, supported, worn, liveAngles } = useHeadphoneMotion(true);
  const { playAlert } = useSupervisionAlertAudio();
  const streamVolume = STREAM_VOLUME_LEVELS[streamVolumeIndex];
  const ambientEnabled = worn && streamVolume.value > 0;

  useAmbientStream(ambientEnabled, streamVolume.value);

  const baselinePitch = calibration?.baselinePitch ?? null;
  const lowHeadThreshold = baselinePitch === null ? null : baselinePitch - LOW_HEAD_DROP_THRESHOLD;
  const canSupervise = supported && worn && available && baselinePitch !== null;
  const supervisionActive = enabled && canSupervise;
  const isLowHead = supervisionActive && isLowHeadPitch(liveAngles.pitch, baselinePitch);
  const lowHeadRatio = todayRecord.monitorSeconds > 0
    ? Math.round((todayRecord.lowHeadSeconds / todayRecord.monitorSeconds) * 100)
    : 0;

  const status = useMemo(() => {
    if (!supported) return { title: "未检测到支持头动的 AirPods，监督暂停", tone: "#9CA3AF" };
    if (!worn) return { title: "请佩戴 AirPods 开始监督", tone: "#F59E0B" };
    if (baselinePitch === null) return { title: "请先抬头挺胸并校准标准姿势", tone: "#F59E0B" };
    if (!enabled || !available) return { title: "监督已暂停", tone: "#9CA3AF" };
    if (isLowHead) return { title: "检测到低头，请抬头放松", tone: "#FF5A7A" };
    return { title: "姿势良好，继续保持", tone: "#4ECBA0" };
  }, [available, baselinePitch, enabled, isLowHead, supported, worn]);

  useEffect(() => {
    Promise.all([PostureStore.getToday(), PostureStore.getCalibration()]).then(([record, savedCalibration]) => {
      setTodayRecord(record);
      setCalibration(savedCalibration);
      setEnabled(Boolean(savedCalibration));
    });
  }, []);

  useEffect(() => {
    motionStateRef.current = { available, pitch: liveAngles.pitch, baselinePitch };
  }, [available, baselinePitch, liveAngles.pitch]);

  useEffect(() => {
    if (!supervisionActive) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      const { available: currentAvailable, pitch, baselinePitch: currentBaselinePitch } = motionStateRef.current;
      const low = currentAvailable && isLowHeadPitch(pitch, currentBaselinePitch);
      const nextUprightStreak = low ? 0 : uprightStreakRef.current + 1;
      const nextStreak = low
        ? lowHeadStreakRef.current + 1
        : nextUprightStreak >= RESET_AFTER_UPRIGHT_SECONDS
          ? 0
          : lowHeadStreakRef.current;
      const shouldAlert = ALERT_MILESTONE_SECONDS.includes(nextStreak as typeof ALERT_MILESTONE_SECONDS[number]);
      uprightStreakRef.current = nextUprightStreak;
      lowHeadStreakRef.current = nextStreak;
      setLowHeadStreak(nextStreak);
      if (shouldAlert) {
        playAlert(nextStreak as typeof ALERT_MILESTONE_SECONDS[number]);
      }
      const nextRecord = await PostureStore.addToday({
        monitorSeconds: 1,
        lowHeadSeconds: low ? 1 : 0,
        alertCount: shouldAlert ? 1 : 0,
      });
      if (!stopped) {
        setTodayRecord(nextRecord);
        timer = setTimeout(tick, 1000);
      }
    };

    timer = setTimeout(tick, 1000);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [playAlert, supervisionActive]);

  const toggleEnabled = useCallback(() => {
    if (baselinePitch === null || !supported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEnabled((value) => !value);
  }, [baselinePitch, supported]);

  const calibratePosture = useCallback(async () => {
    if (!available) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const nextCalibration = await PostureStore.saveCalibration(liveAngles.pitch);
    lowHeadStreakRef.current = 0;
    uprightStreakRef.current = 0;
    setLowHeadStreak(0);
    setCalibration(nextCalibration);
    setEnabled(true);
  }, [available, liveAngles.pitch]);

  const cycleStreamVolume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStreamVolumeIndex((value) => (value + 1) % STREAM_VOLUME_LEVELS.length);
  }, []);

  return (
    <ScreenContainer containerClassName="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#FF6B8A", "#FF9BAD", "#FFD6DF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <Text style={styles.eyebrow}>AirPods 头部监督</Text>
          <Text style={styles.title}>低头监督模式</Text>
          <Text style={styles.subtitle}>溪流白噪音会随 AirPods 佩戴状态自动暂停和恢复，监督会记录当前页面内的低头时长。</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: status.tone }]}>
            <View style={[styles.statusDot, { backgroundColor: status.tone }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>{status.title}</Text>
              <Text style={[styles.statusMeta, { color: colors.muted }]}>
                俯仰 {liveAngles.pitch.toFixed(1)}° · 偏航 {liveAngles.yaw.toFixed(1)}° · 横滚 {liveAngles.roll.toFixed(1)}°
              </Text>
            </View>
          </View>

          <View style={[styles.calibrationCard, { backgroundColor: colors.surface, borderColor: "#FFD6DF" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.calibrationTitle, { color: colors.foreground }]}>标准姿势校准</Text>
              <Text style={[styles.calibrationDesc, { color: colors.muted }]}>
                抬头挺胸后点击校准。当前低头线：
                {lowHeadThreshold === null ? "未校准" : `${lowHeadThreshold.toFixed(1)}°`}
              </Text>
            </View>
            <Pressable
              onPress={calibratePosture}
              disabled={!available}
              style={({ pressed }) => [
                styles.calibrationButton,
                { backgroundColor: available ? "#FF6B8A" : "#E5E7EB" },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.calibrationButtonText, { color: available ? "#fff" : "#9CA3AF" }]}>
                {baselinePitch === null ? "校准" : "重新校准"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={toggleEnabled}
              disabled={baselinePitch === null || !supported}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: baselinePitch === null || !supported ? "#E5E7EB" : supervisionActive ? "#FFE8ED" : "#FF6B8A" },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.primaryButtonText, { color: baselinePitch === null || !supported ? "#9CA3AF" : supervisionActive ? "#FF5A7A" : "#fff" }]}>
                {supervisionActive ? "监督中" : "监督暂停"}
              </Text>
            </Pressable>
            <View style={styles.secondaryButtonWrap}>
              <Pressable
                onPress={cycleStreamVolume}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  { borderColor: "#FFD6DF", backgroundColor: colors.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryButtonText}>白噪音 {streamVolume.label}</Text>
              </Pressable>
              {streamVolume.value === 0 && (
                <Text style={[styles.secondaryHint, { color: colors.muted }]}>
                  *关闭白噪音时切换到后台监督会暂停
                </Text>
              )}
            </View>
          </View>

          <View style={styles.metricGrid}>
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.metricIcon}>⏱</Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {formatDuration(todayRecord.monitorSeconds)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>今日监督</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.metricIcon}>↘</Text>
              <Text style={[styles.metricValue, { color: "#FF5A7A" }]}>
                {formatDuration(todayRecord.lowHeadSeconds)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>低头时间</Text>
            </View>
            <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
              <Text style={styles.metricIcon}>🔔</Text>
              <Text style={[styles.metricValue, { color: "#A78BFA" }]}>{todayRecord.alertCount}</Text>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>提醒次数</Text>
            </View>
          </View>

          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, { color: colors.foreground }]}>今日低头占比</Text>
              <Text style={styles.progressValue}>{lowHeadRatio}%</Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${Math.min(lowHeadRatio, 100)}%` }]} />
            </View>
            <Text style={[styles.progressHint, { color: colors.muted }]}>
              低于标准姿势 {LOW_HEAD_DROP_THRESHOLD}° 后，会在连续低头 1、5、10 分钟时提醒；抬头保持 10 秒后重新计时。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.24)",
    marginBottom: 18,
  },
  closeText: { color: "#fff", fontSize: 32, lineHeight: 34 },
  eyebrow: { color: "rgba(255,255,255,0.86)", fontSize: 13, fontWeight: "700", marginBottom: 8 },
  title: { color: "#fff", fontSize: 30, fontWeight: "900", marginBottom: 8 },
  subtitle: { color: "rgba(255,255,255,0.92)", fontSize: 14, lineHeight: 22, maxWidth: 320 },
  content: {
    flex: 1,
    marginTop: -18,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFF7F9",
    padding: 16,
    gap: 14,
  },
  statusCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  statusTitle: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  statusMeta: { fontSize: 12, lineHeight: 18 },
  calibrationCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calibrationTitle: { fontSize: 16, fontWeight: "800", marginBottom: 5 },
  calibrationDesc: { fontSize: 12, lineHeight: 18 },
  calibrationButton: {
    minWidth: 86,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  calibrationButtonText: { fontSize: 14, fontWeight: "800" },
  actionRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { fontSize: 15, fontWeight: "800" },
  secondaryButtonWrap: { flex: 1, gap: 5 },
  secondaryButton: {
    height: 50,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { fontSize: 15, fontWeight: "800", color: "#FF5A7A" },
  secondaryHint: { fontSize: 10, lineHeight: 14, paddingHorizontal: 4 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  metricGrid: { flexDirection: "row", gap: 10 },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  metricIcon: { fontSize: 20 },
  metricValue: { fontSize: 20, fontWeight: "900" },
  metricLabel: { fontSize: 11 },
  progressCard: { borderRadius: 20, padding: 16, gap: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressTitle: { fontSize: 16, fontWeight: "800" },
  progressValue: { fontSize: 18, fontWeight: "900", color: "#FF5A7A" },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: "#FF6B8A" },
  progressHint: { fontSize: 12, lineHeight: 18 },
});
