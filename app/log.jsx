import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import FoodInput from "../components/log/FoodInput";
import MealTypeSelector from "../components/log/MealTypeSelector";
import NutritionResult from "../components/log/NutritionResult";
import { logMeal } from "../constants/gemini";
import { logMealFromImage } from "../constants/gemini-vision";
import { COLORS, SHADOW, rf, rs } from "../constants/theme";
import { useMeals } from "../context/MealContext";
import { useProfile } from "../context/ProfileContext";

function getDefaultMeal() {
  const h = new Date().getHours();
  if (h < 12) return "Breakfast";
  if (h < 18) return "Lunch";
  return "Dinner";
}

export default function LogScreen() {
  const router = useRouter();
  const { addMeal, savedMeals, saveMealWithData, removeSavedMeal } = useMeals();
  const { profile } = useProfile();
  const insets = useSafeAreaInsets();

  const [input, setInput] = useState("");
  const [mealType, setMealType] = useState(getDefaultMeal());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

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
    addMeal(mealType, result.items, result.total, result.tip);
    setAdded(true);
    setTimeout(() => router.back(), 700);
  };

  const selectSavedMeal = (meal) => {
    Keyboard.dismiss();
    setInput(meal.label);
    setResult(meal.data);
    setError(null);
    setAdded(false);
  };

  const handleCameraPress = async () => {
    if (!profile.apiKey) {
      setError("No API key found. Tap your profile icon to add your Gemini API key.");
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      setError("Camera access is required to take pictures of your food.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoading(true);
      setError(null);
      setResult(null);
      setAdded(false);
      
      try {
        const mimeType = result.assets[0].mimeType || "image/jpeg";
        const data = await logMealFromImage(result.assets[0].base64, mimeType, profile.apiKey);
        
        if (data.error) setError("That doesn't look like food. Try again!");
        else {
          setResult(data);
          setInput("Analyzed from picture"); // Optional: set a placeholder text
        }
      } catch (e) {
        setError(`Error: ${e.message}`);
      }
      setLoading(false);
    }
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
        />

        {error && (
          <View style={s.errorCard}>
            <Text style={s.errorTxt}>⚠️ {error}</Text>
          </View>
        )}

        {result && (
          <NutritionResult
            result={result}
            mealType={mealType}
            added={added}
            onAdd={addToDiary}
            onSaveMeal={() => saveMealWithData(input.trim(), result)}
            isMealSaved={savedMeals.some(
              (m) => m.label.toLowerCase() === input.trim().toLowerCase(),
            )}
          />
        )}
      </ScrollView>

      {(!input.trim() && !loading && !result) && (
        <TouchableOpacity 
          style={[s.fab, { bottom: insets.bottom + rs(30) }]} 
          onPress={handleCameraPress} 
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={rf(26)} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
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
    backgroundColor: "#FEF2F2",
    borderRadius: rs(14),
    padding: rs(14),
    marginBottom: rs(14),
    borderLeftWidth: rs(4),
    borderLeftColor: COLORS.red,
  },
  errorTxt: { color: "#b91c1c", fontSize: rf(14), fontWeight: "500" },
  fab: {
    position: "absolute",
    right: rs(20),
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    backgroundColor: "#2D3B2D",
    justifyContent: "center",
    alignItems: "center",
    ...SHADOW.md,
    zIndex: 10,
  },
});
