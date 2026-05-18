/**
 * useExerciseSpeech
 *
 * 封装运动引导页的所有音频功能：
 * 1. expo-speech 女声语音播报（动作名称、引导语、描述、开始/完成提示）
 * 2. expo-speech 最后3秒倒计时女声播报（"三"、"二"、"一"）
 */
import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";

// ── 女声语言标识（中文普通话）────────────────────────────────────────────────
const ZH_LANG = "zh-CN";

// iOS 上优先选择 zh-CN 女声，按优先级排列的关键词
const FEMALE_VOICE_KEYWORDS = [
  "Tingting", "Meijia", "Sinji",  // iOS 中文女声
  "Female", "female",
];

// 倒计时数字的中文读法
const COUNTDOWN_TEXT: Record<number, string> = {
  3: "三",
  2: "二",
  1: "一",
};

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
  const beepedSecsRef   = useRef<Set<number>>(new Set());
  const isMountedRef    = useRef(true);

  // 初始化：预加载女声 ID
  useEffect(() => {
    if (Platform.OS === "web") return;
    getFemaleVoiceId().catch(() => {});
    return () => {
      isMountedRef.current = false;
      Speech.stop().catch(() => {});
    };
  }, []);

  // ── 语音播报（通用，可中断） ─────────────────────────────────────────────────
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

  // ── 倒计时专用：短促高音速率，不中断正在播报的动作语音 ──────────────────────
  const speakCountdown = useCallback(async (num: number) => {
    if (!enabled || Platform.OS === "web") return;
    const text = COUNTDOWN_TEXT[num];
    if (!text) return;
    try {
      const voiceId = await getFemaleVoiceId();
      Speech.speak(text, {
        language: ZH_LANG,
        voice: voiceId,
        rate: 1.2,   // 稍快，干脆利落
        pitch: 1.2,  // 稍高音调，区别于动作播报
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

  // ── 倒计时女声播报（在 timeLeft 变化时调用） ─────────────────────────────────
  // 每次步骤切换时需要调用 resetBeep() 清除已响过的记录
  const resetBeep = useCallback(() => {
    beepedSecsRef.current.clear();
  }, []);

  const tickBeep = useCallback((timeLeft: number) => {
    if (!enabled || Platform.OS === "web") return;
    if (timeLeft > 3 || timeLeft <= 0) return;
    if (beepedSecsRef.current.has(timeLeft)) return;
    beepedSecsRef.current.add(timeLeft);
    speakCountdown(timeLeft);
  }, [enabled, speakCountdown]);

  return { speak, stopSpeech, speakExercise, speakStart, speakComplete, speakPause, tickBeep, resetBeep };
}
