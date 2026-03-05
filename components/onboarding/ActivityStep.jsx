import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs } from "../../constants/theme";
import Chip from "./Chip";
import StepDots from "./StepDots";
import st from "./stepStyles";

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
          <Chip
            label="Sedentary"
            icon="🪑"
            selected={data.activity === "sedentary"}
            onPress={() => onChange({ activity: "sedentary" })}
          />
          <Chip
            label="Lightly Active"
            icon="🚶"
            selected={data.activity === "light"}
            onPress={() => onChange({ activity: "light" })}
          />
          <Chip
            label="Moderately Active"
            icon="🏃"
            selected={data.activity === "moderate"}
            onPress={() => onChange({ activity: "moderate" })}
          />
          <Chip
            label="Very Active"
            icon="🏋️"
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
