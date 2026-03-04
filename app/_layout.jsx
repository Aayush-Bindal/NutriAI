import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MealProvider } from "../context/MealContext";
import { ProfileProvider } from "../context/ProfileContext";

export default function RootLayout() {
  return (
    <ProfileProvider>
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
    </ProfileProvider>
  );
}