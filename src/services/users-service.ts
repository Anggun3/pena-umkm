import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "kasir";
}

export class UsersService {
  /**
   * Registrasi user baru:
   * 1. Cek apakah email sudah terdaftar.
   * 2. Lakukan hash password dengan bcrypt.
   * 3. Simpan data user ke database.
   */
  static async registerUser(data: RegisterUserData): Promise<void> {
    // 1. Cek email unik
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email sudah terdaftar");
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Simpan ke database
    await db.insert(users).values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });
  }

  /**
   * Ambil data user berdasarkan ID (tanpa password).
   */
  static async getUserById(id: number) {
    const found = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (found.length === 0) {
      throw new Error("User tidak ditemukan");
    }

    return found[0];
  }
}
