import {
    db,
    doc,
    getDoc,
    setDoc,
    getDocs,
    collection,
    serverTimestamp,
    runTransaction
} from "../js/firebase.js";


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


// Dashboard

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
    new Date().toISOString().split("T")[0];


// =====================================================
// JENIS DOKUMEN → INDEKS
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

            document.getElementById(
                "petunjukIndeks"
            ).textContent =
                "Isi indeks sesuai ketentuan surat.";

        } else {

            indeks.readOnly = true;

            indeks.placeholder =
                "Otomatis";

            indeks.value = kode;

            document.getElementById(
                "petunjukIndeks"
            ).textContent =
                "Indeks diambil dari master SIVEDOKDes.";

        }


        buatNomorSurat();

    }
);


// =====================================================
// PERUBAHAN DATA NOMOR SURAT
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


            // =========================================
            // AMBIL DATA
            // =========================================

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

            const nomorSuratValue =
                nomorSurat.value.trim();

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

                alert(
                    "Indeks dokumen belum tersedia."
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
            // PASTIKAN NOMOR SURAT TERBENTUK
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
            // NAMA JENIS DOKUMEN
            // =========================================

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
                    "Surat Undangan"

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
                        1

                }
            );


            // =========================================
            // TAMPILKAN HASIL
            // =========================================

            hasil.textContent =
                documentId;


            // =========================================
            // REFRESH DASHBOARD
            // =========================================

            await muatDashboard();


            alert(
                "Dokumen berhasil diregistrasikan."
            );


            // =========================================
            // RESET FORM
            // =========================================

            nomorUrut.value = "";

            jenis.value = "";

            indeks.value = "";

            bulan.value = "";

            nomorSurat.value = "";


        } catch (err) {

            console.error(err);

            alert(
                err.message
                || "Terjadi kesalahan."
            );

        }

    }
);


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


        // =============================================
        // 10 TERBARU
        // =============================================

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


    } catch (err) {

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
// JALANKAN
// =====================================================

muatDashboard();
