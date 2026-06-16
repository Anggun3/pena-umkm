import { Elysia, t } from "elysia";
import { ShopService } from "../services/shop-service";

export const shopRoute = new Elysia({ prefix: "/api/admin" }).put(
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
