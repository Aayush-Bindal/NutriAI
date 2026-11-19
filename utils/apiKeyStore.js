import * as SecureStore from "expo-secure-store";

export async function getApiKey(key) {
  return SecureStore.getItemAsync(key);
}

export async function setApiKey(key, value) {
  return SecureStore.setItemAsync(key, value);
}

export async function deleteApiKey(key) {
  return SecureStore.deleteItemAsync(key);
}
