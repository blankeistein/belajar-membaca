import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { get, getDatabase, ref } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// connectDatabaseEmulator(db, "127.0.0.1", 9000);
// connectStorageEmulator(storage, "127.0.0.1", 9199);

async function getBook(bookId) {
  const bookRef = ref(db, "BelajarMembaca/" + bookId);
  const snapshot = await get(bookRef);
  return snapshot.exists() ? snapshot.val() : null;
}

async function getResourceAsBlob(url, cacheName = "resorce-cache-v1") {
  let cache = await caches.open(cacheName);
  let response = await cache.match(url);

  if (!response) {
    try {
      response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Gagal mengunduh: ${response.status} ${response.statusText}`
        );
      }

      const responseClone = response.clone();
      await cache.put(url, responseClone);
    } catch (err) {
      throw err;
    }
  }

  if (response) {
    return response.blob();
  }

  throw new Error(
    "Gagal mendapatkan respons (response) dari cache maupun jaringan."
  );
}

export { app, auth, db, storage, getBook, getResourceAsBlob };
