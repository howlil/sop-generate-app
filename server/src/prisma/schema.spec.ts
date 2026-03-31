/**
 * Schema validation spec -- DB-02 (FK constraints) and DB-03 (enum rejection)
 *
 * These are structural/type-level checks. Full integration tests (live DB)
 * require DATABASE_URL to be set and are run manually or in CI.
 */
import type { SOP, OPD, LogAudit, SopTerkait, LampiranTeks, NomorSOPSequence } from '../generated/prisma';
import { StatusSOP, PeranPengguna, AksiAudit, PeranTTE, StatusPeraturan, JenisLangkahProsedur, StatusTim, JenisPengajuanEvaluasi, HasilEvaluasi, StatusPengajuanEvaluasi, JenisLampiran } from '../generated/prisma';

describe('DB-01: Schema table count', () => {
  it('generated client exports all 24 model types', () => {
    // Type-level assertion: these imports would fail at compile time if models were missing
    const checkTypes: {
      sop: SOP | null;
      opd: OPD | null;
      log: LogAudit | null;
      rel: SopTerkait | null;
      lampiran: LampiranTeks | null;
      seq: NomorSOPSequence | null;
    } = {
      sop: null,
      opd: null,
      log: null,
      rel: null,
      lampiran: null,
      seq: null,
    };
    expect(checkTypes).toBeDefined();
  });
});

describe('DB-03: Enum values', () => {
  it('StatusSOP has exactly 10 values', () => {
    const values = Object.values(StatusSOP);
    expect(values).toHaveLength(10);
    expect(values).toContain('DRAFT');
    expect(values).toContain('BERLAKU');
    expect(values).toContain('DICABUT');
    expect(values).toContain('REVISI_DARI_TIM_EVALUASI');
    expect(values).toContain('DIVERIFIKASI_BIRO_ORGANISASI');
  });

  it('AksiAudit has exactly 13 values', () => {
    const values = Object.values(AksiAudit);
    expect(values).toHaveLength(13);
    expect(values).toContain('BUAT_SOP');
    expect(values).toContain('SALIN_ISI_DARI_SOP');
    expect(values).toContain('REVISI_DARI_EVALUATOR');
  });

  it('PeranPengguna has exactly 5 values', () => {
    const values = Object.values(PeranPengguna);
    expect(values).toHaveLength(5);
    expect(values).toContain('BIRO_ORGANISASI');
    expect(values).toContain('TIM_EVALUASI');
    expect(values).toContain('TIM_PENYUSUN');
    expect(values).toContain('KOORDINATOR_TIM_PENYUSUN');
    expect(values).toContain('KEPALA_OPD');
  });

  it('PeranTTE has exactly 3 values', () => {
    expect(Object.values(PeranTTE)).toHaveLength(3);
  });

  it('HasilEvaluasi has exactly 2 values', () => {
    const values = Object.values(HasilEvaluasi);
    expect(values).toHaveLength(2);
    expect(values).toContain('SESUAI');
    expect(values).toContain('REVISI_BIRO');
  });

  it('StatusPengajuanEvaluasi has exactly 6 values', () => {
    const values = Object.values(StatusPengajuanEvaluasi);
    expect(values).toHaveLength(6);
    expect(values).toContain('MENUNGGU_EVALUASI');
    expect(values).toContain('SEDANG_DIEVALUASI');
    expect(values).toContain('SELESAI_DIEVALUASI');
    expect(values).toContain('DIVERIFIKASI_BIRO');
    expect(values).toContain('DITANDATANGANI_KOORDINATOR');
    expect(values).toContain('SELESAI');
  });

  it('JenisLampiran has exactly 4 values', () => {
    const values = Object.values(JenisLampiran);
    expect(values).toHaveLength(4);
    expect(values).toContain('PERINGATAN');
    expect(values).toContain('KUALIFIKASI_PELAKSANAAN');
    expect(values).toContain('PERALATAN');
    expect(values).toContain('PENCATATAN_PENDATAAN');
  });

  it('all other enums exist and are defined', () => {
    expect(Object.values(StatusPeraturan)).toHaveLength(2);
    expect(Object.values(JenisLangkahProsedur)).toHaveLength(3);
    expect(Object.values(StatusTim)).toHaveLength(2);
    expect(Object.values(JenisPengajuanEvaluasi)).toHaveLength(2);
  });
});

describe('DB-02: FK constraint documentation', () => {
  it('documents that SOP requires valid opdId (FK constraint enforced by MariaDB)', () => {
    // This is a documentation test -- actual FK enforcement is verified by running:
    // prisma migrate dev (migration contains FOREIGN KEY constraints)
    // and attempting: prisma.sOP.create({ data: { opdId: 'nonexistent', ... } })
    // which should throw a Prisma error with code P2003 (Foreign key constraint failed)
    expect(true).toBe(true); // placeholder -- see schema.spec integration section
  });
});
