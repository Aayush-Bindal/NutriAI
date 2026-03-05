import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AiTip from "../components/AiTip";
import CalorieHeroCard from "../components/CalorieHeroCard";
import DashboardHeader from "../components/DashboardHeader";
import DateStrip, { generateWeekDays } from "../components/DateStrip";
import LogMealButton from "../components/LogMealButton";
import MacrosRow from "../components/MacrosRow";
import MealsList from "../components/MealsList";
import { COLORS, rs } from "../constants/theme";
import { useMeals } from "../context/MealContext";
import { useProfile } from "../context/ProfileContext";

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { meals, totals, tip, switchDate } = useMeals();
  const { profile } = useProfile();

  const [selectedIdx, setSelectedIdx] = useState(6);
  const weekDays = generateWeekDays();
  const selectedDay = weekDays[selectedIdx];
  const isToday = selectedIdx === 6;
  const goal = profile.calorieGoal || 2000;

  const handleDayPress = (idx) => {
    setSelectedIdx(idx);
    switchDate(weekDays[idx].fullDate);
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          {
            paddingTop: insets.top + rs(10),
            paddingBottom: insets.bottom + rs(120),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader name={profile.name} />
        <DateStrip
          weekDays={weekDays}
          selectedIdx={selectedIdx}
          onDayPress={handleDayPress}
        />
        <CalorieHeroCard
          totals={totals}
          goal={goal}
          isToday={isToday}
          selectedDay={selectedDay}
        />
        <MacrosRow totals={totals} macroGoals={profile.macroGoals} />
        <AiTip tip={tip} />
        <MealsList meals={meals} isToday={isToday} selectedDay={selectedDay} />
      </ScrollView>

      <LogMealButton
        isToday={isToday}
        selectedDay={selectedDay}
        bottomInset={insets.bottom}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20) },
});
