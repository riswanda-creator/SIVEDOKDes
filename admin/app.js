// =====================================================
// SIVEDOKDes
// ADMINISTRATOR APP
// Desa Guntung
// =====================================================

import {
    db,
    doc,
    setDoc,
    serverTimestamp,
    collection,
    getDocs,
    getDoc,
    query,
    orderBy,
    limit
} from "../js/firebase.js";

import {
    supabase
} from "../js/supabase.js";


// =====================================================
// KONFIGURASI
// =====================================================

const DESA = {
    kodeWilayah: "1219062002",
    kodeDesa: "GT",
    nama: "Desa Guntung",
    kecamatan: "Tanjung Tiram",
    kabupaten: "Batu Bara"
};

const SUPABASE_BUCKET = "sivedokdes-pdf";
const SUPABASE_FOLDER = "dokumen";


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
// DATA JENIS DOKUMEN
// =====================================================

const DATA_JENIS = {

    DOMISILI: {
        nama: "Surat Keterangan Domisili",
        indeks: "470"
    },

    MENIKAH: {
        nama: "Surat Keterangan Menikah",
        indeks: "472.2"
    },

    PINDAH: {
        nama: "Surat Keterangan Pindah",
        indeks: "471.2"
    },

    SKU: {
        nama: "Surat Keterangan Usaha",
        indeks: "500"
    },

    SKTM: {
        nama: "Surat Keterangan Tidak Mampu",
        indeks: "401"
    },

    PENGHASILAN: {
        nama: "Surat Keterangan Penghasilan",
        indeks: "500"
    },

    UNDANGAN: {
        nama: "Surat Undangan",
        indeks: "005"
    },

    MANUAL: {
        nama: "Lainnya / Manual",
        indeks: ""
    }

};


// =====================================================
// UTILITAS
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
// PAD NOMOR
// =====================================================

function padNomor(value, panjang = 3) {

    return String(value)
        .replace(/\D/g, "")
        .padStart(panjang, "0");
}


// =====================================================
// TAHUN 2 DIGIT
// =====================================================

function tahunDuaDigit(tahun) {

    return String(tahun).slice(-2);
}


// =====================================================
// BULAN INDONESIA
// =====================================================

function namaBulanIndonesia(bulan) {

    const nama = [
        "",
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember"
    ];

    return nama[Number(bulan)] || "-";
}


// =====================================================
// BULAN ROMAWI
// =====================================================

function bulanRomawi(bulan) {

    const romawi = [
        "",
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII"
    ];

    return romawi[Number(bulan)] || "";
}


// =====================================================
// FORMAT TANGGAL
// =====================================================

function formatTanggal(value) {

    if (!value) {
        return "-";
    }

    let date;

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        date = value.toDate();

    } else {

        date = new Date(value);

    }

    if (Number.isNaN(date.getTime())) {

        return String(value);

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

function statusText(status) {

    const value =
        String(status || "")
            .toUpperCase();

    if (value === "VALID") {
        return "VALID";
    }

    if (value === "DICABUT") {
        return "DICABUT";
    }

    if (value === "DIBATALKAN") {
        return "DIBATALKAN";
    }

    return value || "-";
}


// =====================================================
// URL VERIFIKASI
// =====================================================

function buatURLVerifikasi(documentId) {

    return new URL(
        `/verify.html?id=${encodeURIComponent(documentId)}`,
        window.location.origin
    ).href;
}


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
        let tahun = tahunSekarang - 2;
        tahun <= tahunSekarang + 1;
        tahun++
    ) {

        const option =
            document.createElement("option");

        option.value =
            String(tahun);

        option.textContent =
            String(tahun);

        if (tahun === tahunSekarang) {

            option.selected = true;

        }

        tahunElement.appendChild(option);

    }

}


// =====================================================
// INDEKS DOKUMEN
// =====================================================

