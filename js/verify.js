import {
    db,
    doc,
    getDoc
} from "./firebase.js";

const status = document.getElementById("status");
const detail = document.getElementById("detail");

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cekDokumen() {

    if (!id) {

        status.textContent = "❌ Document ID tidak ditemukan";
        return;

    }

    try {

        const ref = doc(db, "dokumen", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {

            status.textContent = "❌ DOKUMEN TIDAK TERDAFTAR";
            detail.innerHTML = "";
            return;

        }

        const data = snap.data();

        // Nama jenis dokumen
        const namaJenis = {
            DOMISILI: "Surat Keterangan Domisili",
            SKU: "Surat Keterangan Usaha",
            SKTM: "Surat Keterangan Tidak Mampu",
            APBDES: "APBDes"
        };

        const jenisTampil = namaJenis[data.jenis] || data.jenis;

        // Format tanggal Indonesia
        const tanggalIndonesia = new Date(data.tanggalTerbit)
            .toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                year: "numeric"
            });

        status.textContent = "🟢 DOKUMEN TERVERIFIKASI";

        detail.innerHTML = `
            <table>

                <tr>
                    <td><b>Document ID</b></td>
                    <td>${data.id}</td>
                </tr>

                <tr>
                    <td><b>Nomor Surat</b></td>
                    <td>${data.nomorSurat}</td>
                </tr>

                <tr>
                    <td><b>Jenis Dokumen</b></td>
                    <td>${jenisTampil}</td>
                </tr>

                <tr>
                    <td><b>Status</b></td>
                    <td style="color:green;font-weight:bold;">
                        ${data.status}
                    </td>
                </tr>

                <tr>
                    <td><b>Penandatangan</b></td>
                    <td>${data.penandatangan}</td>
                </tr>

                <tr>
                    <td><b>Jabatan</b></td>
                    <td>${data.jabatan}</td>
                </tr>

                <tr>
                    <td><b>Tanggal Terbit</b></td>
                    <td>${tanggalIndonesia}</td>
                </tr>

            </table>

            <br>

           <div class="info">

    Dokumen ini telah berhasil diverifikasi melalui
    <strong>SIVEDOKDes (Sistem Verifikasi Dokumen Elektronik Desa)</strong>.

    <br><br>

    Apabila terdapat perbedaan informasi antara halaman ini
    dengan dokumen fisik yang diterima, maka dokumen tersebut
    perlu dikonfirmasi kepada Pemerintah Desa Guntung.

</div>

    } catch (err) {

        console.error(err);

        status.textContent = "⚠️ Gagal menghubungi server.";
        detail.innerHTML = "";

    }

}

cekDokumen();
