import { db } from "../db/db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

// Durasi session: 24 jam
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export class AuthService {
  /**
   * Login user:
   * 1. Validasi email & password.
   * 2. Buat session baru di tabel `sessions`.
   * 3. Kembalikan token session dan data user.
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

    // Buat token session unik
    const sessionToken = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // Simpan session ke database
    await db.insert(sessions).values({
      id: sessionToken,
      userId: user.id,
      expiresAt,
    });

    return {
      token: sessionToken,
      role: user.role,
    };
  }

  /**
   * Logout user:
   * Hapus session dari database berdasarkan token.
   */
  static async logout(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.id, token));
  }

  /**
   * Verifikasi session token:
   * 1. Cari session berdasarkan token.
   * 2. Periksa apakah session sudah kadaluwarsa.
   * 3. Kembalikan data user (id dan role).
   */
  static async verifySession(token: string) {
    const found = await db
      .select({
        sessionId: sessions.id,
        expiresAt: sessions.expiresAt,
        userId: sessions.userId,
        userRole: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, token))
      .limit(1);

    if (found.length === 0) {
      return null;
    }

    const session = found[0];

    // Cek apakah session sudah expired
    if (new Date() > new Date(session.expiresAt)) {
      // Hapus session yang sudah expired
      await db.delete(sessions).where(eq(sessions.id, token));
      return null;
    }

    return {
      id: session.userId,
      role: session.userRole as "admin" | "kasir",
    };
  }
}
