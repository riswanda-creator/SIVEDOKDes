// =====================================================
// SIVEDOKDes
// PDF GENERATOR + AUTO QR POSITION
// =====================================================
//
// Fungsi:
// 1. Membaca PDF
// 2. Scan seluruh halaman
// 3. Mencari "Kepala Desa Guntung"
// 4. Mencari "IDRIS"
// 5. Menentukan posisi tanda tangan
// 6. Menempatkan QR di atas area IDRIS
// 7. Menghasilkan PDF final
//
// =====================================================

import {
    PDFDocument,
    rgb
} from "https://esm.sh/pdf-lib@1.17.1";

import {
    buatQRCode
} from "../js/qr.js";

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


// =====================================================
// PDF.JS WORKER
// =====================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


// =====================================================
// KONFIGURASI
// =====================================================

const CONFIG = {

    qrSize: 78,

    qrGap: 10,

    whitePadding: 5,

    margin: 20,

    maxPages: 20,

    searchKepalaDesa:
        "KEPALA DESA GUNTUNG",

    searchIdris:
        "IDRIS"

};


// =====================================================
// NORMALISASI TEKS
// =====================================================

function normalizeText(value) {

    return String(value || "")
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();

}


// =====================================================
// AMBIL DATA TEKS SATU HALAMAN
// =====================================================

async function bacaHalamanPDF(
    pdfjsDocument,
    pageNumber
) {

    const page =
        await pdfjsDocument.getPage(
            pageNumber
        );

    const viewport =
        page.getViewport({
            scale: 1
        });

    const textContent =
        await page.getTextContent();

    const items = [];

    for (
        const item
        of textContent.items
    ) {

        if (
            !item ||
            typeof item.str !== "string"
        ) {

            continue;

        }

        const text =
            normalizeText(
                item.str
            );

        if (!text) {

            continue;

        }

        const transformed =
            pdfjsLib.Util.transform(
                viewport.transform,
                item.transform
            );

        const x =
            transformed[4];

        const y =
            transformed[5];

        const width =
            Math.abs(
                Number(item.width) || 0
            );

        const height =
            Math.abs(
                Number(item.height) ||
                Math.hypot(
                    transformed[2],
                    transformed[3]
                ) ||
                12
            );

        items.push({

            text,

            originalText:
                item.str,

            x,

            y,

            width,

            height

        });

    }

    return {

        page,

        viewport,

        items,

        width:
            viewport.width,

        height:
            viewport.height

    };

}


// =====================================================
// CARI IDRIS
// =====================================================

function cariIDRIS(
    items
) {

    // -------------------------------------------------
    // Prioritas pertama:
    // item teks yang persis / langsung mengandung IDRIS
    // -------------------------------------------------

    const kandidat =
        items.filter(
            item =>
                normalizeText(
                    item.text
                ).includes(
                    CONFIG.searchIdris
                )
        );

    if (!kandidat.length) {

        return null;

    }

    // -------------------------------------------------
    // Jika ada beberapa IDRIS,
    // pilih yang berada paling dekat dengan
    // "Kepala Desa Guntung"
    //
    // Untuk sementara kandidat pertama.
    // Pemilihan lebih lanjut dilakukan oleh scanner.
    // -------------------------------------------------

    return kandidat[0];

}


// =====================================================
// CARI POSISI IDRIS TERBAIK
// =====================================================

function pilihIDRISTerbaik(
    items,
    posisiKepala
) {

    const kandidat =
        items.filter(
            item =>
                normalizeText(
                    item.text
                ).includes(
                    CONFIG.searchIdris
                )
        );

    if (!kandidat.length) {

        return null;

    }

    if (!posisiKepala) {

        return kandidat[0];

    }

    // -------------------------------------------------
    // Pilih IDRIS yang paling dekat dengan
    // posisi "Kepala Desa Guntung"
    // -------------------------------------------------

    let terbaik =
        kandidat[0];

    let jarakTerbaik =
        Number.POSITIVE_INFINITY;

    for (
        const item
        of kandidat
    ) {

        const dx =
            item.x -
            posisiKepala.x;

        const dy =
            item.y -
            posisiKepala.y;

        const jarak =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            jarak <
            jarakTerbaik
        ) {

            jarakTerbaik =
                jarak;

            terbaik =
                item;

        }

    }

    return terbaik;

}


