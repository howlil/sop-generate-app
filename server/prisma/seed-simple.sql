-- Phase 1: Simple SQL Seed Script
-- Usage: mysql -u root -pPASSWORD sop_biro_organisasi < prisma/seed-simple.sql

-- Seed OPD
INSERT INTO opd (id, nama, createdat, updatedat) VALUES
(UUID(), 'Dinas Pendidikan', NOW(), NOW()),
(UUID(), 'Dinas Kesehatan', NOW(), NOW()),
(UUID(), 'Dinas Pekerjaan Umum', NOW(), NOW()),
(UUID(), 'Dinas Sosial', NOW(), NOW()),
(UUID(), 'Dinas Perhubungan', NOW(), NOW());

-- Note: Full seed script with FakerJS data requires Prisma 7 adapter setup
-- For now, use Prisma Studio (npx prisma studio) to manually add test data
-- Or implement the full seed.ts with proper @prisma/adapter-mariadb configuration

SELECT 'Simple seed completed! Use Prisma Studio for more test data.' AS message;
