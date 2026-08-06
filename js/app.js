const hasil = document.getElementById("hasil");

document.getElementById("generate").onclick = function () {

    const jenis = document.getElementById("jenis").value;

    const tahun = document.getElementById("tahun").value;

    const nomor = "000001";

    const id = `GT-${tahun}-${jenis}-${nomor}`;

    hasil.innerHTML = id;

};
