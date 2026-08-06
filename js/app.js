import {
    db,
    collection,
    getDocs
} from "./firebase.js";

const tombol = document.getElementById("test");
const hasil = document.getElementById("hasil");

tombol.onclick = async () => {

    try {

        const snapshot = await getDocs(collection(db, "dokumen"));

        hasil.innerHTML =
            "Firebase terhubung. Jumlah dokumen: " +
            snapshot.size;

    } catch (err) {

        console.error(err);

        hasil.innerHTML =
            "Gagal terhubung ke Firebase.";

    }

};
