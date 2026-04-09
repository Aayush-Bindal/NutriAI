import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme } from "../../context/ThemeContext";
import LabelInput from "./LabelInput";
import StepDots from "./StepDots";
import { useStepStyles } from "./stepStyles";

export default function ApiKeyStep({ data, onChange, onFinish, onBack }) {
  const { colors: COLORS } = useTheme();
  const st = useStepStyles();
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={6} />
        <Text style={st.title}>Power up with AI</Text>
        <Text style={st.desc}>
          Add your Gemini API key to unlock AI-powered meal analysis. You can
          get one for free from Google AI Studio.
        </Text>

        <View style={{ marginTop: rs(24) }}>
          <LabelInput
            label="Gemini API Key"
            value={data.apiKey}
            onChangeText={(v) => onChange({ apiKey: v.trim() })}
            placeholder="Paste your API key here"
          />
        </View>

        <View style={st.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={rf(24)}
            color={COLORS.green}
          />
          <Text style={st.infoCardText}>
            Your API key is stored securely on your device and never shared with
            anyone.
          </Text>
        </View>
      </View>

      <View style={{ gap: rs(12) }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onFinish();
          }}
          style={st.nextBtn}
        >
          <Text style={st.nextBtnText}>
            {data.apiKey ? "Let's Go!" : "I'll add later"}
          </Text>
          <Ionicons name="checkmark-done" size={rf(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
