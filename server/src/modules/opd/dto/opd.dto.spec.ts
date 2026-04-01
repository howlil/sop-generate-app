import { validate } from 'class-validator';
import { CreateOpdDto, UpdateOpdDto } from './opd.dto';

describe('CreateOpdDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateOpdDto();
    dto.nama = 'Dinas Pendidikan';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with empty nama', async () => {
    const dto = new CreateOpdDto();
    dto.nama = '';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('nama');
  });

  it('should fail with missing nama', async () => {
    const dto = new CreateOpdDto();

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'nama')).toBe(true);
  });
});

describe('UpdateOpdDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new UpdateOpdDto();
    dto.nama = 'Updated OPD Name';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with empty nama', async () => {
    const dto = new UpdateOpdDto();
    dto.nama = '';

    const errors = await validate(dto);

    expect(errors.some(e => e.property === 'nama')).toBe(true);
  });
});
