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
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import {
    getStorage
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";


const firebaseConfig = {

    apiKey: "AIzaSyDQUvjOMujFz6YbwaIC048D1wtq4anHkV0",

    authDomain: "sivedokdes.firebaseapp.com",

    projectId: "sivedokdes",

    storageBucket: "sivedokdes.firebasestorage.app",

    messagingSenderId: "505099689462",

    appId: "1:505099689462:web:086a511ee30169a3da7bd7"

};


const app =
    initializeApp(firebaseConfig);


const db =
    getFirestore(app);


const storage =
    getStorage(app);


export {

    db,

    storage,

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

};
