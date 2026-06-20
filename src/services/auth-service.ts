import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export class AuthService {
  /**
   * Validasi login:
   * Cari user berdasarkan email. Jika email tidak ditemukan atau
   * password salah, kembalikan pesan error standar "Email atau password salah".
   * Jika sukses, kembalikan objek berisi id dan role dari user tersebut.
   */
  static async login(emailInput: string, passwordInput: string) {
    const foundUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, emailInput))
      .limit(1);

    if (foundUsers.length === 0) {
      throw new Error("Email atau password salah");
    }

    const user = foundUsers[0];
    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);

    if (!isPasswordValid) {
      throw new Error("Email atau password salah");
    }

    return {
      id: user.id,
      role: user.role,
    };
  }
}
