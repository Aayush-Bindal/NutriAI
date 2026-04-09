import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import * as Haptics from "../../utils/haptics";

const PLACEHOLDERS = [
  "e.g., 2 rotis with dal makhani and lassi...",
  "Image context: 'I only ate half of this plate'...",
  "e.g., 1 scoop whey, 1 banana, 200ml milk...",
  "Image context: 'Cooked in 1 tbsp ghee'...",
];

export default function FoodInput({
  input,
  setInput,
  loading,
  onAnalyse,
  savedMeals,
  onRemoveSavedMeal,
  onSelectSavedMeal,
  showAnalyseBtn = true,
}) {
  const { colors: COLORS, shadow: SHADOW } = useTheme();
  const s = useThemedStyles(createStyles);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (input) return; // Don't animate if user has typed something

    const interval = setInterval(() => {
      // Animate out (slide up and fade out)
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -15,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Change text
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        // Reset position to bottom instantly
        translateY.setValue(15);
        // Animate in (slide up to center and fade in)
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [input, opacity, translateY]);

  // Filter out invalid entries (handle old string format or corrupted data)
  const validMeals = (savedMeals || []).filter(
    (m) => m && typeof m === "object" && m.label
  );

  return (
    <>
      <Text style={s.secLabel}>What did you eat?</Text>
      <View style={[s.inputWrap, SHADOW.sm]}>
        {!input && (
          <View style={s.placeholderContainer} pointerEvents="none">
            <Animated.Text
              style={[
                s.placeholderText,
                { opacity, transform: [{ translateY }] },
              ]}
            >
              {PLACEHOLDERS[placeholderIndex]}
            </Animated.Text>
          </View>
        )}
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          multiline
        />
      </View>

      {validMeals.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: rs(20) }}
        >
          {validMeals.map((sg, idx) => (
            <TouchableOpacity
              key={sg.label || idx}
              style={s.sugg}
              onPress={() => onSelectSavedMeal(sg)}
              onLongPress={() => onRemoveSavedMeal(sg.label)}
            >
              <Text style={s.suggTxt}>{sg.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {showAnalyseBtn && (
        <TouchableOpacity
          style={[s.analyseBtn, (!input.trim() || loading) && s.analyseBtnOff]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onAnalyse();
          }}
          disabled={!input.trim() || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={s.analyseTxt}>Analyse Nutrition</Text>
          )}
        </TouchableOpacity>
      )}
    </>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  secLabel: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(10),
  },
  inputWrap: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(18),
    marginBottom: rs(12),
    position: "relative",
  },
  placeholderContainer: {
    position: "absolute",
    top: rs(18),
    left: rs(18),
    right: rs(18),
  },
  placeholderText: {
    fontSize: rf(15),
    color: COLORS.muted,
    lineHeight: rf(22),
  },
  input: {
    fontSize: rf(15),
    color: COLORS.dark,
    minHeight: rs(88),
    textAlignVertical: "top",
    lineHeight: rf(22),
    zIndex: 1, // ensure input rests above the placeholder
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
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
    backgroundColor: COLORS.greenDark,
    borderRadius: rs(18),
    paddingVertical: rs(18),
    alignItems: "center",
    marginBottom: rs(14),
    ...SHADOW.md,
  },
  analyseBtnOff: {
    backgroundColor: COLORS.greenDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  analyseTxt: { color: COLORS.white, fontSize: rf(16), fontWeight: "700" },
});
