const tombol = document.getElementById("registrasi");
const hasil = document.getElementById("hasil");

let nomor = 1;

tombol.addEventListener("click", () => {

    const tahun = new Date().getFullYear();

    const documentId =
        `1219062002-${tahun}-${String(nomor).padStart(6,"0")}`;

    hasil.textContent = documentId;

    nomor++;

});
