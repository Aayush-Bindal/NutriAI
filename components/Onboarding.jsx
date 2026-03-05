import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRef, useState } from "react";
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, rf, rs, SHADOW, W } from "../constants/theme";
import { useProfile } from "../context/ProfileContext";

const TOTAL_STEPS = 6; // welcome, name/age/gender, weight/height, goal, activity, api key

// ─── Step indicator dots ──────────────────────────────────
function StepDots({ current, total }) {
  return (
    <View style={d.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            d.dot,
            i === current && d.dotActive,
            i < current && d.dotDone,
          ]}
        />
      ))}
    </View>
  );
}
const d = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: rs(8),
    marginBottom: rs(28),
  },
  dot: {
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.green,
    width: rs(28),
    borderRadius: rs(4),
  },
  dotDone: { backgroundColor: COLORS.greenMid },
});

// ─── Selectable chip ──────────────────────────────────────
function Chip({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[c.chip, selected && c.chipSelected]}
    >
      {icon && (
        <Text style={[c.chipIcon, selected && c.chipIconSelected]}>{icon}</Text>
      )}
      <Text style={[c.chipLabel, selected && c.chipLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={rf(18)}
          color={COLORS.green}
          style={{ marginLeft: rs(4) }}
        />
      )}
    </TouchableOpacity>
  );
}
const c = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: rs(14),
    paddingHorizontal: rs(20),
    borderRadius: rs(16),
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  chipSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },
  chipIcon: { fontSize: rf(20), marginRight: rs(10) },
  chipIconSelected: {},
  chipLabel: {
    fontSize: rf(16),
    fontWeight: "600",
    color: COLORS.mid,
    flex: 1,
  },
  chipLabelSelected: { color: COLORS.dark },
});

// ─── Floating label input ─────────────────────────────────
function LabelInput({
  label,
  value,
  onChangeText,
  keyboardType,
  unit,
  placeholder,
}) {
  return (
    <View style={li.wrap}>
      <Text style={li.label}>{label}</Text>
      <View style={li.inputRow}>
        <TextInput
          style={li.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || "default"}
          placeholder={placeholder || ""}
          placeholderTextColor={COLORS.muted}
          selectionColor={COLORS.green}
        />
        {unit && <Text style={li.unit}>{unit}</Text>}
      </View>
    </View>
  );
}
const li = StyleSheet.create({
  wrap: { marginBottom: rs(18) },
  label: {
    fontSize: rf(13),
    fontWeight: "600",
    color: COLORS.mid,
    marginBottom: rs(6),
    marginLeft: rs(4),
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: rs(16),
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: rs(18),
    ...SHADOW.sm,
  },
  input: {
    flex: 1,
    fontSize: rf(18),
    fontWeight: "700",
    color: COLORS.dark,
    paddingVertical: rs(16),
  },
  unit: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.muted,
    marginLeft: rs(6),
  },
});

