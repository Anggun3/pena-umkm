# ISSUE: Inisialisasi Project, Setup Drizzle ORM, & Implementasi Fitur Profil Toko serta Autentikasi Lengkap (Registrasi, Login, Get User, Logout)

## Deskripsi Perencanaan
Lakukan inisialisasi awal project backend menggunakan Bun dan ElysiaJS. Setup Drizzle ORM untuk menghubungkan server ke database MySQL lokal (`pena_umkm`). Setelah itu, implementasikan skema basis data beserta API endpoint dengan arsitektur terpisah (Route & Service) untuk fitur Profil Toko dan manajemen Autentikasi pengguna secara menyeluruh.

---

## 1. Basis Data (MySQL via Drizzle ORM)

### A. Tabel `shop_profile`
- **id**: integer (primary key, default nilai = `1`)
- **shop_name**: varchar 255 (not null)
- **address**: text (not null)
- **phone**: varchar 20 (not null)
- **receipt_greeting**: text (default null)

### B. Tabel `users`
- **id**: integer (auto increment, primary key)
- **name**: varchar 255 (not null)
- **email**: varchar 255 (not null, unique)
- **password**: varchar 255 (not null) -> Hash bcrypt.
- **role**: enum ('admin', 'kasir') (not null, default = 'kasir')
- **created_at**: timestamp (default current_timestamp)

### C. Tabel `sessions`
Digunakan untuk menyimpan token login aktif (Session-based Auth):
- **id**: varchar 255 (primary key) -> Tempat menyimpan token session string / UUID.
- **user_id**: integer (not null) -> Foreign key yang berelasi ke `users.id`.
- **expires_at**: datetime (not null) -> Batas waktu masa aktif login.

---

## 2. Spesifikasi API Endpoints

### A. Perbarui Profil Toko (Admin)
- **Method / Endpoint:** `PUT /api/admin/shop-profile`
- **Request Body:** `{ "shop_name": "...", "address": "...", "phone": "...", "receipt_greeting": "..." }`
- **Response Success (200):** `{ "data": "Profil toko berhasil diperbarui" }`

### B. Registrasi User Baru
- **Method / Endpoint:** `POST /api/users`
- **Request Body:** `{ "name": "...", "email": "...", "password": "...", "role": "..." }`
- **Response Success (201):** `{ "data": "OK" }`
- **Response Error (400):** `{ "error": "Email sudah terdaftar" }`

### C. Login User
- **Method / Endpoint:** `POST /api/auth/login`
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response Success (200):** Menghasilkan session baru, menyimpan token di cookie/body, dan mengembalikan `{ "data": { "token": "..." } }`
- **Response Error (401):** `{ "error": "Email atau password salah" }`

### D. Get Current User (Cek Profil Aktif)
- **Method / Endpoint:** `GET /api/users/me`
- **Headers:** `Authorization: Bearer <token>` atau via Cookie Session.
- **Response Success (200):** `{ "data": { "id": 1, "name": "Eko", "email": "eko@localhost", "role": "kasir" } }`

### E. Log Out User
- **Method / Endpoint:** `POST /api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`
- **Response Success (200):** Menghapus data session dari tabel `sessions` dan mengembalikan `{ "data": "Logout berhasil" }`

---

## 3. Struktur Folder dan File (di dalam `src`)
- **`src/db/schema.ts`** -> Deklarasi skema tabel `shop_profile`, `users`, dan `sessions`.
- **`src/services/shop-service.ts`** & **`src/services/auth-service.ts`** -> Logic bisnis aplikasi.
- **`src/routes/shop-route.ts`** & **`src/routes/auth-route.ts`** -> Routing ElysiaJS & Validasi Input.
- **`src/index.ts`** -> Entrypoint server utama.

---

## 4. Tahapan Implementasi Hands-on

### Langkah 1: Install Dependencies & Push Database
```bash
bun init
bun add elysia drizzle-orm mysql2 bcrypt crypto
bun add -d drizzle-kit @types/bcrypt
bun drizzle-kit push
```
