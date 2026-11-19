import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export async function createBackupFile(payload) {
  const filePath = `${FileSystem.cacheDirectory}nutriai-backup.json`;
  await FileSystem.writeAsStringAsync(filePath, payload);
  await Sharing.shareAsync(filePath, {
    mimeType: "application/json",
    dialogTitle: "Save NutriAI Backup",
  });
}

export async function restoreBackupFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });
  if (result.canceled) return { canceled: true };

  const file = result.assets[0];
  return { raw: await FileSystem.readAsStringAsync(file.uri) };
}
