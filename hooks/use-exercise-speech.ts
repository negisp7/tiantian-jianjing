/**
 * useExerciseSpeech
 *
 * 封装运动引导页的所有音频功能：
 * 使用 Microsoft Edge TTS 预生成的高质量中文女声 MP3（zh-CN-XiaoxiaoNeural）
 * 通过 expo-audio 播放，完全替代机械的设备 TTS。
 *
 * 降级策略：若预生成音频找不到对应 key，自动回退到 expo-speech。
 */
import { useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer, AudioStatus } from "expo-audio";
import * as Speech from "expo-speech";
import { AUDIO_MAP, getAudioKey } from "@/lib/audio-map";

// ── 女声语言标识（降级用）────────────────────────────────────────────────────
const ZH_LANG = "zh-CN";
const FEMALE_VOICE_KEYWORDS = ["Tingting", "Meijia", "Sinji", "Female", "female"];

let cachedFemaleVoiceId: string | null | undefined = undefined;
async function getFemaleVoiceId(): Promise<string | undefined> {
  if (cachedFemaleVoiceId !== undefined) return cachedFemaleVoiceId ?? undefined;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const zhVoices = voices.filter(
      (v) => v.language?.startsWith("zh") || v.language?.startsWith("cmn")
    );
    const pool = zhVoices.length > 0 ? zhVoices : voices;
    for (const kw of FEMALE_VOICE_KEYWORDS) {
      const found = pool.find((v) => v.name?.includes(kw) || v.identifier?.includes(kw));
      if (found) { cachedFemaleVoiceId = found.identifier; return found.identifier; }
    }
    if (pool.length > 0) { cachedFemaleVoiceId = pool[0].identifier; return pool[0].identifier; }
  } catch {}
  cachedFemaleVoiceId = null;
  return undefined;
}

// ── 音频模式初始化（只需执行一次）────────────────────────────────────────────
let audioModeInitialized = false;
async function ensureAudioMode() {
  if (audioModeInitialized || Platform.OS === "web") return;
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    audioModeInitialized = true;
  } catch {}
}

// ── 播放预生成音频（核心函数）────────────────────────────────────────────────
function playAudioKey(key: string | null): AudioPlayer | null {
  if (!key || Platform.OS === "web") return null;
  const source = AUDIO_MAP[key];
  if (!source) return null;
  try {
    const player = createAudioPlayer(source);
    player.play();
    return player;
  } catch {
    return null;
  }
}

function stopPlayer(player: AudioPlayer | null) {
  if (!player) return;
  try { player.pause(); } catch {}
  try { player.remove(); } catch {}
}

function waitForPlayerToFinish(player: AudioPlayer, shouldCancel: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false;
    let subscription: { remove: () => void } | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelTimer: ReturnType<typeof setInterval> | null = null;

    const done = () => {
      if (resolved) return;
      resolved = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (cancelTimer) clearInterval(cancelTimer);
      try { subscription?.remove(); } catch {}
      stopPlayer(player);
      resolve();
    };

    const scheduleFallback = (duration: number, currentTime: number) => {
      if (fallbackTimer || !duration || duration <= 0) return;
      const remainingMs = Math.max((duration - currentTime) * 1000 + 1500, 3000);
      fallbackTimer = setTimeout(done, remainingMs);
    };

    try {
      subscription = player.addListener("playbackStatusUpdate", (status: AudioStatus) => {
        if (shouldCancel()) {
          done();
          return;
        }
        if (status.didJustFinish || (!status.playing && status.currentTime >= status.duration && status.duration > 0)) {
          done();
          return;
        }
        scheduleFallback(status.duration, status.currentTime);
      });
    } catch {
      fallbackTimer = setTimeout(done, 60000);
      return;
    }

    scheduleFallback(player.duration, player.currentTime);
    fallbackTimer = fallbackTimer ?? setTimeout(done, 60000);
    cancelTimer = setInterval(() => {
      if (shouldCancel()) done();
    }, 100);
  });
}

