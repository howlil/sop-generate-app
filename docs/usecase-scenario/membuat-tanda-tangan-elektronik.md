# Dokumen Skenario Use Case: Membuat Tanda Tangan Elektronik

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Membuat Tanda Tangan Elektronik"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Membuat Tanda Tangan Elektronik |
| **ID** | UCM-18 |
| **Aktor Utama** | PJ Evaluator Organisasi, Kepala OPD |
| **Aktor Terlibat** | Sistem (Kriptografi dan Kredensial) |
| **Prasyarat** | Pengguna aktif yang memiliki kewenangan legalisasi dokumen TTE. Pengguna belum mengkonfigurasi PIN (atau ingin melakukan pembaruan PIN). |
| **Pemicu** | Pengguna mengakses sub-menu Profil TTE untuk registrasi atau setup inisial kredensial persetujuan (PIN). |
| **Alur Utama** | 1. Pengguna membuka form registrasi/pengaturan PIN TTE di halaman profil.<br>2. Pengguna menginputkan PIN sejumlah format digit yang diizinkan sistem beserta input konfirmasi ulang PIN.<br>3. Client mengirim HTTP request (POST/PATCH) ke rute `/tte/profil`.<br>4. Server memverifikasi kecocokan antara kolom PIN awal dengan konfirmasi PIN yang direquest.<br>5. Server mensimulasikan mekanisme komputasi algoritma hashing sandi searah yang dikhususkan pada nilai raw PIN.<br>6. Server menyimpan hash signature yang matang tersebut ke kolom basis data `Pengguna.ttePinHash` dan menetapkan checkpoint log stempel waktu pada atribut `Pengguna.ttePinSetAt` ke zona `DateTime` saat itu juga.<br>7. Server membalas respon HTTP berhasil ke klien aplikasi frontend. |
| **Alur Alternatif** | - **Gagal Konfirmasi:** Jika data PIN primer dan repetisi konfirmasi memiliki selisih ketidakcocokan (mismatch), server merespons rejection validasi (HTTP 400).<br>- **Ubah/Reset PIN Lama:** Apabila pengguna bertujuan memodifikasi PIN yang sudah ada (status update), sistem akan memaksa pengguna untuk mendeklarasikan input PIN autentik (lama) yang akurat. Server menyelenggarakan *hash comparison* terlebih dahulu terhadap data lama sebelum bisa men-commit penulisan `ttePinHash` substitusi yang baru ke DB. |
| **Hasil Akhir** | Kredibilitas sandi verifikasi legal penandatanganan elektronik (`TTE PIN`) individu pengguna terjamin asuransinya dengan mekanisme penyediaan persistensi format hash terenkripsi. |
