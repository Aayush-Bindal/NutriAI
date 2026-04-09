import { Dimensions, PixelRatio } from "react-native";

const { width, height } = Dimensions.get("window");

// Responsive scale based on 390px base (iPhone 14)
const scale = width / 390;

export const rs = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(size * scale));
export const rf = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

export const W = width;
export const H = height;

export const LIGHT_COLORS = {
  bg: "#E8EDE6", // sage green background
  card: "#FFFFFF",
  cardAlt: "#F0F4EE",
  green: "#3D7A4F",
  greenLight: "#D4E8D8",
  greenMid: "#6AAE7C",
  greenDark: "#2D3B2D",
  greenMutedDark: "#425642",
  greenDeep: "#022C22",
  greenDisabled: "#B5D6B8",
  onboardingDisabledBtn: "#B5D6B8",
  onboardingDisabledBtnText: "#425642",
  dark: "#1A1F1B",
  mid: "#5A6B5D",
  muted: "#A0B0A3",
  white: "#FFFFFF",
  red: "#E8675A",
  redLight: "#FEF2F2",
  redDark: "#B91C1C",
  blue: "#5B8DD9",
  blueLight: "#F0F5FC",
  amber: "#D4A843",
  amberLight: "#FDF8EE",
  purple: "#9B7FD4",
  border: "#E2E8E0",
  shadow: "#1A3020",
  barTrack: "rgba(0,0,0,0.05)",
  blackScrim: "rgba(0,0,0,0.4)",
  darkScrim: "rgba(26, 31, 27, 0.45)",
};

export const DARK_COLORS = {
  bg: "#09110C",
  card: "#141F18",
  cardAlt: "#1B2A20",
  green: "#7BC58D",
  greenLight: "#1D2D22",
  greenMid: "#8BD09B",
  greenDark: "#2A5039",
  greenMutedDark: "#436F52",
  greenDeep: "#DDEBDD",
  greenDisabled: "#33483A",
  onboardingDisabledBtn: "#2A3A30",
  onboardingDisabledBtnText: "#849386",
  dark: "#F4F8F2",
  mid: "#C3D0C4",
  muted: "#849386",
  white: "#FFFFFF",
  red: "#D98378",
  redLight: "#2B1B1B",
  redDark: "#FCA5A5",
  blue: "#8FAFD4",
  blueLight: "#172432",
  amber: "#D8BC75",
  amberLight: "#2D2818",
  purple: "#BDA5EE",
  border: "#2A3A30",
  shadow: "#050A06",
  barTrack: "rgba(255,255,255,0.1)",
  blackScrim: "rgba(0,0,0,0.62)",
  darkScrim: "rgba(5, 10, 6, 0.68)",
};

export const COLORS = LIGHT_COLORS;

export const FONTS = {
  black: { fontWeight: "900" },
  bold: { fontWeight: "700" },
  semibold: { fontWeight: "600" },
  medium: { fontWeight: "500" },
  regular: { fontWeight: "400" },
};

export const makeShadow = (colors) => ({
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  green: {
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
});

export const SHADOW = makeShadow(LIGHT_COLORS);
