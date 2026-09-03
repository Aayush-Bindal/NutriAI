import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import { DARK_COLORS, LIGHT_COLORS, makeShadow } from "../constants/theme";
import { configureHaptics } from "../utils/haptics";
import {
  disableMealReminders,
  enableMealReminders,
} from "../utils/mealNotifications";

const THEME_STORAGE_KEY = "nutriai_theme_mode";
const HAPTICS_STORAGE_KEY = "nutriai_haptics_enabled";
const NOTIFICATIONS_STORAGE_KEY = "nutriai_notifications_enabled";
const NOTIFICATION_PERMISSION_ASKED_KEY = "nutriai_notification_permission_asked";
const THEME_MODES = ["system", "light", "dark"];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState("system");
  const [hapticsEnabled, setHapticsEnabledState] = useState(true);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet([
      THEME_STORAGE_KEY,
      HAPTICS_STORAGE_KEY,
      NOTIFICATIONS_STORAGE_KEY,
      NOTIFICATION_PERMISSION_ASKED_KEY,
    ])
      .then(async (entries) => {
        const storedMode = entries.find(([key]) => key === THEME_STORAGE_KEY)?.[1];
        const storedHaptics = entries.find(
          ([key]) => key === HAPTICS_STORAGE_KEY,
        )?.[1];
        const storedNotifications = entries.find(
          ([key]) => key === NOTIFICATIONS_STORAGE_KEY,
        )?.[1];
        const permissionWasAsked = entries.find(
          ([key]) => key === NOTIFICATION_PERMISSION_ASKED_KEY,
        )?.[1] === "true";
        const nextHapticsEnabled = storedHaptics !== "false";
        const nextNotificationsEnabled = storedNotifications === "true";

        if (THEME_MODES.includes(storedMode)) {
          setModeState(storedMode);
        }

        setHapticsEnabledState(nextHapticsEnabled);
        configureHaptics(nextHapticsEnabled);

        // Ask once on the first launch. A granted permission also opts the
        // user into the four gentle meal reminders immediately.
        if (!permissionWasAsked && storedNotifications == null) {
          const enabled = await enableMealReminders().catch((error) => {
            console.warn("Notification permission error:", error);
            return false;
          });
          setNotificationsEnabledState(enabled);
          await AsyncStorage.multiSet([
            [NOTIFICATION_PERMISSION_ASKED_KEY, "true"],
            [NOTIFICATIONS_STORAGE_KEY, String(enabled)],
          ]);
        } else {
          setNotificationsEnabledState(nextNotificationsEnabled);
        }

        if (
          nextNotificationsEnabled &&
          (permissionWasAsked || storedNotifications != null)
        ) {
          enableMealReminders().catch(console.warn);
        }
      })
      .catch(console.warn)
      .finally(() => setLoaded(true));
  }, []);

  const setNotificationsEnabled = useCallback(async (nextEnabled) => {
    const previousValue = notificationsEnabled;
    // Update the switch immediately while the native permission/scheduling
    // work completes, then roll it back if the operation fails.
    setNotificationsEnabledState(nextEnabled);

    try {
      if (nextEnabled) {
        const enabled = await enableMealReminders();
        if (!enabled) throw new Error("Notification permission was denied");
      } else {
        await disableMealReminders();
      }

      AsyncStorage.setItem(
        NOTIFICATIONS_STORAGE_KEY,
        String(nextEnabled),
      ).catch(console.warn);
      return true;
    } catch (error) {
      setNotificationsEnabledState(previousValue);
      console.warn("Could not update meal reminders:", error);
      return false;
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!loaded) return;

    // RN 0.86's Android implementation does not accept null here. Use the
    // explicit value that tells native code to follow the system preference.
    Appearance.setColorScheme(mode === "system" ? "unspecified" : mode);
  }, [loaded, mode]);

  const setMode = useCallback((nextMode) => {
    if (!THEME_MODES.includes(nextMode)) return;
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(console.warn);
  }, []);

  const setHapticsEnabled = useCallback((nextEnabled) => {
    configureHaptics(nextEnabled);
    setHapticsEnabledState(nextEnabled);
    AsyncStorage.setItem(HAPTICS_STORAGE_KEY, String(nextEnabled)).catch(
      console.warn,
    );
  }, []);

  const resolvedMode = mode === "system" ? systemScheme || "light" : mode;
  const colors = resolvedMode === "dark" ? DARK_COLORS : LIGHT_COLORS;
  const shadow = useMemo(() => makeShadow(colors), [colors]);

  useEffect(() => {
    if (!loaded) return;

    SystemUI.setBackgroundColorAsync(colors.bg).catch(console.warn);
  }, [colors.bg, loaded]);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      setMode,
      hapticsEnabled,
      setHapticsEnabled,
      notificationsEnabled,
      setNotificationsEnabled,
      colors,
      shadow,
      statusBarStyle: resolvedMode === "dark" ? "light" : "dark",
    }),
    [
      colors,
      hapticsEnabled,
      mode,
      resolvedMode,
      setHapticsEnabled,
      setNotificationsEnabled,
      setMode,
      shadow,
    ],
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return theme;
}

export function useThemedStyles(styleFactory) {
  const { colors, shadow } = useTheme();
  return useMemo(
    () => styleFactory(colors, shadow),
    [colors, shadow, styleFactory],
  );
}
