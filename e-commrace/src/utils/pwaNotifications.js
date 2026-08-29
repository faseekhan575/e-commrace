// ============================================================
// pwaNotifications.js — Audio Chimes, Web Push & Admin PWA Utils
// ============================================================

// 1. Synthesize luxury audio chime using Web Audio API (zero external audio file dependency)
export const playOrderChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Notes sequence for luxury celebratory chime (C6, E6, G6, C7)
    const notes = [1046.5, 1318.5, 1567.98, 2093.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
    });
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
};

// 2. Request and trigger Native Browser Push Notifications
export const requestPushPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

export const showPushNotification = (title, options = {}) => {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const notif = new Notification(title, {
      icon: "/pwa-192x192.svg",
      badge: "/favicon.svg",
      vibrate: [200, 100, 200],
      ...options,
    });

    notif.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notif.close();
    };
  } catch (e) {
    console.warn("Push notification error:", e);
  }
};

// 3. Check if running in Standalone PWA mode
export const isRunningStandalone = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone ||
    document.referrer.includes("android-app://")
  );
};
