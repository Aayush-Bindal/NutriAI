import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FoodInput from "../components/log/FoodInput";
import MealTypeSelector from "../components/log/MealTypeSelector";
import NutritionResult from "../components/log/NutritionResult";
import { logMeal, logMealFromImage, scanLabelFromImage } from "../constants/gemini";
import { rf, rs } from "../constants/theme";
import { useMeals } from "../context/MealContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme, useThemedStyles } from "../context/ThemeContext";
import * as Haptics from "../utils/haptics";
import {
  pickImageFromCamera,
  pickImageFromLibrary,
} from "../utils/imageInput";

function getDefaultMeal() {
  const h = new Date().getHours();
  if (h < 12) return "Breakfast";
  if (h < 18) return "Lunch";
  return "Dinner";
}

export default function LogScreen() {
  const router = useRouter();
  const { colors: COLORS, shadow: SHADOW } = useTheme();
  const s = useThemedStyles(createStyles);
  const {
    addMeal,
    savedMeals,
    refreshSavedMeals,
    saveMealWithData,
    removeSavedMeal,
  } = useMeals();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const [input, setInput] = useState("");
  const [mealType, setMealType] = useState(getDefaultMeal());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [analysisImage, setAnalysisImage] = useState(null);
  const [sourcePickerMode, setSourcePickerMode] = useState(null);

  useFocusEffect(
    useCallback(() => {
      refreshSavedMeals();
    }, [refreshSavedMeals]),
  );

  const analyse = async () => {
    if (!input.trim() || loading) return;
    Keyboard.dismiss();

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
      } else if (e.message === "empty_input") {
        setError("Please describe what you ate before analysing.");
      } else {
        setError(`Error: ${e.message}`);
      }
    }
    setLoading(false);
  };

  const addToDiary = () => {
    if (!result) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addMeal(mealType, result.items, result.total, result.tip);
    setAdded(true);
    setTimeout(() => router.back(), 700);
  };

  const reanalyse = () => {
    if (loading || !result) return;
    Keyboard.dismiss();
    if (analysisImage?.base64) {
      analyseFoodImage(analysisImage);
    } else {
      analyse();
    }
  };

  const selectSavedMeal = (meal) => {
    Keyboard.dismiss();
    setInput(meal.label);
    setAnalysisImage(null);
    setResult(meal.data);
    setError(null);
    setAdded(false);
  };

  const analyseFoodImage = async (image) => {
    if (!image?.base64 || loading) return;

    setAnalysisImage({
      base64: image.base64,
      mimeType: image.mimeType || "image/jpeg",
    });
    setLoading(true);
    setError(null);
    setResult(null);
    setAdded(false);

    try {
      const data = await logMealFromImage(
        image.base64,
        image.mimeType || "image/jpeg",
        profile.apiKey,
        input.trim(),
      );
      if (data.error) setError("That doesn't look like food. Try again!");
      else {
        setResult(data);
        if (!input.trim()) setInput("Analyzed from picture");
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const scanFoodLabel = async (image) => {
    if (!image?.base64 || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setAdded(false);

    try {
      const data = await scanLabelFromImage(
        image.base64,
        image.mimeType || "image/jpeg",
        profile.apiKey,
      );

      if (data.error) setError("Could not read nutritional info from this image.");
      else {
        setResult(data);
        if (!input.trim()) setInput("Scanned from label");
      }
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const handleSourceChoice = async (source) => {
    const mode = sourcePickerMode;
    setSourcePickerMode(null);
    const image = source === "camera"
      ? await pickImageFromCamera()
      : await pickImageFromLibrary();

    if (image.error === "permission") {
      setError(
        mode === "label"
          ? "Camera access is required to scan labels."
          : "Camera access is required to take pictures of your food.",
      );
      return;
    }

    if (mode === "label") {
      await scanFoodLabel(image);
    } else {
      await analyseFoodImage(image);
    }
  };

  const openSourcePicker = (mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!profile.apiKey) {
      setError("No API key found. Tap your profile icon to add your Gemini API key.");
      return;
    }
    setSourcePickerMode(mode);
  };

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + rs(20) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.handle} />

        <View style={s.header}>
          <Text style={s.title}>Log a Meal</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>

        <MealTypeSelector mealType={mealType} setMealType={setMealType} />

        <FoodInput
          input={input}
          setInput={setInput}
          loading={loading}
          onAnalyse={analyse}
          savedMeals={savedMeals}
          onRemoveSavedMeal={removeSavedMeal}
          onSelectSavedMeal={selectSavedMeal}
          showAnalyseBtn={!result}
        />

        {error && (
          <View style={s.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={rf(18)}
              color={COLORS.red}
            />
            <Text style={s.errorTxt}>{error}</Text>
          </View>
        )}

        {result && (
          <NutritionResult
            result={result}
            mealType={mealType}
            added={added}
            onAdd={addToDiary}
            onReanalyse={reanalyse}
            onSaveMeal={() => saveMealWithData(input.trim(), result)}
            isMealSaved={savedMeals.some(
              (m) => m.label.toLowerCase() === input.trim().toLowerCase(),
            )}
          />
        )}
      </ScrollView>

      {!loading && !result && (
        <>
          <TouchableOpacity 
            style={[s.miniFab, { bottom: insets.bottom + rs(105) }]} 
            onPress={() => openSourcePicker("label")} 
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={rf(20)} color={COLORS.white} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[s.fab, { bottom: insets.bottom + rs(30) }]} 
            onPress={() => openSourcePicker("food")} 
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={rf(26)} color={COLORS.white} />
          </TouchableOpacity>
        </>
      )}

      <Modal
        visible={!!sourcePickerMode}
        transparent
        animationType="fade"
        onRequestClose={() => setSourcePickerMode(null)}
      >
        <View style={s.sourceOverlay}>
          <View style={[s.sourceCard, SHADOW.md]}>
            <Text style={s.sourceTitle}>
              {sourcePickerMode === "label" ? "Scan a label" : "Add a food photo"}
            </Text>
            <Text style={s.sourceSubtitle}>Choose how to add your image</Text>
            <TouchableOpacity
              style={s.sourceOption}
              onPress={() => handleSourceChoice("camera")}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={rf(22)} color={COLORS.green} />
              <Text style={s.sourceOptionText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.sourceOption}
              onPress={() => handleSourceChoice("library")}
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={rf(22)} color={COLORS.green} />
              <Text style={s.sourceOptionText}>Choose from library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.sourceCancel}
              onPress={() => setSourcePickerMode(null)}
              activeOpacity={0.8}
            >
              <Text style={s.sourceCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (COLORS, SHADOW) => StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20), paddingTop: rs(26) },

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

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(8),
    backgroundColor: COLORS.redLight,
    borderRadius: rs(14),
    padding: rs(14),
    marginBottom: rs(14),
    borderLeftWidth: rs(4),
    borderLeftColor: COLORS.red,
  },
  errorTxt: {
    flex: 1,
    color: COLORS.redDark,
    fontSize: rf(14),
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    right: rs(20),
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    backgroundColor: COLORS.greenDark,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.md,
    zIndex: 10,
  },
  miniFab: {
    position: "absolute",
    right: rs(28),
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: COLORS.greenMutedDark,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.md,
    zIndex: 10,
  },
  sourceOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: COLORS.darkScrim,
    padding: rs(16),
  },
  sourceCard: {
    backgroundColor: COLORS.card,
    borderRadius: rs(24),
    padding: rs(20),
    marginBottom: rs(8),
  },
  sourceTitle: {
    color: COLORS.dark,
    fontSize: rf(18),
    fontWeight: "800",
    textAlign: "center",
  },
  sourceSubtitle: {
    color: COLORS.muted,
    fontSize: rf(13),
    marginTop: rs(4),
    marginBottom: rs(14),
    textAlign: "center",
  },
  sourceOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(14),
    gap: rs(12),
    padding: rs(15),
    marginTop: rs(8),
  },
  sourceOptionText: {
    color: COLORS.dark,
    fontSize: rf(15),
    fontWeight: "700",
  },
  sourceCancel: {
    alignItems: "center",
    paddingVertical: rs(14),
    marginTop: rs(4),
  },
  sourceCancelText: {
    color: COLORS.muted,
    fontSize: rf(14),
    fontWeight: "700",
  },
});
