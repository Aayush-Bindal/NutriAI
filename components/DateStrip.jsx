import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, SHADOW, rf, rs } from "../constants/theme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function generateWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      day: DAYS[d.getDay()],
      date: d.getDate(),
      isToday: i === 6,
      fullDate: new Date(d),
    };
  });
}

export default function DateStrip({ weekDays, selectedIdx, onDayPress }) {
  const dateStripRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      dateStripRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleDayPress = (idx) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDayPress(idx);
  };

  return (
    <View style={s.stripContainer}>
      <ScrollView
        ref={dateStripRef}
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
            <Text style={[s.dayLbl, selectedIdx === i && s.dayTxtOn]}>
              {d.day}
            </Text>
            <Text style={[s.dayNum, selectedIdx === i && s.dayTxtOn]}>
              {d.date}
            </Text>
            {d.isToday && (
              <View style={[s.dot, selectedIdx === i && s.dotOn]} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
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
  dayLbl: {
    fontSize: rf(11),
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
  },
  dayNum: { fontSize: rf(18), fontWeight: "800", color: COLORS.dark },
  dayTxtOn: { color: "#fff" },
  dot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(2.5),
    backgroundColor: COLORS.green,
    marginTop: rs(2),
  },
  dotOn: { backgroundColor: "#fff" },
});