// ═══════════════════════════════════════════════════════════
// STEP 0 — Welcome
// ═══════════════════════════════════════════════════════════
function WelcomeStep({ onNext, onRestore }) {
  return (
    <View style={w.container}>
      <View style={w.top}>
        {/* Decorative leaf circles */}
        <View style={w.decoWrap}>
          <View style={w.outerRing}>
            <View style={w.innerRing}>
              <Text style={w.emoji}>🥗</Text>
            </View>
          </View>
        </View>

        <Text style={w.appName}>NutriAI</Text>
        <View style={w.taglineWrap}>
          <View style={w.badge}>
            <Ionicons name="sparkles" size={rf(14)} color={COLORS.green} />
            <Text style={w.badgeText}>AI-Powered</Text>
          </View>
        </View>
        <Text style={w.subtitle}>
          Your intelligent calorie tracker that understands what you eat and
          helps you reach your health goals.
        </Text>
      </View>

      <View style={w.features}>
        {[
          {
            icon: "analytics-outline",
            text: "Smart tracking with personalized goals",
          },
          { icon: "leaf-outline", text: "Built for Indian cuisine & beyond" },
          {
            icon: "sparkles-outline",
            text: "AI-powered meal analysis & tips",
          },
        ].map((f, i) => (
          <View key={i} style={w.featureRow}>
            <View style={w.featureIcon}>
              <Ionicons name={f.icon} size={rf(20)} color={COLORS.green} />
            </View>
            <Text style={w.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onNext();
          }}
          style={w.btn}
        >
          <Text style={w.btnText}>Get Healthy</Text>
          <Ionicons name="arrow-forward" size={rf(20)} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRestore();
          }}
          style={w.restoreBtn}
        >
          <Ionicons
            name="cloud-download-outline"
            size={rf(16)}
            color={COLORS.green}
          />
          <Text style={w.restoreBtnText}>Restore from backup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const w = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: rs(20),
  },
  top: { alignItems: "center", marginTop: rs(30) },
  decoWrap: { marginBottom: rs(24) },
  outerRing: {
    width: rs(130),
    height: rs(130),
    borderRadius: rs(65),
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  innerRing: {
    width: rs(90),
    height: rs(90),
    borderRadius: rs(45),
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOW.md,
  },
  emoji: { fontSize: rf(42) },
  appName: {
    fontSize: rf(42),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -2,
  },
  taglineWrap: { marginTop: rs(8) },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    borderRadius: rs(20),
    gap: rs(6),
  },
  badgeText: {
    fontSize: rf(13),
    fontWeight: "700",
    color: COLORS.green,
  },
  subtitle: {
    fontSize: rf(16),
    fontWeight: "500",
    color: COLORS.mid,
    textAlign: "center",
    marginTop: rs(16),
    lineHeight: rf(24),
    paddingHorizontal: rs(10),
  },
  features: { gap: rs(14), paddingHorizontal: rs(4) },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: rs(16),
    padding: rs(16),
    ...SHADOW.sm,
  },
  featureIcon: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(12),
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: rs(14),
  },
  featureText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.dark,
    flex: 1,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
    paddingVertical: rs(18),
    borderRadius: rs(20),
    gap: rs(10),
    marginTop: rs(20),
    ...SHADOW.green,
  },
  btnText: {
    fontSize: rf(18),
    fontWeight: "800",
    color: COLORS.white,
  },
  restoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    paddingVertical: rs(14),
    marginTop: rs(10),
  },
  restoreBtnText: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.green,
  },
});

