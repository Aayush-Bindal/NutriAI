import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";
import LabelInput, { labelInputStyles as li } from "./LabelInput";
import StepDots from "./StepDots";
import st from "./stepStyles";

function GenderOption({ label, iconName, selected, onPress }) {
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
      style={[s.genderOption, selected && s.genderOptionSelected]}
    >
      <Ionicons
        name={iconName}
        size={rf(20)}
        color={selected ? COLORS.green : COLORS.mid}
        style={s.genderIcon}
      />
      <Text style={[s.genderLabel, selected && s.genderLabelSelected]}>
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

export default function BasicInfoStep({ data, onChange, onNext, onBack }) {
  const canNext = data.name.trim() && data.age && data.gender;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={1} />
        <Text style={st.title}>Tell us about you</Text>
        <Text style={st.desc}>
          We&apos;ll use this to calculate your daily nutrition targets.
        </Text>

        <View style={{ marginTop: rs(24) }}>
          <LabelInput
            label="Your Name"
            value={data.name}
            onChangeText={(v) => onChange({ name: v })}
            placeholder="e.g. Rahul"
          />
          <LabelInput
            label="Age"
            value={data.age}
            onChangeText={(v) => onChange({ age: v.replace(/[^0-9]/g, "") })}
            keyboardType="number-pad"
            placeholder="e.g. 25"
            unit="years"
          />

          <Text style={li.label}>GENDER</Text>
          <View style={st.chipRow}>
            <GenderOption
              label="Male"
              iconName="male-outline"
              selected={data.gender === "male"}
              onPress={() => onChange({ gender: "male" })}
            />
            <GenderOption
              label="Female"
              iconName="female-outline"
              selected={data.gender === "female"}
              onPress={() => onChange({ gender: "female" })}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Keyboard.dismiss();
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
  genderOption: {
    flex: 1,
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
  genderOptionSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  genderIcon: { marginRight: rs(10) },
  genderLabel: {
    flex: 1,
    fontSize: rf(16),
    fontWeight: "600",
    color: COLORS.mid,
  },
  genderLabelSelected: { color: COLORS.dark },
  checkIcon: { marginLeft: rs(4) },
});
