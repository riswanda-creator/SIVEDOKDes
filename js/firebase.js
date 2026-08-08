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
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


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
// SUPABASE
// =====================================================

// GANTI DUA NILAI DI BAWAH INI
// dengan Project URL dan Publishable Key
// dari Supabase kamu.

const SUPABASE_URL =
    "https://PROJECT-ID-KAMU.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "PUBLISHABLE-KEY-KAMU";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// SUPABASE STORAGE
// =====================================================

const SUPABASE_BUCKET =
    "sivedokdes-pdf";


// =====================================================
// EXPORT
// =====================================================

export {

    // =========================================
    // FIRESTORE
    // =========================================

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


    // =========================================
    // SUPABASE
    // =========================================

    supabase,

    SUPABASE_BUCKET

};
