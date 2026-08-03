const RELEASE_URL =
  "https://api.github.com/repos/Aayush-Bindal/NutriAI/releases/latest";

export async function getLatestApkUrl() {
  try {
    const res = await fetch(RELEASE_URL);
    if (!res.ok) return null;

    const release = await res.json();
    const apk = (release.assets || []).find((a) => a.name.endsWith(".apk"));
    return apk ? apk.browser_download_url : release.html_url || null;
  } catch {
    return null;
  }
}