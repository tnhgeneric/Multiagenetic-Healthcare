// Centralized backend configuration for the Expo frontend.
// Resolution order:
// 1. Expo config extra.backendUrl (recommended when running Expo on a physical device)
// 2. process.env.BACKEND_BASE_URL (build-time env)
// 3. default to http://localhost:8000 for local web/emulator testing
import Constants from 'expo-constants';

function envBackendUrl(): string | undefined {
  try {
    // expoConfig (app.json/app.config) -> extra.backendUrl
    const extras: any = (Constants && (Constants.expoConfig || (Constants.manifest && Constants.manifest.extra))) || {};
    if (extras && extras.backendUrl) return extras.backendUrl;
  } catch (e) {
    // ignore
  }
  if (process && process.env && process.env.BACKEND_BASE_URL) return process.env.BACKEND_BASE_URL;
  return undefined;
}

function debuggerHostBackend(): string | undefined {
  try {
    // When running via Expo, Constants.manifest.debuggerHost often contains "<ip>:<port>".
    const manifest: any = Constants && (Constants.manifest || Constants.expoConfig || {});
    const dbg = manifest && (manifest.debuggerHost || (manifest.extra && manifest.extra.debuggerHost));
    if (dbg && typeof dbg === 'string') {
      const host = dbg.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:8001`;
      }
    }
  } catch (e) {
    // ignore
  }
  return undefined;
}

// Always use the configured backend URL from app.json or env, fall back to LAN IP
export const BACKEND_BASE_URL: string = envBackendUrl() || 'http://192.168.1.25:8001';

// Developer note:
// - When running the backend locally and testing on a physical device, set
//   `expo.extra.backendUrl` in `app.json` or `process.env.BACKEND_BASE_URL` to
//   your machine LAN IP, e.g. "http://192.168.1.5:8000" so the device can reach it.
// - Expo web/emulator often can use localhost; physical devices cannot reach
//   localhost of your computer, they need the LAN address.
