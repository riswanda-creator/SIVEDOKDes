import {
    db,
    doc,
    setDoc,
    serverTimestamp,
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

await setDoc(doc(db, "dokumen", id), {

    id: id,

    nomorUrut: nomor,

    jenis: jenis,

    tahun: Number(tahun),

    status: "VALID",

    penandatangan: "IDRIS",

    jabatan: "Kepala Desa Guntung",

    dibuatPada: serverTimestamp(),

    aktif: true,

    versi: 1

});

hasil.textContent = id;
    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});
