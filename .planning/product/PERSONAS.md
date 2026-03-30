# User Personas — Sistem Informasi SOP Biro Organisasi

---

## Persona 1: Arif — Anggota Tim Penyusun

**Role:** Staff OPD (Organisasi Perangkat Daerah) yang bertugas menyusun SOP
**Demographics:** Usia 28–40 tahun, ASN (Aparatur Sipil Negara), bekerja di kantor dinas/badan pemerintah daerah, terbiasa dengan dokumen MS Word dan email

**Goals:**
- Menyusun SOP yang sesuai format standar regulasi tanpa harus hafal semua aturan format
- Mengajukan SOP ke evaluasi tanpa proses bolak-balik manual lewat email/fisik
- Mengetahui status SOP yang sedang diproses tanpa harus menelepon pihak lain

**Pains:**
- Format SOP sering salah karena aturan format tidak terdokumentasi dengan jelas di satu tempat
- Proses pengajuan dokumen lambat — banyak tanda tangan fisik yang harus dikumpulkan
- Tidak tahu di mana SOP-nya "nyangkut" dalam proses evaluasi/verifikasi
- Revisi bolak-balik karena komentar evaluasi tidak spesifik

**Current Behavior:**
Menyusun SOP di MS Word → print → minta tanda tangan atasan → kirim fisik ke Biro Organisasi → tunggu kabar lewat telepon → revisi jika diminta → kirim ulang

**Success Criteria:**
- SOP bisa diajukan ke evaluasi dalam 1 hari kerja tanpa tatap muka
- Status SOP selalu terlihat real-time (tidak perlu telepon)
- Format otomatis sesuai standar (nomor SOP otomatis)

---

## Persona 2: Bu Siti — Koordinator Tim Penyusun

**Role:** Ketua/koordinator tim penyusun SOP di OPD
**Demographics:** Usia 35–50 tahun, jabatan Kasubag atau eselon IV, bertanggung jawab atas semua SOP di unitnya

**Goals:**
- Memantau progres semua SOP yang sedang disusun oleh anggota timnya
- Menandatangani Berita Acara verifikasi secara digital agar tidak perlu hadir fisik
- Memastikan semua SOP OPD terdokumentasi sebelum batas waktu evaluasi tahunan

**Pains:**
- Sulit melacak SOP mana yang sudah/belum selesai lintas anggota tim
- Tanda tangan fisik membutuhkan hadir di kantor; sering tertunda karena dinas luar
- Tidak ada rekap otomatis SOP per OPD untuk laporan ke atasan

**Current Behavior:**
Kumpulkan laporan dari anggota lewat WA grup → rekap manual di spreadsheet → print Berita Acara → minta tanda tangan fisik → kirim ke Biro

**Success Criteria:**
- Dashboard yang menampilkan semua SOP per OPD dengan status real-time
- TTE (Tanda Tangan Elektronik) bisa dilakukan dari browser tanpa software tambahan
- Ekspor rekap SOP untuk laporan bulanan/tahunan

---

## Persona 3: Pak Hendra — Anggota Tim Evaluasi

**Role:** Evaluator SOP di Biro Organisasi
**Demographics:** Usia 30–45 tahun, ASN dengan kompetensi analisis organisasi, mengevaluasi puluhan SOP per batch

**Goals:**
- Mengevaluasi SOP secara efisien — membaca, memberi komentar, membuat keputusan
- Menyelesaikan batch evaluasi dalam deadline yang ditetapkan
- Memiliki rekap hasil evaluasi yang bisa dilaporkan ke pimpinan

**Pains:**
- Menerima SOP dalam format yang tidak konsisten (Word, PDF, dsb.)
- Komentar evaluasi tidak tersimpan rapi — sulit tracking apa yang sudah/belum direspons
- Tidak ada reminder otomatis ketika deadline batch mendekati

