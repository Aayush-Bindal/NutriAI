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
import Svg, { Circle, Polyline } from "react-native-svg";
import { COLORS, rf, rs, SHADOW, W } from "../constants/theme";
import { useProfile } from "../context/ProfileContext";

// ─── Data ────────────────────────────────────────────────
const GOALS = [
  { key: "lose", label: "Lose Weight", emoji: "🔥" },
  { key: "maintain", label: "Stay Same", emoji: "⚖️" },
  { key: "gain", label: "Gain Weight", emoji: "💪" },
];

const ACTIVITY = [
  {
    key: "sedentary",
    label: "Sedentary",
    desc: "Desk job, little exercise",
    emoji: "🪑",
  },
  {
    key: "light",
    label: "Lightly Active",
    desc: "Light exercise 1-3x/week",
    emoji: "🚶",
  },
  {
    key: "moderate",
    label: "Moderately Active",
    desc: "Moderate exercise 3-5x/week",
    emoji: "🏃",
  },
  {
    key: "active",
    label: "Very Active",
    desc: "Hard training 6-7x/week",
    emoji: "🏋️",
  },
];

// ─── Small chip selector ─────────────────────────────────
function SelectChip({ label, emoji, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.chip, selected && s.chipOn]}
    >
      <Text style={s.chipEmoji}>{emoji}</Text>
      <Text style={[s.chipTxt, selected && s.chipTxtOn]}>{label}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={rf(14)} color={COLORS.green} />
      )}
    </TouchableOpacity>
  );
}

// ─── Option card (activity) ──────────────────────────────
function OptionCard({ label, desc, emoji, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.optionCard, selected && s.optionCardOn]}
    >
      <Text style={s.optionEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[s.optionLabel, selected && s.optionLabelOn]}>
          {label}
        </Text>
        <Text style={s.optionDesc}>{desc}</Text>
      </View>
      {selected && (
        <Ionicons name="checkmark-circle" size={rf(16)} color={COLORS.green} />
      )}
    </TouchableOpacity>
  );
}

