import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";

const ALERT_AUDIO = {
  60: [
    require("../assets/audio/supervision/alert_1min_a.mp3"),
    require("../assets/audio/supervision/alert_1min_b.mp3"),
  ],
  180: [
    require("../assets/audio/supervision/alert_3min_b.mp3"),
  ],
  300: [
    require("../assets/audio/supervision/alert_5min_a.mp3"),
    require("../assets/audio/supervision/alert_5min_b.mp3"),
  ],
  600: [
    require("../assets/audio/supervision/alert_10min.mp3"),
  ],
} as const;

type AlertSecond = keyof typeof ALERT_AUDIO;

function stopPlayer(player: AudioPlayer | null) {
  if (!player) return;
  try { player.pause(); } catch {}
  try { player.remove(); } catch {}
}

export function useSupervisionAlertAudio() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const variantIndexRef = useRef<Record<number, number>>({});

  useEffect(() => {
    if (Platform.OS === "web") return;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});

    return () => {
      stopPlayer(playerRef.current);
      playerRef.current = null;
    };
  }, []);

  const playAlert = useCallback((second: AlertSecond) => {
    if (Platform.OS === "web") return;
    const sources = ALERT_AUDIO[second];
    const index = variantIndexRef.current[second] ?? 0;
    const source = sources[index % sources.length];
    variantIndexRef.current[second] = index + 1;

    try {
      stopPlayer(playerRef.current);
      const player = createAudioPlayer(source);
      player.volume = 1;
      playerRef.current = player;
      player.play();
    } catch {
      playerRef.current = null;
    }
  }, []);

  return { playAlert };
}
