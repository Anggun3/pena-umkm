import { Elysia, t } from "elysia";
import { ShopService } from "../services/shop-service";

export const shopRoute = new Elysia({ prefix: "/api/admin" })
  // GET /api/admin/shop-profile — Ambil profil toko
  .get("/shop-profile", async ({ set }) => {
    try {
      const profile = await ShopService.getShopProfile();
      if (!profile) {
        set.status = 404;
        return { error: "Profil toko belum diisi" };
      }
      return { data: profile };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message || "Gagal mengambil profil toko" };
    }
  })
  // PUT /api/admin/shop-profile — Perbarui profil toko
  .put(
    "/shop-profile",
    async ({ body }) => {
      await ShopService.upsertShopProfile(body);
      return { data: "Profil toko berhasil diperbarui" };
    },
    {
      body: t.Object({
        shop_name: t.String({ minLength: 1 }),
        address: t.String({ minLength: 1 }),
        phone: t.String({ minLength: 1 }),
        receipt_greeting: t.Optional(t.String()),
      }),
    }
  );
