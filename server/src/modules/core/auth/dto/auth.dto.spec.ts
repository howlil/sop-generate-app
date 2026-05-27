import { validate } from 'class-validator';
import { ChangePasswordDto } from './change-password.dto';
import { LoginDto } from './login.dto';

describe('Pengujian DTO Auth', () => {
  it('seharusnya menerima payload login valid', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.test';
    dto.password = 'secret';
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('seharusnya menolak email login yang tidak valid', async () => {
    const dto = new LoginDto();
    dto.email = 'bukan-email';
    dto.password = 'secret';
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('email');
  });

  it('seharusnya menolak password login kosong', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.test';
    dto.password = '';
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('password');
  });

  it('seharusnya menerima payload ubah password valid', async () => {
    const dto = new ChangePasswordDto();
    Object.assign(dto, {
      kataSandiLama: 'old-pass',
      kataSandiBaru: 'new-pass-8',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('seharusnya menolak password baru kurang dari delapan karakter', async () => {
    const dto = new ChangePasswordDto();
    Object.assign(dto, {
      kataSandiLama: 'old-pass',
      kataSandiBaru: 'short',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('kataSandiBaru');
  });

  it('seharusnya menolak password lama kosong', async () => {
    const dto = new ChangePasswordDto();
    Object.assign(dto, {
      kataSandiLama: '',
      kataSandiBaru: 'new-pass-8',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('kataSandiLama');
  });
});
