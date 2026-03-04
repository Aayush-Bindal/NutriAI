import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useProfile } from "../context/ProfileContext";
import { COLORS, SHADOW, rs, rf } from "../constants/theme";

const GOALS = [
  { key: "lose",     label: "Lose weight",         emoji: "📉" },
  { key: "maintain", label: "Stay the same",        emoji: "⚖️" },
  { key: "gain",     label: "Build muscle",         emoji: "💪" },
];

const ACTIVITY = [
  { key: "sedentary", label: "Desk job, little exercise",  emoji: "🪑" },
  { key: "light",     label: "Light exercise 1–3x/week",   emoji: "🚶" },
  { key: "moderate",  label: "Moderate exercise 3–5x/week",emoji: "🏃" },
  { key: "active",    label: "Hard training 6–7x/week",    emoji: "🏋️" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [form, setForm] = useState({
    name:     profile.name     || "",
    age:      profile.age      || "",
    gender:   profile.gender   || "",
    weight:   profile.weight   || "",
    height:   profile.height   || "",
    goal:     profile.goal     || "",
    activity: profile.activity || "",
    apiKey:   profile.apiKey   || "",
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const save = () => {
    updateProfile(form);
    router.back();
  };

  const isComplete = form.name && form.age && form.gender && form.weight && form.height && form.goal && form.activity;

  return (
    <View style={s.root}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        <View style={{ height: Platform.OS === "ios" ? rs(20) : rs(10) }} />

        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Your Profile</Text>
          <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
            <Text style={s.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>We use this to calculate your personalised calorie goal using the Mifflin-St Jeor formula.</Text>

        {/* Name */}
        <Text style={s.label}>Your name</Text>
        <View style={[s.inputWrap, SHADOW.sm]}>
          <TextInput style={s.input} placeholder="e.g. Arjun" placeholderTextColor={COLORS.muted}
            value={form.name} onChangeText={(v) => set("name", v)} />
        </View>

        {/* Age + Weight + Height */}
        <View style={s.row3}>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Age</Text>
            <View style={[s.inputWrap, SHADOW.sm]}>
              <TextInput style={s.input} placeholder="25" placeholderTextColor={COLORS.muted}
                keyboardType="number-pad" value={form.age} onChangeText={(v) => set("age", v)} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Weight (kg)</Text>
            <View style={[s.inputWrap, SHADOW.sm]}>
              <TextInput style={s.input} placeholder="70" placeholderTextColor={COLORS.muted}
                keyboardType="decimal-pad" value={form.weight} onChangeText={(v) => set("weight", v)} />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.label}>Height (cm)</Text>
            <View style={[s.inputWrap, SHADOW.sm]}>
              <TextInput style={s.input} placeholder="175" placeholderTextColor={COLORS.muted}
                keyboardType="decimal-pad" value={form.height} onChangeText={(v) => set("height", v)} />
            </View>
          </View>
        </View>

        {/* Gender */}
        <Text style={s.label}>Gender</Text>
        <View style={s.chipRow}>
          {[{ key: "male", label: "Male", emoji: "👨" }, { key: "female", label: "Female", emoji: "👩" }].map((g) => (
            <TouchableOpacity key={g.key}
              style={[s.chip, form.gender === g.key && s.chipOn]}
              onPress={() => set("gender", g.key)} activeOpacity={0.75}>
              <Text style={s.chipEmoji}>{g.emoji}</Text>
              <Text style={[s.chipTxt, form.gender === g.key && s.chipTxtOn]}>{g.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goal */}
        <Text style={s.label}>Your goal</Text>
        {GOALS.map((g) => (
          <TouchableOpacity key={g.key}
            style={[s.optionCard, form.goal === g.key && s.optionCardOn, SHADOW.sm]}
            onPress={() => set("goal", g.key)} activeOpacity={0.75}>
            <Text style={s.optionEmoji}>{g.emoji}</Text>
            <Text style={[s.optionTxt, form.goal === g.key && s.optionTxtOn]}>{g.label}</Text>
            {form.goal === g.key && <Text style={s.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Activity */}
        <Text style={s.label}>Activity level</Text>
        {ACTIVITY.map((a) => (
          <TouchableOpacity key={a.key}
            style={[s.optionCard, form.activity === a.key && s.optionCardOn, SHADOW.sm]}
            onPress={() => set("activity", a.key)} activeOpacity={0.75}>
            <Text style={s.optionEmoji}>{a.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.optionTxt, form.activity === a.key && s.optionTxtOn]}>{a.label}</Text>
            </View>
            {form.activity === a.key && <Text style={s.check}>✓</Text>}
          </TouchableOpacity>
        ))}

        {/* Calorie preview */}
        {isComplete && (
          <View style={[s.previewCard, SHADOW.sm]}>
            <Text style={s.previewLbl}>Your estimated daily goal</Text>
            <Text style={s.previewNum}>{calcPreview(form)} <Text style={s.previewUnit}>kcal</Text></Text>
          </View>
        )}

        {/* API Key */}
        <Text style={s.label}>Gemini API Key</Text>
        <View style={[s.inputWrap, SHADOW.sm]}>
          <TextInput
            style={s.input}
            placeholder="Paste your key from aistudio.google.com"
            placeholderTextColor={COLORS.muted}
            value={form.apiKey}
            onChangeText={(v) => set("apiKey", v)}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
          />
        </View>
        {form.apiKey ? (
          <Text style={s.apiKeyOk}>✓ API key saved</Text>
        ) : (
          <Text style={s.apiKeyHint}>
            Get a free key at aistudio.google.com → Get API Key
          </Text>
        )}

        {/* Save */}
        <TouchableOpacity
          style={[s.saveBtn, !isComplete && s.saveBtnOff]}
          onPress={save} disabled={!isComplete} activeOpacity={0.85}>
          <Text style={s.saveTxt}>Save Profile</Text>
        </TouchableOpacity>

        <View style={{ height: rs(50) }} />
      </ScrollView>
    </View>
  );
}

function calcPreview(form) {
  const w = parseFloat(form.weight), h = parseFloat(form.height), a = parseFloat(form.age);
  if (!w || !h || !a) return "—";
  const bmr = form.gender === "female"
    ? 10 * w + 6.25 * h - 5 * a - 161
    : 10 * w + 6.25 * h - 5 * a + 5;
  const act = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const tdee = bmr * (act[form.activity] || 1.375);
  const goal = form.goal === "lose" ? tdee - 400 : form.goal === "gain" ? tdee + 300 : tdee;
  return Math.round(goal).toLocaleString();
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: rs(20) },

  handle: { width: rs(40), height: rs(4), borderRadius: rs(2), backgroundColor: COLORS.border, alignSelf: "center", marginBottom: rs(20) },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: rs(8) },
  title: { fontSize: rf(26), fontWeight: "900", color: COLORS.dark, letterSpacing: -1 },
  closeBtn: { width: rs(36), height: rs(36), borderRadius: rs(18), backgroundColor: COLORS.card, justifyContent: "center", alignItems: "center", ...SHADOW.sm },
  closeTxt: { fontSize: rf(14), color: COLORS.mid },
  subtitle: { fontSize: rf(13), color: COLORS.muted, lineHeight: rf(20), marginBottom: rs(24) },

  label: { fontSize: rf(11), fontWeight: "800", color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: rs(8) },

  inputWrap: { backgroundColor: COLORS.card, borderRadius: rs(16), paddingHorizontal: rs(16), paddingVertical: rs(14), marginBottom: rs(20) },
  input: { fontSize: rf(15), color: COLORS.dark },

  row3: { flexDirection: "row", gap: rs(10) },

  chipRow: { flexDirection: "row", gap: rs(10), marginBottom: rs(22) },
  chip: { flex: 1, flexDirection: "row", alignItems: "center", gap: rs(8), backgroundColor: COLORS.card, borderRadius: rs(16), padding: rs(14), borderWidth: rs(2), borderColor: "transparent", ...SHADOW.sm },
  chipOn: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  chipEmoji: { fontSize: rf(20) },
  chipTxt: { fontSize: rf(14), fontWeight: "600", color: COLORS.mid },
  chipTxtOn: { color: COLORS.green },

  optionCard: { flexDirection: "row", alignItems: "center", gap: rs(12), backgroundColor: COLORS.card, borderRadius: rs(16), padding: rs(16), marginBottom: rs(10), borderWidth: rs(2), borderColor: "transparent" },
  optionCardOn: { borderColor: COLORS.green, backgroundColor: COLORS.greenLight },
  optionEmoji: { fontSize: rf(22) },
  optionTxt: { flex: 1, fontSize: rf(14), fontWeight: "600", color: COLORS.mid },
  optionTxtOn: { color: COLORS.green },
  check: { fontSize: rf(16), color: COLORS.green, fontWeight: "700" },

  previewCard: { backgroundColor: COLORS.dark, borderRadius: rs(20), padding: rs(20), marginTop: rs(8), marginBottom: rs(20), alignItems: "center" },
  previewLbl: { fontSize: rf(12), color: "rgba(255,255,255,0.5)", fontWeight: "600", marginBottom: rs(4) },
  previewNum: { fontSize: rf(36), fontWeight: "900", color: "#fff", letterSpacing: -1.5 },
  previewUnit: { fontSize: rf(16), fontWeight: "600", color: "rgba(255,255,255,0.5)" },

  apiKeyOk: { fontSize: rf(12), color: COLORS.green, fontWeight: "600", marginTop: rs(-14), marginBottom: rs(20) },
  apiKeyHint: { fontSize: rf(12), color: COLORS.muted, marginTop: rs(-14), marginBottom: rs(20), lineHeight: rf(18) },
  saveBtn: { backgroundColor: COLORS.dark, borderRadius: rs(18), paddingVertical: rs(18), alignItems: "center", ...SHADOW.md },
  saveBtnOff: { backgroundColor: COLORS.border, shadowOpacity: 0, elevation: 0 },
  saveTxt: { color: "#fff", fontSize: rf(16), fontWeight: "700" },
});