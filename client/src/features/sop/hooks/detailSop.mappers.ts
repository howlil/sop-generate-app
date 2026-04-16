import type {
  CreateLangkahSOPDto,
  LangkahSOP,
  SopDetail,
  UpdateLangkahSOPDto,
} from "../types/sop";
import type {
  JenisLangkahProsedur,
  ProsedurRow,
  SatuanWaktu,
  SOPDetailMetadata,
} from "@/types/common";

/** Transform API SopDetail -> UI SOPDetailMetadata */
export function transformSopDetailToMetadata(detail: SopDetail): SOPDetailMetadata {
  return {
    id: detail.id,
    nomorSOP: detail.nomorSOP,
    nama: detail.sop?.judul ?? "",
    judul: detail.sop?.judul,
    lembaga: detail.namaLembaga,
    logoUrl: detail.logoInstansi,
    tanggalEfektif: detail.tanggalEfektif ?? "",
    tanggalRevisi: detail.tanggalRevisi ?? "",
    version: detail.versi,
  };
}

/** Transform API LangkahSOP -> UI ProsedurRow */
export function transformLangkahToProsedurRow(langkah: LangkahSOP): ProsedurRow {
  return {
    id: langkah.id,
    urutan: langkah.urutan,
    no: langkah.urutan,
    kegiatan: langkah.kegiatan,
    pelaksana: langkah.pelaksanaId,
    waktu: langkah.waktu,
    satuanWaktu: langkah.satuanWaktu,
    kelengkapan: langkah.kelengkapan,
    mutu_kelengkapan: langkah.kelengkapan,
    keluaran: langkah.keluaran,
    output: langkah.keluaran,
    type: langkah.jenis?.toLowerCase() as "terminator" | "task" | "decision",
    id_next_step_if_yes: langkah.langkahSelanjutnyaYaId ?? undefined,
    id_next_step_if_no: langkah.langkahSelanjutnyaTidakId ?? undefined,
    keterangan: langkah.keterangan ?? "",
    pelaksanaMapping: {},
  };
}

/** Transform UI ProsedurRow -> API CreateLangkahSOPDto */
export function transformProsedurRowToCreateLangkah(
  row: ProsedurRow,
  _sopDetailId: string,
): CreateLangkahSOPDto {
  const { waktu, satuanWaktu } = parseMutuWaktu(row.mutu_waktu);

  return {
    kegiatan: row.kegiatan,
    pelaksanaId: row.pelaksana,
    keluaran: row.keluaran ?? row.output ?? "",
    jenis: (row.type?.toUpperCase() as JenisLangkahProsedur) ?? "TASK",
    kelengkapan: row.kelengkapan ?? row.mutu_kelengkapan ?? "",
    waktu,
    satuanWaktu: satuanWaktu as SatuanWaktu,
    urutan: row.urutan,
    langkahSelanjutnyaYaId: row.id_next_step_if_yes,
    langkahSelanjutnyaTidakId: row.id_next_step_if_no,
    keterangan: row.keterangan,
  };
}

/** Transform UI ProsedurRow -> API UpdateLangkahSOPDto */
export function transformProsedurRowToUpdateLangkah(
  row: ProsedurRow,
): UpdateLangkahSOPDto {
  const { waktu, satuanWaktu } = parseMutuWaktu(row.mutu_waktu);

  return {
    kegiatan: row.kegiatan,
    pelaksanaId: row.pelaksana,
    keluaran: row.keluaran ?? row.output,
    jenis: row.type?.toUpperCase() as JenisLangkahProsedur,
    kelengkapan: row.kelengkapan ?? row.mutu_kelengkapan,
    waktu,
    satuanWaktu: satuanWaktu as SatuanWaktu,
    urutan: row.urutan,
    langkahSelanjutnyaYaId: row.id_next_step_if_yes,
    langkahSelanjutnyaTidakId: row.id_next_step_if_no,
    keterangan: row.keterangan,
  };
}

/** Parse mutu_waktu string (e.g. "30 Menit") -> { waktu, satuanWaktu } */
function parseMutuWaktu(
  mutuWaktu?: string,
): { waktu: number; satuanWaktu: string } {
  if (!mutuWaktu) return { waktu: 0, satuanWaktu: "m" };

  const unitMap: Record<string, string> = {
    menit: "m",
    jam: "h",
    hari: "d",
    minggu: "w",
    bulan: "mo",
    tahun: "y",
    Menit: "m",
    Jam: "h",
    Hari: "d",
    Minggu: "w",
    Bulan: "mo",
    Tahun: "y",
  };

  const match = mutuWaktu.match(/^(\d+)\s+(\w+)$/);
  if (match) {
    const waktu = parseInt(match[1], 10);
    const satuanWaktu = unitMap[match[2]] ?? "m";
    return { waktu: isNaN(waktu) ? 0 : waktu, satuanWaktu };
  }

  const num = parseInt(mutuWaktu, 10);
  return { waktu: isNaN(num) ? 0 : num, satuanWaktu: "m" };
}

/** Check if an ID is a temporary (client-generated) ID */
export function isTempId(id: string): boolean {
  return id.startsWith("temp-");
}
