# Dokumen Skenario Use Case: Inisiasi Dokumen SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Inisiasi Dokumen SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Inisiasi Dokumen SOP |
| **ID** | UCM-16 |
| **Aktor Utama** | PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Inisialisasi Entity) |
| **Prasyarat** | Pengguna aktif dan otorisasi authoring divalidasi. |
| **Pemicu** | Kebutuhan menerbitkan standar prosedural operasi baru di instansi OPD lokal. |
| **Alur Utama** | 1. Pengguna menekan tombol Buat SOP Baru lewat UI Create SOP.<br>2. Mengisikan parameter esensial: Judul SOP dan Nomor SOP.<br>3. Client melakukan POST ke endpoint `/sop`.<br>4. Server memeriksa field `nomorSOP` agar dipastikan unik secara global di seluruh database (berdasarkan index `nomorSOP @unique`).<br>5. Server membuat objek indukan `SOP` di-assign ke `opdId` terkait, serta membentuk child objek `DetailSOP` berversi awal `versi = 1` dengan `status = DRAFT`.<br>6. Server mengatur nilai `dibuatOlehId` merujuk ke primary key (UUID) pengguna yang memicu.<br>7. Client menerima respons 201 Created dan melakukan navigasi re-routing ke editor workbench SOP tersebut. |
| **Alur Alternatif** | - **Nomor Duplikat:** Validasi global DB constraint fail (HTTP 409 Conflict). Sistem menampilkan pesan agar pengguna menggunakan identifikasi nomor SOP lain yang belum diregistrasi oleh instansi manapun.<br>- **Revisi Resmi (Versi Baru):** Jika diinisiasi lewat aksi POST `/sop/:id/buat-versi-baru` dari sebuah dokumen `BERLAKU`, sistem melakukan metode deep-copy spesifikasi dokumen lama ke iterasi versi selanjutnya (`versi + 1`), mempertahankan status awal `DRAFT`, dan menyimpan jejak relasional via kolom `revisiDariDetailSopId`. |
| **Hasil Akhir** | Wadah data arsitektur dokumen (`SOP` dan `DetailSOP`) terinisiasi terpusat dengan kepemilikan mutlak afiliasi unit organisasi bersangkutan. |
