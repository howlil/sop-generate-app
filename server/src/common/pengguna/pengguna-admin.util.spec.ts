import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import {
  assertAtLeastOneUpdateField,
  assertEmailNipUniqueOnUpdate,
  rethrowPrismaUniqueViolation,
  resolveDeletedAtFromStatus,
} from './pengguna-admin.util';

describe('pengguna-admin.util', () => {
  describe('rethrowPrismaUniqueViolation', () => {
    it('should_throw_conflict_when_p2002', () => {
      const err = new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      });
      expect(() => rethrowPrismaUniqueViolation(err)).toThrow(ConflictException);
    });

    it('should_not_throw_for_other_errors', () => {
      expect(() => rethrowPrismaUniqueViolation(new Error('other'))).not.toThrow();
    });
  });

  describe('resolveDeletedAtFromStatus', () => {
    it('should_set_date_when_nonaktif', () => {
      const actual = resolveDeletedAtFromStatus('NONAKTIF', null);
      expect(actual).toBeInstanceOf(Date);
    });

    it('should_clear_when_aktif', () => {
      expect(resolveDeletedAtFromStatus('AKTIF', new Date())).toBeNull();
    });

    it('should_keep_current_when_status_undefined', () => {
      const current = new Date('2020-01-01');
      expect(resolveDeletedAtFromStatus(undefined, current)).toBe(current);
    });
  });

  describe('assertAtLeastOneUpdateField', () => {
    it('should_throw_when_all_fields_undefined', () => {
      expect(() => assertAtLeastOneUpdateField([undefined, undefined])).toThrow(
        BadRequestException,
      );
    });
  });

  describe('assertEmailNipUniqueOnUpdate', () => {
    const repo = {
      existsEmailOtherThan: jest.fn(),
      existsNipOtherThan: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      repo.existsEmailOtherThan.mockResolvedValue(false);
      repo.existsNipOtherThan.mockResolvedValue(false);
    });

    it('should_throw_when_email_taken', async () => {
      repo.existsEmailOtherThan.mockResolvedValueOnce(true);
      await expect(
        assertEmailNipUniqueOnUpdate(
          repo,
          'u1',
          { email: 'a@x.id', nip: '1' },
          'b@x.id',
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should_throw_when_nip_taken', async () => {
      repo.existsNipOtherThan.mockResolvedValueOnce(true);
      await expect(
        assertEmailNipUniqueOnUpdate(
          repo,
          'u1',
          { email: 'a@x.id', nip: '1' },
          undefined,
          '2',
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should_skip_check_when_value_unchanged', async () => {
      await assertEmailNipUniqueOnUpdate(
        repo,
        'u1',
        { email: 'a@x.id', nip: '1' },
        'a@x.id',
        '1',
      );
      expect(repo.existsEmailOtherThan).not.toHaveBeenCalled();
      expect(repo.existsNipOtherThan).not.toHaveBeenCalled();
    });
  });
});
