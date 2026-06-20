Buat migrasi database untuk tabel users, lalu buat fungsi registrasi akun baru menggunakan enkripsi password.

buat tabel users:
id integer auto increment primary key
name varchar 255 not null
email varchar 255 not null unique
password varchar 255 not null (password merupakan hash dari bcrypt)
role enum('admin', 'kasir') not null default 'kasir'
created_at timestamp default current_timestamp

---

buat API untuk registrasi user baru

Struktur Folder di dalam src:
- routes: berisi routing elysia js (format: users-route.ts)
- services: berisi logic bisnis aplikasi (format: users-service.ts)

Endpoint : POST /api/users

Request Body :
{
  "name": "Anggun Oktaviana",
  "email": "AnggunOcta@gmail.com",
  "password": "rahasia123",
  "role": "kasir"
}

Response Body (Succes) :
{
  "data": "OK"
}

Response Body (Error) :
{
  "error": "Email sudah terdaftar"
}

---

Tahapan Implementasi Hands-on:
1. Tambahkan definisi tabel `users` ke dalam skema Drizzle ORM Anda dan lakukan push/generate migrasi database.
2. Buat file `src/services/users-service.ts`. Tulis fungsi asinkronus untuk menangani registrasi user.
3. Di dalam service, lakukan pengecekan terlebih dahulu ke database apakah email sudah terdaftar. Jika sudah, lempar/return error.
4. Jika email aman, gunakan library `bcrypt` untuk melakukan proses hashing pada string `password` sebelum disimpan. Simpan data user baru ke database MySQL via Drizzle.
5. Buat file `src/routes/users-route.ts`. Inisialisasi router ElysiaJS, buat endpoint `POST /api/users`, tangkap request body, panggil service tersebut, dan handle return response sukses/error sesuai spesifikasi.