// ═══════════════════════════════════════════════════════════
// STEP 1 — Name, Age, Gender
// ═══════════════════════════════════════════════════════════
function Step1({ data, onChange, onNext, onBack }) {
  const canNext = data.name.trim() && data.age && data.gender;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={1} total={TOTAL_STEPS} />
        <Text style={st.title}>Tell us about you</Text>
        <Text style={st.desc}>
          We'll use this to calculate your daily nutrition targets.
        </Text>

        <View style={{ marginTop: rs(24) }}>
          <LabelInput
            label="Your Name"
            value={data.name}
            onChangeText={(v) => onChange({ name: v })}
            placeholder="e.g. Rahul"
          />
          <LabelInput
            label="Age"
            value={data.age}
            onChangeText={(v) => onChange({ age: v.replace(/[^0-9]/g, "") })}
            keyboardType="number-pad"
            placeholder="e.g. 25"
            unit="years"
          />

          <Text style={li.label}>GENDER</Text>
          <View style={st.chipRow}>
            <Chip
              label="Male"
              icon="🙋‍♂️"
              selected={data.gender === "male"}
              onPress={() => onChange({ gender: "male" })}
            />
            <Chip
              label="Female"
              icon="🙋‍♀️"
              selected={data.gender === "female"}
              onPress={() => onChange({ gender: "female" })}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Keyboard.dismiss();
          onNext();
        }}
        style={[st.nextBtn, !canNext && st.nextBtnDisabled]}
      >
        <Text style={[st.nextBtnText, !canNext && st.nextBtnTextDisabled]}>
          Continue
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(18)}
          color={canNext ? COLORS.white : COLORS.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 2 — Weight, Height
// ═══════════════════════════════════════════════════════════
function Step2({ data, onChange, onNext, onBack }) {
  const [heightUnit, setHeightUnit] = useState("cm");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");

  const toggleUnit = (unit) => {
    if (unit === heightUnit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (unit === "ft") {
      const cm = parseFloat(data.height);
      if (cm) {
        const totalIn = cm / 2.54;
        setFeet(String(Math.floor(totalIn / 12)));
        setInches(String(Math.round(totalIn % 12)));
      }
    } else if (feet || inches) {
      const cm = Math.round(
        ((parseInt(feet) || 0) * 12 + (parseInt(inches) || 0)) * 2.54,
      );
      onChange({ height: String(cm) });
    }
    setHeightUnit(unit);
  };

  const onFeet = (v) => {
    const val = v.replace(/[^0-9]/g, "");
    setFeet(val);
    const cm = Math.round(
      ((parseInt(val) || 0) * 12 + (parseInt(inches) || 0)) * 2.54,
    );
    onChange({ height: String(cm) });
  };

  const onInches = (v) => {
    const val = v.replace(/[^0-9]/g, "");
    setInches(val);
    const cm = Math.round(
      ((parseInt(feet) || 0) * 12 + (parseInt(val) || 0)) * 2.54,
    );
    onChange({ height: String(cm) });
  };

  const canNext = data.weight && data.height;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={2} total={TOTAL_STEPS} />
        <Text style={st.title}>Your body metrics</Text>
        <Text style={st.desc}>
          This helps us calculate accurate calorie and macro goals for you.
        </Text>

        <View style={{ marginTop: rs(24) }}>
          <LabelInput
            label="Weight"
            value={data.weight}
            onChangeText={(v) =>
              onChange({ weight: v.replace(/[^0-9.]/g, "") })
            }
            keyboardType="decimal-pad"
            placeholder="e.g. 70"
            unit="kg"
          />

          <View style={li.wrap}>
            <View style={hu.labelRow}>
              <Text style={li.label}>HEIGHT</Text>
              <View style={hu.toggle}>
                <TouchableOpacity
                  style={[hu.toggleBtn, heightUnit === "cm" && hu.toggleBtnOn]}
                  onPress={() => toggleUnit("cm")}
                >
                  <Text
                    style={[
                      hu.toggleTxt,
                      heightUnit === "cm" && hu.toggleTxtOn,
                    ]}
                  >
                    cm
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[hu.toggleBtn, heightUnit === "ft" && hu.toggleBtnOn]}
                  onPress={() => toggleUnit("ft")}
                >
                  <Text
                    style={[
                      hu.toggleTxt,
                      heightUnit === "ft" && hu.toggleTxtOn,
                    ]}
                  >
                    ft/in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {heightUnit === "cm" ? (
              <View style={li.inputRow}>
                <TextInput
                  style={li.input}
                  value={data.height}
                  onChangeText={(v) =>
                    onChange({ height: v.replace(/[^0-9.]/g, "") })
                  }
                  keyboardType="decimal-pad"
                  placeholder="e.g. 175"
                  placeholderTextColor={COLORS.muted}
                  selectionColor={COLORS.green}
                />
                <Text style={li.unit}>cm</Text>
              </View>
            ) : (
              <View style={hu.ftRow}>
                <View style={[li.inputRow, { flex: 1 }]}>
                  <TextInput
                    style={li.input}
                    value={feet}
                    onChangeText={onFeet}
                    keyboardType="number-pad"
                    placeholder="5"
                    placeholderTextColor={COLORS.muted}
                    selectionColor={COLORS.green}
                  />
                  <Text style={li.unit}>ft</Text>
                </View>
                <View style={[li.inputRow, { flex: 1 }]}>
                  <TextInput
                    style={li.input}
                    value={inches}
                    onChangeText={onInches}
                    keyboardType="number-pad"
                    placeholder="8"
                    placeholderTextColor={COLORS.muted}
                    selectionColor={COLORS.green}
                  />
                  <Text style={li.unit}>in</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Visual body card */}
        <View style={st.infoCard}>
          <Ionicons name="body-outline" size={rf(24)} color={COLORS.green} />
          <Text style={st.infoCardText}>
            We use the Mifflin-St Jeor equation to calculate your BMR and daily
            needs.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Keyboard.dismiss();
          onNext();
        }}
        style={[st.nextBtn, !canNext && st.nextBtnDisabled]}
      >
        <Text style={[st.nextBtnText, !canNext && st.nextBtnTextDisabled]}>
          Continue
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(18)}
          color={canNext ? COLORS.white : COLORS.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 3 — Goal
// ═══════════════════════════════════════════════════════════
function Step3({ data, onChange, onNext, onBack }) {
  const canNext = !!data.goal;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={3} total={TOTAL_STEPS} />
        <Text style={st.title}>Your fitness goal</Text>
        <Text style={st.desc}>What's your primary goal right now?</Text>

        <View style={{ marginTop: rs(20), gap: rs(10) }}>
          <Chip
            label="Lose Weight"
            icon="🔥"
            selected={data.goal === "lose"}
            onPress={() => onChange({ goal: "lose" })}
          />
          <Chip
            label="Stay Same"
            icon="⚖️"
            selected={data.goal === "maintain"}
            onPress={() => onChange({ goal: "maintain" })}
          />
          <Chip
            label="Gain Weight"
            icon="💪"
            selected={data.goal === "gain"}
            onPress={() => onChange({ goal: "gain" })}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onNext();
        }}
        style={[st.nextBtn, !canNext && st.nextBtnDisabled]}
      >
        <Text style={[st.nextBtnText, !canNext && st.nextBtnTextDisabled]}>
          Continue
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(18)}
          color={canNext ? COLORS.white : COLORS.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 4 — Activity Level
// ═══════════════════════════════════════════════════════════
function Step4({ data, onChange, onNext, onBack }) {
  const canNext = !!data.activity;
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={4} total={TOTAL_STEPS} />
        <Text style={st.title}>Activity level</Text>
        <Text style={st.desc}>How active are you on a typical week?</Text>

        <View style={{ marginTop: rs(20), gap: rs(10) }}>
          <Chip
            label="Sedentary"
            icon="🪑"
            selected={data.activity === "sedentary"}
            onPress={() => onChange({ activity: "sedentary" })}
          />
          <Chip
            label="Lightly Active"
            icon="🚶"
            selected={data.activity === "light"}
            onPress={() => onChange({ activity: "light" })}
          />
          <Chip
            label="Moderately Active"
            icon="🏃"
            selected={data.activity === "moderate"}
            onPress={() => onChange({ activity: "moderate" })}
          />
          <Chip
            label="Very Active"
            icon="🏋️"
            selected={data.activity === "active"}
            onPress={() => onChange({ activity: "active" })}
          />
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!canNext}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onNext();
        }}
        style={[st.nextBtn, !canNext && st.nextBtnDisabled]}
      >
        <Text style={[st.nextBtnText, !canNext && st.nextBtnTextDisabled]}>
          Continue
        </Text>
        <Ionicons
          name="arrow-forward"
          size={rf(18)}
          color={canNext ? COLORS.white : COLORS.muted}
        />
      </TouchableOpacity>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STEP 5 — Gemini API Key (skippable)
