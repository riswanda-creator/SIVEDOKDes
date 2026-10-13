// =====================================================
// FIREBASE FIRESTORE
// =====================================================

import {
    db,
    doc,
    getDoc
} from "./firebase.js";

// =====================================================
// SUPABASE
// =====================================================

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// =====================================================
// CONFIG
// =====================================================

import {
    DESA
} from "./config.js";

// =====================================================
// SUPABASE CONFIG
// =====================================================

const SUPABASE_URL =
    "https://ittfhjzkejhsbowwqlrq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_javi5F477-dw8o3LD4YjHg_QejbW_cz";

const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// =====================================================
// SUPABASE STORAGE
// =====================================================

const STORAGE_BUCKET =
    "sivedokdes-pdf";

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

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

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
            day:
                "2-digit",

            month:
                "long",

            year:
                "numeric"
        }
    );

}

// =====================================================
// STATUS
// =====================================================

function tampilkanStatus(
    statusDokumen
) {

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
        status ===
        "VALID"
    ) {

        statusBadge.textContent =
            "DOKUMEN TERVERIFIKASI";

        statusBadge.classList.add(
            "valid"
        );

        return;

    }

    if (
        status ===
        "DICABUT"
    ) {

        statusBadge.textContent =
            "DOKUMEN DICABUT";

        statusBadge.classList.add(
            "danger"
        );

        return;

    }

    if (
        status ===
        "DIBATALKAN"
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
// BUAT SIGNED URL PDF
// =====================================================

async function buatSignedURL(
    storagePath
) {

    if (!storagePath) {

        return null;

    }

    console.log(
        "Membuat Signed URL untuk:",
        storagePath
    );

    const {
        data,
        error
    } =
        await supabase
            .storage
            .from(
                STORAGE_BUCKET
            )
            .createSignedUrl(
                storagePath,
                3600
            );

    if (error) {

        console.error(
            "Supabase Signed URL Error:",
            error
        );

        throw new Error(
            "PDF ditemukan, tetapi link PDF gagal dibuat dari Supabase Storage."
        );

    }

    if (
        !data ||
        !data.signedUrl
    ) {

        throw new Error(
            "Supabase tidak mengembalikan link PDF."
        );

    }

    console.log(
        "Signed URL berhasil dibuat."
    );

    return data.signedUrl;

}

// =====================================================
// TAMPILKAN PDF
// =====================================================

async function tampilkanPDF(
    data
) {

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
    // STORAGE PATH
    // =============================================

    const storagePath =
        data.pdfStoragePath;

    console.log(
        "PDF Storage Path:",
        storagePath
    );

    // =============================================
    // TIDAK ADA PDF
    // =============================================

    if (
        !storagePath
    ) {

        console.log(
            "Dokumen belum memiliki PDF final."
        );

        return;

    }

    // =============================================
    // BUAT SIGNED URL BARU
    // =============================================

    const signedURL =
        await buatSignedURL(
            storagePath
        );

    // =============================================
    // ELEMENT TIDAK ADA
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
    // PASANG URL
    // =============================================

    pdfLink.href =
        signedURL;

    pdfLink.target =
        "_blank";

    pdfLink.rel =
        "noopener noreferrer";

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
        "PDF final berhasil ditampilkan."
    );

}

// =====================================================
// TAMPILKAN ERROR
// =====================================================

function tampilkanError(
    pesan
) {

    console.error(
        "VERIFIKASI ERROR:",
        pesan
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
            pesan;

    }

}

// =====================================================
// TIMEOUT
// =====================================================

function timeoutPromise(
    promise,
    milliseconds
) {

    const timeout =
        new Promise(
            (_, reject) => {

                setTimeout(
                    () => {

                        reject(
                            new Error(
                                "Waktu pemeriksaan habis. Server tidak memberikan respons."
                            )
                        );

                    },
                    milliseconds
                );

            }
        );

    return Promise.race(
        [
            promise,
            timeout
        ]
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

            tampilkanError(
                "Document ID tidak ditemukan pada URL."
            );

            return;

        }

        console.log(
            "Memeriksa Document ID:",
            id
        );

        // =============================================
        // FIRESTORE
        // =============================================

        const documentRef =
            doc(
                db,
                "dokumen",
                id
            );

        const snap =
            await timeoutPromise(
                getDoc(
                    documentRef
                ),
                15000
            );

        // =============================================
        // DOKUMEN TIDAK ADA
        // =============================================

        if (!snap.exists()) {

            tampilkanError(
                "Dokumen dengan Document ID tersebut tidak terdaftar."
            );

            return;

        }

        // =============================================
        // DATA
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
            ||
            data.namaJenis
            ||
            data.jenis
            ||
            "-";

        // =============================================
        // DETAIL DOKUMEN
        // =============================================

        if (documentIdElement) {

            documentIdElement.textContent =
                data.id ||
                id;

        }

        if (nomorSurat) {

            nomorSurat.textContent =
                data.nomorSurat ||
                "-";

        }

        if (jenisDokumen) {

            jenisDokumen.textContent =
                jenis;

        }

        if (indeks) {

            indeks.textContent =
                data.indeks ||
                "-";

        }

        if (penandatangan) {

            penandatangan.textContent =
                data.penandatangan ||
                "-";

        }

        if (jabatan) {

            jabatan.textContent =
                data.jabatan ||
                "-";

        }

        if (tanggalTerbit) {

            tanggalTerbit.textContent =
                formatTanggal(
                    data.tanggalTerbit
                );

        }

        // =============================================
        // PDF FINAL DARI SUPABASE
        // =============================================

        await tampilkanPDF(
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
        // SELESAI
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

        console.log(
            "VERIFIKASI SELESAI."
        );

    }

    catch (err) {

        console.error(
            "Gagal memverifikasi dokumen:",
            err
        );

        let pesan =
            "Gagal memverifikasi dokumen.";

        if (
            err &&
            err.message
        ) {

            pesan =
                err.message;

        }

        tampilkanError(
            pesan
        );

    }

}

// =====================================================
// JALANKAN
// =====================================================

cekDokumen();
