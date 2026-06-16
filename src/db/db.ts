import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/pena_umkm";

// Membuat connection pool ke MySQL
export const pool = mysql.createPool(connectionString);

// Inisialisasi instance Drizzle ORM
export const db = drizzle(pool, { schema, mode: "default" });
