import type { BagianSOP } from "@/types/dto/sop.dto";

export interface LogEditSOP {
  id: string;
  sopDetailId: string;
  userId: string;
  bagian: BagianSOP;
  entityId?: string;
  keterangan?: string;
  aktorRole: string;
  createdAt: string;
}

export interface LogEditSOPResponse {
  data: LogEditSOP[];
  total: number;
}

export interface CreateLogEditSOPDto {
  sopDetailId: string;
  bagian: BagianSOP;
  entityId?: string;
  keterangan?: string;
}

export interface AuditQueryParams extends Record<string, unknown> {
  bagian?: BagianSOP;
  skip?: number;
  take?: number;
}
