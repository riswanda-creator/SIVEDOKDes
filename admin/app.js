import {
    db,
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    runTransaction
} from "../js/firebase.js";

const tombol = document.getElementById("registrasi");
const hasil = document.getElementById("hasil");

tombol.addEventListener("click", async () => {

    try {
const nomorSurat = document.getElementById("nomorSurat").value.trim();
const jenis = document.getElementById("jenis").value;
const tanggalTerbit = document.getElementById("tanggal").value;
const penandatangan = document.getElementById("penandatangan").value.trim();
const jabatan = document.getElementById("jabatan").value.trim();

if (!nomorSurat || !tanggalTerbit || !penandatangan || !jabatan) {

    alert("Semua data wajib diisi.");

    return;

}
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
        await setDoc(doc(db, "dokumen", documentId), {

    id: documentId,

    nomorSurat: nomorSurat,

    jenis: jenis,

    tahun: Number(tahun),

    status: "VALID",

    penandatangan: penandatangan,

    jabatan: jabatan,

    tanggalTerbit: tanggalTerbit,

    dibuatPada: serverTimestamp(),

    dibuatOleh: "admin",

    aktif: true,

    qrVersion: 1

});

        hasil.textContent = documentId;

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
