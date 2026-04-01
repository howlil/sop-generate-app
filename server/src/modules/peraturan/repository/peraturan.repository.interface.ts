import { PeraturanResponseDto } from '../dto/peraturan.dto';

export interface IPeraturanRepository {
  findAll(opdId?: string): Promise<PeraturanResponseDto[]>;
  findById(id: string): Promise<PeraturanResponseDto | null>;
  create(data: {
    opdId: string;
    namaPeraturan: string;
    nomor: string;
    tahun: number;
    tentang: string;
  }): Promise<PeraturanResponseDto>;
  update(
    id: string,
    data: { namaPeraturan?: string; nomor?: string; tahun?: number; tentang?: string },
  ): Promise<PeraturanResponseDto>;
  revoke(id: string): Promise<PeraturanResponseDto>;
  delete(id: string): Promise<void>;
  isUsedAsDasarHukum(id: string): Promise<boolean>;
}
