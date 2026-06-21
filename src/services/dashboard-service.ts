import { db } from "../db/db";
import { transactions, transactionDetails, products } from "../db/schema";
import { eq, gte, sum, count, desc, and } from "drizzle-orm";

export class DashboardService {
  /**
   * Mengambil ringkasan data statistik utama untuk dashboard admin.
   */
  static async getDashboardOverview() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // 1. Total omset/pendapatan hari ini (transaksi berstatus 'lunas')
    const revenueRes = await db
      .select({ total: sum(transactions.totalAmount) })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startOfToday),
          eq(transactions.paymentStatus, "lunas")
        )
      );
    const totalRevenueToday = Number(revenueRes[0]?.total || 0);

    // 2. Total transaksi sukses hari ini
    const countRes = await db
      .select({ total: count() })
      .from(transactions)
      .where(
        and(
          gte(transactions.createdAt, startOfToday),
          eq(transactions.paymentStatus, "lunas")
        )
      );
    const totalTransactionsToday = Number(countRes[0]?.total || 0);

    // 3. Peringkat produk paling laku terjual hari ini
    const topProductsRes = await db
      .select({
        name: products.name,
        sold_quantity: sum(transactionDetails.quantity),
      })
      .from(transactionDetails)
      .innerJoin(transactions, eq(transactionDetails.transactionId, transactions.id))
      .innerJoin(products, eq(transactionDetails.productId, products.id))
      .where(
        and(
          gte(transactions.createdAt, startOfToday),
          eq(transactions.paymentStatus, "lunas")
        )
      )
      .groupBy(products.id, products.name)
      .orderBy(desc(sum(transactionDetails.quantity)))
      .limit(5); // Ambil top 5 produk

    const topProducts = topProductsRes.map((p) => ({
      name: p.name,
      sold_quantity: Number(p.sold_quantity || 0),
    }));

    return {
      total_revenue_today: totalRevenueToday,
      total_transactions_today: totalTransactionsToday,
      top_products: topProducts,
    };
  }
}
