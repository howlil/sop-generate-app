import { validate } from 'class-validator';
import { CreateSopDto } from './sop.dto';

describe('CreateSopDto Validation', () => {
  it('should pass with valid data', async () => {
    const dto = new CreateSopDto();
    dto.judul = 'SOP Test';
    dto.opdId = 'uuid-valid-opd';
    dto.logoInstansi = 'https://example.com/logo.png';
    dto.namaLembaga = 'Test Institution';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail with empty judul', async () => {
    const dto = new CreateSopDto();
    dto.judul = '';
    dto.opdId = 'uuid-valid-opd';
    dto.logoInstansi = 'https://example.com/logo.png';
    dto.namaLembaga = 'Test Institution';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('judul');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail with missing required fields', async () => {
    const dto = new CreateSopDto();
    // Missing all required fields

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.map(e => e.property)).toEqual(
      expect.arrayContaining(['judul', 'opdId', 'logoInstansi', 'namaLembaga']),
    );
  });

  it('should fail with judul > 300 characters', async () => {
    const dto = new CreateSopDto();
    dto.judul = 'a'.repeat(301);
    dto.opdId = 'uuid-valid-opd';
    dto.logoInstansi = 'https://example.com/logo.png';
    dto.namaLembaga = 'Test Institution';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should pass with valid URL for logoInstansi', async () => {
    const dto = new CreateSopDto();
    dto.judul = 'SOP Test';
    dto.opdId = 'uuid-valid-opd';
    dto.logoInstansi = 'https://cdn.example.com/path/to/logo.png';
    dto.namaLembaga = 'Test Institution';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
