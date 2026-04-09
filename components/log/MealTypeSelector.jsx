import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

const MEAL_TYPES = [
  { label: "Breakfast", icon: "partly-sunny-outline" },
  { label: "Lunch", icon: "sunny-outline" },
  { label: "Dinner", icon: "moon-outline" },
  { label: "Snack", icon: "cafe-outline" },
];

export default function MealTypeSelector({ mealType, setMealType }) {
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(createStyles);
  return (
    <>
      <Text style={s.secLabel}>Which meal?</Text>
      <View style={s.mealRow}>
        {MEAL_TYPES.map((m) => {
          const isSelected = mealType === m.label;
          return (
            <TouchableOpacity
              key={m.label}
              style={[s.mealChip, isSelected && s.mealChipOn]}
              onPress={() => setMealType(m.label)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={m.icon}
                size={rf(22)}
                color={isSelected ? COLORS.white : COLORS.dark}
                style={s.mealIcon}
              />
              <Text style={[s.mealTxt, isSelected && s.mealTxtOn]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
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
  mealChipOn: {
    backgroundColor: COLORS.greenMutedDark,
  },
  mealIcon: { marginBottom: rs(4) },
  mealTxt: { fontSize: rf(10), fontWeight: "700", color: COLORS.muted },
  mealTxtOn: { color: COLORS.white },
});
