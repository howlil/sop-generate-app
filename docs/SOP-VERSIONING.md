# Versioning SOP — Revisi Minor & Major

Dokumen ini menjelaskan aturan penomoran versi SOP dan kapan **revisi minor** vs **revisi major** dipakai.

---

## 1. Format versi

Versi SOP dinyatakan dalam bentuk **major.minor**, misalnya:

- **v1.0** — versi awal
- **v1.1**, **v1.2** — revisi minor (angka di belakang koma berubah)
- **v2.0** — revisi major (angka di depan koma naik, minor direset ke 0)
- **v2.1**, **v2.2** — revisi minor lagi setelah major

---

## 2. Revisi minor (angka digit terakhir berubah)

**Digunakan ketika:** SOP belum disahkan, atau masih dalam tahap review internal / review dari Biro.

- Contoh: **v1.0 → v1.1 → v1.2**
- Artinya: perubahan selama draft, review internal, atau review Biro (sebelum SOP disahkan).
- Hanya digit terakhir (minor) yang naik; angka major tetap.

---

## 3. Revisi major (versi menjadi x.0)

**Digunakan ketika:** SOP sudah **disahkan** lalu masuk **evaluasi**, dan hasil evaluasi itu dianggap sebagai perubahan besar (revisi major).

- Contoh: **v1.2 → v2.0**
- Artinya: SOP disahkan, lalu dievaluasi; hasil evaluasi tersebut dicatat sebagai versi baru **major** (v2.0).
- Setelah itu, jika ada revisi lagi (mis. perbaikan kecil pasca-evaluasi), kembali pakai **minor**: **v2.0 → v2.1 → v2.2**, dst.

---

## 4. Ringkasan alur

| Keadaan | Jenis revisi | Contoh versi |
|--------|----------------|--------------|
| SOP baru / draft / review internal / review Biro (belum disahkan) | **Minor** | v1.0 → v1.1 → v1.2 |
| SOP disahkan lalu ada evaluasi (perubahan besar) | **Major** | v1.x → v2.0 |
| Setelah v2.0, ada perubahan lagi | **Minor** | v2.0 → v2.1 → v2.2 |

---

## 5. Tampilan di aplikasi

- **Tim Penyusun** dapat melihat **seluruh riwayat versi** (perubahan lama dan baru) di tab **Riwayat** pada panel kanan halaman Detail SOP.
- Setiap versi ditampilkan dengan:
  - Nomor versi (mis. v1.1, v2.0)
  - Label **Revisi minor** atau **Revisi major**
  - Tanggal, author, dan ringkasan perubahan
- Versi yang memiliki snapshot tersimpan dapat di-**rollback** (kembali ke kondisi versi tersebut).

---

## 6. Rujukan

- Status SOP dan alur disahkan → evaluasi: `docs/WORKFLOW-LIFECYCLE.md`
- Aturan snapshot dan draft: `docs/constraint.md` (Case: Versioning)
