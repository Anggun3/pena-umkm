import { db } from "../db/db";
import { shopProfile } from "../db/schema";
import { eq } from "drizzle-orm";

interface ShopProfileData {
  shop_name: string;
  address: string;
  phone: string;
  receipt_greeting?: string | null;
}

export class ShopService {
  /**
   * Upsert shop profile: update jika id=1 sudah ada, insert jika belum.
   */
  static async upsertShopProfile(data: ShopProfileData): Promise<void> {
    const existing = await db
      .select()
      .from(shopProfile)
      .where(eq(shopProfile.id, 1))
      .limit(1);

    if (existing.length > 0) {
      // Update record yang sudah ada
      await db
        .update(shopProfile)
        .set({
          shopName: data.shop_name,
          address: data.address,
          phone: data.phone,
          receiptGreeting: data.receipt_greeting ?? null,
        })
        .where(eq(shopProfile.id, 1));
    } else {
      // Insert record baru dengan id=1
      await db.insert(shopProfile).values({
        id: 1,
        shopName: data.shop_name,
        address: data.address,
        phone: data.phone,
        receiptGreeting: data.receipt_greeting ?? null,
      });
    }
  }
}
