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
// SIGNED URL SUPABASE
// =====================================================

async function buatSignedURL(
    storagePath
) {

    if (!storagePath) {

        return null;

    }

    console.log(
        "Membuat Signed URL:",
        storagePath
    );

    const {
        data,
        error: signedError
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

    if (signedError) {

        console.error(
            "Supabase Signed URL Error:",
            signedError
        );

        throw signedError;

    }

    if (
        !data ||
        !data.signedUrl
    ) {

        throw new Error(
            "Supabase tidak mengembalikan URL PDF."
        );

    }

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
            "Dokumen belum memiliki PDF."
        );

        return;

    }

    // =============================================
    // BUAT SIGNED URL
    // =============================================

    const pdfURL =
        await buatSignedURL(
            storagePath
        );

    console.log(
        "PDF Signed URL berhasil dibuat."
    );

    // =============================================
    // ELEMENT
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
        pdfURL;

    pdfLink.target =
        "_blank";

    pdfLink.rel =
        "noopener noreferrer";

    // =============================================
    // TAMPILKAN
    // =============================================

    pdfLink.hidden =
        false;

    pdfLink.style.display =
        "inline-block";

    pdfContainer.hidden =
        false;

    pdfContainer.style.display =
        "block";

}

// =====================================================
// TIMEOUT HELPER
// =====================================================

function denganTimeout(
    promise,
    waktu = 15000
) {

    return Promise.race([

        promise,

        new Promise(
            (
                _,
                reject
            ) => {

                setTimeout(
                    () => {

                        reject(
                            new Error(
                                "Koneksi ke server terlalu lama. Silakan coba kembali."
                            )
                        );

                    },
                    waktu
                );

            }
        )

    ]);

}

// =====================================================
// TAMPILKAN ERROR
// =====================================================

function tampilkanError(
    pesan
) {

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
// CEK DOKUMEN
// =====================================================

async function cekDokumen() {

    try {

        console.log(
            "===================================="
        );

        console.log(
            "VERIFIKASI DOCUMENT ID:",
            id
        );

        console.log(
            "===================================="
        );

        // =============================================
        // VALIDASI ID
        // =============================================

        if (!id) {

            tampilkanError(
                "Document ID tidak ditemukan."
            );

            return;

        }

        // =============================================
        // LOADING
        // =============================================

        if (loading) {

            loading.hidden =
                false;

        }

        if (hasil) {

            hasil.hidden =
                true;

        }

        if (error) {

            error.hidden =
                true;

        }

        // =============================================
        // FIRESTORE
        // =============================================

        console.log(
            "Mengambil dokumen dari Firestore..."
        );

        const documentRef =
            doc(
                db,
                "dokumen",
                id
            );

        const snap =
            await denganTimeout(
                getDoc(
                    documentRef
                ),
                15000
            );

        console.log(
            "Firestore selesai."
        );

        // =============================================
        // DOKUMEN TIDAK DITEMUKAN
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
        // JENIS
        // =============================================

        const jenis =
            namaJenis[
                data.jenis
            ]
            ||
            data.namaJenis
            ||
            data.jenis
            ||
            "-";

        // =============================================
        // DOCUMENT ID
        // =============================================

        if (documentIdElement) {

            documentIdElement.textContent =
                data.id ||
                id;

        }

        // =============================================
        // NOMOR SURAT
        // =============================================

        if (nomorSurat) {

            nomorSurat.textContent =
                data.nomorSurat ||
                "-";

        }

        // =============================================
        // JENIS DOKUMEN
        // =============================================

        if (jenisDokumen) {

            jenisDokumen.textContent =
                jenis;

        }

        // =============================================
        // INDEKS
        // =============================================

        if (indeks) {

            indeks.textContent =
                data.indeks ||
                "-";

        }

        // =============================================
        // PENANDATANGAN
        // =============================================

        if (penandatangan) {

            penandatangan.textContent =
                data.penandatangan ||
                "-";

        }

        // =============================================
        // JABATAN
        // =============================================

        if (jabatan) {

            jabatan.textContent =
                data.jabatan ||
                "-";

        }

        // =============================================
        // TANGGAL
        // =============================================

        if (tanggalTerbit) {

            tanggalTerbit.textContent =
                formatTanggal(
                    data.tanggalTerbit
                );

        }

        // =============================================
        // PDF SUPABASE
        // =============================================

        try {

            await tampilkanPDF(
                data
            );

        }

        catch (pdfError) {

            console.error(
                "PDF gagal dimuat:",
                pdfError
            );

            // PDF gagal tidak membuat
            // verifikasi dokumen gagal.
            // Data dokumen tetap ditampilkan.

        }

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

        console.log(
            "VERIFIKASI BERHASIL."
        );

    }

    catch (err) {

        console.error(
            "Gagal memverifikasi dokumen:",
            err
        );

        tampilkanError(
            err.message
            ||
            "Gagal menghubungi server. Silakan coba kembali."
        );

    }

}

// =====================================================
// JALANKAN
// =====================================================

cekDokumen();
