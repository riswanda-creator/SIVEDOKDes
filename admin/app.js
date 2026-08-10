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


function padNomor(value, panjang = 3) {

    return String(value)
        .replace(/\D/g, "")
        .padStart(panjang, "0");

}


function tahunDuaDigit(tahun) {

    return String(tahun).slice(-2);

}


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

        if (
            tahun === tahunSekarang
        ) {

            option.selected = true;

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

    const jenis =
        jenisElement.value;

    const data =
        DATA_JENIS[jenis];

    // =============================================
    // MANUAL
    // =============================================

    if (jenis === "MANUAL") {

        indeksElement.readOnly = false;

        indeksElement.value = "";

        indeksElement.placeholder =
            "Masukkan indeks / kode klasifikasi";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Indeks harus diisi secara manual.";

        }

        return;

    }


    // =============================================
    // OTOMATIS
    // =============================================

    indeksElement.readOnly = true;

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
// NOMOR URUT TERAKHIR
// =====================================================

async function getNomorTerakhir() {

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

    if (
        !Number.isFinite(terakhir)
    ) {

        return 1;

    }

    return terakhir + 1;

}


// =====================================================
// NOMOR SURAT
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

    return `${indeks}/${padNomor(nomorUrut)}/${DESA.kodeDesa}/${String(bulan).padStart(2, "0")}/${tahun}`;

}


// =====================================================
// UPDATE NOMOR SURAT
// =====================================================

function updateNomorSurat() {

    if (!nomorSuratElement) {
        return;
    }

    const nomorSurat =
        buatNomorSurat();

    nomorSuratElement.value =
        nomorSurat;

}


// =====================================================
// AMBIL DATA DOKUMEN
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

            if (
                status === "VALID"
            ) {

                valid++;

            }

            if (
                status === "DICABUT"
            ) {

                dicabut++;

            }

            if (
                status === "DIBATALKAN"
            ) {

                dibatalkan++;

            }

        });

        if (totalDokumen) {

            totalDokumen.textContent =
                dokumen.length;

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

    }

    catch (err) {

        console.error(
            "Gagal memuat statistik:",
            err
        );

        if (totalDokumen) {
            totalDokumen.textContent = "0";
        }

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
                            data.id || snapshotDoc.id
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            data.nomorSurat || "-"
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
                                href="${escapeHTML(data.pdfURL)}"
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

                daftarDokumen.appendChild(
                    tr
                );

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


        // =============================================
        // DATA FORM
        // =============================================

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
        // NOMOR URUT
        // =============================================

        let nomorUrut =
            Number(
                nomorUrutElement?.value
            );

        if (
            !Number.isInteger(
                nomorUrut
            ) ||
            nomorUrut < 1
        ) {

            nomorUrut =
                await getNomorTerakhir();

            if (nomorUrutElement) {

                nomorUrutElement.value =
                    nomorUrut;

            }

        }


        // =============================================
        // NOMOR SURAT
        // =============================================

        const nomorSurat =
            `${indeks}/${padNomor(nomorUrut)}/${DESA.kodeDesa}/${String(bulan).padStart(2, "0")}/${tahun}`;


        if (nomorSuratElement) {

            nomorSuratElement.value =
                nomorSurat;

        }


        // =============================================
        // DOCUMENT ID
        // =============================================

        const documentId =
            `${DESA.kodeWilayah}-${tahunDuaDigit(tahun)}-${String(nomorUrut).padStart(4, "0")}`;


        // =============================================
        // DATA FIRESTORE
        // =============================================

        const dataDokumen = {

            id: documentId,

            nomorUrut: nomorUrut,

            nomorSurat: nomorSurat,

            jenis: jenis,

            namaJenis:
                DATA_JENIS[jenis]?.nama
                ||
                "Lainnya / Manual",

            indeks: indeks,

            tahun:
                Number(tahun),

            bulan:
                Number(bulan),

            namaBulan:
                namaBulanIndonesia(bulan),

            tanggalTerbit:
                tanggal,

            status: "VALID",

            aktif: true,

            versi: 1,

            penandatangan:
                penandatangan,

            jabatan:
                jabatan,

            dibuatOleh:
                "ADMIN",

            dibuatPada:
                serverTimestamp(),

            diperbaruiPada:
                serverTimestamp()

        };


        // =============================================
        // SIMPAN FIRESTORE
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
            `Dokumen berhasil diregistrasikan.\n\nDocument ID:\n${documentId}`
        );


        // =============================================
        // REFRESH
        // =============================================

        await refreshDashboard();

    }

    catch (err) {

        console.error(
            "Gagal registrasi dokumen:",
            err
        );

        alert(
            "Gagal mendaftarkan dokumen:\n\n"
            +
            (
                err?.message
                ||
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
                "Mengunggah...";

        }


        if (statusUpload) {

            statusUpload.textContent =
                "Mengunggah PDF ke penyimpanan...";

        }


        // =============================================
        // NAMA FILE
        // =============================================

        const namaFile =
            `${documentId}.pdf`;

        const pathFile =
            `${SUPABASE_FOLDER}/${namaFile}`;


        // =============================================
        // UPLOAD SUPABASE
        // =============================================

        const {
            error: uploadError
        } =
            await supabase
                .storage
                .from(SUPABASE_BUCKET)
                .upload(
                    pathFile,
                    file,
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


        // =============================================
        // SIGNED URL
        // =============================================

        const {
            data: signedData,
            error: signedError
        } =
            await supabase
                .storage
                .from(SUPABASE_BUCKET)
                .createSignedUrl(
                    pathFile,
                    60 * 60 * 24 * 365 * 10
                );


        if (signedError) {

            throw signedError;

        }


        const pdfURL =
            signedData?.signedUrl;


        if (!pdfURL) {

            throw new Error(
                "URL PDF tidak berhasil dibuat."
            );

        }


        // =============================================
        // SIMPAN URL KE FIRESTORE
        // =============================================

        await setDoc(
            doc(
                db,
                "dokumen",
                documentId
            ),
            {

                pdfURL:
                    pdfURL,

                pdfStoragePath:
                    pathFile,

                pdfNamaFile:
                    namaFile,

                pdfDiunggahPada:
                    serverTimestamp(),

                diperbaruiPada:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );


        // =============================================
        // TAMPILKAN HASIL
        // =============================================

        if (hasilUpload) {

            hasilUpload.hidden =
                false;

        }


        if (linkPDF) {

            linkPDF.href =
                pdfURL;

            linkPDF.textContent =
                "Buka PDF";

        }


        if (statusUpload) {

            statusUpload.textContent =
                "PDF berhasil disimpan.";

        }


        alert(
            "PDF berhasil diunggah dan dikaitkan dengan dokumen."
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
                "Gagal mengunggah PDF.";

        }

        alert(
            "Gagal mengunggah PDF:\n\n"
            +
            (
                err?.message
                ||
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
// EVENT JENIS DOKUMEN
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
// EVENT FORM
// =====================================================

if (nomorUrutElement) {

    nomorUrutElement.addEventListener(
        "input",
        updateNomorSurat
    );

}

if (bulanElement) {

    bulanElement.addEventListener(
        "change",
        updateNomorSurat
    );

}

if (tahunElement) {

    tahunElement.addEventListener(
        "change",
        updateNomorSurat
    );

}

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
// INISIALISASI
// =====================================================

async function init() {

    try {

        isiTahun();

        updateIndeks();

        updateNomorSurat();

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
