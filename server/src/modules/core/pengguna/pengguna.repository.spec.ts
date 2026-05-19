import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import { PenggunaRepository } from './pengguna.repository';

describe('PenggunaRepository.createEvaluator', () => {
  const prismaMock = {
    pengguna: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  let repo: PenggunaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PenggunaRepository(prismaMock as unknown as PrismaService);
  });

  it('should_throw_service_unavailable_when_biro_not_configured', async () => {
    prismaMock.pengguna.findFirst.mockResolvedValueOnce(null);
    await expect(
      repo.createEvaluator({
        email: 'e@t.com',
        nama: 'N',
        nip: '1',
        jabatan: 'J',
        pangkat: 'P',
        nohp: '0',
        kataSandi: 'hash',
        peran: PeranPengguna.EVALUATOR,
        opd: { connect: { opdId: 'opd-lain' } },
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prismaMock.pengguna.create).not.toHaveBeenCalled();
  });

  it('should_throw_bad_request_when_opd_not_biro', async () => {
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({ opdId: 'opd-biro' });
    await expect(
      repo.createEvaluator({
        email: 'e@t.com',
        nama: 'N',
        nip: '1',
        jabatan: 'J',
        pangkat: 'P',
        nohp: '0',
        kataSandi: 'hash',
        peran: PeranPengguna.EVALUATOR,
        opd: { connect: { opdId: 'opd-salah' } },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.pengguna.create).not.toHaveBeenCalled();
  });

  it('should_connect_biro_opd_when_opd_omitted', async () => {
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({ opdId: 'opd-biro' });
    prismaMock.pengguna.create.mockResolvedValueOnce({ penggunaId: 'u-1' });
    await repo.createEvaluator({
      email: 'e@t.com',
      nama: 'N',
      nip: '1',
      jabatan: 'J',
      pangkat: 'P',
      nohp: '0',
      kataSandi: 'hash',
      peran: PeranPengguna.EVALUATOR,
    });
    expect(prismaMock.pengguna.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        opd: { connect: { opdId: 'opd-biro' } },
      }),
    });
  });

  it('should_create_when_opd_matches_biro', async () => {
    prismaMock.pengguna.findFirst.mockResolvedValueOnce({ opdId: 'opd-biro' });
    prismaMock.pengguna.create.mockResolvedValueOnce({ penggunaId: 'u-2' });
    await repo.createEvaluator({
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
        opd: { connect: { opdId: 'opd-biro' } },
      }),
    });
  });
});
