import * as ImagePicker from "expo-image-picker";

export async function pickImageFromCamera() {
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
  if (permissionResult.granted === false) {
    return { error: "permission" };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.5,
    base64: true,
  });

  if (result.canceled || !result.assets?.[0]?.base64) return { canceled: true };

  return {
    base64: result.assets[0].base64,
    mimeType: result.assets[0].mimeType || "image/jpeg",
  };
}
