import { Fragment, useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Plus,
  Edit,
  ChevronRight,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { useOpd } from "@/api/opd";
import { usePenyusun } from "@/api/penyusun";
import { PenyusunFormDialog } from "./components/PenyusunFormDialog";
import { RiwayatOpdPenyusunDialog } from "./components/RiwayatOpdPenyusunDialog";
import type { PenyusunFormData } from "./components/PenyusunFormDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/utils/constants";
import type { PenyusunPublikItem, TimPenyusunOpdGrup } from "@/types/dto/tim.dto";

/** Baris tabel: item API + OPD induk */
type PenyusunBaris = PenyusunPublikItem & { opdId: string };

function flattenGrup(grup: TimPenyusunOpdGrup[]): PenyusunBaris[] {
  return grup.flatMap((g) =>
    g.penyusun.map((p) => ({ ...p, opdId: g.opdId })),
  );
}

const emptyForm = (): PenyusunFormData => ({
  namaLengkap: "",
  nip: "",
  jabatan: "",
  pangkat: "",
  email: "",
  nohp: "",
  peranTim: "PENYUSUN",
});

export function ManajemenPenyusun() {
  const { list: opdOptions } = useOpd();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const penyusunSearch =
    debouncedSearch.trim() !== "" ? debouncedSearch.trim() : undefined;
  const {
    grup,
    isLoading,
    tambah,
    update,
    pindah,
    hapusPermanen,
    isAdding,
    isUpdating,
    isPindah,
    isDeletingPermanent,
  } = usePenyusun(penyusunSearch);

  const opdList = opdOptions.map((o) => ({ id: o.id, name: o.nama }));

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hapusPermanenId, setHapusPermanenId] = useState<string | null>(null);
  const [riwayatFor, setRiwayatFor] = useState<PenyusunBaris | null>(null);
  const [editingOpdId, setEditingOpdId] = useState<string | null>(null);
  const [opdTujuanId, setOpdTujuanId] = useState("");
  const [createOpdId, setCreateOpdId] = useState<string | undefined>();
  const [expandedOpdIds, setExpandedOpdIds] = useState<Record<string, boolean>>(
    {},
  );
  const [formData, setFormData] = useState<PenyusunFormData>(emptyForm());

  const barisFlat = useMemo(() => flattenGrup(grup), [grup]);

  const isFormValid =
    formData.namaLengkap.trim() !== "" &&
    formData.nip.trim() !== "" &&
    formData.jabatan.trim() !== "" &&
    formData.pangkat.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.nohp.trim() !== "";

  const handleCreate = async () => {
    if (!createOpdId || !isFormValid) return;
    try {
      await tambah({
        opdId: createOpdId,
        nama: formData.namaLengkap.trim(),
        nip: formData.nip.trim(),
        peran: formData.peranTim,
        pangkat: formData.pangkat.trim(),
        jabatan: formData.jabatan.trim(),
        email: formData.email.trim(),
        nohp: formData.nohp.trim(),
      });
      setIsCreateOpen(false);
      setFormData(emptyForm());
      setCreateOpdId(undefined);
    } catch {
      /* Toast error dari usePenyusun → useMutationWithToast.onError */
    }
  };

  const handleEdit = async () => {
    if (!editingId || !isFormValid) return;
    try {
      await update({
        id: editingId,
        payload: {
          nama: formData.namaLengkap.trim(),
          nip: formData.nip.trim(),
          email: formData.email.trim(),
          jabatan: formData.jabatan.trim(),
          pangkat: formData.pangkat.trim(),
          nohp: formData.nohp.trim(),
          peran: formData.peranTim,
          status: formData.statusAkun ?? "AKTIF",
        },
      });
      setIsEditOpen(false);
      setEditingId(null);
      setEditingOpdId(null);
      setFormData(emptyForm());
    } catch {
      /* Toast error dari useMutationWithToast */
    }
  };

  const handleHapusPermanen = async () => {
    if (!hapusPermanenId) return;
    try {
      await hapusPermanen(hapusPermanenId);
      setHapusPermanenId(null);
    } catch {
      /* Toast error dari useMutationWithToast */
    }
  };

  const handlePindahFromEdit = async () => {
    if (!editingId || !opdTujuanId) return;
    try {
      await pindah({ id: editingId, opdId: opdTujuanId });
      setIsEditOpen(false);
      setEditingId(null);
      setEditingOpdId(null);
      setFormData(emptyForm());
      setOpdTujuanId("");
    } catch {
      /* Toast error dari useMutationWithToast */
    }
  };

  const openEdit = (p: PenyusunBaris) => {
    setEditingId(p.id);
    setEditingOpdId(p.opdId);
    setOpdTujuanId(
      opdList.find((o) => o.id !== p.opdId)?.id ?? "",
    );
    setFormData({
      namaLengkap: p.nama,
      nip: p.nip,
      jabatan: p.jabatan,
      pangkat: p.pangkat,
      email: p.email,
      nohp: p.nohp,
      peranTim: p.peran,
      statusAkun: p.status,
    });
    setIsEditOpen(true);
  };

  return (
    <ListPageLayout
      breadcrumb={[
        {
          label: "Manajemen penyusun",
          to: ROUTES.PJ_EVALUATOR.PENYUSUN,
        },
      ]}
      title="Manajemen penyusun"
      description="Kelola pengguna peran Penyusun dan PJ Penyusun per OPD. Satu PJ Penyusun aktif per OPD."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama, NIP, atau email..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              setFormData(emptyForm());
              setCreateOpdId(undefined);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Penyusun
          </Button>
        </SearchToolbar>
      }
    >
      {isLoading ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          Memuat data penyusun...
        </div>
      ) : (
        <>
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>OPD / Penyusun</Table.Th>
                <Table.Th>NIP</Table.Th>
                <Table.Th>Jabatan</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>No. HP</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {grup.map((g) => {
                const isExpanded = expandedOpdIds[g.opdId] ?? false;
                return (
                  <Fragment key={g.opdId}>
                    <Table.BodyRow
                      className="bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() =>
                        setExpandedOpdIds((prev) => ({
                          ...prev,
                          [g.opdId]: !isExpanded,
                        }))
                      }
                    >
                      <Table.Td colSpan={7}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedOpdIds((prev) => ({
                                  ...prev,
                                  [g.opdId]: !isExpanded,
                                }));
                              }}
                              aria-label={
                                isExpanded
                                  ? "Tutup daftar penyusun"
                                  : "Lihat daftar penyusun"
                              }
                            >
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              />
                            </button>
                            <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-blue-700">
                                {g.namaOpd[0] ?? "O"}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                              {g.namaOpd}
                            </p>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {g.penyusun.length} penyusun
                          </span>
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                    {isExpanded &&
                      g.penyusun.map((p) => {
                        const row: PenyusunBaris = { ...p, opdId: g.opdId };
                        return (
                          <Table.BodyRow key={p.id}>
                            <Table.Td>
                              <div className="flex flex-col gap-0.5">
                                <p className="font-medium text-gray-900">
                                  {p.nama}
                                </p>
                                <Badge variant="outline" className="text-[10px] w-fit">
                                  {p.peran === "PJ_PENYUSUN"
                                    ? "PJ Penyusun"
                                    : "Penyusun"}
                                </Badge>
                              </div>
                            </Table.Td>
                            <Table.Td className="font-mono text-gray-600 text-[11px]">
                              {p.nip}
                            </Table.Td>
                            <Table.Td className="text-gray-600">{p.jabatan}</Table.Td>
                            <Table.Td className="text-gray-600">{p.email}</Table.Td>
                            <Table.Td className="text-gray-600">{p.nohp}</Table.Td>
                            <Table.Td>
                              <StatusBadge status={p.status} />
                            </Table.Td>
                            <Table.Td>
                              <div className="flex flex-wrap items-center justify-center gap-1">
                                <IconActionButton
                                  icon={History}
                                  title="Riwayat OPD"
                                  onClick={() => setRiwayatFor(row)}
                                />
                                <IconActionButton
                                  icon={Edit}
                                  title="Edit"
                                  onClick={() => openEdit(row)}
                                />
                                <IconActionButton
                                  icon={Trash2}
                                  title="Hapus permanen"
                                  destructive
                                  onClick={() => setHapusPermanenId(p.id)}
                                />
                              </div>
                            </Table.Td>
                          </Table.BodyRow>
                        );
                      })}
                  </Fragment>
                );
              })}
            </tbody>
          </Table.Table>

          {barisFlat.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">
              {searchQuery.trim()
                ? "Tidak ada penyusun yang cocok dengan pencarian."
                : "Belum ada data penyusun. Klik Tambah Penyusun untuk menambah."}
            </div>
          )}
        </>
      )}

      <PenyusunFormDialog
        mode="create"
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setFormData(emptyForm());
            setCreateOpdId(undefined);
          }
        }}
        formData={formData}
        setFormData={setFormData}
        createOpdId={createOpdId ?? ""}
        setCreateOpdId={(id) => setCreateOpdId(id || undefined)}
        opdList={opdList}
        isFormValid={isFormValid}
        onConfirm={handleCreate}
        confirmDisabled={isAdding}
        confirmLabel={isAdding ? "Menyimpan..." : "Simpan"}
      />

      <PenyusunFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setEditingId(null);
            setEditingOpdId(null);
            setFormData(emptyForm());
            setOpdTujuanId("");
          }
        }}
        formData={formData}
        setFormData={setFormData}
        createOpdId={createOpdId ?? ""}
        setCreateOpdId={(id) => setCreateOpdId(id || undefined)}
        opdList={opdList}
        isFormValid={isFormValid}
        onConfirm={handleEdit}
        confirmDisabled={isUpdating}
        confirmLabel={isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
        editingOpdId={editingOpdId ?? undefined}
        opdTujuanId={opdTujuanId}
        setOpdTujuanId={setOpdTujuanId}
        onConfirmPindah={handlePindahFromEdit}
        pindahConfirmDisabled={isPindah}
      />

      <ConfirmDialog
        open={hapusPermanenId != null}
        onOpenChange={(open) => !open && setHapusPermanenId(null)}
        title="Hapus penyusun permanen?"
        description="Hanya dapat dihapus jika tidak ada data SOP, komentar, evaluasi, atau jabatan OPD yang masih mereferensi pengguna ini."
        onConfirm={handleHapusPermanen}
        confirmLabel={
          isDeletingPermanent ? "Menghapus..." : "Hapus permanen"
        }
      />

      <RiwayatOpdPenyusunDialog
        open={riwayatFor != null}
        onOpenChange={(open) => !open && setRiwayatFor(null)}
        penggunaId={riwayatFor?.id ?? null}
        namaPenyusun={riwayatFor?.nama ?? ""}
      />
    </ListPageLayout>
  );
}
