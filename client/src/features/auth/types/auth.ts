export interface LoginRequest {
  email: string;
  kataSandi: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
  };
}
