
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
  import { getDatabase, ref, set, update, push, onValue, get, child } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
  import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB5TbdjcN6DkwsD9Xr34XJ2Nx6HWx2Q8i0",
    authDomain: "bus-tracking-a0d37.firebaseapp.com",
    databaseURL: "https://bus-tracking-a0d37-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bus-tracking-a0d37",
    storageBucket: "bus-tracking-a0d37.firebasestorage.app",
    messagingSenderId: "1098696368650",
    appId: "1:1098696368650:web:87d41cea634d40166b75f3"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);

  window.fb = { app, db, auth, ref, set, update, push, onValue, get, child, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword };