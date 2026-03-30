# Feature Prioritization — Sistem Informasi SOP Biro Organisasi

---

## Feature Brainstorm

| Feature | Problem Solved | User Benefit | Effort |
|---------|---------------|--------------|--------|
| Auth & Role-Based Access | Tidak ada kontrol akses per peran | Setiap peran hanya melihat data yang relevan | M |
| CRUD SOP + Status Flow | SOP tidak bisa disusun/diajukan secara digital | Proses penyusunan SOP sepenuhnya digital | L |
| Prosedur Steps + BPMN Viewer | Format prosedur tidak standar | Visualisasi alur kerja SOP yang konsisten | L |
| Batch Evaluasi | Tim Evaluasi tidak punya workspace terpusat | Kelola banyak SOP dalam satu batch | M |
| TTE (Tanda Tangan Elektronik) | Pengesahan memerlukan tanda tangan fisik | Pengesahan digital dari browser | XL |
| Berita Acara Otomatis | BA dibuat manual, sering tidak konsisten | BA dibuat otomatis setelah batch selesai | M |
| Audit Log per Transisi Status | Tidak ada jejak perubahan status SOP | Compliance dan accountability terjamin | S |
| Manajemen OPD & Peraturan | Data OPD dan Peraturan tidak terpusat | Referensi data master untuk semua SOP | M |
| Nomor SOP Otomatis | Format nomor SOP sering salah/inkonsisten | Nomor generated otomatis sesuai format baku | S |
| Notifikasi Antar Role | Tidak ada notifikasi ketika status berubah | Pengguna tahu kapan harus bertindak | M |
| Manajemen Tim (Penyusun & Evaluasi) | Tidak ada tracking siapa di tim mana | Assignment evaluasi berdasarkan tim terdaftar | S |
| Dashboard per Role | Tidak ada overview status SOP per role | Setiap role punya halaman ringkasan yang relevan | M |
| Rekap Evaluasi Tahunan | Tidak ada laporan ringkasan evaluasi tahunan | Biro bisa lapor ke pimpinan dengan data | M |
| Export PDF/Excel SOP | Butuh dokumen untuk arsip/print | Dokumen bisa didownload sesuai format | L |
| Real-time Notifications (WebSocket) | Notifikasi terlambat karena polling | Update instan tanpa refresh halaman | XL |

---

## RICE Prioritization

| Feature | Reach (1–1000) | Impact (0.25–3) | Confidence (%) | Effort (minggu) | RICE Score |
|---------|----------------|-----------------|----------------|-----------------|------------|
| Auth & Role-Based Access | 500 | 3 | 100 | 1 | **1500** |
| CRUD SOP + Status Flow | 500 | 3 | 100 | 3 | **500** |
| Manajemen OPD & Peraturan | 300 | 2 | 90 | 1.5 | **360** |
| Nomor SOP Otomatis | 500 | 2 | 95 | 0.5 | **1900** |
| Audit Log per Transisi Status | 500 | 2 | 95 | 0.5 | **1900** |
| Manajemen Tim | 300 | 2 | 90 | 1 | **540** |
| Batch Evaluasi | 200 | 3 | 90 | 2 | **270** |
| Prosedur Steps + BPMN Viewer | 500 | 2 | 85 | 2.5 | **340** |
| Berita Acara Otomatis | 300 | 2 | 85 | 1.5 | **340** |
| Dashboard per Role | 500 | 1.5 | 80 | 1.5 | **400** |
| TTE (PIN-based) | 200 | 3 | 70 | 4 | **105** |
| Rekap Evaluasi Tahunan | 100 | 2 | 80 | 2 | **80** |
| Notifikasi Antar Role | 500 | 1 | 75 | 2 | **188** |
| Export PDF/Excel SOP | 300 | 1 | 70 | 3 | **70** |
| Real-time Notifications (WS) | 500 | 0.5 | 60 | 3 | **50** |

**Prioritized List (by RICE Score):**
1. Nomor SOP Otomatis — RICE: 1900 (kecil, impak tinggi)
2. Audit Log per Transisi Status — RICE: 1900 (kecil, impak tinggi)
3. Auth & Role-Based Access — RICE: 1500 (fondasi semua fitur lain)
4. Manajemen Tim — RICE: 540
5. CRUD SOP + Status Flow — RICE: 500
6. Dashboard per Role — RICE: 400
7. Manajemen OPD & Peraturan — RICE: 360
8. Prosedur Steps + BPMN Viewer — RICE: 340
9. Berita Acara Otomatis — RICE: 340
10. Batch Evaluasi — RICE: 270
11. Notifikasi Antar Role — RICE: 188
12. TTE (PIN-based) — RICE: 105
13. Rekap Evaluasi Tahunan — RICE: 80
14. Export PDF/Excel SOP — RICE: 70
15. Real-time Notifications (WS) — RICE: 50

---

## Value vs Effort Matrix

```
High Value │ Quick Wins            │ Major Projects
           │ Nomor SOP Otomatis    │ CRUD SOP + Status Flow
           │ Audit Log             │ TTE (PIN-based)
           │ Auth & Role Access    │ Prosedur Steps + BPMN
           │ Manajemen OPD         │ Batch Evaluasi
           │ Manajemen Tim         │
───────────┼───────────────────────┼──────────────────────────
           │                       │
Low Value  │ Fill-Ins              │ Time Wasters
           │ Dashboard per Role    │ Real-time WS Notifications
           │ Rekap Evaluasi        │ Export PDF/Excel
           │ Notifikasi Role       │
           │                       │
           └───────────────────────┴──────────────────────────
             Low Effort (≤2 minggu)  High Effort (>2 minggu)
```

**Do First (Quick Wins):** Auth + Role Access, Nomor SOP Otomatis, Audit Log, Manajemen OPD, Manajemen Tim
**Plan Carefully (Major Projects):** CRUD SOP + Status Flow, TTE, Prosedur Steps + BPMN, Batch Evaluasi, Berita Acara
**Do If Time (Fill-Ins):** Dashboard, Rekap Tahunan, Notifikasi
**Avoid / Defer (Time Wasters):** Real-time WS, Export PDF — v2.0
