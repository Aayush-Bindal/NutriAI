import Constants from "expo-constants";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Onboarding from "../components/Onboarding";
import UpdateModal from "../components/profile/UpdateModal";
import { MealProvider } from "../context/MealContext";
import { ProfileProvider, useProfile } from "../context/ProfileContext";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import {
  checkForAppUpdate,
  getSkippedUpdateVersion,
  setSkippedUpdateVersion,
} from "../utils/appUpdate";

function AppContent() {
  const { onboardingDone } = useProfile();
  const { colors: COLORS, statusBarStyle } = useTheme();
  const [updateModal, setUpdateModal] = useState(null);
  const hasCheckedForUpdates = useRef(false);
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  useEffect(() => {
    if (!onboardingDone || hasCheckedForUpdates.current) return;

    hasCheckedForUpdates.current = true;
    let isMounted = true;

    const checkOnLaunch = async () => {
      try {
        const result = await checkForAppUpdate(appVersion);
        const skippedVersion = await getSkippedUpdateVersion();
        const shouldShow =
          result.status === "available" && result.version !== skippedVersion;

        if (isMounted && shouldShow) {
          setUpdateModal(result);
        }
      } catch {
        // Ignore silent launch-check failures.
      }
    };

    checkOnLaunch();

    return () => {
      isMounted = false;
    };
  }, [appVersion, onboardingDone]);

  if (!onboardingDone) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <StatusBar style={statusBarStyle} />
        <Onboarding />
      </View>
    );
  }

  return (
    <>
      <MealProvider>
        <StatusBar style={statusBarStyle} />
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

      <UpdateModal
        data={updateModal}
        appVersion={appVersion}
        onClose={() => setUpdateModal(null)}
        showSkipAction
        onSkipVersion={async (version) => {
          await setSkippedUpdateVersion(version);
          setUpdateModal(null);
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AppContent />
      </ProfileProvider>
    </ThemeProvider>
  );
}
