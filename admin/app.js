// =====================================================
// FIREBASE FIRESTORE
// =====================================================

import {
    db,
    doc,
    setDoc,
    getDocs,
    collection,
    serverTimestamp,
    runTransaction
} from "../js/firebase.js";


// =====================================================
// SUPABASE
// =====================================================

import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


// =====================================================
// PDF LIBRARY
// =====================================================

import {
    PDFDocument,
    rgb
} from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";


// =====================================================
// QR LIBRARY
// =====================================================

import QRCode from "https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm";


// =====================================================
// PDF TEXT LIBRARY
// =====================================================

import * as pdfjsLib from
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/+esm";


// =====================================================
// PDF.JS WORKER
// =====================================================

if (
    pdfjsLib.GlobalWorkerOptions
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

}


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
// URL VERIFIKASI
// =====================================================

const VERIFY_URL =
    "https://sivedok-des-1.vercel.app/verify.html";


// =====================================================
// ELEMENT REGISTRASI
// =====================================================

const tombol =
    document.getElementById(
        "registrasi"
    );


const hasil =
    document.getElementById(
        "hasil"
    );


const jenis =
    document.getElementById(
        "jenis"
    );


const indeks =
    document.getElementById(
        "indeks"
    );


const nomorUrut =
    document.getElementById(
        "nomorUrut"
    );


const bulan =
    document.getElementById(
        "bulan"
    );


const tahun =
    document.getElementById(
        "tahun"
    );


const nomorSurat =
    document.getElementById(
        "nomorSurat"
    );


const tanggal =
    document.getElementById(
        "tanggal"
    );


const penandatangan =
    document.getElementById(
        "penandatangan"
    );


const jabatan =
    document.getElementById(
        "jabatan"
    );


const petunjukIndeks =
    document.getElementById(
        "petunjukIndeks"
    );


// =====================================================
// STATISTIK
// =====================================================

const totalDokumen =
    document.getElementById(
        "totalDokumen"
    );


const dokumenValid =
    document.getElementById(
        "dokumenValid"
    );


const dokumenDicabut =
    document.getElementById(
        "dokumenDicabut"
    );


const dokumenDibatalkan =
    document.getElementById(
        "dokumenDibatalkan"
    );


const daftarDokumen =
    document.getElementById(
        "daftarDokumen"
    );


// =====================================================
// UPLOAD
// =====================================================

const filePDF =
    document.getElementById(
        "filePDF"
    );


const uploadPDF =
    document.getElementById(
        "uploadPDF"
    );


const statusUpload =
    document.getElementById(
        "statusUpload"
    );


const uploadDocumentId =
    document.getElementById(
        "uploadDocumentId"
    );


const hasilUpload =
    document.getElementById(
        "hasilUpload"
    );


const linkPDF =
    document.getElementById(
        "linkPDF"
    );


// =====================================================
// QR MODE
// =====================================================
//
// Jika nanti admin/index.html mempunyai:
//
// id="qrMode"
// id="qrX"
// id="qrY"
//
// maka mode MANUAL dapat digunakan.
//
// Jika belum ada, otomatis memakai AUTO.
//

const qrModeElement =
    document.getElementById(
        "qrMode"
    );


const qrXElement =
    document.getElementById(
        "qrX"
    );


const qrYElement =
    document.getElementById(
        "qrY"
    );


// =====================================================
// KONSTANTA
// =====================================================

const KODE_DESA =
    "GT";


const QR_MODE_AUTO =
    "AUTO";


const QR_MODE_MANUAL =
    "MANUAL";


const QR_SIZE =
    72;


const QR_LABEL_SIZE =
    7;


const QR_MARGIN =
    20;


const MAX_PDF_SIZE =
    20 * 1024 * 1024;


let documentIdAktif =
    null;


// =====================================================
// BULAN ROMAWI
// =====================================================

const bulanRomawi = {

    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX",
    10: "X",
    11: "XI",
    12: "XII"

};


// =====================================================
// NAMA JENIS
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

    MANUAL:
        "Lainnya / Manual"

};


// =====================================================
// TAHUN
// =====================================================

function isiPilihanTahun() {

    if (!tahun) {

        return;

    }


    const tahunSekarang =
        new Date()
            .getFullYear();


    tahun.innerHTML =
        "";


    for (
        let i =
            tahunSekarang - 1;

        i <=
        tahunSekarang + 1;

        i++
    ) {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            i;


        option.textContent =
            i;


        if (
            i ===
            tahunSekarang
        ) {

            option.selected =
                true;

        }


        tahun.appendChild(
            option
        );

    }

}


