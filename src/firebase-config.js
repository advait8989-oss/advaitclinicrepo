// Firebase project: advait-clinic-app (console.firebase.google.com)
// Free Spark plan — no billing enabled, cannot be charged.
export const firebaseConfig = {
  apiKey: 'AIzaSyDBkYuPLrJbxpgqG8zKkG1IE36o22wgSEU',
  authDomain: 'advait-clinic-app.firebaseapp.com',
  projectId: 'advait-clinic-app',
  storageBucket: 'advait-clinic-app.firebasestorage.app',
  messagingSenderId: '1038191919666',
  appId: '1:1038191919666:web:fa6402f06371d7a82cb22b',
}

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
