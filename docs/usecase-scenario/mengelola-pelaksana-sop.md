# Dokumen Skenario Use Case: Mengelola Pelaksana SOP

Berikut adalah skenario penggunaan (use case scenario) untuk fitur **"Mengelola Pelaksana SOP"** yang diinisiasi oleh aktor utama pada Sistem Informasi Manajemen dan Evaluasi SOP. Dokumen ini mendeskripsikan spesifikasi alur perilaku sistem secara rinci dan sinkron dengan implementasi model logika server (Prisma dan State Engine API).

---

### Skenario Use Case

| Elemen | Deskripsi |
| :--- | :--- |
| **Nama Use Case** | Mengelola Pelaksana SOP |
| **ID** | UCM-15 |
| **Aktor Utama** | PJ Penyusun, Penyusun |
| **Aktor Terlibat** | Sistem (Swimlane Mapper) |
| **Prasyarat** | Login sebagai PENYUSUN atau PJ_PENYUSUN. |
| **Pemicu** | Pendefinisian master Pelaksana di OPD (stakeholder) dan penugasan Pelaksana ke dalam format swimlane SOP spesifik. |
| **Alur Utama** | 1. Pengguna membuka modul Pelaksana atau mengakses via panel konfigurasi swimlane.<br>2. Untuk menambah master: Client menembak API pembuatan master data `Pelaksana` (menyimpan string nama pelaksana).<br>3. Server memasukkan entri `Pelaksana` yang terikat pada `opdId` pengguna di DB.<br>4. Untuk SOP: Pengguna melakukan drag and drop atau attach Pelaksana ke SOP terkait.<br>5. Server menghubungkannya lewat entitas junction `DetailSOPPelaksana`, mencatat indeks urutan kolom (swimlane) untuk keperluan render UI Flowchart. |
| **Alur Alternatif** | - **Delete Pelaksana Master:** Jika di-delete dari list master namun sudah terikat dengan tabel `LangkahSOP` yang sudah dieksekusi/draft, sistem memberlakukan relasi restriksi untuk menghindari orphaned record (cascade delete ditolak HTTP 409 Conflict jika dokumen esensial sudah menguncinya). |
| **Hasil Akhir** | Data peran-aktor-prosedur (stakeholder internal OPD) tercukupi dan terintegrasi dengan langkah SOP berbasis database relasional. |