**Current Behavior:**
Terima berkas fisik/email → baca satu per satu → tulis catatan di kertas → kirim email/telepon ke Tim Penyusun → arsip manual di folder komputer

**Success Criteria:**
- Semua SOP dalam satu batch tersaji di satu halaman yang terstruktur
- Komentar evaluasi tersimpan per SOP dan per step prosedur
- Notifikasi otomatis ketika ada SOP baru yang perlu dievaluasi

---

## Persona 4: Ibu Dewi — Kepala OPD

**Role:** Pejabat yang mengesahkan SOP menjadi berlaku (status BERLAKU)
**Demographics:** Usia 45–58 tahun, eselon III/II, agenda padat, minim waktu untuk urusan teknis dokumen

**Goals:**
- Mengesahkan SOP dengan cepat — minimal 5 menit per dokumen
- Yakin bahwa SOP yang ditandatangani sudah melalui proses evaluasi yang benar
- Tidak perlu hadir fisik hanya untuk tanda tangan dokumen internal

**Pains:**
- Harus membaca SOP panjang sebelum tanda tangan tanpa ringkasan singkat
- Tidak tahu apakah SOP sudah diverifikasi Biro sebelum sampai ke mejanya
- Proses TTE memerlukan software/token yang rumit

**Current Behavior:**
Tunggu berkas fisik → baca sekilas → tanda tangan → serahkan ke sekretaris → arsip

**Success Criteria:**
- Ringkasan SOP (nama, unit, tanggal evaluasi, status verifikasi) tersedia sebelum tanda tangan
- TTE berbasis PIN — tidak perlu hardware token
- Histori semua SOP yang sudah pernah ditandatangani tersedia

---

## Persona 5: Budi — Staf Biro Organisasi (Verifikator)

**Role:** Staf Biro Organisasi yang membuat dan memverifikasi batch evaluasi
**Demographics:** Usia 30–45 tahun, paham regulasi SOP, menjadi titik koordinasi antara OPD dan Biro

**Goals:**
- Membuat batch evaluasi yang mengumpulkan SOP dari banyak OPD
- Memverifikasi Berita Acara setelah evaluasi selesai
- Memonitor seluruh SOP pemerintah daerah yang aktif/berlaku

**Pains:**
- Koordinasi dengan banyak OPD sekaligus sangat memakan waktu
- Tidak ada visibilitas kapan OPD akan mengajukan SOP (tidak terprediksi)
- Dokumen verifikasi tersebar di banyak folder dan email

**Current Behavior:**
Buat jadwal evaluasi → kirim undangan email ke semua OPD → kumpulkan dokumen yang masuk → proses manual → kirim Berita Acara → arsip

**Success Criteria:**
- Batch evaluasi bisa dibuat dengan memilih OPD dan menetapkan deadline
- Status setiap SOP dalam batch terlihat real-time
- Berita Acara otomatis dibuat setelah evaluasi batch selesai

---

## User Journey Maps

### Journey 1: Arif (Tim Penyusun) → Mengajukan SOP Baru ke Evaluasi

#### Current State
1. Arif menyusun SOP di MS Word — 😐 (format tidak ada template baku)
2. Print dan minta tanda tangan Koordinator — 😠 (Koordinator sering tidak di tempat)
3. Kirim fisik ke Biro Organisasi — 😠 (perlu ongkos kirim / keluar kantor)
4. Tunggu kabar dari Biro — 😠 (tidak tahu berapa lama, sering lupa)
5. Terima catatan revisi lewat email — 😐 (instruksi tidak spesifik)
6. Revisi dan kirim ulang — 😠 (siklus berulang)

**Pain Points:**
- Tidak ada template baku → format sering salah
- Tidak ada tracking status → harus aktif menanyakan
- Proses fisik → tergantung kehadiran orang di kantor

