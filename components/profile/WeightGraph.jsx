import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { rf, rs, W } from "../../constants/theme";
import { useTheme, useThemedStyles } from "../../context/ThemeContext";

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

export default function WeightGraph({ data, onDelete }) {
  const { colors: COLORS } = useTheme();
  const s = useThemedStyles(createStyles);
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

  const diff = weights[weights.length - 1] - weights[0];
  const diffText = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  const diffColor =
    diff > 0 ? COLORS.red : diff < 0 ? COLORS.green : COLORS.muted;

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

const createStyles = (COLORS) => StyleSheet.create({
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
});
