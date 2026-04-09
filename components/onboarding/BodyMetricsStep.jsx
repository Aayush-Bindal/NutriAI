import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { rf, rs } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";
import LabelInput, { useLabelInputStyles } from "./LabelInput";
import StepDots from "./StepDots";
import { useStepStyles } from "./stepStyles";

export default function BodyMetricsStep({ data, onChange, onNext, onBack }) {
  const { colors: COLORS } = useTheme();
  const st = useStepStyles();
  const li = useLabelInputStyles();
  const hu = useThemedStyles(createStyles);
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
        <StepDots current={3} />
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
          color={canNext ? COLORS.white : COLORS.onboardingDisabledBtnText}
        />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (COLORS) => StyleSheet.create({
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
