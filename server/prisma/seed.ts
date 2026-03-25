import {
  PrismaClient,
  type OPD,
  type User,
  type Peraturan,
  type TimPenyusun,
  type TimEvaluasiAnggota,
  type Pelaksana,
  type SOP,
  type LawBasis,
  type Equipment,
  type RecordData,
  type ImplementQualification,
  type ProsedurRow,
  type EvaluasiItem,
  type TTEProfile,
} from '../src/generated/prisma';
import { faker } from '@faker-js/faker/locale/id_ID';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

// Parse DATABASE_URL to extract connection params for the adapter
// Format: mysql://user:password@host:port/database
function parseDatabaseUrl(url: string) {
  const match = url.match(/^mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)$/);
  if (!match) throw new Error(`Invalid DATABASE_URL: ${url}`);
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
}

const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL!);
const adapter = new PrismaMariaDb({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  connectionLimit: 10,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data in reverse dependency order
  await prisma.komentar.deleteMany();
  await prisma.tTESignature.deleteMany();
  await prisma.tTEProfile.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.evaluasiItem.deleteMany();
  await prisma.verifikasiBatch.deleteMany();
  await prisma.relatedSOP.deleteMany();
  await prisma.prosedurRowPelaksana.deleteMany();
  await prisma.prosedurRow.deleteMany();
  await prisma.implementQualification.deleteMany();
  await prisma.recordData.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.lawBasis.deleteMany();
  await prisma.sOP.deleteMany();
  await prisma.pelaksana.deleteMany();
  await prisma.timEvaluasiAnggota.deleteMany();
  await prisma.timPenyusun.deleteMany();
  await prisma.peraturan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.oPD.deleteMany();

  console.log('Cleaned existing data');

  // ============================
  // Step 1: Seed OPDs (4)
  // ============================
  const opdKodes = ['DKS', 'BKD', 'DPU', 'DSI'];
  const opds: OPD[] = [];
  for (const kode of opdKodes) {
    const opd = await prisma.oPD.create({
      data: {
        name: `Dinas ${faker.company.name()}`,
        email: faker.internet.email(),
        phone: faker.phone.number(),
        kode,
      },
    });
    opds.push(opd);
  }
  console.log(`Seeded ${opds.length} OPDs`);

  // ============================
  // Step 2: Seed Users (12 total: 1 BIRO, 3 TIM_EVALUASI, 4 TIM_PENYUSUN, 4 KEPALA_OPD)
  // ============================

  // 1 BIRO_ORGANISASI (no opdId)
  const biroUser = await prisma.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: 'password123',
      role: 'BIRO_ORGANISASI',
      nip: faker.string.numeric(18),
      jabatan: 'Kepala Biro Organisasi',
      pangkat: 'Pembina Utama Muda',
      nohp: faker.phone.number(),
    },
  });

  // 3 TIM_EVALUASI (no opdId)
  const timEvaluasiUsers: User[] = [];
  for (let i = 0; i < 3; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: 'password123',
        role: 'TIM_EVALUASI',
        nip: faker.string.numeric(18),
        jabatan: 'Analis Kebijakan',
        pangkat: 'Penata Tingkat I',
        nohp: faker.phone.number(),
      },
    });
    timEvaluasiUsers.push(user);
  }

  // 4 TIM_PENYUSUN (1 per OPD)
  const timPenyusunUsers: User[] = [];
  for (let opdIdx = 0; opdIdx < opds.length; opdIdx++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: 'password123',
        role: 'TIM_PENYUSUN',
        opdId: opds[opdIdx].id,
        nip: faker.string.numeric(18),
        jabatan: 'Penyusun SOP',
        pangkat: 'Penata',
        nohp: faker.phone.number(),
      },
    });
    timPenyusunUsers.push(user);
  }

  // 4 KEPALA_OPD (1 per OPD)
  const kepalaOpdUsers: User[] = [];
  for (let opdIdx = 0; opdIdx < opds.length; opdIdx++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: 'password123',
        role: 'KEPALA_OPD',
        opdId: opds[opdIdx].id,
        nip: faker.string.numeric(18),
        jabatan: 'Kepala Dinas',
        pangkat: 'Pembina Utama Muda',
        nohp: faker.phone.number(),
      },
    });
    kepalaOpdUsers.push(user);
  }

  const allUsers = [biroUser, ...timEvaluasiUsers, ...timPenyusunUsers, ...kepalaOpdUsers];
  console.log(`Seeded ${allUsers.length} Users`);

  // ============================
  // Step 3: Seed Peraturan (4)
  // ============================
  const peraturans: Peraturan[] = [];
  for (let i = 0; i < 4; i++) {
    const peraturan = await prisma.peraturan.create({
      data: {
        nomor: `${faker.number.int({ min: 1, max: 99 })}`,
        tahun: 2026,
        tentang: faker.lorem.sentence(),
        status: 'BERLAKU',
        createdById: biroUser.id,
      },
    });
    peraturans.push(peraturan);
  }
  console.log(`Seeded ${peraturans.length} Peraturans`);

  // ============================
  // Step 4: Seed TimPenyusun (4 - link TIM_PENYUSUN users to OPDs)
  // ============================
  const timPenyusunRecords: TimPenyusun[] = [];
  for (let i = 0; i < timPenyusunUsers.length; i++) {
    const user = timPenyusunUsers[i];
    const opdIdx = i; // 1 per OPD
    const record = await prisma.timPenyusun.create({
      data: {
        userId: user.id,
        opdId: opds[opdIdx].id,
        status: 'AKTIF',
        roleInternal: i % 2 === 0 ? 'KOORDINATOR' : 'ANGGOTA',
      },
    });
    timPenyusunRecords.push(record);
  }
  console.log(`Seeded ${timPenyusunRecords.length} TimPenyusun`);

  // ============================
  // Step 5: Seed TimEvaluasiAnggota (3)
  // ============================
  const timEvaluasiRecords: TimEvaluasiAnggota[] = [];
  for (const user of timEvaluasiUsers) {
    const record = await prisma.timEvaluasiAnggota.create({
      data: {
        userId: user.id,
        status: 'AKTIF',
      },
    });
    timEvaluasiRecords.push(record);
  }
  console.log(`Seeded ${timEvaluasiRecords.length} TimEvaluasiAnggota`);

  // ============================
  // Step 6: Seed Pelaksana (8 - 2 per OPD)
  // ============================
  const pelaksanas: Pelaksana[] = [];
  for (const opd of opds) {
    for (let j = 0; j < 2; j++) {
      const pelaksana = await prisma.pelaksana.create({
        data: {
          namaLengkap: faker.person.fullName(),
          nip: faker.string.numeric(18),
          jabatan: faker.person.jobTitle(),
          pangkat: 'Penata',
          email: faker.internet.email(),
          nohp: faker.phone.number(),
          deskripsi: faker.lorem.sentence(),
          opdId: opd.id,
        },
      });
      pelaksanas.push(pelaksana);
    }
  }
  console.log(`Seeded ${pelaksanas.length} Pelaksana`);

  // ============================
  // Step 7: Seed SOP (8 - 2 per OPD)
  // ============================
  const sops: SOP[] = [];
  const statuses: Array<'DRAFT' | 'SEDANG_DISUSUN'> = ['DRAFT', 'SEDANG_DISUSUN'];
  for (let opdIdx = 0; opdIdx < opds.length; opdIdx++) {
    const opd = opds[opdIdx];
    const penyusunUser = timPenyusunUsers[opdIdx];
    for (let j = 0; j < 2; j++) {
      const sop = await prisma.sOP.create({
        data: {
          judul: `SOP ${faker.lorem.words(3)}`,
          nomorSOP: `SOP/${opd.kode}/2026/${String(j + 1).padStart(3, '0')}`,
          status: statuses[j % 2],
          opdId: opd.id,
          peraturanId: peraturans[opdIdx].id,
          createdById: penyusunUser.id,
          lastEditedById: penyusunUser.id,
          picUserId: penyusunUser.id,
          picName: penyusunUser.name,
          section: faker.lorem.words(2),
          warning: faker.lorem.sentence(),
          institutionLines: `Pemerintah Kota Padang\n${opd.name}`,
        },
      });
      sops.push(sop);
    }
  }
  console.log(`Seeded ${sops.length} SOPs`);

  // ============================
  // Step 8: Seed LawBasis (8 - 1 per SOP)
  // ============================
  const lawBases: LawBasis[] = [];
  for (const sop of sops) {
    const lb = await prisma.lawBasis.create({
      data: {
        sopId: sop.id,
        text: `Undang-Undang Nomor ${faker.number.int({ min: 1, max: 50 })} Tahun ${faker.number.int({ min: 2010, max: 2026 })} tentang ${faker.lorem.sentence()}`,
      },
    });
    lawBases.push(lb);
  }
  console.log(`Seeded ${lawBases.length} LawBasis`);

  // ============================
  // Step 9: Seed Equipment (8 - 1 per SOP)
  // ============================
  const equipments: Equipment[] = [];
  for (const sop of sops) {
    const eq = await prisma.equipment.create({
      data: {
        sopId: sop.id,
        text: faker.lorem.words(3),
      },
    });
    equipments.push(eq);
  }
  console.log(`Seeded ${equipments.length} Equipment`);

  // ============================
  // Step 10: Seed RecordData (4 - 1 per 2 SOPs)
  // ============================
  const recordDatas: RecordData[] = [];
  for (let i = 0; i < sops.length; i += 2) {
    const rd = await prisma.recordData.create({
      data: {
        sopId: sops[i].id,
        text: faker.lorem.sentence(),
      },
    });
    recordDatas.push(rd);
  }
  console.log(`Seeded ${recordDatas.length} RecordData`);

  // ============================
  // Step 11: Seed ImplementQualification (4 - 1 per 2 SOPs)
  // ============================
  const implQuals: ImplementQualification[] = [];
  for (let i = 0; i < sops.length; i += 2) {
    const iq = await prisma.implementQualification.create({
      data: {
        sopId: sops[i].id,
        text: faker.lorem.sentence(),
      },
    });
    implQuals.push(iq);
  }
  console.log(`Seeded ${implQuals.length} ImplementQualification`);

  // ============================
  // Step 12: Seed ProsedurRow (16 - 2 per SOP)
  // ============================
  const prosedurRows: ProsedurRow[] = [];
  for (const sop of sops) {
    const row1 = await prisma.prosedurRow.create({
      data: {
        sopId: sop.id,
        no: 1,
        kegiatan: 'Mulai',
        type: 'TERMINATOR',
        order: 1,
      },
    });
    const row2 = await prisma.prosedurRow.create({
      data: {
        sopId: sop.id,
        no: 2,
        kegiatan: faker.lorem.sentence(),
        type: 'TASK',
        mutuKelengkapan: faker.lorem.words(3),
        mutuWaktu: '30 menit',
        output: faker.lorem.words(2),
        keterangan: faker.lorem.sentence(),
        time: 30,
        timeUnit: 'menit',
        order: 2,
        nextStepYesId: row1.id,
      },
    });
    prosedurRows.push(row1, row2);
  }
  console.log(`Seeded ${prosedurRows.length} ProsedurRow`);

  // ============================
  // Step 13: Seed ProsedurRowPelaksana (16 - 1 pelaksana per prosedur row)
  // ============================
  let prpCount = 0;
  for (let i = 0; i < prosedurRows.length; i++) {
    const row = prosedurRows[i];
    // Map to the corresponding OPD's pelaksana
    const sopIdx = Math.floor(i / 2);
    const opdIdx = Math.floor(sopIdx / 2);
    const pelaksanaIdx = opdIdx * 2 + (i % 2);
    await prisma.prosedurRowPelaksana.create({
      data: {
        prosedurRowId: row.id,
        pelaksanaId: pelaksanas[pelaksanaIdx].id,
      },
    });
    prpCount++;
  }
  console.log(`Seeded ${prpCount} ProsedurRowPelaksana`);

  // ============================
  // Step 14: Seed RelatedSOP (4 - 2 pairs of related SOPs)
  // ============================
  let relatedCount = 0;
  // Pair SOPs: sops[0] <-> sops[1], sops[2] <-> sops[3]
  for (let i = 0; i < 4; i += 2) {
    await prisma.relatedSOP.create({
      data: {
        sopId: sops[i].id,
        relatedSopId: sops[i + 1].id,
      },
    });
    await prisma.relatedSOP.create({
      data: {
        sopId: sops[i + 1].id,
        relatedSopId: sops[i].id,
      },
    });
    relatedCount += 2;
  }
  console.log(`Seeded ${relatedCount} RelatedSOP`);

  // ============================
  // Step 15: Seed VerifikasiBatch (2 - 1 TERJADWAL, 1 MANDIRI)
  // ============================
  const batch1 = await prisma.verifikasiBatch.create({
    data: {
      opdId: opds[0].id,
      jenis: 'TERJADWAL',
      status: 'AKTIF',
      catatan: faker.lorem.paragraph(),
      nomorBA: `BA/EVAL/${opds[0].kode}/2026/001`,
      tanggalRequest: new Date('2026-03-01'),
      nilaiOPD: 4,
    },
  });

  const batch2 = await prisma.verifikasiBatch.create({
    data: {
      opdId: opds[1].id,
      jenis: 'MANDIRI',
      status: 'AKTIF',
      catatan: faker.lorem.paragraph(),
      nomorBA: `BA/EVAL/${opds[1].kode}/2026/001`,
      tanggalRequest: new Date('2026-03-10'),
      // nilaiOPD null for MANDIRI
    },
  });
  console.log('Seeded 2 VerifikasiBatch');

  // ============================
  // Step 16: Seed EvaluasiItem (4 - 2 per batch)
  // ============================
  const evaluasiItems: EvaluasiItem[] = [];
  for (let i = 0; i < 2; i++) {
    const item = await prisma.evaluasiItem.create({
      data: {
        batchId: batch1.id,
        sopId: sops[i].id,
        evaluatorId: timEvaluasiUsers[i].id,
        hasil: i === 0 ? 'SESUAI' : 'REVISI_BIRO',
        catatan: faker.lorem.paragraph(),
        rekomendasi: faker.lorem.sentence(),
      },
    });
    evaluasiItems.push(item);
  }
  for (let i = 0; i < 2; i++) {
    const item = await prisma.evaluasiItem.create({
      data: {
        batchId: batch2.id,
        sopId: sops[2 + i].id,
        evaluatorId: timEvaluasiUsers[i].id,
        catatan: faker.lorem.paragraph(),
        rekomendasi: faker.lorem.sentence(),
      },
    });
    evaluasiItems.push(item);
  }
  console.log(`Seeded ${evaluasiItems.length} EvaluasiItem`);

  // ============================
  // Step 17: Seed AuditLog (8 - 1 per SOP, BUAT_SOP action)
  // ============================
  let auditCount = 0;
  for (let i = 0; i < sops.length; i++) {
    const sop = sops[i];
    const opdIdx = Math.floor(i / 2);
    const creator = timPenyusunUsers[opdIdx];
    await prisma.auditLog.create({
      data: {
        sopId: sop.id,
        action: 'BUAT_SOP',
        aktorId: creator.id,
        aktorRole: 'TIM_PENYUSUN',
        statusSesudah: 'DRAFT',
        keterangan: `SOP ${sop.judul} dibuat`,
      },
    });
    auditCount++;
  }
  console.log(`Seeded ${auditCount} AuditLog`);

  // ============================
  // Step 18: Seed TTEProfile (5 - 4 KEPALA_OPD + 1 BIRO user)
  // ============================
  const tteProfiles: TTEProfile[] = [];
  for (const kepala of kepalaOpdUsers) {
    const profile = await prisma.tTEProfile.create({
      data: {
        userId: kepala.id,
        pinHash: '12345',
        role: 'KEPALA_OPD',
        emailVerified: true,
      },
    });
    tteProfiles.push(profile);
  }
  // 1 for BIRO user
  const biroTteProfile = await prisma.tTEProfile.create({
    data: {
      userId: biroUser.id,
      pinHash: '12345',
      role: 'BIRO_ORGANISASI',
      emailVerified: true,
    },
  });
  tteProfiles.push(biroTteProfile);
  console.log(`Seeded ${tteProfiles.length} TTEProfile`);

  // ============================
  // Step 19: TTESignature (0 - skipped, no signed documents at seed time)
  // ============================
  console.log('Seeded 0 TTESignature (skipped - no signed documents yet)');

  // ============================
  // Step 20: Seed Komentar (4 - 2 per first 2 SOPs)
  // ============================
  let komentarCount = 0;
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      await prisma.komentar.create({
        data: {
          sopId: sops[i].id,
          userId: timEvaluasiUsers[j].id,
          role: 'TIM_EVALUASI',
          isi: faker.lorem.paragraph(),
          bagian: `Prosedur ${j + 1}`,
          status: j === 0 ? 'OPEN' : 'RESOLVED',
        },
      });
      komentarCount++;
    }
  }
  console.log(`Seeded ${komentarCount} Komentar`);

  console.log('\nSeed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
