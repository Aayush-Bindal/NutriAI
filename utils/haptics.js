import * as ExpoHaptics from "expo-haptics";

let hapticsEnabled = true;

export const ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

export function configureHaptics(enabled) {
  hapticsEnabled = enabled;
}

export async function impactAsync(style = ImpactFeedbackStyle.Light) {
  if (!hapticsEnabled) return;

  try {
    await ExpoHaptics.impactAsync(style);
  } catch {}
}

export async function notificationAsync(
  type = NotificationFeedbackType.Success,
) {
  if (!hapticsEnabled) return;

  try {
    await ExpoHaptics.notificationAsync(type);
  } catch {}
}

export async function selectionAsync() {
  if (!hapticsEnabled) return;

  try {
    await ExpoHaptics.selectionAsync();
  } catch {}
}
