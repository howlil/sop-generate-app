# Product Requirements — Sistem Informasi SOP Biro Organisasi

---

## Product Requirements

### REQ-PROD-01: Auth & Role-Based Access Control

**Problem:** Tidak ada kontrol akses per peran — semua data berpotensi diakses semua pihak (links to PROBLEM.md: Root Cause)
**User Benefit:** Setiap peran (Tim Penyusun, Kepala OPD, Tim Evaluasi, Biro Organisasi) hanya melihat dan mengakses fitur yang relevan dengan tugasnya
**Success Metric:** 100% endpoint dilindungi role guard; login rate ≥80% pengguna terdaftar minggu ke-1
**Priority:** RICE 1500 — Rank #3 (foundational dependency semua fitur lain)
**MVP:** Yes

---

### REQ-PROD-02: CRUD SOP + Alur Status Lengkap

**Problem:** Proses penyusunan dan pengajuan SOP sepenuhnya manual (links to PROBLEM.md: Proses Pengesahan SOP Lambat)
**User Benefit:** Tim Penyusun bisa membuat, mengisi, dan mengajukan SOP tanpa dokumen fisik; semua pihak bisa melihat status real-time
**Success Metric:** ≥70% OPD mengajukan SOP pertama dalam 30 hari; rata-rata waktu SOP ke BERLAKU ≤5 hari
**Priority:** RICE 500 — Rank #5 (core domain)
**MVP:** Yes

---

### REQ-PROD-03: Nomor SOP Otomatis

**Problem:** Format nomor SOP tidak konsisten karena dibuat manual (links to PROBLEM.md: Evidence - format tidak konsisten)
**User Benefit:** Nomor SOP di-generate otomatis dalam format `SOP/[KODE-OPD]/[TAHUN]/[URUTAN]` — tidak ada salah format
**Success Metric:** 100% SOP yang dibuat melalui sistem memiliki nomor valid; 0 duplikasi nomor
**Priority:** RICE 1900 — Rank #1 (quick win: effort kecil, impak tinggi)
**MVP:** Yes

---

### REQ-PROD-04: Audit Log Otomatis per Transisi Status

**Problem:** Tidak ada jejak audit siapa mengubah apa dan kapan (links to PROBLEM.md: Impact - Risiko compliance)
**User Benefit:** Setiap perubahan status SOP tercatat otomatis dengan aktor, timestamp, dan komentar — memenuhi requirement audit pemerintah
**Success Metric:** 0 transisi status SOP tanpa entri AuditLog; audit trail lengkap untuk semua SOP dalam pilot
**Priority:** RICE 1900 — Rank #2 (quick win: effort kecil, compliance critical)
**MVP:** Yes

---

### REQ-PROD-05: Manajemen OPD & Peraturan (Data Master)

**Problem:** Tidak ada sumber data master OPD dan Peraturan yang terpusat (links to PROBLEM.md: Non-standar data)
**User Benefit:** Biro Organisasi bisa mengelola daftar OPD dan Peraturan yang menjadi referensi wajib untuk semua SOP
**Success Metric:** Semua SOP yang dibuat terhubung ke OPD valid; tidak ada SOP dengan referensi peraturan "tidak ditemukan"
**Priority:** RICE 360 — Rank #7 (master data dependency)
**MVP:** Yes

---

### REQ-PROD-06: Manajemen Tim Penyusun & Tim Evaluasi

**Problem:** Tidak ada tracking formal siapa yang bertanggung jawab atas SOP (links to PROBLEM.md: Koordinasi ad-hoc)
**User Benefit:** Kepala OPD bisa melihat anggota Tim Penyusun; Biro bisa assign Tim Evaluasi untuk batch; tracking tanggung jawab jelas
**Success Metric:** Semua SOP dalam batch evaluasi memiliki evaluator assigned; tidak ada SOP "yatim piatu" tanpa tim
**Priority:** RICE 540 — Rank #4
**MVP:** Yes

---

### REQ-PROD-07: Batch Evaluasi (Workspace Tim Evaluasi)

**Problem:** Tim Evaluasi tidak punya workspace terpusat untuk memproses banyak SOP (links to PROBLEM.md: Pain - format tidak konsisten)
**User Benefit:** Biro Organisasi bisa membuat batch evaluasi, assign evaluator, dan semua SOP dalam batch tersaji terstruktur di satu halaman
**Success Metric:** ≥90% batch evaluasi selesai sebelum deadline; rata-rata ≥5 SOP dievaluasi per evaluator per hari
**Priority:** RICE 270 — Rank #10
**MVP:** Yes

---

### REQ-PROD-08: Berita Acara Otomatis

**Problem:** Berita Acara dibuat manual dan sering tidak konsisten formatnya
**User Benefit:** Setelah batch evaluasi selesai, BA otomatis dibuat dengan data yang sudah tersedia — tidak ada kerja duplikat
**Success Metric:** 100% batch yang selesai menghasilkan BA; format BA konsisten untuk semua batch
**Priority:** RICE 340 — Rank #8
**MVP:** Yes

---

### REQ-PROD-09: TTE (Tanda Tangan Elektronik) PIN-based

**Problem:** Pengesahan SOP memerlukan tanda tangan fisik yang lambat dan bergantung kehadiran pejabat (links to PROBLEM.md: Primary Problem)
**User Benefit:** Kepala OPD dan pejabat Biro bisa mengesahkan/memverifikasi BA dari browser menggunakan PIN — tidak perlu hadir fisik
**Success Metric:** ≥80% pengesahan SOP via TTE digital dalam 6 bulan; TTE berhasil tanpa bantuan teknis untuk ≥90% pengguna
**Priority:** RICE 105 — Rank #11 (effort besar tapi merupakan inti value proposition)
**MVP:** Yes

---

### REQ-PROD-10: Prosedur Steps + Integrasi BPMN Viewer

**Problem:** Format prosedur SOP tidak standar dan tidak divisualisasikan (links to PROBLEM.md: Evidence - format tidak konsisten)
**User Benefit:** Tim Penyusun mengisi prosedur step-by-step; BPMN viewer (sudah ada di client) menampilkan alur proses secara visual
**Success Metric:** ≥80% SOP yang diajukan memiliki ≥3 ProsedurRow; Tim Evaluasi tidak lagi perlu menebak alur kerja dari teks
**Priority:** RICE 340 — Rank #9
**MVP:** Yes

---

### REQ-PROD-11: Dashboard & Notifikasi per Role (Post-MVP)

**Problem:** Pengguna tidak tahu kapan mereka perlu mengambil aksi (links to PROBLEM.md: Pain - tidak ada tracking)
**User Benefit:** Setiap role punya halaman dashboard yang menampilkan SOP/batch yang memerlukan aksi segera
**Success Metric:** Keluhan status SOP < 5 per bulan; WAU ≥20 pengguna aktif/minggu
**Priority:** RICE 400 (Dashboard), 188 (Notifikasi)
**MVP:** No — deferred post v1.0 backend; client UI sudah ada, butuh data dari API

---

### REQ-PROD-12: Rekap Evaluasi Tahunan & Export (Post-MVP)

**Problem:** Tidak ada laporan ringkasan evaluasi tahunan yang bisa dilaporkan ke pimpinan
**User Benefit:** Biro bisa generate rekap jumlah SOP per OPD, status, dan hasil evaluasi untuk laporan tahunan
**Success Metric:** Biro Organisasi bisa menyiapkan laporan tahunan dalam <30 menit (vs sebelumnya >1 hari manual)
**Priority:** RICE 80 (Rekap), 70 (Export PDF/Excel)
**MVP:** No — deferred ke v2.0
