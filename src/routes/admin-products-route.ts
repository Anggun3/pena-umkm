import { Elysia, t } from "elysia";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/admin-products-service";

export const adminProductsRoute = new Elysia({ prefix: "/api/admin/products" })
  // POST /api/admin/products — Tambah produk baru
  .post(
    "/",
    async ({ body, set }) => {
      try {
        await createProduct({
          name: body.name,
          cost_price: Number(body.cost_price),
          selling_price: Number(body.selling_price),
          stock: Number(body.stock),
          category: body.category,
          image: body.image as File | undefined,
        });
        return { data: "Produk berhasil ditambahkan" };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message || "Gagal menambahkan produk" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        cost_price: t.String(),
        selling_price: t.String(),
        stock: t.String(),
        category: t.String(),
        image: t.Optional(t.File()),
      }),
      type: "multipart/form-data",
    }
  )
  // PUT /api/admin/products/:id — Edit produk
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        await updateProduct(Number(params.id), {
          name: body.name,
          selling_price: Number(body.selling_price),
          stock: Number(body.stock),
          image: body.image as File | undefined,
        });
        return { data: "Produk berhasil diperbarui" };
      } catch (error: any) {
        set.status = error.message === "Produk tidak ditemukan" ? 404 : 500;
        return { error: error.message || "Gagal memperbarui produk" };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        selling_price: t.String(),
        stock: t.String(),
        image: t.Optional(t.File()),
      }),
      type: "multipart/form-data",
    }
  )
  // DELETE /api/admin/products/:id — Hapus produk
  .delete("/:id", async ({ params, set }) => {
    try {
      await deleteProduct(Number(params.id));
      return { data: "Produk berhasil dihapus" };
    } catch (error: any) {
      set.status = error.message === "Produk tidak ditemukan" ? 404 : 500;
      return { error: error.message || "Gagal menghapus produk" };
    }
  });
