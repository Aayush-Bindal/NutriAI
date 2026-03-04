import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "nutriai_profile";
const SECURE_API_KEY = "nutriai_api_key";

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

  let calorieGoal;
  if (goal === "lose")      calorieGoal = Math.round(tdee - 400);
  else if (goal === "gain") calorieGoal = Math.round(tdee + 300);
  else                      calorieGoal = Math.round(tdee);

  const proteinPerKg = PROTEIN_PER_KG[goal] || 1.6;
  const protein = Math.round(w * proteinPerKg);
  const proteinCals = protein * 4;

  const fat = Math.round((calorieGoal * 0.25) / 9);
  const fatCals = fat * 9;

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
    async function loadData() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const secureApiKey = await SecureStore.getItemAsync(SECURE_API_KEY);
        
        if (raw) {
          const saved = JSON.parse(raw);
          let finalApiKey = secureApiKey || "";

          // Migration step: If a key exists in plain text (old version) but not in SecureStore, move it.
          if (saved.apiKey && !secureApiKey) {
            finalApiKey = saved.apiKey;
            await SecureStore.setItemAsync(SECURE_API_KEY, finalApiKey);
            
            // Remove the plaintext key from the AsyncStorage payload
            delete saved.apiKey;
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
          }

          const { calorieGoal, macroGoals } = calcGoals(saved);
          setProfile({ ...saved, apiKey: finalApiKey, calorieGoal, macroGoals });
        } else if (secureApiKey) {
          // Edge case: No profile data but API key exists
          setProfile((prev) => ({ ...prev, apiKey: secureApiKey }));
        }
      } catch (e) {
        console.warn("Error loading profile:", e);
      } finally {
        setLoaded(true);
      }
    }

    loadData();
  }, []);

  const updateProfile = (updates) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      const { calorieGoal, macroGoals } = calcGoals(next);
      const final = { ...next, calorieGoal, macroGoals };
      
      // Separate sensitive and non-sensitive data
      const { apiKey, ...nonSensitiveProfile } = final;

      // Save non-sensitive data to AsyncStorage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nonSensitiveProfile)).catch(e => console.warn(e));

      // Save API Key to SecureStore
      if (apiKey) {
        SecureStore.setItemAsync(SECURE_API_KEY, apiKey).catch(e => console.warn(e));
      } else {
        SecureStore.deleteItemAsync(SECURE_API_KEY).catch(e => console.warn(e));
      }

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