// ── 降级：expo-speech 播报 ────────────────────────────────────────────────────
async function speakFallback(text: string, rate = 0.9, pitch = 1.05) {
  if (Platform.OS === "web" || !text) return;
  try {
    await Speech.stop();
    const voiceId = await getFemaleVoiceId();
    Speech.speak(text, { language: ZH_LANG, voice: voiceId, rate, pitch });
  } catch {}
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useExerciseSpeech(enabled = true) {
  const beepedSecsRef   = useRef<Set<number>>(new Set());
  const isMountedRef    = useRef(true);
  // 当前正在播放的 player（用于中断）
  const currentPlayerRef = useRef<AudioPlayer | null>(null);
  const activePlayersRef = useRef<Set<AudioPlayer>>(new Set());
  const speechQueueRef = useRef<Promise<void>>(Promise.resolve());
  const speechGenerationRef = useRef(0);

  // 初始化：设置音频模式，预加载降级声音
  useEffect(() => {
    if (Platform.OS === "web") return;
    ensureAudioMode();
    getFemaleVoiceId().catch(() => {});
    return () => {
      isMountedRef.current = false;
      // 停止当前播放
      activePlayersRef.current.forEach(stopPlayer);
      activePlayersRef.current.clear();
      stopPlayer(currentPlayerRef.current);
      currentPlayerRef.current = null;
      speechQueueRef.current = Promise.resolve();
      speechGenerationRef.current += 1;
      Speech.stop().catch(() => {});
    };
  }, []);

  // ── 停止当前播放 ─────────────────────────────────────────────────────────────
  const stopSpeech = useCallback(() => {
    if (Platform.OS === "web") return;
    try {
      speechGenerationRef.current += 1;
      activePlayersRef.current.forEach(stopPlayer);
      activePlayersRef.current.clear();
      stopPlayer(currentPlayerRef.current);
      currentPlayerRef.current = null;
      speechQueueRef.current = Promise.resolve();
    } catch {}
    Speech.stop().catch(() => {});
  }, []);

  // ── 通用播放（优先预生成音频，降级到 expo-speech）────────────────────────────
  const playAudio = useCallback(async (
    audioKey: string | null,
    fallbackText: string,
    interrupt = false,
    fallbackRate = 0.9,
    fallbackPitch = 1.05,
  ) => {
    if (!enabled || Platform.OS === "web") return;
    if (interrupt) stopSpeech();
    const generation = speechGenerationRef.current;

    const playTask = async () => {
      if (!isMountedRef.current) return;
      if (generation !== speechGenerationRef.current) return;

      if (audioKey && AUDIO_MAP[audioKey]) {
        // 使用预生成高质量音频
        const player = playAudioKey(audioKey);
        if (player) {
          activePlayersRef.current.add(player);
          currentPlayerRef.current = player;
          await waitForPlayerToFinish(player, () => generation !== speechGenerationRef.current || !isMountedRef.current);
          activePlayersRef.current.delete(player);
          if (currentPlayerRef.current === player) currentPlayerRef.current = null;
          return;
        }
      }

      if (generation !== speechGenerationRef.current) return;
      // 降级到 expo-speech。expo-speech 无可靠完成事件，这里只保证启动前停止旧 speech。
      await speakFallback(fallbackText, fallbackRate, fallbackPitch);
    };

    if (interrupt) {
      speechQueueRef.current = playTask().catch(() => {});
      await speechQueueRef.current;
      return;
    }

    speechQueueRef.current = speechQueueRef.current.then(playTask).catch(() => {});
    await speechQueueRef.current;
  }, [enabled, stopSpeech]);

  // ── 播报动作信息（名称 + 描述） ──────────────────────────────────────────────
  const speakExercise = useCallback((name: string, description: string) => {
    const key = getAudioKey("exercise", name, description);
    playAudio(key, `${name}。${description}`);
  }, [playAudio]);

  // ── 播报开始提示 ─────────────────────────────────────────────────────────────
  const speakStart = useCallback((courseTitle: string) => {
    const key = getAudioKey("start", courseTitle);
    playAudio(key, `开始${courseTitle}，请跟随指引进行锻炼。`);
  }, [playAudio]);

  // ── 播报完成提示 ─────────────────────────────────────────────────────────────
  const speakComplete = useCallback(() => {
    const key = getAudioKey("complete");
    playAudio(key, "锻炼完成，做得很好！记得补充水分，好好休息。", true);
  }, [playAudio]);

  // ── 播报暂停/继续 ────────────────────────────────────────────────────────────
  const speakPause = useCallback((isPaused: boolean) => {
    const key = getAudioKey(isPaused ? "pause" : "resume");
    playAudio(key, isPaused ? "已暂停" : "继续锻炼", true);
  }, [playAudio]);

  // ── 倒计时播报（三/二/一）────────────────────────────────────────────────────
  const speakCountdown = useCallback(async (num: number) => {
    if (!enabled || Platform.OS === "web") return;
    const key = getAudioKey("countdown", String(num));
    const textMap: Record<number, string> = { 3: "三", 2: "二", 1: "一" };
    const text = textMap[num];
    if (!text) return;
    // 倒计时不中断动作语音，直接叠加播放
    if (key && AUDIO_MAP[key]) {
      const player = playAudioKey(key);
      if (player) activePlayersRef.current.add(player);
    } else {
      await speakFallback(text, 1.2, 1.2);
    }
  }, [enabled]);

  // ── 倒计时触发（在 timeLeft 变化时调用） ─────────────────────────────────────
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

  // speak 兼容旧接口（通用文本播报，降级到 expo-speech）
  const speak = useCallback(async (text: string, interrupt = false) => {
    if (!enabled || Platform.OS === "web" || !text) return;
    await playAudio(null, text, interrupt);
  }, [enabled, playAudio]);

  return { speak, stopSpeech, speakExercise, speakStart, speakComplete, speakPause, tickBeep, resetBeep };
}
