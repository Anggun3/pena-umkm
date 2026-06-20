import { db } from "../db/db";
import { transactions, users } from "../db/schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";
import { createExcelBuffer } from "../utils/excel";
import PDFDocument from "pdfkit";
import { Writable } from "stream";

export class ReportsService {
  /**
   * Mengambil data transaksi lunas dalam rentang waktu tertentu.
   */
  private static async getReportData(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`);

    return await db
      .select({
        id: transactions.id,
        invoiceNumber: transactions.invoiceNumber,
        cashierName: users.name,
        totalAmount: transactions.totalAmount,
        paymentMethod: transactions.paymentMethod,
        paymentStatus: transactions.paymentStatus,
        createdAt: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.cashierId, users.id))
      .where(
        and(
          gte(transactions.createdAt, start),
          lte(transactions.createdAt, end),
          eq(transactions.paymentStatus, "lunas")
        )
      )
      .orderBy(desc(transactions.createdAt));
  }

  /**
   * Meng-generate laporan Excel (.xlsx) dan mengembalikannya sebagai Buffer.
   */
  static async generateExcelReport(startDate: string, endDate: string): Promise<Buffer> {
    const data = await this.getReportData(startDate, endDate);

    const columns = [
      { header: "Nomor Invoice", key: "invoiceNumber", width: 25 },
      { header: "Nama Kasir", key: "cashierName", width: 20 },
      { header: "Metode Pembayaran", key: "paymentMethod", width: 18 },
      { header: "Status", key: "paymentStatus", width: 15 },
      { header: "Total Belanja (Rp)", key: "totalAmount", width: 18 },
      { header: "Tanggal", key: "createdAt", width: 22 },
    ];

    const grandTotal = data.reduce((sum, item) => sum + item.totalAmount, 0);

    const rows = data.map((t) => ({
      invoiceNumber: t.invoiceNumber,
      cashierName: t.cashierName,
      paymentMethod: t.paymentMethod.toUpperCase(),
      paymentStatus: t.paymentStatus.toUpperCase(),
      totalAmount: t.totalAmount,
      createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString("id-ID") : "",
    }));

    // Tambahkan baris total di bagian bawah
    rows.push({
      invoiceNumber: "TOTAL PENDAPATAN",
      cashierName: "",
      paymentMethod: "",
      paymentStatus: "",
      totalAmount: grandTotal,
      createdAt: "",
    });

    return await createExcelBuffer(`Lap_${startDate}_${endDate}`, columns, rows);
  }

  /**
   * Meng-generate laporan PDF (.pdf) dengan layout grid terstruktur menggunakan pdfkit.
   */
  static async generatePDFReport(startDate: string, endDate: string): Promise<Buffer> {
    const data = await this.getReportData(startDate, endDate);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
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

      // --- HEADER DOKUMEN ---
      doc.fontSize(16).font("Helvetica-Bold").text("LAPORAN RINGKASAN KEUANGAN PERIODIK", { align: "center" });
      doc.fontSize(12).text("PENA UMKM", { align: "center" });
      doc.fontSize(9).font("Helvetica").text(`Periode: ${startDate} s/d ${endDate}`, { align: "center" });
      doc.moveDown(1.5);

      // --- LAYOUT GRID TABEL ---
      let y = doc.y;

      // Garis atas header
      doc.strokeColor("#9ca3af")
         .lineWidth(1)
         .moveTo(50, y - 5)
         .lineTo(545, y - 5)
         .stroke();

      // Text Header Tabel
      doc.font("Helvetica-Bold").fontSize(9);
      doc.text("No", 50, y);
      doc.text("Nomor Invoice", 80, y);
      doc.text("Tanggal", 210, y);
      doc.text("Kasir", 310, y);
      doc.text("Metode", 410, y);
      doc.text("Total (Rp)", 465, y, { width: 80, align: "right" });

      // Garis bawah header
      y += 15;
      doc.moveTo(50, y)
         .lineTo(545, y)
         .stroke();
      y += 10;

      // --- BARIS DATA TABEL ---
      doc.font("Helvetica").fontSize(8.5);
      let grandTotal = 0;
      let index = 1;

      for (const t of data) {
        // Penanganan Page Break jika data melebihi batas bawah halaman A4
        if (y > 750) {
          doc.addPage();
          y = 50;

          // Gambar kembali header tabel di halaman baru
          doc.font("Helvetica-Bold").fontSize(9);
          doc.text("No", 50, y);
          doc.text("Nomor Invoice", 80, y);
          doc.text("Tanggal", 210, y);
          doc.text("Kasir", 310, y);
          doc.text("Metode", 410, y);
          doc.text("Total (Rp)", 465, y, { width: 80, align: "right" });
          
          y += 15;
          doc.moveTo(50, y).lineTo(545, y).stroke();
          y += 10;
          doc.font("Helvetica").fontSize(8.5);
        }

        const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleDateString("id-ID") : "-";
        
        doc.text(String(index++), 50, y);
        doc.text(t.invoiceNumber, 80, y);
        doc.text(dateStr, 210, y);
        doc.text(t.cashierName, 310, y);
        doc.text(t.paymentMethod.toUpperCase(), 410, y);
        doc.text(t.totalAmount.toLocaleString("id-ID"), 465, y, { width: 80, align: "right" });

        grandTotal += t.totalAmount;
        y += 20;
      }

      // --- FOOTER RANGKUMAN (GRAND TOTAL) ---
      // Garis penutup data
      doc.moveTo(50, y - 5)
         .lineTo(545, y - 5)
         .stroke();

      y += 5;
      doc.font("Helvetica-Bold").fontSize(9.5);
      doc.text("TOTAL PENDAPATAN", 80, y);
      doc.text(`Rp ${grandTotal.toLocaleString("id-ID")}`, 465, y, { width: 80, align: "right" });

      // Garis penutup rangkuman (Double Line)
      y += 15;
      doc.moveTo(50, y).lineTo(545, y).stroke();
      doc.moveTo(50, y + 2).lineTo(545, y + 2).stroke();

      doc.end();
    });
  }
}
