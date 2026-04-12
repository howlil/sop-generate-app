/**
 * Script untuk membuat test user di database
 */
import { PrismaClient } from '../src/generated/prisma/index.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

async function createTestUser() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'sop_biro_organisasi',
    connectionLimit: 10,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.pengguna.upsert({
      where: { email: 'test@example.com' },
      update: {
        nama: 'Test User',
        kataSandi: hashedPassword,
        peran: 'TIM_PENYUSUN',
        nip: 'NIP123456789',
        jabatan: 'Staff Testing',
        pangkat: 'Penata Muda',
        nohp: '081234567890',
      },
      create: {
        email: 'test@example.com',
        nama: 'Test User',
        kataSandi: hashedPassword,
        peran: 'TIM_PENYUSUN',
        nip: 'NIP123456789',
        jabatan: 'Staff Testing',
        pangkat: 'Penata Muda',
        nohp: '081234567890',
      },
    });

    console.log('✅ Test user berhasil dibuat/updated:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role:', user.peran);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
