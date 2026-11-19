// Browser notifications are not part of the native reminder scheduler.
// Keep the profile preference usable on web while retaining native behavior.
export async function enableMealReminders() {
  return true;
}

export async function disableMealReminders() {}
