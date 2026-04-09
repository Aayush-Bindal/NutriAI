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

const THEME_STORAGE_KEY = "nutriai_theme_mode";
const THEME_MODES = ["system", "light", "dark"];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((storedMode) => {
        if (THEME_MODES.includes(storedMode)) {
          setModeState(storedMode);
        }
      })
      .catch(console.warn)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;

    Appearance.setColorScheme(mode === "system" ? null : mode);
  }, [loaded, mode]);

  const setMode = useCallback((nextMode) => {
    if (!THEME_MODES.includes(nextMode)) return;
    setModeState(nextMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode).catch(console.warn);
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
      colors,
      shadow,
      statusBarStyle: resolvedMode === "dark" ? "light" : "dark",
    }),
    [colors, mode, resolvedMode, setMode, shadow],
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
