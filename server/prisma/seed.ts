/**
 * Database Seed Script
 * Simplified version - minimal seed data for development
 */

import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import bcrypt from 'bcrypt';

async function main() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'sop_biro_organisasi',
    connectionLimit: 10,
  });

  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Starting seed...');

  // Check if data already exists
  const existingOpd = await prisma.oPD.count();
  if (existingOpd > 0) {
    console.log('⏭️  Database already seeded, skipping...');
    await prisma.$disconnect();
    return;
  }

  // Create OPDs
  const opd1 = await prisma.oPD.create({ data: { nama: 'Dinas Pendidikan' } });
  const opd2 = await prisma.oPD.create({ data: { nama: 'Dinas Kesehatan' } });
  console.log('✅ Created OPDs');

  // Create users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Kepala OPD
  await prisma.pengguna.create({
    data: {
      email: 'kepala.opd@example.com',
      nama: 'Kepala Dinas Pendidikan',
      kataSandi: hashedPassword,
      peran: 'KEPALA_OPD',
      opdId: opd1.id,
      nip: '198001012010011001',
      jabatan: 'Kepala Dinas',
      pangkat: 'Pembina Utama Madya',
      nohp: '081234567890',
    },
  });

  // Koordinator Tim Penyusun
  await prisma.pengguna.create({
    data: {
      email: 'koordinator@example.com',
      nama: 'Koordinator Tim Penyusun',
      kataSandi: hashedPassword,
      peran: 'KOORDINATOR_TIM_PENYUSUN',
      opdId: opd1.id,
      nip: '198501012015011001',
      jabatan: 'Kabid Pembinaan SMP',
      pangkat: 'Pembina',
      nohp: '081234567891',
    },
  });

  // Tim Penyusun
  await prisma.pengguna.create({
    data: {
      email: 'penyusun@example.com',
      nama: 'Analis Kebijakan',
      kataSandi: hashedPassword,
      peran: 'TIM_PENYUSUN',
      opdId: opd1.id,
      nip: '199001012020011001',
      jabatan: 'Analis Kebijakan',
      pangkat: 'Penata Muda',
      nohp: '081234567892',
    },
  });

  // Biro Organisasi
  await prisma.pengguna.create({
    data: {
      email: 'biro.organisasi@example.com',
      nama: 'Staff Biro Organisasi',
      kataSandi: hashedPassword,
      peran: 'BIRO_ORGANISASI',
      nip: '198201012012011001',
      jabatan: 'Kepala Bagian Organisasi',
      pangkat: 'Pembina Utama Muda',
      nohp: '081234567893',
    },
  });

  // Tim Evaluasi
  await prisma.pengguna.create({
    data: {
      email: 'tim.evaluasi@example.com',
      nama: 'Ketua Tim Evaluasi',
      kataSandi: hashedPassword,
      peran: 'TIM_EVALUASI',
      nip: '197801012008011001',
      jabatan: 'Direktur Evaluasi',
      pangkat: 'Pembina Utama',
      nohp: '081234567894',
    },
  });

  console.log('✅ Created users');

  // Create Kredensial TTE for Kepala OPD
  await prisma.kredensialTTE.create({
    data: {
      userId: (await prisma.pengguna.findUnique({ where: { email: 'kepala.opd@example.com' } }))!.id,
      hashPin: await bcrypt.hash('123456', 10),
      emailTerverifikasi: true,
      peran: 'KEPALA_OPD',
    },
  });

  console.log('✅ Created TTE credentials');

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📝 Test Accounts:');
  console.log('   - Email: biro.organisasi@example.com (BIRO_ORGANISASI)');
  console.log('   - Email: kepala.opd@example.com (KEPALA_OPD)');
  console.log('   - Email: koordinator@example.com (KOORDINATOR_TIM_PENYUSUN)');
  console.log('   - Email: penyusun@example.com (TIM_PENYUSUN)');
  console.log('   - Email: tim.evaluasi@example.com (TIM_EVALUASI)');
  console.log('   - Password: password123');
  console.log('   - TTE PIN: 123456');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
