import { StyleSheet, Text, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";
import MealSection from "./MealSection";

export default function MealsList({ meals, isToday, selectedDay }) {
  const hasAnyMeal = Object.values(meals).some(
    (mealArray) => mealArray.length > 0,
  );

  return (
    <>
      <View style={s.mealsHead}>
        <Text style={s.mealsTitle}>
          {isToday ? "Today's Meals" : `${selectedDay.day}'s Meals`}
        </Text>
        {hasAnyMeal && (
          <Text style={s.mealsCount}>
            {Object.values(meals).flat().length} items
          </Text>
        )}
      </View>

      {hasAnyMeal ? (
        Object.entries(meals).map(([mealName, items]) =>
          items.length > 0 ? (
            <MealSection key={mealName} title={mealName} items={items} />
          ) : null,
        )
      ) : (
        <View style={[s.empty, SHADOW.sm]}>
          <Text style={s.emptyEmoji}>🍽️</Text>
          <Text style={s.emptyTitle}>Nothing logged yet</Text>
          <Text style={s.emptySub}>
            {isToday
              ? "Tap the button below to get started"
              : `Tap below to add a meal for ${selectedDay.day}`}
          </Text>
        </View>
      )}
    </>
  );
}

const s = StyleSheet.create({
  mealsHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(16),
  },
  mealsTitle: {
    fontSize: rf(20),
    fontWeight: "800",
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  mealsCount: { fontSize: rf(14), fontWeight: "600", color: COLORS.muted },
  empty: {
    backgroundColor: COLORS.card,
    borderRadius: rs(28),
    alignItems: "center",
    paddingVertical: rs(48),
    paddingHorizontal: rs(24),
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  emptyEmoji: { fontSize: rf(48), marginBottom: rs(16) },
  emptyTitle: { fontSize: rf(18), fontWeight: "700", color: COLORS.dark },
  emptySub: {
    fontSize: rf(14),
    color: COLORS.muted,
    marginTop: rs(8),
    textAlign: "center",
    lineHeight: rf(20),
  },
});