// =====================================================
// DEFAULT
// =====================================================

isiPilihanTahun();


if (tanggal) {

    tanggal.value =
        new Date()
            .toISOString()
            .split("T")[0];

}


// =====================================================
// JENIS DOKUMEN
// =====================================================

if (jenis) {

    jenis.addEventListener(
        "change",
        () => {

            const option =
                jenis.options[
                    jenis.selectedIndex
                ];


            const kode =
                option?.dataset?.indeks
                || "";


            const manual =
                jenis.value ===
                "MANUAL";


            if (manual) {

                indeks.readOnly =
                    false;


                indeks.placeholder =
                    "Masukkan indeks secara manual";


                indeks.value =
                    "";


                if (petunjukIndeks) {

                    petunjukIndeks.textContent =
                        "Isi indeks sesuai ketentuan surat.";

                }

            }

            else {

                indeks.readOnly =
                    true;


                indeks.placeholder =
                    "Otomatis";


                indeks.value =
                    kode;


                if (petunjukIndeks) {

                    petunjukIndeks.textContent =
                        "Indeks diambil dari master SIVEDOKDes.";

                }

            }


            buatNomorSurat();

        }
    );

}


// =====================================================
// EVENT NOMOR SURAT
// =====================================================

if (indeks) {

    indeks.addEventListener(
        "input",
        buatNomorSurat
    );

}


if (nomorUrut) {

    nomorUrut.addEventListener(
        "input",
        buatNomorSurat
    );

}


if (bulan) {

    bulan.addEventListener(
        "change",
        buatNomorSurat
    );

}


if (tahun) {

    tahun.addEventListener(
        "change",
        buatNomorSurat
    );

}


// =====================================================
// GENERATOR NOMOR SURAT
// =====================================================

function buatNomorSurat() {

    if (
        !indeks ||
        !nomorUrut ||
        !bulan ||
        !tahun ||
        !nomorSurat
    ) {

        return;

    }


    const kodeIndeks =
        indeks.value.trim();


    const nomor =
        nomorUrut.value.trim();


    const bulanDipilih =
        bulan.value;


    const tahunDipilih =
        tahun.value;


    if (
        !kodeIndeks ||
        !nomor ||
        !bulanDipilih ||
        !tahunDipilih
    ) {

        nomorSurat.value =
            "";


        return;

    }


    const romawi =
        bulanRomawi[
            bulanDipilih
        ];


    nomorSurat.value =
        `${kodeIndeks}/${nomor}/${KODE_DESA}/${romawi}/${tahunDipilih}`;

}


// =====================================================
// REGISTRASI DOKUMEN
// =====================================================

