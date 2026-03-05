import { StyleSheet, View } from "react-native";
import { COLORS, rs } from "../../constants/theme";

const TOTAL_STEPS = 6;

export default function StepDots({ current, total = TOTAL_STEPS }) {
  return (
    <View style={s.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            s.dot,
            i === current && s.dotActive,
            i < current && s.dotDone,
          ]}
        />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rs(8),
    marginBottom: rs(28),
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.green,
    width: rs(28),
    borderRadius: rs(4),
  },
  dotDone: { backgroundColor: COLORS.greenMid },
});
