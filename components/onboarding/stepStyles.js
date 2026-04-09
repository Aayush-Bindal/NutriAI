import { StyleSheet } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useThemedStyles } from "../../context/ThemeContext";

const createStepStyles = (COLORS, SHADOW) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: rs(20),
  },
  backBtn: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(14),
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(16),
    ...SHADOW.sm,
  },
  title: {
    fontSize: rf(28),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: rf(15),
    fontWeight: "500",
    color: COLORS.mid,
    marginTop: rs(6),
    lineHeight: rf(22),
  },
  chipRow: { flexDirection: "row", gap: rs(12) },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.greenMutedDark,
    paddingVertical: rs(18),
    borderRadius: rs(20),
    gap: rs(10),
  },
  nextBtnDisabled: {
    backgroundColor: COLORS.onboardingDisabledBtn,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: rf(17),
    fontWeight: "800",
    color: COLORS.white,
  },
  nextBtnTextDisabled: {
    color: COLORS.onboardingDisabledBtnText,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(16),
    padding: rs(16),
    gap: rs(12),
    marginTop: rs(20),
  },
  infoCardText: {
    fontSize: rf(13),
    fontWeight: "500",
    color: COLORS.green,
    flex: 1,
    lineHeight: rf(19),
  },
});

export function useStepStyles() {
  return useThemedStyles(createStepStyles);
}
