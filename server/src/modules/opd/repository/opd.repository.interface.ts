import { OpdResponseDto } from '../dto/opd.dto';

export interface IOpdRepository {
  findAll(): Promise<OpdResponseDto[]>;
  findById(id: string): Promise<OpdResponseDto | null>;
  create(data: { nama: string }): Promise<OpdResponseDto>;
  update(id: string, data: { nama?: string }): Promise<OpdResponseDto>;
  softDelete(id: string): Promise<void>;
  hasActivePengajuanEvaluasi(id: string): Promise<boolean>;
}
