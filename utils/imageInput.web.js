export async function pickImageFromCamera() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.style.display = "none";

    input.onchange = () => {
      input.remove();
      const file = input.files?.[0];
      if (!file) {
        resolve({ canceled: true });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const [, base64 = ""] = result.split(",");
        resolve({ base64, mimeType: file.type || "image/jpeg" });
      };
      reader.onerror = () => reject(reader.error || new Error("Could not read image"));
      reader.readAsDataURL(file);
    };
    input.oncancel = () => {
      input.remove();
      resolve({ canceled: true });
    };

    document.body.appendChild(input);
    input.click();
  });
}
