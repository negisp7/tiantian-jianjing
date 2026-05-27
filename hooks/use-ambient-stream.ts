import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { createAudioPlayer, setAudioModeAsync } from "expo-audio";
import type { AudioPlayer } from "expo-audio";

const STREAM_SOURCE = require("../assets/audio/ambient/stream.mp3");

export function useAmbientStream(enabled: boolean, volume: number) {
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;

    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});

    try {
      const player = createAudioPlayer(STREAM_SOURCE);
      player.loop = true;
      player.volume = volume;
      playerRef.current = player;
      player.play();
    } catch {
      playerRef.current = null;
    }

    return () => {
      const player = playerRef.current;
      playerRef.current = null;
      if (!player) return;
      try { player.pause(); } catch {}
      try { player.remove(); } catch {}
    };
  }, [enabled]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.volume = volume;
      if (enabled) player.play();
      else player.pause();
    } catch {}
  }, [enabled, volume]);
}
