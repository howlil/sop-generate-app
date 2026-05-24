# Dokumen Skenario Use Case: Login

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Login"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Login |
| **ID** | UCM-12 |
| **Aktor Utama** | PJ Evaluator Organisasi, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Manajer Sesi/Autentikasi) |
| **Prasyarat** | Akun telah dibuat oleh admin/PJ Evaluator dengan state `deletedAt = null`. |
| **Pemicu** | Akses awal sistem atau expiration sesi. |
| **Alur Utama** | 1. Input surel/NIP dan kata sandi di formulir aplikasi.<br>2. Server mencari `Pengguna` berdasar identifikasi unik tersebut.<br>3. Server mem-verifikasi hash bcrypt dari kata sandi masukan.<br>4. Server memastikan peran sesuai dan memuat hak akses (RBAC).<br>5. Jika sukses, server menggenerasi JSON Web Token (JWT) yang di dalamnya disematkan klaim utama: `penggunaId`, `opdId`, dan `peran`.<br>6. JWT dibenamkan di response header/cookie pengaman (HttpOnly). |
| **Alur Alternatif** | - **Invalid Credential:** Bila gagal verifikasi hash, server me-return HTTP 401 Unauthorized. UI memunculkan indikasi kesalahan kredensial.<br>- **Akun Dinonaktifkan:** Jika field `deletedAt` tidak null, autentikasi ditolak dengan notifikasi akun sudah dihapus (soft-delete). |
| **Hasil Akhir** | Status autentikasi tercapai dan API guard memberikan akses modul sistem sesuai scope peran. |
