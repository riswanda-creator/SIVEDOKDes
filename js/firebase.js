import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

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
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDQUvjOMujFz6YbwaIC048D1wtq4anHkV0",

    authDomain:
        "sivedokdes.firebaseapp.com",

    projectId:
        "sivedokdes",

    storageBucket:
        "sivedokdes.firebasestorage.app",

    messagingSenderId:
        "505099689462",

    appId:
        "1:505099689462:web:086a511ee30169a3da7bd7"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


// =====================================================
// FIRESTORE
// =====================================================

const db =
    getFirestore(app);


// =====================================================
// STORAGE
// =====================================================

const storage =
    getStorage(app);


// =====================================================
// EXPORT
// =====================================================

export {

    // Firestore
    db,
    doc,
    setDoc,
    getDoc,
    getDocs,
    collection,
    query,
    orderBy,
    limit,
    serverTimestamp,
    runTransaction,

    // Storage
    storage,
    ref,
    uploadBytes,
    getDownloadURL

};
