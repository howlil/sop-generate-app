import { validate } from 'class-validator';
import { LoginDto, ChangePasswordDto } from './auth.dto';

describe('LoginDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.kataSandi = 'password123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.kataSandi = 'password123';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('should fail with missing email', async () => {
    const dto = new LoginDto();
    dto.kataSandi = 'password123';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('should fail with missing password', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'kataSandi')).toBe(true);
  });
});

describe('ChangePasswordDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new ChangePasswordDto();
    dto.kataSandiLama = 'oldpassword';
    dto.kataSandiBaru = 'newpassword123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with short new password', async () => {
    const dto = new ChangePasswordDto();
    dto.kataSandiLama = 'oldpassword';
    dto.kataSandiBaru = 'short';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'kataSandiBaru')).toBe(true);
  });

  it('should fail with missing old password', async () => {
    const dto = new ChangePasswordDto();
    dto.kataSandiBaru = 'newpassword123';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'kataSandiLama')).toBe(true);
  });

  it('should fail with missing new password', async () => {
    const dto = new ChangePasswordDto();
    dto.kataSandiLama = 'oldpassword';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'kataSandiBaru')).toBe(true);
  });
});
