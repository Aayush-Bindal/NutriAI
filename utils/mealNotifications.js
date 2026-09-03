import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

// Temporary Expo Go UI-testing switch. Set to false for real notifications.
const DISABLE_NOTIFICATIONS_FOR_EXPO_GO = false;

export const MEAL_REMINDER_NOTIFICATIONS = [
  { id: "breakfast", hour: 8, minute: 0, title: "Breakfast check-in", bodies: ["Had breakfast? Log it in NutriAI when you have a moment — no pressure.", "A little breakfast check-in? Add it to your day whenever you are ready.", "Start your nutrition snapshot with breakfast. A quick log is all it takes.", "Breakfast happened? NutriAI is here when you want to jot it down."] },
  { id: "lunch", hour: 12, minute: 0, title: "Lunch check-in", bodies: ["Take a quick moment to log lunch and keep your day in view.", "Lunch check-in: what did you enjoy? Add it to NutriAI when convenient.", "Your midday nutrition snapshot is waiting — whenever you feel like logging it.", "No rush, just a gentle nudge: remember to log lunch if you had it."] },
  { id: "snack", hour: 16, minute: 0, title: "Snack check-in", bodies: ["Did you have a snack? A quick log helps NutriAI keep your totals useful.", "Snack time check-in 🍎 Add a bite or two to your day if you would like.", "A small snack can still count. Log it whenever you have a moment.", "Curious how your day is shaping up? A snack log can fill in the picture."] },
  { id: "dinner", hour: 20, minute: 0, title: "Dinner check-in", bodies: ["Whenever you are ready, log dinner and wrap up your nutrition snapshot.", "Dinner check-in: add your evening meal and see how your day looks.", "Had dinner? NutriAI would love the update — whenever you are ready.", "One gentle evening nudge: log dinner if you want tomorrow’s insights to be better."] },
];

const MEAL_REMINDER_PREFIX = "meal-reminder-";
let Notifications = null;

async function getNotifications() {
  if (DISABLE_NOTIFICATIONS_FOR_EXPO_GO || isRunningInExpoGo()) return null;
  if (!Notifications) {
    Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  }
  return Notifications;
}

export async function enableMealReminders() {
  const notifications = await getNotifications();
  if (!notifications) return true;
  const current = await notifications.getPermissionsAsync();
  let permission = current;
  if (current.status !== "granted") permission = await notifications.requestPermissionsAsync();
  if (permission.status !== "granted") return false;

  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled
    .filter(({ identifier }) => identifier.startsWith(MEAL_REMINDER_PREFIX))
    .map(({ identifier }) => notifications.cancelScheduledNotificationAsync(identifier)));

  if (notifications.setNotificationChannelAsync) {
    await notifications.setNotificationChannelAsync("meal-reminders", {
      name: "Meal reminders",
      importance: notifications.AndroidImportance.DEFAULT,
      sound: null,
      vibrationPattern: [0, 200],
    });
  }

  await Promise.all(MEAL_REMINDER_NOTIFICATIONS.map((reminder) =>
    notifications.scheduleNotificationAsync({
      identifier: `${MEAL_REMINDER_PREFIX}${reminder.id}`,
      content: {
        title: reminder.title,
        body: reminder.bodies[Math.floor(Math.random() * reminder.bodies.length)],
        data: { type: "meal-reminder", meal: reminder.id },
        ...(Platform.OS === "android" ? { channelId: "meal-reminders" } : {}),
      },
      trigger: {
        type: notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: reminder.minute,
      },
    }),
  ));
  return true;
}

export async function disableMealReminders() {
  const notifications = await getNotifications();
  if (!notifications) return;
  const scheduled = await notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled
    .filter(({ identifier }) => identifier.startsWith(MEAL_REMINDER_PREFIX))
    .map(({ identifier }) => notifications.cancelScheduledNotificationAsync(identifier)));
}
