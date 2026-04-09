import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";

export default function LogMealButton({ bottomInset }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={[
        s.fab,
        { bottom: (bottomInset > 0 ? bottomInset : rs(24)) + rs(12) },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/log");
      }}
      activeOpacity={0.85}
    >
      <Ionicons name="add" size={rf(28)} color={COLORS.white} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  fab: {
    position: "absolute",
    right: rs(20),
    width: rs(66),
    height: rs(66),
    borderRadius: rs(33),
    backgroundColor: COLORS.greenDark,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.md,
  },
});
