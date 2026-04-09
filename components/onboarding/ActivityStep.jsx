import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";
import StepDots from "./StepDots";
import st from "./stepStyles";

function ActivityOption({ label, desc, iconName, selected, onPress }) {
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
      style={[s.activityOption, selected && s.activityOptionSelected]}
    >
      <Ionicons
        name={iconName}
        size={rf(20)}
        color={selected ? COLORS.green : COLORS.mid}
        style={s.activityIcon}
      />
      <View style={s.activityCopy}>
        <Text style={[s.activityLabel, selected && s.activityLabelSelected]}>
          {label}
        </Text>
        <Text style={s.activityDesc}>{desc}</Text>
      </View>
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

export default function ActivityStep({ data, onChange, onNext, onBack }) {
  const canNext = !!data.activity;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={4} />
        <Text style={st.title}>Activity level</Text>
        <Text style={st.desc}>How active are you on a typical week?</Text>

        <View style={{ marginTop: rs(20), gap: rs(10) }}>
          <ActivityOption
            label="Sedentary"
            desc="Desk job, little exercise"
            iconName="bed-outline"
            selected={data.activity === "sedentary"}
            onPress={() => onChange({ activity: "sedentary" })}
          />
          <ActivityOption
            label="Lightly Active"
            desc="Light exercise 1-3x/week"
            iconName="walk-outline"
            selected={data.activity === "light"}
            onPress={() => onChange({ activity: "light" })}
          />
          <ActivityOption
            label="Moderately Active"
            desc="Moderate exercise 3-5x/week"
            iconName="fitness-outline"
            selected={data.activity === "moderate"}
            onPress={() => onChange({ activity: "moderate" })}
          />
          <ActivityOption
            label="Very Active"
            desc="Hard training 6-7x/week"
            iconName="barbell-outline"
            selected={data.activity === "active"}
            onPress={() => onChange({ activity: "active" })}
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

const s = StyleSheet.create({
  activityOption: {
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
  activityOptionSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  activityIcon: { marginRight: rs(10) },
  activityCopy: { flex: 1 },
  activityLabel: {
    fontSize: rf(16),
    fontWeight: "600",
    color: COLORS.mid,
  },
  activityLabelSelected: { color: COLORS.dark },
  activityDesc: {
    fontSize: rf(12),
    fontWeight: "500",
    color: COLORS.muted,
    marginTop: rs(3),
  },
  checkIcon: { marginLeft: rs(4) },
});
