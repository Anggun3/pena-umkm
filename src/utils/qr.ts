import QRCode from "qrcode";

/**
 * Meng-generate QR Code sebagai Data URL (base64 string).
 * @param text Teks atau URL yang akan dimasukkan ke QR code
 */
export async function generateQRDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text);
}

/**
 * Meng-generate QR Code sebagai Buffer.
 * @param text Teks atau URL yang akan dimasukkan ke QR code
 */
export async function generateQRBuffer(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text);
}
