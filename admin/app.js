// =====================================================
// SIVEDOKDes
// ADMIN APP
// =====================================================
// FIRESTORE
// =====================================================

import {
    db,
    doc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    updateDoc
} from "./firebase.js";


// =====================================================
// SUPABASE
// =====================================================

import {
    supabase
} from "./supabase.js";


// =====================================================
// EXTERNAL LIBRARIES
// =====================================================

import {
    PDFDocument
} from "https://esm.sh/pdf-lib@1.17.1";

import QRCode from "https://esm.sh/qrcode@1.5.4";


// =====================================================
// KONFIGURASI
// =====================================================

const SUPABASE_BUCKET =
    "sivedokdes-pdf";

const SUPABASE_FOLDER =
    "dokumen";


// =====================================================
// ELEMENT
// =====================================================

const jenisElement =
    document.getElementById("jenis");

const indeksElement =
    document.getElementById("indeks");

const petunjukIndeks =
    document.getElementById("petunjukIndeks");

const nomorUrutElement =
    document.getElementById("nomorUrut");

const kodeKomponenElement =
    document.getElementById("kodeKomponen");

const bulanElement =
    document.getElementById("bulan");

const tahunElement =
    document.getElementById("tahun");

const nomorSuratElement =
    document.getElementById("nomorSurat");

const tanggalElement =
    document.getElementById("tanggal");

const penandatanganElement =
    document.getElementById("penandatangan");

const jabatanElement =
    document.getElementById("jabatan");

const registrasiButton =
    document.getElementById("registrasi");

const hasilElement =
    document.getElementById("hasil");

const uploadDocumentId =
    document.getElementById("uploadDocumentId");

const filePDF =
    document.getElementById("filePDF");

const uploadPDFButton =
    document.getElementById("uploadPDF");

const statusUpload =
    document.getElementById("statusUpload");

const hasilUpload =
    document.getElementById("hasilUpload");

const linkPDF =
    document.getElementById("linkPDF");

const daftarDokumen =
    document.getElementById("daftarDokumen");

const totalDokumen =
    document.getElementById("totalDokumen");

const dokumenValid =
    document.getElementById("dokumenValid");

const dokumenDicabut =
    document.getElementById("dokumenDicabut");

const dokumenDibatalkan =
    document.getElementById("dokumenDibatalkan");


// =====================================================
// STATE
// =====================================================

let currentDocumentId =
    null;

let currentDocumentData =
    null;

let currentOriginalFile =
    null;


// =====================================================
// TAHUN
// =====================================================

function isiTahun() {

    if (!tahunElement) {
        return;
    }

    const tahunSekarang =
        new Date().getFullYear();

    tahunElement.innerHTML = "";

    for (
        let tahun = tahunSekarang - 1;
        tahun <= tahunSekarang + 1;
        tahun++
    ) {

        const option =
            document.createElement("option");

        option.value =
            String(tahun);

        option.textContent =
            String(tahun);

        if (
            tahun === tahunSekarang
        ) {

            option.selected =
                true;

        }

        tahunElement.appendChild(
            option
        );
    }
}


// =====================================================
// INDEKS DOKUMEN
// =====================================================

function updateIndeks() {

    if (
        !jenisElement ||
        !indeksElement
    ) {
        return;
    }

    const option =
        jenisElement.options[
            jenisElement.selectedIndex
        ];

    if (!option) {
        return;
    }

    const indeks =
        option.dataset.indeks || "";

    indeksElement.value =
        indeks;

    if (petunjukIndeks) {

        petunjukIndeks.textContent =
            indeks
                ? `Kode klasifikasi otomatis: ${indeks}`
                : "Indeks harus diisi secara manual.";

    }
}


// =====================================================
// NOMOR SURAT
// =====================================================

function updateNomorSurat() {

    if (
        !nomorSuratElement
    ) {
        return;
    }

    const nomor =
        nomorUrutElement?.value
        ?.trim() || "";

    const kode =
        kodeKomponenElement?.value
        ?.trim() || "GT";

    const bulan =
        bulanElement?.value || "";

    const tahun =
        tahunElement?.value || "";

    const indeks =
        indeksElement?.value
        ?.trim() || "";

    const jenis =
        jenisElement?.value
        ?.trim() || "";

    if (
        !nomor ||
        !bulan ||
        !tahun ||
        !jenis
    ) {

        nomorSuratElement.value =
            "";

        return;
    }

    const nomorFormat =
        String(
            Number(nomor)
        ).padStart(
            3,
            "0"
        );

    const bulanFormat =
        String(
            Number(bulan)
        ).padStart(
            2,
            "0"
        );

    nomorSuratElement.value =
        `${nomorFormat}/${indeks || jenis}/${kode}/${bulanFormat}/${tahun}`;
}


