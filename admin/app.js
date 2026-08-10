```javascript
// =====================================================
// SIVEDOKDes
// ADMINISTRATOR APP
// Desa Guntung
//
// VERSI WORKFLOW DOKUMEN
// - Identitas Admin
// - Audit Trail
// - Document ID
// - PDF Original
// - PDF + QR untuk TTE
// - Workflow TTE
// - Status Administratif
// - Persiapan PDF hasil TTE
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
// KONFIGURASI DESA
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

// =====================================================
// KONFIGURASI PENYIMPANAN
// =====================================================

const SUPABASE_BUCKET =
    "sivedokdes-pdf";

const SUPABASE_FOLDER =
    "dokumen";

// =====================================================
// IDENTITAS ADMIN
// =====================================================
//
// Untuk sementara identitas disiapkan melalui konfigurasi
// lokal karena sistem login/auth belum kita ubah.
//
// TAHAP BERIKUTNYA:
// Identitas ini akan diambil dari akun Firebase Auth.
//
// Jangan gunakan "ADMIN" sebagai identitas permanen.
// =====================================================

const ADMIN_STORAGE_KEY =
    "sivedokdes_admin_profile";

const DEFAULT_ADMIN = {

    uid:
        "local-admin",

    username:
        "admin",

    nama:
        "Administrator",

    role:
        "administrator",

    unit:
        DESA.nama

};

function getAdminIdentity() {

    try {

        const stored =
            localStorage.getItem(
                ADMIN_STORAGE_KEY
            );

        if (stored) {

            const parsed =
                JSON.parse(stored);

            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return {

                    ...DEFAULT_ADMIN,

                    ...parsed

                };

            }

        }

    }

    catch (err) {

        console.warn(
            "Profil admin lokal tidak dapat dibaca:",
            err
        );

    }

    return {
        ...DEFAULT_ADMIN
    };

}

const ADMIN =
    getAdminIdentity();

// =====================================================
// STATUS WORKFLOW DOKUMEN
// =====================================================

const WORKFLOW_STATUS = {

    DRAFT:
        "DRAFT",

    PDF_TERSEDIA:
        "PDF_TERSEDIA",

    QR_TERPASANG:
        "QR_TERPASANG",

    MENUNGGU_TTE:
        "MENUNGGU_TTE",

    DIPROSES_TTE:
        "DIPROSES_TTE",

    SELESAI_TTE:
        "SELESAI_TTE",

    SIAP_CETAK:
        "SIAP_CETAK",

    SELESAI:
        "SELESAI"

};

// =====================================================
// STATUS ADMINISTRATIF
// =====================================================

const ADMINISTRATIVE_STATUS = {

    VALID:
        "VALID",

    DICABUT:
        "DICABUT",

    DIBATALKAN:
        "DIBATALKAN",

    KADALUARSA:
        "KADALUARSA"

};

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
// BULAN ROMAWI
// =====================================================

const BULAN_ROMAWI = {

    1:
        "I",

    2:
        "II",

    3:
        "III",

    4:
        "IV",

    5:
        "V",

    6:
        "VI",

    7:
        "VII",

    8:
        "VIII",

    9:
        "IX",

    10:
        "X",

    11:
        "XI",

    12:
        "XII"

};

// =====================================================
// UTILITAS
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

function padNomor(
    value,
    panjang = 3
) {

    return String(value)
        .replace(
            /\D/g,
            ""
        )
        .padStart(
            panjang,
            "0"
        );

}

function padDocumentNumber(
    value
) {

    return String(value)
        .replace(
            /\D/g,
            ""
        )
        .padStart(
            4,
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

function bulanRomawi(
    bulan
) {

    return BULAN_ROMAWI[
        Number(bulan)
    ] || "-";

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

    return nama[
        Number(bulan)
    ] || "-";

}

function formatTanggal(
    value
) {

    if (!value) {

        return "-";

    }

    let date;

    if (
        typeof value === "object" &&
        typeof value.toDate === "function"
    ) {

        date =
            value.toDate();

    }

    else {

        date =
            new Date(value);

    }

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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
// STATUS TEXT
// =====================================================

function statusText(
    status
) {

    const value =
        String(
            status || ""
        )
            .trim()
            .toUpperCase();

    return value || "-";

}

// =====================================================
// LABEL WORKFLOW
// =====================================================

function workflowText(
    status
) {

    const value =
        String(
            status || ""
        )
            .trim()
            .toUpperCase();

    const labels = {

        DRAFT:
            "Draft",

        PDF_TERSEDIA:
            "PDF Tersedia",

        QR_TERPASANG:
            "QR Terpasang",

        MENUNGGU_TTE:
            "Menunggu TTE",

        DIPROSES_TTE:
            "Diproses TTE",

        SELESAI_TTE:
            "Selesai TTE",

        SIAP_CETAK:
            "Siap Cetak",

        SELESAI:
            "Selesai"

    };

    return labels[value] || value || "-";

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
// AUDIT TRAIL
// =====================================================
//
// Setiap aktivitas penting dicatat dalam array audit.
// Pada tahap berikutnya kita akan memperluas ini
// menjadi subcollection audit yang lebih aman.
// =====================================================

function buatAuditEntry(
    action,
    tambahan = {}
) {

    return {

        action:
            action,

        adminUid:
            ADMIN.uid,

        adminUsername:
            ADMIN.username,

        adminNama:
            ADMIN.nama,

        adminRole:
            ADMIN.role,

        waktu:
            new Date().toISOString(),

        ...tambahan

    };

}

// =====================================================
// IDENTITAS ADMIN DI DASHBOARD
// =====================================================

function tampilkanIdentitasAdmin() {

    const existing =
        document.getElementById(
            "sivedokdesAdminIdentity"
        );

    if (existing) {

        existing.innerHTML = `

            <div>
                <strong>
                    ${escapeHTML(
                        ADMIN.nama
                    )}
                </strong>
            </div>

            <div>
                ${escapeHTML(
                    ADMIN.role
                )}
                •
                ${escapeHTML(
                    ADMIN.unit
                )}
            </div>

        `;

        return;

    }

    const target =
        document.querySelector(
            "header"
        ) ||
        document.querySelector(
            ".header"
        ) ||
        document.body;

    if (!target) {

        return;

    }

    const identity =
        document.createElement(
            "div"
        );

    identity.id =
        "sivedokdesAdminIdentity";

    identity.style.cssText = `
        position: fixed;
        top: 16px;
        right: 20px;
        z-index: 9999;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13px;
        line-height: 1.5;
        box-shadow: 0 4px 14px rgba(0,0,0,.08);
    `;

    identity.innerHTML = `

        <div>
            <strong>
                ${escapeHTML(
                    ADMIN.nama
                )}
            </strong>
        </div>

        <div>
            ${escapeHTML(
                ADMIN.role
            )}
            •
            ${escapeHTML(
                ADMIN.unit
            )}
        </div>

    `;

    target.appendChild(
        identity
    );

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
            String(tahun);

        option.textContent =
            String(tahun);

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

    if (
        jenis ===
        "MANUAL"
    ) {

        indeksElement.readOnly =
            false;

        indeksElement.disabled =
            false;

        indeksElement.value =
            "";

        indeksElement.placeholder =
            "Masukkan indeks / kode klasifikasi";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Indeks harus diisi secara manual.";

        }

        return;

    }

    indeksElement.readOnly =
        true;

    indeksElement.disabled =
        false;

    indeksElement.placeholder =
        "Otomatis";

    const data =
        DATA_JENIS[
            jenis
        ];

    if (data) {

        indeksElement.value =
            data.indeks || "";

        if (petunjukIndeks) {

            petunjukIndeks.textContent =
                "Indeks diisi otomatis berdasarkan jenis dokumen.";

        }

    }

    else {

        indeksElement.value =
            "";

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

                limit(1)

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

        return terakhir + 1;

    }

    catch (err) {

        console.error(
            "Gagal mengambil nomor urut terakhir:",
            err
        );

        throw new Error(
            "Tidak dapat membaca nomor urut dokumen dari Firestore."
        );

    }

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

    const bulan =
        bulanElement.value;

    const tahun =
        tahunElement.value;

    const indeks =
        indeksElement
            .value
            .trim();

    if (
        !nomorUrut ||
        !bulan ||
        !tahun ||
        !indeks
    ) {

        return "";

    }

    const nomor =
        padNomor(
            nomorUrut,
            3
        );

    const romawi =
        bulanRomawi(
            bulan
        );

    return `${indeks}/${nomor}/${DESA.kodeDesa}/${romawi}/${tahun}`;

}

function updateNomorSurat() {

    if (!nomorSuratElement) {

        return;

    }

    nomorSuratElement.value =
        buatNomorSurat();

}

// =====================================================
// DOCUMENT ID
// =====================================================
//
// FORMAT:
//
// 1219062002-26-0001
//
// 1219062002 = kode wilayah
// 26         = tahun dua digit
// 0001       = nomor urut internal
//
// TIDAK menggunakan GT.
// =====================================================

function buatDocumentId(
    tahun,
    nomorUrut
) {

    return [

        DESA.kodeWilayah,

        tahunDuaDigit(
            tahun
        ),

        padDocumentNumber(
            nomorUrut
        )

    ].join("-");

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

        let kadaluarsa =
            0;

        dokumen.forEach(
            item => {

                const status =
                    String(
                        item.statusAdministratif ||
                        item.status ||
                        ""
                    )
                        .trim()
                        .toUpperCase();

                if (
                    status ===
                    ADMINISTRATIVE_STATUS.VALID
                ) {

                    valid++;

                }

                if (
                    status ===
                    ADMINISTRATIVE_STATUS.DICABUT
                ) {

                    dicabut++;

                }

                if (
                    status ===
                    ADMINISTRATIVE_STATUS.DIBATALKAN
                ) {

                    dibatalkan++;

                }

                if (
                    status ===
                    ADMINISTRATIVE_STATUS.KADALUARSA
                ) {

                    kadaluarsa++;

                }

            }
        );

        if (totalDokumen) {

            totalDokumen.textContent =
                String(
                    dokumen.length
                );

        }

        if (dokumenValid) {

            dokumenValid.textContent =
                String(
                    valid
                );

        }

        if (dokumenDicabut) {

            dokumenDicabut.textContent =
                String(
                    dicabut
                );

        }

        if (dokumenDibatalkan) {

            dokumenDibatalkan.textContent =
                String(
                    dibatalkan
                );

        }

        const kadaluarsaElement =
            document.getElementById(
                "dokumenKadaluarsa"
            );

        if (kadaluarsaElement) {

            kadaluarsaElement.textContent =
                String(
                    kadaluarsa
                );

        }

    }

    catch (err) {

        console.error(
            "Gagal memuat statistik:",
            err
        );

        if (totalDokumen) {

            totalDokumen.textContent =
                "!";

        }

        if (dokumenValid) {

            dokumenValid.textContent =
                "!";

        }

        if (dokumenDicabut) {

            dokumenDicabut.textContent =
                "!";

        }

        if (dokumenDibatalkan) {

            dokumenDibatalkan.textContent =
                "!";

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

                limit(10)

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
                        colspan="7"
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
                    !!(
                        data.pdfQRURL ||
                        data.pdfURL
                    );

                const workflow =
                    data.statusWorkflow ||
                    (
                        data.pdfURL
                            ? WORKFLOW_STATUS.QR_TERPASANG
                            : WORKFLOW_STATUS.DRAFT
                    );

                const statusAdministratif =
                    data.statusAdministratif ||
                    data.status ||
                    ADMINISTRATIVE_STATUS.VALID;

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
                            workflowText(
                                workflow
                            )
                        )}

                    </td>

                    <td>

                        ${escapeHTML(
                            statusText(
                                statusAdministratif
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
                                    data.pdfQRURL ||
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
                    colspan="7"
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
            `${indeks}/${padNomor(
                nomorUrut,
                3
            )}/${DESA.kodeDesa}/${bulanRomawi(
                bulan
            )}/${tahun}`;

        if (nomorSuratElement) {

            nomorSuratElement.value =
                nomorSurat;

        }

        // =============================================
        // DOCUMENT ID
        // =============================================

        const documentId =
            buatDocumentId(
                tahun,
                nomorUrut
            );

        // =============================================
        // DATA AUDIT AWAL
        // =============================================

        const auditAwal =
            buatAuditEntry(
                "DOKUMEN_DIBUAT",
                {

                    documentId:
                        documentId,

                    nomorSurat:
                        nomorSurat

                }
            );

        // =============================================
        // DATA FIRESTORE
        // =============================================

        const dataDokumen = {

            id:
                documentId,

            nomorUrut:
                nomorUrut,

            nomorSurat:
                nomorSurat,

            jenis:
                jenis,

            namaJenis:
                DATA_JENIS[
                    jenis
                ]?.nama
                ||
                "Lainnya / Manual",

            indeks:
                indeks,

            tahun:
                Number(
                    tahun
                ),

            bulan:
                Number(
                    bulan
                ),

            bulanRomawi:
                bulanRomawi(
                    bulan
                ),

            namaBulan:
                namaBulanIndonesia(
                    bulan
                ),

            tanggalTerbit:
                tanggal,

            statusWorkflow:
                WORKFLOW_STATUS.DRAFT,

            statusAdministratif:
                ADMINISTRATIVE_STATUS.VALID,

            status:
                ADMINISTRATIVE_STATUS.VALID,

            aktif:
                true,

            versi:
                1,

            penandatangan:
                penandatangan,

            jabatan:
                jabatan,

            kodeWilayah:
                DESA.kodeWilayah,

            kodeDesa:
                DESA.kodeDesa,

            // =========================================
            // IDENTITAS ADMIN
            // =========================================

            dibuatOleh:
                ADMIN.nama,

            dibuatOlehUid:
                ADMIN.uid,

            dibuatOlehUsername:
                ADMIN.username,

            dibuatOlehRole:
                ADMIN.role,

            // =========================================
            // TIMESTAMP
            // =========================================

            dibuatPada:
                serverTimestamp(),

            diperbaruiPada:
                serverTimestamp(),

            // =========================================
            // AUDIT
            // =========================================

            audit:
                [
                    auditAwal
                ]

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
// UPLOAD PDF
// =====================================================
//
// ALUR BARU:
//
// original.pdf
//      ↓
// qr.pdf
//      ↓
// MENUNGGU_TTE
//
// Untuk sekarang nama file QR adalah qr.pdf.
// PDF hasil TTE nantinya akan menjadi signed.pdf.
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
                ?.files?.[0];

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
        // ORIGINAL PDF
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

        if (
            originalUploadError
        ) {

            throw originalUploadError;

        }

        // =============================================
        // GENERATE PDF + QR
        // =============================================

        if (statusUpload) {

            statusUpload.textContent =
                "Mencari posisi tanda tangan dan membuat QR Verifikasi...";

        }

        const verifyURL =
            buatURLVerifikasi(
                documentId
            );

        const {
            finalFile
        } =
            await generatePDFWithQR(

                file,

                documentId,

                verifyURL

            );

        // =============================================
        // PDF + QR
        // =============================================

        const qrPath =
            `${folderDokumen}/qr.pdf`;

        const {
            error:
                qrUploadError
        } =
            await supabase
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .upload(

                    qrPath,

                    finalFile,

                    {

                        contentType:
                            "application/pdf",

                        upsert:
                            true

                    }

                );

        if (
            qrUploadError
        ) {

            throw qrUploadError;

        }

        // =============================================
        // SIGNED URL PDF + QR
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

                    qrPath,

                    60 *
                    60 *
                    24 *
                    365 *
                    10

                );

        if (signedError) {

            throw signedError;

        }

        const pdfQRURL =
            signedData?.signedUrl;

        if (!pdfQRURL) {

            throw new Error(
                "URL PDF + QR tidak berhasil dibuat."
            );

        }

        // =============================================
        // AUDIT
        // =============================================

        const auditUpload =
            buatAuditEntry(
                "PDF_QR_DIBUAT",
                {

                    documentId:
                        documentId,

                    pdfOriginal:
                        originalPath,

                    pdfQR:
                        qrPath

                }
            );

        // =============================================
        // UPDATE FIRESTORE
        // =============================================

        await setDoc(

            doc(
                db,
                "dokumen",
                documentId
            ),

            {

                statusWorkflow:
                    WORKFLOW_STATUS.MENUNGGU_TTE,

                statusAdministratif:
                    ADMINISTRATIVE_STATUS.VALID,

                status:
                    ADMINISTRATIVE_STATUS.VALID,

                pdfQRURL:
                    pdfQRURL,

                pdfStoragePath:
                    qrPath,

                pdfOriginalStoragePath:
                    originalPath,

                pdfQRNamaFile:
                    "qr.pdf",

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

                pdfQRDibuatPada:
                    serverTimestamp(),

                // =====================================
                // TTE
                // =====================================

                tteStatus:
                    "MENUNGGU",

                tteDikirim:
                    false,

                tteDikirimPada:
                    null,

                tteSelesai:
                    false,

                tteSelesaiPada:
                    null,

                signedPDFStoragePath:
                    null,

                signedPDFURL:
                    null,

                // =====================================
                // CETAK
                // =====================================

                cetakStatus:
                    "BELUM_CETAK",

                dicetakPada:
                    null,

                dicetakOleh:
                    null,

                // =====================================
                // AUDIT
                // =====================================

                audit:
                    [
                        auditUpload
                    ],

                diperbaruiOleh:
                    ADMIN.nama,

                diperbaruiOlehUid:
                    ADMIN.uid,

                diperbaruiPada:
                    serverTimestamp()

            },

            {

                merge:
                    true

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
                pdfQRURL;

            linkPDF.textContent =
                "Buka PDF + QR";

        }

        if (statusUpload) {

            statusUpload.textContent =
                "PDF + QR berhasil dibuat dan status dokumen sekarang MENUNGGU TTE.";

        }

        alert(

            "BERHASIL.\n\n" +

            "PDF asli:\n" +

            "original.pdf\n\n" +

            "PDF + QR:\n" +

            "qr.pdf\n\n" +

            "Document ID:\n" +

            documentId +

            "\n\n" +

            "Status:\n" +

            "MENUNGGU TTE"

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
// INISIALISASI
// =====================================================

async function init() {

    try {

        tampilkanIdentitasAdmin();

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
```
