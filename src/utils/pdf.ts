import PDFDocument from "pdfkit";
import { Writable } from "stream";

/**
 * Membuat dokumen PDF sederhana dan mengembalikannya dalam bentuk Buffer.
 * @param title Judul dokumen PDF
 * @param content Isi dokumen PDF
 */
export function createPDFBuffer(title: string, content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      },
    });

    stream.on("finish", () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on("error", (err) => {
      reject(err);
    });

    doc.pipe(stream);

    // Styling PDF dasar
    doc.fontSize(24).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12).font("Helvetica").text(content, {
      align: "justify",
      lineGap: 4,
    });

    doc.end();
  });
}
