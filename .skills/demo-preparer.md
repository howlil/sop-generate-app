---
name: demo-preparer
description: >
  Demo preparation specialist for thesis defense. Use this skill when: preparing live demo
  for thesis defense, creating demo script, seed data for demo, or backup plan if demo fails.
  Triggers on: "demo thesis", "thesis defense", "demo script", "seed data demo", "backup plan".
---

# Demo Preparer — Thesis Defense Specialist

**Mission:** Ensure flawless live demo for thesis defense with backup plans.

**Time Budget:** 4-6 hours preparation

---

## Demo Preparation Checklist

### 1. Demo Environment Setup (1 hour)

**Environment Requirements:**

```
✅ Laptop fully charged + charger
✅ Stable internet connection (backup: mobile hotspot)
✅ Database seeded with demo data
✅ All users can login
✅ All critical flows tested locally
✅ Screen resolution set to 1920x1080
✅ Browser zoom 100%
✅ Notifications disabled (Do Not Disturb mode)
```

**Demo Database:**

```bash
# Seed demo data
npm run seed:demo

# Verify data
npx prisma db seed

# Check critical data exists:
# - 4 OPD (Dinas Kesehatan, Dinas Pendidikan, Dinas PU, Dinas Sosial)
# - 8 users (2 per role: Tim Penyusun, Kepala OPD, Biro Organisasi, Tim Evaluasi)
# - 10 SOP (3 DRAFT, 3 BERLAKU, 2 DIAJUKAN_EVALUASI, 2 BERLAKU)
# - 2 PengajuanEvaluasi (1 SELESAI, 1 SEDANG_DIEVALUASI)
# - 4 RiwayatTandaTangan (signed BA + signed SOP)
```

**User Accounts for Demo:**

| Role | Email | Password | OPD |
|------|-------|----------|-----|
| Tim Penyusun | tim-penyusun@dinkes.go.id | Demo123! | Dinas Kesehatan |
| Tim Penyusun | tim-penyusun@disdik.go.id | Demo123! | Dinas Pendidikan |
| Kepala OPD | kepala@dinkes.go.id | Demo123! | Dinas Kesehatan |
| Kepala OPD | kepala@disdik.go.id | Demo123! | Dinas Pendidikan |
| Biro Organisasi | biro@kemenag.go.id | Demo123! | Biro Organisasi |
| Tim Evaluasi | evaluator1@kemenag.go.id | Demo123! | Biro Organisasi |
| Tim Evaluasi | evaluator2@kemenag.go.id | Demo123! | Biro Organisasi |

---

### 2. Demo Script (1-2 hours)

**Demo Flow (15 minutes total):**

```
MINUTE 0-1: Introduction
  - "Sistem Informasi SOP Biro Organisasi memfasilitasi siklus hidup SOP..."
  - Show login page
  - "Ada 4 role: Tim Penyusun, Kepala OPD, Biro Organisasi, Tim Evaluasi"

MINUTE 1-3: Tim Penyusun Flow
  - Login sebagai Tim Penyusun (tim-penyusun@dinkes.go.id)
  - Show daftar SOP
  - Click "Buat SOP Baru"
  - Fill form: Judul, Nomor SOP, Deskripsi
  - Submit → Show DRAFT status
  - "Tim Penyusun dapat membuat SOP baru dengan status DRAFT"

MINUTE 3-5: Edit SOP & Prosedur
  - Click SOP yang baru dibuat
  - Click "Edit Metadata"
  - Fill: Institution, PIC, Section
  - Click "Edit Prosedur"
  - Add 2-3 langkah (START → TASK → END)
  - Show diagram flowchart
  - "Sistem menghasilkan diagram BPMN secara otomatis"

MINUTE 5-7: Biro Organisasi Flow
  - Logout → Login sebagai Biro (biro@kemenag.go.id)
  - Show daftar pengajuan evaluasi
  - Click "Buat Pengajuan Evaluasi"
  - Select 2-3 SOP dari OPD berbeda
  - Assign Tim Evaluasi
  - "Biro Organisasi dapat membuat batch evaluasi"

MINUTE 7-9: Tim Evaluasi Flow
  - Logout → Login sebagai Evaluator (evaluator1@kemenag.go.id)
  - Show evaluasi ditugaskan
  - Click "Evaluasi"
  - Fill hasil: SESUAI / TIDAK_SESUAI
  - Add catatan
  - Submit → Show status SEDANG_DIEVALUASI
  - "Tim Evaluasi dapat mengirim hasil evaluasi"

MINUTE 9-12: TTE Signing Flow
  - Logout → Login sebagai Biro
  - Show BA yang siap ditandatangani
  - Click "Tandatangani BA"
  - Enter PIN TTE (123456)
  - Show signature applied
  - "Biro Organisasi menandatangani Berita Acara"
  
  - Logout → Login sebagai Koordinator (tim-penyusun@dinkes.go.id)
  - Click "Tandatangani BA"
  - Enter PIN TTE
  - "Koordinator Tim Penyusun menandatangani BA"

MINUTE 12-14: Kepala OPD Flow
  - Logout → Login sebagai Kepala OPD (kepala@dinkes.go.id)
  - Show daftar SOP siap pengesahan
  - Click "Sahkan SOP"
  - Enter PIN TTE
  - Show status changed to BERLAKU
  - "Kepala OPD mengesahkan SOP menjadi BERLAKU"

MINUTE 14-15: Closing
  - Show dashboard dengan statistik
  - "Sistem telah memfasilitasi seluruh siklus hidup SOP..."
  - "Demo selesai, terima kasih"
```

