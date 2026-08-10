# Testing Quality Gates

Dokumen ini menjadi kontrak operasional CI untuk lapisan pengujian setelah audit P1. Laporan historis di `docs/unit-test.md` dan `docs/e2e-report.md` adalah snapshot eksekusi pada commit tertentu dan tidak boleh dipakai sebagai status HEAD tanpa menjalankan ulang gate di bawah.

## Blocking gates pada pull request

1. **Server quality + coverage**
   - typecheck;
   - lint pada TypeScript yang berubah;
   - Jest unit test dengan coverage;
   - threshold global Jest tetap menjadi gate;
   - build NestJS.
2. **Client quality + coverage**
   - typecheck;
   - audit arsitektur J01-J07;
   - lint;
   - Vitest dengan coverage dan threshold konfigurasi;
   - build client.
3. **Backend integration + migration fidelity**
   - MariaDB disposable;
   - schema dibangun dari Prisma migration history, bukan `prisma db push`;
   - seluruh `*.integration-spec.ts` dieksekusi melalui Docker runner.
4. **Critical E2E business journeys**
   - J01-J07;
   - Chromium;
   - zero retry;
   - database di-reset dari migration history dan di-seed ulang sebelum setiap journey.
5. **Functional system regression**
   - auth, RBAC, master data, authoring, version history, evaluation, TTE, public archive, PDF verification, list/filter/pagination;
   - concurrency correctness;
   - profile TTE, public pages, layout shell, dan workflow smoke;
   - Chromium pada database disposable yang dibangun dari migrations.
6. **Container build**
   - hanya dijalankan setelah seluruh gate di atas berhasil.

## Database fidelity

Test yang mengklaim integrasi database atau business workflow wajib menggunakan migration history. Hal ini penting karena sebagian invariant sistem berada di SQL migration/trigger dan tidak dapat direpresentasikan hanya oleh `schema.prisma` + `prisma db push`.

Untuk database disposable digunakan:

```bash
pnpm prisma migrate reset --force
pnpm db:seed:e2e
```

Pada Prisma ORM 7, seeding dijalankan secara eksplisit sehingga reset migration tidak memerlukan `--skip-seed`. Integration runner memakai prinsip yang sama di `docker-compose.test.yml`.

## Kontrak revisi dan kirim ulang

Source of truth untuk aturan revisi adalah implementation policy + automated tests. Saat terdapat umpan balik aktif dengan `statusTindakLanjut` `TERBUKA` atau `SELESAI`, PJ Penyusun dapat mengirim ulang SOP revisi. UI tetap menyediakan aksi eksplisit untuk menandai tindak lanjut selesai; J02 menguji jalur pengguna tersebut.

Dokumentasi test case lama yang menyatakan kirim ulang pada `TERBUKA` selalu ditolak harus dianggap stale sampai tabel tersebut diselaraskan dengan kontrak ini.

## Reporting

Angka jumlah test, pass/fail, waktu eksekusi, dan coverage hanya boleh dimasukkan ke laporan tugas akhir setelah pipeline pada commit final berstatus green. Jangan menyalin angka dari snapshot lama untuk merepresentasikan HEAD terbaru.
