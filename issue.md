Buat skema database relasional untuk menyimpan data penjualan, lalu implementasikan core engine transaksi kasir (Tunai & QRIS), webhook QRIS, ringkasan statistik admin, serta ekspor laporan keuangan cetak.

buat tabel transactions:
id integer auto increment primary key
invoice_number varchar 50 not null unique
cashier_id integer not null (foreign key ke users.id)
total_amount integer not null
payment_method enum('tunai', 'qris') not null
payment_status enum('pending', 'lunas', 'batal') not null default 'pending'
cash_received integer default 0
cash_change integer default 0
qris_payload text default null
created_at timestamp default current_timestamp

buat tabel transaction_details:
id integer auto increment primary key
transaction_id integer not null (foreign key ke transactions.id)
product_id integer not null (foreign key ke products.id)
quantity integer not null
price integer not null

---

buat API untuk membuat transaksi penjualan baru (Checkout POS)

Struktur Folder di dalam src:
- routes: berisi routing elysia js (format: transactions-route.ts, dashboard-route.ts, reports-route.ts)
- services: berisi logic bisnis aplikasi (format: transactions-service.ts, dashboard-service.ts, reports-service.ts)

Endpoint : POST /api/transactions

Request Body :
{
  "payment_method": "qris",
  "cash_received": 0,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}

Logika Bisnis di dalam transactions-service.ts :
1. Kurangi stok barang di tabel products sesuai kuantitas item yang dibeli secara atomik (Gunakan DB Transaction). Jika ada produk dengan stok tidak mencukupi, batalkan transaksi dan throw error.
2. Jika payment_method tunai, lakukan validasi kelayakan nominal uang lalu hitung otomatis: cash_change = cash_received - total_amount. Set status menjadi 'lunas'.
3. Jika payment_method qris, buat string payload invoice unik, lalu gunakan library `qrcode` untuk mengubah teks payload menjadi bentuk gambar Base64 string. Set status menjadi 'pending'.

Response Body (Succes - QRIS) :
{
  "invoice_number": "INV-20260616-001",
  "total_amount": 30000,
  "payment_status": "pending",
  "qris_base64": "data:image/png;base64,iVBOR..."
}

Response Body (Succes - Tunai) :
{
  "invoice_number": "INV-20260616-002",
  "total_amount": 30000,
  "payment_status": "lunas",
  "cash_change": 20000
}

---

buat API Webhook Verifikasi Pembayaran QRIS Otomatis
Endpoint : POST /api/webhook/qris-verify
Request Body :
{
  "invoice_number": "INV-20260616-001",
  "status": "SUCCESS"
}
Response Body : { "data": "Status transaksi berhasil diperbarui" }

---

buat API untuk menampilkan riwayat transaksi kasir hari ini
Endpoint : GET /api/transactions/today
Response Body : List array objek transaksi harian kasir yang aktif.

---

buat API untuk mengambil data ringkasan statistik dashboard bisnis utama admin
Endpoint : GET /api/admin/dashboard/overview
Response Body :
{
  "total_revenue_today": 1500000,
  "total_transactions_today": 45,
  "top_products": [{ "name": "Kopi Susu", "sold_quantity": 28 }]
}

---

buat API untuk melakukan ekspor laporan ringkasan data finansial periodik toko
1. Export Excel -> GET /api/admin/reports/excel?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD (Output: File Stream .xlsx)
2. Export PDF -> GET /api/admin/reports/pdf?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD (Output: File Stream .pdf)

---

Tahapan Implementasi Hands-on:
1. Definisikan tabel `transactions` dan `transaction_details` ke database via Drizzle ORM.
2. Buat file `src/services/transactions-service.ts`. Di dalamnya, tulis fungsi/class checkout kompleks menggunakan fitur database transaction (`db.transaction`). Implementasikan loop item untuk memotong kuantitas stok produk, kalkulasi matematika untuk total belanja dan nilai uang kembalian, serta integrasikan generator library `qrcode` untuk konversi payload ke format Base64 image string.
3. Tulis fungsi handler untuk webhook verifikasi QRIS yang bertugas mencari record invoice terkait dan mengubah datanya menjadi 'lunas' jika pembayarannya terverifikasi sukses.
4. Buat file `src/services/dashboard-service.ts`. Susun fungsi agregasi database menggunakan Drizzle (seperti fungsi `sum`, `count`, dan order pengelompokan `groupBy`) untuk merangkum total omset harian serta melacak peringkat produk paling laku terjual.
5. Buat file `src/services/reports-service.ts`. Integrasikan library `exceljs` untuk memasukkan baris data mentah transaksi secara rapi ke file spreadsheet. Tulis juga logika generator dokumen menggunakan `pdfkit` dengan menyusun tata letak layout grid tabel keuangan statis yang rapi.
6. Pasang dan hubungkan seluruh fungsi service ini ke masing-masing file routingnya (`transactions-route.ts`, `dashboard-route.ts`, `reports-route.ts`) di folder `src/routes/`. Pastikan diproteksi menggunakan middleware validasi token peran (role-based security) yang sesuai.
