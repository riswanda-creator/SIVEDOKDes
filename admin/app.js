import {
    db,
    doc,
    getDoc,
    runTransaction
} from "../js/firebase.js";

const tombol = document.getElementById("registrasi");
const hasil = document.getElementById("hasil");

tombol.addEventListener("click", async () => {

    try {

        const tahun = new Date().getFullYear().toString();

        const counterRef = doc(db, "counter", tahun);

        const documentId = await runTransaction(db, async (transaction) => {

            const snap = await transaction.get(counterRef);

            if (!snap.exists()) {

                throw new Error("Counter tahun belum tersedia.");

            }

            const data = snap.data();

            const nomorBaru = data.lastNumber + 1;

            transaction.update(counterRef, {

                lastNumber: nomorBaru

            });

            const tahunPendek = tahun.slice(-2);

            return `${data.prefix}-${tahunPendek}-${String(nomorBaru).padStart(4, "0")}`;

        });

        hasil.textContent = documentId;

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
