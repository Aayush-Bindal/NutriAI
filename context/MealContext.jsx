import { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MealContext = createContext(null);

const EMPTY_DAY = () => ({
  meals: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  tip: null,
});

const dateKey = (date) => {
  // Returns "YYYY-MM-DD" string as the storage key
  const d = new Date(date);
  return `meals_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function MealProvider({ children }) {
  const [cache, setCache] = useState({}); // { "meals_2025-03-05": { meals, totals, tip } }
  const [activeDate, setActiveDate] = useState(new Date());

  // Load a specific date from AsyncStorage into cache
  const loadDate = useCallback(async (date) => {
    const key = dateKey(date);
    if (cache[key]) return; // already loaded
    try {
      const raw = await AsyncStorage.getItem(key);
      const data = raw ? JSON.parse(raw) : EMPTY_DAY();
      setCache((prev) => ({ ...prev, [key]: data }));
    } catch {
      setCache((prev) => ({ ...prev, [key]: EMPTY_DAY() }));
    }
  }, [cache]);

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
  }, []);

  // Switch active date — loads from storage if not cached
  const switchDate = useCallback(async (date) => {
    setActiveDate(date);
    await loadDate(date);
  }, [loadDate]);

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
        protein:  current.totals.protein  + mealTotals.protein,
        carbs:    current.totals.carbs    + mealTotals.carbs,
        fat:      current.totals.fat      + mealTotals.fat,
      },
      tip: mealTip || current.tip,
    };

    setCache((prev) => ({ ...prev, [key]: updated }));
    await saveDate(activeDate, updated);
  };

  const key = dateKey(activeDate);
  const dayData = cache[key] || EMPTY_DAY();

  return (
    <MealContext.Provider value={{
      meals: dayData.meals,
      totals: dayData.totals,
      tip: dayData.tip,
      activeDate,
      switchDate,
      addMeal,
    }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  return useContext(MealContext);
}