// =====================================================
// SCAN SELURUH PDF
// =====================================================

async function cariAreaTandaTangan(
    arrayBuffer
) {

    const loadingTask =
        pdfjsLib.getDocument({
            data:
                new Uint8Array(
                    arrayBuffer
                )
        });

    const pdf =
        await loadingTask.promise;

    const jumlahHalaman =
        pdf.numPages;

    if (
        jumlahHalaman < 1
    ) {

        throw new Error(
            "PDF tidak memiliki halaman."
        );

    }

    if (
        jumlahHalaman >
        CONFIG.maxPages
    ) {

        throw new Error(
            `PDF memiliki ${jumlahHalaman} halaman. ` +
            `Maksimal ${CONFIG.maxPages} halaman.`
        );

    }

    let fallbackIDRIS =
        null;

    let halamanKepala =
        null;

    // -------------------------------------------------
    // SCAN SETIAP HALAMAN
    // -------------------------------------------------

    for (
        let pageNumber = 1;
        pageNumber <= jumlahHalaman;
        pageNumber++
    ) {

        const pageData =
            await bacaHalamanPDF(
                pdf,
                pageNumber
            );

        const semuaTeks =
            normalizeText(
                pageData.items
                    .map(
                        item =>
                            item.text
                    )
                    .join(" ")
            );

        const adaKepalaDesa =
            semuaTeks.includes(
                CONFIG.searchKepalaDesa
            );

        const kandidatIDRIS =
            cariIDRIS(
                pageData.items
            );

        // -------------------------------------------------
        // Jika halaman mengandung Kepala Desa Guntung
        // -------------------------------------------------

        if (
            adaKepalaDesa
        ) {

            halamanKepala = {

                pageNumber,

                pageData,

                idris:
                    pilihIDRISTerbaik(
                        pageData.items,
                        null
                    )

            };

            // -------------------------------------------------
            // Jika IDRIS juga ada di halaman yang sama
            // -------------------------------------------------

            if (
                halamanKepala.idris
            ) {

                return {

                    ditemukan:
                        true,

                    pageNumber,

                    pageData,

                    kepalaDesa:
                        CONFIG.searchKepalaDesa,

                    idris:
                        halamanKepala.idris,

                    metode:
                        "AUTO"

                };

            }

        }

        // -------------------------------------------------
        // Simpan kandidat IDRIS sebagai fallback
        // -------------------------------------------------

        if (
            kandidatIDRIS &&
            !fallbackIDRIS
        ) {

            fallbackIDRIS = {

                pageNumber,

                pageData,

                idris:
                    kandidatIDRIS

            };

        }

    }

    // -------------------------------------------------
    // Jika Kepala Desa ditemukan tetapi IDRIS
    // tidak terdeteksi di halaman yang sama
    // -------------------------------------------------

    if (
        halamanKepala &&
        halamanKepala.idris
    ) {

        return {

            ditemukan:
                true,

            pageNumber:
                halamanKepala.pageNumber,

            pageData:
                halamanKepala.pageData,

            kepalaDesa:
                CONFIG.searchKepalaDesa,

            idris:
                halamanKepala.idris,

            metode:
                "AUTO"

        };

    }

    // -------------------------------------------------
    // Jika hanya IDRIS yang ditemukan
    // -------------------------------------------------

    if (
        fallbackIDRIS
    ) {

        return {

            ditemukan:
                true,

            pageNumber:
                fallbackIDRIS.pageNumber,

            pageData:
                fallbackIDRIS.pageData,

            kepalaDesa:
                null,

            idris:
                fallbackIDRIS.idris,

            metode:
                "AUTO_IDRIS"

        };

    }

    // -------------------------------------------------
    // Gagal
    // -------------------------------------------------

    return {

        ditemukan:
            false,

        jumlahHalaman,

        pdf

    };

}