// ═══════════════════════════════════════════════════════════
function Step5({ data, onChange, onFinish, onBack }) {
  return (
    <View style={st.container}>
      <View>
        <TouchableOpacity onPress={onBack} style={st.backBtn}>
          <Ionicons name="arrow-back" size={rf(22)} color={COLORS.dark} />
        </TouchableOpacity>
        <StepDots current={5} total={TOTAL_STEPS} />
        <Text style={st.title}>Power up with AI</Text>
        <Text style={st.desc}>
          Add your Gemini API key to unlock AI-powered meal analysis. You can
          get one for free from Google AI Studio.
        </Text>

        <View style={{ marginTop: rs(24) }}>
          <LabelInput
            label="Gemini API Key"
            value={data.apiKey}
            onChangeText={(v) => onChange({ apiKey: v.trim() })}
            placeholder="Paste your API key here"
          />
        </View>

        <View style={st.infoCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={rf(24)}
            color={COLORS.green}
          />
          <Text style={st.infoCardText}>
            Your API key is stored securely on your device and never shared with
            anyone.
          </Text>
        </View>
      </View>

      <View style={{ gap: rs(12) }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onFinish();
          }}
          style={st.nextBtn}
        >
          <Text style={st.nextBtnText}>
            {data.apiKey ? "Let's Go!" : "I'll add later"}
          </Text>
          <Ionicons name="checkmark-done" size={rf(18)} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// Shared step styles
// ═══════════════════════════════════════════════════════════
const st = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: rs(20),
  },
  backBtn: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(14),
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(16),
    ...SHADOW.sm,
  },
  title: {
    fontSize: rf(28),
    fontWeight: "900",
    color: COLORS.dark,
    letterSpacing: -0.5,
  },
  desc: {
    fontSize: rf(15),
    fontWeight: "500",
    color: COLORS.mid,
    marginTop: rs(6),
    lineHeight: rf(22),
  },
  chipRow: { flexDirection: "row", gap: rs(12) },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.green,
    paddingVertical: rs(18),
    borderRadius: rs(20),
    gap: rs(10),
    ...SHADOW.green,
  },
  nextBtnDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: rf(17),
    fontWeight: "800",
    color: COLORS.white,
  },
  nextBtnTextDisabled: {
    color: COLORS.muted,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(16),
    padding: rs(16),
    gap: rs(12),
    marginTop: rs(20),
  },
  infoCardText: {
    fontSize: rf(13),
    fontWeight: "500",
    color: COLORS.green,
    flex: 1,
    lineHeight: rf(19),
  },
});

