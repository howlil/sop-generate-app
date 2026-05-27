import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.nilaiEvaluasi.groupBy({
    by: ['hasil', 'statusTindakLanjut'],
    _count: {
      _all: true,
    },
  });

  console.log('--- Distribusi Nilai Evaluasi ---');
  console.table(result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
