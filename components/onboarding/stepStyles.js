import { StyleSheet } from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";

const stepStyles = StyleSheet.create({
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
    backgroundColor: COLORS.green,
    paddingVertical: rs(18),
    borderRadius: rs(20),
    gap: rs(10),
    ...SHADOW.green,
  },
  nextBtnDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: rf(17),
    fontWeight: "800",
    color: COLORS.white,
  },
  nextBtnTextDisabled: {
    color: COLORS.muted,
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

export default stepStyles;
