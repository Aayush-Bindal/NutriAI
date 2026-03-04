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

export const COLORS = {
  bg: "#E8EDE6", // sage green background
  card: "#FFFFFF",
  cardAlt: "#F0F4EE",
  green: "#3D7A4F",
  greenLight: "#D4E8D8",
  greenMid: "#6AAE7C",
  dark: "#1A1F1B",
  mid: "#5A6B5D",
  muted: "#A0B0A3",
  white: "#FFFFFF",
  red: "#E8675A",
  blue: "#5B8DD9",
  amber: "#D4A843",
  purple: "#9B7FD4",
  border: "#E2E8E0",
};

export const FONTS = {
  black: { fontWeight: "900" },
  bold: { fontWeight: "700" },
  semibold: { fontWeight: "600" },
  medium: { fontWeight: "500" },
  regular: { fontWeight: "400" },
};

export const SHADOW = {
  sm: {
    shadowColor: "#1A3020",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#1A3020",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 6,
  },
  green: {
    shadowColor: "#3D7A4F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};
