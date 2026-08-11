# Detail Workflow dan Teknis TTE SOPFlow

Dokumen ini menjelaskan implementasi tanda tangan elektronik (TTE) yang benar-benar ada pada SOPFlow saat ini. TTE pada aplikasi ini adalah mekanisme internal untuk kebutuhan sistem/tugas akhir, bukan integrasi dengan PSrE pemerintah seperti BSrE.

## 1. Posisi TTE dalam workflow

TTE digunakan setelah evaluasi SOP selesai dan berita acara siap ditandatangani. Urutan utamanya:

1. PJ Evaluator menandatangani berita acara.
2. PJ Penyusun menandatangani berita acara.
3. Kepala OPD melakukan pengesahan akhir SOP.
4. Sistem menghasilkan/menyimpan artefak PDF yang telah ditandatangani dan metadata verifikasinya.
5. Dokumen final dapat diverifikasi melalui mekanisme verifikasi PDF/QR internal.

TTE tidak menggantikan proses evaluasi, revisi, maupun pengesahan bisnis; ia hanya menjadi mekanisme pembuktian kriptografis pada tahap tanda tangan/pengesahan.

## 2. Kredensial TTE per pengguna

Kredensial TTE tidak disimpan sebagai satu sertifikat global server. Setiap pengguna yang berhak menandatangani mempunyai kredensial personal.

Data utama yang disimpan pada pengguna meliputi:

- hash PIN TTE;
- PKCS#12/P12 personal dalam representasi Base64;
- passphrase P12 yang telah dienkripsi.

Base64 bukan mekanisme enkripsi. Proteksi private key berasal dari password PKCS#12, sedangkan passphrase P12 tersebut dilindungi kembali oleh aplikasi sebelum disimpan.

## 3. Setup kredensial

SOPFlow mendukung dua pola setup:

### Generate internal

Aplikasi dapat membuat pasangan key/certificate internal untuk pengguna. Private key dan certificate dikemas sebagai PKCS#12 dengan passphrase acak yang kuat.

### Upload P12

Pengguna dapat memasukkan P12 yang valid beserta passphrase-nya. Sistem melakukan validasi sebelum kredensial disimpan.

Pada kedua pola, PIN pengguna tidak disimpan dalam bentuk plaintext.

## 4. Proteksi passphrase P12

Passphrase P12 dienkripsi menggunakan AES-256-GCM. Key enkripsi diturunkan dari dua komponen:

- PIN TTE pengguna; dan
- `TTE_ENCRYPTION_SECRET` milik server.

Ciphertext yang didukung saat ini menggunakan format versioned `v2`. Format legacy tanpa versi tidak lagi didukung setelah aggressive legacy cleanup. Environment yang masih mempunyai kredensial format lama harus meminta pengguna melakukan setup/upload TTE ulang.

`TTE_ENCRYPTION_SECRET` wajib diperlakukan sebagai secret deployment dan harus berbeda dari secret JWT.

## 5. Penandatanganan PDF

Saat pengguna melakukan tanda tangan/pengesahan:

1. backend memvalidasi hak akses dan state workflow;
2. PIN pengguna diverifikasi terhadap hash yang tersimpan;
3. passphrase P12 didekripsi menggunakan PIN + secret server;
4. PKCS#12 personal dibuka;
5. PDF ditandatangani secara kriptografis;
6. artefak PDF final disimpan pada storage persisten;
7. metadata signature dan keterkaitannya dengan riwayat TTE disimpan di database.

Pembuatan signature baru dapat dikendalikan oleh `PDF_SIGNING_ENABLED`. Ketika dinonaktifkan, endpoint verifikasi dokumen yang sudah ada tetap dapat digunakan.

## 6. Penyimpanan

### MariaDB

MariaDB menyimpan data domain serta data kredensial/metadata TTE yang dibutuhkan aplikasi, termasuk referensi signature, certificate metadata, hash dokumen, dan status workflow.

### Persistent PDF storage

Artefak PDF disimpan pada filesystem backend di `SOP_PDF_STORAGE_DIR`, dengan default `/app/storage/sop-pdf`. Pada Docker Compose path ini dipersistenkan menggunakan volume `sop_pdf_data`.

PDF tidak disimpan di S3/MinIO pada implementasi saat ini.

## 7. Verifikasi

Sistem menyediakan verifikasi PDF yang memeriksa signature pada dokumen dan mencocokkannya dengan data TTE yang tersimpan. QR pada dokumen digunakan untuk membawa pengguna ke jalur verifikasi internal yang sesuai.

Informasi verifikasi difokuskan pada hal yang dapat dibuktikan aplikasi, seperti validitas signature, identitas certificate, waktu tanda tangan bila tersedia, dan kecocokan dengan riwayat TTE SOPFlow.

## 8. Certificate Authority internal

Certificate yang dihasilkan aplikasi menggunakan CA internal SOPFlow untuk kebutuhan demonstrasi/internal. Ini tidak boleh disebut sebagai sertifikat elektronik tersertifikasi pemerintah.

Untuk deployment pemerintahan yang membutuhkan kekuatan hukum/operasional sesuai kebijakan instansi, desain production sebaiknya menggunakan PSrE yang diakui dan tidak membuat aplikasi memegang private key penandatangan secara langsung. Integrasi tersebut berada di luar scope implementasi tugas akhir saat ini.

## 9. Batas keamanan dan operasional

- Backup database dan volume PDF harus dijaga bersama karena keduanya membentuk rekam dokumen sistem.
- `TTE_ENCRYPTION_SECRET` tidak boleh disimpan di repository.
- PIN pengguna tidak boleh dicatat di log.
- P12/passphrase tidak boleh dikirim ke frontend selain pada alur yang memang dibutuhkan untuk setup.
- Perubahan secret TTE tanpa strategi migrasi akan membuat passphrase tersimpan tidak dapat didekripsi.
- Format ciphertext legacy sebelum `v2` tidak lagi mempunyai fallback decryption.

## 10. Yang tidak diimplementasikan

Implementasi saat ini tidak mengklaim adanya:

- HSM/KMS production;
- OCSP/CRL online;
- TSA eksternal;
- S3/MinIO untuk arsip PDF;
- integrasi BSrE/PSrE;
- certificate lifecycle management setara CA production.

Komponen tersebut dapat menjadi pengembangan lanjutan, tetapi tidak boleh digambarkan sebagai arsitektur SOPFlow yang sedang berjalan.
