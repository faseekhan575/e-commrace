let revision = 0;
let memoryToken;

export function readSessionValue(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
export function writeSessionValue(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch { /* Cookie sessions also work when browser storage is disabled. */ }
}
export function getAccessToken() {
  return memoryToken === undefined ? readSessionValue("accessToken") : memoryToken;
}
export function setAccessToken(token) {
  memoryToken = token || null;
  writeSessionValue("accessToken", memoryToken);
}
export function getSessionRevision() { return revision; }
export function resetSessionCredentials() {
  revision += 1;
  setAccessToken(null);
  writeSessionValue("userRole", null);
}
export function broadcastSessionEvent(name, detail) {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(`session:${name}`, { detail }));
}

