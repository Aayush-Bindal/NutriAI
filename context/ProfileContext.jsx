import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "nutriai_profile";

const ProfileContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "",
  age: "",
  gender: "",
  weight: "",
  height: "",
  goal: "",
  activity: "",
  apiKey: "",
  calorieGoal: 2000,
  macroGoals: { protein: 120, carbs: 225, fat: 56 },
};

// Protein multiplier per kg bodyweight by goal
// lose:     1.8g/kg — higher protein to preserve muscle on deficit
// maintain: 1.6g/kg — standard active person
// gain:     2.0g/kg — muscle building
const PROTEIN_PER_KG = { lose: 1.8, maintain: 1.6, gain: 2.0 };

function calcGoals(profile) {
  const { age, gender, weight, height, goal, activity } = profile;

  if (!age || !weight || !height) {
    return { calorieGoal: 2000, macroGoals: { protein: 120, carbs: 225, fat: 56 } };
  }

  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);

  // Mifflin-St Jeor BMR
  const bmr = gender === "female"
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;

  const activityMap = {
    sedentary: 1.2,
    light:     1.375,
    moderate:  1.55,
    active:    1.725,
  };
  const tdee = bmr * (activityMap[activity] || 1.375);

  // Calorie goal
  let calorieGoal;
  if (goal === "lose")      calorieGoal = Math.round(tdee - 400);
  else if (goal === "gain") calorieGoal = Math.round(tdee + 300);
  else                      calorieGoal = Math.round(tdee);

  // Protein: based on bodyweight, not % of calories
  const proteinPerKg = PROTEIN_PER_KG[goal] || 1.6;
  const protein = Math.round(w * proteinPerKg);
  const proteinCals = protein * 4;

  // Fat: 25% of total calories
  const fat = Math.round((calorieGoal * 0.25) / 9);
  const fatCals = fat * 9;

  // Carbs: remaining calories after protein and fat
  const remainingCals = calorieGoal - proteinCals - fatCals;
  const carbs = Math.round(Math.max(remainingCals, 0) / 4);

  return {
    calorieGoal,
    macroGoals: { protein, carbs, fat },
  };
}

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loaded, setLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          // Recalculate goals in case formula changed
          const { calorieGoal, macroGoals } = calcGoals(saved);
          setProfile({ ...saved, calorieGoal, macroGoals });
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      const { calorieGoal, macroGoals } = calcGoals(next);
      const final = { ...next, calorieGoal, macroGoals };
      // Save to storage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(final));
      return final;
    });
  };

  if (!loaded) return null; // Wait for storage to load before rendering

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}