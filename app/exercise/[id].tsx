import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform, Image,
} from "react-native";
import type { ImageSourcePropType } from "react-native";
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
import { useExerciseSpeech } from "@/hooks/use-exercise-speech";
import { useHeadphoneMotion } from "@/hooks/use-headphone-motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MOTION_IMAGES: Record<string, ImageSourcePropType | ImageSourcePropType[]> = {
  forward:     require("@/assets/images/exercises/motion_forward.png"),
  backward:    require("@/assets/images/exercises/motion_backward.png"),
  left:        require("@/assets/images/exercises/motion_left.png"),
  right:       require("@/assets/images/exercises/motion_right.png"),
  "left-lat":  require("@/assets/images/exercises/motion_left_lat.png"),
  "right-lat": require("@/assets/images/exercises/motion_right_lat.png"),
  trapezius: [
    require("@/assets/images/exercises/motion_trapezius_stretch_left.png"),
    require("@/assets/images/exercises/motion_trapezius_stretch_right.png"),
  ],
  "rotate-cw":  require("@/assets/images/exercises/motion_rotate_cw.png"),
  "rotate-ccw": require("@/assets/images/exercises/motion_rotate_ccw.png"),
  shoulder:    require("@/assets/images/exercises/motion_shoulder.png"),
  static:      require("@/assets/images/exercises/motion_static.png"),
};

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
  const wallStartRef   = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const [elapsedSec, setElapsedSec] = useState(0);

  // ── 运动次数 ─────────────────────────────────────────────────────────────────
  const repCountRef = useRef<number>(0);
  const prevSpokenStepRef = useRef<number | null>(null);
  const startExerciseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── AirPods 头动传感器 ─────────────────────────────────────────────────────
  const {
    available: airpodsConnected,
    liveAngles,
    maxAnglesRef,
    reset: resetHeadphoneMotion,
  } = useHeadphoneMotion(isStarted && !isPaused);

  // ── 语音 & 音效 ──────────────────────────────────────────────────────────────
  const { speakExercise, speakStart, speakComplete, speakPause, tickBeep, resetBeep, stopSpeech } =
    useExerciseSpeech(true);

  // ── 倒计时圆环 ───────────────────────────────────────────────────────────────
  const progress = useSharedValue(1);
  const RING_R = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R;
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const currentExercise = course?.exercises[stepIdx];
  const currentMotionImage = currentExercise ? (MOTION_IMAGES[currentExercise.motionType] ?? MOTION_IMAGES.forward) : MOTION_IMAGES.forward;

  // ── 当前步骤倒计时初始化 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentExercise) return;
    setTimeLeft(currentExercise.durationSeconds);
    progress.value = 1;
    resetBeep();
  }, [stepIdx, currentExercise]);

  // ── 新步骤开始时语音播报（已开始锻炼才播） ──────────────────────────────────
  useEffect(() => {
    if (!isStarted || !currentExercise) return;
    if (prevSpokenStepRef.current === stepIdx) return;
    prevSpokenStepRef.current = stepIdx;
    speakExercise(
      currentExercise.name,
      currentExercise.description,
    );
  }, [stepIdx, isStarted]);

  useEffect(() => {
    return () => {
      if (startExerciseTimerRef.current) clearTimeout(startExerciseTimerRef.current);
    };
  }, []);

  // ── 倒计时 ticker ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStarted || isPaused || !currentExercise) return;
    if (timeLeft <= 0) return;

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

  // ── 最后3秒 beep ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStarted || isPaused) return;
    tickBeep(timeLeft);
  }, [timeLeft, isStarted, isPaused]);

  // ── 真实秒表 ticker ──────────────────────────────────────────────────────────
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
    resetHeadphoneMotion();
    prevSpokenStepRef.current = stepIdx;
    setIsStarted(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // 播报开始提示 + 第一个动作
    speakStart(course?.title ?? "");
    if (currentExercise) {
      if (startExerciseTimerRef.current) clearTimeout(startExerciseTimerRef.current);
      startExerciseTimerRef.current = setTimeout(() => {
        speakExercise(
          currentExercise.name,
          currentExercise.description,
        );
        startExerciseTimerRef.current = null;
      }, 1800);
    }
  };

  // ── 暂停 / 继续 ──────────────────────────────────────────────────────────────
  const handlePause = () => {
    const nowPausing = !isPaused;
    if (nowPausing) {
      accumulatedRef.current += Date.now() - wallStartRef.current;
      progress.value = withTiming(progress.value, { duration: 0 });
      if (startExerciseTimerRef.current) {
        clearTimeout(startExerciseTimerRef.current);
        startExerciseTimerRef.current = null;
      }
      stopSpeech();
    } else {
      wallStartRef.current = Date.now();
    }
    setIsPaused(nowPausing);
    speakPause(nowPausing);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // ── 下一步 ───────────────────────────────────────────────────────────────────
  const handleNextStep = useCallback(() => {
    if (!course) return;
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

    const totalMs = isPaused
      ? accumulatedRef.current
      : accumulatedRef.current + (Date.now() - wallStartRef.current);
    const realDurationSeconds = Math.floor(totalMs / 1000);

    if (realDurationSeconds < MIN_VALID_SECONDS) {
      stopSpeech();
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

    speakComplete();

    const startTime = new Date(Date.now() - totalMs);
    const endTime   = new Date();
    const g = maxAnglesRef.current;
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
          onPress={() => {
            if (startExerciseTimerRef.current) clearTimeout(startExerciseTimerRef.current);
            stopSpeech();
            router.back();
          }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <IconSymbol name="xmark" size={20} color={colors.muted} />
        </Pressable>
        <View style={styles.navCenter}>
          <Text style={[styles.navTitle, { color: colors.foreground }]}>{course.title}</Text>
          <Text style={[styles.navSub, { color: colors.muted }]}>
            {stepIdx + 1} / {totalSteps}
          </Text>
        </View>
        <View style={[styles.airpodsIndicator, {
          backgroundColor: airpodsConnected ? colors.primary + "15" : colors.border + "40",
        }]}>
          <Text style={{ fontSize: 14 }}>{airpodsConnected ? "🎧" : "🎵"}</Text>
          <Text style={[styles.airpodsIndicatorText, {
            color: airpodsConnected ? colors.primary : colors.muted,
          }]}>
            {airpodsConnected ? "已连接" : "未连接"}
          </Text>
        </View>
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
        {/* Motion Image */}
        <View style={styles.motionImageContainer}>
          {Array.isArray(currentMotionImage) ? (
            <View style={styles.motionImagePair}>
              {currentMotionImage.map((source, index) => (
                <Image
                  key={index}
                  source={source}
                  style={styles.motionImageSmall}
                  resizeMode="contain"
                />
              ))}
            </View>
          ) : (
            <Image
              source={currentMotionImage}
              style={styles.motionImage}
              resizeMode="contain"
            />
          )}
        </View>

        {/* Exercise Name */}
        <Text style={[styles.exerciseName, { color: colors.foreground }]}>
          {currentExercise.name}
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
              stroke={timeLeft <= 3 && isStarted ? "#FF3B30" : colors.primary}
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
            <Text style={[
              styles.countdownNum,
              { color: timeLeft <= 3 && isStarted ? "#FF3B30" : colors.foreground },
            ]}>
              {timeLeft}
            </Text>
            <Text style={[styles.countdownLabel, { color: colors.muted }]}>秒</Text>
          </View>
        </View>

        {/* 语音提示说明 */}
        <View style={[styles.voiceHint, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.voiceHintIcon}>🔊</Text>
          <Text style={[styles.voiceHintText, { color: colors.muted }]}>
            {isStarted ? "女声播报已开启 · 最后3秒有提示音" : "开始后将自动语音播报动作指引"}
          </Text>
        </View>
      </View>

      {/* ── AirPods Motion Panel ── */}
      <View style={[styles.gyroPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.gyroHeader}>
          <Text style={styles.gyroIcon}>📡</Text>
          <Text style={[styles.gyroTitle, { color: colors.foreground }]}>
            AirPods 头部运动数据
          </Text>
          {!airpodsConnected && (
            <View style={[styles.gyroNotice, { backgroundColor: colors.warning + "20" }]}>
              <Text style={[styles.gyroNoticeText, { color: colors.warning }]}>
                连接支持头动的 AirPods 后记录
              </Text>
            </View>
          )}
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
                  { backgroundColor: m.color, width: `${Math.min(100, Math.abs(m.value) / 90 * 100)}%` as any },
                ]} />
              </View>
              <Text style={[styles.gyroMetricLabel, { color: colors.muted }]}>{m.label}</Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[styles.gyroMetricVal, { color: m.color }]}
              >
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
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: { alignItems: "center", maxWidth: "54%" },
  navTitle: { fontSize: 15, fontWeight: "700", textAlign: "center" },
  navSub: { fontSize: 12, marginTop: 1 },
  airpodsIndicator: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  airpodsIndicatorText: { fontSize: 11, fontWeight: "600" },
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
    gap: 6,
  },
  motionImageContainer: {
    width: 220, height: 156,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  motionImage: { width: 200, height: 148 },
  motionImagePair: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  motionImageSmall: { width: 104, height: 148 },
  exerciseName: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  exerciseGuide: { fontSize: 13, textAlign: "center", fontStyle: "italic" },
  exerciseDesc: { fontSize: 13, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  countdownContainer: {
    width: 130, height: 130,
    alignItems: "center", justifyContent: "center",
    marginTop: 4,
  },
  countdownInner: {
    position: "absolute",
    alignItems: "center", justifyContent: "center",
  },
  countdownNum: { fontSize: 36, fontWeight: "800" },
  countdownLabel: { fontSize: 12, marginTop: -4 },
  voiceHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  voiceHintIcon: { fontSize: 13 },
  voiceHintText: { fontSize: 11 },
  gyroPanel: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  gyroHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" },
  gyroNotice: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  gyroNoticeText: { fontSize: 10, fontWeight: "500" },
  gyroIcon: { fontSize: 14 },
  gyroTitle: { fontSize: 12, fontWeight: "600" },
  gyroMetrics: { gap: 6 },
  gyroMetricItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  gyroBar: { flex: 1, minWidth: 0, height: 5, borderRadius: 3, overflow: "hidden" },
  gyroBarFill: { height: 5, borderRadius: 3 },
  gyroMetricLabel: { fontSize: 11, width: 28, flexShrink: 0 },
  gyroMetricVal: {
    fontSize: 12,
    fontWeight: "600",
    width: 56,
    flexShrink: 0,
    textAlign: "right",
    includeFontPadding: false,
  },
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
