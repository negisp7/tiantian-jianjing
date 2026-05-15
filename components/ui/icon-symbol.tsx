// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "figure.walk": "directions-walk",
  "calendar": "calendar-today",
  "person.fill": "person",
  // General
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "xmark": "close",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "arrow.clockwise": "refresh",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  // Health / Exercise
  "heart.fill": "favorite",
  "flame.fill": "local-fire-department",
  "bolt.fill": "bolt",
  "star.fill": "star",
  "clock.fill": "access-time",
  "timer": "timer",
  "waveform": "graphic-eq",
  "chart.bar.fill": "bar-chart",
  "trophy.fill": "emoji-events",
  // Settings
  "gear": "settings",
  "bell.fill": "notifications",
  "moon.fill": "dark-mode",
  "sun.max.fill": "light-mode",
  "info.circle.fill": "info",
  "exclamationmark.triangle.fill": "warning",
  // AirPods
  "airpodspro": "headset",
  "headphones": "headset",
  "gyroscope": "360",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
