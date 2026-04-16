export interface OPDOption {
  id: string;
  name: string;
}

export interface KepalaOPDRow {
  id: string;
  name: string;
  nip?: string;
  email?: string;
  phone?: string;
  opdId?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  endedAt?: string;
  totalSOP?: number;
}

export type PersonWithActive = {
  name: string;
  email: string;
  phone: string;
  nip?: string;
  activeAssignment?: KepalaOPDRow & { opdId: string; opdName: string };
};

export interface KepalaCandidate {
  id: string;
  nama: string;
  email: string;
  nip?: string;
}

export interface PindahDialogPersonState {
  id: string;
  name: string;
  email: string;
  phone: string;
  nip?: string;
}

export type RiwayatRow = KepalaOPDRow & { opdName: string };
