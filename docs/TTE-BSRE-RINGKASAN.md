# Ringkasan Mekanisme Tanda Tangan Elektronik (TTE) Berstandar BSRE

## Apa itu BSRE?

**BSrE (Balai Sertifikasi Elektronik)** adalah lembaga yang menyelenggarakan layanan sertifikat elektronik (Certification Authority) untuk instansi pemerintah Indonesia, di bawah **BSSN (Badan Siber dan Sandi Negara)**. Dibentuk berdasarkan Peraturan Kepala Lembaga Sandi Negara No. 10 Tahun 2017.

## Regulasi

- UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik
- PP PSTE No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik
- Permen Kominfo No. 11 Tahun 2022 tentang Tata Kelola Penyelenggaraan Sertifikasi Elektronik

## Algoritma & Keamanan

- **PKI (Public Key Infrastructure)**: Sertifikat elektronik memakai pasangan kunci (public/private key).
- **Hash dokumen**: Konten dokumen di-hash (biasanya **SHA-256**) untuk menjamin integritas; tanda tangan mengenkripsi hash dengan private key.
- **Validasi**: Pihak lain memverifikasi dengan public key (dari sertifikat) dan memeriksa hash dokumen; sertifikat divalidasi ke chain of trust BSRE.

## Alur Umum TTE Berstandar BSRE

1. **Pendaftaran sertifikat**
   - Permohonan melalui surat dinas ke instansi (mis. Pusdatin) dengan data: Nama, **NIP**, **email dinas** (wajib), Unit Kerja.
   - Setelah disetujui, verifikator mendaftarkan pengguna; pengguna mendapat **link aktivasi via email**.

2. **Aktivasi & passphrase**
   - Pengguna aktivasi akun lewat link di email.
   - **Set passphrase** (PIN/password) melalui email kedua setelah aktivasi terverifikasi.
   - Status "issued" = sertifikat siap dipakai.

3. **Masa berlaku**
   - Sertifikat berlaku **2 tahun**; ada pemberitahuan 30 hari sebelum kedaluwarsa; perpanjangan paling lambat 1 hari sebelum habis.

4. **Saat menandatangani**
   - Aplikasi/client mengambil sertifikat pengguna (terkait NIP/identitas).
   - Pengguna memasukkan **passphrase/PIN** untuk membuka private key (atau akses ke HSM/token).
   - Sistem menghitung hash dokumen (SHA-256), lalu membubuhkan tanda tangan digital (signature) yang bisa divalidasi ke BSRE/PSrE.

## Integrasi di Aplikasi

- Instansi sering memakai **TTE Gateway** (contoh: Badan POM) yang sudah terhubung BSRE: aplikasi memanggil API gateway untuk sign/verify.
- **NIP** dipakai untuk identifikasi pemilik sertifikat; **PIN/passphrase** hanya di sisi pengguna/HSM untuk melepaskan private key.
- **Verifikasi**: Bisa lewat gateway (validasi ke BSRE) atau halaman validasi yang menampilkan detail dokumen + audit log + status sertifikat.

## Penerapan di Sistem SOP Ini

- **Kepala Biro**: TTE dipakai saat **memverifikasi** hasil evaluasi SOP (Berita Acara).
- **Kepala OPD**: TTE dipakai saat **mengesahkan** SOP.
- **Flow**: User daftar TTE (NIP + email) → verifikasi email → set PIN → saat verifikasi/mengesahkan, popup PIN → setelah benar, dokumen ditandatangani; di bawah TTE ditampilkan **QR code** yang mengarah ke **halaman detail pengesahan** (detail SOP + audit log) untuk verifikasi publik.

Implementasi teknis di aplikasi ini menyiapkan struktur (profil TTE, PIN, payload tanda tangan, QR ke halaman validasi) yang nanti dapat dihubungkan ke API BSRE/TTE Gateway instansi.
