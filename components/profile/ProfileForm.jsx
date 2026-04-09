import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";

// ─── Data ────────────────────────────────────────────────
export const GOALS = [
  { key: "lose", label: "Lose Weight", iconName: "trending-down-outline" },
  { key: "maintain", label: "Stay Same", iconName: "scale-outline" },
  { key: "gain", label: "Gain Weight", iconName: "trending-up-outline" },
];

export const ACTIVITY = [
  {
    key: "sedentary",
    label: "Sedentary",
    desc: "Desk job, little exercise",
    iconName: "bed-outline",
  },
  {
    key: "light",
    label: "Lightly Active",
    desc: "Light exercise 1-3x/week",
    iconName: "walk-outline",
  },
  {
    key: "moderate",
    label: "Moderately Active",
    desc: "Moderate exercise 3-5x/week",
    iconName: "fitness-outline",
  },
  {
    key: "active",
    label: "Very Active",
    desc: "Hard training 6-7x/week",
    iconName: "barbell-outline",
  },
];

// ─── Small chip selector ─────────────────────────────────
function SelectChip({ label, iconName, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.chip, selected && s.chipOn]}
    >
      <Ionicons
        name={iconName}
        size={rf(16)}
        color={selected ? COLORS.green : COLORS.mid}
      />
      <Text style={[s.chipTxt, selected && s.chipTxtOn]}>{label}</Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={rf(14)} color={COLORS.green} />
      )}
    </TouchableOpacity>
  );
}

// ─── Option card (activity) ──────────────────────────────
function OptionCard({ label, desc, iconName, selected, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[s.optionCard, selected && s.optionCardOn]}
    >
      <Ionicons
        name={iconName}
        size={rf(20)}
        color={selected ? COLORS.green : COLORS.mid}
      />
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

export default function ProfileForm({
  form,
  set,
  heightUnit,
  switchHeightUnit,
  htFeet,
  htInches,
  handleHtFeetChange,
  handleHtInchesChange,
}) {
  return (
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
                style={[s.htToggleBtn, heightUnit === "cm" && s.htToggleBtnOn]}
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
                style={[s.htToggleBtn, heightUnit === "ft" && s.htToggleBtnOn]}
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
                onChangeText={(v) => set("height", v.replace(/[^0-9.]/g, ""))}
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
          iconName="male-outline"
          selected={form.gender === "male"}
          onPress={() => set("gender", "male")}
        />
        <SelectChip
          label="Female"
          iconName="female-outline"
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
            iconName={g.iconName}
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
            iconName={a.iconName}
            selected={form.activity === a.key}
            onPress={() => set("activity", a.key)}
          />
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(20),
    marginBottom: rs(16),
    ...SHADOW.sm,
  },
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
  rowTwo: { flexDirection: "row", gap: rs(12), marginBottom: rs(16) },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: rs(8),
    marginBottom: rs(16),
  },
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
  chipTxt: {
    fontSize: rf(13),
    fontWeight: "600",
    color: COLORS.mid,
  },
  chipTxtOn: { color: COLORS.green },
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
});
