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
// ELEMENT
// =====================================================

const tombol =
    document.getElementById("registrasi");

const hasil =
    document.getElementById("hasil");

const jenis =
    document.getElementById("jenis");

const indeks =
    document.getElementById("indeks");

const nomorUrut =
    document.getElementById("nomorUrut");

const bulan =
    document.getElementById("bulan");

const tahun =
    document.getElementById("tahun");

const nomorSurat =
    document.getElementById("nomorSurat");

const tanggal =
    document.getElementById("tanggal");

const penandatangan =
    document.getElementById("penandatangan");

const jabatan =
    document.getElementById("jabatan");

const petunjukIndeks =
    document.getElementById("petunjukIndeks");


// =====================================================
// STATISTIK
// =====================================================

const totalDokumen =
    document.getElementById("totalDokumen");

const dokumenValid =
    document.getElementById("dokumenValid");

const dokumenDicabut =
    document.getElementById("dokumenDicabut");

const dokumenDibatalkan =
    document.getElementById("dokumenDibatalkan");

const daftarDokumen =
    document.getElementById("daftarDokumen");


// =====================================================
// UPLOAD
// =====================================================

const filePDF =
    document.getElementById("filePDF");

const uploadPDF =
    document.getElementById("uploadPDF");

const statusUpload =
    document.getElementById("statusUpload");

const uploadDocumentId =
    document.getElementById("uploadDocumentId");

const hasilUpload =
    document.getElementById("hasilUpload");

const linkPDF =
    document.getElementById("linkPDF");


// =====================================================
// KONSTANTA
// =====================================================

const KODE_DESA =
    "GT";

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

    const tahunSekarang =
        new Date().getFullYear();

    tahun.innerHTML = "";

    for (
        let i = tahunSekarang - 1;
        i <= tahunSekarang + 1;
        i++
    ) {

        const option =
            document.createElement("option");

        option.value = i;

        option.textContent = i;

        if (
            i === tahunSekarang
        ) {

            option.selected = true;

        }

        tahun.appendChild(option);

    }

}


// =====================================================
// DEFAULT
// =====================================================

isiPilihanTahun();

tanggal.value =
    new Date()
        .toISOString()
        .split("T")[0];


// =====================================================
// JENIS DOKUMEN
// =====================================================

jenis.addEventListener(
    "change",
    () => {

        const option =
            jenis.options[
                jenis.selectedIndex
            ];

        const kode =
            option.dataset.indeks || "";

        const manual =
            jenis.value === "MANUAL";


        if (manual) {

            indeks.readOnly =
                false;

            indeks.placeholder =
                "Masukkan indeks secara manual";

            indeks.value =
                "";

            petunjukIndeks.textContent =
                "Isi indeks sesuai ketentuan surat.";

        }

        else {

            indeks.readOnly =
                true;

            indeks.placeholder =
                "Otomatis";

            indeks.value =
                kode;

            petunjukIndeks.textContent =
                "Indeks diambil dari master SIVEDOKDes.";

        }


        buatNomorSurat();

    }
);


// =====================================================
// EVENT NOMOR SURAT
// =====================================================

indeks.addEventListener(
    "input",
    buatNomorSurat
);

nomorUrut.addEventListener(
    "input",
    buatNomorSurat
);

bulan.addEventListener(
    "change",
    buatNomorSurat
);

tahun.addEventListener(
    "change",
    buatNomorSurat
);


// =====================================================
// GENERATOR NOMOR SURAT
// =====================================================

