import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

export default function Chip({ label, icon, selected, onPress }) {
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.chip, selected && s.chipSelected]}
    >
      {icon && (
        <Text style={[s.chipIcon, selected && s.chipIconSelected]}>{icon}</Text>
      )}
      <Text style={[s.chipLabel, selected && s.chipLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={rf(18)}
          color={COLORS.green}
          style={{ marginLeft: rs(4) }}
        />
      )}
    </TouchableOpacity>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs(14),
    paddingHorizontal: rs(20),
    borderRadius: rs(16),
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  chipSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  chipIcon: { fontSize: rf(20), marginRight: rs(10) },
  chipIconSelected: {},
  chipLabel: {
    fontSize: rf(16),
    fontWeight: "600",
    color: COLORS.mid,
    flex: 1,
  },
  chipLabelSelected: { color: COLORS.dark },
});
