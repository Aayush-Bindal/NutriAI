import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

const MealContext = createContext(null);

const EMPTY_DAY = () => ({
  meals: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  tip: null,
});

const dateKey = (date) => {
  // Returns "YYYY-MM-DD" string as the storage key
  const d = new Date(date);
  return `meals_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const SAVED_MEALS_KEY = "saved_meals";

function cleanSavedMeals(value) {
  const parsed = typeof value === "string" ? JSON.parse(value) : value;
  return Array.isArray(parsed)
    ? parsed.filter((m) => m && typeof m === "object" && m.label && m.data)
    : [];
}

export function MealProvider({ children }) {
  const [cache, setCache] = useState({}); // { "meals_2025-03-05": { meals, totals, tip } }
  const [activeDate, setActiveDate] = useState(new Date());
  const [savedMeals, setSavedMeals] = useState([]); // [{ label, data }, ...]

  const refreshSavedMeals = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_MEALS_KEY);
      const valid = cleanSavedMeals(raw);
      setSavedMeals(valid);

      if (raw && raw !== JSON.stringify(valid)) {
        await AsyncStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(valid));
      }
    } catch {
      setSavedMeals([]);
      await AsyncStorage.removeItem(SAVED_MEALS_KEY);
    }
  }, []);

  // Load a specific date from AsyncStorage into cache
  const loadDate = useCallback(
    async (date) => {
      const key = dateKey(date);
      if (cache[key]) return; // already loaded
      try {
        const raw = await AsyncStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : EMPTY_DAY();
        setCache((prev) => ({ ...prev, [key]: data }));
      } catch {
        setCache((prev) => ({ ...prev, [key]: EMPTY_DAY() }));
      }
    },
    [cache],
  );

  // Save a date's data to AsyncStorage
  const saveDate = async (date, data) => {
    const key = dateKey(date);
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save meals:", e);
    }
  };

  // Load today on mount
  useEffect(() => {
    loadDate(new Date());
    refreshSavedMeals();
  }, []);

  // Save a meal with its full nutrition data for quick access
  const saveMealWithData = async (label, data) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    // Avoid duplicates (case-insensitive)
    if (savedMeals.some((m) => m.label.toLowerCase() === trimmed.toLowerCase()))
      return;
    const updated = [{ label: trimmed, data }, ...savedMeals];
    setSavedMeals(updated);
    try {
      await AsyncStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Remove a saved meal by label
  const removeSavedMeal = async (label) => {
    const updated = savedMeals.filter((m) => m.label !== label);
    setSavedMeals(updated);
    try {
      await AsyncStorage.setItem(SAVED_MEALS_KEY, JSON.stringify(updated));
    } catch {}
  };

  // Switch active date — loads from storage if not cached
  const switchDate = useCallback(
    async (date) => {
      setActiveDate(date);
      await loadDate(date);
    },
    [loadDate],
  );

  // Add a meal to active date
  const addMeal = async (mealType, items, mealTotals, mealTip) => {
    const key = dateKey(activeDate);
    const current = cache[key] || EMPTY_DAY();

    const updated = {
      meals: {
        ...current.meals,
        [mealType]: [...(current.meals[mealType] || []), ...items],
      },
      totals: {
        calories: current.totals.calories + mealTotals.calories,
        protein: current.totals.protein + mealTotals.protein,
        carbs: current.totals.carbs + mealTotals.carbs,
        fat: current.totals.fat + mealTotals.fat,
        fiber: current.totals.fiber + (mealTotals.fiber || 0),
      },
      tip: mealTip || current.tip,
    };

    setCache((prev) => ({ ...prev, [key]: updated }));
    await saveDate(activeDate, updated);
  };

  // Remove a single item from a meal category by index
  const removeItem = async (mealType, index) => {
    const key = dateKey(activeDate);
    const current = cache[key] || EMPTY_DAY();
    const list = [...(current.meals[mealType] || [])];
    if (index < 0 || index >= list.length) return;

    const removed = list.splice(index, 1)[0];

    const updated = {
      meals: { ...current.meals, [mealType]: list },
      totals: {
        calories: Math.max(
          0,
          current.totals.calories - (removed.calories || 0),
        ),
        protein: Math.max(0, current.totals.protein - (removed.protein || 0)),
        carbs: Math.max(0, current.totals.carbs - (removed.carbs || 0)),
        fat: Math.max(0, current.totals.fat - (removed.fat || 0)),
        fiber: Math.max(0, current.totals.fiber - (removed.fiber || 0)),
      },
      tip: current.tip,
    };

    setCache((prev) => ({ ...prev, [key]: updated }));
    await saveDate(activeDate, updated);
  };

  const key = dateKey(activeDate);
  const dayData = cache[key] || EMPTY_DAY();

  return (
    <MealContext.Provider
      value={{
        meals: dayData.meals,
        totals: dayData.totals,
        tip: dayData.tip,
        activeDate,
        switchDate,
        addMeal,
        removeItem,
        savedMeals,
        refreshSavedMeals,
        saveMealWithData,
        removeSavedMeal,
      }}
    >
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  return useContext(MealContext);
}
