import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";

const tombol = document.getElementById("generate");
const hasil = document.getElementById("hasil");

async function getNomorTerakhir() {

    const q = query(
        collection(db, "dokumen"),
        orderBy("nomorUrut", "desc"),
        limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        return 1;
    }

    return snapshot.docs[0].data().nomorUrut + 1;
}

tombol.addEventListener("click", async () => {

    try {

        const jenis = document.getElementById("jenis").value;
        const tahun = document.getElementById("tahun").value;

        const nomor = await getNomorTerakhir();

        const id =
            `GT-${tahun}-${jenis}-${String(nomor).padStart(6,"0")}`;

        hasil.textContent = id;

    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
