import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProfileForm, { GOALS } from "../components/profile/ProfileForm";
import WeightSection from "../components/profile/WeightSection";
import { COLORS, rf, rs, SHADOW } from "../constants/theme";
import { useProfile } from "../context/ProfileContext";

// ═════════════════════════════════════════════════════════
export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    profile,
    updateProfile,
    weightHistory,
    addWeightEntry,
    removeWeightEntry,
    createBackup,
    restoreFromBackup,
  } = useProfile();

  const [form, setForm] = useState({
    name: profile.name || "",
    age: profile.age || "",
    gender: profile.gender || "",
    weight: profile.weight || "",
    height: profile.height || "",
    goal: profile.goal || "",
    activity: profile.activity || "",
    apiKey: profile.apiKey || "",
  });

  const [dirty, setDirty] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [htFeet, setHtFeet] = useState("");
  const [htInches, setHtInches] = useState("");

  const switchHeightUnit = (unit) => {
    if (unit === heightUnit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (unit === "ft") {
      const cm = parseFloat(form.height);
      if (cm) {
        const totalIn = cm / 2.54;
        setHtFeet(String(Math.floor(totalIn / 12)));
        setHtInches(String(Math.round(totalIn % 12)));
      }
    } else if (htFeet || htInches) {
      const cm = Math.round(
        ((parseInt(htFeet) || 0) * 12 + (parseInt(htInches) || 0)) * 2.54,
      );
      set("height", String(cm));
    }
    setHeightUnit(unit);
  };

  const handleHtFeetChange = (v) => {
    const val = v.replace(/[^0-9]/g, "");
    setHtFeet(val);
    const cm = Math.round(
      ((parseInt(val) || 0) * 12 + (parseInt(htInches) || 0)) * 2.54,
    );
    set("height", String(cm));
  };

  const handleHtInchesChange = (v) => {
    const val = v.replace(/[^0-9]/g, "");
    setHtInches(val);
    const cm = Math.round(
      ((parseInt(htFeet) || 0) * 12 + (parseInt(val) || 0)) * 2.54,
    );
    set("height", String(cm));
  };

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setDirty(true);
  };

  const save = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile(form);
    setDirty(false);
    router.back();
  };

  const toggleProfile = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfileExpanded((p) => !p);
  };

  // ─── Backup ──────────────────────────────────────────
  const handleCreateBackup = async () => {
    const result = await createBackup();
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Alert.alert("Error", "Failed to create backup.");
    }
  };

  const handleRestoreBackup = async () => {
    Alert.alert(
      "Restore Backup",
      "This will replace all current data (except API key). Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Choose File",
          onPress: async () => {
            const result = await restoreFromBackup();
            if (result.success) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert(
                "Restored",
                "Your data has been restored. Please restart the app.",
              );
            } else if (!result.canceled) {
              Alert.alert("Error", result.error || "Failed to restore backup.");
            }
          },
        },
      ],
    );
  };

  // ─── Weight ──────────────────────────────────────────
  const handleUpdateWeight = () => {
    const val = parseFloat(weightInput);
    if (!val || val <= 0) return;
    addWeightEntry(val);
    // Update weight in profile directly (no dirty flag)
    updateProfile({ weight: String(val) });
    setForm((p) => ({ ...p, weight: String(val) }));
    setWeightInput("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteWeight = (id) => {
    removeWeightEntry(id);
    // After deletion, update profile weight to the latest remaining entry
    const remaining = weightHistory.filter((e) => e.id !== id);
    if (remaining.length > 0) {
      const sorted = [...remaining].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      const latestWeight = String(sorted[0].weight);
      updateProfile({ weight: latestWeight });
      setForm((p) => ({ ...p, weight: latestWeight }));
    } else {
      updateProfile({ weight: "" });
      setForm((p) => ({ ...p, weight: "" }));
    }
  };

  // Derive current weight from most recent weight history entry
  const latestEntry =
    weightHistory.length > 0
      ? [...weightHistory].sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        )[0]
      : null;
  const currentWeight = latestEntry
    ? latestEntry.weight
    : form.weight
      ? parseFloat(form.weight)
      : null;
  const bmi =
    currentWeight && form.height
      ? (currentWeight / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
      : null;

  const goalLabel = GOALS.find((g) => g.key === form.goal)?.label || "Not set";

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <View style={s.root}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + rs(100) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ height: Platform.OS === "ios" ? rs(40) : rs(30) }} />

        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Settings</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={rf(18)} color={COLORS.mid} />
          </TouchableOpacity>
        </View>

        {/* ══════════ TOP ROW: Profile + Backup ══════════ */}
        <View style={s.topRow}>
          {/* Profile card (collapsed) */}
          <TouchableOpacity
            style={[s.topCard, s.topCardProfile]}
            activeOpacity={0.75}
            onPress={toggleProfile}
          >
            <View style={s.profileCardHeader}>
              <View style={s.topCardAvatar}>
                <Text style={s.topCardAvatarText}>
                  {form.name ? form.name[0].toUpperCase() : "?"}
                </Text>
              </View>
              <View style={s.profileCardChevron}>
                <Ionicons
                  name={profileExpanded ? "chevron-up" : "chevron-down"}
                  size={rf(14)}
                  color={COLORS.muted}
                />
              </View>
            </View>
            <Text style={s.profileCardName} numberOfLines={1}>
              {form.name || "Set up profile"}
            </Text>
            <View style={s.profileCardMeta}>
              <View style={s.profileCardTag}>
                <Text style={s.profileCardTagText}>
                  {GOALS.find((g) => g.key === form.goal)?.emoji || "🎯"}{" "}
                  {goalLabel}
                </Text>
              </View>
            </View>
            <Text style={s.profileCardEdit}>
              {profileExpanded ? "Close" : "Edit profile"}
            </Text>
          </TouchableOpacity>

          {/* Backup card */}
          <View style={[s.topCard, s.topCardBackup]}>
            <View style={s.topCardIcon}>
              <Ionicons
                name="cloud-outline"
                size={rf(22)}
                color={COLORS.green}
              />
            </View>
            <Text style={s.topCardTitle}>Backup</Text>
            <Text style={s.topCardSub}>Export to file</Text>
            <View style={s.backupBtns}>
              <TouchableOpacity
                style={s.backupMiniBtn}
                activeOpacity={0.7}
                onPress={handleCreateBackup}
              >
                <Ionicons
                  name="download-outline"
                  size={rf(14)}
                  color={COLORS.green}
                />
                <Text style={s.backupMiniBtnText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.backupMiniBtn, s.backupMiniBtnAlt]}
                activeOpacity={0.7}
                onPress={handleRestoreBackup}
              >
                <Ionicons
                  name="refresh-outline"
                  size={rf(14)}
                  color={COLORS.mid}
                />
                <Text style={[s.backupMiniBtnText, { color: COLORS.mid }]}>
                  Restore
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ══════════ PROFILE EXPANDED ══════════ */}
        {profileExpanded && (
          <ProfileForm
            form={form}
            set={set}
            heightUnit={heightUnit}
            switchHeightUnit={switchHeightUnit}
            htFeet={htFeet}
            htInches={htInches}
            handleHtFeetChange={handleHtFeetChange}
            handleHtInchesChange={handleHtInchesChange}
          />
        )}

        {/* ══════════ WEIGHT + PROGRESS ══════════ */}
        <WeightSection
          currentWeight={currentWeight}
          bmi={bmi}
          weightInput={weightInput}
          setWeightInput={setWeightInput}
          onUpdateWeight={handleUpdateWeight}
          weightHistory={weightHistory}
          onDeleteWeight={handleDeleteWeight}
        />

        {/* ══════════ API KEY ══════════ */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Ionicons name="key-outline" size={rf(18)} color={COLORS.green} />
            <Text style={s.secTitle}>Gemini API Key</Text>
          </View>
          <View style={s.inputBox}>
            <TextInput
              style={[s.inputBoxText, { flex: 1 }]}
              value={form.apiKey}
              onChangeText={(v) => set("apiKey", v.trim())}
              placeholder="Paste your key from aistudio.google.com"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            {form.apiKey ? (
              <Ionicons
                name="checkmark-circle"
                size={rf(18)}
                color={COLORS.green}
              />
            ) : null}
          </View>
          {form.apiKey ? (
            <Text style={s.apiOk}>Key saved securely on device</Text>
          ) : (
            <Text style={s.apiHint}>Get a free key at aistudio.google.com</Text>
          )}
        </View>

        {/* ══════════ FOOTER ══════════ */}
        <View style={s.footer}>
          <Text style={s.footerName}>NutriAI</Text>
          <Text style={s.footerVersion}>v{appVersion}</Text>
        </View>
      </ScrollView>

      {/* ══════════ SAVE BUTTON (sticky bottom) ══════════ */}
      {dirty && (
        <View style={[s.saveDock, { paddingBottom: insets.bottom + rs(12) }]}>
          <TouchableOpacity
            style={s.saveBtn}
            activeOpacity={0.85}
            onPress={save}
          >
            <Text style={s.saveTxt}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20) },

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
    marginBottom: rs(20),
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

  // ─ Top row ─
  topRow: {
    flexDirection: "row",
    gap: rs(12),
    marginBottom: rs(16),
  },
  topCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(16),
    ...SHADOW.sm,
  },
  topCardProfile: {},
  topCardBackup: {
    alignItems: "center",
  },
  profileCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: rs(10),
  },
  topCardAvatar: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: COLORS.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  topCardAvatarText: {
    fontSize: rf(18),
    fontWeight: "900",
    color: COLORS.white,
  },
  profileCardChevron: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: COLORS.cardAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCardName: {
    fontSize: rf(16),
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: rs(6),
  },
  profileCardMeta: {
    marginBottom: rs(8),
  },
  profileCardTag: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
  },
  profileCardTagText: {
    fontSize: rf(11),
    fontWeight: "700",
    color: COLORS.green,
  },
  profileCardEdit: {
    fontSize: rf(12),
    fontWeight: "600",
    color: COLORS.muted,
  },
  topCardIcon: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(10),
  },
  topCardTitle: {
    fontSize: rf(14),
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: rs(2),
  },
  topCardSub: {
    fontSize: rf(11),
    fontWeight: "600",
    color: COLORS.muted,
    marginBottom: rs(6),
  },

  // ─ Backup mini buttons ─
  backupBtns: {
    flexDirection: "column",
    gap: rs(6),
    width: "100%",
    marginTop: rs(6),
  },
  backupMiniBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(6),
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(10),
    paddingVertical: rs(9),
  },
  backupMiniBtnAlt: {
    backgroundColor: COLORS.cardAlt,
  },
  backupMiniBtnText: {
    fontSize: rf(12),
    fontWeight: "700",
    color: COLORS.green,
  },

  // ─ Cards ─
  card: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(20),
    marginBottom: rs(16),
    ...SHADOW.sm,
  },
  secHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    marginBottom: rs(16),
  },
  secTitle: {
    fontSize: rf(16),
    fontWeight: "800",
    color: COLORS.dark,
  },

  // ─ Input box ─
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rs(12),
  },
  inputBoxText: {
    fontSize: rf(16),
    fontWeight: "700",
    color: COLORS.dark,
  },

  // ─ API key ─
  apiOk: {
    fontSize: rf(12),
    color: COLORS.green,
    fontWeight: "600",
    marginTop: rs(8),
  },
  apiHint: {
    fontSize: rf(12),
    color: COLORS.muted,
    marginTop: rs(8),
    lineHeight: rf(18),
  },

  // ─ Footer ─
  footer: {
    alignItems: "center",
    marginTop: rs(12),
    marginBottom: rs(20),
  },
  footerName: {
    fontSize: rf(18),
    fontWeight: "900",
    color: COLORS.muted,
    letterSpacing: -0.5,
  },
  footerVersion: {
    fontSize: rf(12),
    fontWeight: "600",
    color: COLORS.muted,
    marginTop: rs(4),
  },

  // ─ Save dock ─
  saveDock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bg,
    paddingHorizontal: rs(20),
    paddingTop: rs(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.green,
    borderRadius: rs(18),
    paddingVertical: rs(18),
    alignItems: "center",
    ...SHADOW.green,
  },
  saveTxt: {
    color: "#fff",
    fontSize: rf(16),
    fontWeight: "700",
  },
});
