/**
 * useExerciseSpeech
 *
 * 封装运动引导页的所有音频功能：
 * 1. expo-speech 女声语音播报（动作名称、引导语、描述、开始/完成提示）
 * 2. expo-audio 最后3秒倒计时 beep 音效（3→2→1 各一声）
 */
import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

// ── 音效资源 ──────────────────────────────────────────────────────────────────
const BEEP_NORMAL = require("@/assets/audio/beep.wav");
const BEEP_FINAL  = require("@/assets/audio/beep_final.wav");

// ── 女声语言标识（中文普通话）────────────────────────────────────────────────
const ZH_LANG = "zh-CN";

// iOS 上优先选择 zh-CN 女声，按优先级排列的关键词
const FEMALE_VOICE_KEYWORDS = [
  "Tingting", "Meijia", "Sinji",  // iOS 中文女声
  "Female", "female",
];

let cachedFemaleVoiceId: string | null | undefined = undefined; // undefined=未初始化

async function getFemaleVoiceId(): Promise<string | undefined> {
  if (cachedFemaleVoiceId !== undefined) return cachedFemaleVoiceId ?? undefined;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    // 先筛选中文语音
    const zhVoices = voices.filter((v) =>
      v.language?.startsWith("zh") || v.language?.startsWith("cmn")
    );
    const pool = zhVoices.length > 0 ? zhVoices : voices;
    // 按关键词优先级查找女声
    for (const kw of FEMALE_VOICE_KEYWORDS) {
      const found = pool.find((v) => v.name?.includes(kw) || v.identifier?.includes(kw));
      if (found) { cachedFemaleVoiceId = found.identifier; return found.identifier; }
    }
    // 回退：取第一个中文语音
    if (pool.length > 0) { cachedFemaleVoiceId = pool[0].identifier; return pool[0].identifier; }
  } catch {}
  cachedFemaleVoiceId = null;
  return undefined;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useExerciseSpeech(enabled = true) {
  const beepPlayer      = useAudioPlayer(BEEP_NORMAL);
  const beepFinalPlayer = useAudioPlayer(BEEP_FINAL);
  const beepedSecsRef   = useRef<Set<number>>(new Set());
  const isMountedRef    = useRef(true);

  // 初始化：允许静音模式下播放
  useEffect(() => {
    if (Platform.OS === "web") return;
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    // 预加载女声 ID
    getFemaleVoiceId().catch(() => {});
    return () => {
      isMountedRef.current = false;
      Speech.stop().catch(() => {});
    };
  }, []);

  // ── 语音播报 ────────────────────────────────────────────────────────────────
  const speak = useCallback(async (text: string, interrupt = false) => {
    if (!enabled || Platform.OS === "web" || !text) return;
    try {
      if (interrupt) await Speech.stop();
      const voiceId = await getFemaleVoiceId();
      Speech.speak(text, {
        language: ZH_LANG,
        voice: voiceId,
        rate: 0.9,
        pitch: 1.05,
      });
    } catch {}
  }, [enabled]);

  // ── 停止语音 ────────────────────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (Platform.OS === "web") return;
    Speech.stop().catch(() => {});
  }, []);

  // ── 播报动作信息（名称 + 引导语 + 描述） ────────────────────────────────────
  const speakExercise = useCallback((
    name: string,
    guide: string,
    description: string,
  ) => {
    const text = `${name}。${guide}。${description}`;
    speak(text, true);
  }, [speak]);

  // ── 播报开始提示 ─────────────────────────────────────────────────────────────
  const speakStart = useCallback((courseTitle: string) => {
    speak(`开始${courseTitle}，请跟随指引进行锻炼。`, true);
  }, [speak]);

  // ── 播报完成提示 ─────────────────────────────────────────────────────────────
  const speakComplete = useCallback(() => {
    speak("锻炼完成，做得很好！记得补充水分，好好休息。", true);
  }, [speak]);

  // ── 播报暂停/继续 ────────────────────────────────────────────────────────────
  const speakPause = useCallback((isPaused: boolean) => {
    speak(isPaused ? "已暂停" : "继续锻炼", true);
  }, [speak]);

  // ── 倒计时 beep（在 timeLeft 变化时调用） ────────────────────────────────────
  // 每次步骤切换时需要调用 resetBeep() 清除已响过的记录
  const resetBeep = useCallback(() => {
    beepedSecsRef.current.clear();
  }, []);

  const tickBeep = useCallback((timeLeft: number) => {
    if (!enabled || Platform.OS === "web") return;
    if (timeLeft > 3 || timeLeft <= 0) return;
    if (beepedSecsRef.current.has(timeLeft)) return;
    beepedSecsRef.current.add(timeLeft);
    try {
      if (timeLeft === 1) {
        beepFinalPlayer.seekTo(0);
        beepFinalPlayer.play();
      } else {
        beepPlayer.seekTo(0);
        beepPlayer.play();
      }
    } catch {}
  }, [enabled, beepPlayer, beepFinalPlayer]);

  return { speak, stopSpeech, speakExercise, speakStart, speakComplete, speakPause, tickBeep, resetBeep };
}
