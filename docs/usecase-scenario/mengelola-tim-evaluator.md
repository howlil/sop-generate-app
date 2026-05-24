# Dokumen Skenario Use Case: Mengelola Tim Evaluator

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola Tim Evaluator"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola Tim Evaluator |
| **ID** | UCM-03 |
| **Aktor Utama** | PJ Evaluator Organisasi |
| **Aktor Terlibat** | Sistem (Basis Data Pengguna) |
| **Prasyarat** | Pengguna login dengan peran PJ_EVALUATOR. Data OPD 'Biro Organisasi' sudah ada. |
| **Pemicu** | Pengguna menambah atau mengatur akun dengan peran EVALUATOR. |
| **Alur Utama** | 1. Pengguna mengakses menu Manajemen Tim Evaluator.<br>2. Pengguna mengisi NIP, Email, Nama, dan memilih peran `EVALUATOR`.<br>3. Client mengirim payload pembuatan user ke server.<br>4. Server memverifikasi keunikan tabel `Pengguna` untuk field `email` dan `nip`.<br>5. Server memasukkan entri `Pengguna` baru dan mengaitkannya ke `opdId` milik Biro Organisasi.<br>6. Server merespons berhasil. |
| **Alur Alternatif** | - **Duplikasi Data:** Jika `email` atau `nip` sudah ada, server mengembalikan error HTTP 409 (Conflict). Sistem menampilkan pesan duplikasi.<br>- **Nonaktifkan Evaluator:** Server memperbarui field `deletedAt` untuk akun terkait tanpa menghilangkan riwayat evaluasi yang pernah dinilai. |
| **Hasil Akhir** | Tim evaluator berhasil diregistrasi/dimodifikasi di dalam sistem dan siap ditugaskan melakukan proses penilaian. |
