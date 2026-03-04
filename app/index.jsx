import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useMeals } from "../context/MealContext";
import { useProfile } from "../context/ProfileContext";
import CalorieRing from "../components/CalorieRing";
import MealSection from "../components/MealSection";
import { COLORS, SHADOW, rs, rf } from "../constants/theme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { meals, totals, tip, switchDate } = useMeals();
  const { profile } = useProfile();

  const today = new Date();
  const [selectedIdx, setSelectedIdx] = useState(6);
  
  // 1. Ref for the Date Strip
  const dateStripRef = useRef(null);

  // 2. Auto-scroll to "Today" on mount
  useEffect(() => {
    setTimeout(() => {
      dateStripRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // Fallbacks and calculations
  const goal = profile.calorieGoal || 2000;
  const caloriesLeft = Math.max(goal - totals.calories, 0);
  const caloriesOver = totals.calories > goal ? totals.calories - goal : 0;
  const hasAnyMeal = Object.values(meals).some((mealArray) => mealArray.length > 0);
  const isToday = selectedIdx === 6;

  // Generate the last 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      day: DAYS[d.getDay()],
      date: d.getDate(),
      isToday: i === 6,
      fullDate: new Date(d),
    };
  });

  const selectedDay = weekDays[selectedIdx];

  const handleDayPress = (idx) => {
    // Light haptic feedback on day change
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIdx(idx);
    switchDate(weekDays[idx].fullDate);
  };

  // Macro setup
  const macroGoals = profile.macroGoals || { protein: 150, carbs: 225, fat: 56 };
  const macros = [
    { label: "Carbs", value: totals.carbs, max: macroGoals.carbs, color: COLORS.red, bg: "#FDF2F1" },
    { label: "Protein", value: totals.protein, max: macroGoals.protein, color: COLORS.blue, bg: "#F0F5FC" },
    { label: "Fat", value: totals.fat, max: macroGoals.fat, color: COLORS.amber, bg: "#FDF8EE" },
  ];

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingTop: insets.top + rs(10), paddingBottom: insets.bottom + rs(120) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={s.header}>
          <View>
            <Text style={s.appName}>NutriAI</Text>
            <Text style={s.sub}>
              {getGreeting()}, <Text style={s.userName}>{profile.name || "there"}</Text> 👋
            </Text>
          </View>
          <TouchableOpacity
            style={s.avatar}
            onPress={() => router.push("/profile")}
            activeOpacity={0.8}
          >
            <Text style={s.avatarTxt}>{profile.name ? profile.name[0].toUpperCase() : "👤"}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Strip */}
        <View style={s.stripContainer}>
          <ScrollView
            ref={dateStripRef} // Attached the ref here
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.strip}
          >
            {weekDays.map((d, i) => (
              <TouchableOpacity
                key={i}
                style={[s.dayChip, selectedIdx === i && s.dayChipOn]}
                onPress={() => handleDayPress(i)}
                activeOpacity={0.75}
              >
                <Text style={[s.dayLbl, selectedIdx === i && s.dayTxtOn]}>{d.day}</Text>
                <Text style={[s.dayNum, selectedIdx === i && s.dayTxtOn]}>{d.date}</Text>
                {d.isToday && <View style={[s.dot, selectedIdx === i && s.dotOn]} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Calorie Hero Card */}
        <View style={[s.hero, SHADOW.md]}>
          <View style={s.heroHeader}>
            <Text style={s.heroLbl}>
              {isToday
                ? (caloriesOver > 0 ? "Eaten today (Over limit)" : "Eaten today")
                : `${selectedDay.day}, ${selectedDay.date}`}
            </Text>
            <Text style={[s.heroNum, { color: caloriesOver > 0 ? COLORS.red : COLORS.dark }]}>
              {(caloriesOver > 0 ? caloriesOver : totals.calories).toLocaleString()}
              <Text style={s.heroUnit}>{caloriesOver > 0 ? " kcal over" : " kcal"}</Text>
            </Text>
          </View>

          <View style={s.ringRow}>
            <View style={s.stat}>
              <Text style={s.statNum}>{goal.toLocaleString()}</Text>
              <Text style={s.statLbl}>Goal</Text>
            </View>

            <View style={s.ringWrap}>
              <CalorieRing eaten={totals.calories} goal={goal} />
            </View>

            <View style={s.stat}>
              <Text
                style={[
                  s.statNum,
                  { color: caloriesLeft === 0 && totals.calories > 0 ? COLORS.red : COLORS.green }
                ]}
              >
                {caloriesLeft.toLocaleString()}
              </Text>
              <Text style={s.statLbl}>Left</Text>
            </View>
          </View>

          {/* Mini Linear Progress */}
          <View style={s.bar}>
            <View
              style={[
                s.barFill,
                {
                  width: `${Math.min((totals.calories / goal) * 100, 100)}%`,
                  backgroundColor: caloriesOver > 0 ? COLORS.red : COLORS.green,
                },
              ]}
            />
          </View>
        </View>

        {/* Macros Row */}
        <View style={s.macroRow}>
          {macros.map((m) => (
            <View key={m.label} style={[s.macroCard, { backgroundColor: m.bg }, SHADOW.sm]}>
              <Text style={s.macroLbl}>{m.label}</Text>
              <Text style={[s.macroVal, { color: m.color }]}>
                {m.value}
                <Text style={s.macroG}>g</Text>
              </Text>
              <Text style={s.macroMax}>/ {m.max}g</Text>
              <View style={s.macroBar}>
                <View
                  style={[
                    s.macroFill,
                    {
                      backgroundColor: m.color,
                      width: `${Math.min((m.value / m.max) * 100, 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* AI Tip */}
        {tip && (
          <View style={[s.tip, SHADOW.sm]}>
            <View style={s.tipBadge}>
              <Text style={s.tipBadgeTxt}>✨ AI Tip</Text>
            </View>
            <Text style={s.tipTxt}>{tip}</Text>
          </View>
        )}

        {/* Meals Section */}
        <View style={s.mealsHead}>
          <Text style={s.mealsTitle}>
            {isToday ? "Today's Meals" : `${selectedDay.day}'s Meals`}
          </Text>
          {hasAnyMeal && (
            <Text style={s.mealsCount}>{Object.values(meals).flat().length} items</Text>
          )}
        </View>

        {hasAnyMeal ? (
          Object.entries(meals).map(([mealName, items]) =>
            items.length > 0 ? (
              <MealSection key={mealName} title={mealName} items={items} />
            ) : null
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
      </ScrollView>

      {/* Floating Log Meal Button */}
      <View style={[s.bottomArea, { paddingBottom: insets.bottom > 0 ? insets.bottom : rs(24) }]}>
        <TouchableOpacity
          style={s.logBtn}
          onPress={() => {
            // Stronger haptic feedback for primary action
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
    </View>
  );
}

// Helper Functions
function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

// Styles
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20) },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(24),
  },
  appName: { fontSize: rf(28), fontWeight: "900", color: COLORS.dark, letterSpacing: -1 },
  sub: { fontSize: rf(14), fontWeight: "400", color: COLORS.muted, marginTop: rs(4) },
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
  avatarTxt: { color: "#fff", fontSize: rf(18), fontWeight: "700" },

  stripContainer: { marginBottom: rs(24) },
  strip: { gap: rs(10), paddingRight: rs(20) }, 
  dayChip: {
    width: rs(54),
    paddingVertical: rs(12),
    borderRadius: rs(20),
    backgroundColor: COLORS.card,
    alignItems: "center",
    gap: rs(4),
    ...SHADOW.sm,
  },
  dayChipOn: { backgroundColor: COLORS.dark },
  dayLbl: { fontSize: rf(11), fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" },
  dayNum: { fontSize: rf(18), fontWeight: "800", color: COLORS.dark },
  dayTxtOn: { color: "#fff" },
  dot: { width: rs(5), height: rs(5), borderRadius: rs(2.5), backgroundColor: COLORS.green, marginTop: rs(2) },
  dotOn: { backgroundColor: "#fff" },

  hero: { backgroundColor: COLORS.card, borderRadius: rs(28), padding: rs(24), marginBottom: rs(20) },
  heroHeader: { marginBottom: rs(16), alignItems: "center" },
  heroLbl: { fontSize: rf(13), fontWeight: "600", color: COLORS.muted, marginBottom: rs(4) },
  heroNum: { fontSize: rf(42), fontWeight: "900", letterSpacing: -1.5 },
  heroUnit: { fontSize: rf(16), fontWeight: "600", color: COLORS.muted },

  ringRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: rs(20) },
  stat: { flex: 1, alignItems: "center" },
  statNum: { fontSize: rf(24), fontWeight: "800", color: COLORS.dark, letterSpacing: -0.5 },
  statLbl: { fontSize: rf(12), fontWeight: "500", color: COLORS.muted, marginTop: rs(4) },
  ringWrap: { alignItems: "center", justifyContent: "center", paddingHorizontal: rs(10) },

  bar: { height: rs(6), backgroundColor: COLORS.border, borderRadius: rs(99), overflow: "hidden" },
  barFill: { height: "100%", borderRadius: rs(99) },

  macroRow: { flexDirection: "row", gap: rs(12), marginBottom: rs(20) },
  macroCard: { flex: 1, borderRadius: rs(24), padding: rs(16) },
  macroLbl: { fontSize: rf(11), fontWeight: "800", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: rs(6) },
  macroVal: { fontSize: rf(24), fontWeight: "900", letterSpacing: -0.5 },
  macroG: { fontSize: rf(14), fontWeight: "600" },
  macroMax: { fontSize: rf(11), color: COLORS.muted, fontWeight: "500", marginTop: rs(2), marginBottom: rs(12) },
  macroBar: { height: rs(6), backgroundColor: "rgba(0,0,0,0.05)", borderRadius: rs(99), overflow: "hidden" },
  macroFill: { height: "100%", borderRadius: rs(99) },

  tip: { backgroundColor: COLORS.card, borderRadius: rs(24), padding: rs(16), marginBottom: rs(24), flexDirection: "row", gap: rs(12), alignItems: "center" },
  tipBadge: { backgroundColor: COLORS.greenLight, borderRadius: rs(99), paddingHorizontal: rs(12), paddingVertical: rs(6) },
  tipBadgeTxt: { fontSize: rf(11), fontWeight: "800", color: COLORS.green },
  tipTxt: { flex: 1, fontSize: rf(14), fontWeight: "500", color: COLORS.mid, lineHeight: rf(20) },

  mealsHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(16) },
  mealsTitle: { fontSize: rf(20), fontWeight: "800", color: COLORS.dark, letterSpacing: -0.5 },
  mealsCount: { fontSize: rf(14), fontWeight: "600", color: COLORS.muted },

  empty: { backgroundColor: COLORS.card, borderRadius: rs(28), alignItems: "center", paddingVertical: rs(48), paddingHorizontal: rs(24), borderStyle: "dashed", borderWidth: 2, borderColor: COLORS.border },
  emptyEmoji: { fontSize: rf(48), marginBottom: rs(16) },
  emptyTitle: { fontSize: rf(18), fontWeight: "700", color: COLORS.dark },
  emptySub: { fontSize: rf(14), color: COLORS.muted, marginTop: rs(8), textAlign: "center", lineHeight: rf(20) },

  bottomArea: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: rs(20), paddingTop: rs(20), backgroundColor: COLORS.bg },
  logBtn: { backgroundColor: COLORS.dark, borderRadius: rs(24), paddingVertical: rs(18), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: rs(8), ...SHADOW.md },
  logPlus: { color: "#fff", fontSize: rf(24), fontWeight: "400" },
  logTxt: { color: "#fff", fontSize: rf(18), fontWeight: "700", letterSpacing: -0.3 },
});