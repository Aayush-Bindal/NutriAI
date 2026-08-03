import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <View style={styles.banner}>
      <View style={styles.inner}>
        <View style={styles.row}>
          <Ionicons
            name={isAndroid() ? "download-outline" : "phone-portrait-outline"}
            size={20}
            color="#295e42"
          />
          <Text style={styles.title}>
            {isAndroid() ? "Download APK" : "Install NutriAI"}
          </Text>
          <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
            <Ionicons name="close" size={18} color="#888" />
          </TouchableOpacity>
        </View>

        {isAndroid() ? (
          <>
            <Text style={styles.body}>
              Install the APK directly on your Android device for the full app
              experience.
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
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Add NutriAI to your Home Screen for a full app experience.
            </Text>
            <Text style={styles.warning}>
              Your Gemini API key is stored in browser storage and is not as
              secure as the device secure enclave on mobile. Only use this on
              devices you trust.
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
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleDismiss}
            >
              <Text style={styles.primaryBtnText}>Got it</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  inner: {
    maxWidth: 480,
    alignSelf: "center",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#123020",
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    fontSize: 13,
    color: "#557062",
    lineHeight: 19,
    marginBottom: 10,
  },
  warning: {
    fontSize: 12,
    color: "#b45309",
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    lineHeight: 17,
  },
  primaryBtn: {
    backgroundColor: "#295e42",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  instructions: {
    backgroundColor: "#F0F4F2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  step: {
    fontSize: 13,
    color: "#123020",
    lineHeight: 20,
    marginBottom: 2,
  },
  bold: {
    fontWeight: "700",
  },
});