// ─── Weight graph ────────────────────────────────────────
function WeightGraph({ data, onDelete }) {
  if (!data || data.length < 2) {
    return (
      <View style={s.graphEmpty}>
        <Ionicons
          name="analytics-outline"
          size={rf(32)}
          color={COLORS.border}
        />
        <Text style={s.graphEmptyText}>
          Log your weight a few times to see your progress graph here.
        </Text>
      </View>
    );
  }

  const graphW = W - rs(80);
  const graphH = rs(140);
  const padX = rs(6);
  const padY = rs(16);

  const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const weights = sorted.map((d) => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const pts = sorted.map((d, i) => {
    const x = padX + (i / (sorted.length - 1)) * (graphW - padX * 2);
    const y = padY + (1 - (d.weight - minW) / range) * (graphH - padY * 2);
    return { x, y };
  });

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const formatDate = (iso) => {
    const d = new Date(iso);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const diff = weights[weights.length - 1] - weights[0];
  const diffText = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  const diffColor =
    diff > 0 ? COLORS.red : diff < 0 ? COLORS.green : COLORS.muted;

  // Show last 10 entries reversed (newest first)
  const recentEntries = [...sorted].reverse().slice(0, 10);

  return (
    <View>
      <View style={s.graphHeader}>
        <Text style={s.graphEntries}>{sorted.length} entries</Text>
        <View style={[s.graphDiffBadge, { backgroundColor: diffColor + "18" }]}>
          <Ionicons
            name={
              diff > 0 ? "trending-up" : diff < 0 ? "trending-down" : "remove"
            }
            size={rf(14)}
            color={diffColor}
          />
          <Text style={[s.graphDiffText, { color: diffColor }]}>
            {diffText} kg
          </Text>
        </View>
      </View>
      <Svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`}>
        <Polyline
          points={polyline}
          fill="none"
          stroke={COLORS.green}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={COLORS.card}
            stroke={COLORS.green}
            strokeWidth={2.5}
          />
        ))}
      </Svg>
      <View style={s.graphLabels}>
        <Text style={s.graphLabel}>{formatDate(sorted[0].date)}</Text>
        <Text style={s.graphLabel}>
          {formatDate(sorted[sorted.length - 1].date)}
        </Text>
      </View>

      {/* Entry list */}
      <View style={s.entryList}>
        <Text style={s.entryListTitle}>Recent entries</Text>
        {recentEntries.map((entry) => (
          <View key={entry.id || entry.date} style={s.entryRow}>
            <View style={s.entryDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.entryWeight}>{entry.weight} kg</Text>
              <Text style={s.entryDate}>
                {formatDate(entry.date)} at {formatTime(entry.date)}
              </Text>
            </View>
            <TouchableOpacity
              style={s.entryDelete}
              activeOpacity={0.6}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onDelete(entry.id);
              }}
            >
              <Ionicons name="trash-outline" size={rf(16)} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

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

  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: "Underweight", color: COLORS.blue };
    if (val < 25) return { label: "Normal", color: COLORS.green };
    if (val < 30) return { label: "Overweight", color: COLORS.amber };
    return { label: "Obese", color: COLORS.red };
  };

  const bmiInfo = bmi ? getBmiCategory(parseFloat(bmi)) : null;

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
        <View style={{ height: Platform.OS === "ios" ? rs(20) : rs(10) }} />

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
          <View style={s.card}>
            {/* Name */}
            <View style={s.avatarRow}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>
                  {form.name ? form.name[0].toUpperCase() : "?"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>NAME</Text>
                <TextInput
                  style={s.inlineInput}
                  value={form.name}
                  onChangeText={(v) => set("name", v)}
                  placeholder="Your name"
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>

            {/* Age + Height */}
            <View style={s.rowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>AGE</Text>
                <View style={s.inputBox}>
                  <TextInput
                    style={s.inputBoxText}
                    value={form.age}
                    onChangeText={(v) => set("age", v.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                    placeholder="25"
                    placeholderTextColor={COLORS.muted}
                  />
                  <Text style={s.inputUnit}>yrs</Text>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.fieldLabelRow}>
                  <Text style={s.fieldLabel}>HEIGHT</Text>
                  <View style={s.htToggle}>
                    <TouchableOpacity
                      style={[
                        s.htToggleBtn,
                        heightUnit === "cm" && s.htToggleBtnOn,
                      ]}
                      onPress={() => switchHeightUnit("cm")}
                    >
                      <Text
                        style={[
                          s.htToggleTxt,
                          heightUnit === "cm" && s.htToggleTxtOn,
                        ]}
                      >
                        cm
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        s.htToggleBtn,
                        heightUnit === "ft" && s.htToggleBtnOn,
                      ]}
                      onPress={() => switchHeightUnit("ft")}
                    >
                      <Text
                        style={[
                          s.htToggleTxt,
                          heightUnit === "ft" && s.htToggleTxtOn,
                        ]}
                      >
                        ft/in
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {heightUnit === "cm" ? (
                  <View style={s.inputBox}>
                    <TextInput
                      style={s.inputBoxText}
                      value={form.height}
                      onChangeText={(v) =>
                        set("height", v.replace(/[^0-9.]/g, ""))
                      }
                      keyboardType="decimal-pad"
                      placeholder="175"
                      placeholderTextColor={COLORS.muted}
                    />
                    <Text style={s.inputUnit}>cm</Text>
                  </View>
                ) : (
                  <View style={s.htFtRow}>
                    <View style={[s.inputBox, { flex: 1 }]}>
                      <TextInput
                        style={s.inputBoxText}
                        value={htFeet}
                        onChangeText={handleHtFeetChange}
                        keyboardType="number-pad"
                        placeholder="5"
                        placeholderTextColor={COLORS.muted}
                      />
                      <Text style={s.inputUnit}>ft</Text>
                    </View>
                    <View style={[s.inputBox, { flex: 1 }]}>
                      <TextInput
                        style={s.inputBoxText}
                        value={htInches}
                        onChangeText={handleHtInchesChange}
                        keyboardType="number-pad"
                        placeholder="8"
                        placeholderTextColor={COLORS.muted}
                      />
                      <Text style={s.inputUnit}>in</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Gender */}
            <Text style={s.fieldLabel}>GENDER</Text>
            <View style={s.chipRow}>
              <SelectChip
                label="Male"
                emoji="🙋‍♂️"
                selected={form.gender === "male"}
                onPress={() => set("gender", "male")}
              />
              <SelectChip
                label="Female"
                emoji="🙋‍♀️"
                selected={form.gender === "female"}
                onPress={() => set("gender", "female")}
              />
            </View>

            {/* Goal */}
            <Text style={s.fieldLabel}>GOAL</Text>
            <View style={s.chipRow}>
              {GOALS.map((g) => (
                <SelectChip
                  key={g.key}
                  label={g.label}
                  emoji={g.emoji}
                  selected={form.goal === g.key}
                  onPress={() => set("goal", g.key)}
                />
              ))}
            </View>

            {/* Activity */}
            <Text style={s.fieldLabel}>ACTIVITY LEVEL</Text>
            <View style={{ gap: rs(8) }}>
              {ACTIVITY.map((a) => (
                <OptionCard
                  key={a.key}
                  label={a.label}
                  desc={a.desc}
                  emoji={a.emoji}
                  selected={form.activity === a.key}
                  onPress={() => set("activity", a.key)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ══════════ WEIGHT SECTION ══════════ */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Ionicons
              name="trending-up-outline"
              size={rf(18)}
              color={COLORS.green}
            />
            <Text style={s.secTitle}>Weight</Text>
          </View>

          <View style={s.weightRow}>
            <View style={s.weightMain}>
              <Text style={s.weightValue}>{currentWeight || "--"}</Text>
              <Text style={s.weightUnit}>kg</Text>
            </View>

            {bmi && (
              <View style={s.bmiBox}>
                <Text style={s.bmiLabel}>BMI</Text>
                <Text style={[s.bmiValue, { color: bmiInfo.color }]}>
                  {bmi}
                </Text>
                <View
                  style={[s.bmiTag, { backgroundColor: bmiInfo.color + "20" }]}
                >
                  <Text style={[s.bmiTagText, { color: bmiInfo.color }]}>
                    {bmiInfo.label}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Update weight */}
          <View style={s.updateRow}>
            <View style={[s.inputBox, { flex: 1 }]}>
              <TextInput
                style={[s.inputBoxText, { flex: 1 }]}
                value={weightInput}
                onChangeText={(v) => setWeightInput(v.replace(/[^0-9.]/g, ""))}
                keyboardType="decimal-pad"
                placeholder="New weight"
                placeholderTextColor={COLORS.muted}
              />
              <Text style={s.inputUnit}>kg</Text>
            </View>
            <TouchableOpacity
              style={[s.updateBtn, !weightInput && s.updateBtnOff]}
              activeOpacity={0.8}
              disabled={!weightInput}
              onPress={handleUpdateWeight}
            >
              <Ionicons
                name="checkmark"
                size={rf(20)}
                color={weightInput ? COLORS.white : COLORS.muted}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ══════════ WEIGHT GRAPH ══════════ */}
        <View style={s.card}>
          <View style={s.secHeader}>
            <Ionicons
              name="analytics-outline"
              size={rf(18)}
              color={COLORS.green}
            />
            <Text style={s.secTitle}>Progress</Text>
          </View>
          <WeightGraph data={weightHistory} onDelete={handleDeleteWeight} />
        </View>

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

  // ─ Avatar ─
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(16),
    marginBottom: rs(18),
  },
  avatar: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(26),
    backgroundColor: COLORS.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: rf(22),
    fontWeight: "900",
    color: COLORS.white,
  },
  inlineInput: {
    fontSize: rf(18),
    fontWeight: "700",
    color: COLORS.dark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: rs(4),
  },

  // ─ Field labels ─
  fieldLabel: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(8),
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(8),
  },
  htToggle: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: rs(8),
    padding: rs(2),
  },
  htToggleBtn: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(3),
    borderRadius: rs(6),
  },
  htToggleBtnOn: {
    backgroundColor: COLORS.green,
  },
  htToggleTxt: {
    fontSize: rf(9),
    fontWeight: "700",
    color: COLORS.mid,
  },
  htToggleTxtOn: {
    color: COLORS.white,
  },
  htFtRow: {
    flexDirection: "row",
    gap: rs(6),
  },

  // ─ Rows ─
  rowTwo: { flexDirection: "row", gap: rs(12), marginBottom: rs(16) },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(8),
    marginBottom: rs(16),
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
  inputUnit: {
    fontSize: rf(12),
    fontWeight: "600",
    color: COLORS.muted,
    marginLeft: rs(6),
  },

  // ─ Chips ─
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(6),
    paddingVertical: rs(10),
    paddingHorizontal: rs(14),
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(12),
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipOn: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  chipEmoji: { fontSize: rf(16) },
  chipTxt: {
    fontSize: rf(13),
    fontWeight: "600",
    color: COLORS.mid,
  },
  chipTxtOn: { color: COLORS.green },

  // ─ Option cards ─
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(14),
    padding: rs(14),
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionCardOn: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  optionEmoji: { fontSize: rf(20) },
  optionLabel: {
    fontSize: rf(14),
    fontWeight: "700",
    color: COLORS.dark,
  },
  optionLabelOn: { color: COLORS.green },
  optionDesc: {
    fontSize: rf(11),
    fontWeight: "500",
    color: COLORS.muted,
    marginTop: rs(2),
  },

  // ─ Weight section ─
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(16),
  },
  weightMain: { flexDirection: "row", alignItems: "baseline", gap: rs(4) },
  weightValue: {
    fontSize: rf(48),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -2,
  },
  weightUnit: {
    fontSize: rf(18),
    fontWeight: "600",
    color: COLORS.muted,
  },
  bmiBox: { alignItems: "center" },
  bmiLabel: {
    fontSize: rf(10),
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bmiValue: {
    fontSize: rf(28),
    fontWeight: "900",
    letterSpacing: -1,
  },
  bmiTag: {
    paddingHorizontal: rs(10),
    paddingVertical: rs(3),
    borderRadius: rs(8),
    marginTop: rs(2),
  },
  bmiTagText: {
    fontSize: rf(10),
    fontWeight: "700",
  },

  updateRow: {
    flexDirection: "row",
    gap: rs(10),
    alignItems: "center",
  },
  updateBtn: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(14),
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.green,
  },
  updateBtnOff: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },

  // ─ Graph ─
  graphEmpty: {
    alignItems: "center",
    paddingVertical: rs(20),
    gap: rs(8),
  },
  graphEmptyText: {
    fontSize: rf(13),
    fontWeight: "500",
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: rf(19),
  },
  graphHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: rs(12),
  },
  graphEntries: {
    fontSize: rf(12),
    fontWeight: "600",
    color: COLORS.muted,
  },
  graphDiffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    paddingHorizontal: rs(10),
    paddingVertical: rs(4),
    borderRadius: rs(8),
  },
  graphDiffText: {
    fontSize: rf(12),
    fontWeight: "700",
  },
  graphLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: rs(6),
  },
  graphLabel: {
    fontSize: rf(10),
    fontWeight: "600",
    color: COLORS.muted,
  },

  // ─ Entry list ─
  entryList: {
    marginTop: rs(16),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: rs(12),
  },
  entryListTitle: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(10),
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardAlt,
  },
  entryDot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: COLORS.green,
    marginRight: rs(12),
  },
  entryWeight: {
    fontSize: rf(15),
    fontWeight: "700",
    color: COLORS.dark,
  },
  entryDate: {
    fontSize: rf(11),
    fontWeight: "500",
    color: COLORS.muted,
    marginTop: rs(1),
  },
  entryDelete: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: COLORS.red + "10",
    alignItems: "center",
    justifyContent: "center",
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
    color: COLORS.border,
    marginTop: rs(2),
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