function updateIndeks() {

    if (!jenisElement || !indeksElement) {
        return;
    }

    const jenis =
        jenisElement.value;

    const data =
        DATA_JENIS[jenis];


    // =================================================
    // MANUAL
    // =================================================

    if (jenis === "MANUAL") {

        indeksElement.value = "";

        indeksElement.readOnly = false;

        indeksElement.disabled = false;

        indeksElement.placeholder =
            "Masukkan indeks / kode klasifikasi";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Indeks harus diisi secara manual.";

        }

        return;

    }


    // =================================================
    // JENIS OTOMATIS
    // =================================================

    indeksElement.readOnly = true;

    indeksElement.disabled = false;

    indeksElement.placeholder =
        "Otomatis";


    if (data) {

        indeksElement.value =
            data.indeks || "";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Indeks diisi otomatis berdasarkan jenis dokumen.";

        }

    } else {

        indeksElement.value = "";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Pilih jenis dokumen.";

        }

    }

}


// =====================================================
// NOMOR URUT SURAT TERAKHIR
// =====================================================

async function getNomorSuratTerakhir() {

    const q =
        query(
            collection(db, "dokumen"),
            orderBy("nomorUrut", "desc"),
            limit(1)
        );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return 1;
    }

    const terakhir =
        Number(
            snapshot.docs[0]
                .data()
                .nomorUrut
        );

    if (!Number.isFinite(terakhir)) {
        return 1;
    }

    return terakhir + 1;
}


// =====================================================
// NOMOR DOKUMEN INTERNAL TERAKHIR
// =====================================================

async function getNomorDokumenTerakhir() {

    const q =
        query(
            collection(db, "dokumen"),
            orderBy("nomorDokumenUrut", "desc"),
            limit(1)
        );

    const snapshot =
        await getDocs(q);

    if (snapshot.empty) {
        return 1;
    }

    const terakhir =
        Number(
            snapshot.docs[0]
                .data()
                .nomorDokumenUrut
        );

    if (!Number.isFinite(terakhir)) {
        return 1;
    }

    return terakhir + 1;
}


// =====================================================
// BUAT DOCUMENT ID
// =====================================================
//
// INI SENGAJA DIPISAH DARI NOMOR SURAT.
//
// Contoh:
// GT-2026-DOC-000001
//
// Nomor surat bisa:
// 470/005/GT/VIII/2026
//
// Nomor 005 tidak memengaruhi DOC-000001.
// =====================================================

async function buatDocumentId(tahun) {

    const nomorDokumenUrut =
        await getNomorDokumenTerakhir();

    const documentId =
        `${DESA.kodeDesa}-${tahun}-DOC-${String(
            nomorDokumenUrut
        ).padStart(6, "0")}`;

    return {
        documentId,
        nomorDokumenUrut
    };
}


// =====================================================
// BUAT NOMOR SURAT
// =====================================================

function buatNomorSurat() {

    if (
        !nomorUrutElement ||
        !jenisElement ||
        !bulanElement ||
        !tahunElement ||
        !indeksElement
    ) {

        return "";

    }

    const nomorUrut =
        nomorUrutElement.value.trim();

    const jenis =
        jenisElement.value;

    const bulan =
        bulanElement.value;

    const tahun =
        tahunElement.value;

    const indeks =
        indeksElement.value.trim();


    if (
        !nomorUrut ||
        !jenis ||
        !bulan ||
        !tahun ||
        !indeks
    ) {

        return "";

    }


    const bulanRomawiValue =
        bulanRomawi(bulan);


    if (!bulanRomawiValue) {
        return "";
    }


    return `${indeks}/${padNomor(nomorUrut)}/${DESA.kodeDesa}/${bulanRomawiValue}/${tahun}`;
}


// =====================================================
// UPDATE NOMOR SURAT
// =====================================================

function updateNomorSurat() {

    if (!nomorSuratElement) {
        return;
    }

    nomorSuratElement.value =
        buatNomorSurat();

}


// =====================================================
// AMBIL SEMUA DOKUMEN
// =====================================================

async function ambilSemuaDokumen() {

    const snapshot =
        await getDocs(
            collection(db, "dokumen")
        );

    return snapshot.docs.map(
        item => ({
            id: item.id,
            ...item.data()
        })
    );

}


