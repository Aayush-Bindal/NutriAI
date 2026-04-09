import { StyleSheet, Text, TextInput, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

export default function LabelInput({
  label,
  value,
  onChangeText,
  keyboardType,
  unit,
  placeholder,
}) {
  const { colors: COLORS } = useTheme();
  const s = useLabelInputStyles();
  return (
    <View style={s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          placeholder={placeholder || ""}
          placeholderTextColor={COLORS.muted}
          selectionColor={COLORS.green}
        />
        {unit && <Text style={s.unit}>{unit}</Text>}
      </View>
    </View>
  );
}

const createLabelInputStyles = (COLORS, SHADOW) => StyleSheet.create({
  wrap: { marginBottom: rs(18) },
  label: {
    fontSize: rf(13),
    fontWeight: "600",
    color: COLORS.mid,
    marginBottom: rs(6),
    marginLeft: rs(4),
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: rs(16),
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: rs(18),
    ...SHADOW.sm,
  },
  input: {
    flex: 1,
    fontSize: rf(18),
    fontWeight: "700",
    color: COLORS.dark,
    paddingVertical: rs(16),
  },
  unit: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.muted,
    marginLeft: rs(6),
  },
});

export function useLabelInputStyles() {
  return useThemedStyles(createLabelInputStyles);
}
