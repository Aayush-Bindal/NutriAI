import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const MAX_APP_WIDTH = 520;

function getIsDesktopWidth() {
  return window.innerWidth > MAX_APP_WIDTH;
}

export default function WebViewportGate({ children }) {
  const [isDesktopWidth, setIsDesktopWidth] = useState(getIsDesktopWidth);

  useEffect(() => {
    const handleResize = () => setIsDesktopWidth(getIsDesktopWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktopWidth) return children;

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Ionicons name="phone-portrait-outline" size={64} color="#295e42" />
        <Text style={styles.title}>Open NutriAI on mobile</Text>
        <Text style={styles.body}>
          This app is designed for a phone-sized screen. Open it on your mobile
          browser or resize this window to a mobile width.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100vh",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EDE6",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 28,
    shadowColor: "#123020",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  title: {
    marginTop: 18,
    color: "#123020",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  body: {
    marginTop: 10,
    color: "#557062",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
});
