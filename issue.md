Buat skema database produk, API kelola barang jualan (Admin), serta API tampilan katalog belanja (Kasir) dengan dukungan static asset plugin untuk file gambar produk.

buat tabel products:
id integer auto increment primary key
name varchar 255 not null
cost_price integer not null
selling_price integer not null
stock integer not null default 0
category varchar 100 not null
image_url varchar 255 default null
created_at timestamp default current_timestamp

---

buat API CRUD Produk (Admin)

Struktur Folder di dalam src:
- routes: berisi routing elysia js (format: admin-products-route.ts)
- services: berisi logic bisnis aplikasi (format: admin-products-service.ts)

1. Tambah Produk Baru
Endpoint : POST /api/admin/products (multipart/form-data)
Fields: name, cost_price, selling_price, stock, category, image [File]
Response: { "data": "Produk berhasil ditambahkan" }

2. Edit Produk
Endpoint : PUT /api/admin/products/:id (multipart/form-data)
Fields: name, selling_price, stock, image [File - Optional]
Response: { "data": "Produk berhasil diperbarui" }

3. Hapus Produk
Endpoint : DELETE /api/admin/products/:id
Response: { "data": "Produk berhasil dihapus" }

---

buat API untuk menampilkan katalog produk (Sisi Kasir)

Struktur Folder di dalam src:
- routes: berisi routing elysia js (format: products-route.ts)
- services: berisi logic bisnis aplikasi (format: products-service.ts)

Endpoint : GET /api/products

Query Parameters : 
search (optional)
category (optional)

Aturan Tambahan:
1. Jika stock == 0, sembunyikan produk dari daftar katalog kasir.
2. Jika image_url bernilai NULL, kembalikan URL gambar placeholder default ("/public/default-product.png").

Response Body (Succes) :
[
  {
    "id": 1,
    "name": "Kopi Susu Gula Aren",
    "selling_price": 15000,
    "stock": 50,
    "category": "Minuman",
    "image_url": "/public/uploads/kopi.png"
  }
]

---

Tahapan Implementasi Hands-on:
1. Buat skema tabel `products` di Drizzle ORM dan terapkan migrasi ke MySQL. Aktifkan juga plugin static file server bawaan ElysiaJS agar folder `/public` bisa diakses publik.
2. Buat file `src/services/admin-products-service.ts`. Tulis fungsi untuk menangani penulisan file ke disk runtime Bun (`Bun.write`) ketika menerima file biner gambar dari client, lalu simpan string lokasinya ke kolom `image_url`. Tulis juga fungsi update dan delete data di database.
3. Buat file `src/routes/admin-products-route.ts`. Definisikan rute CRUD untuk Admin. Gunakan tipe data schema form-data/multipart untuk menangani payload file upload gambar secara aman.
4. Buat file `src/services/products-service.ts` untuk keperluan operasional kasir. Tulis algoritma query pencarian teks (`like`) berdasarkan parameter `search` dan filter data berdasarkan `category`. Tambahkan klausul kondisi di mana `stock > 0` agar produk yang habis otomatis terfilter.
5. Buat file `src/routes/products-route.ts` dengan endpoint `GET /api/products` untuk mengekspos data katalog ke aplikasi front-end kasir.
