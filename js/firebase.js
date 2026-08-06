import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "ISI_DARI_FIREBASE",
    authDomain: "ISI_DARI_FIREBASE",
    projectId: "ISI_DARI_FIREBASE",
    storageBucket: "ISI_DARI_FIREBASE",
    messagingSenderId: "ISI_DARI_FIREBASE",
    appId: "ISI_DARI_FIREBASE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
    db,
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection,
    getDocs,
    query,
    orderBy,
    limit
};
