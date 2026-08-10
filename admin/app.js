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


import {
    generatePDFWithQR
} from "../api/generate-pdf.js";


// =====================================================
// KONFIGURASI
// =====================================================

const DESA = {

    kodeWilayah:
        "1219062002",

    kodeDesa:
        "GT",

    nama:
        "Desa Guntung",

    kecamatan:
        "Tanjung Tiram",

    kabupaten:
        "Batu Bara"

};


const SUPABASE_BUCKET =
    "sivedokdes-pdf";


const SUPABASE_FOLDER =
    "dokumen";


// =====================================================
// ELEMENT
// =====================================================

const jenisElement =
    document.getElementById(
        "jenis"
    );


const indeksElement =
    document.getElementById(
        "indeks"
    );


const petunjukIndeks =
    document.getElementById(
        "petunjukIndeks"
    );


const nomorUrutElement =
    document.getElementById(
        "nomorUrut"
    );


const kodeKomponenElement =
    document.getElementById(
        "kodeKomponen"
    );


const bulanElement =
    document.getElementById(
        "bulan"
    );


const tahunElement =
    document.getElementById(
        "tahun"
    );


const nomorSuratElement =
    document.getElementById(
        "nomorSurat"
    );


const tanggalElement =
    document.getElementById(
        "tanggal"
    );


const penandatanganElement =
    document.getElementById(
        "penandatangan"
    );


const jabatanElement =
    document.getElementById(
        "jabatan"
    );


const registrasiButton =
    document.getElementById(
        "registrasi"
    );


const hasilElement =
    document.getElementById(
        "hasil"
    );


const uploadDocumentId =
    document.getElementById(
        "uploadDocumentId"
    );


const filePDF =
    document.getElementById(
        "filePDF"
    );


const uploadPDFButton =
    document.getElementById(
        "uploadPDF"
    );


const statusUpload =
    document.getElementById(
        "statusUpload"
    );


const hasilUpload =
    document.getElementById(
        "hasilUpload"
    );


const linkPDF =
    document.getElementById(
        "linkPDF"
    );


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
// DATA JENIS DOKUMEN
// =====================================================

const DATA_JENIS = {

    DOMISILI: {

        nama:
            "Surat Keterangan Domisili",

        indeks:
            "470"

    },


    MENIKAH: {

        nama:
            "Surat Keterangan Menikah",

        indeks:
            "472.2"

    },


    PINDAH: {

        nama:
            "Surat Keterangan Pindah",

        indeks:
            "471.2"

    },


    SKU: {

        nama:
            "Surat Keterangan Usaha",

        indeks:
            "500"

    },


    SKTM: {

        nama:
            "Surat Keterangan Tidak Mampu",

        indeks:
            "401"

    },


    PENGHASILAN: {

        nama:
            "Surat Keterangan Penghasilan",

        indeks:
            "500"

    },


    UNDANGAN: {

        nama:
            "Surat Undangan",

        indeks:
            "005"

    },


    MANUAL: {

        nama:
            "Lainnya / Manual",

        indeks:
            ""

    }

};


// =====================================================
// UTILITAS
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


function padNomor(
    value,
    panjang = 3
) {

    return String(
        value
    )
        .replace(
            /\D/g,
            ""
        )
        .padStart(
            panjang,
            "0"
        );

}


function tahunDuaDigit(
    tahun
) {

    return String(
        tahun
    ).slice(-2);

}


function namaBulanIndonesia(
    bulan
) {

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

    return (
        nama[
            Number(bulan)
        ] ||
        "-"
    );

}


