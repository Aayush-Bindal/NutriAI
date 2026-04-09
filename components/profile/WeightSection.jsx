import { Ionicons } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";
import WeightGraph from "./WeightGraph";

const getBmiCategory = (val) => {
  if (val < 18.5) return { label: "Underweight", color: COLORS.blue };
  if (val < 25) return { label: "Normal", color: COLORS.green };
  if (val < 30) return { label: "Overweight", color: COLORS.amber };
  return { label: "Obese", color: COLORS.red };
};

export default function WeightSection({
  currentWeight,
  bmi,
  weightInput,
  setWeightInput,
  onUpdateWeight,
  weightHistory,
  onDeleteWeight,
}) {
  const bmiInfo = bmi ? getBmiCategory(parseFloat(bmi)) : null;

  return (
    <>
      {/* Weight card */}
      <View style={s.card}>
        <View style={s.secHeader}>
          <Ionicons
            name="trending-up-outline"
            size={rf(18)}
            color={COLORS.green}
          />
          <Text style={s.secTitle}>Weight</Text>
        </View>

        <View style={s.weightRow}>
          <View style={s.weightMain}>
            <Text style={s.weightValue}>{currentWeight || "--"}</Text>
            <Text style={s.weightUnit}>kg</Text>
          </View>

          {bmi && (
            <View style={s.bmiBox}>
              <Text style={s.bmiLabel}>BMI</Text>
              <Text style={[s.bmiValue, { color: bmiInfo.color }]}>{bmi}</Text>
              <View
                style={[s.bmiTag, { backgroundColor: bmiInfo.color + "20" }]}
              >
                <Text style={[s.bmiTagText, { color: bmiInfo.color }]}>
                  {bmiInfo.label}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Update weight */}
        <View style={s.updateRow}>
          <View style={[s.inputBox, { flex: 1 }]}>
            <TextInput
              style={[s.inputBoxText, { flex: 1 }]}
              value={weightInput}
              onChangeText={(v) => setWeightInput(v.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="New weight"
              placeholderTextColor={COLORS.muted}
            />
            <Text style={s.inputUnit}>kg</Text>
          </View>
          <TouchableOpacity
            style={[s.updateBtn, !weightInput && s.updateBtnOff]}
            activeOpacity={0.8}
            disabled={!weightInput}
            onPress={onUpdateWeight}
          >
            <Ionicons
              name="checkmark"
              size={rf(20)}
              color={weightInput ? COLORS.white : COLORS.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress graph card */}
      <View style={s.card}>
        <View style={s.secHeader}>
          <Ionicons
            name="analytics-outline"
            size={rf(18)}
            color={COLORS.green}
          />
          <Text style={s.secTitle}>Progress</Text>
        </View>
        <WeightGraph data={weightHistory} onDelete={onDeleteWeight} />
      </View>
    </>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(20),
    marginBottom: rs(16),
    ...SHADOW.sm,
  },
  secHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginBottom: rs(16),
  },
  secTitle: {
    fontSize: rf(16),
    fontWeight: "800",
    color: COLORS.dark,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(16),
  },
  weightMain: { flexDirection: "row", alignItems: "baseline", gap: rs(4) },
  weightValue: {
    fontSize: rf(48),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -2,
  },
  weightUnit: {
    fontSize: rf(18),
    fontWeight: "600",
    color: COLORS.muted,
  },
  bmiBox: { alignItems: "center" },
  bmiLabel: {
    fontSize: rf(10),
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bmiValue: {
    fontSize: rf(28),
    fontWeight: "900",
    letterSpacing: -1,
  },
  bmiTag: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(3),
    borderRadius: rs(8),
    marginTop: rs(2),
  },
  bmiTagText: {
    fontSize: rf(10),
    fontWeight: "700",
  },
  updateRow: {
    flexDirection: "row",
    gap: rs(10),
    alignItems: "center",
  },
  updateBtn: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(14),
    backgroundColor: COLORS.greenMutedDark,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.green,
  },
  updateBtnOff: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
  },
  inputBoxText: {
    fontSize: rf(16),
    fontWeight: "700",
    color: COLORS.dark,
  },
  inputUnit: {
    fontSize: rf(12),
    fontWeight: "600",
    color: COLORS.muted,
    marginLeft: rs(6),
  },
});
