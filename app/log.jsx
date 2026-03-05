import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { logMeal } from "../constants/gemini";
import { COLORS, SHADOW, rf, rs } from "../constants/theme";
import { useMeals } from "../context/MealContext";
import { useProfile } from "../context/ProfileContext";

const MEAL_TYPES = [
  { label: "Breakfast", emoji: "🌅" },
  { label: "Lunch", emoji: "☀️" },
  { label: "Dinner", emoji: "🌙" },
  { label: "Snack", emoji: "🍎" },
];

const SUGGESTIONS = [
  "2 roti + dal makhani",
  "oats with banana",
  "idli sambar",
  "chicken sandwich",
  "poha and chai",
  "rajma chawal",
];

function getDefaultMeal() {
  const h = new Date().getHours();
  if (h < 11) return "Breakfast";
  if (h < 15) return "Lunch";
  if (h < 20) return "Dinner";
  return "Snack";
}

export default function LogScreen() {
  const router = useRouter();
  const { addMeal } = useMeals();
  const { profile } = useProfile();

  const [input, setInput] = useState("");
  const [mealType, setMealType] = useState(getDefaultMeal());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  const analyse = async () => {
    if (!input.trim() || loading) return;

    if (!profile.apiKey) {
      setError(
        "No API key found. Tap your profile icon to add your Gemini API key.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAdded(false);
    try {
      const data = await logMeal(input.trim(), profile.apiKey);
      if (data.error) setError("That doesn't look like food. Try again!");
      else setResult(data);
    } catch (e) {
      if (e.message === "no_api_key") {
        setError(
          "No API key found. Tap your profile icon to add your Gemini API key.",
        );
      } else {
        setError(`Error: ${e.message}`);
      }
    }
    setLoading(false);
  };

  const addToDiary = () => {
    if (!result) return;
    addMeal(mealType, result.items, result.total, result.tip);
    setAdded(true);
    setTimeout(() => router.back(), 700);
  };

  return (
    <View style={s.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Log a Meal</Text>
            <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
              <Text style={s.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Meal type */}
          <Text style={s.secLabel}>Which meal?</Text>
          <View style={s.mealRow}>
            {MEAL_TYPES.map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[s.mealChip, mealType === m.label && s.mealChipOn]}
                onPress={() => setMealType(m.label)}
                activeOpacity={0.75}
              >
                <Text style={s.mealEmoji}>{m.emoji}</Text>
                <Text style={[s.mealTxt, mealType === m.label && s.mealTxtOn]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input */}
          <Text style={s.secLabel}>What did you eat?</Text>
          <View style={[s.inputWrap, SHADOW.sm]}>
            <TextInput
              style={s.input}
              placeholder="e.g. 2 rotis with dal makhani and lassi..."
              placeholderTextColor={COLORS.muted}
              value={input}
              onChangeText={setInput}
              multiline
              autoFocus
            />
          </View>

          {/* Suggestions */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: rs(20) }}
          >
            {SUGGESTIONS.map((sg) => (
              <TouchableOpacity
                key={sg}
                style={s.sugg}
                onPress={() => setInput(sg)}
              >
                <Text style={s.suggTxt}>{sg}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Analyse btn */}
          <TouchableOpacity
            style={[
              s.analyseBtn,
              (!input.trim() || loading) && s.analyseBtnOff,
            ]}
            onPress={analyse}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.analyseTxt}>Analyse Nutrition</Text>
            )}
          </TouchableOpacity>

          {/* Error */}
          {error && (
            <View style={s.errorCard}>
              <Text style={s.errorTxt}>⚠️ {error}</Text>
            </View>
          )}

          {/* Result */}
          {result && (
            <View style={[s.resultCard, SHADOW.md]}>
              {/* Food items */}
              {result.items.map((item, i) => (
                <View
                  key={i}
                  style={[
                    s.itemRow,
                    i < result.items.length - 1 && s.itemBorder,
                  ]}
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
                  {
                    v: `${result.total.protein}g`,
                    l: "protein",
                    c: COLORS.blue,
                  },
                  { v: `${result.total.carbs}g`, l: "carbs", c: COLORS.amber },
                  { v: `${result.total.fat}g`, l: "fat", c: COLORS.purple },
                  {
                    v: `${result.total.fiber || 0}g`,
                    l: "fiber",
                    c: COLORS.green,
                  },
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
                    <Text style={s.tipBadgeTxt}>AI Tip</Text>
                  </View>
                  <Text style={s.tipTxt}>{result.tip}</Text>
                </View>
              )}

              {/* Add btn */}
              <TouchableOpacity
                style={[s.addBtn, added && s.addBtnDone]}
                onPress={addToDiary}
                disabled={added}
                activeOpacity={0.85}
              >
                <Text style={s.addTxt}>
                  {added ? "✓  Added!" : `Add to ${mealType}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: rs(40) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20), paddingTop: rs(8) },

  handle: {
    width: rs(40),
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: rs(20),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(26),
  },
  title: {
    fontSize: rf(26),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -1,
  },
  closeBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.sm,
  },
  closeTxt: { fontSize: rf(14), color: COLORS.mid },

  secLabel: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(10),
  },

  mealRow: { flexDirection: "row", gap: rs(8), marginBottom: rs(24) },
  mealChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: rs(12),
    backgroundColor: COLORS.card,
    borderRadius: rs(18),
    borderWidth: rs(2),
    borderColor: "transparent",
    ...SHADOW.sm,
  },
  mealChipOn: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  mealEmoji: { fontSize: rf(20), marginBottom: rs(4) },
  mealTxt: { fontSize: rf(10), fontWeight: "700", color: COLORS.muted },
  mealTxtOn: { color: COLORS.green },

  inputWrap: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(18),
    marginBottom: rs(12),
  },
  input: {
    fontSize: rf(15),
    color: COLORS.dark,
    minHeight: rs(88),
    textAlignVertical: "top",
    lineHeight: rf(22),
  },

  sugg: {
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(99),
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),
    marginRight: rs(8),
  },
  suggTxt: { fontSize: rf(12), color: COLORS.green, fontWeight: "600" },

  analyseBtn: {
    backgroundColor: COLORS.dark,
    borderRadius: rs(18),
    paddingVertical: rs(18),
    alignItems: "center",
    marginBottom: rs(14),
    ...SHADOW.md,
  },
  analyseBtnOff: {
    backgroundColor: "#b5d6b8",
    shadowOpacity: 0,
    elevation: 0,
  },
  analyseTxt: { color: "#fff", fontSize: rf(16), fontWeight: "700" },

  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: rs(14),
    padding: rs(14),
    marginBottom: rs(14),
    borderLeftWidth: rs(4),
    borderLeftColor: COLORS.red,
  },
  errorTxt: { color: "#b91c1c", fontSize: rf(14), fontWeight: "500" },

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
    backgroundColor: COLORS.dark,
    margin: rs(14),
    borderRadius: rs(16),
    paddingVertical: rs(16),
    alignItems: "center",
  },
  addBtnDone: { backgroundColor: COLORS.green },
  addTxt: { color: "#fff", fontSize: rf(16), fontWeight: "700" },
});
