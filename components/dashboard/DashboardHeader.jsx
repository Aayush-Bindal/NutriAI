import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

export default function DashboardHeader({ name }) {
  const router = useRouter();
  const { colors: COLORS, resolvedMode } = useTheme();
  const s = useThemedStyles(createStyles);
  const isDark = resolvedMode === "dark";

  return (
    <View style={s.header}>
      <View>
        <Text style={s.appName}>NutriAI</Text>
        <Text style={s.sub}>
          {getGreeting()}, <Text style={s.userName}>{name || "there"}</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[s.avatar, isDark && s.avatarDark]}
        onPress={() => router.push("/profile")}
        activeOpacity={0.8}
      >
        {name ? (
          <Text style={s.avatarTxt}>{name[0].toUpperCase()}</Text>
        ) : (
          <Ionicons
            name="person-outline"
            size={rf(22)}
            color={isDark ? COLORS.mid : COLORS.white}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(24),
  },
  appName: {
    fontSize: rf(28),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -1,
  },
  sub: {
    fontSize: rf(14),
    fontWeight: "400",
    color: COLORS.muted,
    marginTop: rs(4),
  },
  userName: { fontWeight: "600", color: COLORS.mid },
  avatar: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(24),
    backgroundColor: COLORS.dark,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.md,
  },
  avatarDark: {
    backgroundColor: COLORS.cardAlt,
  },
  avatarTxt: { color: COLORS.white, fontSize: rf(18), fontWeight: "700" },
});
