import { StyleSheet, Text, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import CalorieRing from "./CalorieRing";

export default function CalorieHeroCard({
  totals,
  goal,
  isToday,
  selectedDay,
}) {
  const { shadow: SHADOW } = useTheme();
  const s = useThemedStyles(createStyles);
  const caloriesOver = totals.calories > goal ? totals.calories - goal : 0;
  const getCalorieSize = (value) => {
    const digits = String(Math.round(Number(value) || 0)).length;
    if (digits >= 5) return rf(18);
    if (digits === 4) return rf(21);
    return rf(24);
  };

  return (
    <View style={[s.hero, SHADOW.md]}>
      <View style={s.heroTop}>
        <Text style={s.heroTitle}>
          {isToday ? "Daily Intake" : `${selectedDay.day}, ${selectedDay.date}`}
        </Text>
        {caloriesOver > 0 && (
          <View style={s.overBadge}>
            <Text style={s.overBadgeTxt}>Over Limit</Text>
          </View>
        )}
      </View>

      <View style={s.ringRow}>
        <View style={s.statBox}>
          <Text style={s.statLbl}>Eaten</Text>
          <Text
            style={[s.statNum, { fontSize: getCalorieSize(totals.calories) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {totals.calories.toLocaleString()}
          </Text>
          <Text style={s.statUnit}>kcal</Text>
        </View>

        <View style={s.ringWrap}>
          <CalorieRing eaten={totals.calories} goal={goal} />
        </View>

        <View style={s.statBox}>
          <Text style={s.statLbl}>Goal</Text>
          <Text
            style={[s.statNum, { fontSize: getCalorieSize(goal) }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {goal.toLocaleString()}
          </Text>
          <Text style={s.statUnit}>kcal</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (COLORS) => StyleSheet.create({
  hero: {
    backgroundColor: COLORS.card,
    borderRadius: rs(28),
    padding: rs(24),
    marginBottom: rs(20),
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(20),
  },
  heroTitle: { fontSize: rf(18), fontWeight: "800", color: COLORS.dark },
  overBadge: {
    backgroundColor: COLORS.redLight,
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  overBadgeTxt: {
    color: COLORS.red,
    fontSize: rf(10),
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ringRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  statLbl: {
    fontSize: rf(12),
    fontWeight: "500",
    color: COLORS.greenDeep,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: rs(4),
  },
  statNum: {
    fontWeight: "500",
    color: COLORS.greenDeep,
    letterSpacing: -0.5,
    width: "100%",
    flexShrink: 1,
    textAlign: "center",
  },
  statUnit: {
    fontSize: rf(12),
    fontWeight: "500",
    color: COLORS.greenDeep,
    marginTop: rs(2),
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(10),
  },
});
