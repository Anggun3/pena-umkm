import { db } from "../db/db";
import { products } from "../db/schema";
import { eq } from "drizzle-orm";
import path from "path";

const UPLOADS_DIR = "public/uploads";
const DEFAULT_IMAGE = "/public/default-product.png";

/**
 * Simpan file gambar ke disk menggunakan Bun.write() dan kembalikan URL-nya.
 */
async function saveImage(imageFile: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${timestamp}_${safeName}`;
  const filePath = path.join(UPLOADS_DIR, filename);
  await Bun.write(filePath, imageFile);
  return `/public/uploads/${filename}`;
}

/**
 * Tambah produk baru ke database.
 */
export async function createProduct(data: {
  name: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  category: string;
  image?: File;
}) {
  let imageUrl: string | null = null;

  if (data.image && data.image.size > 0) {
    imageUrl = await saveImage(data.image);
  }

  await db.insert(products).values({
    name: data.name,
    costPrice: data.cost_price,
    sellingPrice: data.selling_price,
    stock: data.stock,
    category: data.category,
    imageUrl,
  });
}

/**
 * Perbarui data produk berdasarkan ID.
 */
export async function updateProduct(
  id: number,
  data: {
    name: string;
    selling_price: number;
    stock: number;
    image?: File;
  }
) {
  // Cek apakah produk ada
  const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("Produk tidak ditemukan");
  }

  const updateData: Partial<typeof products.$inferInsert> = {
    name: data.name,
    sellingPrice: data.selling_price,
    stock: data.stock,
  };

  if (data.image && data.image.size > 0) {
    updateData.imageUrl = await saveImage(data.image);
  }

  await db.update(products).set(updateData).where(eq(products.id, id));
}

/**
 * Hapus produk berdasarkan ID.
 */
export async function deleteProduct(id: number) {
  const existing = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (existing.length === 0) {
    throw new Error("Produk tidak ditemukan");
  }

  await db.delete(products).where(eq(products.id, id));
}
