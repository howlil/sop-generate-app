Baik. Kita rapikan semuanya. Bukan cuma “folder”, tapi aturan berpikirnya. Karena struktur tanpa constraint itu cuma dekorasi.

Saya akan susun dalam tiga bagian: prinsip arsitektur, rules teknis, lalu struktur folder final.

Kita desain untuk konteks kamu:
role-centric navigation, domain cross-role, pakai Zustand, skala tugas akhir, satu developer, tapi tetap industrial mindset.

---

## I. Prinsip Arsitektur (Fondasi)

1. Role adalah boundary UI, bukan boundary domain.
   Folder role hanya berisi halaman dan tampilan.
   Role tidak boleh punya logic bisnis sendiri.

2. Domain adalah single source of truth.
   Semua logic SOP, penugasan, evaluasi, TTE, peraturan berada di satu tempat (domains).
   Tidak ada versi SOP per role.

3. State mengikuti domain, bukan mengikuti halaman.
   Zustand store dibuat per domain.

4. UI state lokal tetap lokal.
   Dialog open, filter, tab aktif → tetap di component dengan useState.

5. Tidak ada god store.
   Tidak boleh ada useAppStore yang memuat seluruh state aplikasi.

6. Tidak ada import lintas domain sembarangan.
   Domain A tidak boleh bergantung ke domain B kecuali benar-benar perlu.
   Hindari circular dependency.

7. Component tidak memuat data statis besar.
   Mock dan data awal harus keluar dari component.

8. Component besar harus dipecah atau pakai custom hook.
   Jika file > 400–500 baris, evaluasi pemecahan.

9. Type hanya satu sumber.
   Tidak boleh ada interface SOP di 5 file berbeda.

10. Struktur mengikuti kestabilan domain.
    Domain jarang berubah.
    Role dan UI sering berubah.
    Maka domain harus lebih stabil dan lebih terpusat.

---

## II. Rules Teknis Detail

### A. Rules untuk Domain

Setiap domain wajib punya:

* types.ts → semua type/interface
* store.ts → Zustand store
* service.ts → API/mock abstraction
* mock-data.ts → jika masih pakai mock

Domain dilarang:

* Mengimpor dari pages
* Mengimpor dari routes
* Bergantung pada role

Domain boleh:

* Dipakai oleh semua role
* Dipakai oleh components lintas halaman

---

### B. Rules untuk Store (Zustand)

1. Satu store per domain.
2. Store hanya berisi:

   * state
   * action
   * async logic domain
3. Store tidak berisi logic UI (modal open, active tab).
4. Jangan gabungkan semua domain ke satu file.

Contoh salah:

```
useAppStore.ts
```

Contoh benar:

```
domains/sop/store.ts
domains/penugasan/store.ts
```

---

### C. Rules untuk Pages (Role-based)

Folder pages/<role>/ hanya berisi:

* Halaman React component
* Custom hook spesifik halaman (opsional)

Pages tidak boleh:

* Menyimpan mock data besar
* Mendefinisikan ulang type domain

Pages hanya:

* Mengkonsumsi store domain
* Mengatur layout dan interaksi

---

### D. Rules untuk Components

components/ui → atomic reusable
components/layout → layout global
components/sop → reusable khusus domain SOP
components/shared → reusable umum

Component:

* Tidak fetch langsung
* Tidak punya business logic berat
* Tidak mengandung 1000+ baris

---

### E. Rules untuk Role

Role hanya mengatur:

* Route
* Guard akses
* Variasi tampilan

Role tidak boleh:

* Mengubah struktur domain
* Mengubah bentuk data

---

### F. UI State vs Domain State

UI State:

* modal open
* filter keyword
* selected tab
  → useState

Domain State:

* daftar SOP
* status penugasan
* hasil evaluasi
  → Zustand

Kalau ragu, tanya:
“Apakah state ini dipakai lintas halaman?”
Kalau ya → domain store.

---

## III. Struktur Folder Final (Dengan Zustand)

```plaintext
src/
│
├── app/
│   ├── router.tsx
│   └── providers.tsx
│
├── routes/                      # TanStack Router (role-based)
│   ├── kepala-opd/
│   ├── tim-evaluasi/
│   ├── tim-penyusun/
│   ├── kepala-biro-organisasi/
│   └── validasi/
│
├── pages/                       # UI per role
│   ├── kepala-opd/
│   │   ├── Dashboard.tsx
│   │   └── DaftarSOP.tsx
│   │
│   ├── tim-penyusun/
│   │   ├── DetailSOP.tsx
│   │   └── hooks/
│   │       └── useDetailSOP.ts
│   │
│   └── tim-evaluasi/
│
├── domains/                     # ⭐ pusat domain
│   ├── sop/
│   │   ├── types.ts
│   │   ├── store.ts            # zustand
│   │   ├── service.ts
│   │   ├── mock-data.ts
│   │   └── hooks/              # opsional, domain-level hook
│   │
│   ├── penugasan/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── service.ts
│   │
│   ├── evaluasi/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── service.ts
│   │
│   ├── tte/
│   └── peraturan/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── sop/
│   ├── tte/
│   └── shared/
│
├── hooks/                       # lintas domain
│   ├── useAuth.ts
│   └── useRoleGuard.ts
│
├── utils/
│   └── format-date.ts
│
└── types/                       # global generic types
```

---

## IV. Constraint Final (Ringkas dan Tegas)

1. Role hanya UI boundary.
2. Domain hanya satu versi.
3. Zustand store per domain.
4. Tidak ada god store.
5. Tidak ada domain logic di page.
6. Tidak ada mock besar di component.
7. Type tidak boleh duplikat.
8. Component tidak boleh jadi monster file.

---

