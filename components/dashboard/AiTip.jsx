import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";

export default function AiTip({ tip }) {
  if (!tip) return null;

  return (
    <View style={[s.tip, SHADOW.sm]}>
      <View style={s.tipBadge}>
        <Ionicons name="sparkles" size={rf(12)} color={COLORS.green} />
        <Text style={s.tipBadgeTxt}>AI Tip</Text>
      </View>
      <Text style={s.tipTxt}>{tip}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  tip: {
    backgroundColor: COLORS.card,
    borderRadius: rs(24),
    padding: rs(16),
    marginBottom: rs(24),
    flexDirection: "row",
    gap: rs(12),
    alignItems: "center",
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(99),
    paddingHorizontal: rs(12),
    paddingVertical: rs(6),
  },
  tipBadgeTxt: { fontSize: rf(11), fontWeight: "800", color: COLORS.green },
  tipTxt: {
    flex: 1,
    fontSize: rf(14),
    fontWeight: "500",
    color: COLORS.mid,
    lineHeight: rf(20),
  },
});
