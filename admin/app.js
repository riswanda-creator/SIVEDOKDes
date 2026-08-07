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

const tombol = document.getElementById("registrasi");
const hasil = document.getElementById("hasil");

const totalDokumen = document.getElementById("totalDokumen");
const dokumenValid = document.getElementById("dokumenValid");
const dokumenDicabut = document.getElementById("dokumenDicabut");
const dokumenDibatalkan = document.getElementById("dokumenDibatalkan");

const daftarDokumen = document.getElementById("daftarDokumen");


// =====================================================
// REGISTRASI DOKUMEN
// =====================================================

tombol.addEventListener("click", async () => {

    try {

        const nomorSurat =
            document.getElementById("nomorSurat").value.trim();

        const jenis =
            document.getElementById("jenis").value;

        const tanggalTerbit =
            document.getElementById("tanggal").value;

        const penandatangan =
            document.getElementById("penandatangan").value.trim();

        const jabatan =
            document.getElementById("jabatan").value.trim();


        // =============================================
        // VALIDASI
        // =============================================

        if (
            !nomorSurat ||
            !tanggalTerbit ||
            !penandatangan ||
            !jabatan
        ) {

            alert("Semua data wajib diisi.");

            return;
        }


        // =============================================
        // TAHUN
        // =============================================

        const tahun =
            new Date().getFullYear().toString();


        // =============================================
        // COUNTER DOCUMENT ID
        // =============================================

        const counterRef =
            doc(db, "counter", tahun);


        const documentId =
            await runTransaction(
                db,
                async (transaction) => {

                    const snap =
                        await transaction.get(counterRef);


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
                            lastNumber: nomorBaru
                        }
                    );


                    const tahunPendek =
                        tahun.slice(-2);


                    return `${data.prefix}-${tahunPendek}-${String(
                        nomorBaru
                    ).padStart(4, "0")}`;

                }
            );


        // =============================================
        // SIMPAN DOKUMEN
        // =============================================

        await setDoc(
            doc(db, "dokumen", documentId),
            {

                id: documentId,

                nomorSurat: nomorSurat,

                jenis: jenis,

                tahun: Number(tahun),

                status: "VALID",

                penandatangan: penandatangan,

                jabatan: jabatan,

                tanggalTerbit: tanggalTerbit,

                dibuatPada: serverTimestamp(),

                dibuatOleh: "admin",

                aktif: true,

                qrVersion: 1

            }
        );


        // =============================================
        // TAMPILKAN DOCUMENT ID
        // =============================================

        hasil.textContent =
            documentId;


        // =============================================
        // REFRESH DASHBOARD
        // =============================================

        await muatDashboard();


        alert(
            "Dokumen berhasil diregistrasikan."
        );


    } catch (err) {

        console.error(err);

        alert(err.message);

    }

});


// =====================================================
// DASHBOARD
// =====================================================

async function muatDashboard() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "dokumen")
            );


        let total = 0;
        let valid = 0;
        let dicabut = 0;
        let dibatalkan = 0;


        const dokumen = [];


        snapshot.forEach((item) => {

            const data =
                item.data();


            total++;


            const status =
                String(
                    data.status || ""
                ).toUpperCase();


            if (status === "VALID") {

                valid++;

            } else if (status === "DICABUT") {

                dicabut++;

            } else if (
                status === "DIBATALKAN"
            ) {

                dibatalkan++;

            }


            dokumen.push({

                id: data.id || item.id,

                nomorSurat:
                    data.nomorSurat || "-",

                jenis:
                    data.jenis || "-",

                status:
                    data.status || "-",

                tanggal:
                    data.tanggalTerbit || "-"

            });

        });


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
        // URUTKAN DOKUMEN TERBARU
        // =============================================

        dokumen.sort(
            (a, b) =>
                b.id.localeCompare(a.id)
        );


        // =============================================
        // 10 DOKUMEN TERBARU
        // =============================================

        const terbaru =
            dokumen.slice(0, 10);


        if (terbaru.length === 0) {

            daftarDokumen.innerHTML = `

                <tr>

                    <td
                        colspan="5"
                        style="text-align:center;"
                    >
                        Belum ada dokumen.

                    </td>

                </tr>

            `;

            return;
        }


        daftarDokumen.innerHTML =
            terbaru.map((data) => {

                let warnaStatus =
                    "#6b7280";


                if (
                    String(data.status)
                        .toUpperCase() === "VALID"
                ) {

                    warnaStatus =
                        "#16a34a";

                } else if (
                    String(data.status)
                        .toUpperCase() === "DICABUT" ||
                    String(data.status)
                        .toUpperCase() === "DIBATALKAN"
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

            }).join("");


    } catch (err) {

        console.error(
            "Gagal memuat dashboard:",
            err
        );

        totalDokumen.textContent = "-";
        dokumenValid.textContent = "-";
        dokumenDicabut.textContent = "-";
        dokumenDibatalkan.textContent = "-";

        daftarDokumen.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    style="text-align:center;"
                >
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