// =====================================================
// DOCUMENT ID
// =====================================================

function buatDocumentID(
    tahun,
    nomorUrut
) {

    const kodeWilayah =
        "1219062002";

    const tahunPendek =
        String(tahun).slice(-2);

    const nomor =
        String(
            Number(nomorUrut)
        ).padStart(
            4,
            "0"
        );

    return (
        `${kodeWilayah}-${tahunPendek}-${nomor}`
    );
}


// =====================================================
// URL VERIFIKASI
// =====================================================

function buatURLVerifikasi(
    documentId
) {

    const baseURL =
        window.location.origin;

    return (
        `${baseURL}/verify.html?id=${encodeURIComponent(documentId)}`
    );
}


// =====================================================
// QR PANEL
// Dibuat otomatis oleh JS.
// Tidak perlu menambah HTML manual.
// =====================================================

function buatQRPanel() {

    if (
        document.getElementById(
            "qrPanel"
        )
    ) {
        return;
    }

    const panel =
        document.createElement("section");

    panel.id =
        "qrPanel";

    panel.className =
        "panel";

    panel.innerHTML = `

        <div class="panel-header">

            <h2>
                QR Verifikasi Dokumen
            </h2>

            <p>
                QR akan mengarah langsung ke halaman
                verifikasi SIVEDOKDes.
            </p>

        </div>

        <div class="form-grid">

            <div class="form-group">

                <label for="qrMode">
                    Mode QR
                </label>

                <select id="qrMode">

                    <option value="AUTO">
                        AUTO
                    </option>

                    <option value="MANUAL">
                        MANUAL
                    </option>

                </select>

            </div>

            <div class="form-group">

                <label for="qrPage">
                    Halaman QR
                </label>

                <input
                    id="qrPage"
                    type="number"
                    min="1"
                    value="1">

            </div>

            <div class="form-group">

                <label for="qrTarget">
                    Target Posisi
                </label>

                <select id="qrTarget">

                    <option value="signature">
                        Signature
                    </option>

                    <option value="bottom-right">
                        Bottom Right
                    </option>

                    <option value="custom">
                        Custom
                    </option>

                </select>

            </div>

            <div class="form-group">

                <label for="qrSize">
                    Ukuran QR (pt)
                </label>

                <input
                    id="qrSize"
                    type="number"
                    min="50"
                    max="180"
                    value="90">

            </div>

            <div class="form-group">

                <label for="qrX">
                    Posisi X
                </label>

                <input
                    id="qrX"
                    type="number"
                    value="0">

            </div>

            <div class="form-group">

                <label for="qrY">
                    Posisi Y
                </label>

                <input
                    id="qrY"
                    type="number"
                    value="0">

            </div>

        </div>

        <div
            id="qrPreview"
            style="
                margin-top:20px;
                text-align:center;
            "
            hidden>

            <canvas
                id="qrCanvas">
            </canvas>

            <p
                id="qrURL"
                style="
                    word-break:break-all;
                    font-size:12px;
                ">
            </p>

        </div>

    `;

    const uploadSection =
        document
            .querySelector(
                "#uploadPDF"
            )
            ?.closest(
                ".panel"
            );

    if (uploadSection) {

        uploadSection
            .parentNode
            .insertBefore(
                panel,
                uploadSection
            );

    } else {

        document
            .querySelector(
                ".admin-container"
            )
            ?.appendChild(
                panel
            );
    }


    const qrMode =
        document.getElementById(
            "qrMode"
        );

    const qrTarget =
        document.getElementById(
            "qrTarget"
        );

    const qrX =
        document.getElementById(
            "qrX"
        );

    const qrY =
        document.getElementById(
            "qrY"
        );


    function updateManualState() {

        const manual =
            qrMode.value === "MANUAL";

        qrX.disabled =
            !manual;

        qrY.disabled =
            !manual;

        if (!manual) {

            qrX.value =
                "0";

            qrY.value =
                "0";

        }
    }


    qrMode.addEventListener(
        "change",
        updateManualState
    );

    qrTarget.addEventListener(
        "change",
        () => {

            if (
                qrTarget.value ===
                "custom"
            ) {

                qrMode.value =
                    "MANUAL";

            }

            updateManualState();

        }
    );

    updateManualState();
}