if (tombol) {

    tombol.addEventListener(
        "click",
        async () => {

            try {

                const jenisValue =
                    jenis.value;


                const kodeIndeks =
                    indeks.value.trim();


                const nomor =
                    nomorUrut.value.trim();


                const bulanValue =
                    bulan.value;


                const tahunValue =
                    tahun.value;


                const tanggalTerbit =
                    tanggal.value;


                const penandatanganValue =
                    penandatangan.value.trim();


                const jabatanValue =
                    jabatan.value.trim();


                // =====================================
                // VALIDASI
                // =====================================

                if (!jenisValue) {

                    alert(
                        "Silakan pilih jenis dokumen."
                    );


                    return;

                }


                if (!kodeIndeks) {

                    alert(
                        "Indeks dokumen wajib diisi."
                    );


                    return;

                }


                if (!nomor) {

                    alert(
                        "Nomor urut surat wajib diisi."
                    );


                    return;

                }


                if (
                    !/^\d+$/.test(
                        nomor
                    )
                ) {

                    alert(
                        "Nomor urut hanya boleh berisi angka."
                    );


                    return;

                }


                if (!bulanValue) {

                    alert(
                        "Silakan pilih bulan."
                    );


                    return;

                }


                if (!tahunValue) {

                    alert(
                        "Silakan pilih tahun."
                    );


                    return;

                }


                if (!tanggalTerbit) {

                    alert(
                        "Tanggal terbit wajib diisi."
                    );


                    return;

                }


                if (!penandatanganValue) {

                    alert(
                        "Penandatangan wajib diisi."
                    );


                    return;

                }


                if (!jabatanValue) {

                    alert(
                        "Jabatan wajib diisi."
                    );


                    return;

                }


                // =====================================
                // NOMOR SURAT
                // =====================================

                buatNomorSurat();


                const nomorSuratValue =
                    nomorSurat.value.trim();


                if (!nomorSuratValue) {

                    alert(
                        "Nomor surat belum berhasil dibuat."
                    );


                    return;

                }


                // =====================================
                // DISABLE
                // =====================================

                tombol.disabled =
                    true;


                tombol.textContent =
                    "Memproses...";


                // =====================================
                // COUNTER
                // =====================================

                const tahunSekarang =
                    new Date()
                        .getFullYear()
                        .toString();


                const counterRef =
                    doc(
                        db,
                        "counter",
                        tahunSekarang
                    );


                const documentId =
                    await runTransaction(
                        db,
                        async (
                            transaction
                        ) => {

                            const snap =
                                await transaction.get(
                                    counterRef
                                );


                            if (!snap.exists()) {

                                throw new Error(
                                    `Counter tahun ${tahunSekarang} belum tersedia di Firestore.`
                                );

                            }


                            const data =
                                snap.data();


                            const nomorTerakhir =
                                Number(
                                    data.lastNumber
                                    || 0
                                );


                            const nomorBaru =
                                nomorTerakhir +
                                1;


                            transaction.update(
                                counterRef,
                                {

                                    lastNumber:
                                        nomorBaru

                                }
                            );


                            const tahunPendek =
                                tahunSekarang
                                    .slice(-2);


                            return `${data.prefix}-${tahunPendek}-${String(
                                nomorBaru
                            ).padStart(
                                4,
                                "0"
                            )}`;

                        }
                    );


                // =====================================
                // DATA DOKUMEN
                // =====================================

                const dataDokumen = {

                    id:
                        documentId,

                    nomorSurat:
                        nomorSuratValue,

                    jenis:
                        jenisValue,

                    namaJenis:
                        namaJenis[
                            jenisValue
                        ]
                        ||
                        jenisValue,

                    indeks:
                        kodeIndeks,

                    nomorUrut:
                        nomor,

                    kodeKomponen:
                        KODE_DESA,

                    bulan:
                        Number(
                            bulanValue
                        ),

                    tahun:
                        Number(
                            tahunValue
                        ),

                    status:
                        "VALID",

                    penandatangan:
                        penandatanganValue,

                    jabatan:
                        jabatanValue,

                    tanggalTerbit:
                        tanggalTerbit,

                    dibuatPada:
                        serverTimestamp(),

                    dibuatOleh:
                        "admin",

                    aktif:
                        true,

                    qrVersion:
                        3,

                    qrMode:
                        QR_MODE_AUTO,

                    qrTarget:
                        "Kepala Desa Guntung / IDRIS",

                    pdfUploaded:
                        false,

                    pdfOriginalName:
                        null,

                    pdfStoragePath:
                        null,

                    pdfURL:
                        null,

                    pdfUploadedAt:
                        null

                };


                // =====================================
                // SIMPAN FIRESTORE
                // =====================================

                await setDoc(
                    doc(
                        db,
                        "dokumen",
                        documentId
                    ),
                    dataDokumen
                );


                // =====================================
                // DOCUMENT AKTIF
                // =====================================

                documentIdAktif =
                    documentId;


                if (hasil) {

                    hasil.textContent =
                        documentId;

                }


                if (uploadDocumentId) {

                    uploadDocumentId.textContent =
                        documentId;

                }


                if (uploadPDF) {

                    uploadPDF.disabled =
                        false;

                }


                if (statusUpload) {

                    statusUpload.textContent =
                        "Dokumen terdaftar. Silakan pilih PDF untuk diproses.";

                }


                if (hasilUpload) {

                    hasilUpload.hidden =
                        true;

                }


                if (filePDF) {

                    filePDF.value =
                        "";

                }


                await muatDashboard();


                alert(
                    `Dokumen berhasil diregistrasikan.\n\nDocument ID:\n${documentId}\n\nSekarang pilih PDF dan klik "Upload PDF".`
                );


                // =====================================
                // RESET FORM
                // =====================================

                jenis.value =
                    "";


                indeks.value =
                    "";


                indeks.readOnly =
                    true;


                indeks.placeholder =
                    "Otomatis";


                if (petunjukIndeks) {

                    petunjukIndeks.textContent =
                        "Pilih jenis dokumen";

                }


                nomorUrut.value =
                    "";


                bulan.value =
                    "";


                nomorSurat.value =
                    "";

            }

            catch (err) {

                console.error(
                    "Registrasi gagal:",
                    err
                );


                alert(
                    err.message
                    ||
                    "Registrasi dokumen gagal."
                );

            }

            finally {

                tombol.disabled =
                    false;


                tombol.textContent =
                    "Registrasikan Dokumen";

            }

        }
    );

}


// =====================================================
// PILIH FILE
// =====================================================

