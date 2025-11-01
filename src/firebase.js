import axios from "axios";
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

async function getBook(bookId) {
  const bookRef = ref(db, "BelajarMembaca/" + bookId);
  const snapshot = await get(bookRef);
  return snapshot.exists() ? snapshot.val() : null;
}

async function getResourceAsBlob(url, props) {
  const { cacheName = "resource-cache-v1", onProgress } = props;

  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  if (cachedResponse) {
    if (onProgress) onProgress({ loaded: 1, total: 1 });
    return cachedResponse.blob();
  }

  const axiosResponse = await axios.get(url, {
    responseType: "blob",
    onDownloadProgress: (progressEvent) => {
      if (onProgress) onProgress(progressEvent);
    },
  });

  if (axiosResponse.status !== 200) {
    throw new Error(
      `Gagal mengunduh: ${axiosResponse.status} ${axiosResponse.statusText}`
    );
  }

  const responseToCache = new Response(axiosResponse.data);
  await cache.put(url, responseToCache);

  return axiosResponse.data;
}

export { app, auth, db, storage, getBook, getResourceAsBlob };
