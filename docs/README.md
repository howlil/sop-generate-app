# Dokumentasi Proyek — Biro Organisasi

Semua dokumen proyek (.md) disatukan di folder `docs` untuk kemudahan referensi.

## Daftar Dokumen

| File | Deskripsi |
|------|-----------|
| [WORKFLOW-LIFECYCLE.md](./WORKFLOW-LIFECYCLE.md) | Workflow & lifecycle aplikasi: role, status SOP, evaluasi, diagram alur. |
| [constraint.md](./constraint.md) | Logic business & constraint: manajemen akun, versioning, evaluasi, peraturan, OPD. |
| [TTE-BSRE-RINGKASAN.md](./TTE-BSRE-RINGKASAN.md) | Ringkasan Tanda Tangan Elektronik (TTE) berstandar BSRE dan penerapan di sistem. |
| [design-style-guide.md](./design-style-guide.md) | Panduan desain UI: layout, warna, typography, spacing, komponen (client). |
| [SOP_DIAGRAM_LOGIC.md](./SOP_DIAGRAM_LOGIC.md) | Peta logika mesin diagram SOP (flowchart + BPMN) dan arrow engine. |
| [server-README.md](./server-README.md) | README server (NestJS); salinan untuk arsip docs. |

## Referensi silang

- **Workflow** merujuk ke aturan versioning dan evaluasi di `constraint.md`.
- **TTE** dipakai di halaman Kepala OPD (mengesahkan SOP) dan Kepala Biro (memverifikasi evaluasi).
- **SOP Diagram** dipakai di komponen `client/src/components/sop/` (flowchart, BPMN).