// =====================================================
// QR GENERATOR
// =====================================================

async function buatQRDataURL(
    url
) {

    return await QRCode.toDataURL(
        url,
        {
            errorCorrectionLevel: "H",
            margin: 2,
            width: 600
        }
    );
}


// =====================================================
// AUTO POSITION QR
// =====================================================

function hitungPosisiQR(
    page,
    qrSize,
    target
) {

    const {
        width,
        height
    } = page.getSize();


    // ---------------------------------------------
    // TARGET SIGNATURE
    // ---------------------------------------------
    //
    // QR ditempatkan di area bawah kanan,
    // tetapi tidak menempel ke tepi halaman.
    //
    // Ini menjadi baseline AUTO untuk blok:
    //
    // Kepala Desa Guntung
    //
    // IDRIS
    //
    // ---------------------------------------------

    if (
        target ===
        "signature"
    ) {

        return {

            x:
                width
                - qrSize
                - 55,

            y:
                95

        };

    }


    // ---------------------------------------------
    // BOTTOM RIGHT
    // ---------------------------------------------

    if (
        target ===
        "bottom-right"
    ) {

        return {

            x:
                width
                - qrSize
                - 35,

            y:
                35

        };

    }


    // ---------------------------------------------
    // DEFAULT
    // ---------------------------------------------

    return {

        x:
            width
            - qrSize
            - 35,

        y:
            35

    };
}


// =====================================================
// BUAT PDF FINAL
// =====================================================

async function buatPDFFinal(
    file,
    documentId,
    qrConfig
) {

    const fileBuffer =
        await file.arrayBuffer();


    const pdfDoc =
        await PDFDocument.load(
            fileBuffer
        );


    const pages =
        pdfDoc.getPages();


    if (
        !pages.length
    ) {

        throw new Error(
            "PDF tidak memiliki halaman."
        );

    }


    const pageIndex =
        Math.max(
            0,
            Math.min(
                pages.length - 1,
                Number(
                    qrConfig.page
                ) - 1
            )
        );


    const page =
        pages[
            pageIndex
        ];


    const qrDataURL =
        await buatQRDataURL(
            qrConfig.url
        );


    const qrBase64 =
        qrDataURL.split(",")[1];


    const qrBytes =
        Uint8Array.from(
            atob(qrBase64),
            char =>
                char.charCodeAt(0)
        );


    const qrImage =
        await pdfDoc.embedPng(
            qrBytes
        );


    const qrSize =
        Number(
            qrConfig.size
        ) || 90;


    let x;
    let y;


    // ---------------------------------------------
    // AUTO
    // ---------------------------------------------

    if (
        qrConfig.mode ===
        "AUTO"
    ) {

        const posisi =
            hitungPosisiQR(
                page,
                qrSize,
                qrConfig.target
            );

        x =
            posisi.x;

        y =
            posisi.y;

    }


    // ---------------------------------------------
    // MANUAL
    // ---------------------------------------------

    else {

        x =
            Number(
                qrConfig.x
            );

        y =
            Number(
                qrConfig.y
            );

    }


    page.drawImage(
        qrImage,
        {
            x,
            y,
            width: qrSize,
            height: qrSize
        }
    );


    // ---------------------------------------------
    // METADATA PDF
    // ---------------------------------------------

    pdfDoc.setTitle(
        `SIVEDOKDes - ${documentId}`
    );

    pdfDoc.setAuthor(
        "Pemerintah Desa Guntung"
    );

    pdfDoc.setSubject(
        "Dokumen Terverifikasi SIVEDOKDes"
    );


    const finalBytes =
        await pdfDoc.save();


    return finalBytes;
}


// =====================================================
// UPLOAD PDF KE SUPABASE
// =====================================================

async function uploadPDFKeSupabase(
    pdfBytes,
    documentId
) {

    const path =
        `${SUPABASE_FOLDER}/${documentId}.pdf`;


    const {
        error
    } =
        await supabase.storage
            .from(
                SUPABASE_BUCKET
            )
            .upload(
                path,
                pdfBytes,
                {
                    contentType:
                        "application/pdf",

                    upsert:
                        true
                }
            );


    if (error) {

        throw error;

    }


    return path;
}


