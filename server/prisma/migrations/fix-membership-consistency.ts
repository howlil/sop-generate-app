/**
 * Migration Script: Fix Pengguna Membership Consistency
 * 
 * This script ensures that all users with TIM_EVALUASI, TIM_PENYUSUN, and 
 * KOORDINATOR_TIM_PENYUSUN roles have corresponding entries in their 
 * membership tables (AnggotaTimEvaluasi or AnggotaTimPenyusun).
 * 
 * Usage: npx ts-node prisma/migrations/fix-membership-consistency.ts
 */

import { PrismaClient } from '../../src/generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

async function main() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'sop_biro_organisasi',
    connectionLimit: 10,
  });

  const prisma = new PrismaClient({ adapter });

  console.log('🔧 Starting membership consistency fix...\n');

  let fixedCount = 0;

  // Fix TIM_EVALUASI users without AnggotaTimEvaluasi entries
  console.log('Checking TIM_EVALUASI users...');
  const timEvaluasiUsers = await prisma.pengguna.findMany({
    where: {
      peran: 'TIM_EVALUASI',
      deletedAt: null,
      keanggotaanTimEvaluasi: null,
    },
    select: { id: true, email: true, nama: true },
  });

  console.log(`  Found ${timEvaluasiUsers.length} TIM_EVALUASI users without membership`);
  
  for (const user of timEvaluasiUsers) {
    await prisma.anggotaTimEvaluasi.create({
      data: {
        userId: user.id,
        status: 'AKTIF',
      },
    });
    console.log(`  ✅ Created AnggotaTimEvaluasi for ${user.email} (${user.nama})`);
    fixedCount++;
  }

  // Fix TIM_PENYUSUN and KOORDINATOR_TIM_PENYUSUN users without AnggotaTimPenyusun entries
  console.log('\nChecking TIM_PENYUSUN and KOORDINATOR_TIM_PENYUSUN users...');
  const timPenyusunUsers = await prisma.pengguna.findMany({
    where: {
      OR: [
        { peran: 'TIM_PENYUSUN' },
        { peran: 'KOORDINATOR_TIM_PENYUSUN' },
      ],
      deletedAt: null,
      keanggotaanTimPenyusun: {
        none: {},
      },
    },
    select: { id: true, email: true, nama: true, opdId: true, peran: true },
  });

  console.log(`  Found ${timPenyusunUsers.length} users without AnggotaTimPenyususn membership`);
  
  for (const user of timPenyusunUsers) {
    if (!user.opdId) {
      console.log(`  ⚠️  Skipping ${user.email} - no opdId`);
      continue;
    }

    await prisma.anggotaTimPenyusun.create({
      data: {
        userId: user.id,
        opdId: user.opdId,
        status: 'AKTIF',
      },
    });
    console.log(`  ✅ Created AnggotaTimPenyusun for ${user.email} (${user.nama}) - ${user.peran}`);
    fixedCount++;
  }

  console.log(`\n✅ Membership consistency fix completed!`);
  console.log(`   Fixed ${fixedCount} users`);

  // Show summary
  console.log('\n📊 Summary:');
  const totalUsers = await prisma.pengguna.count({ where: { deletedAt: null } });
  const timEvaluasiCount = await prisma.anggotaTimEvaluasi.count({ where: { status: 'AKTIF' } });
  const timPenyusunCount = await prisma.anggotaTimPenyusun.count({ where: { status: 'AKTIF' } });
  
  console.log(`   Total active users: ${totalUsers}`);
  console.log(`   Active Tim Evaluasi members: ${timEvaluasiCount}`);
  console.log(`   Active Tim Penyusun members: ${timPenyusunCount}`);

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  });
