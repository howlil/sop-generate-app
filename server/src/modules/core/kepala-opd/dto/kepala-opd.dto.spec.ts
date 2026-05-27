import { validate } from 'class-validator';
import { CreateKepalaOpdDto } from './create-kepala-opd.dto';
import { UpdateKepalaOpdDto } from './update-kepala-opd.dto';

describe('Pengujian DTO Kepala OPD', () => {
  const validUuid = '11111111-1111-4111-8111-111111111111';

  it('seharusnya menerima payload create yang valid', async () => {
    const dto = new CreateKepalaOpdDto();
    Object.assign(dto, {
      opdId: validUuid,
      nama: 'Kepala OPD',
      nip: '198001012009011001',
      email: 'kepala@example.test',
      jabatan: 'Kepala Dinas',
      pangkat: 'IV/a',
      nohp: '081234567890',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('seharusnya menolak create dengan opdId bukan UUID v4', async () => {
    const dto = new CreateKepalaOpdDto();
    Object.assign(dto, {
      opdId: 'opd-1',
      nama: 'Kepala OPD',
      nip: '198001012009011001',
      email: 'kepala@example.test',
      jabatan: 'Kepala Dinas',
      pangkat: 'IV/a',
      nohp: '081234567890',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('opdId');
  });

  it('seharusnya menolak create ketika field profil wajib kosong atau invalid', async () => {
    const dto = new CreateKepalaOpdDto();
    Object.assign(dto, {
      opdId: validUuid,
      nama: '',
      nip: '',
      email: 'bukan-email',
      jabatan: '',
      pangkat: '',
      nohp: '123',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['nama', 'email', 'jabatan', 'pangkat', 'nohp']),
    );
  });

  it('seharusnya menerima payload update parsial yang valid', async () => {
    const dto = new UpdateKepalaOpdDto();
    Object.assign(dto, {
      opdId: validUuid,
      email: 'kepala-baru@example.test',
      status: 'NONAKTIF',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('seharusnya menolak update dengan status di luar AKTIF/NONAKTIF', async () => {
    const dto = new UpdateKepalaOpdDto();
    Object.assign(dto, { status: 'PENSIUN' });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('status');
  });

  it('seharusnya menolak update dengan nohp terlalu pendek dan opdId invalid', async () => {
    const dto = new UpdateKepalaOpdDto();
    Object.assign(dto, {
      opdId: 'opd-1',
      nohp: '123',
    });

    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toEqual(
      expect.arrayContaining(['opdId', 'nohp']),
    );
  });
});
