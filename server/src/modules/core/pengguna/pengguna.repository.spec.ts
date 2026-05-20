import { PeranPengguna } from '../../../generated/prisma';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import { PenggunaRepository } from './pengguna.repository';

describe('PenggunaRepository.createPengguna', () => {
  const prismaMock = {
    pengguna: {
      create: jest.fn(),
    },
  };

  let repo: PenggunaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PenggunaRepository(prismaMock as unknown as PrismaService);
  });

  it('should_persist_create_input', async () => {
    prismaMock.pengguna.create.mockResolvedValueOnce({ penggunaId: 'u-1' });
    await repo.createPengguna({
      email: 'e@t.com',
      nama: 'N',
      nip: '1',
      jabatan: 'J',
      pangkat: 'P',
      nohp: '0',
      kataSandi: 'hash',
      peran: PeranPengguna.EVALUATOR,
      opd: { connect: { opdId: 'opd-biro' } },
    });
    expect(prismaMock.pengguna.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        peran: PeranPengguna.EVALUATOR,
        opd: { connect: { opdId: 'opd-biro' } },
      }),
    });
  });
});
