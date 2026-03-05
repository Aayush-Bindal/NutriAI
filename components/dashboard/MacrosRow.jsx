import { StyleSheet, Text, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";

export default function MacrosRow({ totals, macroGoals }) {
  const goals = macroGoals || { protein: 150, carbs: 225, fat: 56, fiber: 25 };
  const macros = [
    {
      label: "Carbs",
      value: totals.carbs,
      max: goals.carbs,
      color: COLORS.red,
      bg: "#FDF2F1",
    },
    {
      label: "Protein",
      value: totals.protein,
      max: goals.protein,
      color: COLORS.blue,
      bg: "#F0F5FC",
    },
    {
      label: "Fat",
      value: totals.fat,
      max: goals.fat,
      color: COLORS.amber,
      bg: "#FDF8EE",
    },
    {
      label: "Fiber",
      value: totals.fiber || 0,
      max: goals.fiber || 25,
      color: COLORS.green,
      bg: "#EFF6F0",
    },
  ];

  return (
    <View style={s.macroGrid}>
      {macros.map((m) => (
        <View
          key={m.label}
          style={[s.macroCard, { backgroundColor: m.bg }, SHADOW.sm]}
        >
          <Text style={s.macroLbl}>{m.label}</Text>
          <Text style={[s.macroVal, { color: m.color }]}>
            {m.value}
            <Text style={s.macroG}>g</Text>
          </Text>
          <Text style={s.macroMax}>/ {m.max}g</Text>
          <View style={s.macroBar}>
            <View
              style={[
                s.macroFill,
                {
                  backgroundColor: m.color,
                  width: `${Math.min((m.value / m.max) * 100, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  macroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(12),
    marginBottom: rs(20),
  },
  macroCard: {
    width: "47%",
    flexGrow: 1,
    borderRadius: rs(24),
    padding: rs(16),
  },
  macroLbl: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: rs(6),
  },
  macroVal: { fontSize: rf(24), fontWeight: "900", letterSpacing: -0.5 },
  macroG: { fontSize: rf(14), fontWeight: "600" },
  macroMax: {
    fontSize: rf(11),
    color: COLORS.muted,
    fontWeight: "500",
    marginTop: rs(2),
    marginBottom: rs(12),
  },
  macroBar: {
    height: rs(6),
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: rs(99),
    overflow: "hidden",
  },
  macroFill: { height: "100%", borderRadius: rs(99) },
});
