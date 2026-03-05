import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs } from "../../constants/theme";
import Chip from "./Chip";
import LabelInput, { labelInputStyles as li } from "./LabelInput";
import StepDots from "./StepDots";
import st from "./stepStyles";

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
            <Chip
              label="Male"
              icon="🙋‍♂️"
              selected={data.gender === "male"}
              onPress={() => onChange({ gender: "male" })}
            />
            <Chip
              label="Female"
              icon="🙋‍♀️"
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