function formatTanggal(
    value
) {

    if (!value) {

        return "-";

    }

    let date;

    if (
        typeof value ===
            "object" &&
        typeof value.toDate ===
            "function"
    ) {

        date =
            value.toDate();

    }

    else {

        date =
            new Date(
                value
            );

    }

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
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


function statusText(
    status
) {

    const value =
        String(
            status || ""
        )
            .toUpperCase();

    if (
        value ===
        "VALID"
    ) {

        return "VALID";

    }

    if (
        value ===
        "DICABUT"
    ) {

        return "DICABUT";

    }

    if (
        value ===
        "DIBATALKAN"
    ) {

        return "DIBATALKAN";

    }

    return (
        value ||
        "-"
    );

}


// =====================================================
// URL VERIFIKASI
// =====================================================

function buatURLVerifikasi(
    documentId
) {

    return new URL(

        `/verify.html?id=${encodeURIComponent(
            documentId
        )}`,

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
        new Date()
            .getFullYear();

    tahunElement.innerHTML =
        "";

    for (
        let tahun =
            tahunSekarang - 2;

        tahun <=
            tahunSekarang + 1;

        tahun++
    ) {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            String(
                tahun
            );

        option.textContent =
            String(
                tahun
            );

        if (
            tahun ===
            tahunSekarang
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

    const jenis =
        jenisElement.value;

    const data =
        DATA_JENIS[
            jenis
        ];


    if (
        jenis ===
        "MANUAL"
    ) {

        indeksElement.readOnly =
            false;

        indeksElement.value =
            "";

        indeksElement.placeholder =
            "Masukkan indeks / kode klasifikasi";

        if (
            petunjukIndeks
        ) {

            petunjukIndeks.textContent =
                "Indeks harus diisi secara manual.";

        }

        return;

    }


    indeksElement.readOnly =
        true;

    indeksElement.placeholder =
        "Otomatis";


    if (data) {

        indeksElement.value =
            data.indeks ||
            "";

        if (
            petunjukIndeks
        ) {

            petunjukIndeks.textContent =
                "Indeks diisi otomatis berdasarkan jenis dokumen.";

        }

    }

    else {

        indeksElement.value =
            "";

        if (
            petunjukIndeks
        ) {

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

            collection(
                db,
                "dokumen"
            ),

            orderBy(
                "nomorUrut",
                "desc"
            ),

            limit(
                1
            )

        );


    const snapshot =
        await getDocs(
            q
        );


    if (
        snapshot.empty
    ) {

        return 1;

    }


    const terakhir =
        Number(

            snapshot.docs[0]
                .data()
                .nomorUrut

        );


    if (
        !Number.isFinite(
            terakhir
        )
    ) {

        return 1;

    }


    return (
        terakhir +
        1
    );

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
        nomorUrutElement
            .value
            .trim();


    const jenis =
        jenisElement
            .value;


    const bulan =
        bulanElement
            .value;


    const tahun =
        tahunElement
            .value;


    const indeks =
        indeksElement
            .value
            .trim();


    if (
        !nomorUrut ||
        !jenis ||
        !bulan ||
        !tahun ||
        !indeks
    ) {

        return "";

    }


    return (

        `${indeks}/` +

        `${padNomor(
            nomorUrut
        )}/` +

        `${DESA.kodeDesa}/` +

        `${String(
            bulan
        ).padStart(
            2,
            "0"
        )}/` +

        `${tahun}`

    );

}


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

            collection(
                db,
                "dokumen"
            )

        );


    return snapshot.docs.map(

        item => ({

            id:
                item.id,

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


        let valid =
            0;

        let dicabut =
            0;

        let dibatalkan =
            0;


        dokumen.forEach(
            item => {

                const status =
                    String(
                        item.status ||
                        ""
                    )
                        .toUpperCase();


                if (
                    status ===
                    "VALID"
                ) {

                    valid++;

                }


                if (
                    status ===
                    "DICABUT"
                ) {

                    dicabut++;

                }


                if (
                    status ===
                    "DIBATALKAN"
                ) {

                    dibatalkan++;

                }

            }
        );


        if (
            totalDokumen
        ) {

            totalDokumen.textContent =
                dokumen.length;

        }


        if (
            dokumenValid
        ) {

            dokumenValid.textContent =
                valid;

        }


        if (
            dokumenDicabut
        ) {

            dokumenDicabut.textContent =
                dicabut;

        }


        if (
            dokumenDibatalkan
        ) {

            dokumenDibatalkan.textContent =
                dibatalkan;

        }

    }

    catch (
        err
    ) {

        console.error(
            "Gagal memuat statistik:",
            err
        );


        if (
            totalDokumen
        ) {

            totalDokumen.textContent =
                "0";

        }


        if (
            dokumenValid
        ) {

            dokumenValid.textContent =
                "0";

        }


        if (
            dokumenDicabut
        ) {

            dokumenDicabut.textContent =
                "0";

        }


        if (
            dokumenDibatalkan
        ) {

            dokumenDibatalkan.textContent =
                "0";

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

                collection(
                    db,
                    "dokumen"
                ),

                orderBy(
                    "nomorUrut",
                    "desc"
                ),

                limit(
                    10
                )

            );


        const snapshot =
            await getDocs(
                q
            );


        daftarDokumen.innerHTML =
            "";


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


        snapshot.forEach(
            snapshotDoc => {

                const data =
                    snapshotDoc.data();


                const tr =
                    document.createElement(
                        "tr"
                    );


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
                                href="${escapeHTML(
                                    data.pdfURL
                                )}"
                                target="_blank"
                                rel="noopener"
                                class="pdf-link">

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

    catch (
        err
    ) {

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

        registrasiButton.disabled =
            true;

        registrasiButton.textContent =
            "Memproses...";


        const jenis =
            jenisElement?.value ||
            "";


        const indeks =
            indeksElement?.value
                .trim() ||
            "";


        const tahun =
            tahunElement?.value ||
            "";


        const bulan =
            bulanElement?.value ||
            "";


        const tanggal =
            tanggalElement?.value ||
            "";


        const penandatangan =
            penandatanganElement
                ?.value
                .trim()
            ||
            "IDRIS";


        const jabatan =
            jabatanElement
                ?.value
                .trim()
            ||
            "Kepala Desa Guntung";


        if (!jenis) {

            alert(
                "Silakan pilih jenis dokumen."
            );

            return;

        }


        if (!indeks) {

            alert(

                jenis ===
                "MANUAL"

                    ?

                "Silakan isi indeks / kode klasifikasi secara manual."

                    :

                "Indeks dokumen belum tersedia."

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


            if (
                nomorUrutElement
            ) {

                nomorUrutElement.value =
                    nomorUrut;

            }

        }


        const nomorSurat =

            `${indeks}/` +

            `${padNomor(
                nomorUrut
            )}/` +

            `${DESA.kodeDesa}/` +

            `${String(
                bulan
            ).padStart(
                2,
                "0"
            )}/` +

            `${tahun}`;


        if (
            nomorSuratElement
        ) {

            nomorSuratElement.value =
                nomorSurat;

        }


        const documentId =

            `${DESA.kodeWilayah}-` +

            `${tahunDuaDigit(
                tahun
            )}-` +

            `${String(
                nomorUrut
            ).padStart(
                4,
                "0"
            )}`;


        const dataDokumen = {

            id:
                documentId,

            nomorUrut,

            nomorSurat,

            jenis,

            namaJenis:

                DATA_JENIS[
                    jenis
                ]?.nama

                ||

                "Lainnya / Manual",

            indeks,

            tahun:
                Number(
                    tahun
                ),

            bulan:
                Number(
                    bulan
                ),

            namaBulan:
                namaBulanIndonesia(
                    bulan
                ),

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


        await setDoc(

            doc(
                db,
                "dokumen",
                documentId
            ),

            dataDokumen

        );


        if (
            hasilElement
        ) {

            hasilElement.textContent =
                documentId;

        }


        if (
            uploadDocumentId
        ) {

            uploadDocumentId.textContent =
                documentId;

        }


        if (
            uploadPDFButton
        ) {

            uploadPDFButton.disabled =
                false;

        }


        if (
            statusUpload
        ) {

            statusUpload.textContent =
                "Dokumen berhasil diregistrasikan. Silakan pilih PDF.";

        }


        alert(

            `Dokumen berhasil diregistrasikan.\n\n` +

            `Document ID:\n${documentId}`

        );


        await refreshDashboard();

    }

    catch (
        err
    ) {

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
// MANUAL FALLBACK
// =====================================================

async function mintaPosisiManual(
    jumlahHalaman
) {

    alert(

        "Sistem tidak menemukan posisi tanda tangan secara otomatis.\n\n" +

        'Pencarian teks "Kepala Desa Guntung" dan "IDRIS" gagal.\n\n' +

        "Kita masuk ke mode manual."

    );


    const halamanInput =
        prompt(

            `PDF memiliki ${jumlahHalaman} halaman.\n\n` +

            "Masukkan nomor halaman tempat tanda tangan berada:",

            String(
                jumlahHalaman
            )

        );


    if (
        halamanInput ===
        null
    ) {

        throw new Error(
            "Proses dibatalkan oleh pengguna."
        );

    }


    const halaman =
        Number(
            halamanInput
        );


    if (
        !Number.isInteger(
            halaman
        ) ||
        halaman < 1 ||
        halaman > jumlahHalaman
    ) {

        throw new Error(
            "Nomor halaman manual tidak valid."
        );

    }


    const posisiInput =
        prompt(

            "Pilih posisi QR:\n\n" +

            "ATAS = bagian atas halaman\n" +

            "KANAN = sisi kanan halaman\n" +

            "KIRI = sisi kiri halaman\n" +

            "BAWAH = kanan bawah halaman\n\n" +

            "Masukkan pilihan:",

            "ATAS"

        );


    if (
        posisiInput ===
        null
    ) {

        throw new Error(
            "Proses dibatalkan oleh pengguna."
        );

    }


    const posisi =
        String(
            posisiInput
        )
            .trim()
            .toUpperCase();


    const pilihanValid = [

        "ATAS",

        "KANAN",

        "KIRI",

        "BAWAH"

    ];


    if (
        !pilihanValid.includes(
            posisi
        )
    ) {

        throw new Error(

            "Posisi tidak valid.\n\n" +

            "Gunakan ATAS, KANAN, KIRI, atau BAWAH."

        );

    }


    return {

        page:
            halaman,

        position:
            posisi

    };

}


// =====================================================
// UPLOAD PDF
// =====================================================

async function uploadDokumenPDF() {

    try {

        const documentId =
            uploadDocumentId
                ?.textContent
                .trim();


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
            filePDF
                ?.files
                ?.[0];


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


        if (
            uploadPDFButton
        ) {

            uploadPDFButton.disabled =
                true;

            uploadPDFButton.textContent =
                "Memproses PDF...";

        }


        if (
            statusUpload
        ) {

            statusUpload.textContent =
                "Menyimpan PDF asli...";

        }


        // =================================================
        // FOLDER DOKUMEN
        // =================================================

        const folderDokumen =
            `${SUPABASE_FOLDER}/${documentId}`;


        // =================================================
        // ORIGINAL PDF
        // =================================================

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


        if (
            originalUploadError
        ) {

            throw originalUploadError;

        }


        // =================================================
        // BUAT PDF FINAL
        // =================================================

        if (
            statusUpload
        ) {

            statusUpload.textContent =
                "Membaca seluruh halaman PDF dan mencari tanda tangan...";

        }


        const verifyURL =
            buatURLVerifikasi(
                documentId
            );


        let hasilPDF;


        try {

            hasilPDF =
                await generatePDFWithQR(

                    file,

                    documentId,

                    verifyURL

                );

        }

        catch (
            err
        ) {

            // ---------------------------------------------
            // AUTO DETECTION GAGAL
            // ---------------------------------------------

            if (
                err?.code ===
                "AUTO_DETECTION_FAILED"
            ) {

                const jumlahHalaman =
                    Number(
                        err.jumlahHalaman
                    ) || 1;


                const manualPlacement =
                    await mintaPosisiManual(
                        jumlahHalaman
                    );


                if (
                    statusUpload
                ) {

                    statusUpload.textContent =
                        "Menggunakan posisi QR manual...";

                }


                hasilPDF =
                    await generatePDFWithQR(

                        file,

                        documentId,

                        verifyURL,

                        manualPlacement

                    );

            }

            else {

                throw err;

            }

        }


        const {
            finalFile,
            pageNumber,
            metode
        } =
            hasilPDF;


        // =================================================
        // FINAL PDF
        // =================================================

        const finalPath =
            `${folderDokumen}/final.pdf`;


        if (
            statusUpload
        ) {

            statusUpload.textContent =
                "Mengunggah PDF final...";

        }


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


        if (
            finalUploadError
        ) {

            throw finalUploadError;

        }


        // =================================================
        // SIGNED URL
        // =================================================

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

                    60 *
                    60 *
                    24 *
                    365 *
                    10

                );


        if (
            signedError
        ) {

            throw signedError;

        }


        const pdfURL =
            signedData
                ?.signedUrl;


        if (!pdfURL) {

            throw new Error(
                "URL PDF final tidak berhasil dibuat."
            );

        }


        // =================================================
        // SIMPAN DATA FIRESTORE
        // =================================================

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

                qrHalaman:
                    pageNumber,

                qrMetode:
                    metode,

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


        // =================================================
        // TAMPILKAN HASIL
        // =================================================

        if (
            hasilUpload
        ) {

            hasilUpload.hidden =
                false;

        }


        if (
            linkPDF
        ) {

            linkPDF.href =
                pdfURL;

            linkPDF.textContent =
                "Buka PDF Final";

        }


        if (
            statusUpload
        ) {

            statusUpload.textContent =

                `PDF final berhasil dibuat.\n` +

                `QR ditemukan pada halaman ${pageNumber}.\n` +

                `Metode: ${metode}.`;

        }


        alert(

            "BERHASIL.\n\n" +

            "PDF asli:\n" +

            "original.pdf\n\n" +

            "PDF final:\n" +

            "final.pdf\n\n" +

            `QR ditemukan pada halaman: ${pageNumber}\n` +

            `Metode: ${metode}\n\n` +

            "QR mengarah ke:\n" +

            verifyURL

        );


        await refreshDashboard();

    }

    catch (
        err
    ) {

        console.error(
            "Gagal upload PDF:",
            err
        );


        if (
            statusUpload
        ) {

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

        if (
            uploadPDFButton
        ) {

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


// =====================================================
// EVENT NOMOR
// =====================================================

if (
    nomorUrutElement
) {

    nomorUrutElement.addEventListener(

        "input",

        updateNomorSurat

    );

}


// =====================================================
// EVENT BULAN
// =====================================================

if (
    bulanElement
) {

    bulanElement.addEventListener(

        "change",

        updateNomorSurat

    );

}


// =====================================================
// EVENT TAHUN
// =====================================================

if (
    tahunElement
) {

    tahunElement.addEventListener(

        "change",

        updateNomorSurat

    );

}


// =====================================================
// EVENT INDEKS
// =====================================================

if (
    indeksElement
) {

    indeksElement.addEventListener(

        "input",

        updateNomorSurat

    );

}


// =====================================================
// EVENT REGISTRASI
// =====================================================

if (
    registrasiButton
) {

    registrasiButton.addEventListener(

        "click",

        registrasikanDokumen

    );

}


// =====================================================
// EVENT UPLOAD
// =====================================================

if (
    uploadPDFButton
) {

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

    catch (
        err
    ) {

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