if (filePDF) {

    filePDF.addEventListener(
        "change",
        () => {

            if (hasilUpload) {

                hasilUpload.hidden =
                    true;

            }


            if (!documentIdAktif) {

                statusUpload.textContent =
                    "Registrasikan dokumen terlebih dahulu.";


                uploadPDF.disabled =
                    true;


                return;

            }


            const file =
                filePDF.files[0];


            if (!file) {

                statusUpload.textContent =
                    "Belum ada file dipilih.";


                uploadPDF.disabled =
                    false;


                return;

            }


            if (
                file.type !==
                "application/pdf"
            ) {

                statusUpload.textContent =
                    "File harus berupa PDF.";


                uploadPDF.disabled =
                    true;


                return;

            }


            if (
                file.size >
                MAX_PDF_SIZE
            ) {

                statusUpload.textContent =
                    "Ukuran PDF maksimal 20 MB.";


                uploadPDF.disabled =
                    true;


                return;

            }


            const ukuranMB =
                file.size /
                (
                    1024 *
                    1024
                );


            statusUpload.textContent =
                `File siap diproses: ${file.name} (${ukuranMB.toFixed(2)} MB)`;


            uploadPDF.disabled =
                false;

        }
    );

}


// =====================================================
// DAPATKAN MODE QR
// =====================================================

function getQRMode() {

    if (
        qrModeElement &&
        qrModeElement.value
    ) {

        const mode =
            String(
                qrModeElement.value
            )
            .toUpperCase();


        if (
            mode ===
            QR_MODE_MANUAL
        ) {

            return QR_MODE_MANUAL;

        }

    }


    return QR_MODE_AUTO;

}


// =====================================================
// CARI TEKS DI PDF
// =====================================================

async function cariPosisiTandaTangan(
    file
) {

    const arrayBuffer =
        await file.arrayBuffer();


    const pdf =
        await pdfjsLib.getDocument(
            {
                data:
                    arrayBuffer
            }
        ).promise;


    let kandidatKepala =
        [];


    let kandidatIdris =
        [];


    for (
        let pageNumber = 1;
        pageNumber <=
        pdf.numPages;
        pageNumber++
    ) {

        const page =
            await pdf.getPage(
                pageNumber
            );


        const textContent =
            await page.getTextContent();


        const items =
            textContent.items
            || [];


        for (
            const item of items
        ) {

            const text =
                String(
                    item.str
                    || ""
                )
                .trim();


            if (!text) {

                continue;

            }


            const upper =
                text.toUpperCase();


            if (
                upper.includes(
                    "KEPALA DESA GUNTUNG"
                )
            ) {

                kandidatKepala.push({

                    pageNumber,

                    item

                });

            }


            if (
                upper ===
                "IDRIS"
                ||
                upper.includes(
                    "IDRIS"
                )
            ) {

                kandidatIdris.push({

                    pageNumber,

                    item

                });

            }

        }

    }


    // =========================================
    // PRIORITAS:
    // KEPALA DESA GUNTUNG + IDRIS
    // DI HALAMAN YANG SAMA
    // =========================================

    for (
        const kepala
        of kandidatKepala
    ) {

        const idris =
            kandidatIdris.find(
                item =>
                    item.pageNumber ===
                    kepala.pageNumber
            );


        if (idris) {

            return {

                pageNumber:
                    kepala.pageNumber,

                kepala:
                    kepala.item,

                idris:
                    idris.item

            };

        }

    }


    // =========================================
    // HANYA KEPALA DESA GUNTUNG
    // =========================================

    if (
        kandidatKepala.length
    ) {

        return {

            pageNumber:
                kandidatKepala[0]
                    .pageNumber,

            kepala:
                kandidatKepala[0]
                    .item,

            idris:
                null

        };

    }


    // =========================================
    // HANYA IDRIS
    // =========================================

    if (
        kandidatIdris.length
    ) {

        return {

            pageNumber:
                kandidatIdris[0]
                    .pageNumber,

            kepala:
                null,

            idris:
                kandidatIdris[0]
                    .item

        };

    }


    return null;

}


// =====================================================
// KOORDINAT TEKS PDF
// =====================================================

function getTextCoordinate(
    item,
    pageHeight
) {

    if (
        !item ||
        !item.transform
    ) {

        return null;

    }


    const transform =
        item.transform;


    const x =
        Number(
            transform[4]
            || 0
        );


    const pdfJsY =
        Number(
            transform[5]
            || 0
        );


    const fontHeight =
        Math.abs(
            Number(
                transform[3]
                || 0
            )
        )
        || 10;


    const y =
        pageHeight -
        pdfJsY -
        fontHeight;


    return {

        x,

        y,

        height:
            fontHeight

    };

}


