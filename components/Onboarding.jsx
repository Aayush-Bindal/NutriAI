import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, rs, W } from "../constants/theme";
import { useProfile } from "../context/ProfileContext";
import ActivityStep from "./onboarding/ActivityStep";
import ApiKeyStep from "./onboarding/ApiKeyStep";
import BasicInfoStep from "./onboarding/BasicInfoStep";
import BodyMetricsStep from "./onboarding/BodyMetricsStep";
import GoalStep from "./onboarding/GoalStep";
import WelcomeStep from "./onboarding/WelcomeStep";

// ═══════════════════════════════════════════════════════════
// MAIN ONBOARDING ORCHESTRATOR
// ═══════════════════════════════════════════════════════════
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const {
    updateProfile,
    completeOnboarding,
    restoreFromBackup,
    addWeightEntry,
  } = useProfile();
  const [step, setStep] = useState(0);

  // Local draft data for all fields
  const [draft, setDraft] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    goal: "",
    activity: "",
    apiKey: "",
  });

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTo = (nextStep) => {
    const direction = nextStep > step ? 1 : -1;
    slideAnim.setValue(direction * W);
    setStep(nextStep);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const updateDraft = (updates) => setDraft((p) => ({ ...p, ...updates }));

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile(draft);
    // Add the onboarding weight as the first weight history entry
    if (draft.weight) {
      addWeightEntry(draft.weight);
    }
    await completeOnboarding();
  };

  const handleRestore = async () => {
    const result = await restoreFromBackup();
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Restored", "Your data has been restored successfully!", [
        { text: "OK", onPress: () => completeOnboarding() },
      ]);
    } else if (!result.canceled) {
      Alert.alert("Error", result.error || "Failed to restore backup.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeStep onNext={() => animateTo(1)} onRestore={handleRestore} />
        );
      case 1:
        return (
          <BasicInfoStep
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(2)}
            onBack={() => animateTo(0)}
          />
        );
      case 2:
        return (
          <BodyMetricsStep
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(3)}
            onBack={() => animateTo(1)}
          />
        );
      case 3:
        return (
          <GoalStep
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(4)}
            onBack={() => animateTo(2)}
          />
        );
      case 4:
        return (
          <ActivityStep
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(5)}
            onBack={() => animateTo(3)}
          />
        );
      case 5:
        return (
          <ApiKeyStep
            data={draft}
            onChange={updateDraft}
            onFinish={handleFinish}
            onBack={() => animateTo(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        o.root,
        {
          paddingTop: insets.top + rs(12),
          paddingBottom: insets.bottom + rs(12),
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[o.stepWrap, { transform: [{ translateX: slideAnim }] }]}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const o = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: rs(24),
  },
  stepWrap: {
    flex: 1,
  },
});
