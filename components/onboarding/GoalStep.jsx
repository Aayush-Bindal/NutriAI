import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, View } from "react-native";
import { COLORS, rf, rs } from "../../constants/theme";
import Chip from "./Chip";
import StepDots from "./StepDots";
import st from "./stepStyles";

export default function GoalStep({ data, onChange, onNext, onBack }) {
  const canNext = !!data.goal;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={3} />
        <Text style={st.title}>Your fitness goal</Text>
        <Text style={st.desc}>What&apos;s your primary goal right now?</Text>

        <View style={{ marginTop: rs(20), gap: rs(10) }}>
          <Chip
            label="Lose Weight"
            icon="🔥"
            selected={data.goal === "lose"}
            onPress={() => onChange({ goal: "lose" })}
          />
          <Chip
            label="Stay Same"
            icon="⚖️"
            selected={data.goal === "maintain"}
            onPress={() => onChange({ goal: "maintain" })}
          />
          <Chip
            label="Gain Weight"
            icon="💪"
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
