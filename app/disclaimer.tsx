import React, { useState } from "react";
import {
  ScrollView, Text, View, Pressable, StyleSheet, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const DISCLAIMER_KEY = "neckcare_disclaimer_accepted";

const CONTRAINDICATIONS = [
  { icon: "🦴", title: "颈椎骨折或手术后恢复期", desc: "骨折未愈合或术后未获医生许可前，请勿进行任何颈椎活动。" },
  { icon: "⚡", title: "脊髓压迫症状", desc: "出现四肢麻木、无力、大小便失禁等脊髓受压症状时，请立即就医。" },
  { icon: "💥", title: "急性颈椎间盘突出", desc: "急性发作期（剧烈疼痛、放射痛）请先休息并咨询医生，不宜锻炼。" },
  { icon: "🩺", title: "严重骨质疏松", desc: "骨质疏松患者进行颈椎活动需在专业人员指导下进行，防止骨折风险。" },
  { icon: "🔴", title: "颈椎不稳定（如类风湿关节炎）", desc: "寰枢关节不稳等情况下，颈椎旋转活动可能造成严重损伤。" },
  { icon: "🤕", title: "近期颈部外伤", desc: "颈部扭伤、挫伤等急性外伤期间，请休息并遵医嘱后再使用本 App。" },
];

const STOP_SIGNS = [
  "锻炼中出现剧烈疼痛或疼痛明显加重",
  "头晕、恶心、视物模糊或眼前发黑",
  "手臂、手指麻木或刺痛感突然加重",
  "颈部发出异常弹响并伴随疼痛",
];

export default function DisclaimerScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!checked || loading) return;
    setLoading(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    try {
      await AsyncStorage.setItem(DISCLAIMER_KEY, "1");
      router.replace("/(tabs)");
    } catch {
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  };

  const safeBottom = Math.max(insets.bottom, 16);

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.warning + "18", borderBottomColor: colors.warning + "40" }]}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>使用前请仔细阅读</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>健康安全声明</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + safeBottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* 适用说明 */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>📋 关于本应用</Text>
          <Text style={[styles.bodyText, { color: colors.muted }]}>
            NeckCare Coach 是一款颈椎健康辅助锻炼应用，提供的动作指导仅供参考，{" "}
            <Text style={{ color: colors.warning, fontWeight: "700" }}>不构成任何医疗诊断或治疗建议</Text>
            。本应用无法替代专业医疗评估，使用前请确认自身健康状况。
          </Text>
        </View>

        {/* 禁忌症 */}
        <View style={[styles.section, { backgroundColor: "#FFF3CD", borderColor: "#F59E0B40" }]}>
          <Text style={[styles.sectionTitle, { color: "#92400E" }]}>🚫 以下情况请勿使用</Text>
          <Text style={[styles.sectionDesc, { color: "#78350F" }]}>
            如果您存在以下任何情况，请在获得医生明确许可前不要使用本应用：
          </Text>
          {CONTRAINDICATIONS.map((item, idx) => (
            <View key={idx} style={[styles.contraItem, { borderTopColor: "#F59E0B30", borderTopWidth: idx === 0 ? 0 : 1 }]}>
              <Text style={styles.contraIcon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contraTitle, { color: "#92400E" }]}>{item.title}</Text>
                <Text style={[styles.contraDesc, { color: "#78350F" }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 立即停止信号 */}
        <View style={[styles.section, { backgroundColor: "#FEE2E2", borderColor: "#EF444440" }]}>
          <Text style={[styles.sectionTitle, { color: "#991B1B" }]}>🛑 出现以下症状请立即停止</Text>
          {STOP_SIGNS.map((sign, idx) => (
            <View key={idx} style={styles.stopSignRow}>
              <View style={[styles.stopDot, { backgroundColor: "#EF4444" }]} />
              <Text style={[styles.stopText, { color: "#7F1D1D" }]}>{sign}</Text>
            </View>
          ))}
          <Text style={[styles.stopFooter, { color: "#991B1B" }]}>
            停止后如症状持续，请尽快就医。
          </Text>
        </View>

        {/* 一般建议 */}
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>💡 使用建议</Text>
          <Text style={[styles.bodyText, { color: colors.muted }]}>
            • 锻炼前充分热身，动作应缓慢、轻柔，不要强行拉伸到疼痛位置{"\n"}
            • 如有颈椎疾病史，建议先咨询骨科或康复科医生{"\n"}
            • 老年人及儿童请在专业人员陪同下使用{"\n"}
            • 本应用记录的运动数据仅供个人参考，不作为医疗诊断依据
          </Text>
        </View>
      </ScrollView>

      {/* 底部确认区 */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: safeBottom + 8,
        },
      ]}>
        {/* 复选框 */}
        <Pressable
          onPress={() => {
            setChecked((v) => !v);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.checkRow}
        >
          <View style={[
            styles.checkbox,
            {
              borderColor: checked ? colors.primary : colors.border,
              backgroundColor: checked ? colors.primary : "transparent",
            },
          ]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkLabel, { color: colors.foreground }]}>
            我已阅读并了解上述健康安全声明，确认我目前的身体状况适合使用本应用
          </Text>
        </Pressable>

        {/* 确认按钮 */}
        <Pressable
          onPress={handleAccept}
          style={({ pressed }) => [
            styles.acceptBtn,
            {
              backgroundColor: checked ? colors.primary : colors.border,
              opacity: pressed ? 0.85 : 1,
              transform: pressed && checked ? [{ scale: 0.97 }] : [],
            },
          ]}
        >
          <Text style={[styles.acceptBtnText, { color: checked ? "#fff" : colors.muted }]}>
            {loading ? "正在进入..." : "我已了解，开始使用"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerIcon: { fontSize: 32 },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  headerSub: { fontSize: 13, marginTop: 2 },
  section: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  sectionDesc: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  bodyText: { fontSize: 13, lineHeight: 20 },
  contraItem: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    marginTop: 2,
  },
  contraIcon: { fontSize: 20, marginTop: 1 },
  contraTitle: { fontSize: 13, fontWeight: "700", marginBottom: 2 },
  contraDesc: { fontSize: 12, lineHeight: 17 },
  stopSignRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  stopDot: { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  stopText: { flex: 1, fontSize: 13, lineHeight: 19 },
  stopFooter: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkmark: { color: "#fff", fontSize: 13, fontWeight: "800" },
  checkLabel: { flex: 1, fontSize: 13, lineHeight: 19 },
  acceptBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  acceptBtnText: { fontSize: 16, fontWeight: "700" },
});
