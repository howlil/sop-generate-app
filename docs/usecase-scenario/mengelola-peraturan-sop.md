# Dokumen Skenario Use Case: Mengelola Peraturan SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola Peraturan SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola Peraturan SOP |
| **ID** | UCM-17 |
| **Aktor Utama** | PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Master Regulasi) |
| **Prasyarat** | Pengguna telah masuk sebagai author di modul manajemen peraturan. |
| **Pemicu** | Pengguna butuh mendaftarkan undang-undang, keputusan direksi, atau dasar regulasi sebagai referensi dasar hukum prosedur. |
| **Alur Utama** | 1. Pada navigasi Dashboard OPD atau di tab Dasar Hukum editor SOP, pengguna menginputkan pencarian nama, nomor, dan tahun peraturan.<br>2. Client mengirim payload POST data registri dasar hukum ke master `Peraturan`.<br>3. Server menjaga constraint kombinasi unik kolom `nomor` dan `tahun` (`@@unique([nomor, tahun])`).<br>4. Server menyimpan record peraturan dan otomatis membuat skema relasi di tabel `OPDPeraturan` (many-to-many) ke ID OPD terkait.<br>5. Dalam konteks spesifik SOP, server menautkan referensi pada tabel junction sekunder bernama `DasarHukum`. |
| **Alur Alternatif** | - **Regulasi Shared/Sudah Tersedia:** Jika OPD lain (lintas instansi) telah lebih dahulu mendaftarkan peraturan dengan nomor+tahun yang sama (misal UU Nasional), server hanya akan mengikat relasi ulang di `OPDPeraturan` tanpa melipatgandakan duplikasi record entitas (`reusing existing record`). |
| **Hasil Akhir** | Integrasi relasi dasar perundang-undangan tersimpan pada layer arsitektur data global secara termormalisasi, dan tereferensi di masing-masing dokumen SOP lokal. |
