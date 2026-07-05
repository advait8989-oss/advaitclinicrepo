// ─────────────────────────────────────────────────────────────
// FIREBASE SETUP (optional but recommended — see README.md)
//
// Until you fill this in, the app runs in "This Device" mode and
// saves everything in the browser on this computer.
//
// To sync data to the cloud (safe backup + use from phone/laptop):
//   1. Go to https://console.firebase.google.com and create a project
//   2. Add a Web App, copy the firebaseConfig it shows you
//   3. Paste the values below (replace the empty strings)
//   4. In the console enable: Authentication → Email/Password,
//      and Firestore Database
// ─────────────────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
