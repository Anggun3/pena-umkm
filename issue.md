# Rencana Implementasi Proyek Backend

Dokumen ini berisi instruksi tingkat tinggi (high-level) untuk menginisialisasi dan membangun proyek backend baru di direktori ini. Dokumen ini ditujukan bagi programmer atau AI model untuk mengimplementasikan dasar-dasar aplikasi.

## 1. Inisialisasi Proyek
- Lakukan inisialisasi project baru di dalam folder saat ini menggunakan **Bun** (misal: `bun init`).
- Pastikan pengaturan `package.json` dan file konfigurasi TypeScript (jika menggunakan TS) sudah di-generate secara default oleh Bun.

## 2. Instalasi Dependensi
Gunakan package manager Bun (`bun install` / `bun add`) untuk menginstal library berikut:

**Core Framework & Plugin:**
- `elysia` (ElysiaJS sebagai web framework utama)
- `@elysiajs/jwt` (untuk manajemen token JWT)
- `@elysiajs/cors` (untuk pengaturan CORS)

**Database & ORM:**
- `drizzle-orm` (sebagai ORM)
- `drizzle-kit` (sebagai development tool untuk migrasi skema database)
- Driver MySQL yang kompatibel (misalnya `mysql2`)

**Keamanan & Utilitas:**
- `bcrypt` (atau library pendukung bcrypt lainnya untuk hashing password)
- `qrcode` (untuk meng-generate QR code)
- `exceljs` (untuk manajemen dan export/import file Excel)
- `pdfkit` (untuk meng-generate dokumen PDF)

## 3. Konfigurasi Database (MySQL + Drizzle)
- Buat koneksi database ke **MySQL** menggunakan Drizzle.
- Buat sebuah file skema database awal (schema) sebagai contoh struktur data.
- Siapkan *migration script* di `package.json` untuk menjalankan *drizzle-kit*.

## 4. Setup Server (ElysiaJS)
- Buat file utama untuk menjalankan server aplikasi (contoh: `src/index.ts`).
- Inisialisasi framework ElysiaJS.
- Terapkan (register) plugin CORS dan JWT secara global pada instance Elysia.
- Buat sebuah route dasar (contoh: `GET /`) yang me-return *health-check* atau pesan sederhana untuk memverifikasi bahwa server menyala dengan baik.

## 5. Persiapan Utilitas
- Buat folder khusus untuk utilitas/helpers.
- Siapkan fungsi/modul dasar (stub) untuk fungsi hashing bcrypt, pembuatan QR code, pembuatan PDF, dan pembuatan Excel. Fungsi-fungsi ini nantinya akan dipanggil dari rute/kontroler yang sebenarnya.

---
**Catatan untuk Implementator:** Fokus pada pembuatan struktur dasar yang bersih dan memastikan semua dependensi di atas dapat berjalan tanpa error ketika server dihidupkan. Tidak perlu menulis seluruh business logic (CRUD lengkap) pada tahap inisialisasi ini.