// =====================================================
// POSISI QR AUTO
// =====================================================

function hitungPosisiQRAuto(
    page,
    posisiTandaTangan
) {

    const {
        width,
        height
    } =
        page.getSize();


    // =========================================
    // DEFAULT
    // =========================================

    let x =
        width -
        QR_SIZE -
        QR_MARGIN;


    let y =
        QR_MARGIN +
        40;


    if (
        posisiTandaTangan
    ) {

        const kepala =
            getTextCoordinate(
                posisiTandaTangan.kepala,
                height
            );


        const idris =
            getTextCoordinate(
                posisiTandaTangan.idris,
                height
            );


        const target =
            idris ||
            kepala;


        if (target) {

            /*
             * QR diletakkan DI ATAS blok
             * Kepala Desa Guntung / IDRIS.
             *
             * Jadi QR tidak menimpa
             * tanda tangan.
             */

            const centerX =
                target.x;


            x =
                centerX -
                (
                    QR_SIZE /
                    2
                );


            const textY =
                target.y;


            y =
                textY +
                28;


            // =================================
            // BATAS KIRI
            // =================================

            if (
                x <
                QR_MARGIN
            ) {

                x =
                    QR_MARGIN;

            }


            // =================================
            // BATAS KANAN
            // =================================

            if (
                x +
                QR_SIZE +
                QR_MARGIN >
                width
            ) {

                x =
                    width -
                    QR_SIZE -
                    QR_MARGIN;

            }


            // =================================
            // BATAS BAWAH
            // =================================

            if (
                y <
                QR_MARGIN
            ) {

                y =
                    QR_MARGIN;

            }


            // =================================
            // BATAS ATAS
            // =================================

            if (
                y +
                QR_SIZE +
                45 >
                height
            ) {

                y =
                    height -
                    QR_SIZE -
                    45;

            }

        }

    }


    return {

        x,

        y

    };

}


// =====================================================
// POSISI QR MANUAL
// =====================================================

function hitungPosisiQRManual(
    page
) {

    const {
        width,
        height
    } =
        page.getSize();


    let x =
        Number(
            qrXElement?.value
        );


    let y =
        Number(
            qrYElement?.value
        );


    if (
        !Number.isFinite(x)
    ) {

        x =
            width -
            QR_SIZE -
            QR_MARGIN;

    }


    if (
        !Number.isFinite(y)
    ) {

        y =
            QR_MARGIN +
            40;

    }


    x =
        Math.max(
            QR_MARGIN,
            Math.min(
                x,
                width -
                QR_SIZE -
                QR_MARGIN
            )
        );


    y =
        Math.max(
            QR_MARGIN +
            25,
            Math.min(
                y,
                height -
                QR_SIZE -
                40
            )
        );


    return {

        x,

        y

    };

}


// =====================================================
// BUAT PDF FINAL + QR
// =====================================================