// =====================================================
// AMBIL URL PDF
// =====================================================

function buatURLPDF(
    path
) {

    const {
        data
    } =
        supabase.storage
            .from(
                SUPABASE_BUCKET
            )
            .getPublicUrl(
                path
            );


    return data.publicUrl;
}


// =====================================================
// QR CONFIG
// =====================================================

function ambilQRConfig(
    documentId
) {

    const qrMode =
        document.getElementById(
            "qrMode"
        );

    const qrPage =
        document.getElementById(
            "qrPage"
        );

    const qrTarget =
        document.getElementById(
            "qrTarget"
        );

    const qrSize =
        document.getElementById(
            "qrSize"
        );

    const qrX =
        document.getElementById(
            "qrX"
        );

    const qrY =
        document.getElementById(
            "qrY"
        );


    return {

        version:
            3,

        mode:
            qrMode?.value ||
            "AUTO",

        page:
            Number(
                qrPage?.value ||
                1
            ),

        target:
            qrTarget?.value ||
            "signature",

        size:
            Number(
                qrSize?.value ||
                90
            ),

        x:
            Number(
                qrX?.value ||
                0
            ),

        y:
            Number(
                qrY?.value ||
                0
            ),

        url:
            buatURLVerifikasi(
                documentId
            )
    };
}


// =====================================================
// PREVIEW QR
// =====================================================

async function tampilkanPreviewQR(
    documentId
) {

    const preview =
        document.getElementById(
            "qrPreview"
        );

    const canvas =
        document.getElementById(
            "qrCanvas"
        );

    const urlElement =
        document.getElementById(
            "qrURL"
        );


    if (
        !preview ||
        !canvas
    ) {
        return;
    }


    const url =
        buatURLVerifikasi(
            documentId
        );


    await QRCode.toCanvas(
        canvas,
        url,
        {
            errorCorrectionLevel:
                "H",

            margin:
                2,

            width:
                220
        }
    );


    if (urlElement) {

        urlElement.textContent =
            url;

    }


    preview.hidden =
        false;
}


// =====================================================
// REGISTRASI DOKUMEN
// =====================================================

async function registrasikanDokumen() {

    if (
        !jenisElement?.value
    ) {

        alert(
            "Pilih jenis dokumen terlebih dahulu."
        );

        return;

    }


    if (
        !nomorUrutElement?.value
    ) {

        alert(
            "Masukkan nomor urut surat."
        );

        return;

    }


    if (
        !tahunElement?.value
    ) {

        alert(
            "Pilih tahun."
        );

        return;

    }


    try {

        registrasiButton.disabled =
            true;

        registrasiButton.textContent =
            "Mendaftarkan...";


        const jenis =
            jenisElement.value;

        const tahun =
            Number(
                tahunElement.value
            );

        const nomorUrut =
            Number(
                nomorUrutElement.value
            );


        if (
            !Number.isInteger(
                nomorUrut
            ) ||
            nomorUrut <= 0
        ) {

            throw new Error(
                "Nomor urut surat tidak valid."
            );

        }


        const documentId =
            buatDocumentID(
                tahun,
                nomorUrut
            );


        const nomorSurat =
            nomorSuratElement.value
            || "-";


        const indeks =
            indeksElement?.value
            ?.trim() || "";


        const tanggal =
            tanggalElement?.value
            || "";


        const penandatangan =
            penandatanganElement?.value
            ?.trim()
            || "IDRIS";


        const jabatan =
            jabatanElement?.value
            ?.trim()
            || "Kepala Desa Guntung";


        const existingRef =
            doc(
                db,
                "dokumen",
                documentId
            );


        const data = {

            id:
                documentId,

            nomorUrut:

                nomorUrut,

            nomorSurat:

                nomorSurat,

            jenis:

                jenis,

            namaJenis:

                jenisElement
                    .options[
                        jenisElement
                            .selectedIndex
                    ]
                    ?.textContent
                    ?.trim()
                    || jenis,

            indeks:

                indeks,

            tahun:

                tahun,

            bulan:

                bulanElement?.value
                ? Number(
                    bulanElement.value
                )
                : null,

            tanggalTerbit:

                tanggal,

            status:

                "VALID",

            aktif:

                true,

            versi:

                1,

            penandatangan:

                penandatangan,

            jabatan:

                jabatan,


            // -----------------------------------------
            // QR
            // -----------------------------------------

            qrVersion:

                3,

            qrMode:

                "AUTO",

            qrPage:

                1,

            qrTarget:

                "signature",

            qrX:

                0,

            qrY:

                0,

            qrURL:

                buatURLVerifikasi(
                    documentId
                ),


            // -----------------------------------------
            // PDF
            // -----------------------------------------

            pdfStoragePath:

                null,

            pdfURL:

                null,


            dibuatPada:

                serverTimestamp(),

            diperbaruiPada:

                serverTimestamp(),

            dibuatOleh:

                "ADMIN"
        };


        await setDoc(
            existingRef,
            data
        );


        currentDocumentId =
            documentId;

        currentDocumentData =
            data;


        if (hasilElement) {

            hasilElement.textContent =
                documentId;

        }


        if (uploadDocumentId) {

            uploadDocumentId.textContent =
                documentId;

        }


        if (uploadPDFButton) {

            uploadPDFButton.disabled =
                false;

        }


        if (statusUpload) {

            statusUpload.textContent =
                "Dokumen terdaftar. Silakan pilih PDF.";

        }


        await tampilkanPreviewQR(
            documentId
        );


        await muatDokumenTerbaru();


        alert(
            `Dokumen berhasil diregistrasikan.\n\nDocument ID:\n${documentId}`
        );


    } catch (err) {

        console.error(
            "Registrasi gagal:",
            err
        );

        alert(
            `Registrasi gagal:\n${err.message}`
        );

    } finally {

        registrasiButton.disabled =
            false;

        registrasiButton.textContent =
            "Registrasikan Dokumen";

    }
}


