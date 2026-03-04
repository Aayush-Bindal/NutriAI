import { View, Text, StyleSheet } from "react-native";

export default function MacroCard({ label, value, unit = "g", color }) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderTopWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
  unit: {
    fontSize: 11,
    color: "#aaa",
    marginTop: 1,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
    fontWeight: "500",
  },
});