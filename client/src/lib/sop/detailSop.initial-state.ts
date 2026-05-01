import type { PelaksanaRow, SOPDetailMetadata } from "@/types/ui/sop";

export function getInitialSopDetailMetadata(): SOPDetailMetadata {
  return {
    id: "",
    nomorSOP: "",
    nama: "",
    lembaga: "",
    logoUrl: "",
    tanggalEfektif: "",
    tanggalRevisi: "",
  };
}

export function getInitialSopDetailImplementers(): PelaksanaRow[] {
  return [];
}