const hu = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rs(6),
    marginLeft: rs(4),
    marginRight: rs(4),
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: COLORS.border,
    borderRadius: rs(10),
    padding: rs(2),
  },
  toggleBtn: {
    paddingHorizontal: rs(12),
    paddingVertical: rs(5),
    borderRadius: rs(8),
  },
  toggleBtnOn: {
    backgroundColor: COLORS.green,
  },
  toggleTxt: {
    fontSize: rf(12),
    fontWeight: "700",
    color: COLORS.mid,
  },
  toggleTxtOn: {
    color: COLORS.white,
  },
  ftRow: {
    flexDirection: "row",
    gap: rs(10),
  },
});

// ═══════════════════════════════════════════════════════════
// MAIN ONBOARDING ORCHESTRATOR
// ═══════════════════════════════════════════════════════════
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const {
    updateProfile,
    completeOnboarding,
    restoreFromBackup,
    addWeightEntry,
  } = useProfile();
  const [step, setStep] = useState(0);

  // Local draft data for all fields
  const [draft, setDraft] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    goal: "",
    activity: "",
    apiKey: "",
  });

  // Slide animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTo = (nextStep) => {
    const direction = nextStep > step ? 1 : -1;
    slideAnim.setValue(direction * W);
    setStep(nextStep);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const updateDraft = (updates) => setDraft((p) => ({ ...p, ...updates }));

  const handleFinish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile(draft);
    // Add the onboarding weight as the first weight history entry
    if (draft.weight) {
      addWeightEntry(draft.weight);
    }
    await completeOnboarding();
  };

  const handleRestore = async () => {
    const result = await restoreFromBackup();
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Restored", "Your data has been restored successfully!", [
        { text: "OK", onPress: () => completeOnboarding() },
      ]);
    } else if (!result.canceled) {
      Alert.alert("Error", result.error || "Failed to restore backup.");
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <WelcomeStep onNext={() => animateTo(1)} onRestore={handleRestore} />
        );
      case 1:
        return (
          <Step1
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(2)}
            onBack={() => animateTo(0)}
          />
        );
      case 2:
        return (
          <Step2
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(3)}
            onBack={() => animateTo(1)}
          />
        );
      case 3:
        return (
          <Step3
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(4)}
            onBack={() => animateTo(2)}
          />
        );
      case 4:
        return (
          <Step4
            data={draft}
            onChange={updateDraft}
            onNext={() => animateTo(5)}
            onBack={() => animateTo(3)}
          />
        );
      case 5:
        return (
          <Step5
            data={draft}
            onChange={updateDraft}
            onFinish={handleFinish}
            onBack={() => animateTo(4)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        o.root,
        {
          paddingTop: insets.top + rs(12),
          paddingBottom: insets.bottom + rs(12),
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          style={[o.stepWrap, { transform: [{ translateX: slideAnim }] }]}
        >
          {renderStep()}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const o = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: rs(24),
  },
  stepWrap: {
    flex: 1,
  },
});
