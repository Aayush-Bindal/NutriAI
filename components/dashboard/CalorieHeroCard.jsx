import { StyleSheet, Text, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";
import CalorieRing from "./CalorieRing";

export default function CalorieHeroCard({
  totals,
  goal,
  isToday,
  selectedDay,
}) {
  const caloriesOver = totals.calories > goal ? totals.calories - goal : 0;

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
          <Text style={s.statNum} numberOfLines={1} adjustsFontSizeToFit>
            {totals.calories.toLocaleString()}
          </Text>
          <Text style={s.statUnit}>kcal</Text>
        </View>

        <View style={s.ringWrap}>
          <CalorieRing eaten={totals.calories} goal={goal} />
        </View>

        <View style={s.statBox}>
          <Text style={s.statLbl}>Goal</Text>
          <Text style={s.statNum} numberOfLines={1} adjustsFontSizeToFit>
            {goal.toLocaleString()}
          </Text>
          <Text style={s.statUnit}>kcal</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
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
    backgroundColor: "#FEF2F2",
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
  statBox: { flex: 1, alignItems: "center" },
  statLbl: {
    fontSize: rf(12),
    fontWeight: "500",
    color: "#022C22",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: rs(4),
  },
  statNum: {
    fontSize: rf(24),
    fontWeight: "500",
    color: "#022C22",
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: rf(12),
    fontWeight: "500",
    color: "#022C22",
    marginTop: rs(2),
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(10),
  },
});
