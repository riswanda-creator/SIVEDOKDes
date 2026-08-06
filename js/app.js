import {
    db,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "./firebase.js";

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

document.getElementById("generate").onclick = async function () {

    const jenis = document.getElementById("jenis").value;

    const tahun = document.getElementById("tahun").value;

    const nomor = await getNomorTerakhir();

    const id =
        "GT-" +
        tahun +
        "-" +
        jenis +
        "-" +
        String(nomor).padStart(6, "0");

    hasil.innerHTML = id;

};
