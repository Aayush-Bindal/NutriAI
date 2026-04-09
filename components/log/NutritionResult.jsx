import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

export default function NutritionResult({
  result,
  mealType,
  added,
  onAdd,
  onSaveMeal,
  isMealSaved,
}) {
  const { colors: COLORS, shadow: SHADOW } = useTheme();
  const s = useThemedStyles(createStyles);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSaveMeal();
    setSaved(true);
  };

  return (
    <View style={[s.resultCard, SHADOW.md]}>
      {/* Food items */}
      {result.items.map((item, i) => (
        <View
          key={i}
          style={[s.itemRow, i < result.items.length - 1 && s.itemBorder]}
        >
          <Text style={s.itemEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.itemName}>{item.name}</Text>
            <Text style={s.itemQty}>{item.quantity}</Text>
          </View>
          <Text style={s.itemCal}>{item.calories} cal</Text>
        </View>
      ))}

      {/* Macro strip */}
      <View style={s.macroStrip}>
        {[
          { v: result.total.calories, l: "kcal", c: COLORS.red },
          { v: `${result.total.protein}g`, l: "protein", c: COLORS.blue },
          { v: `${result.total.carbs}g`, l: "carbs", c: COLORS.amber },
          { v: `${result.total.fat}g`, l: "fat", c: COLORS.purple },
          { v: `${result.total.fiber || 0}g`, l: "fiber", c: COLORS.green },
        ].map((m, i, arr) => (
          <View
            key={m.l}
            style={[s.macroItem, i < arr.length - 1 && s.macroDivide]}
          >
            <Text style={[s.macroVal, { color: m.c }]}>{m.v}</Text>
            <Text style={s.macroLbl}>{m.l}</Text>
          </View>
        ))}
      </View>

      {/* Tip */}
      {result.tip && (
        <View style={s.tipRow}>
          <View style={s.tipBadge}>
            <Ionicons name="sparkles" size={rf(11)} color={COLORS.green} />
            <Text style={s.tipBadgeTxt}>AI Tip</Text>
          </View>
          <Text style={s.tipTxt}>{result.tip}</Text>
        </View>
      )}

      {/* Save meal button */}
      {!isMealSaved && !saved && (
        <TouchableOpacity
          style={s.saveBtn}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={s.saveTxt}>Save Meal for Quick Access</Text>
        </TouchableOpacity>
      )}
      {(isMealSaved || saved) && (
        <View style={s.savedBadge}>
          <Text style={s.savedTxt}>Saved to Quick Meals</Text>
        </View>
      )}

      {/* Add btn */}
      <TouchableOpacity
        style={[s.addBtn, added && s.addBtnDone]}
        onPress={onAdd}
        disabled={added}
        activeOpacity={0.85}
      >
        <Text style={s.addTxt}>
          {added ? "\u2713  Added!" : `Add to ${mealType}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS) => StyleSheet.create({
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: rs(24),
    overflow: "hidden",
    marginBottom: rs(16),
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(18),
    paddingVertical: rs(14),
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemEmoji: { fontSize: rf(26), marginRight: rs(14) },
  itemName: { fontSize: rf(15), fontWeight: "600", color: COLORS.dark },
  itemQty: { fontSize: rf(12), color: COLORS.muted, marginTop: rs(2) },
  itemCal: { fontSize: rf(14), fontWeight: "700", color: COLORS.mid },
  macroStrip: {
    flexDirection: "row",
    backgroundColor: COLORS.cardAlt,
    paddingVertical: rs(16),
  },
  macroItem: { flex: 1, alignItems: "center" },
  macroDivide: { borderRightWidth: 1, borderRightColor: COLORS.border },
  macroVal: { fontSize: rf(18), fontWeight: "900", letterSpacing: -0.5 },
  macroLbl: {
    fontSize: rf(10),
    color: COLORS.muted,
    marginTop: rs(2),
    fontWeight: "600",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(10),
    padding: rs(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(99),
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
  },
  tipBadgeTxt: { fontSize: rf(10), fontWeight: "800", color: COLORS.green },
  tipTxt: {
    flex: 1,
    fontSize: rf(13),
    color: COLORS.mid,
    lineHeight: rf(19),
    fontWeight: "500",
  },
  addBtn: {
    backgroundColor: COLORS.greenDark,
    margin: rs(14),
    marginTop: 0,
    borderRadius: rs(16),
    paddingVertical: rs(16),
    alignItems: "center",
  },
  addBtnDone: { backgroundColor: COLORS.green },
  addTxt: { color: COLORS.white, fontSize: rf(16), fontWeight: "700" },
  saveBtn: {
    margin: rs(14),
    marginBottom: rs(8),
    borderRadius: rs(16),
    paddingVertical: rs(14),
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  saveTxt: { color: COLORS.green, fontSize: rf(14), fontWeight: "700" },
  savedBadge: {
    margin: rs(14),
    marginBottom: rs(8),
    borderRadius: rs(16),
    paddingVertical: rs(14),
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
  },
  savedTxt: { color: COLORS.green, fontSize: rf(13), fontWeight: "600" },
});