// =====================================================
// POSISI QR OTOMATIS
// =====================================================

function hitungPosisiQR(
    pageData,
    idris
) {

    const width =
        pageData.width;

    const height =
        pageData.height;

    const qrSize =
        CONFIG.qrSize;

    const gap =
        CONFIG.qrGap;

    const margin =
        CONFIG.margin;

    // -------------------------------------------------
    // Posisi teks IDRIS menurut viewport PDF.js
    //
    // PDF.js:
    // origin = kiri atas
    //
    // pdf-lib:
    // origin = kiri bawah
    // -------------------------------------------------

    const idrisX =
        idris.x;

    const idrisTopY =
        idris.y -
        idris.height;

    const idrisWidth =
        Math.max(
            idris.width,
            30
        );

    // -------------------------------------------------
    // QR diletakkan DI ATAS IDRIS
    // dan dipusatkan terhadap tulisan IDRIS.
    // -------------------------------------------------

    let qrX =
        idrisX +
        (idrisWidth / 2) -
        (qrSize / 2);

    let qrY =
        height -
        idrisTopY +
        gap;

    // -------------------------------------------------
    // Pastikan QR tidak keluar halaman
    // -------------------------------------------------

    if (
        qrX < margin
    ) {

        qrX =
            margin;

    }

    if (
        qrX +
        qrSize >
        width -
        margin
    ) {

        qrX =
            width -
            margin -
            qrSize;

    }

    if (
        qrY +
        qrSize >
        height -
        margin
    ) {

        // ---------------------------------------------
        // Jika terlalu tinggi,
        // letakkan QR di atas posisi IDRIS
        // dengan sedikit penyesuaian.
        // ---------------------------------------------

        qrY =
            height -
            idris.y +
            idris.height +
            gap;

    }

    return {

        x:
            qrX,

        y:
            qrY,

        width:
            qrSize,

        height:
            qrSize

    };

}


// =====================================================
// POSISI MANUAL
// =====================================================

function hitungPosisiManual(
    page,
    posisi
) {

    const {
        width,
        height
    } =
        page.getSize();

    const size =
        CONFIG.qrSize;

    const margin =
        35;

    switch (
        String(
            posisi ||
            ""
        ).toUpperCase()
    ) {

        case "ATAS":

            return {

                x:
                    (width - size) / 2,

                y:
                    height -
                    size -
                    margin,

                width:
                    size,

                height:
                    size

            };


        case "KANAN":

            return {

                x:
                    width -
                    size -
                    margin,

                y:
                    height / 2,

                width:
                    size,

                height:
                    size

            };


        case "KIRI":

            return {

                x:
                    margin,

                y:
                    height / 2,

                width:
                    size,

                height:
                    size

            };


        case "BAWAH":

        default:

            return {

                x:
                    width -
                    size -
                    margin,

                y:
                    margin,

                width:
                    size,

                height:
                    size

            };

    }

}


// =====================================================
// PASANG QR KE PDF
// =====================================================

async function tempelQRCode(
    pdfDoc,
    page,
    qrDataURL,
    posisi
) {

    const qrBytes =
        await fetch(
            qrDataURL
        )
        .then(
            response =>
                response.arrayBuffer()
        );

    const qrImage =
        await pdfDoc.embedPng(
            qrBytes
        );

    const qrX =
        posisi.x;

    const qrY =
        posisi.y;

    const qrWidth =
        posisi.width;

    const qrHeight =
        posisi.height;

    // -------------------------------------------------
    // Kotak putih tipis di belakang QR
    // supaya QR tetap terbaca jika berada dekat teks.
    // -------------------------------------------------

    const padding =
        CONFIG.whitePadding;

    page.drawRectangle({

        x:
            qrX -
            padding,

        y:
            qrY -
            padding,

        width:
            qrWidth +
            (padding * 2),

        height:
            qrHeight +
            (padding * 2),

        color:
            rgb(
                1,
                1,
                1
            )

    });

    // -------------------------------------------------
    // QR
    // -------------------------------------------------

    page.drawImage(
        qrImage,
        {

            x:
                qrX,

            y:
                qrY,

            width:
                qrWidth,

            height:
                qrHeight

        }
    );

}


