import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";

const SUGGESTIONS = [
  "2 roti + dal makhani",
  "oats with banana",
  "idli sambar",
  "chicken sandwich",
  "poha and chai",
  "rajma chawal",
];

export default function FoodInput({ input, setInput, loading, onAnalyse }) {
  return (
    <>
      <Text style={s.secLabel}>What did you eat?</Text>
      <View style={[s.inputWrap, SHADOW.sm]}>
        <TextInput
          style={s.input}
          placeholder="e.g. 2 rotis with dal makhani and lassi..."
          placeholderTextColor={COLORS.muted}
          value={input}
          onChangeText={setInput}
          multiline
          autoFocus
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: rs(20) }}
      >
        {SUGGESTIONS.map((sg) => (
          <TouchableOpacity
            key={sg}
            style={s.sugg}
            onPress={() => setInput(sg)}
          >
            <Text style={s.suggTxt}>{sg}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[s.analyseBtn, (!input.trim() || loading) && s.analyseBtnOff]}
        onPress={onAnalyse}
        disabled={!input.trim() || loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.analyseTxt}>Analyse Nutrition</Text>
        )}
      </TouchableOpacity>
    </>
  );
}

const s = StyleSheet.create({
  secLabel: {
    fontSize: rf(11),
    fontWeight: "800",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: rs(10),
  },
  inputWrap: {
    backgroundColor: COLORS.card,
    borderRadius: rs(20),
    padding: rs(18),
    marginBottom: rs(12),
  },
  input: {
    fontSize: rf(15),
    color: COLORS.dark,
    minHeight: rs(88),
    textAlignVertical: "top",
    lineHeight: rf(22),
  },
  sugg: {
    backgroundColor: COLORS.greenLight,
    borderRadius: rs(99),
    paddingHorizontal: rs(14),
    paddingVertical: rs(8),
    marginRight: rs(8),
  },
  suggTxt: { fontSize: rf(12), color: COLORS.green, fontWeight: "600" },
  analyseBtn: {
    backgroundColor: "#2D3B2D",
    borderRadius: rs(18),
    paddingVertical: rs(18),
    alignItems: "center",
    marginBottom: rs(14),
    ...SHADOW.md,
  },
  analyseBtnOff: {
    backgroundColor: "#b5d6b8",
    shadowOpacity: 0,
    elevation: 0,
  },
  analyseTxt: { color: "#fff", fontSize: rf(16), fontWeight: "700" },
});
