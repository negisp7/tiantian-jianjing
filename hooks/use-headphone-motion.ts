import { useEffect, useRef, useState } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";

type HeadphoneMotionSample = {
  pitch: number;
  yaw: number;
  roll: number;
};

type HeadphoneMotionModule = {
  isAvailable: () => Promise<boolean>;
  startUpdates: () => void;
  stopUpdates: () => void;
};

const nativeModule = NativeModules.HeadphoneMotion as HeadphoneMotionModule | undefined;

export function useHeadphoneMotion(enabled: boolean) {
  const [available, setAvailable] = useState(false);
  const [liveAngles, setLiveAngles] = useState<HeadphoneMotionSample>({
    pitch: 0,
    yaw: 0,
    roll: 0,
  });
  const maxAnglesRef = useRef({ maxPitch: 0, maxYaw: 0, maxRoll: 0 });

  useEffect(() => {
    if (!enabled || Platform.OS !== "ios" || !nativeModule) {
      setAvailable(false);
      setLiveAngles({ pitch: 0, yaw: 0, roll: 0 });
      return;
    }

    let mounted = true;
    const emitter = new NativeEventEmitter(nativeModule as any);
    const motionSub = emitter.addListener("HeadphoneMotionUpdate", (sample: HeadphoneMotionSample) => {
      if (!mounted) return;
      maxAnglesRef.current.maxPitch = Math.max(maxAnglesRef.current.maxPitch, Math.abs(sample.pitch));
      maxAnglesRef.current.maxYaw = Math.max(maxAnglesRef.current.maxYaw, Math.abs(sample.yaw));
      maxAnglesRef.current.maxRoll = Math.max(maxAnglesRef.current.maxRoll, Math.abs(sample.roll));
      setLiveAngles(sample);
    });
    const availabilitySub = emitter.addListener(
      "HeadphoneMotionAvailabilityChanged",
      (event: { available: boolean }) => {
        if (mounted) setAvailable(Boolean(event.available));
      },
    );

    nativeModule.isAvailable()
      .then((isAvailable) => {
        if (mounted) setAvailable(isAvailable);
        nativeModule.startUpdates();
      })
      .catch(() => {
        if (mounted) setAvailable(false);
      });

    return () => {
      mounted = false;
      motionSub.remove();
      availabilitySub.remove();
      nativeModule.stopUpdates();
      setLiveAngles({ pitch: 0, yaw: 0, roll: 0 });
    };
  }, [enabled]);

  const reset = () => {
    maxAnglesRef.current = { maxPitch: 0, maxYaw: 0, maxRoll: 0 };
    setLiveAngles({ pitch: 0, yaw: 0, roll: 0 });
  };

  return {
    available,
    liveAngles,
    maxAnglesRef,
    reset,
  };
}
