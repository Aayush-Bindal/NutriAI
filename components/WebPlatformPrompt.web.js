import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";
import { getLatestApkUrl } from "../utils/getApkUrl";

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

function svgDataUri(svg) {
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

const DOWNLOAD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="14" fill="#E8EDE6"/>
  <path d="M24 12v24M16 20l8 8 8-8" stroke="#295e42" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <path d="M12 32v4a2 2 0 002 2h20a2 2 0 002-2v-4" stroke="#295e42" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

const PHONE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="14" fill="#E8EDE6"/>
  <rect x="14" y="8" width="20" height="32" rx="4" stroke="#295e42" stroke-width="2.5" fill="none"/>
  <circle cx="24" cy="30" r="2" fill="#295e42"/>
  <path d="M24 14v2" stroke="#295e42" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <path d="M24 34v2" stroke="#295e42" stroke-width="2.5" stroke-linecap="round" fill="none"/>
</svg>`;

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="#295e42" stroke-width="2" fill="none"/>
  <path d="M8 12l3 3 5-5" stroke="#295e42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

export default function WebPlatformPrompt() {
  const [visible, setVisible] = useState(false);
  const [apkUrl, setApkUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isPwaInstalled()) {
      setInstalled(true);
      return;
    }

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

  useEffect(() => {
    if (!visible) return;
    const mq = window.matchMedia("(display-mode: standalone)");
    const handler = () => {
      if (mq.matches) {
        setInstalled(true);
        setVisible(false);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [visible]);

  if (!visible && !isAndroid() && !isIOS()) return null;
  if (installed) return null;

  const handleDownload = () => {
    if (apkUrl) {
      window.open(apkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {isAndroid() ? (
          <>
            <img
              src={svgDataUri(DOWNLOAD_SVG)}
              width={48}
              height={48}
              alt="download"
              style={styles.icon}
            />
            <Text style={styles.title}>Download NutriAI APK</Text>
            <Text style={styles.body}>
              You need to download and install the APK to use NutriAI on
              Android. The browser version is not available.
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
            <img
              src={svgDataUri(PHONE_SVG)}
              width={48}
              height={48}
              alt="phone"
              style={styles.icon}
            />
            <Text style={styles.title}>Add to Home Screen</Text>
            <Text style={styles.body}>
              Tap Share then Add to Home Screen to install NutriAI as a
              full-screen app.
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
              onPress={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Text style={styles.primaryBtnText}>Follow Steps Above</Text>
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
    backgroundColor: COLORS.bg,
    zIndex: 9999,
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.dark,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: COLORS.mid,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 14,
  },
  warning: {
    fontSize: 12,
    color: "#92400e",
    backgroundColor: COLORS.amberLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: COLORS.green,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  instructions: {
    width: "100%",
    backgroundColor: COLORS.cardAlt,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  step: {
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 20,
    marginBottom: 3,
  },
  bold: {
    fontWeight: "700",
  },
});