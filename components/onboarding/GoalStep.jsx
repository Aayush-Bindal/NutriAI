import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import StepDots from "./StepDots";
import { useStepStyles } from "./stepStyles";

function GoalOption({ label, iconName, selected, onPress }) {
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(createStyles);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.goalOption, selected && s.goalOptionSelected]}
    >
      <Ionicons
        name={iconName}
        size={rf(20)}
        color={selected ? COLORS.green : COLORS.mid}
        style={s.goalIcon}
      />
      <Text style={[s.goalLabel, selected && s.goalLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={rf(18)}
          color={COLORS.green}
          style={s.checkIcon}
        />
      )}
    </TouchableOpacity>
  );
}

export default function GoalStep({ data, onChange, onNext, onBack }) {
  const { colors: COLORS } = useTheme();
  const st = useStepStyles();
  const canNext = !!data.goal;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={4} />
        <Text style={st.title}>Your fitness goal</Text>
        <Text style={st.desc}>What&apos;s your primary goal right now?</Text>

        <View style={{ marginTop: rs(20), gap: rs(10) }}>
          <GoalOption
            label="Lose Weight"
            iconName="trending-down-outline"
            selected={data.goal === "lose"}
            onPress={() => onChange({ goal: "lose" })}
          />
          <GoalOption
            label="Stay Same"
            iconName="scale-outline"
            selected={data.goal === "maintain"}
            onPress={() => onChange({ goal: "maintain" })}
          />
          <GoalOption
            label="Gain Weight"
            iconName="trending-up-outline"
            selected={data.goal === "gain"}
            onPress={() => onChange({ goal: "gain" })}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onNext();
        }}
        style={[st.nextBtn, !canNext && st.nextBtnDisabled]}
      >
        <Text style={[st.nextBtnText, !canNext && st.nextBtnTextDisabled]}>
          Continue
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(18)}
          color={canNext ? COLORS.white : COLORS.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  goalOption: {
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
  goalOptionSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  goalIcon: { marginRight: rs(10) },
  goalLabel: {
    flex: 1,
    fontSize: rf(16),
    fontWeight: "600",
    color: COLORS.mid,
  },
  goalLabelSelected: { color: COLORS.dark },
  checkIcon: { marginLeft: rs(4) },
});
