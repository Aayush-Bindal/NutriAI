import AsyncStorage from "@react-native-async-storage/async-storage";

const RELEASE_URL =
  "https://api.github.com/repos/Aayush-Bindal/NutriAI/releases/latest";
const SKIPPED_UPDATE_VERSION_KEY = "nutriai_skipped_update_version";

function normalizeVersion(version) {
  return String(version || "")
    .replace(/^v/i, "")
    .split(".")
    .map((part) => parseInt(part, 10) || 0);
}

export function isRemoteVersionNewer(remoteVersion, localVersion) {
  const remote = normalizeVersion(remoteVersion);
  const local = normalizeVersion(localVersion);
  const length = Math.max(remote.length, local.length);

  for (let i = 0; i < length; i += 1) {
    const remotePart = remote[i] || 0;
    const localPart = local[i] || 0;

    if (remotePart > localPart) return true;
    if (remotePart < localPart) return false;
  }

  return false;
}

export async function checkForAppUpdate(appVersion) {
  const res = await fetch(RELEASE_URL);
  if (!res.ok) throw new Error("GitHub API error");

  const release = await res.json();
  const remoteVersion = (release.tag_name || "").replace(/^v/i, "");

  if (!isRemoteVersionNewer(remoteVersion, appVersion)) {
    return { status: "uptodate" };
  }

  const apk = (release.assets || []).find((asset) => asset.name.endsWith(".apk"));

  return {
    status: "available",
    version: remoteVersion,
    notes: release.body || "A new version is available.",
    url: apk ? apk.browser_download_url : release.html_url,
  };
}

export async function getSkippedUpdateVersion() {
  return AsyncStorage.getItem(SKIPPED_UPDATE_VERSION_KEY);
}

export async function setSkippedUpdateVersion(version) {
  if (!version) return;
  await AsyncStorage.setItem(SKIPPED_UPDATE_VERSION_KEY, version);
}
