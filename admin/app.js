import {

    db,
    storage,
    doc,
    setDoc,
    updateDoc,
    getDocs,
    collection,
    serverTimestamp,
    runTransaction

} from "../js/firebase.js";


import {

    ref,
    uploadBytes,
    getDownloadURL

} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-storage.js";



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


// =====================================================
// ELEMENT UPLOAD PDF
// =====================================================

const filePDF =
    document.getElementById("filePDF");

const uploadPDF =
    document.getElementById("uploadPDF");

const statusUpload =
    document.getElementById("statusUpload");


// =====================================================
// DASHBOARD
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
// KODE DESA
// =====================================================

const KODE_DESA = "GT";


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

        if (i === tahunSekarang) {

            option.selected = true;

        }

        tahun.appendChild(option);

    }

}


isiPilihanTahun();


// =====================================================
// TANGGAL DEFAULT
// =====================================================

tanggal.value =
    new Date()
        .toISOString()
        .split("T")[0];


// =====================================================
// PETUNJUK INDEKS
// =====================================================

const petunjukIndeks =
    document.getElementById("petunjukIndeks");


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

            indeks.readOnly = false;

            indeks.placeholder =
                "Masukkan indeks secara manual";

            indeks.value = "";

            if (petunjukIndeks) {

                petunjukIndeks.textContent =
                    "Isi indeks sesuai ketentuan surat.";

            }

        }

        else {

            indeks.readOnly = true;

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


// =====================================================
// INDEKS MANUAL
// =====================================================

indeks.addEventListener(
    "input",
    buatNomorSurat
);


// =====================================================
// PERUBAHAN NOMOR
// =====================================================

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

        nomorSurat.value = "";

        return;

    }


    const romawi =
        bulanRomawi[bulanDipilih];


    nomorSurat.value =
        `${kodeIndeks}/${nomor}/${KODE_DESA}/${romawi}/${tahunDipilih}`;

}


// =====================================================
// REGISTRASI DOKUMEN
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

            const penandatangan =
                document
                    .getElementById("penandatangan")
                    .value
                    .trim();

            const jabatan =
                document
                    .getElementById("jabatan")
                    .value
                    .trim();


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

                if (
                    jenisValue === "MANUAL"
                ) {

                    alert(
                        "Silakan masukkan indeks dokumen secara manual."
                    );

                }

                else {

                    alert(
                        "Indeks dokumen belum tersedia."
                    );

                }

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


            if (!penandatangan) {

                alert(
                    "Penandatangan wajib diisi."
                );

                return;

            }


            if (!jabatan) {

                alert(
                    "Jabatan wajib diisi."
                );

                return;

            }


            // =========================================
            // NOMOR SURAT
            // =========================================

            buatNomorSurat();


            const nomorFinal =
                nomorSurat.value.trim();


            if (!nomorFinal) {

                alert(
                    "Nomor surat belum berhasil dibuat."
                );

                return;

            }


            // =========================================
            // DOCUMENT ID
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
                                "Counter tahun belum tersedia."
                            );

                        }


                        const data =
                            snap.data();


                        const nomorBaru =
                            data.lastNumber + 1;


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
            // SIMPAN FIRESTORE
            // =========================================

            await setDoc(
                doc(
                    db,
                    "dokumen",
                    documentId
                ),
                {

                    id:
                        documentId,

                    nomorSurat:
                        nomorFinal,

                    jenis:
                        jenisValue,

                    namaJenis:
                        namaJenis[jenisValue]
                        || jenisValue,

                    indeks:
                        kodeIndeks,

                    nomorUrut:
                        nomor,

                    kodeKomponen:
                        KODE_DESA,

                    bulan:
                        Number(bulanValue),

                    tahun:
                        Number(tahunValue),

                    status:
                        "VALID",

                    penandatangan:
                        penandatangan,

                    jabatan:
                        jabatan,

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
                        false

                }
            );


            // =========================================
            // TAMPILKAN HASIL
            // =========================================

            hasil.textContent =
                documentId;


            // =========================================
            // RESET UPLOAD
            // =========================================

            if (filePDF) {

                filePDF.value = "";

            }


            if (statusUpload) {

                statusUpload.textContent =
                    "Dokumen terdaftar. Silakan pilih PDF.";

            }


            await muatDashboard();


            alert(
                "Dokumen berhasil diregistrasikan."
            );


            // =========================================
            // RESET FORM
            // =========================================

            jenis.value = "";

            indeks.value = "";

            indeks.readOnly = true;

            indeks.placeholder =
                "Otomatis";


            if (petunjukIndeks) {

                petunjukIndeks.textContent =
                    "Pilih jenis dokumen";

            }


            nomorUrut.value = "";

            bulan.value = "";

            nomorSurat.value = "";


        }

        catch (err) {

            console.error(err);

            alert(
                err.message
                || "Terjadi kesalahan."
            );

        }

    }
);


// =====================================================
// TAMPILKAN NAMA FILE SAAT DIPILIH
// =====================================================

if (filePDF) {

    filePDF.addEventListener(
        "change",
        () => {

            const file =
                filePDF.files[0];


            if (!file) {

                statusUpload.textContent =
                    "Belum ada file dipilih.";

                return;

            }


            if (
                file.type !==
                "application/pdf"
            ) {

                statusUpload.textContent =
                    "❌ File harus berformat PDF.";

                filePDF.value = "";

                return;

            }


            const ukuranMB =
                file.size /
                (1024 * 1024);


            if (
                ukuranMB > 20
            ) {

                statusUpload.textContent =
                    "❌ Ukuran PDF maksimal 20 MB.";

                filePDF.value = "";

                return;

            }


            statusUpload.textContent =
                `📄 ${file.name} (${ukuranMB.toFixed(2)} MB)`;

        }
    );

}


