import { db } from "../db/db";
import { products } from "../db/schema";
import { eq, gt, like, and } from "drizzle-orm";

const DEFAULT_IMAGE = "/public/default-product.png";

/**
 * Ambil daftar katalog produk untuk tampilan kasir.
 * - Hanya tampilkan produk dengan stock > 0.
 * - Mendukung filter `search` (berdasarkan nama) dan `category`.
 * - Jika image_url null, kembalikan URL placeholder default.
 */
export async function getCatalog(params: {
  search?: string;
  category?: string;
}) {
  // Bangun kondisi filter
  const conditions = [gt(products.stock, 0)];

  if (params.category) {
    conditions.push(eq(products.category, params.category));
  }

  if (params.search) {
    conditions.push(like(products.name, `%${params.search}%`));
  }

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      selling_price: products.sellingPrice,
      stock: products.stock,
      category: products.category,
      image_url: products.imageUrl,
    })
    .from(products)
    .where(and(...conditions));

  // Ganti image_url null dengan URL placeholder
  return rows.map((row) => ({
    ...row,
    image_url: row.image_url ?? DEFAULT_IMAGE,
  }));
}
