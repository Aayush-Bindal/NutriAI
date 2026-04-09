import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "../../utils/haptics";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

export default function WelcomeStep({ onNext, onRestore }) {
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(createStyles);
  return (
    <View style={s.container}>
      <View style={s.top}>
        <View style={s.decoWrap}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={s.appIcon}
          />
        </View>

        <Text style={s.appName}>NutriAI</Text>
        <View style={s.taglineWrap}>
          <View style={s.badge}>
            <Ionicons name="sparkles" size={rf(14)} color={COLORS.green} />
            <Text style={s.badgeText}>AI-Powered</Text>
          </View>
        </View>
        <Text style={s.subtitle}>
          Your intelligent calorie tracker that understands what you eat and
          helps you reach your health goals.
        </Text>
      </View>

      <View style={s.features}>
        {[
          {
            icon: "analytics-outline",
            text: "Smart tracking with personalized goals",
          },
          { icon: "leaf-outline", text: "Built for Indian cuisine & beyond" },
          {
            icon: "sparkles-outline",
            text: "AI-powered meal analysis & tips",
          },
        ].map((f, i) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Ionicons name={f.icon} size={rf(20)} color={COLORS.green} />
            </View>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={s.btn}
        >
          <Text style={s.btnText}>Get Healthy</Text>
          <Ionicons name="arrow-forward" size={rf(20)} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRestore();
          }}
          style={s.restoreBtn}
        >
          <Ionicons
            name="cloud-download-outline"
            size={rf(16)}
            color={COLORS.green}
          />
          <Text style={s.restoreBtnText}>Restore from backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: rs(20),
  },
  top: { alignItems: "center", marginTop: rs(30) },
  decoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(24),
  },
  appIcon: {
    width: rs(110),
    height: rs(110),
    resizeMode: "contain",
  },
  appName: {
    fontSize: rf(42),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -2,
  },
  taglineWrap: { marginTop: rs(8) },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    borderRadius: rs(20),
    gap: rs(6),
  },
  badgeText: {
    fontSize: rf(13),
    fontWeight: "700",
    color: COLORS.green,
  },
  subtitle: {
    fontSize: rf(16),
    fontWeight: "500",
    color: COLORS.mid,
    textAlign: "center",
    marginTop: rs(16),
    lineHeight: rf(24),
    paddingHorizontal: rs(10),
  },
  features: { gap: rs(14), paddingHorizontal: rs(4) },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: rs(16),
    padding: rs(16),
    ...SHADOW.sm,
  },
  featureIcon: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(14),
  },
  featureText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.dark,
    flex: 1,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.greenMutedDark,
    paddingVertical: rs(18),
    borderRadius: rs(20),
    gap: rs(10),
    marginTop: rs(20),
  },
  btnText: {
    fontSize: rf(18),
    fontWeight: "800",
    color: COLORS.white,
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    paddingVertical: rs(14),
    marginTop: rs(10),
  },
  restoreBtnText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.green,
  },
});
