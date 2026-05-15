import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import Svg, { Circle, Path, G } from "react-native-svg";
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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
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

  // Motion tracking
  const [motionData, setMotionData] = useState<MotionData>({ pitchRange: 0, yawRange: 0, rollRange: 0, maxAngle: 0 });
  const [liveAngles, setLiveAngles] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [airpodsConnected, setAirpodsConnected] = useState(false);
  const gyroAccum = useRef({ pitch: 0, yaw: 0, roll: 0, maxPitch: 0, maxYaw: 0, maxRoll: 0 });
  const startTimeRef = useRef<Date>(new Date());
  const completedRef = useRef(0);

  // Animated countdown ring
  const progress = useSharedValue(1);
  const RING_R = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const currentExercise = course?.exercises[stepIdx];

  // ── Gyroscope ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!Gyroscope || Platform.OS === "web") return;
    Gyroscope.setUpdateInterval(100);
    const sub = Gyroscope.addListener((data: { x: number; y: number; z: number }) => {
      const dt = 0.1; // 100ms
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

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentExercise) return;
    const dur = currentExercise.durationSeconds;
    setTimeLeft(dur);
    progress.value = 1;
    withTiming(0, { duration: dur * 1000, easing: Easing.linear });
  }, [stepIdx, currentExercise]);

  useEffect(() => {
    if (!isStarted || isPaused || !currentExercise) return;
    if (timeLeft <= 0) {
      handleNextStep();
      return;
    }
    const dur = currentExercise.durationSeconds;
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

  const handleStart = () => {
    setIsStarted(true);
    startTimeRef.current = new Date();
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handlePause = () => {
    setIsPaused((p) => !p);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isPaused) {
      progress.value = withTiming(progress.value, { duration: 0 });
    }
  };

  const handleNextStep = useCallback(() => {
    if (!course) return;
    completedRef.current = stepIdx + 1;
    if (stepIdx >= course.exercises.length - 1) {
      finishWorkout();
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStepIdx((s) => s + 1);
    setTimeLeft(course.exercises[stepIdx + 1].durationSeconds);
    progress.value = 1;
  }, [course, stepIdx]);

  const handlePrevStep = () => {
    if (stepIdx === 0) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStepIdx((s) => s - 1);
    setTimeLeft(course!.exercises[stepIdx - 1].durationSeconds);
    progress.value = 1;
  };

  const finishWorkout = async () => {
    if (!course) return;
    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTimeRef.current.getTime()) / 1000);
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
      startTime: startTimeRef.current.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds: duration,
      completedExercises: completedRef.current,
      totalExercises: course.exercises.length,
      motionData: motion,
      usedAirPods: airpodsConnected,
    };
    await WorkoutStore.save(record);
    setMotionData(motion);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/workout-complete",
      params: {
        courseTitle: course.title,
        durationSeconds: String(duration),
        completedExercises: String(completedRef.current),
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
              onPress={handleNextStep}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  navTitle: { fontSize: 15, fontWeight: "600" },
  navSub: { fontSize: 12, marginTop: 1 },
  airpodsBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  progressTrack: { height: 3, width: "100%" },
  progressFill: { height: 3, borderRadius: 2 },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  motionIconContainer: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: "center", justifyContent: "center",
  },
  motionIcon: { fontSize: 40 },
  exerciseName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  exerciseGuide: { fontSize: 14, textAlign: "center", fontStyle: "italic" },
  exerciseDesc: { fontSize: 13, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  countdownContainer: { position: "relative", alignItems: "center", justifyContent: "center", marginTop: 8 },
  countdownInner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownNum: { fontSize: 36, fontWeight: "800" },
  countdownLabel: { fontSize: 12 },
  gyroPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  gyroHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  gyroIcon: { fontSize: 16 },
  gyroTitle: { fontSize: 13, fontWeight: "600" },
  gyroMetrics: { gap: 8 },
  gyroMetricItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  gyroBar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  gyroBarFill: { height: 6, borderRadius: 3 },
  gyroMetricLabel: { fontSize: 11, width: 28 },
  gyroMetricVal: { fontSize: 12, fontWeight: "600", width: 44, textAlign: "right" },
  controls: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  startBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  startBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  controlRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
  controlBtn: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1,
  },
  pauseBtn: {
    width: 68, height: 68, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
});
