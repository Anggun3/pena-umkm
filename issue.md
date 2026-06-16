# Issue: Inisialisasi Project, Setup Drizzle ORM, dan API Profil Toko (Shop Profile)

## Deskripsi Tugas
Melakukan inisialisasi awal project menggunakan Bun dan ElysiaJS. Setup Drizzle ORM untuk menghubungkan ke database MySQL, lalu buat tabel `shop_profile` dan endpoint API untuk memperbarui profil toko UMKM (Admin).

---

## 1. Skema Tabel `shop_profile`
Definisikan tabel `shop_profile` di Drizzle ORM dengan spesifikasi:
- `id`: `integer`, primary key, default `1`
- `shop_name`: `varchar(255)`, `not null`
- `address`: `text`, `not null`
- `phone`: `varchar(20)`, `not null`
- `receipt_greeting`: `text`, default `null`

---

## 2. API Endpoint
- **Method**: `PUT`
- **Path**: `/api/admin/shop-profile`
- **Request Body**:
  ```json
  {
    "shop_name": "PenaUMKM Cabang Malang",
    "address": "Jl. GKB IV UMM, Lowokwaru, Malang",
    "phone": "08123456789",
    "receipt_greeting": "Terima kasih sudah berbelanja di toko kami!"
  }
  ```
- **Response Body (Success)**:
  ```json
  {
    "data": "Profil toko berhasil diperbarui"
  }
  ```

---

## 3. Struktur Folder di dalam `src`
- `routes`: berisi routing ElysiaJS (format: `shop-route.ts`)
- `services`: berisi logic bisnis aplikasi (format: `shop-service.ts`)

---

## 4. Tahapan Implementasi
1. Jalankan `bun init` dan pasang dependensi `elysia`, `drizzle-orm`, serta `mysql2`.
2. Buat file skema Drizzle untuk mendefinisikan struktur tabel `shop_profile` dan jalankan migrasi database ke MySQL.
3. Buat file `src/services/shop-service.ts`. Di dalamnya, tulis fungsi/class untuk melakukan operasi upsert (update jika data `id = 1` sudah ada, insert jika belum) menggunakan Drizzle.
4. Buat file `src/routes/shop-route.ts`. Definisikan rute `PUT /api/admin/shop-profile`, validasi request body, lalu panggil fungsi dari `shop-service.ts`.
5. Daftarkan router tersebut ke file utama aplikasi (`src/index.ts`).
