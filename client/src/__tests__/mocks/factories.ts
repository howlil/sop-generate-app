import { Sop } from '@/types/sop';

export function mockSop(overrides?: Partial<Sop>): Sop {
  return {
    id: 'sop-1',
    opdId: 'opd-1',
    judul: 'SOP Test',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-04-01T00:00:00Z',
    totalVersi: 1,
    statusAktif: 'DRAFT',
    ...overrides,
  };
}

export function mockSopList(count: number = 3): Sop[] {
  return Array.from({ length: count }, (_, i) =>
    mockSop({
      id: `sop-${i + 1}`,
      judul: `SOP Test ${i + 1}`,
      statusAktif: i % 2 === 0 ? 'DRAFT' : 'BERLAKU' as const,
    })
  );
}