**Backup Screenshots (if live demo fails):**

```
Screenshot 1: Login page
Screenshot 2: Tim Penyusun dashboard
Screenshot 3: SOP creation form
Screenshot 4: Diagram flowchart
Screenshot 5: Evaluasi form
Screenshot 6: TTE signing (PIN input)
Screenshot 7: SOP status BERLAKU
```

---

### 3. Seed Data Script (1 hour)

**Demo Data Requirements:**

```typescript
// seed-demo.ts

// 1. Create OPD
const opd1 = await prisma.oPD.create({
  data: {
    kode: 'DINKES',
    nama: 'Dinas Kesehatan',
    alamat: 'Jl. Kesehatan No. 1',
  },
});

const opd2 = await prisma.oPD.create({
  data: {
    kode: 'DISDIK',
    nama: 'Dinas Pendidikan',
    alamat: 'Jl. Pendidikan No. 2',
  },
});

// 2. Create Users per role
const timPenyusun1 = await prisma.pengguna.create({
  data: {
    email: 'tim-penyusun@dinkes.go.id',
    password: hashPassword('Demo123!'),
    peran: 'TIM_PENYUSUN',
    opdId: opd1.id,
  },
});

// 3. Create SOP with various status
const sop1 = await prisma.sOP.create({
  data: {
    judul: 'SOP Pelayanan Publik',
    nomorSop: 'SOP/DINKES/2026/001',
    opdId: opd1.id,
    userId: timPenyusun1.id,
    detailSops: {
      create: {
        versi: 1,
        status: 'BERLAKU',
        institution: 'Dinas Kesehatan',
        picName: 'Dr. Sehat',
      },
    },
  },
});

// 4. Create PengajuanEvaluasi
const pengajuan1 = await prisma.pengajuanEvaluasi.create({
  data: {
    jenis: 'TERJADWAL',
    status: 'SELESAI_DIEVALUASI',
    opdId: opd1.id,
    detailSops: {
      connect: { id: sop1.detailSops[0].id },
    },
  },
});

// 5. Create RiwayatTandaTangan
const tte1 = await prisma.riwayatTandaTangan.create({
  data: {
    pengajuanEvaluasiId: pengajuan1.id,
    userId: biroUser.id,
    peran: 'BIRO_ORGANISASI',
    documentHash: 'abc123',
    signedAt: new Date(),
  },
});

console.log('✅ Demo data seeded successfully!');
```

**Run Seed:**

```bash
npm run seed:demo
```

---

### 4. Backup Plan (30 min)

**If Live Demo Fails:**

| Failure | Backup Plan |
|---------|-------------|
| Internet down | Use mobile hotspot (pre-tested) |
| Database error | Restore from backup SQL dump |
| Login fails | Use backup user credentials (printed) |
| Browser crash | Have Firefox/Edge as backup |
| Laptop crash | Use backup laptop with pre-loaded screenshots |
| Demo flow fails | Switch to screenshot walkthrough |

**Backup Files:**

```
/demo-backup/
├── screenshots/
│   ├── 01-login.png
│   ├── 02-dashboard-tim-penyusun.png
│   ├── 03-create-sop.png
│   ├── 04-diagram-bpmn.png
│   ├── 05-evaluasi-form.png
│   ├── 06-tte-sign.png
│   └── 07-sop-berlaku.png
├── user-credentials.txt (printed)
├── demo-script.pdf (printed)
└── database-backup.sql
```

**Screenshot Walkthrough Script (if live demo fails):**

```
"Karena ada kendala teknis, saya akan menampilkan screenshot alur kerja sistem."

Slide 1: Login Page
"User login dengan email dan password sesuai role."

Slide 2: Dashboard Tim Penyusun
"Tim Penyusun melihat daftar SOP milik OPD-nya."

Slide 3: Create SOP Form
"Form create SOP dengan validasi real-time."

Slide 4: Diagram BPMN
"Sistem menghasilkan diagram flowchart otomatis dari prosedur steps."

[Continue for each screenshot...]
```

---

### 5. Pre-Demo Checklist (15 min before)

```
✅ Laptop charged + charger connected
✅ Internet connected (speed test: >10 Mbps)
✅ Database seeded and verified
✅ All 7 user accounts can login
✅ All 5 critical flows tested locally
✅ Browser in incognito mode (no cached data)
✅ Screen resolution 1920x1080
✅ Notifications disabled
✅ Backup screenshots ready
✅ Printed demo script
✅ Printed user credentials
✅ Water bottle (stay hydrated!)
```

---

## Output Contract

Generate demo preparation package in this format:

```markdown
===========================================
DEMO PREPARATION PACKAGE
===========================================
Thesis Defense: [date]
Presenter: [name]

---
DEMO ENVIRONMENT
---
[Setup checklist]

---
DEMO SCRIPT
---
[15-minute script with timing]

---
SEED DATA
---
[Demo data requirements + seed script]

---
BACKUP PLAN
---
[Failure scenarios + backup actions]

---
PRE-DEMO CHECKLIST
---
[15-min before checklist]

===========================================
DEMO READY: YES / NO
Confidence: HIGH / MEDIUM / LOW
===========================================
```

---

*Created: 2026-04-01 — FYP-specific skill for thesis defense demo*
