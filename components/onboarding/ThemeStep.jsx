import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "../../utils/haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import StepDots from "./StepDots";
import { useStepStyles } from "./stepStyles";

const THEME_OPTIONS = [
  {
    key: "system",
    label: "System",
    desc: "Match your phone",
    icon: "phone-portrait-outline",
  },
  {
    key: "light",
    label: "Light",
    desc: "Bright and fresh",
    icon: "sunny-outline",
  },
  {
    key: "dark",
    label: "Dark",
    desc: "Deep green-black",
    icon: "moon-outline",
  },
];

export default function ThemeStep({ onNext, onBack }) {
  const { colors: COLORS, mode, setMode } = useTheme();
  const st = useStepStyles();
  const s = useThemedStyles(createStyles);

  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={1} />
        <Text style={st.title}>Choose your look</Text>
        <Text style={st.desc}>
          Pick a theme now. You can change it anytime in Settings.
        </Text>

        <View style={s.options}>
          {THEME_OPTIONS.map((item) => {
            const selected = mode === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[s.option, selected && s.optionSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setMode(item.key);
                }}
              >
                <View style={[s.iconWrap, selected && s.iconWrapSelected]}>
                  <Ionicons
                    name={item.icon}
                    size={rf(22)}
                    color={selected ? COLORS.white : COLORS.green}
                  />
                </View>
                <View style={s.optionCopy}>
                  <Text style={[s.optionTitle, selected && s.optionTitleOn]}>
                    {item.label}
                  </Text>
                  <Text style={s.optionDesc}>{item.desc}</Text>
                </View>
                {selected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={rf(20)}
                    color={COLORS.green}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onNext();
        }}
        style={st.nextBtn}
      >
        <Text style={st.nextBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={rf(18)} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS, SHADOW) =>
  StyleSheet.create({
    options: {
      marginTop: rs(24),
      gap: rs(10),
    },
    option: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.card,
      borderRadius: rs(16),
      borderWidth: 2,
      borderColor: COLORS.border,
      padding: rs(14),
      ...SHADOW.sm,
    },
    optionSelected: {
      borderColor: COLORS.green,
      backgroundColor: COLORS.greenLight,
    },
    iconWrap: {
      width: rs(44),
      height: rs(44),
      borderRadius: rs(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.cardAlt,
      marginRight: rs(12),
    },
    iconWrapSelected: {
      backgroundColor: COLORS.greenMutedDark,
    },
    optionCopy: {
      flex: 1,
    },
    optionTitle: {
      fontSize: rf(15),
      fontWeight: "800",
      color: COLORS.dark,
    },
    optionTitleOn: {
      color: COLORS.dark,
    },
    optionDesc: {
      fontSize: rf(12),
      fontWeight: "500",
      color: COLORS.muted,
      marginTop: rs(2),
    },
  });

