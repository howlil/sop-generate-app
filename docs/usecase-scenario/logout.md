# Dokumen Skenario Use Case: Logout

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Logout"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Logout |
| **ID** | UCM-13 |
| **Aktor Utama** | PJ Evaluator Organisasi, Evaluator, Kepala OPD, PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Manajer Sesi) |
| **Prasyarat** | Pengguna memiliki sesi login yang valid (token JWT HttpOnly). |
| **Pemicu** | Pengguna menekan opsi keluar di antarmuka profil untuk mengakhiri sesi. |
| **Alur Utama** | 1. Client mengirim command pemutusan sesi/logout ke server.<br>2. Server/Client menghapus/menginvalidasi token cookie kredensial.<br>3. Sistem melakukan redirection UI ke laman Landing Page Publik (Arsip Publik). |
| **Alur Alternatif** | - |
| **Hasil Akhir** | Akses privat (privilege context) tercabut, mencegah penyalahgunaan akun pada peramban web yang sama. |