function buatNomorSurat() {

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
// REGISTRASI
// =====================================================

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


            // =========================================
            // VALIDASI
            // =========================================

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


            if (!/^\d+$/.test(nomor)) {

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


            buatNomorSurat();


            const nomorSuratValue =
                nomorSurat.value.trim();


            if (!nomorSuratValue) {

                alert(
                    "Nomor surat belum berhasil dibuat."
                );

                return;

            }


            // =========================================
            // DISABLE
            // =========================================

            tombol.disabled =
                true;

            tombol.textContent =
                "Memproses...";


            // =========================================
            // COUNTER
            // =========================================

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
                    async (transaction) => {

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
                                data.lastNumber || 0
                            );


                        const nomorBaru =
                            nomorTerakhir + 1;


                        transaction.update(
                            counterRef,
                            {
                                lastNumber:
                                    nomorBaru
                            }
                        );


                        const tahunPendek =
                            tahunSekarang.slice(-2);


                        return `${data.prefix}-${tahunPendek}-${String(
                            nomorBaru
                        ).padStart(4, "0")}`;

                    }
                );


            // =========================================
            // DATA DOKUMEN
            // =========================================

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
                    ] || jenisValue,

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
                    1,

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


            // =========================================
            // SIMPAN FIRESTORE
            // =========================================

            await setDoc(
                doc(
                    db,
                    "dokumen",
                    documentId
                ),
                dataDokumen
            );


            // =========================================
            // DOCUMENT AKTIF
            // =========================================

            documentIdAktif =
                documentId;


            hasil.textContent =
                documentId;


            uploadDocumentId.textContent =
                documentId;


            uploadPDF.disabled =
                false;


            statusUpload.textContent =
                "Dokumen terdaftar. Silakan pilih PDF untuk diproses.";


            hasilUpload.hidden =
                true;


            filePDF.value =
                "";


            await muatDashboard();


            alert(
                `Dokumen berhasil diregistrasikan.\n\nDocument ID:\n${documentId}\n\nSekarang pilih PDF dan klik "Upload PDF".`
            );


            // =========================================
            // RESET FORM
            // =========================================

            jenis.value =
                "";

            indeks.value =
                "";

            indeks.readOnly =
                true;

            indeks.placeholder =
                "Otomatis";

            petunjukIndeks.textContent =
                "Pilih jenis dokumen";

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
                err.message ||
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


// =====================================================
// PILIH FILE
// =====================================================

filePDF.addEventListener(
    "change",
    () => {

        hasilUpload.hidden =
            true;


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


        const ukuranMB =
            file.size /
            (1024 * 1024);


        if (
            ukuranMB > 20
        ) {

            statusUpload.textContent =
                "Ukuran PDF maksimal 20 MB.";

            uploadPDF.disabled =
                true;

            return;

        }


        statusUpload.textContent =
            `File siap diproses: ${file.name} (${ukuranMB.toFixed(2)} MB)`;


        uploadPDF.disabled =
            false;

    }
);


// =====================================================
// BUAT PDF FINAL + QR
// =====================================================

