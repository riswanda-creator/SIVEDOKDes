import {
    db,
    doc,
    getDoc
} from "./firebase.js";

import { DESA } from "./config.js";


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

const penandatangan =
    document.getElementById("penandatangan");

const jabatan =
    document.getElementById("jabatan");

const tanggalTerbit =
    document.getElementById("tanggalTerbit");

const pdfLink =
    document.getElementById("pdfLink");


// =====================================================
// DOCUMENT ID
// =====================================================

const params =
    new URLSearchParams(
        window.location.search
    );

const id =
    params.get("id");


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
// STATUS
// =====================================================

function tampilkanStatus(statusDokumen) {

    const status =
        String(
            statusDokumen || ""
        ).toUpperCase();


    statusBadge.className =
        "status-badge";


    if (status === "VALID") {

        statusBadge.textContent =
            "DOKUMEN TERVERIFIKASI";

        statusBadge.classList.add(
            "valid"
        );

        return;

    }


    if (status === "DICABUT") {

        statusBadge.textContent =
            "DOKUMEN DICABUT";

        statusBadge.classList.add(
            "danger"
        );

        return;

    }


    if (status === "DIBATALKAN") {

        statusBadge.textContent =
            "DOKUMEN DIBATALKAN";

        statusBadge.classList.add(
            "danger"
        );

        return;

    }


    statusBadge.textContent =
        "STATUS DOKUMEN TIDAK DIKENALI";

    statusBadge.classList.add(
        "warning"
    );

}


// =====================================================
// CEK DOKUMEN
// =====================================================

async function cekDokumen() {

    try {

        // =============================================
        // VALIDASI ID
        // =============================================

        if (!id) {

            loading.hidden = true;

            hasil.hidden = true;

            error.hidden = false;

            errorMessage.textContent =
                "Document ID tidak ditemukan.";

            return;

        }


        // =============================================
        // AMBIL DATA FIRESTORE
        // =============================================

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


        // =============================================
        // DOKUMEN TIDAK ADA
        // =============================================

        if (!snap.exists()) {

            loading.hidden = true;

            hasil.hidden = true;

            error.hidden = false;

            errorMessage.textContent =
                "Dokumen dengan Document ID tersebut tidak terdaftar.";

            return;

        }


        // =============================================
        // DATA
        // =============================================

        const data =
            snap.data();


        // =============================================
        // STATUS
        // =============================================

        tampilkanStatus(
            data.status
        );


        // =============================================
        // JENIS DOKUMEN
        // =============================================

        const jenis =
            namaJenis[data.jenis]
            || data.namaJenis
            || data.jenis
            || "-";


        // =============================================
        // ISI DETAIL
        // =============================================

        documentIdElement.textContent =
            data.id || id;


        nomorSurat.textContent =
            data.nomorSurat || "-";


        jenisDokumen.textContent =
            jenis;


        indeks.textContent =
            data.indeks || "-";


        penandatangan.textContent =
            data.penandatangan || "-";


        jabatan.textContent =
            data.jabatan || "-";


        tanggalTerbit.textContent =
            formatTanggal(
                data.tanggalTerbit
            );


        // =============================================
        // PDF
        // =============================================

        if (
            data.pdfURL &&
            typeof data.pdfURL === "string"
        ) {

            pdfLink.href =
                data.pdfURL;

            pdfLink.target =
                "_blank";

            pdfLink.rel =
                "noopener noreferrer";

            pdfLink.hidden =
                false;

        }

        else {

            pdfLink.hidden =
                true;

        }


        // =============================================
        // INFO
        // =============================================

        const info =
            document.getElementById("infoDokumen");


        if (info) {

            info.innerHTML = `

                Dokumen ini telah berhasil
                diverifikasi melalui

                <strong>
                    ${escapeHTML(
                        DESA.namaSistem
                    )}
                </strong>

                (${escapeHTML(
                    DESA.kepanjanganSistem
                )}).

                <br><br>

                Dokumen diterbitkan oleh
                <strong>
                    ${escapeHTML(
                        DESA.nama
                    )}
                </strong>,

                Kecamatan
                ${escapeHTML(
                    DESA.kecamatan
                )},

                Kabupaten
                ${escapeHTML(
                    DESA.kabupaten
                )}.

                <br><br>

                Apabila terdapat perbedaan
                informasi antara halaman ini
                dengan dokumen fisik yang diterima,
                maka dokumen tersebut perlu
                dikonfirmasi kepada
                ${escapeHTML(
                    DESA.nama
                )}.

            `;

        }


        // =============================================
        // TAMPILKAN HASIL
        // =============================================

        loading.hidden = true;

        error.hidden = true;

        hasil.hidden = false;


    }

    catch (err) {

        console.error(
            "Gagal memverifikasi dokumen:",
            err
        );


        loading.hidden = true;

        hasil.hidden = true;

        error.hidden = false;


        errorMessage.textContent =
            "Gagal menghubungi server. Silakan coba kembali.";

    }

}


// =====================================================
// JALANKAN
// =====================================================

cekDokumen();