// =====================================================
// UPLOAD PDF
// =====================================================

if (uploadPDF) {

    uploadPDF.addEventListener(
        "click",
        async () => {

            try {

                // =====================================
                // CEK DOCUMENT ID
                // =====================================

                const documentId =
                    hasil.textContent.trim();


                if (
                    !documentId ||
                    documentId === "-"
                ) {

                    alert(
                        "Registrasikan dokumen terlebih dahulu sebelum mengupload PDF."
                    );

                    return;

                }


                // =====================================
                // CEK FILE
                // =====================================

                if (
                    !filePDF ||
                    !filePDF.files ||
                    !filePDF.files[0]
                ) {

                    alert(
                        "Silakan pilih file PDF terlebih dahulu."
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
                        "File harus berupa PDF."
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


                // =====================================
                // UI
                // =====================================

                uploadPDF.disabled =
                    true;

                uploadPDF.textContent =
                    "Mengupload...";

                statusUpload.textContent =
                    "⏳ Mengupload PDF ke penyimpanan SIVEDOKDes...";


                // =====================================
                // LOKASI FIREBASE STORAGE
                // =====================================

                const storageRef =
                    ref(
                        storage,
                        `dokumen/${documentId}/original.pdf`
                    );


                // =====================================
                // UPLOAD
                // =====================================

                await uploadBytes(
                    storageRef,
                    file,
                    {

                        contentType:
                            "application/pdf",

                        customMetadata: {

                            documentId:
                                documentId

                        }

                    }
                );


                // =====================================
                // URL FILE
                // =====================================

                const downloadURL =
                    await getDownloadURL(
                        storageRef
                    );


                // =====================================
                // UPDATE FIRESTORE
                // =====================================

                await updateDoc(
                    doc(
                        db,
                        "dokumen",
                        documentId
                    ),
                    {

                        pdfUploaded:
                            true,

                        pdfOriginalName:
                            file.name,

                        pdfStoragePath:
                            `dokumen/${documentId}/original.pdf`,

                        pdfURL:
                            downloadURL,

                        pdfUploadedAt:
                            serverTimestamp()

                    }
                );


                // =====================================
                // BERHASIL
                // =====================================

                statusUpload.innerHTML = `
                    <strong>
                        ✅ PDF berhasil disimpan.
                    </strong>
                    <br>
                    File:
                    ${file.name}
                `;


                alert(
                    "PDF berhasil diupload dan disimpan di Firebase Storage."
                );


            }

            catch (err) {

                console.error(
                    "Upload PDF gagal:",
                    err
                );


                statusUpload.textContent =
                    "❌ Upload PDF gagal.";


                alert(
                    err.message
                    || "Gagal mengupload PDF."
                );

            }


            finally {

                uploadPDF.disabled =
                    false;

                uploadPDF.textContent =
                    "Upload PDF";

            }

        }
    );

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


        let total = 0;

        let valid = 0;

        let dicabut = 0;

        let dibatalkan = 0;


        const dokumen = [];


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
                    status === "VALID"
                ) {

                    valid++;

                }

                else if (
                    status === "DICABUT"
                ) {

                    dicabut++;

                }

                else if (
                    status === "DIBATALKAN"
                ) {

                    dibatalkan++;

                }


                dokumen.push({

                    id:
                        data.id
                        || item.id,

                    nomorSurat:
                        data.nomorSurat
                        || "-",

                    jenis:
                        data.namaJenis
                        || data.jenis
                        || "-",

                    status:
                        data.status
                        || "-",

                    tanggal:
                        data.tanggalTerbit
                        || "-"

                });

            }
        );


        // =============================================
        // STATISTIK
        // =============================================

        totalDokumen.textContent =
            total;

        dokumenValid.textContent =
            valid;

        dokumenDicabut.textContent =
            dicabut;

        dokumenDibatalkan.textContent =
            dibatalkan;


        // =============================================
        // URUTKAN
        // =============================================

        dokumen.sort(
            (a, b) =>
                b.id.localeCompare(a.id)
        );


        const terbaru =
            dokumen.slice(
                0,
                10
            );


        if (
            terbaru.length === 0
        ) {

            daftarDokumen.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center;">

                        Belum ada dokumen.

                    </td>

                </tr>

            `;

            return;

        }


        // =============================================
        // TABEL
        // =============================================

        daftarDokumen.innerHTML =
            terbaru
                .map(
                    (data) => {

                        let warnaStatus =
                            "#6b7280";


                        if (
                            String(
                                data.status
                            ).toUpperCase()
                            === "VALID"
                        ) {

                            warnaStatus =
                                "#16a34a";

                        }

                        else if (

                            String(
                                data.status
                            ).toUpperCase()
                            === "DICABUT"

                            ||

                            String(
                                data.status
                            ).toUpperCase()
                            === "DIBATALKAN"

                        ) {

                            warnaStatus =
                                "#dc2626";

                        }


                        return `

                            <tr>

                                <td>
                                    ${data.id}
                                </td>

                                <td>
                                    ${data.nomorSurat}
                                </td>

                                <td>
                                    ${data.jenis}
                                </td>

                                <td
                                    style="
                                        color:${warnaStatus};
                                        font-weight:600;
                                    "
                                >
                                    ${data.status}
                                </td>

                                <td>
                                    ${data.tanggal}
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
                    colspan="5"
                    style="text-align:center;">

                    Gagal memuat data.

                </td>

            </tr>

        `;

    }

}


// =====================================================
// JALANKAN DASHBOARD
// =====================================================

muatDashboard();
