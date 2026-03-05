import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { meals, totals, tip, switchDate } = useMeals();
  const { profile } = useProfile();

  const [selectedIdx, setSelectedIdx] = useState(6);
  const [customDate, setCustomDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const weekDays = generateWeekDays();
  const today = new Date();

  const selectedDay = customDate
    ? {
        day: DAYS[customDate.getDay()],
        date: customDate.getDate(),
        fullDate: customDate,
        isToday: isSameDay(customDate, today),
      }
    : weekDays[selectedIdx];
  const isToday = customDate ? isSameDay(customDate, today) : selectedIdx === 6;
  const goal = profile.calorieGoal || 2000;

  const handleDayPress = (idx) => {
    setCustomDate(null);
    setSelectedIdx(idx);
    switchDate(weekDays[idx].fullDate);
  };

  const handleCalendarPress = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event, date) => {
    setShowPicker(Platform.OS === "ios");
    if (date) {
      // Check if this date is within the week strip
      const matchIdx = weekDays.findIndex((d) => isSameDay(d.fullDate, date));
      if (matchIdx !== -1) {
        setCustomDate(null);
        setSelectedIdx(matchIdx);
      } else {
        setCustomDate(date);
        setSelectedIdx(-1);
      }
      switchDate(date);
    }
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
          onCalendarPress={handleCalendarPress}
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

      {showPicker && (
        <DateTimePicker
          value={
            customDate ||
            (selectedIdx >= 0 ? weekDays[selectedIdx].fullDate : new Date())
          }
          mode="date"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20) },
});
