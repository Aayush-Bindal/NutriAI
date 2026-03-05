import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";

export default function LogMealButton({ isToday, selectedDay, bottomInset }) {
  const router = useRouter();

  return (
    <View
      style={[
        s.bottomArea,
        { paddingBottom: bottomInset > 0 ? bottomInset : rs(24) },
      ]}
    >
      <TouchableOpacity
        style={s.logBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push("/log");
        }}
        activeOpacity={0.88}
      >
        <Text style={s.logPlus}>+</Text>
        <Text style={s.logTxt}>
          {isToday ? "Log Meal" : `Log for ${selectedDay.day}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  bottomArea: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: rs(20),
    paddingTop: rs(20),
    backgroundColor: COLORS.bg,
  },
  logBtn: {
    backgroundColor: COLORS.dark,
    borderRadius: rs(24),
    paddingVertical: rs(18),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    ...SHADOW.md,
  },
  logPlus: { color: "#fff", fontSize: rf(24), fontWeight: "400" },
  logTxt: {
    color: "#fff",
    fontSize: rf(18),
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