// =====================================================
// STATISTIK
// =====================================================

async function muatStatistik() {

    if (!totalDokumen) {
        return;
    }

    try {

        const dokumen =
            await ambilSemuaDokumen();

        let valid = 0;
        let dicabut = 0;
        let dibatalkan = 0;


        dokumen.forEach(item => {

            const status =
                String(
                    item.status || ""
                ).toUpperCase();


            if (status === "VALID") {
                valid++;
            }


            if (status === "DICABUT") {
                dicabut++;
            }


            if (status === "DIBATALKAN") {
                dibatalkan++;
            }

        });


        totalDokumen.textContent =
            String(dokumen.length);

        if (dokumenValid) {

            dokumenValid.textContent =
                String(valid);

        }

        if (dokumenDicabut) {

            dokumenDicabut.textContent =
                String(dicabut);

        }

        if (dokumenDibatalkan) {

            dokumenDibatalkan.textContent =
                String(dibatalkan);

        }

    }

    catch (err) {

        console.error(
            "Gagal memuat statistik:",
            err
        );


        totalDokumen.textContent =
            "0";

        if (dokumenValid) {
            dokumenValid.textContent = "0";
        }

        if (dokumenDicabut) {
            dokumenDicabut.textContent = "0";
        }

        if (dokumenDibatalkan) {
            dokumenDibatalkan.textContent = "0";
        }

    }

}


// =====================================================
// DAFTAR DOKUMEN
// =====================================================

