import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLatestApkUrl } from "../utils/getApkUrl";

const DISMISS_KEY = "nutriai_pwa_prompt_dismissed";

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isPwaInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function WebPlatformPrompt() {
  const [visible, setVisible] = useState(false);
  const [apkUrl, setApkUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPwaInstalled()) return;

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) return;

    if (!isAndroid() && !isIOS()) return;

    setVisible(true);

    if (isAndroid()) {
      setLoading(true);
      getLatestApkUrl().then((url) => {
        setApkUrl(url);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const handleDownload = () => {
    if (apkUrl) {
      window.open(apkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
          <Ionicons name="close-circle" size={24} color="#888" />
        </TouchableOpacity>

        <Text style={styles.icon}>
          {isAndroid() ? "🤖" : "📱"}
        </Text>

        <Text style={styles.title}>
          {isAndroid() ? "Get NutriAI on Android" : "Install NutriAI"}
        </Text>

        {isAndroid() ? (
          <>
            <Text style={styles.body}>
              Download the APK and install it directly on your Android device.
            </Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleDownload}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Loading..." : "Download APK"}
              </Text>
            </TouchableOpacity>
            {apkUrl && (
              <TouchableOpacity onPress={handleDownload}>
                <Text style={styles.link}>Or copy download link</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Add NutriAI to your Home Screen for a full app experience.
            </Text>
            <View style={styles.instructions}>
              <Text style={styles.step}>
                1. Tap the <Text style={styles.bold}>Share</Text> button
              </Text>
              <Text style={styles.step}>
                2. Select{" "}
                <Text style={styles.bold}>Add to Home Screen</Text>
              </Text>
              <Text style={styles.step}>
                3. Tap <Text style={styles.bold}>Add</Text>
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleDismiss}>
              <Text style={styles.primaryBtnText}>Got it</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 4,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#123020",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: "#557062",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  primaryBtn: {
    backgroundColor: "#295e42",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    marginTop: 12,
    color: "#295e42",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  instructions: {
    width: "100%",
    backgroundColor: "#F0F4F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  step: {
    fontSize: 14,
    color: "#123020",
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "700",
  },
});