import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { PeranPengguna } from '../../../generated/prisma';

describe('CreateUserDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.nama = 'Test User';
    dto.kataSandi = 'password123';
    dto.peran = PeranPengguna.TIM_PENYUSUN;
    dto.opdId = 'uuid-valid';
    dto.nip = '199001012020011001';
    dto.jabatan = 'Staff';
    dto.pangkat = 'Penata Muda';
    dto.nohp = '08123456789';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.nama = 'Test User';
    dto.kataSandi = 'password123';
    dto.peran = PeranPengguna.TIM_PENYUSUN;
    dto.nip = '199001012020011001';
    dto.jabatan = 'Staff';
    dto.pangkat = 'Penata Muda';
    dto.nohp = '08123456789';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('should fail with missing required fields', async () => {
    const dto = new CreateUserDto();

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with short password', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.nama = 'Test User';
    dto.kataSandi = 'short';
    dto.peran = PeranPengguna.TIM_PENYUSUN;
    dto.nip = '199001012020011001';
    dto.jabatan = 'Staff';
    dto.pangkat = 'Penata Muda';
    dto.nohp = '08123456789';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'kataSandi')).toBe(true);
  });
});

describe('UpdateUserDto Validation', () => {
  it('should pass with valid partial data', async () => {
    const dto = new UpdateUserDto();
    dto.nama = 'Updated Name';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'invalid';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('should pass with valid email update', async () => {
    const dto = new UpdateUserDto();
    dto.email = 'newemail@example.com';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