// =====================================================
// UPLOAD + QR + PDF FINAL
// =====================================================

async function prosesUploadPDF() {

    if (
        !currentDocumentId
    ) {

        alert(
            "Registrasikan dokumen terlebih dahulu."
        );

        return;

    }


    if (
        !filePDF?.files?.length
    ) {

        alert(
            "Pilih file PDF terlebih dahulu."
        );

        return;

    }


    const file =
        filePDF.files[0];


    if (
        file.type !==
        "application/pdf"
    ) {

        alert(
            "File yang dipilih harus PDF."
        );

        return;

    }


    try {

        uploadPDFButton.disabled =
            true;

        uploadPDFButton.textContent =
            "Memproses PDF...";


        if (statusUpload) {

            statusUpload.textContent =
                "Membuat PDF final dengan QR verifikasi...";

        }


        currentOriginalFile =
            file;


        const qrConfig =
            ambilQRConfig(
                currentDocumentId
            );


        const finalBytes =
            await buatPDFFinal(
                file,
                currentDocumentId,
                qrConfig
            );


        if (statusUpload) {

            statusUpload.textContent =
                "Mengunggah PDF final ke Supabase Storage...";

        }


        const path =
            await uploadPDFKeSupabase(
                finalBytes,
                currentDocumentId
            );


        const pdfURL =
            buatURLPDF(
                path
            );


        // ---------------------------------------------
        // UPDATE FIRESTORE
        // ---------------------------------------------

        await updateDoc(
            doc(
                db,
                "dokumen",
                currentDocumentId
            ),
            {

                pdfStoragePath:
                    path,

                pdfURL:
                    pdfURL,

                qrVersion:
                    qrConfig.version,

                qrMode:
                    qrConfig.mode,

                qrPage:
                    qrConfig.page,

                qrX:
                    qrConfig.x,

                qrY:
                    qrConfig.y,

                qrTarget:
                    qrConfig.target,

                qrURL:
                    qrConfig.url,

                diperbaruiPada:
                    serverTimestamp()

            }
        );


        // ---------------------------------------------
        // HASIL
        // ---------------------------------------------

        if (linkPDF) {

            linkPDF.href =
                pdfURL;

            linkPDF.textContent =
                "Buka PDF Final";

        }


        if (hasilUpload) {

            hasilUpload.hidden =
                false;

        }


        if (statusUpload) {

            statusUpload.textContent =
                "PDF final berhasil disimpan.";

        }


        currentDocumentData = {

            ...currentDocumentData,

            pdfStoragePath:
                path,

            pdfURL:
                pdfURL,

            ...qrConfig

        };


        await muatDokumenTerbaru();


        alert(
            "PDF final berhasil dibuat.\n\nQR verifikasi sudah ditanam ke dalam PDF."
        );


    } catch (err) {

        console.error(
            "Upload PDF gagal:",
            err
        );

        if (statusUpload) {

            statusUpload.textContent =
                "Gagal memproses PDF.";

        }

        alert(
            `Gagal memproses PDF:\n${err.message}`
        );

    } finally {

        uploadPDFButton.disabled =
            false;

        uploadPDFButton.textContent =
            "Upload PDF";

    }
}


