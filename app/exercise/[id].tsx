import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedProps, withTiming, Easing,
} from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getCourseById } from "@/lib/data/courses";
import { WorkoutStore } from "@/lib/store/workout-store";
import { MotionData, WorkoutRecord } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";

// Gyroscope (only on native)
let Gyroscope: any = null;
if (Platform.OS !== "web") {
  try { Gyroscope = require("expo-sensors").Gyroscope; } catch {}
}

const { width: SCREEN_W } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MOTION_ICONS: Record<string, string> = {
  forward: "⬇️", backward: "⬆️", left: "⬅️", right: "➡️",
  "rotate-cw": "🔄", "rotate-ccw": "🔃", shoulder: "🙆", static: "🧘",
};

const MOTION_GUIDE: Record<string, string> = {
  forward:      "缓慢低头，感受颈后肌群拉伸",
  backward:     "轻柔仰头，不要过度后仰",
  left:         "头部向左侧倾斜，右肩保持放松",
  right:        "头部向右侧倾斜，左肩保持放松",
  "rotate-cw":  "顺时针缓慢转动头部",
  "rotate-ccw": "逆时针缓慢转动头部",
  shoulder:     "双肩放松，配合深呼吸",
  static:       "保持静止，均匀呼吸",
};

/** 最短有效锻炼时长（秒） */
const MIN_VALID_SECONDS = 30;