#### Future State
1. Arif buka sistem, isi formulir SOP dengan template — 😊 (format otomatis)
2. Tambahkan prosedur step-by-step dengan BPMN viewer — 😊 (visual, mudah dikontrol)
3. Klik "Selesai" → status otomatis "Siap Dievaluasi" — 😊 (satu klik)
4. Sistem notifikasi ke Koordinator dan Tim Evaluasi — 😊 (otomatis)
5. Terima notifikasi komentar evaluasi dengan konteks jelas — 😊 (per step)
6. Revisi langsung di sistem, ajukan ulang — 😊 (tidak ada print/kirim ulang)

**Improvements:**
- Template format terintegrasi → tidak ada salah format
- Status real-time → tidak perlu telepon
- Proses digital → tidak perlu hadir fisik

---

### Journey 2: Pak Hendra (Tim Evaluasi) → Evaluasi Batch SOP

#### Current State
1. Terima dokumen fisik/email tidak terstruktur — 😠 (susah dicari)
2. Baca SOP satu per satu dari PDF/Word — 😐 (tidak ada standar tampilan)
3. Tulis catatan di kertas → salin ke email — 😠 (duplikasi kerja)
4. Kirim email hasil evaluasi ke Tim Penyusun — 😐 (tidak ada ack otomatis)
5. Tunggu revisi, terima dokumen baru, ulangi — 😠 (tidak ada tracking)

**Pain Points:**
- Format dokumen tidak konsisten
- Komentar tidak tersimpan per SOP
- Tidak ada satu tempat untuk semua SOP dalam batch

#### Future State
1. Buka halaman Batch Evaluasi → lihat semua SOP yang ditugaskan — 😊 (terstruktur)
2. Baca SOP dalam sistem, lihat prosedur BPMN — 😊 (standar, jelas)
3. Klik per SOP → isi hasil evaluasi (SESUAI / REVISI_BIRO) + komentar — 😊 (tersimpan otomatis)
4. Sistem kirim notifikasi ke Tim Penyusun tentang hasil evaluasi — 😊 (otomatis)
5. Selesai semua SOP → batch tertutup, BA otomatis dibuat — 😊 (tidak ada kerja manual)

**Improvements:**
- Satu halaman untuk semua SOP dalam batch
- Komentar tersimpan dan terhubung ke SOP
- BA otomatis → tidak ada kerja manual

---

## Empathy Maps

### Empathy Map: Arif (Tim Penyusun)

| Says | Thinks |
|------|--------|
| "SOP saya mana kabarnya ya?" | "Kalau ditolak, saya harus mulai dari mana?" |
| "Format yang benar itu yang seperti apa?" | "Semoga tidak ada revisi lagi bulan depan" |
| "Bisa kirim lewat email saja tidak?" | "Kenapa prosesnya harus selama ini?" |

| Does | Feels |
|------|-------|
| Menelepon Biro untuk cek status | Frustrasi karena tidak ada transparansi |
| Menyimpan template Word dari rekan | Tidak yakin apakah format sudah benar |
| Kirim berkas fisik ke berbagai meja | Lelah dengan administrasi berulang |
| Chat WA grup untuk koordinasi | Cemas menjelang deadline evaluasi tahunan |

---

### Empathy Map: Budi (Biro Organisasi — Verifikator)

| Says | Thinks |
|------|--------|
| "OPD mana yang belum kirim berkas?" | "Kalau ada 50 OPD, ini tidak akan selesai" |
| "Batch ini sudah lewat deadline tapi belum semua masuk" | "Sistem manual ini tidak bisa scale" |
| "Tolong koordinasi dengan Tim Evaluasi dulu" | "Butuh satu tempat untuk semua data ini" |

| Does | Feels |
|------|-------|
| Buat spreadsheet tracking per OPD | Overwhelmed saat puncak siklus evaluasi |
| Kirim email pengingat ke OPD | Bertanggung jawab tapi kurang kontrol |
| Arsip dokumen di folder fisik/digital | Lelah dengan pekerjaan administratif berulang |
| Rapat koordinasi manual dengan tim | Bangga ketika proses berjalan lancar |
