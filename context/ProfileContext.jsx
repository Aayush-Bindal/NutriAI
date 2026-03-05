import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";
import * as Sharing from "expo-sharing";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "nutriai_profile";
const SECURE_API_KEY = "nutriai_api_key";
const WEIGHT_HISTORY_KEY = "nutriai_weight_history";

const ProfileContext = createContext(null);
const ONBOARDING_KEY = "nutriai_onboarding_done";

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
    return {
      calorieGoal: 2000,
      macroGoals: { protein: 120, carbs: 225, fat: 56 },
    };
  }

  const w = parseFloat(weight);
  const h = parseFloat(height);
  const a = parseFloat(age);

  // Mifflin-St Jeor BMR
  const bmr =
    gender === "female"
      ? 10 * w + 6.25 * h - 5 * a - 161
      : 10 * w + 6.25 * h - 5 * a + 5;

  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const tdee = bmr * (activityMap[activity] || 1.375);

  let calorieGoal;
  if (goal === "lose") calorieGoal = Math.round(tdee - 400);
  else if (goal === "gain") calorieGoal = Math.round(tdee + 300);
  else calorieGoal = Math.round(tdee);

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
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [weightHistory, setWeightHistory] = useState([]);

  const completeOnboarding = async () => {
    setOnboardingDone(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(console.warn);
  };

  // Load from storage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const secureApiKey = await SecureStore.getItemAsync(SECURE_API_KEY);
        const obDone = await AsyncStorage.getItem(ONBOARDING_KEY);
        const whRaw = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);

        if (obDone === "true") setOnboardingDone(true);
        if (whRaw) {
          // Migrate old entries that may not have an id
          const parsed = JSON.parse(whRaw);
          let needsMigration = false;
          const migrated = parsed.map((entry, i) => {
            if (!entry.id) {
              needsMigration = true;
              return { ...entry, id: new Date(entry.date).getTime() + i };
            }
            return entry;
          });
          if (needsMigration) {
            AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(migrated)).catch(console.warn);
          }
          setWeightHistory(migrated);
        }

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
          setProfile({
            ...saved,
            apiKey: finalApiKey,
            calorieGoal,
            macroGoals,
          });
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
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nonSensitiveProfile),
      ).catch((e) => console.warn(e));

      // Save API Key to SecureStore
      if (apiKey) {
        SecureStore.setItemAsync(SECURE_API_KEY, apiKey).catch((e) =>
          console.warn(e),
        );
      } else {
        SecureStore.deleteItemAsync(SECURE_API_KEY).catch((e) =>
          console.warn(e),
        );
      }

      return final;
    });
  };

  const addWeightEntry = (kg) => {
    const entry = { id: Date.now(), date: new Date().toISOString(), weight: parseFloat(kg) };
    setWeightHistory((prev) => {
      const next = [...prev, entry];
      AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(next)).catch(console.warn);
      return next;
    });
  };

  const removeWeightEntry = (id) => {
    setWeightHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(next)).catch(console.warn);
      return next;
    });
  };

  // ─── Backup / Restore (file-based, excludes API key) ───
  const createBackup = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData = await AsyncStorage.multiGet(allKeys);
      const backup = {};
      allData.forEach(([k, v]) => {
        // Exclude old backup key and onboarding flag from backup payload
        if (k !== "nutriai_backup") {
          backup[k] = v;
        }
      });

      // Strip apiKey from profile data if present
      if (backup[STORAGE_KEY]) {
        const profileData = JSON.parse(backup[STORAGE_KEY]);
        delete profileData.apiKey;
        backup[STORAGE_KEY] = JSON.stringify(profileData);
      }

      const payload = JSON.stringify({ version: 1, date: new Date().toISOString(), data: backup }, null, 2);
      const filePath = `${FileSystem.cacheDirectory}nutriai-backup.json`;
      await FileSystem.writeAsStringAsync(filePath, payload);
      await Sharing.shareAsync(filePath, { mimeType: "application/json", dialogTitle: "Save NutriAI Backup" });
      return { success: true };
    } catch (e) {
      console.warn("Backup error:", e);
      return { success: false, error: e.message };
    }
  };

  const restoreFromBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true });
      if (result.canceled) return { success: false, canceled: true };

      const file = result.assets[0];
      const raw = await FileSystem.readAsStringAsync(file.uri);
      const parsed = JSON.parse(raw);

      if (!parsed.data) {
        return { success: false, error: "Invalid backup file" };
      }

      const pairs = Object.entries(parsed.data).filter(
        ([k]) => k !== "nutriai_backup"
      );
      await AsyncStorage.multiSet(pairs);

      // Reload profile from restored data
      if (parsed.data[STORAGE_KEY]) {
        const saved = JSON.parse(parsed.data[STORAGE_KEY]);
        const { calorieGoal, macroGoals } = calcGoals(saved);
        setProfile((prev) => ({
          ...saved,
          apiKey: prev.apiKey, // Keep current API key, don't restore
          calorieGoal,
          macroGoals,
        }));
      }

      // Reload weight history
      if (parsed.data[WEIGHT_HISTORY_KEY]) {
        const wh = JSON.parse(parsed.data[WEIGHT_HISTORY_KEY]);
        const migrated = wh.map((entry, i) => {
          if (!entry.id) return { ...entry, id: new Date(entry.date).getTime() + i };
          return entry;
        });
        setWeightHistory(migrated);
      }

      // Mark onboarding done if backup had it
      if (parsed.data[ONBOARDING_KEY] === "true") {
        setOnboardingDone(true);
      }

      return { success: true };
    } catch (e) {
      console.warn("Restore error:", e);
      return { success: false, error: e.message };
    }
  };

  if (!loaded) return null; // Wait for storage to load before rendering

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, onboardingDone, completeOnboarding, weightHistory, addWeightEntry, removeWeightEntry, createBackup, restoreFromBackup }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