async function buatPDFFinal(
    file,
    documentId
) {

    if (statusUpload) {

        statusUpload.textContent =
            "Membaca PDF asli...";

    }


    const arrayBuffer =
        await file.arrayBuffer();


    const pdfDoc =
        await PDFDocument.load(
            arrayBuffer
        );


    // =========================================
    // URL VERIFIKASI
    // =========================================

    const verifyURL =
        `${VERIFY_URL}?id=${encodeURIComponent(
            documentId
        )}`;


    // =========================================
    // GENERATE QR
    // =========================================

    if (statusUpload) {

        statusUpload.textContent =
            "Membuat QR Document ID...";

    }


    const qrDataURL =
        await QRCode.toDataURL(
            verifyURL,
            {

                width:
                    500,

                margin:
                    2,

                errorCorrectionLevel:
                    "H"

            }
        );


    const qrResponse =
        await fetch(
            qrDataURL
        );


    const qrBlob =
        await qrResponse.blob();


    const qrBuffer =
        await qrBlob.arrayBuffer();


    const qrImage =
        await pdfDoc.embedPng(
            qrBuffer
        );


    // =========================================
    // CARI POSISI TANDA TANGAN
    // =========================================

    if (statusUpload) {

        statusUpload.textContent =
            "Mencari posisi Kepala Desa Guntung / IDRIS...";

    }


    let posisiTandaTangan =
        null;


    try {

        posisiTandaTangan =
            await cariPosisiTandaTangan(
                file
            );

    }

    catch (err) {

        console.warn(
            "Pencarian teks PDF gagal:",
            err
        );

    }


    // =========================================
    // HALAMAN PDF
    // =========================================

    const pages =
        pdfDoc.getPages();


    if (!pages.length) {

        throw new Error(
            "PDF tidak memiliki halaman."
        );

    }


    // =========================================
    // TARGET PAGE
    // =========================================

    let targetPageIndex =
        0;


    if (
        posisiTandaTangan &&
        posisiTandaTangan.pageNumber
    ) {

        targetPageIndex =
            posisiTandaTangan.pageNumber -
            1;

    }


    if (
        targetPageIndex <
        0
    ) {

        targetPageIndex =
            0;

    }


    if (
        targetPageIndex >=
        pages.length
    ) {

        targetPageIndex =
            pages.length -
            1;

    }


    const targetPage =
        pages[
            targetPageIndex
        ];


    // =========================================
    // MODE QR
    // =========================================

    const qrMode =
        getQRMode();


    let posisiQR;


    if (
        qrMode ===
        QR_MODE_MANUAL
    ) {

        posisiQR =
            hitungPosisiQRManual(
                targetPage
            );

    }

    else {

        posisiQR =
            hitungPosisiQRAuto(
                targetPage,
                posisiTandaTangan
            );

    }


    const {
        x,
        y
    } =
        posisiQR;


    // =========================================
    // QR
    // =========================================

    if (statusUpload) {

        statusUpload.textContent =
            `Menempelkan QR (${qrMode}) ke PDF...`;

    }


    targetPage.drawImage(
        qrImage,
        {

            x,

            y,

            width:
                QR_SIZE,

            height:
                QR_SIZE

        }
    );


    // =========================================
    // LABEL KEPALA DESA
    // =========================================

    const label1 =
        "Kepala Desa Guntung";


    const label2 =
        "IDRIS";


    // =========================================
    // HITUNG POSISI LABEL
    // =========================================

    const label1Width =
        label1.length *
        3.4;


    const label2Width =
        label2.length *
        3.8;


    const label1X =
        x +
        (
            QR_SIZE -
            label1Width
        ) /
        2;


    const label2X =
        x +
        (
            QR_SIZE -
            label2Width
        ) /
        2;


    // =========================================
    // LABEL BARIS 1
    // =========================================

    targetPage.drawText(
        label1,
        {

            x:
                Math.max(
                    QR_MARGIN,
                    label1X
                ),

            y:
                y -
                12,

            size:
                QR_LABEL_SIZE,

            color:
                rgb(
                    0,
                    0,
                    0
                )

        }
    );


    // =========================================
    // LABEL BARIS 2
    // =========================================

    targetPage.drawText(
        label2,
        {

            x:
                Math.max(
                    QR_MARGIN,
                    label2X
                ),

            y:
                y -
                22,

            size:
                QR_LABEL_SIZE,

            color:
                rgb(
                    0,
                    0,
                    0
                )

        }
    );


    // =========================================
    // DOCUMENT ID
    // =========================================

    targetPage.drawText(
        documentId,
        {

            x:
                x,

            y:
                y +
                QR_SIZE +
                4,

            size:
                5,

            color:
                rgb(
                    0,
                    0,
                    0
                )

        }
    );


    // =========================================
    // SIMPAN PDF FINAL
    // =========================================

    if (statusUpload) {

        statusUpload.textContent =
            "Menyimpan PDF final dengan QR...";

    }


    const finalBytes =
        await pdfDoc.save();


    return {

        blob:
            new Blob(
                [
                    finalBytes
                ],
                {
                    type:
                        "application/pdf"
                }
            ),

        qrMode,

        qrPage:
            targetPageIndex +
            1,

        qrX:
            x,

        qrY:
            y

    };

}


// =====================================================
// UPLOAD PDF FINAL → SUPABASE
// =====================================================