export default function ExerciseGuideScreen() {
  useKeepAwake();

  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const course = getCourseById(id);

  const [stepIdx, setStepIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  // ── 真实秒表 ────────────────────────────────────────────────────────────────
  // 记录"开始按下"的时刻，暂停时累计已用时间
  const wallStartRef   = useRef<number>(0);   // Date.now() at last resume
  const accumulatedRef = useRef<number>(0);   // ms accumulated before current segment
  const [elapsedSec, setElapsedSec]   = useState(0); // display only

  // ── 运动次数（每完成一个动作步骤 +1）────────────────────────────────────────
  const repCountRef = useRef<number>(0);

  // ── 陀螺仪 ──────────────────────────────────────────────────────────────────
  const [liveAngles, setLiveAngles] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [airpodsConnected, setAirpodsConnected] = useState(false);
  const gyroAccum = useRef({ pitch: 0, yaw: 0, roll: 0, maxPitch: 0, maxYaw: 0, maxRoll: 0 });

  // ── 倒计时圆环 ───────────────────────────────────────────────────────────────
  const progress = useSharedValue(1);
  const RING_R = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const currentExercise = course?.exercises[stepIdx];

  // ── 陀螺仪订阅 ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!Gyroscope || Platform.OS === "web") return;
    Gyroscope.setUpdateInterval(100);
    const sub = Gyroscope.addListener((data: { x: number; y: number; z: number }) => {
      const dt = 0.1;
      const pitchDelta = data.x * dt * (180 / Math.PI);
      const yawDelta   = data.z * dt * (180 / Math.PI);
      const rollDelta  = data.y * dt * (180 / Math.PI);

      gyroAccum.current.pitch += pitchDelta;
      gyroAccum.current.yaw   += yawDelta;
      gyroAccum.current.roll  += rollDelta;

      const absPitch = Math.abs(gyroAccum.current.pitch);
      const absYaw   = Math.abs(gyroAccum.current.yaw);
      const absRoll  = Math.abs(gyroAccum.current.roll);

      gyroAccum.current.maxPitch = Math.max(gyroAccum.current.maxPitch, absPitch);
      gyroAccum.current.maxYaw   = Math.max(gyroAccum.current.maxYaw, absYaw);
      gyroAccum.current.maxRoll  = Math.max(gyroAccum.current.maxRoll, absRoll);

      setLiveAngles({ pitch: pitchDelta, yaw: yawDelta, roll: rollDelta });
    });
    return () => sub.remove();
  }, []);

  // ── 当前步骤倒计时初始化 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentExercise) return;
    setTimeLeft(currentExercise.durationSeconds);
    progress.value = 1;
  }, [stepIdx, currentExercise]);

  // ── 倒计时 ticker ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStarted || isPaused || !currentExercise) return;
    if (timeLeft <= 0) return; // handleNextStep 由下面的 effect 触发

    progress.value = withTiming(0, {
      duration: timeLeft * 1000,
      easing: Easing.linear,
    });

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isPaused, stepIdx]);

  // ── 倒计时归零自动进入下一步 ─────────────────────────────────────────────────
  useEffect(() => {
    if (isStarted && !isPaused && timeLeft === 0 && currentExercise) {
      handleNextStep();
    }
  }, [timeLeft]);

  // ── 真实秒表 ticker（每秒刷新显示） ─────────────────────────────────────────
  useEffect(() => {
    if (!isStarted || isPaused) return;
    const interval = setInterval(() => {
      const nowElapsed = accumulatedRef.current + (Date.now() - wallStartRef.current);
      setElapsedSec(Math.floor(nowElapsed / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isStarted, isPaused]);

  // ── 开始 ─────────────────────────────────────────────────────────────────────
  const handleStart = () => {
    wallStartRef.current = Date.now();
    accumulatedRef.current = 0;
    repCountRef.current = 0;
    setIsStarted(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ── 暂停 / 继续 ──────────────────────────────────────────────────────────────
  const handlePause = () => {
    if (!isPaused) {
      // 暂停：累计已用时间
      accumulatedRef.current += Date.now() - wallStartRef.current;
      progress.value = withTiming(progress.value, { duration: 0 });
    } else {
      // 继续：重置 wall start
      wallStartRef.current = Date.now();
    }
    setIsPaused((p) => !p);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // ── 下一步 ───────────────────────────────────────────────────────────────────
  const handleNextStep = useCallback(() => {
    if (!course) return;
    // 每完成一个步骤，运动次数 +1
    repCountRef.current = stepIdx + 1;

    if (stepIdx >= course.exercises.length - 1) {
      finishWorkout(stepIdx + 1);
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStepIdx((s) => s + 1);
    setTimeLeft(course.exercises[stepIdx + 1].durationSeconds);
    progress.value = 1;
  }, [course, stepIdx]);

  // ── 上一步 ───────────────────────────────────────────────────────────────────
  const handlePrevStep = () => {
    if (stepIdx === 0) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStepIdx((s) => s - 1);
    setTimeLeft(course!.exercises[stepIdx - 1].durationSeconds);
    progress.value = 1;
  };

  // ── 完成锻炼 ─────────────────────────────────────────────────────────────────
  const finishWorkout = async (completedSteps: number) => {
    if (!course) return;

    // 计算真实锻炼时长（秒）
    const totalMs = isPaused
      ? accumulatedRef.current
      : accumulatedRef.current + (Date.now() - wallStartRef.current);
    const realDurationSeconds = Math.floor(totalMs / 1000);

    // ── 不足 30 秒：不保存，跳转提示页 ─────────────────────────────────────
    if (realDurationSeconds < MIN_VALID_SECONDS) {
      router.replace({
        pathname: "/workout-too-short",
        params: {
          courseTitle: course.title,
          durationSeconds: String(realDurationSeconds),
          minSeconds: String(MIN_VALID_SECONDS),
        },
      });
      return;
    }

    // ── 正常完成：保存记录 ───────────────────────────────────────────────────
    const startTime = new Date(Date.now() - totalMs);
    const endTime   = new Date();
    const g = gyroAccum.current;
    const motion: MotionData = {
      pitchRange: Math.round(g.maxPitch),
      yawRange:   Math.round(g.maxYaw),
      rollRange:  Math.round(g.maxRoll),
      maxAngle:   Math.round(Math.max(g.maxPitch, g.maxYaw, g.maxRoll)),
    };
    const record: WorkoutRecord = {
      id: Date.now().toString(),
      courseId: course.id,
      courseTitle: course.title,
      difficulty: course.difficulty,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds: realDurationSeconds,
      completedExercises: completedSteps,
      totalExercises: course.exercises.length,
      motionData: motion,
      usedAirPods: airpodsConnected,
    };
    await WorkoutStore.save(record);

    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/workout-complete",
      params: {
        courseTitle: course.title,
        durationSeconds: String(realDurationSeconds),
        completedExercises: String(completedSteps),
        totalExercises: String(course.exercises.length),
        pitchRange: String(motion.pitchRange),
        yawRange: String(motion.yawRange),
        rollRange: String(motion.rollRange),
        maxAngle: String(motion.maxAngle),
        usedAirPods: airpodsConnected ? "1" : "0",
      },
    });
  };

  if (!course || !currentExercise) {
    return (
      <ScreenContainer>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>课程不存在</Text>
        </View>
      </ScreenContainer>
    );
  }

  const totalSteps = course.exercises.length;
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedSecDisplay = elapsedSec % 60;

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      {/* ── Nav ── */}
      <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="xmark" size={20} color={colors.muted} />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.navTitle, { color: colors.foreground }]}>{course.title}</Text>
          <Text style={[styles.navSub, { color: colors.muted }]}>
            {stepIdx + 1} / {totalSteps}
          </Text>
        </View>
        <Pressable
          onPress={() => setAirpodsConnected((v) => !v)}
          style={({ pressed }) => [styles.airpodsBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={{ fontSize: 20 }}>{airpodsConnected ? "🎧" : "🎵"}</Text>
        </Pressable>
      </View>

      {/* ── Progress Bar ── */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View style={[
          styles.progressFill,
          { backgroundColor: colors.primary, width: `${((stepIdx + 1) / totalSteps) * 100}%` as any },
        ]} />
      </View>

      {/* ── Real-time Stats Bar ── */}
      {isStarted && (
        <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.statsBarItem}>
            <Text style={[styles.statsBarNum, { color: colors.primary }]}>
              {String(elapsedMin).padStart(2, "0")}:{String(elapsedSecDisplay).padStart(2, "0")}
            </Text>
            <Text style={[styles.statsBarLabel, { color: colors.muted }]}>已锻炼</Text>
          </View>
          <View style={[styles.statsBarDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statsBarItem}>
            <Text style={[styles.statsBarNum, { color: colors.success }]}>
              {repCountRef.current}
            </Text>
            <Text style={[styles.statsBarLabel, { color: colors.muted }]}>已完成动作</Text>
          </View>
          <View style={[styles.statsBarDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statsBarItem}>
            <Text style={[styles.statsBarNum, { color: colors.foreground }]}>
              {totalSteps - repCountRef.current}
            </Text>
            <Text style={[styles.statsBarLabel, { color: colors.muted }]}>剩余动作</Text>
          </View>
        </View>
      )}

      {/* ── Main Content ── */}
      <View style={styles.mainContent}>
        {/* Motion Icon */}
        <View style={[styles.motionIconContainer, { backgroundColor: colors.primary + "15" }]}>
          <Text style={styles.motionIcon}>{MOTION_ICONS[currentExercise.motionType] ?? "🔵"}</Text>
        </View>

        {/* Exercise Name */}
        <Text style={[styles.exerciseName, { color: colors.foreground }]}>
          {currentExercise.name}
        </Text>
        <Text style={[styles.exerciseGuide, { color: colors.muted }]}>
          {MOTION_GUIDE[currentExercise.motionType]}
        </Text>
        <Text style={[styles.exerciseDesc, { color: colors.muted }]}>
          {currentExercise.description}
        </Text>

        {/* Countdown Ring */}
        <View style={styles.countdownContainer}>
          <Svg width={130} height={130} viewBox="0 0 130 130">
            <Circle
              cx={65} cy={65} r={RING_R}
              stroke={colors.border}
              strokeWidth={8}
              fill="none"
            />
            <AnimatedCircle
              cx={65} cy={65} r={RING_R}
              stroke={colors.primary}
              strokeWidth={8}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              rotation="-90"
              origin="65, 65"
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.countdownInner}>
            <Text style={[styles.countdownNum, { color: colors.foreground }]}>{timeLeft}</Text>
            <Text style={[styles.countdownLabel, { color: colors.muted }]}>秒</Text>
          </View>
        </View>
      </View>

      {/* ── Gyroscope Panel ── */}
      <View style={[styles.gyroPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.gyroHeader}>
          <Text style={styles.gyroIcon}>📡</Text>
          <Text style={[styles.gyroTitle, { color: colors.foreground }]}>
            头部运动 {airpodsConnected ? "· AirPods" : "· 设备传感器"}
          </Text>
        </View>
        <View style={styles.gyroMetrics}>
          {[
            { label: "俯仰", value: liveAngles.pitch, color: "#4A90D9" },
            { label: "偏航", value: liveAngles.yaw,   color: "#34C759" },
            { label: "横滚", value: liveAngles.roll,  color: "#FF9500" },
          ].map((m) => (
            <View key={m.label} style={styles.gyroMetricItem}>
              <View style={[styles.gyroBar, { backgroundColor: colors.border }]}>
                <View style={[
                  styles.gyroBarFill,
                  { backgroundColor: m.color, width: `${Math.min(100, Math.abs(m.value) * 5)}%` as any },
                ]} />
              </View>
              <Text style={[styles.gyroMetricLabel, { color: colors.muted }]}>{m.label}</Text>
              <Text style={[styles.gyroMetricVal, { color: m.color }]}>
                {m.value.toFixed(1)}°
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Controls ── */}
      <View style={[styles.controls, { borderTopColor: colors.border }]}>
        {!isStarted ? (
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: colors.primary },
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <Text style={styles.startBtnText}>开始锻炼</Text>
          </Pressable>
        ) : (
          <View style={styles.controlRow}>
            <Pressable
              onPress={handlePrevStep}
              style={({ pressed }) => [
                styles.controlBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
                stepIdx === 0 && { opacity: 0.3 },
              ]}
              disabled={stepIdx === 0}
            >
              <IconSymbol name="chevron.left" size={22} color={colors.foreground} />
            </Pressable>

            <Pressable
              onPress={handlePause}
              style={({ pressed }) => [
                styles.pauseBtn,
                { backgroundColor: colors.primary },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <IconSymbol name={isPaused ? "play.fill" : "pause.fill"} size={28} color="#fff" />
            </Pressable>

            <Pressable
              onPress={() => handleNextStep()}
              style={({ pressed }) => [
                styles.controlBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
            >
              <IconSymbol name="chevron.right" size={22} color={colors.foreground} />
            </Pressable>
          </View>
        )}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "700" },
  navSub: { fontSize: 12, marginTop: 1 },
  airpodsBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  progressTrack: { height: 3 },
  progressFill: { height: 3 },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statsBarItem: { alignItems: "center" },
  statsBarNum: { fontSize: 18, fontWeight: "700" },
  statsBarLabel: { fontSize: 10, marginTop: 1 },
  statsBarDivider: { width: 1, height: 28 },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  motionIconContainer: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  motionIcon: { fontSize: 40 },
  exerciseName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  exerciseGuide: { fontSize: 13, textAlign: "center", fontStyle: "italic" },
  exerciseDesc: { fontSize: 13, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  countdownContainer: {
    width: 130, height: 130,
    alignItems: "center", justifyContent: "center",
    marginTop: 8,
  },
  countdownInner: {
    position: "absolute",
    alignItems: "center", justifyContent: "center",
  },
  countdownNum: { fontSize: 36, fontWeight: "800" },
  countdownLabel: { fontSize: 12, marginTop: -4 },
  gyroPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  gyroHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  gyroIcon: { fontSize: 14 },
  gyroTitle: { fontSize: 12, fontWeight: "600" },
  gyroMetrics: { gap: 6 },
  gyroMetricItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  gyroBar: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden" },
  gyroBarFill: { height: 5, borderRadius: 3 },
  gyroMetricLabel: { fontSize: 11, width: 28 },
  gyroMetricVal: { fontSize: 12, fontWeight: "600", width: 40, textAlign: "right" },
  controls: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  startBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  controlBtn: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  pauseBtn: {
    flex: 1, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
});
