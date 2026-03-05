import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";

const MEAL_TYPES = [
  { label: "Breakfast", emoji: "🌅" },
  { label: "Lunch", emoji: "☀️" },
  { label: "Dinner", emoji: "🌙" },
  { label: "Snack", emoji: "🍎" },
];

export default function MealTypeSelector({ mealType, setMealType }) {
  return (
    <>
      <Text style={s.secLabel}>Which meal?</Text>
      <View style={s.mealRow}>
        {MEAL_TYPES.map((m) => (
          <TouchableOpacity
            key={m.label}
            style={[s.mealChip, mealType === m.label && s.mealChipOn]}
            onPress={() => setMealType(m.label)}
            activeOpacity={0.75}
          >
            <Text style={s.mealEmoji}>{m.emoji}</Text>
            <Text style={[s.mealTxt, mealType === m.label && s.mealTxtOn]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  secLabel: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(10),
  },
  mealRow: { flexDirection: "row", gap: rs(8), marginBottom: rs(24) },
  mealChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: rs(12),
    backgroundColor: COLORS.card,
    borderRadius: rs(18),
    borderWidth: rs(2),
    borderColor: "transparent",
    ...SHADOW.sm,
  },
  mealChipOn: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  mealEmoji: { fontSize: rf(20), marginBottom: rs(4) },
  mealTxt: { fontSize: rf(10), fontWeight: "700", color: COLORS.muted },
  mealTxtOn: { color: COLORS.green },
});
