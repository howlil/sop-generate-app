# Skenario UC-21: Memverifikasi PDF Unduhan dan QR Pengesahan

Dokumen ini merinci verifikasi dokumen PDF yang diunduh setelah pengesahan TTE, terkait UC-20 (Memeriksa Pengesahan TTE) dan integration test IT-76–IT-81.

## Identitas

| Elemen | Deskripsi |
| :--- | :--- |
| ID use case | UC-21 |
| Nama | Memverifikasi PDF unduhan dan QR pengesahan |
| Aktor utama | Pengunjung / pemeriksa dokumen |
| Aktor terlibat | Sistem verifikasi TTE, CA internal penandatanganan PDF |

## Prasyarat

- Dokumen sudah melalui alur TTE di aplikasi (riwayat penandatangan tercatat).
- Server mengaktifkan `PDF_SIGNING_ENABLED` dengan rantai sertifikat P12 internal.
- PDF unduhan memuat QR menuju `/validasi/pengesahan/{dokumenTteId}/{userId}`.

## Pemicu

Pengunjung memindai QR pada PDF atau mengunggah PDF bertanda tangan ke halaman verifikasi PDF publik.

## Alur utama — QR penandatangan

1. Pengunjung memindai QR pada PDF (Berita Acara atau SOP).
2. Browser membuka halaman validasi pengesahan dengan `dokumenTteId` dan `userId` penandatangan.
3. Sistem memanggil `GET /tte/public/pengesahan/:dokumenTteId/:userId`.
4. Sistem menampilkan identitas penandatangan, peran, waktu pengesahan, dan ringkasan dokumen.

## Alur utama — PDF + CA internal

1. Pengunjung mengunggah PDF yang diunduh setelah penandatanganan server (PKCS#7).
2. Sistem memanggil `POST /tte/public/pdf/verify` dengan berkas PDF (base64).
3. Sistem memverifikasi digest dan rantai sertifikat terhadap CA internal yang dikonfigurasi di server.
4. Sistem menampilkan status valid/tidak valid per tanda tangan beserta subjek penandatangan.

## Alur alternatif

- Jika pasangan `(dokumenTteId, userId)` tidak ada di riwayat TTE, API pengesahan mengembalikan tidak ditemukan (404).
- Jika PDF tidak memuat tanda tangan digital, verifikasi PDF menyatakan `hasSignatures: false` dan `allValid: false`.
- Jika penandatanganan PDF server nonaktif, unduhan tetap berisi QR aplikasi; verifikasi PKCS#7 tidak tersedia.

## Hasil akhir

Pengunjung dapat membuktikan bahwa QR mengarah ke penandatangan yang tercatat di sistem, dan bahwa PDF unduhan memuat tanda tangan digital yang valid menurut CA internal aplikasi (bukan pengganti portal BSrE/Komdigi).

## Pemetaan integration test

| ID | Skenario |
| :--- | :--- |
| IT-76 | QR BA → pengesahan publik PJ Evaluator |
| IT-77 | QR SOP → pengesahan publik Kepala OPD |
| IT-78 | Sign + verify PDF SOP |
| IT-79 | Sign + verify PDF Berita Acara arsip |
| IT-80 | PDF unsigned ditolak |
| IT-81 | userId salah pada pengesahan publik |
