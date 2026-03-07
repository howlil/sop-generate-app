# Code Review: Komponen Reusable, Agnostic & Fleksibel

Tanggal: 2026-03-05  
Tujuan: Mengidentifikasi komponen yang terlalu spesifik ke case tertentu, lalu refactor agar agnostik, fleksibel, dan style bisa di-override.

---

## Prinsip yang Diterapkan

1. **Agnostik:** Komponen UI tidak mengandalkan domain (SOP, evaluasi, OPD) di dalam implementasinya; data/label dari props atau config terpisah.
2. **Fleksibel:** Konten (label, opsi, empty message) dan tampilan (className, variant) bisa diatur dari luar.
3. **Style fleksibel:** Semua komponen yang di-refactor mendukung `className` dan, bila relevan, class per-bagian (contentClassName, titleClassName, dll.).

---

## Refactor yang Dilakukan

### 1. StatusBadge — config terpisah

**Masalah:** Semua mapping domain+status → warna dan label ada di dalam komponen (sopStatusClasses, penugasanEvaluasiClasses, dll.), sehingga komponen tergantung domain.

**Perubahan:**
- **Baru:** `lib/constants/status-badge-config.ts` — export `getStatusBadgeConfig(domain, status)` mengembalikan `{ label, className }`. Semua map status → kelas Tailwind dan label ada di sini.
- **status-badge.tsx:** Hanya menerima `status`, `domain`, `className`, `label?`; memanggil `getStatusBadgeConfig(domain, status)` dan merender `Badge` dengan hasil + override `label` bila diberikan.

**Hasil:** Komponen hanya “tampilkan badge untuk domain+status”; aturan bisnis tampilan ada di config.

---

### 2. ItemListCard (baru) + SOPListCard (wrapper)

**Masalah:** SOPListCard mengasumsikan struktur SOP (nama, nomor, status) dan teks "Tidak ada SOP" di dalam komponen.

**Perubahan:**
- **Baru:** `components/ui/item-list-card.tsx` — komponen generik:
  - `items`, `getKey`, `renderPrimary`, `renderSecondary?`, `emptyMessage`, `selectedId?`, `onSelect?`
  - `className`, `emptyClassName`, `itemClassName`, `selectedItemClassName`, `singleItemClassName`, `getItemTitle?`
  - Tidak ada referensi ke SOP; cocok untuk list item apa pun (SOP, OPD, dll.).
- **SOPListCard:** Menggunakan `ItemListCard<SOPListItem>` dengan `renderPrimary=(sop)=>sop.nama`, `renderSecondary` yang merender `StatusBadge`, `emptyMessage="Tidak ada SOP"`, `getItemTitle=(sop)=>sop.nama`. Interface publik (SOPListItem, SOPListCardProps) tidak berubah.

**Hasil:** Satu komponen list card yang bisa dipakai ulang; SOPListCard hanya mapping SOP → ItemListCard.

---

### 3. OptionCardPicker (baru) + StatusHasilEvaluasiPicker (pakai picker)

**Masalah:** StatusHasilEvaluasiPicker meng-hardcode dua opsi (Sesuai / Revisi Biro), icon, dan teks di dalam komponen.

**Perubahan:**
- **Baru:** `components/ui/option-card-picker.tsx` — picker generik:
  - `options: OptionCardOption<T>[]` (value, label, description?, icon?, variant?)
  - `value`, `onChange`, `label?`, `required?`, `columns?`, `className?`, `optionClassName?`
  - Variant: success, warning, neutral, info (untuk warna border/background saat terpilih).
- **StatusHasilEvaluasiPicker:** Mendefinisikan `OPTIONS` dari konstanta evaluasi (STATUS_HASIL_EVALUASI), memakai `OptionCardPicker<StatusHasilEvaluasiForm>`, dan tetap menampilkan peringatan “Komentar wajib untuk Revisi Biro” di bawah.

**Hasil:** Picker opsi berbasis kartu bisa dipakai untuk use case lain; evaluasi hanya mengisi opsi dan teks.

---

### 4. FormDialog, ConfirmDialog, EmptyState, DialogFooterActions — style fleksibel

**Perubahan (hanya penambahan props, tanpa ubah perilaku):**

- **FormDialog:** `contentClassName?` (wrapper area form), `className?` (DialogContent). Import `cn` untuk menggabungkan class.
- **ConfirmDialog:** `className?` untuk DialogContent.
- **EmptyState:** `iconClassName?`, `titleClassName?`, `descriptionClassName?`, `actionClassName?` agar tiap bagian bisa di-style terpisah.
- **DialogFooterActions:** `cancelClassName?`, `confirmClassName?` untuk tombol Batal dan Konfirmasi. Import `cn`.

**Hasil:** Semua komponen ini tetap agnostik; style bisa di-override per bagian tanpa mengubah struktur.

---

## File Baru

| File | Deskripsi |
|------|-----------|
| `lib/constants/status-badge-config.ts` | Config status badge (domain+status → label + className). |
| `components/ui/item-list-card.tsx` | List card generik (render props + optional selection). |
| `components/ui/option-card-picker.tsx` | Picker opsi berbasis kartu (icon + label + description + variant). |

---

## File yang Diubah

| File | Perubahan |
|------|-----------|
| `components/ui/status-badge.tsx` | Tipis: pakai `getStatusBadgeConfig`, tidak lagi menyimpan map di komponen. |
| `components/sop/SOPListCard.tsx` | Pakai `ItemListCard`; export dan props tetap sama. `statusDomain` tipenya pakai `StatusDomain`. |
| `components/evaluasi/StatusHasilEvaluasiPicker.tsx` | Pakai `OptionCardPicker` + OPTIONS dari konstanta. |
| `components/ui/form-dialog.tsx` | Tambah `contentClassName`, `className`, pakai `cn`. |
| `components/ui/confirm-dialog.tsx` | Tambah `className` untuk DialogContent. |
| `components/ui/empty-state.tsx` | Tambah `iconClassName`, `titleClassName`, `descriptionClassName`, `actionClassName`. |
| `components/ui/dialog-footer-actions.tsx` | Tambah `cancelClassName`, `confirmClassName`, pakai `cn`. |

---

## Komponen yang Sudah Cukup Baik (Tidak Diubah)

- **FormField, InfoCard, InfoField, InfoGrid:** Sudah menerima label/konten dan `className`.
- **SearchToolbar, DataTable (compound):** Sudah agnostik dan menerima `className`.
- **Badge, Button:** Sudah variant-based dan `className`.
- **RiwayatCardList:** Generik (title, emptyMessage, items, renderItem).
- **SkorRatingPicker:** Sudah punya `label` dan `hint` props; bisa dipakai ulang untuk rating 1–5 di konteks lain.

---

## Rekomendasi Lanjutan

1. **KomentarPanel / VersionHistoryPanel:** Jika ada teks atau struktur yang sangat spesifik SOP, pertimbangkan ekstraksi ke config atau slot (children) agar komponen tetap agnostik.
2. **SOPPreviewTemplate / diagram:** Tetap domain-SOP; tidak perlu dibuat generik kecuali ada kebutuhan reuse di konteks lain.
3. **Pemakaian ItemListCard:** Bisa dipakai untuk daftar OPD, daftar peraturan, atau list lain yang “pilih satu dari banyak” dengan tampilan card.

Build client setelah refactor: **sukses** (tanpa mengubah perilaku yang ada).
