import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, SHADOW, rf, rs } from "../../constants/theme";
import { useMeals } from "../../context/MealContext";

export default function MealSection({ title, items = [] }) {
  const { removeItem } = useMeals();
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (!items.length) return null;
  const total = items.reduce((s, i) => s + i.calories, 0);

  const confirmDelete = () => {
    if (deleteTarget) {
      removeItem(title, deleteTarget.index);
      setDeleteTarget(null);
    }
  };

  return (
    <View style={[s.card, SHADOW.sm]}>
      <View style={s.head}>
        <Text style={s.title}>{title}</Text>
        <Text style={s.cal}>{total} cal</Text>
      </View>
      {items.map((item, i) => (
        <View key={i} style={[s.row, i < items.length - 1 && s.border]}>
          <Text style={s.emoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{item.name}</Text>
            <Text style={s.qty}>{item.quantity}</Text>
          </View>
          <Text style={s.itemCal}>{item.calories}</Text>
          <TouchableOpacity
            onPress={() => setDeleteTarget({ name: item.name, index: i })}
            hitSlop={8}
            style={s.deleteBtn}
          >
            <Ionicons name="trash-outline" size={rf(16)} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      ))}

      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={s.overlay}>
          <View style={[s.modal, SHADOW.md]}>
            <View style={s.modalIcon}>
              <Ionicons name="trash" size={rf(28)} color={COLORS.mid} />
            </View>
            <Text style={s.modalTitle}>Remove Item</Text>
            <Text style={s.modalMsg}>Remove {deleteTarget?.name}?</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity
                style={[s.modalBtn, s.cancelBtn]}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={s.cancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, s.removeBtn]}
                onPress={confirmDelete}
              >
                <Text style={s.removeTxt}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: rs(22),
    marginBottom: rs(12),
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: rs(18),
    paddingVertical: rs(14),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: rf(15), fontWeight: "800", color: COLORS.dark },
  cal: { fontSize: rf(13), fontWeight: "700", color: COLORS.green },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(18),
    paddingVertical: rs(12),
  },
  border: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  emoji: { fontSize: rf(24), marginRight: rs(12) },
  name: { fontSize: rf(14), fontWeight: "600", color: COLORS.dark },
  qty: { fontSize: rf(12), color: COLORS.muted, marginTop: rs(1) },
  itemCal: { fontSize: rf(13), fontWeight: "700", color: COLORS.mid },
  deleteBtn: { marginLeft: rs(10), padding: rs(4) },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.darkScrim,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: COLORS.card,
    borderRadius: rs(24),
    paddingTop: rs(28),
    paddingBottom: rs(20),
    paddingHorizontal: rs(24),
    width: "80%",
    alignItems: "center",
  },
  modalIcon: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    backgroundColor: COLORS.greenLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: rs(14),
  },
  modalTitle: {
    fontSize: rf(17),
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: rs(6),
  },
  modalMsg: {
    fontSize: rf(14),
    color: COLORS.mid,
    textAlign: "center",
    marginBottom: rs(22),
  },
  modalBtns: {
    flexDirection: "row",
    gap: rs(12),
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: rs(13),
    borderRadius: rs(14),
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.cardAlt,
  },
  cancelTxt: {
    fontSize: rf(14),
    fontWeight: "700",
    color: COLORS.mid,
  },
  removeBtn: {
    backgroundColor: COLORS.greenMutedDark,
  },
  removeTxt: {
    fontSize: rf(14),
    fontWeight: "700",
    color: COLORS.white,
  },
});