if (uploadPDF) {

    uploadPDF.addEventListener(
        "click",
        async () => {

            try {

                // =====================================
                // DOCUMENT ID
                // =====================================

                if (!documentIdAktif) {

                    alert(
                        "Belum ada Document ID aktif.\nRegistrasikan dokumen terlebih dahulu."
                    );


                    return;

                }


                // =====================================
                // FILE
                // =====================================

                const file =
                    filePDF.files[0];


                if (!file) {

                    alert(
                        "Silakan pilih file PDF terlebih dahulu."
                    );


                    return;

                }


                if (
                    file.type !==
                    "application/pdf"
                ) {

                    alert(
                        "File yang dipilih bukan PDF."
                    );


                    return;

                }


                if (
                    file.size >
                    MAX_PDF_SIZE
                ) {

                    alert(
                        "Ukuran PDF maksimal 20 MB."
                    );


                    return;

                }


                // =====================================
                // DISABLE
                // =====================================

                uploadPDF.disabled =
                    true;


                filePDF.disabled =
                    true;


                // =====================================
                // BUAT PDF FINAL
                // =====================================

                const hasilPDF =
                    await buatPDFFinal(
                        file,
                        documentIdAktif
                    );


                const pdfFinal =
                    hasilPDF.blob;


                // =====================================
                // STORAGE PATH
                // =====================================

                const storagePath =
                    `dokumen/${documentIdAktif}/document-final.pdf`;


                // =====================================
                // UPLOAD SUPABASE
                // =====================================

                statusUpload.textContent =
                    "Meng-upload PDF final ke Supabase Storage...";


                const {
                    error:
                        uploadError
                } =
                    await supabase
                        .storage
                        .from(
                            STORAGE_BUCKET
                        )
                        .upload(
                            storagePath,
                            pdfFinal,
                            {

                                contentType:
                                    "application/pdf",

                                upsert:
                                    true

                            }
                        );


                if (uploadError) {

                    throw uploadError;

                }


                // =====================================
                // FIRESTORE
                // =====================================

                await setDoc(
                    doc(
                        db,
                        "dokumen",
                        documentIdAktif
                    ),
                    {

                        pdfUploaded:
                            true,

                        pdfOriginalName:
                            file.name,

                        pdfStoragePath:
                            storagePath,

                        pdfURL:
                            null,

                        pdfUploadedAt:
                            serverTimestamp(),

                        qrVersion:
                            3,

                        qrMode:
                            hasilPDF.qrMode,

                        qrPage:
                            hasilPDF.qrPage,

                        qrX:
                            hasilPDF.qrX,

                        qrY:
                            hasilPDF.qrY,

                        qrTarget:
                            "Kepala Desa Guntung / IDRIS"

                    },
                    {
                        merge:
                            true
                    }
                );


                // =====================================
                // SIGNED URL
                // =====================================

                statusUpload.textContent =
                    "PDF final tersimpan. Membuat link PDF...";


                const signedURL =
                    await buatSignedURL(
                        storagePath
                    );


                // =====================================
                // HASIL
                // =====================================

                statusUpload.textContent =
                    "PDF final berhasil disimpan dengan QR.";


                if (signedURL) {

                    linkPDF.href =
                        signedURL;


                    linkPDF.target =
                        "_blank";


                    linkPDF.rel =
                        "noopener noreferrer";


                    hasilUpload.hidden =
                        false;

                }


                await muatDashboard();


                alert(
                    `PDF berhasil diproses.\n\nDocument ID:\n${documentIdAktif}\n\nMode QR: ${hasilPDF.qrMode}\nHalaman QR: ${hasilPDF.qrPage}\n\nQR telah ditempel ke PDF final.`
                );

            }

            catch (err) {

                console.error(
                    "Upload PDF gagal:",
                    err
                );


                let pesan =
                    err.message
                    ||
                    "Upload PDF gagal.";


                if (
                    err.message &&
                    err.message
                        .toLowerCase()
                        .includes(
                            "row-level security"
                        )
                ) {

                    pesan =
                        "Upload ditolak oleh Supabase Storage Policy.";

                }


                if (
                    err.message &&
                    err.message
                        .toLowerCase()
                        .includes(
                            "bucket"
                        )
                ) {

                    pesan =
                        `Bucket "${STORAGE_BUCKET}" tidak ditemukan atau tidak dapat diakses.`;

                }


                statusUpload.textContent =
                    pesan;


                alert(
                    pesan
                );

            }

            finally {

                uploadPDF.disabled =
                    false;


                filePDF.disabled =
                    false;

            }

        }
    );

}


// =====================================================
// SIGNED URL
// =====================================================

async function buatSignedURL(
    storagePath
) {

    if (!storagePath) {

        return null;

    }


    try {

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
                "Gagal membuat signed URL:",
                error
            );


            return null;

        }


        return data?.signedUrl
            || null;

    }

    catch (err) {

        console.error(
            "Signed URL error:",
            err
        );


        return null;

    }

}


// =====================================================
// DASHBOARD
// =====================================================

