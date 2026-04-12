/**
 * UI-only types for Organisasi management pages.
 * These are transformed from server types for display purposes.
 */

export interface OPDUI {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalSOP?: number;
  sopBerlaku?: number;
  sopDraft?: number;
  createdAt?: string;
  _count?: {
    sop: number;
    pengguna: number;
    pengajuanEvaluasi: number;
  };
}

export interface KepalaOPDUI {
  id: string;
  name: string;
  nip?: string;
  email?: string;
  phone?: string;
  opdId?: string;
  isActive?: boolean;
  endedAt?: string;
  totalSOP?: number;
}
