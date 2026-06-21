import { db } from "../db/db";
import { transactions, transactionDetails, products, users } from "../db/schema";
import { eq, gte, desc, count } from "drizzle-orm";
import { generateQRDataURL } from "../utils/qr";

interface CheckoutItem {
  product_id: number;
  quantity: number;
}

interface CheckoutInput {
  payment_method: "tunai" | "qris";
  cash_received: number;
  items: CheckoutItem[];
}

export class TransactionsService {
  /**
   * Mengatur checkout POS kasir.
   */
  static async checkout(cashierId: number, data: CheckoutInput) {
    if (!data.items || data.items.length === 0) {
      throw new Error("Item transaksi tidak boleh kosong");
    }

    return await db.transaction(async (tx) => {
      // 1. Hitung total amount dan kurangi stok produk secara atomik
      let totalAmount = 0;
      const detailsToInsert: Array<{
        productId: number;
        quantity: number;
        price: number;
      }> = [];

      for (const item of data.items) {
        // Dapatkan data produk dengan lock
        const foundProducts = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.product_id));

        if (foundProducts.length === 0) {
          throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);
        }

        const product = foundProducts[0];
        if (product.stock < item.quantity) {
          throw new Error(`Stok produk '${product.name}' tidak mencukupi`);
        }

        // Hitung total harga
        totalAmount += product.sellingPrice * item.quantity;

        // Kurangi stok barang
        await tx
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, product.id));

        detailsToInsert.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.sellingPrice,
        });
      }

      // 2. Generate Nomor Invoice (format: INV-YYYYMMDD-001)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const dateStr = `${year}${month}${date}`;

      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);

      const [countRes] = await tx
        .select({ total: count() })
        .from(transactions)
        .where(gte(transactions.createdAt, startOfToday));

      const seqNum = (countRes?.total || 0) + 1;
      const invoiceNumber = `INV-${dateStr}-${String(seqNum).padStart(3, "0")}`;

      let paymentStatus: "pending" | "lunas" | "batal" = "pending";
      let cashChange = 0;
      let qrisBase64: string | null = null;
      let qrisPayload: string | null = null;

      // 3. Logika pembayaran berdasarkan payment_method
      if (data.payment_method === "tunai") {
        const cashReceived = Number(data.cash_received || 0);
        if (cashReceived < totalAmount) {
          throw new Error("Uang tunai yang diterima kurang dari total nominal belanja");
        }
        cashChange = cashReceived - totalAmount;
        paymentStatus = "lunas";
      } else if (data.payment_method === "qris") {
        paymentStatus = "pending";
        qrisPayload = invoiceNumber; // Gunakan invoice number unik sebagai QRIS payload
        qrisBase64 = await generateQRDataURL(qrisPayload);
      } else {
        throw new Error("Metode pembayaran tidak valid");
      }

      // 4. Masukkan ke tabel transactions
      const [insertResult] = await tx.insert(transactions).values({
        invoiceNumber,
        cashierId,
        totalAmount,
        paymentMethod: data.payment_method,
        paymentStatus,
        cashReceived: data.payment_method === "tunai" ? Number(data.cash_received) : 0,
        cashChange: data.payment_method === "tunai" ? cashChange : 0,
        qrisPayload,
      });

      const transactionId = insertResult.insertId;

      // 5. Masukkan detail transaksi
      for (const detail of detailsToInsert) {
        await tx.insert(transactionDetails).values({
          transactionId,
          productId: detail.productId,
          quantity: detail.quantity,
          price: detail.price,
        });
      }

      // 6. Siapkan response kembalian sesuai format
      if (data.payment_method === "qris") {
        return {
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          qris_base64: qrisBase64,
        };
      } else {
        return {
          invoice_number: invoiceNumber,
          total_amount: totalAmount,
          payment_status: paymentStatus,
          cash_change: cashChange,
        };
      }
    });
  }

  /**
   * Verifikasi Pembayaran QRIS dari Webhook.
   */
  static async verifyQRISPayment(invoiceNumber: string, status: string) {
    const foundTrans = await db
      .select()
      .from(transactions)
      .where(eq(transactions.invoiceNumber, invoiceNumber))
      .limit(1);

    if (foundTrans.length === 0) {
      throw new Error(`Transaksi dengan invoice ${invoiceNumber} tidak ditemukan`);
    }

    const transaction = foundTrans[0];
    if (transaction.paymentMethod !== "qris") {
      throw new Error("Transaksi tersebut bukan menggunakan QRIS");
    }

    if (status === "SUCCESS") {
      await db
        .update(transactions)
        .set({ paymentStatus: "lunas" })
        .where(eq(transactions.id, transaction.id));
    } else if (status === "FAILED" || status === "CANCELLED") {
      await db
        .update(transactions)
        .set({ paymentStatus: "batal" })
        .where(eq(transactions.id, transaction.id));
    }

    return { data: "Status transaksi berhasil diperbarui" };
  }

  /**
   * Menampilkan daftar transaksi kasir hari ini.
   */
  static async getTodayTransactions() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    return await db
      .select({
        id: transactions.id,
        invoice_number: transactions.invoiceNumber,
        cashier_id: transactions.cashierId,
        cashier_name: users.name,
        total_amount: transactions.totalAmount,
        payment_method: transactions.paymentMethod,
        payment_status: transactions.paymentStatus,
        cash_received: transactions.cashReceived,
        cash_change: transactions.cashChange,
        qris_payload: transactions.qrisPayload,
        created_at: transactions.createdAt,
      })
      .from(transactions)
      .innerJoin(users, eq(transactions.cashierId, users.id))
      .where(gte(transactions.createdAt, startOfToday))
      .orderBy(desc(transactions.createdAt));
  }
}