async function muatDashboard() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "dokumen"
                )
            );


        let total =
            0;


        let valid =
            0;


        let dicabut =
            0;


        let dibatalkan =
            0;


        const dokumen =
            [];


        snapshot.forEach(
            (
                item
            ) => {

                const data =
                    item.data();


                total++;


                const status =
                    String(
                        data.status
                        || ""
                    )
                    .toUpperCase();


                if (
                    status ===
                    "VALID"
                ) {

                    valid++;

                }

                else if (
                    status ===
                    "DICABUT"
                ) {

                    dicabut++;

                }

                else if (
                    status ===
                    "DIBATALKAN"
                ) {

                    dibatalkan++;

                }


                dokumen.push({

                    id:
                        data.id
                        ||
                        item.id,

                    nomorSurat:
                        data.nomorSurat
                        ||
                        "-",

                    jenis:
                        data.namaJenis
                        ||
                        data.jenis
                        ||
                        "-",

                    status:
                        data.status
                        ||
                        "-",

                    tanggal:
                        data.tanggalTerbit
                        ||
                        "-",

                    pdfStoragePath:
                        data.pdfStoragePath
                        ||
                        null,

                    pdfUploaded:
                        data.pdfUploaded
                        ||
                        false

                });

            }
        );


        // =========================================
        // STATISTIK
        // =========================================

        if (totalDokumen) {

            totalDokumen.textContent =
                total;

        }


        if (dokumenValid) {

            dokumenValid.textContent =
                valid;

        }


        if (dokumenDicabut) {

            dokumenDicabut.textContent =
                dicabut;

        }


        if (dokumenDibatalkan) {

            dokumenDibatalkan.textContent =
                dibatalkan;

        }


        // =========================================
        // SORT
        // =========================================

        dokumen.sort(
            (
                a,
                b
            ) =>
                String(
                    b.id
                ).localeCompare(
                    String(
                        a.id
                    )
                )
        );


        const terbaru =
            dokumen.slice(
                0,
                10
            );


        if (
            terbaru.length ===
            0
        ) {

            daftarDokumen.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;">

                        Belum ada dokumen.

                    </td>

                </tr>

            `;


            return;

        }


        // =========================================
        // SIGNED URL
        // =========================================

        const daftarDenganURL =
            await Promise.all(

                terbaru.map(
                    async (
                        data
                    ) => {

                        if (
                            data.pdfStoragePath
                        ) {

                            data.pdfURL =
                                await buatSignedURL(
                                    data.pdfStoragePath
                                );

                        }

                        else {

                            data.pdfURL =
                                null;

                        }


                        return data;

                    }
                )

            );


        // =========================================
        // TABLE
        // =========================================

        daftarDokumen.innerHTML =
            daftarDenganURL
                .map(
                    (
                        data
                    ) => {

                        let warnaStatus =
                            "#6b7280";


                        const statusUpper =
                            String(
                                data.status
                            )
                            .toUpperCase();


                        if (
                            statusUpper ===
                            "VALID"
                        ) {

                            warnaStatus =
                                "#16a34a";

                        }

                        else if (
                            statusUpper ===
                                "DICABUT"
                            ||
                            statusUpper ===
                                "DIBATALKAN"
                        ) {

                            warnaStatus =
                                "#dc2626";

                        }


                        let pdf =
                            "";


                        if (
                            data.pdfURL
                        ) {

                            pdf = `

                                <a
                                    class="pdf-link"
                                    href="${escapeHTML(
                                        data.pdfURL
                                    )}"
                                    target="_blank"
                                    rel="noopener noreferrer">

                                    PDF

                                </a>

                            `;

                        }

                        else {

                            pdf = `

                                <span
                                    style="color:#9ca3af;">

                                    Belum ada

                                </span>

                            `;

                        }


                        return `

                            <tr>

                                <td>
                                    ${escapeHTML(
                                        data.id
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        data.nomorSurat
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        data.jenis
                                    )}
                                </td>

                                <td
                                    style="
                                        color:${warnaStatus};
                                        font-weight:600;
                                    "
                                >

                                    ${escapeHTML(
                                        data.status
                                    )}

                                </td>

                                <td>
                                    ${pdf}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        data.tanggal
                                    )}
                                </td>

                            </tr>

                        `;

                    }
                )
                .join("");

    }

    catch (err) {

        console.error(
            "Gagal memuat dashboard:",
            err
        );


        if (totalDokumen) {

            totalDokumen.textContent =
                "-";

        }


        if (dokumenValid) {

            dokumenValid.textContent =
                "-";

        }


        if (dokumenDicabut) {

            dokumenDicabut.textContent =
                "-";

        }


        if (dokumenDibatalkan) {

            dokumenDibatalkan.textContent =
                "-";

        }


        if (daftarDokumen) {

            daftarDokumen.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;">

                        Gagal memuat data.

                    </td>

                </tr>

            `;

        }

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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
// JALANKAN DASHBOARD
// =====================================================

muatDashboard();
