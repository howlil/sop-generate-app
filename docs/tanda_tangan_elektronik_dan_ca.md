# Tanda Tangan Elektronik dan Certificate Authority pada SOPFlow

Dokumen ini memisahkan dengan tegas antara **fitur yang diimplementasikan SOPFlow** dan **arsitektur yang direkomendasikan untuk production pemerintahan**.

## Implementasi SOPFlow saat ini

SOPFlow menggunakan TTE internal untuk mendukung demonstrasi alur tanda tangan dan pengesahan dokumen SOP. Implementasi ini tidak terhubung ke BSrE atau PSrE eksternal.

### Certificate personal

Pengguna penandatangan memiliki PKCS#12/P12 personal. P12 dapat dibuat oleh aplikasi atau diunggah melalui profil TTE. Kredensial disimpan per pengguna di MariaDB.

PIN TTE di-hash. Passphrase P12 disimpan dalam bentuk terenkripsi menggunakan AES-256-GCM dengan key yang diturunkan dari PIN pengguna dan `TTE_ENCRYPTION_SECRET` server. Format ciphertext aktif adalah `v2`.

### CA internal

Certificate yang dibuat oleh aplikasi ditandatangani oleh CA internal SOPFlow. Tujuan CA internal ini adalah menghasilkan chain certificate yang konsisten untuk simulasi dan verifikasi internal.

CA internal SOPFlow:

- bukan PSrE tersertifikasi;
- bukan pengganti BSrE;
- tidak dimaksudkan untuk menyatakan status hukum sertifikat elektronik di luar konteks sistem;
- tidak menggunakan HSM production pada implementasi saat ini.

### PDF signing

Backend membuka P12 personal setelah verifikasi PIN, menandatangani PDF, lalu menyimpan artefak hasil signing pada persistent storage. Metadata signature/certificate dan keterkaitannya dengan riwayat TTE disimpan di database.

Default storage PDF pada container adalah `/app/storage/sop-pdf`, dipersistenkan oleh volume Docker `sop_pdf_data`.

### Verifikasi

Halaman/API verifikasi PDF memeriksa signature yang ada di PDF dan mencocokkannya dengan riwayat TTE SOPFlow. QR digunakan sebagai jalur menuju verifikasi internal.

## Perubahan compatibility ciphertext

Aggressive legacy cleanup menghapus fallback decrypt untuk ciphertext P12 passphrase versi lama yang tidak memiliki prefix `v2:`. Data lama tidak dihapus otomatis, tetapi pengguna dengan credential tersebut harus melakukan setup/upload TTE ulang karena aplikasi tidak lagi dapat mendekripsi format lama.

Sebelum deployment ke environment yang pernah menggunakan format lama:

1. buat backup database dan volume PDF;
2. informasikan pengguna penandatangan mengenai kemungkinan setup ulang TTE;
3. jangan mengganti `TTE_ENCRYPTION_SECRET` secara sembarangan;
4. verifikasi signing dengan credential baru setelah deployment.

## Rekomendasi bila menjadi production pemerintah

Jika sistem dikembangkan menjadi layanan production yang membutuhkan sertifikat elektronik resmi, boundary TTE sebaiknya dipindahkan ke PSrE yang diakui. Aplikasi idealnya meminta proses signing ke penyedia tersebut dan menerima hasil/metadata yang dapat diverifikasi, bukan membuat serta menyimpan private key pengguna sendiri.

Komponen production yang dapat dipertimbangkan antara lain:

- integrasi BSrE/PSrE sesuai kebijakan instansi;
- HSM atau key custody pada penyedia signing;
- lifecycle certificate dan revocation yang dikelola penyedia;
- timestamping dan validasi chain sesuai layanan PSrE;
- audit log dan kontrol akses production yang sesuai kebijakan keamanan instansi.

Bagian ini adalah rekomendasi pengembangan, **bukan fitur yang sudah ada di SOPFlow**.

## Ringkasan batas klaim

| Area | SOPFlow saat ini | Production pemerintah yang direkomendasikan |
|---|---|---|
| Certificate | P12 personal internal/upload | Certificate dari PSrE sesuai kebijakan |
| CA | CA internal SOPFlow | CA/PSrE resmi |
| Private key custody | Dikelola melalui P12 personal di aplikasi | Sebaiknya di PSrE/HSM |
| Storage PDF | Persistent Docker volume | Object/document storage sesuai standar instansi |
| Revocation/OCSP/TSA | Tidak diimplementasikan sebagai layanan eksternal | Ditangani oleh layanan certificate/signing |
| Kekuatan klaim | Simulasi/internal aplikasi | Mengikuti layanan dan regulasi yang berlaku |

Untuk detail alur implementasi lihat `docs/detail_workflow_dan_teknis_tte.md`.
