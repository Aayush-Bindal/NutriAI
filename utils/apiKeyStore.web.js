export async function getApiKey(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setApiKey(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

export async function deleteApiKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}
