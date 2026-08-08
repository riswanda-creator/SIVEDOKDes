import {
    db,
    doc,
    getDoc
} from "./firebase.js";

import {
    DESA
} from "./config.js";


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


// =====================================================
// PDF ELEMENT
// =====================================================

const pdfContainer =
    document.getElementById("pdfContainer");

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


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

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


    if (!statusBadge) {

        return;

    }


    statusBadge.className =
        "status-badge";


    if (
        status === "VALID"
    ) {

        statusBadge.textContent =
            "DOKUMEN TERVERIFIKASI";

        statusBadge.classList.add(
            "valid"
        );

        return;

    }


    if (
        status === "DICABUT"
    ) {

        statusBadge.textContent =
            "DOKUMEN DICABUT";

        statusBadge.classList.add(
            "danger"
        );

        return;

    }


    if (
        status === "DIBATALKAN"
    ) {

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
// TAMPILKAN PDF
// =====================================================

function tampilkanPDF(data) {

    // =============================================
    // RESET
    // =============================================

    if (pdfContainer) {

        pdfContainer.hidden =
            true;

    }


    if (pdfLink) {

        pdfLink.hidden =
            true;

        pdfLink.removeAttribute(
            "href"
        );

    }


    // =============================================
    // AMBIL PDF URL
    // =============================================

    const pdfURL =
        data.pdfURL;


    console.log(
        "PDF URL:",
        pdfURL
    );


    // =============================================
    // TIDAK ADA PDF
    // =============================================

    if (
        !pdfURL ||
        typeof pdfURL !== "string"
    ) {

        console.log(
            "Dokumen belum memiliki PDF."
        );

        return;

    }


    // =============================================
    // ELEMENT PDF TIDAK DITEMUKAN
    // =============================================

    if (
        !pdfContainer ||
        !pdfLink
    ) {

        console.error(
            "Element PDF tidak ditemukan di verify.html."
        );

        return;

    }


    // =============================================
    // PASANG URL PDF
    // =============================================

    pdfLink.href =
        pdfURL;

    pdfLink.target =
        "_blank";

    pdfLink.rel =
        "noopener noreferrer";


    // =============================================
    // TAMPILKAN LINK
    // =============================================

    pdfLink.hidden =
        false;

    pdfLink.style.display =
        "inline-block";


    // =============================================
    // TAMPILKAN CONTAINER
    // =============================================

    pdfContainer.hidden =
        false;

    pdfContainer.style.display =
        "block";


    console.log(
        "Tombol PDF berhasil ditampilkan."
    );

}


// =====================================================
// CEK DOKUMEN
// =====================================================

async function cekDokumen() {

    try {

        // =============================================
        // VALIDASI DOCUMENT ID
        // =============================================

        if (!id) {

            if (loading) {

                loading.hidden =
                    true;

            }


            if (hasil) {

                hasil.hidden =
                    true;

            }


            if (error) {

                error.hidden =
                    false;

            }


            if (errorMessage) {

                errorMessage.textContent =
                    "Document ID tidak ditemukan.";

            }


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
        // DOKUMEN TIDAK DITEMUKAN
        // =============================================

        if (!snap.exists()) {

            if (loading) {

                loading.hidden =
                    true;

            }


            if (hasil) {

                hasil.hidden =
                    true;

            }


            if (error) {

                error.hidden =
                    false;

            }


            if (errorMessage) {

                errorMessage.textContent =
                    "Dokumen dengan Document ID tersebut tidak terdaftar.";

            }


            return;

        }


        // =============================================
        // DATA DOKUMEN
        // =============================================

        const data =
            snap.data();


        console.log(
            "Data dokumen:",
            data
        );


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
        // DETAIL DOKUMEN
        // =============================================

        if (documentIdElement) {

            documentIdElement.textContent =
                data.id || id;

        }


        if (nomorSurat) {

            nomorSurat.textContent =
                data.nomorSurat || "-";

        }


        if (jenisDokumen) {

            jenisDokumen.textContent =
                jenis;

        }


        if (indeks) {

            indeks.textContent =
                data.indeks || "-";

        }


        if (penandatangan) {

            penandatangan.textContent =
                data.penandatangan || "-";

        }


        if (jabatan) {

            jabatan.textContent =
                data.jabatan || "-";

        }


        if (tanggalTerbit) {

            tanggalTerbit.textContent =
                formatTanggal(
                    data.tanggalTerbit
                );

        }


        // =============================================
        // PDF
        // =============================================

        tampilkanPDF(
            data
        );


        // =============================================
        // INFO DOKUMEN
        // =============================================

        const info =
            document.getElementById(
                "infoDokumen"
            );


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

        if (loading) {

            loading.hidden =
                true;

        }


        if (error) {

            error.hidden =
                true;

        }


        if (hasil) {

            hasil.hidden =
                false;

        }

    }

    catch (err) {

        console.error(
            "Gagal memverifikasi dokumen:",
            err
        );


        if (loading) {

            loading.hidden =
                true;

        }


        if (hasil) {

            hasil.hidden =
                true;

        }


        if (error) {

            error.hidden =
                false;

        }


        if (errorMessage) {

            errorMessage.textContent =
                "Gagal menghubungi server. Silakan coba kembali.";

        }

    }

}


// =====================================================
// JALANKAN
// =====================================================

cekDokumen();
