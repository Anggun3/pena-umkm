import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Meng-hash password menggunakan bcrypt.
 * @param password Password text asli
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Membandingkan password teks asli dengan hash.
 * @param password Password text asli
 * @param hash Password hash yang tersimpan di DB
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
