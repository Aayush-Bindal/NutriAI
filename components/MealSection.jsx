import { View, Text, StyleSheet } from "react-native";
import { COLORS, SHADOW, rs, rf } from "../constants/theme";

export default function MealSection({ title, items = [] }) {
  if (!items.length) return null;
  const total = items.reduce((s, i) => s + i.calories, 0);

  return (
    <View style={[s.card, SHADOW.sm]}>
      <View style={s.head}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.cal}>{total} cal</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={[s.row, i < items.length - 1 && s.border]}>
          <Text style={s.emoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.qty}>{item.quantity}</Text>
          </View>
          <Text style={s.itemCal}>{item.calories}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: rs(22), marginBottom: rs(12), overflow: "hidden" },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: rs(18), paddingVertical: rs(14), borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: rf(15), fontWeight: "800", color: COLORS.dark },
  cal: { fontSize: rf(13), fontWeight: "700", color: COLORS.green },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: rs(18), paddingVertical: rs(12) },
  border: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  emoji: { fontSize: rf(24), marginRight: rs(12) },
  name: { fontSize: rf(14), fontWeight: "600", color: COLORS.dark },
  qty: { fontSize: rf(12), color: COLORS.muted, marginTop: rs(1) },
  itemCal: { fontSize: rf(13), fontWeight: "700", color: COLORS.mid },
});