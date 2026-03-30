# Problem Statement — Sistem Informasi SOP Biro Organisasi

---

## 5 Whys Analysis: Pengelolaan SOP Pemerintah yang Tidak Efisien

### 5 Whys: Proses Pengesahan SOP Lambat

1. **Why?** Pengesahan SOP memerlukan banyak tanda tangan fisik dari berbagai pejabat di lokasi yang berbeda.
2. **Why?** Tidak ada mekanisme tanda tangan digital yang diakui dan terintegrasi dalam alur kerja SOP.
3. **Why?** Sistem pengelolaan SOP masih berbasis dokumen fisik (Word/PDF + print) tanpa workflow digital terpusat.
4. **Why?** Tidak ada sistem informasi khusus yang mengelola siklus hidup SOP dari penyusunan hingga pengesahan di instansi ini.
5. **Why?** Investasi sistem digital belum diprioritaskan karena proses manual dianggap "sudah berjalan" meski tidak efisien.

**Root Cause:** Tidak adanya sistem digital terpusat yang mengintegrasikan seluruh siklus hidup SOP — dari penyusunan, evaluasi, verifikasi, hingga pengesahan dengan TTE — menyebabkan proses bergantung pada koordinasi manual, dokumen fisik, dan komunikasi ad-hoc.

**Validation:**
- [x] Root cause adalah actionable (bisa diselesaikan dengan membangun sistem)
- [x] Root cause spesifik (bukan "SDM kurang kompeten" yang ambigu)
- [x] Menyelesaikan root cause menghilangkan ketergantungan pada proses fisik yang lambat

---

## Problem Statement

### Primary Problem

**Tim Penyusun SOP di OPD** perlu menyusun, mengajukan, dan melacak status SOP mereka sesuai prosedur baku pemerintah, karena regulasi mewajibkan setiap OPD memiliki SOP terstandarisasi yang diverifikasi Biro Organisasi, **tetapi saat ini** seluruh proses dilakukan secara manual menggunakan dokumen fisik, email, dan koordinasi telepon — menyebabkan keterlambatan, inkonsistensi format, dan hilangnya jejak audit.

### Evidence

- Proses pengajuan SOP memerlukan tatap muka fisik untuk tanda tangan, rata-rata 3–5 hari hanya untuk pengumpulan tanda tangan koordinator
- Tim Evaluasi menerima berkas dalam berbagai format (Word, PDF, scan fisik) tanpa standar penyajian
- Tidak ada sistem tracking → Tim Penyusun harus menelepon Biro secara aktif untuk mengetahui status
- Siklus evaluasi tahunan sering melebihi deadline karena koordinasi manual dengan banyak OPD sekaligus
- Jejak audit tidak lengkap: tidak ada catatan siapa mengubah apa, kapan, dan dengan alasan apa

### Impact

- **Siapa yang terdampak:** Semua 4 peran (Tim Penyusun, Kepala OPD, Tim Evaluasi, Biro Organisasi) — potensi puluhan hingga ratusan pengguna per instansi
- **Seberapa sering:** Siklus evaluasi tahunan + penyusunan SOP baru/revisi sepanjang tahun
- **Biaya masalah:**
  - Waktu: 3–5 hari per SOP hanya untuk pengumpulan tanda tangan
  - Biaya operasional: cetak, fotokopi, pengiriman dokumen fisik
  - Risiko compliance: SOP tidak terverifikasi tepat waktu berpotensi pelanggaran audit pemerintah
  - Kualitas: format tidak konsisten, revisi berulang karena aturan tidak terkomunikasi

### Non-Problems (Out of Scope)

- Pembuatan konten SOP secara otomatis (AI writing) — pengguna tetap menulis konten
- Manajemen SDM atau penggajian ASN — bukan domain SOP
- Sistem e-office umum (surat menyurat, disposisi) — domain terpisah
- Multi-instansi / multi-kota dalam satu deployment — v1.0 fokus satu instansi
- Export PDF/Excel SOP — deferred ke v2.0
- Real-time chat — bukan prioritas v1.0

---

## Hypotheses

### Hypothesis 1 — Digital Workflow Mengurangi Waktu Proses
**We believe** menyediakan alur kerja digital end-to-end (penyusunan → evaluasi → verifikasi → pengesahan)
**For** Tim Penyusun dan Biro Organisasi
**Will result in** pengurangan waktu proses rata-rata dari >5 hari menjadi <2 hari per SOP
**We'll know we're right when** rata-rata waktu dari SOP diajukan ke status BERLAKU turun 60% dalam 3 bulan pertama pemakaian

**Confidence:** High
**Evidence:** Bottleneck utama adalah koordinasi fisik dan tanda tangan manual — digitalizing eliminates them

---

### Hypothesis 2 — TTE Meningkatkan Adopsi Pengesahan Digital
**We believe** menyediakan Tanda Tangan Elektronik berbasis PIN (tanpa hardware token)
**For** Kepala OPD dan Biro Organisasi
**Will result in** Kepala OPD aktif menggunakan sistem untuk mengesahkan SOP (bukan minta cetak ulang)
**We'll know we're right when** ≥80% pengesahan SOP dilakukan melalui sistem (bukan fisik) dalam 6 bulan pertama

**Confidence:** Medium
**Evidence:** Pejabat sering menghindari sistem karena kompleksitas teknis; PIN-based TTE menurunkan barrier

---

### Hypothesis 3 — Batch Evaluasi Terstruktur Meningkatkan Throughput Tim Evaluasi
**We believe** mengelompokkan SOP dalam batch evaluasi dengan tampilan terpusat
**For** Tim Evaluasi (Biro Organisasi)
**Will result in** Tim Evaluasi dapat menyelesaikan evaluasi 2x lebih banyak SOP per hari dibanding cara manual
**We'll know we're right when** rata-rata SOP dievaluasi per hari per evaluator meningkat dari baseline manual ke ≥5 SOP/hari/evaluator

**Confidence:** High
**Evidence:** Saat ini evaluator kehilangan waktu untuk mencari dokumen, format tidak konsisten — sistem menghilangkan overhead ini

---

### Hypothesis 4 — Status Tracking Real-time Mengurangi Komunikasi Ad-hoc
**We believe** menampilkan status SOP real-time yang bisa dilihat semua pihak
**For** Tim Penyusun
**Will result in** pengurangan pertanyaan status via telepon/WA kepada Biro Organisasi
**We'll know we're right when** keluhan tentang ketidakjelasan status turun (proxy: tidak ada eskalasi status dalam review bulanan)

**Confidence:** High
**Evidence:** Salah satu pain point terbesar adalah "tidak tahu SOP saya ada di mana" — visibility menghilangkan kebutuhan ini
