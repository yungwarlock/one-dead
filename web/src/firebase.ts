// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getMessaging, getToken, isSupported} from "firebase/messaging";
import {getRemoteConfig, fetchAndActivate} from "firebase/remote-config";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

export const analytics = import.meta.env.PROD ? getAnalytics(app) : null;

export const config = getRemoteConfig(app);

config.defaultConfig = {
  "show_history": false,
  "show_notifications": false,
};

fetchAndActivate(config);

const showNotifications = false;

if (showNotifications) {
  isSupported().then(() => {
    const messaging = getMessaging(app);

    Notification.requestPermission().then(async (permission) => {
      if (permission == "granted") {
        const token = await getToken(messaging, {vapidKey: import.meta.env.VITE_VAPID_KEY});
        console.log("TOKEN: ", token);
      }
    });
  });
}

