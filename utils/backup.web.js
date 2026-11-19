export async function createBackupFile(payload) {
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "nutriai-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function restoreBackupFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.style.display = "none";

    input.onchange = () => {
      input.remove();
      const file = input.files?.[0];
      if (!file) {
        resolve({ canceled: true });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve({ raw: String(reader.result || "") });
      reader.onerror = () => reject(reader.error || new Error("Could not read backup file"));
      reader.readAsText(file);
    };
    input.oncancel = () => {
      input.remove();
      resolve({ canceled: true });
    };

    document.body.appendChild(input);
    input.click();
  });
}