// =====================================================
// GENERATE PDF FINAL
// =====================================================

export async function generatePDFWithQR(
    file,
    documentId,
    verifyURL,
    manualPlacement = null
) {

    if (!file) {

        throw new Error(
            "File PDF tidak tersedia."
        );

    }

    if (!documentId) {

        throw new Error(
            "Document ID tidak tersedia."
        );

    }

    if (!verifyURL) {

        throw new Error(
            "URL verifikasi tidak tersedia."
        );

    }

    // -------------------------------------------------
    // BACA PDF ASLI
    // -------------------------------------------------

    const arrayBuffer =
        await file.arrayBuffer();

    const pdfDoc =
        await PDFDocument.load(
            arrayBuffer
        );

    const pages =
        pdfDoc.getPages();

    if (!pages.length) {

        throw new Error(
            "PDF tidak memiliki halaman."
        );

    }

    // -------------------------------------------------
    // BUAT QR
    // -------------------------------------------------

    const {
        qrDataURL
    } =
        await buatQRCode(
            documentId,
            verifyURL
        );

    // -------------------------------------------------
    // CARI POSISI OTOMATIS
    // -------------------------------------------------

    let lokasi =
        await cariAreaTandaTangan(
            arrayBuffer
        );

    let pageNumber;
    let posisi;
    let metode;

    // -------------------------------------------------
    // AUTO
    // -------------------------------------------------

    if (
        lokasi.ditemukan
    ) {

        pageNumber =
            lokasi.pageNumber;

        const page =
            pages[
                pageNumber - 1
            ];

        posisi =
            hitungPosisiQR(
                lokasi.pageData,
                lokasi.idris
            );

        metode =
            lokasi.metode;

    }

    // -------------------------------------------------
    // MANUAL
    // -------------------------------------------------

    else {

        if (
            !manualPlacement
        ) {

            const error =
                new Error(
                    "AUTO_DETECTION_FAILED"
                );

            error.code =
                "AUTO_DETECTION_FAILED";

            error.message =
                "Sistem tidak menemukan teks " +
                `"Kepala Desa Guntung" dan "IDRIS" ` +
                "secara otomatis di dalam PDF.";

            error.jumlahHalaman =
                lokasi.jumlahHalaman;

            throw error;

        }

        pageNumber =
            Number(
                manualPlacement.page
            );

        if (
            !Number.isInteger(
                pageNumber
            ) ||
            pageNumber < 1 ||
            pageNumber > pages.length
        ) {

            throw new Error(
                "Nomor halaman manual tidak valid."
            );

        }

        const page =
            pages[
                pageNumber - 1
            ];

        posisi =
            hitungPosisiManual(
                page,
                manualPlacement.position
            );

        metode =
            "MANUAL";

    }

    // -------------------------------------------------
    // HALAMAN TARGET
    // -------------------------------------------------

    const targetPage =
        pages[
            pageNumber - 1
        ];

    // -------------------------------------------------
    // TEMPEL QR
    // -------------------------------------------------

    await tempelQRCode(
        pdfDoc,
        targetPage,
        qrDataURL,
        posisi
    );

    // -------------------------------------------------
    // SIMPAN PDF
    // -------------------------------------------------

    const pdfBytes =
        await pdfDoc.save();

    const finalFile =
        new File(
            [
                pdfBytes
            ],
            `${documentId}.pdf`,
            {
                type:
                    "application/pdf"
            }
        );

    return {

        finalFile,

        verifyURL,

        documentId,

        pageNumber,

        metode,

        posisi

    };

}
