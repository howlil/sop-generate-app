# MVP Plan — Sistem Informasi SOP Biro Organisasi

---

## MVP Definition

**Hypothesis to Test:**
Dengan menyediakan sistem digital end-to-end untuk seluruh alur kerja SOP (penyusunan → evaluasi → verifikasi → pengesahan TTE), instansi pemerintah akan mengurangi waktu proses SOP dari >10 hari menjadi ≤5 hari kerja dan meningkatkan jumlah SOP yang disahkan per bulan.

**MVP Features:**

1. **Auth + Role-Based Access** — fondasi, tanpa ini tidak ada sistem
2. **Manajemen OPD & Peraturan** — data master yang menjadi FK bagi semua SOP
3. **CRUD SOP + Status Flow lengkap** — inti domain; flow status dari DRAFT → BERLAKU
4. **Prosedur Steps (tanpa BPMN visual rendering)** — konten prosedur wajib; BPMN viewer sudah ada di client
5. **Manajemen Tim Penyusun & Evaluasi** — assignment dan tracking siapa yang bertugas
6. **Batch Evaluasi** — mekanisme inti Tim Evaluasi memproses SOP
7. **Berita Acara Otomatis** — output wajib setelah evaluasi, diperlukan untuk TTE
8. **TTE (Tanda Tangan Elektronik) PIN-based** — pengesahan digital, inti nilai proposisi
9. **Audit Log** — kecil effort, tinggi value, wajib untuk compliance

**NOT in MVP (deferred):**
- Export PDF/Excel SOP — Tim bisa screenshot/print dari browser untuk v1.0
- Real-time WebSocket notifications — polling atau refresh manual cukup untuk v1.0
- Rekap Evaluasi Tahunan laporan — bisa diquery manual dari DB untuk v1.0
- Multi-instansi / multi-kota — tidak dibutuhkan v1.0
- Mobile app — web-first

**MVP Type:**
- [ ] Landing Page MVP
- [ ] Concierge MVP
- [ ] Wizard of Oz MVP
- [ ] Piecemeal MVP
- [x] **Functional MVP** — sistem backend + API lengkap yang diintegrasikan ke UI prototype yang sudah ada

---

## Build-Measure-Learn Plan

### BUILD

**What:** Backend NestJS API (8 fase) yang diintegrasikan ke client UI prototype yang sudah ada (100% selesai)

**Fase Build:**
| Fase | Modul | Deliverable |
|------|-------|-------------|
| 01 | Database Infrastructure | Prisma schema, migration, seed |
| 02 | Auth & Users | JWT login, role guard, user management |
| 03 | OPD & Peraturan | CRUD OPD (dengan agregat), CRUD Peraturan |
| 04 | Tim Penyusun & Evaluasi | Manajemen anggota tim |
| 05 | SOP Core | CRUD SOP, status flow, pelaksana, prosedur |
| 06 | Batch Evaluasi | Batch management, assignment, hasil evaluasi |
| 07 | TTE & Berita Acara | TTE profile, pendaftaran, signing BA, TTD per SOP |
| 08 | Audit Log | Auto-log transisi status, query audit |

**Success Criteria (MVP "done" when):**
- Semua 66 requirements terverifikasi passing
- End-to-end flow: User login → buat SOP → ajukan → evaluasi → verifikasi BA → pengesahan TTE → SOP BERLAKU
- Client UI prototype terhubung ke backend (tidak ada mock data di production build)
- Zero critical bugs di happy path

---

### MEASURE

**Metrics to Track:**
- **North Star:** SOP yang mencapai status BERLAKU per bulan
- **HEART:** WAU, Task completion rate, TTE adoption rate
- **Leading indicators:** SOP diajukan per minggu, waktu median evaluasi

**Data Collection:**
- **Server logs (Winston):** Login events, status transitions, API errors
- **Audit Log table:** Setiap transisi status SOP otomatis tercatat
- **DB queries:** Dashboard metrics bisa di-query langsung dari Prisma
- **User feedback:** Sesi observasi langsung dengan pengguna pilot di Biro Organisasi

**Feedback Mechanism:**
- Pilot dengan 1 OPD + Biro Organisasi selama 2 minggu pertama
- Weekly review dengan admin sistem Biro Organisasi
- Bug report via channel yang ditetapkan (WA/email ke dev team)

---

### LEARN

**Validation Criteria:**
- **Validated:** ≥5 SOP mencapai status BERLAKU dalam 2 minggu pilot; pengguna tidak memerlukan bantuan teknis untuk flow utama
- **Partially Validated:** SOP bisa diajukan dan dievaluasi, tapi TTE masih terkendala (pivot TTE ke asynchronous)
- **Invalidated:** Pengguna kembali ke proses fisik setelah pilot; < 3 SOP berhasil diproses end-to-end

---

### PIVOT or PERSEVERE

**Pivot if:**
- Kepala OPD menolak menggunakan TTE (barrier adopsi) → Pivot: sederhanakan TTE atau tambah opsi "approval tanpa TTE" sementara
- Tim Penyusun tidak mau beralih dari Word/email karena interface terlalu rumit → Pivot: sederhanakan form SOP, tambah import dari template Word
- Biro Organisasi tidak mau mengubah proses karena training terlalu lama → Pivot: tawarkan mode hybrid (sistem + fisik) selama transisi

**Persevere if:**
- ≥70% OPD mengajukan SOP pertama dalam 30 hari
- Waktu evaluasi turun dari baseline manual
- TTE adoption rate ≥50% pada minggu ke-4 pilot
- Tidak ada permintaan kembali ke proses fisik setelah 4 minggu

---

## Deployment Plan

| Milestone | Target | Gate |
|-----------|--------|------|
| Backend v1.0 complete | Semua 8 fase selesai | All 66 requirements passing |
| Internal testing | Dev team + 1 admin Biro | 0 critical bugs |
| Pilot deploy | 1 OPD + Biro Organisasi | End-to-end flow verified |
| Go-live | Semua OPD terdaftar | Pilot metrics validated |
