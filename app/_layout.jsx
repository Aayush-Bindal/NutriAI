import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Onboarding from "../components/Onboarding";
import { COLORS } from "../constants/theme";
import { MealProvider } from "../context/MealContext";
import { ProfileProvider, useProfile } from "../context/ProfileContext";

function AppContent() {
  const { onboardingDone } = useProfile();

  if (!onboardingDone) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style="dark" />
        <Onboarding />
      </View>
    );
  }

  return (
    <MealProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="log"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </MealProvider>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <AppContent />
    </ProfileProvider>
  );
}
