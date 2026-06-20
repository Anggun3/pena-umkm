import { Elysia, t } from "elysia";
import { getCatalog } from "../services/products-service";

export const productsRoute = new Elysia({ prefix: "/api/products" })
  // GET /api/products — Tampilan katalog untuk kasir
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const catalog = await getCatalog({
          search: query.search,
          category: query.category,
        });
        return catalog;
      } catch (error: any) {
        set.status = 500;
        return { error: error.message || "Gagal mengambil data produk" };
      }
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
        category: t.Optional(t.String()),
      }),
    }
  );
