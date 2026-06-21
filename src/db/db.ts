import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import { config } from "../config/env";

// Membuat connection pool ke MySQL menggunakan URL dari konfigurasi terpusat
export const pool = mysql.createPool(config.databaseUrl);

// Inisialisasi instance Drizzle ORM
export const db = drizzle(pool, { schema, mode: "default" });