async function buatPDFFinal(
    file,
    documentId
) {

    statusUpload.textContent =
        "Membaca PDF asli...";


    const arrayBuffer =
        await file.arrayBuffer();


    const pdfDoc =
        await PDFDocument.load(
            arrayBuffer
        );


    // =========================================
    // URL QR
    // =========================================

    const verifyURL =
        `${VERIFY_URL}?id=${encodeURIComponent(
            documentId
        )}`;


    // =========================================
    // GENERATE QR
    // =========================================

    statusUpload.textContent =
        "Membuat QR Document ID...";


    const qrDataURL =
        await QRCode.toDataURL(
            verifyURL,
            {
                width: 300,
                margin: 2,
                errorCorrectionLevel: "H"
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
    // SEMUA HALAMAN
    // =========================================

    const pages =
        pdfDoc.getPages();


    if (!pages.length) {

        throw new Error(
            "PDF tidak memiliki halaman."
        );

    }


    // =========================================
    // TEMPAT QR
    // =========================================

    const qrSize =
        72;

    const margin =
        20;


    const firstPage =
        pages[0];


    const {
        width,
        height
    } =
        firstPage.getSize();


    // =========================================
    // QR DI HALAMAN PERTAMA
    // =========================================

    firstPage.drawImage(
        qrImage,
        {
            x:
                width -
                qrSize -
                margin,

            y:
                height -
                qrSize -
                margin,

            width:
                qrSize,

            height:
                qrSize
        }
    );


    // =========================================
    // LABEL DOCUMENT ID
    // =========================================

    firstPage.drawText(
        documentId,
        {
            x:
                width -
                150,

            y:
                height -
                qrSize -
                margin -
                12,

            size:
                6,

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

    statusUpload.textContent =
        "Menyimpan PDF final dengan QR...";


    const finalBytes =
        await pdfDoc.save();


    return new Blob(
        [finalBytes],
        {
            type:
                "application/pdf"
        }
    );

}


// =====================================================
// UPLOAD PDF FINAL → SUPABASE
// =====================================================

uploadPDF.addEventListener(
    "click",
    async () => {

        try {

            // =========================================
            // VALIDASI DOCUMENT ID
            // =========================================

            if (!documentIdAktif) {

                alert(
                    "Belum ada Document ID aktif.\nRegistrasikan dokumen terlebih dahulu."
                );

                return;

            }


            // =========================================
            // VALIDASI FILE
            // =========================================

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
                20 * 1024 * 1024
            ) {

                alert(
                    "Ukuran PDF maksimal 20 MB."
                );

                return;

            }


            // =========================================
            // DISABLE
            // =========================================

            uploadPDF.disabled =
                true;

            filePDF.disabled =
                true;


            // =========================================
            // BUAT PDF FINAL
            // =========================================

            const pdfFinal =
                await buatPDFFinal(
                    file,
                    documentIdAktif
                );


            // =========================================
            // STORAGE PATH
            // =========================================

            const storagePath =
                `dokumen/${documentIdAktif}/document-final.pdf`;


            // =========================================
            // UPLOAD SUPABASE
            // =========================================

            statusUpload.textContent =
                "Meng-upload PDF final ke Supabase Storage...";


            const {
                error: uploadError
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


            // =========================================
            // SIMPAN FIRESTORE
            // =========================================

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
                        2

                },
                {
                    merge:
                        true
                }
            );


            // =========================================
            // BUAT SIGNED URL
            // =========================================

            const signedURL =
                await buatSignedURL(
                    storagePath
                );


            // =========================================
            // HASIL
            // =========================================

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
                `PDF berhasil diproses.\n\nDocument ID:\n${documentIdAktif}\n\nQR telah ditempel ke PDF final.`
            );

        }

        catch (err) {

            console.error(
                "Upload PDF gagal:",
                err
            );


            let pesan =
                err.message ||
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


        return data.signedUrl;

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
            (item) => {

                const data =
                    item.data();


                total++;


                const status =
                    String(
                        data.status || ""
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


                dokumen.push({

                    id:
                        data.id ||
                        item.id,

                    nomorSurat:
                        data.nomorSurat ||
                        "-",

                    jenis:
                        data.namaJenis ||
                        data.jenis ||
                        "-",

                    status:
                        data.status ||
                        "-",

                    tanggal:
                        data.tanggalTerbit ||
                        "-",

                    pdfStoragePath:
                        data.pdfStoragePath ||
                        null,

                    pdfUploaded:
                        data.pdfUploaded ||
                        false

                });

            }
        );


        // =========================================
        // STATISTIK
        // =========================================

        totalDokumen.textContent =
            total;

        dokumenValid.textContent =
            valid;

        dokumenDicabut.textContent =
            dicabut;

        dokumenDibatalkan.textContent =
            dibatalkan;


        // =========================================
        // SORT
        // =========================================

        dokumen.sort(
            (a, b) =>
                b.id.localeCompare(
                    a.id
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
                    async (data) => {

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
                    (data) => {

                        let warnaStatus =
                            "#6b7280";


                        const statusUpper =
                            String(
                                data.status
                            ).toUpperCase();


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
                                    rel="noopener">

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


        totalDokumen.textContent =
            "-";

        dokumenValid.textContent =
            "-";

        dokumenDicabut.textContent =
            "-";

        dokumenDibatalkan.textContent =
            "-";


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
// JALANKAN
// =====================================================

muatDashboard();
