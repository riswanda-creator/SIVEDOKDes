import {
    db,
    doc,
    getDoc
} from "./firebase.js";


// =====================================================
// ELEMENT
// =====================================================

const loading =
    document.getElementById("loading");

const hasil =
    document.getElementById("hasil");

const error =
    document.getElementById("error");

const errorMessage =
    document.getElementById("errorMessage");

const statusBadge =
    document.getElementById("statusBadge");

const documentIdElement =
    document.getElementById("documentId");

const nomorSurat =
    document.getElementById("nomorSurat");

const jenisDokumen =
    document.getElementById("jenisDokumen");

const indeks =
    document.getElementById("indeks");

const tanggalTerbit =
    document.getElementById("tanggalTerbit");

const penandatangan =
    document.getElementById("penandatangan");

const jabatan =
    document.getElementById("jabatan");

const pdfContainer =
    document.getElementById("pdfContainer");

const pdfLink =
    document.getElementById("pdfLink");


// =====================================================
// DOCUMENT ID DARI URL
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const id =
    params.get("id");


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(tanggal) {

    if (!tanggal) {
        return "-";
    }

    const date =
        new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
        return tanggal;
    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


// =====================================================
// NAMA JENIS DOKUMEN
// =====================================================

const namaJenis = {

    DOMISILI:
        "Surat Keterangan Domisili",

    MENIKAH:
        "Surat Keterangan Menikah",

    PINDAH:
        "Surat Keterangan Pindah",

    SKU:
        "Surat Keterangan Usaha",

    SKTM:
        "Surat Keterangan Tidak Mampu",

    PENGHASILAN:
        "Surat Keterangan Penghasilan",

    UNDANGAN:
        "Surat Undangan",

    APBDES:
        "APBDes",

    MANUAL:
        "Lainnya / Manual"

};


// =====================================================
// CEK DOKUMEN
// =====================================================

async function cekDokumen() {

    // ================================================
    // VALIDASI ID
    // ================================================

    if (!id) {

        loading.hidden = true;

        errorMessage.textContent =
            "Document ID tidak ditemukan pada alamat verifikasi.";

        error.hidden = false;

        return;
    }


    try {

        // ============================================
        // AMBIL DOKUMEN FIRESTORE
        // ============================================

        const documentRef =
            doc(
                db,
                "dokumen",
                id
            );


        const snap =
            await getDoc(
                documentRef
            );


        // ============================================
        // DOKUMEN TIDAK ADA
        // ============================================

        if (!snap.exists()) {

            loading.hidden = true;

            errorMessage.textContent =
                `Document ID ${id} tidak terdaftar dalam sistem SIVEDOKDes.`;

            error.hidden = false;

            return;
        }


        // ============================================
        // DATA
        // ============================================

        const data =
            snap.data();


        const documentId =
            data.id || id;


        const statusDokumen =
            String(
                data.status || ""
            ).toUpperCase();


        const jenis =
            data.namaJenis
            ||
            namaJenis[data.jenis]
            ||
            data.jenis
            ||
            "-";


        // ============================================
        // STATUS
        // ============================================

        statusBadge.className =
            "status-badge";


        if (
            statusDokumen ===
            "VALID"
        ) {

            statusBadge.textContent =
                "DOKUMEN VALID";

            statusBadge.classList.add(
                "status-valid"
            );

        }

        else if (
            statusDokumen ===
            "DICABUT"
        ) {

            statusBadge.textContent =
                "DOKUMEN DICABUT";

            statusBadge.classList.add(
                "status-dicabut"
            );

        }

        else if (
            statusDokumen ===
            "DIBATALKAN"
        ) {

            statusBadge.textContent =
                "DOKUMEN DIBATALKAN";

            statusBadge.classList.add(
                "status-dibatalkan"
            );

        }

        else {

            statusBadge.textContent =
                statusDokumen
                || "STATUS TIDAK DIKETAHUI";

            statusBadge.classList.add(
                "status-lain"
            );

        }


        // ============================================
        // ISI DATA
        // ============================================

        documentIdElement.textContent =
            documentId;

        nomorSurat.textContent =
            data.nomorSurat || "-";

        jenisDokumen.textContent =
            jenis;

        indeks.textContent =
            data.indeks || "-";

        tanggalTerbit.textContent =
            formatTanggal(
                data.tanggalTerbit
            );

        penandatangan.textContent =
            data.penandatangan || "-";

        jabatan.textContent =
            data.jabatan || "-";


        // ============================================
        // PDF
        // ============================================

        const pdfURL =
            data.pdfURL;


        if (
            pdfURL
            &&
            typeof pdfURL === "string"
        ) {

            pdfLink.href =
                pdfURL;

            pdfContainer.hidden =
                false;

        }

        else {

            pdfContainer.hidden =
                true;

        }


        // ============================================
        // TAMPILKAN HASIL
        // ============================================

        loading.hidden =
            true;

        hasil.hidden =
            false;


    }

    catch (err) {

        console.error(
            "Verifikasi dokumen gagal:",
            err
        );


        loading.hidden =
            true;


        errorMessage.textContent =
            "Terjadi kesalahan saat menghubungi sistem verifikasi. Silakan coba kembali.";


        error.hidden =
            false;

    }

}


// =====================================================
// JALANKAN
// =====================================================

cekDokumen();