// =====================================================
// STATISTIK
// =====================================================

async function muatStatistik() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "dokumen"
                )
            );


        let valid =
            0;

        let dicabut =
            0;

        let dibatalkan =
            0;


        snapshot.forEach(
            item => {

                const data =
                    item.data();


                const status =
                    String(
                        data.status ||
                        ""
                    ).toUpperCase();


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

            }
        );


        if (totalDokumen) {

            totalDokumen.textContent =
                snapshot.size;

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


    } catch (err) {

        console.error(
            "Gagal memuat statistik:",
            err
        );

    }
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(
    tanggal
) {

    if (!tanggal) {

        return "-";

    }


    let date;


    if (
        typeof tanggal?.toDate ===
        "function"
    ) {

        date =
            tanggal.toDate();

    }

    else {

        date =
            new Date(tanggal);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            tanggal
        );

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
// ESCAPE HTML
// =====================================================

function escapeHTML(
    value
) {

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
// DOKUMEN TERBARU
// =====================================================

async function muatDokumenTerbaru() {

    if (
        !daftarDokumen
    ) {
        return;
    }


    try {

        const q =
            query(
                collection(
                    db,
                    "dokumen"
                ),
                orderBy(
                    "dibuatPada",
                    "desc"
                ),
                limit(10)
            );


        const snapshot =
            await getDocs(q);


        if (
            snapshot.empty
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


        let html = "";


        snapshot.forEach(
            item => {

                const data =
                    item.data();


                const status =
                    String(
                        data.status ||
                        "-"
                    ).toUpperCase();


                const pdf =
                    data.pdfURL
                        ? `
                            <a
                                href="${escapeHTML(data.pdfURL)}"
                                target="_blank"
                                rel="noopener">

                                PDF

                            </a>
                          `
                        : "-";


                html += `

                    <tr>

                        <td>
                            ${escapeHTML(
                                data.id ||
                                item.id
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                data.nomorSurat ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                data.namaJenis ||
                                data.jenis ||
                                "-"
                            )}
                        </td>

                        <td>
                            ${escapeHTML(
                                status
                            )}
                        </td>

                        <td>
                            ${pdf}
                        </td>

                        <td>
                            ${escapeHTML(
                                formatTanggal(
                                    data.tanggalTerbit
                                )
                            )}
                        </td>

                    </tr>

                `;

            }
        );


        daftarDokumen.innerHTML =
            html;


    } catch (err) {

        console.error(
            "Gagal memuat dokumen:",
            err
        );


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


// =====================================================
// EVENT
// =====================================================

if (
    jenisElement
) {

    jenisElement.addEventListener(
        "change",
        () => {

            updateIndeks();
            updateNomorSurat();

        }
    );

}


[
    nomorUrutElement,
    bulanElement,
    tahunElement
]
    .filter(Boolean)
    .forEach(
        element => {

            element.addEventListener(
                "input",
                updateNomorSurat
            );

            element.addEventListener(
                "change",
                updateNomorSurat
            );

        }
    );


if (
    registrasiButton
) {

    registrasiButton.addEventListener(
        "click",
        registrasikanDokumen
    );

}


if (
    uploadPDFButton
) {

    uploadPDFButton.addEventListener(
        "click",
        prosesUploadPDF
    );

}


// =====================================================
// FILE PDF CHANGE
// =====================================================

if (
    filePDF
) {

    filePDF.addEventListener(
        "change",
        () => {

            const file =
                filePDF.files?.[0];


            if (!file) {

                return;

            }


            if (
                file.type !==
                "application/pdf"
            ) {

                alert(
                    "File harus berformat PDF."
                );

                filePDF.value =
                    "";

                return;

            }


            if (statusUpload) {

                statusUpload.textContent =
                    `PDF siap diproses: ${file.name}`;

            }

        }
    );

}


// =====================================================
// INIT
// =====================================================

isiTahun();

updateIndeks();

updateNomorSurat();

buatQRPanel();

muatStatistik();

muatDokumenTerbaru();
