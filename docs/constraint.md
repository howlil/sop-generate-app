# Logic Business Aplikasi — Constraint & Aturan

## Case: Manajemen Akun

**Q:** Akun & data: bisa dihapus? soft delete? nonaktif? constraint terhadap data yang sudah dibuat.

### Nonaktif untuk akun yang sudah punya jejak data

- Jika user pernah membuat/mengubah/menyetujui data → akun tidak boleh hard delete.
- Deactivate (nonaktif) + simpan historinya.

### Hard delete hanya untuk akun "kosong"

- Tidak punya relasi ke SOP/proyek/evaluasi/komentar/approval/log.

---

## Case: Evaluasi SOP

**Q1:** Kapan SOP yang disahkan layak untuk dievaluasi, minimal rentang waktunya kapan.

---

## Case: Versioning

### Draft working copy (autosave biasa, bukan version resmi)

- Saat Tim Penyusun mengedit draft, sistem menyimpan perubahan sebagai current working content (misal update field dokumen).
- Ini tidak dianggap "versi resmi", cuma keadaan terakhir draft.

### Snapshot versi (resmi) dibuat pada event tertentu

- Submit (Simpan sebagai draft / Serahkan ke Kepala OPD / Ajukan Evaluasi)
- Ubah status penting (Diperiksa Kepala OPD → Siap Dievaluasi / Revisi dari Kepala OPD; evaluasi → Terverifikasi dari Kepala Biro / Revisi dari Tim Evaluasi)
- Publish/Sign-off (Disahkan → Berlaku)

### Aturan revisi minor vs major

- **Revisi minor** (angka digit terakhir berubah, mis. v1.0 → v1.1): dipakai selama SOP baru, review internal, atau review dari Biro **sebelum disahkan**.
- **Revisi major** (versi menjadi x.0, mis. v1.x → v2.0): dipakai ketika SOP **sudah disahkan** lalu masuk **evaluasi** dan hasil evaluasi itu dianggap perubahan besar. Setelah v2.0, revisi berikutnya kembali minor (v2.1, v2.2, …).

Detail lengkap: **docs/SOP-VERSIONING.md**.

**Constraint:** Setelah status **Berlaku**, dokumen tidak boleh diubah; perubahan hanya lewat proses Revisi/Amendment yang menciptakan versi baru. Status SOP mengikuti single source of truth di `lib/domain/sop-status.ts`.

---

## Case: Bentrok evaluasi (OPD request vs Biro inisiasi di waktu yang sama)

**Masalah:** Satu SOP bisa punya 2 "evaluasi aktif" sekaligus, dari dua jalur. Itu bikin status SOP membingungkan, tim evaluasi dapat duplikasi kerja, berita acara jadi rancu.

**Constraint:**

### Satu SOP hanya boleh punya 1 "evaluation case" aktif pada satu waktu

Artinya, ketika ada case evaluasi aktif (status: queued/assigned/in progress), request lain tidak membuat case baru—melainkan merge atau ditolak dengan alasan "sudah ada evaluasi berjalan".

### Cara implementasi yang paling bersih

Buat entitas: **EvaluationCase** (bukan sekadar status SOP).

**EvaluationCase** punya:

- `source_type`: OPD_REQUEST atau BIRO_INITIATIVE
- `source_ref`: id request atau id inisiasi biro
- `status`: Draft → Assigned → In Progress → Completed → Verified
- Daftar SOP yang masuk batch

**Ekspektasi UI:**

- Di SOP detail: ada panel "Evaluasi Aktif" (kalau ada) → tampilkan nomor case, status, tim evaluator, asal pemicu (biro/opd/both).
- Di menu OPD "Request Evaluasi": jika SOP sedang dievaluasi, tombol request berubah jadi disabled + pesan "sedang dievaluasi dalam EV-xxx".
- Di Biro "Inisiasi Evaluasi": saat pilih SOP, sistem memberi indikator "sudah ada request/sudah dalam case".

---

## Case: Manajemen Peraturan

- Satu OPD bisa melihat peraturan OPD lain tapi tidak bisa mengedit.
- OPD hanya bisa mengedit peraturannya sendiri; tetap bersifat global, namun ada strict-nya.
- Ada field **created by**.
- Masing-masing OPD bisa menggunakan peraturan mana saja di dalam SOP tanpa memikirkan siapa yang buat.
- Peraturan yang diedit juga ada versioning-nya; tidak bisa dihapus selagi belum ada SOP yang terkait dengan undang-undang.
- Jika undang-undang ada perubahan, tidak serta-merta di SOP juga otomatis terupdate; kecuali OPD mengupdate undang-undang versi baru.

---

## Case: Manajemen OPD

- Di bagian Manajemen OPD pisahkan **pembuatan OPD** dengan **Kepala OPD**, tapi masih dalam page Manajemen OPD yang sama.
- OPD di-CRUD; bisa dihapus selagi belum ada yang mengaitkan dengan pembuatan SOP.
- Di OPD ada **riwayat Kepala OPD**; status aktif atau tidak berada di label Kepala OPD dan riwayatnya ada di OPD.
- Kepala OPD bisa dihapus selagi belum membuat SOP atau belum diinisiasi ke OPD.
