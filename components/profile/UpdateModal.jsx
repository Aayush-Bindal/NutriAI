import { Ionicons } from "@expo/vector-icons";
import {
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { COLORS, rf, rs, SHADOW } from "../../constants/theme";

const STATES = {
  available: {
    icon: "arrow-up-circle",
    iconBg: COLORS.greenLight,
    iconColor: COLORS.green,
    title: "Update Available",
  },
  uptodate: {
    icon: "checkmark-circle",
    iconBg: COLORS.greenLight,
    iconColor: COLORS.green,
    title: "You're Up to Date",
  },
  error: {
    icon: "cloud-offline-outline",
    iconBg: "#FDECEA",
    iconColor: COLORS.red,
    title: "Connection Error",
  },
};

const mdStyles = {
  body: { fontSize: rf(13), color: COLORS.mid, lineHeight: rf(20) },
  heading1: {
    fontSize: rf(16),
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: rs(6),
    marginTop: rs(8),
  },
  heading2: {
    fontSize: rf(15),
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: rs(4),
    marginTop: rs(6),
  },
  heading3: {
    fontSize: rf(14),
    fontWeight: "700",
    color: COLORS.dark,
    marginBottom: rs(4),
    marginTop: rs(4),
  },
  strong: { fontWeight: "700", color: COLORS.dark },
  bullet_list_icon: {
    color: COLORS.green,
    fontSize: rf(13),
    lineHeight: rf(20),
    marginRight: rs(6),
  },
  ordered_list_icon: {
    color: COLORS.green,
    fontSize: rf(13),
    lineHeight: rf(20),
    marginRight: rs(6),
  },
  list_item: { flexDirection: "row", marginBottom: rs(4) },
  code_inline: {
    backgroundColor: COLORS.cardAlt,
    color: COLORS.dark,
    fontSize: rf(12),
    borderRadius: rs(4),
    paddingHorizontal: rs(4),
  },
  fence: {
    backgroundColor: COLORS.bg,
    borderRadius: rs(8),
    padding: rs(10),
    marginVertical: rs(6),
  },
  link: { color: COLORS.green, textDecorationLine: "underline" },
  paragraph: { marginTop: rs(2), marginBottom: rs(6) },
  hr: { backgroundColor: COLORS.border, height: 1, marginVertical: rs(8) },
};

export default function UpdateModal({
  data,
  appVersion,
  onClose,
  showSkipAction = false,
  onSkipVersion,
}) {
  if (!data) return null;
  const cfg = STATES[data.status];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity
          style={s.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={s.cardWrap}>
          <View style={s.card}>
            {/* Icon */}
            <View style={[s.iconWrap, { backgroundColor: cfg.iconBg }]}>
              <Ionicons name={cfg.icon} size={rf(32)} color={cfg.iconColor} />
            </View>

            {/* Title */}
            <Text style={s.title}>{cfg.title}</Text>

            {/* Available: version badge + notes + download */}
            {data.status === "available" && (
              <>
                <View style={s.versionBadge}>
                  <Text style={s.versionOld}>v{appVersion}</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={rf(12)}
                    color={COLORS.muted}
                  />
                  <Text style={s.versionNew}>v{data.version}</Text>
                </View>

                <ScrollView style={s.notesBox}>
                  <Markdown style={mdStyles}>{data.notes}</Markdown>
                </ScrollView>

                <TouchableOpacity
                  style={s.primaryBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    Linking.openURL(data.url);
                    onClose();
                  }}
                >
                  <Ionicons
                    name="download-outline"
                    size={rf(16)}
                    color="#fff"
                  />
                  <Text style={s.primaryTxt}>Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={s.secondaryTxt}>Later</Text>
                </TouchableOpacity>
                {showSkipAction && onSkipVersion ? (
                  <TouchableOpacity
                    style={s.secondaryBtn}
                    activeOpacity={0.7}
                    onPress={() => onSkipVersion(data.version)}
                  >
                    <Text style={s.secondaryTxt}>Don{"'"}t show again</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}

            {/* Up to date */}
            {data.status === "uptodate" && (
              <>
                <Text style={s.sub}>v{appVersion} is the latest version.</Text>
                <TouchableOpacity
                  style={s.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={s.secondaryTxt}>Dismiss</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Error */}
            {data.status === "error" && (
              <>
                <Text style={s.sub}>
                  Couldn{"'"}t check for updates.{"\n"}Please try again later.
                </Text>
                <TouchableOpacity
                  style={s.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={onClose}
                >
                  <Text style={s.secondaryTxt}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cardWrap: {
    width: "100%",
    paddingHorizontal: rs(24),
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: rs(24),
    padding: rs(24),
    alignItems: "center",
    ...SHADOW.md,
  },
  iconWrap: {
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rs(14),
  },
  title: {
    fontSize: rf(18),
    fontWeight: "800",
    color: COLORS.dark,
    marginBottom: rs(6),
  },
  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(8),
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(10),
    paddingHorizontal: rs(14),
    paddingVertical: rs(6),
    marginBottom: rs(14),
  },
  versionOld: {
    fontSize: rf(13),
    fontWeight: "600",
    color: COLORS.muted,
  },
  versionNew: {
    fontSize: rf(13),
    fontWeight: "700",
    color: COLORS.green,
  },
  sub: {
    fontSize: rf(14),
    fontWeight: "500",
    color: COLORS.mid,
    textAlign: "center",
    lineHeight: rf(20),
    marginBottom: rs(16),
  },
  notesBox: {
    maxHeight: rs(260),
    width: "100%",
    backgroundColor: COLORS.cardAlt,
    borderRadius: rs(14),
    padding: rs(14),
    marginBottom: rs(18),
  },
  notes: {
    fontSize: rf(13),
    fontWeight: "500",
    color: COLORS.mid,
    lineHeight: rf(20),
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    width: "100%",
    backgroundColor: COLORS.green,
    borderRadius: rs(14),
    paddingVertical: rs(15),
    marginBottom: rs(6),
    ...SHADOW.green,
  },
  primaryTxt: {
    fontSize: rf(15),
    fontWeight: "700",
    color: "#fff",
  },
  secondaryBtn: {
    paddingVertical: rs(10),
  },
  secondaryTxt: {
    fontSize: rf(14),
    fontWeight: "600",
    color: COLORS.muted,
  },
});
