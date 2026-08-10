// =====================================================
// SIVEDOKDes
// QR CODE GENERATOR
// =====================================================

import QRCode from "https://esm.sh/qrcode@1.5.4";

// =====================================================
// BUAT QR CODE
// =====================================================

export async function buatQRCode(documentId, verifyURL) {

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

    const qrDataURL =
        await QRCode.toDataURL(
            verifyURL,
            {
                errorCorrectionLevel: "H",

                margin: 1,

                width: 500,

                color: {
                    dark: "#000000",
                    light: "#FFFFFF"
                }
            }
        );

    return {
        documentId,
        verifyURL,
        qrDataURL
    };
}
