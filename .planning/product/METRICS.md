# Success Metrics — Sistem Informasi SOP Biro Organisasi

---

## North Star Metric

**Metric:** SOP Disahkan per Bulan (SOP yang mencapai status `BERLAKU`)
**Definition:** Jumlah SOP yang berhasil melewati seluruh alur (penyusunan → evaluasi → verifikasi → pengesahan) dan berstatus `BERLAKU` dalam bulan kalender berjalan
**Current:** 0 (sistem belum ada — baseline manual tidak terukur)
**Target:** ≥15 SOP/bulan pada bulan ke-3 setelah go-live
**Timeline:** 3 bulan pertama pasca deployment

**Why This Metric:**
Metrik ini merepresentasikan nilai utama sistem — SOP yang berlaku berarti:
1. Tim Penyusun berhasil menyelesaikan dokumen prosedur
2. Evaluasi dan verifikasi berjalan sesuai regulasi
3. Pejabat berwenang mengesahkan dengan TTE
4. Instansi patuh terhadap kewajiban standarisasi prosedur

SOP yang belum `BERLAKU` = nilai belum tersampaikan ke end-user (masyarakat/unit kerja yang menggunakan SOP).

**Leading Indicators:**
- **SOP diajukan per minggu** — prediksi North Star (upstream input)
- **Waktu median evaluasi per SOP** — jika meningkat, North Star akan terhambat
- **Batch evaluasi diselesaikan tepat waktu** — prediksi throughput pipeline

---

## HEART Metrics

| Category | Metric | Current | Target | How to Measure |
|----------|--------|---------|--------|----------------|
| **Happiness** | Keluhan status SOP per bulan | — (tidak terukur) | <5 pertanyaan status/bulan | Tally laporan dari admin Biro |
| **Happiness** | TTE berhasil tanpa bantuan teknis | — | ≥90% pengguna berhasil TTE mandiri | Log error TTE di server |
| **Engagement** | Pengguna aktif per minggu (WAU) | 0 | ≥20 pengguna aktif/minggu bulan ke-2 | Auth log (login per minggu) |
| **Engagement** | SOP diisi prosedur >3 langkah | — | ≥80% SOP punya ≥3 ProsedurRow | DB query |
| **Adoption** | OPD yang sudah mengajukan SOP pertama | 0/N OPD | ≥70% OPD terdaftar mengajukan ≥1 SOP bulan ke-1 | DB: SOP per OPD |
| **Adoption** | Pengguna yang setup TTE (TTEProfile) | 0 | ≥80% Kepala OPD & Koordinator punya TTE aktif bulan ke-2 | DB: TTEProfile.isActive |
| **Retention** | Pengguna yang login ≥2 minggu berturut-turut | 0% | ≥60% W2 retention | Auth log |
| **Task Success** | SOP yang selesai evaluasi tanpa stuck >7 hari | — | ≥85% SOP selesai evaluasi dalam 7 hari | created_at vs status change timestamp |
| **Task Success** | Batch evaluasi selesai sebelum deadline | — | ≥90% batch selesai on-time | Batch.deadline vs Batch.closedAt |

---

## OKRs — v1.0 Backend Launch (Q2 2026)

### Objective
Menghadirkan sistem informasi SOP digital pertama yang memungkinkan seluruh alur kerja SOP — dari penyusunan hingga pengesahan TTE — berjalan tanpa dokumen fisik.

### Key Results
- **KR1:** ≥70% OPD terdaftar mengajukan minimal 1 SOP melalui sistem dalam 30 hari pertama go-live
- **KR2:** Rata-rata waktu SOP dari "Siap Dievaluasi" ke "BERLAKU" ≤5 hari kerja (vs perkiraan manual ≥10 hari)
- **KR3:** ≥80% pengesahan SOP dilakukan via TTE digital (bukan cetak ulang untuk tanda tangan fisik)
- **KR4:** 0 SOP hilang jejak auditnya — semua transisi status tercatat di AuditLog

**Confidence:** 60% — stretch goal karena adopsi TTE oleh pejabat adalah variabel terbesar yang tidak bisa dikontrol secara teknis
