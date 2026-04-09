import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "../../utils/haptics";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import LabelInput from "./LabelInput";
import StepDots from "./StepDots";
import { useStepStyles } from "./stepStyles";

const API_KEY_URL = "https://aistudio.google.com/app/apikey";

export default function ApiKeyStep({ data, onChange, onFinish, onBack }) {
  const { colors: COLORS } = useTheme();
  const st = useStepStyles();
  const s = useThemedStyles(createStyles);
  const [showGuide, setShowGuide] = useState(false);

  const openAiStudio = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(API_KEY_URL);
  };

  const toggleGuide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowGuide((value) => !value);
  };

  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={6} />
        <Text style={st.title}>Power up with AI</Text>
        <View style={s.descRow}>
          <Text style={[st.desc, s.descText]}>
            Add your Gemini API key to unlock AI-powered meal analysis. You can
            get one for free from Google AI Studio.
          </Text>
          <TouchableOpacity
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Show API key walkthrough"
            accessibilityState={{ expanded: showGuide }}
            onPress={toggleGuide}
            style={s.helpBtn}
          >
            <Text style={s.helpBtnText}>?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="link"
          accessibilityLabel="Get a free Gemini API key from Google AI Studio"
          onPress={openAiStudio}
          style={s.aiStudioBtn}
        >
          <Ionicons
            name="open-outline"
            size={rf(18)}
            color={COLORS.green}
          />
          <Text style={s.aiStudioBtnText}>
            Get free key from Google AI Studio
          </Text>
        </TouchableOpacity>

        <View style={{ marginTop: rs(18) }}>
          <LabelInput
            label="Gemini API Key"
            value={data.apiKey}
            onChangeText={(v) => onChange({ apiKey: v.trim() })}
            placeholder="Paste your API key here"
          />
        </View>

        {showGuide && (
          <View style={s.demoCard}>
            <View style={s.demoHeader}>
              <Ionicons
                name="play-circle-outline"
                size={rf(18)}
                color={COLORS.green}
              />
              <Text style={s.demoTitle}>Quick key walkthrough</Text>
            </View>
            <Image
              source={require("../../docs/api-key-guide.gif")}
              style={s.demoImage}
              contentFit="contain"
            />
          </View>
        )}

        <View style={[st.infoCard, s.secureNote]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={rf(18)}
            color={COLORS.green}
          />
          <Text style={[st.infoCardText, s.secureNoteText]}>
            Stored only on your device.
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

const createStyles = (COLORS, SHADOW) =>
  StyleSheet.create({
    descRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: rs(10),
    },
    descText: {
      flex: 1,
    },
    helpBtn: {
      width: rs(30),
      height: rs(30),
      borderRadius: rs(15),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.card,
      borderWidth: 2,
      borderColor: COLORS.border,
      marginTop: rs(4),
    },
    helpBtnText: {
      color: COLORS.green,
      fontSize: rf(16),
      fontWeight: "900",
    },
    aiStudioBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.card,
      borderRadius: rs(14),
      borderWidth: 2,
      borderColor: COLORS.border,
      gap: rs(8),
      marginTop: rs(18),
      paddingVertical: rs(14),
      paddingHorizontal: rs(14),
      ...SHADOW.sm,
    },
    aiStudioBtnText: {
      color: COLORS.green,
      fontSize: rf(14),
      fontWeight: "800",
    },
    demoCard: {
      backgroundColor: COLORS.card,
      borderRadius: rs(16),
      borderWidth: 2,
      borderColor: COLORS.border,
      marginTop: rs(2),
      overflow: "hidden",
      ...SHADOW.sm,
    },
    demoHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: rs(8),
      paddingHorizontal: rs(14),
      paddingVertical: rs(12),
    },
    demoTitle: {
      color: COLORS.dark,
      fontSize: rf(14),
      fontWeight: "800",
    },
    demoImage: {
      width: "100%",
      height: rs(160),
      backgroundColor: COLORS.cardAlt,
    },
    secureNote: {
      borderRadius: rs(12),
      gap: rs(8),
      marginTop: rs(12),
      paddingHorizontal: rs(12),
      paddingVertical: rs(10),
    },
    secureNoteText: {
      fontSize: rf(12),
      lineHeight: rf(16),
    },
  });