async function muatDaftarDokumen() {

    if (!daftarDokumen) {
        return;
    }

    try {

        const q =
            query(
                collection(db, "dokumen"),
                orderBy("nomorUrut", "desc"),
                limit(10)
            );


        const snapshot =
            await getDocs(q);


        daftarDokumen.innerHTML = "";


        if (snapshot.empty) {

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


        snapshot.forEach(
            snapshotDoc => {

                const data =
                    snapshotDoc.data();


                const tr =
                    document.createElement("tr");


                const pdfAda =
                    !!data.pdfURL;


                tr.innerHTML = `

                    <td>
                        ${escapeHTML(
                            data.id ||
                            snapshotDoc.id
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
                            DATA_JENIS[
                                data.jenis
                            ]?.nama
                            ||
                            data.namaJenis
                            ||
                            data.jenis
                            ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            statusText(
                                data.status
                            )
                        )}
                    </td>

                    <td>
                        ${
                            pdfAda
                            ?
                            `<a
                                class="pdf-link"
                                href="${escapeHTML(
                                    data.pdfURL
                                )}"
                                target="_blank"
                                rel="noopener">
                                Lihat PDF
                            </a>`
                            :
                            "Belum ada"
                        }
                    </td>

                    <td>
                        ${escapeHTML(
                            formatTanggal(
                                data.tanggalTerbit
                            )
                        )}
                    </td>

                `;


                daftarDokumen.appendChild(tr);

            }
        );

    }

    catch (err) {

        console.error(
            "Gagal memuat daftar dokumen:",
            err
        );


        daftarDokumen.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="text-align:center;">
                    Gagal memuat data dokumen.
                </td>
            </tr>
        `;

    }

}


// =====================================================
// REFRESH DASHBOARD
// =====================================================

async function refreshDashboard() {

    await Promise.all([
        muatStatistik(),
        muatDaftarDokumen()
    ]);

}


// =====================================================
// REGISTRASI DOKUMEN
// =====================================================

async function registrasikanDokumen() {

    if (!registrasiButton) {
        return;
    }


    try {

        registrasiButton.disabled = true;

        registrasiButton.textContent =
            "Memproses...";


        const jenis =
            jenisElement?.value || "";

        const indeks =
            indeksElement?.value.trim() || "";

        const tahun =
            tahunElement?.value || "";

        const bulan =
            bulanElement?.value || "";

        const tanggal =
            tanggalElement?.value || "";

        const penandatangan =
            penandatanganElement?.value.trim()
            || "IDRIS";

        const jabatan =
            jabatanElement?.value.trim()
            || "Kepala Desa Guntung";


        // =============================================
        // VALIDASI
        // =============================================

        if (!jenis) {

            alert(
                "Silakan pilih jenis dokumen."
            );

            return;

        }


        if (!indeks) {

            alert(
                jenis === "MANUAL"
                    ? "Silakan isi indeks / kode klasifikasi secara manual."
                    : "Indeks dokumen belum tersedia."
            );

            return;

        }


        if (!tahun) {

            alert(
                "Silakan pilih tahun."
            );

            return;

        }


        if (!bulan) {

            alert(
                "Silakan pilih bulan."
            );

            return;

        }


        if (!tanggal) {

            alert(
                "Silakan pilih tanggal terbit."
            );

            return;

        }


        // =============================================
        // NOMOR URUT SURAT
        // =============================================

        let nomorUrut =
            Number(
                nomorUrutElement?.value
            );


        if (
            !Number.isInteger(nomorUrut) ||
            nomorUrut < 1
        ) {

            nomorUrut =
                await getNomorSuratTerakhir();


            if (nomorUrutElement) {

                nomorUrutElement.value =
                    nomorUrut;

            }

        }


        // =============================================
        // BULAN ROMAWI
        // =============================================

        const bulanRomawiValue =
            bulanRomawi(bulan);


        if (!bulanRomawiValue) {

            alert(
                "Bulan tidak valid."
            );

            return;

        }


        // =============================================
        // NOMOR SURAT RESMI
        // =============================================

        const nomorSurat =
            `${indeks}/${padNomor(nomorUrut)}/${DESA.kodeDesa}/${bulanRomawiValue}/${tahun}`;


        if (nomorSuratElement) {

            nomorSuratElement.value =
                nomorSurat;

        }


        // =============================================
        // DOCUMENT ID TERPISAH
        // =============================================

        const {
            documentId,
            nomorDokumenUrut
        } =
            await buatDocumentId(tahun);


        // =============================================
        // DATA FIRESTORE
        // =============================================

        const dataDokumen = {

            id: documentId,

            // Nomor urut resmi surat
            nomorUrut,

            // Nomor internal SIVEDOKDes
            nomorDokumenUrut,

            nomorSurat,

            jenis,

            namaJenis:
                DATA_JENIS[jenis]?.nama
                ||
                "Lainnya / Manual",

            indeks,

            tahun:
                Number(tahun),

            bulan:
                Number(bulan),

            namaBulan:
                namaBulanIndonesia(bulan),

            bulanRomawi:
                bulanRomawiValue,

            tanggalTerbit:
                tanggal,

            status:
                "VALID",

            aktif:
                true,

            versi:
                1,

            penandatangan,

            jabatan,

            dibuatOleh:
                "ADMIN",

            dibuatPada:
                serverTimestamp(),

            diperbaruiPada:
                serverTimestamp()

        };


        // =============================================
        // SIMPAN
        // =============================================

        await setDoc(
            doc(
                db,
                "dokumen",
                documentId
            ),
            dataDokumen
        );


        // =============================================
        // HASIL
        // =============================================

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
                "Dokumen berhasil diregistrasikan. Silakan pilih PDF.";

        }


        alert(
            `Dokumen berhasil diregistrasikan.\n\n` +
            `Document ID:\n${documentId}\n\n` +
            `Nomor Surat:\n${nomorSurat}`
        );


        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "Gagal registrasi dokumen:",
            err
        );


        alert(
            "Gagal mendaftarkan dokumen:\n\n" +
            (
                err?.message ||
                "Terjadi kesalahan."
            )
        );

    }

    finally {

        registrasiButton.disabled =
            false;

        registrasiButton.textContent =
            "Registrasikan Dokumen";

    }

}


// =====================================================
// LOAD QR CODE MODULE
// =====================================================
//
// QR tidak di-import saat dashboard pertama dibuka.
// Jadi kalau CDN QR bermasalah, dashboard tetap bekerja.
// =====================================================

async function loadQRCodeModule() {

    const module =
        await import(
            "https://esm.sh/qrcode@1.5.4"
        );

    return module.default || module;
}


// =====================================================
// LOAD PDF-LIB MODULE
// =====================================================

async function loadPDFLib() {

    const module =
        await import(
            "https://esm.sh/pdf-lib@1.17.1"
        );

    return module;
}


// =====================================================
// BUAT QR CODE
// =====================================================

async function buatQRCode(documentId) {

    const QRCode =
        await loadQRCodeModule();


    const url =
        buatURLVerifikasi(
            documentId
        );


    const qrDataURL =
        await QRCode.toDataURL(
            url,
            {
                errorCorrectionLevel:
                    "H",

                margin:
                    1,

                width:
                    500
            }
        );


    return {
        url,
        qrDataURL
    };

}


// =====================================================
// TEMPEL QR KE PDF
// =====================================================

async function buatPDFFinal(
    file,
    documentId
) {

    const {
        PDFDocument
    } =
        await loadPDFLib();


    const {
        url,
        qrDataURL
    } =
        await buatQRCode(
            documentId
        );


    // =============================================
    // BACA PDF
    // =============================================

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


    // =============================================
    // HALAMAN TERAKHIR
    // =============================================

    const page =
        pages[pages.length - 1];


    const {
        width,
        height
    } =
        page.getSize();


    // =============================================
    // QR
    // =============================================

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


    // =============================================
    // UKURAN QR
    // =============================================

    const qrSize =
        Math.min(
            95,
            width * 0.16
        );


    const marginRight =
        42;

    const marginBottom =
        42;


    const qrX =
        width -
        qrSize -
        marginRight;


    const qrY =
        marginBottom;


    // =============================================
    // GAMBAR QR
    // =============================================

    page.drawImage(
        qrImage,
        {
            x:
                qrX,

            y:
                qrY,

            width:
                qrSize,

            height:
                qrSize
        }
    );


    // =============================================
    // SAVE
    // =============================================

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
        verifyURL:
            url
    };

}


// =====================================================
// UPLOAD PDF
// =====================================================

async function uploadDokumenPDF() {

    try {

        const documentId =
            uploadDocumentId?.textContent.trim();


        if (
            !documentId ||
            documentId ===
            "Belum ada Document ID."
        ) {

            alert(
                "Registrasikan dokumen terlebih dahulu."
            );

            return;

        }


        const file =
            filePDF?.files?.[0];


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
                "File yang dipilih harus PDF."
            );

            return;

        }


        if (uploadPDFButton) {

            uploadPDFButton.disabled =
                true;

            uploadPDFButton.textContent =
                "Memproses PDF...";

        }


        if (statusUpload) {

            statusUpload.textContent =
                "Menyimpan PDF asli...";

        }


        // =============================================
        // FOLDER
        // =============================================

        const folderDokumen =
            `${SUPABASE_FOLDER}/${documentId}`;


        // =============================================
        // ORIGINAL
        // =============================================

        const originalPath =
            `${folderDokumen}/original.pdf`;


        const {
            error:
                originalUploadError
        } =
            await supabase
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .upload(
                    originalPath,
                    file,
                    {
                        contentType:
                            "application/pdf",

                        upsert:
                            true
                    }
                );


        if (originalUploadError) {

            throw originalUploadError;

        }


        // =============================================
        // FINAL PDF
        // =============================================

        if (statusUpload) {

            statusUpload.textContent =
                "Membuat QR Verifikasi dan PDF final...";

        }


        const {
            finalFile,
            verifyURL
        } =
            await buatPDFFinal(
                file,
                documentId
            );


        const finalPath =
            `${folderDokumen}/final.pdf`;


        const {
            error:
                finalUploadError
        } =
            await supabase
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .upload(
                    finalPath,
                    finalFile,
                    {
                        contentType:
                            "application/pdf",

                        upsert:
                            true
                    }
                );


        if (finalUploadError) {

            throw finalUploadError;

        }


        // =============================================
        // SIGNED URL
        // =============================================

        const {
            data:
                signedData,

            error:
                signedError
        } =
            await supabase
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .createSignedUrl(
                    finalPath,
                    60 * 60 * 24 * 365 * 10
                );


        if (signedError) {

            throw signedError;

        }


        const pdfURL =
            signedData?.signedUrl;


        if (!pdfURL) {

            throw new Error(
                "URL PDF final tidak berhasil dibuat."
            );

        }


        // =============================================
        // FIRESTORE
        // =============================================

        await setDoc(
            doc(
                db,
                "dokumen",
                documentId
            ),
            {

                pdfURL,

                pdfStoragePath:
                    finalPath,

                pdfOriginalStoragePath:
                    originalPath,

                pdfNamaFile:
                    "final.pdf",

                pdfOriginalNamaFile:
                    "original.pdf",

                qrURL:
                    verifyURL,

                qrDocumentId:
                    documentId,

                qrDibuat:
                    true,

                pdfDiunggahPada:
                    serverTimestamp(),

                diperbaruiPada:
                    serverTimestamp()

            },
            {
                merge:
                    true
            }
        );


        // =============================================
        // HASIL
        // =============================================

        if (hasilUpload) {

            hasilUpload.hidden =
                false;

        }


        if (linkPDF) {

            linkPDF.href =
                pdfURL;

            linkPDF.textContent =
                "Buka PDF Final";

        }


        if (statusUpload) {

            statusUpload.textContent =
                "PDF final berhasil dibuat dengan QR Verifikasi.";

        }


        alert(
            "BERHASIL.\n\n" +
            "PDF asli disimpan sebagai original.pdf.\n" +
            "PDF final + QR disimpan sebagai final.pdf.\n\n" +
            "QR mengarah ke:\n" +
            verifyURL
        );


        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "Gagal upload PDF:",
            err
        );


        if (statusUpload) {

            statusUpload.textContent =
                "Gagal memproses PDF.";

        }


        alert(
            "Gagal memproses PDF:\n\n" +
            (
                err?.message ||
                "Terjadi kesalahan."
            )
        );

    }

    finally {

        if (uploadPDFButton) {

            uploadPDFButton.disabled =
                false;

            uploadPDFButton.textContent =
                "Upload PDF";

        }

    }

}


// =====================================================
// EVENT JENIS
// =====================================================

if (jenisElement) {

    jenisElement.addEventListener(
        "change",
        () => {

            updateIndeks();
            updateNomorSurat();

        }
    );

}


// =====================================================
// EVENT NOMOR URUT
// =====================================================

if (nomorUrutElement) {

    nomorUrutElement.addEventListener(
        "input",
        updateNomorSurat
    );

}


// =====================================================
// EVENT BULAN
// =====================================================

if (bulanElement) {

    bulanElement.addEventListener(
        "change",
        updateNomorSurat
    );

}


// =====================================================
// EVENT TAHUN
// =====================================================

if (tahunElement) {

    tahunElement.addEventListener(
        "change",
        updateNomorSurat
    );

}


// =====================================================
// EVENT INDEKS
// =====================================================

if (indeksElement) {

    indeksElement.addEventListener(
        "input",
        updateNomorSurat
    );

}


// =====================================================
// EVENT REGISTRASI
// =====================================================

if (registrasiButton) {

    registrasiButton.addEventListener(
        "click",
        registrasikanDokumen
    );

}


// =====================================================
// EVENT UPLOAD
// =====================================================

if (uploadPDFButton) {

    uploadPDFButton.addEventListener(
        "click",
        uploadDokumenPDF
    );

}


// =====================================================
// INIT
// =====================================================

async function init() {

    try {

        // Jalankan fungsi UI terlebih dahulu.
        // Jangan biarkan statistik/database
        // menghalangi form tampil.

        isiTahun();

        updateIndeks();

        updateNomorSurat();


        // Kemudian database.

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "Gagal menginisialisasi dashboard:",
            err
        );

    }

}


// =====================================================
// JALANKAN
// =====================================================

init();
