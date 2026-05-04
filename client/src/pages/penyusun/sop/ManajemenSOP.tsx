import { useState, useMemo } from "react";
import {
  Filter,
  Eye,
  Edit,
  Send,
  Plus,
  FileText,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { Input } from "@/components/ui/input";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormDialog } from "@/components/ui/form-dialog";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { SearchInput } from "@/components/ui/search-input";
import { formatDateIdLong } from "@/utils/format-date";
import { ROUTES } from "@/utils/constants";
import type { StatusSOP } from "@/types/dto/sop.dto";
import { SOPStatusFilterSelect } from "@/pages/penyusun/sop/components/SOPStatusFilterSelect";
import { BuatSOPDialog } from "@/pages/penyusun/sop/components/BuatSOPDialog";
import { usePeraturan } from "@/api/peraturan";
import {
  canEditSop,
  canPjPenyusunRunCoordinatorActions,
  sopApi,
  useDaftarSopData,
  useSopSuspense,
} from "@/api/sop";
import { useDaftarSopFilters } from "@/hooks/useDaftarSOPFilters";
import { useToast } from "@/hooks/useToast";
import { useAppRole } from "@/hooks/useAppRole";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function ManajemenSOP() {
  useDocumentTitle("Manajemen SOP — Penyusun");
  const filterStatusId = "filter-status-sop";
  const filterPeraturanId = "filter-peraturan-sop";
  const filterTanggalDariId = "filter-tanggal-dari-sop";
  const filterTanggalSampaiId = "filter-tanggal-sampai-sop";
  const requestEvaluasiSearchId = "request-evaluasi-search-sop";
  const { showToast } = useToast();
  const { role } = useAppRole();
  const filters = useDaftarSopFilters();
  const {
    eligibleSopsForEvaluasi,
    filteredList,
  } = useDaftarSopData({
    searchQuery: filters.searchQuery,
    filterStatus: filters.filterStatus,
    filterPeraturan: filters.filterPeraturan,
    filterTanggalDari: filters.filterTanggalDari,
    filterTanggalSampai: filters.filterTanggalSampai,
    isFilterOpen: filters.isFilterOpen,
  });
  const { create } = useSopSuspense();

  const [isRequestEvaluasiDialogOpen, setIsRequestEvaluasiDialogOpen] =
    useState(false);
  const [requestEvaluasiSearchQuery, setRequestEvaluasiSearchQuery] =
    useState("");
  const [isBuatSOPDialogOpen, setIsBuatSOPDialogOpen] = useState(false);
  const [selectedSopIdsForAjukan, setSelectedSopIdsForAjukan] = useState<
    Set<string>
  >(new Set());

  const eligibleSopsFilteredBySearch = useMemo(() => {
    const q = requestEvaluasiSearchQuery.trim().toLowerCase();
    if (!q) return eligibleSopsForEvaluasi;
    return eligibleSopsForEvaluasi.filter(
      (sop) =>
        sop.judul.toLowerCase().includes(q) ||
        (sop.nomorSop ?? "").toLowerCase().includes(q) ||
        (sop.pembuat && sop.pembuat.toLowerCase().includes(q)),
    );
  }, [eligibleSopsForEvaluasi, requestEvaluasiSearchQuery]);

  const { list: peraturanList } = usePeraturan();

  const toggleSopSelectionForAjukan = (sopId: string) => {
    setSelectedSopIdsForAjukan((prev) => {
      const next = new Set(prev);
      if (next.has(sopId)) next.delete(sopId);
      else next.add(sopId);
      return next;
    });
  };

  const confirmAjukanEvaluasiBulk = async () => {
    if (!canPjPenyusunRunCoordinatorActions(role ?? "")) {
      showToast(
        "Hanya PJ Penyusun yang dapat mengajukan evaluasi.",
        "error",
      );
      return;
    }
    if (selectedSopIdsForAjukan.size === 0) {
      showToast("Pilih minimal satu SOP untuk diajukan.", "error");
      return;
    }
    const ids = Array.from(selectedSopIdsForAjukan);

    try {
      // Call API to update status for each selected SOP
      await Promise.all(
        ids.map(async (sopId) => {
          // Find the SOP to get detailSopId
          const sop = eligibleSopsForEvaluasi.find((s) => s.id === sopId);
          if (sop?.detailSopId) {
            await sopApi.updateStatus(sop.detailSopId, {
              status: "DIAJUKAN_EVALUASI",
            });
          }
        }),
      );

      showToast(`${ids.length} SOP berhasil diajukan ke evaluasi`);
      setIsRequestEvaluasiDialogOpen(false);
      setSelectedSopIdsForAjukan(new Set());
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Gagal mengajukan SOP ke evaluasi";
      showToast(message, "error");
    }
  };

  return (
    <ListPageLayout
      breadcrumb={[{ label: "Manajemen SOP" }]}
      title="Manajemen SOP"
      description="Daftar SOP yang Anda kelola. Penyusun menyusun SOP sendiri dan dapat mengajukan evaluasi ke Biro Organisasi (tanpa intervensi OPD). Klik baris untuk melihat atau mengedit detail SOP."
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari judul atau nomor SOP..."
          searchValue={filters.searchQuery}
          onSearchChange={(e) => filters.setSearchQuery(e.target.value)}
        >
          <DropdownMenu
            open={filters.isFilterOpen}
            onOpenChange={filters.setIsFilterOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                Filter
                {filters.activeFilterCount > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 h-4 min-w-[16px] border-0">
                    {filters.activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-3">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-900">
                    Filter SOP
                  </p>
                  {filters.activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600"
                      onClick={filters.clearFilters}
                    >
                      Reset
                    </Button>
                  )}
                </div>
                <FormField label="Status" htmlFor={filterStatusId}>
                  <SOPStatusFilterSelect
                    id={filterStatusId}
                    value={filters.filterStatus ?? "all"}
                    onValueChange={filters.setStatusFilter}
                  />
                </FormField>
                <FormField label="Peraturan Dasar" htmlFor={filterPeraturanId}>
                  <Select
                    id={filterPeraturanId}
                    value={filters.filterPeraturan ?? undefined}
                    onValueChange={filters.setFilterPeraturan}
                    options={[
                      { value: "all", label: "Semua Peraturan" },
                      ...peraturanList.map((p) => ({
                        value: p.id,
                        label: p.namaPeraturan,
                      })),
                    ]}
                  />
                </FormField>
                <FormField label="Terakhir diperbarui">
                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      label="Dari"
                      variant="muted"
                      htmlFor={filterTanggalDariId}
                    >
                      <Input
                        id={filterTanggalDariId}
                        type="date"
                        className="h-9 text-xs"
                        value={filters.filterTanggalDari ?? ""}
                        onChange={(e) =>
                          filters.setFilterTanggalDari(e.target.value)
                        }
                      />
                    </FormField>
                    <FormField
                      label="Sampai"
                      variant="muted"
                      htmlFor={filterTanggalSampaiId}
                    >
                      <Input
                        id={filterTanggalSampaiId}
                        type="date"
                        className="h-9 text-xs"
                        value={filters.filterTanggalSampai ?? ""}
                        onChange={(e) =>
                          filters.setFilterTanggalSampai(e.target.value)
                        }
                      />
                    </FormField>
                  </div>
                </FormField>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {canPjPenyusunRunCoordinatorActions(role ?? "") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => {
                setSelectedSopIdsForAjukan(new Set());
                setIsRequestEvaluasiDialogOpen(true);
              }}
            >
              <Send className="w-3.5 h-3.5" />
              Ajukan / Kirim Ulang Evaluasi
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => setIsBuatSOPDialogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Buat SOP Baru
          </Button>
        </SearchToolbar>
      }
    >
      <Table.Paginated data={filteredList} label="SOP">
        {(pageData) => (
          <Table.Root>
            <Table.Table>
              <thead>
                <Table.HeadRow>
                  <Table.Th>Judul SOP</Table.Th>
                  <Table.Th>Nomor SOP</Table.Th>
                  <Table.Th>Pembuat</Table.Th>
                  <Table.Th>Terakhir diedit</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <EmptyState
                    asTableRow
                    colSpan={7}
                    icon={<FileText />}
                    title="Tidak ada SOP ditemukan"
                    description="Coba ubah filter atau kata kunci pencarian"
                  />
                ) : (
                  pageData.map((sop) => (
                    <Table.BodyRow key={sop.id}>
                      <Table.Td>
                        <p className="font-medium text-gray-900">{sop.judul}</p>
                      </Table.Td>
                      <Table.Td>
                        <p className="font-mono text-gray-700 text-[11px]">
                          {sop.nomorSop ?? "—"}
                        </p>
                      </Table.Td>
                      <Table.Td>
                        <p className="text-gray-700">{sop.pembuat ?? "—"}</p>
                      </Table.Td>
                      <Table.Td>
                        {sop.terakhirDiedit.nama != null || sop.terakhirDiedit.waktu != null ? (
                          <div>
                            <p className="text-gray-800 text-sm">
                              {sop.terakhirDiedit.nama ?? "—"}
                            </p>
                            {sop.terakhirDiedit.waktu ? (
                              <p className="text-gray-400 text-xs mt-0.5">
                                {formatDateIdLong(sop.terakhirDiedit.waktu)}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">—</p>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={sop.status ?? "DRAFT"} />
                      </Table.Td>
                      <Table.Td>
                        <div className="flex items-center justify-center gap-1">
                          {sop.status && canEditSop(sop.status as StatusSOP) ? (
                            <IconActionButton
                              icon={Edit}
                              to={ROUTES.PENYUSUN.DETAIL_SOP}
                              params={{ id: sop.detailSopId ?? sop.id }}
                              state={{
                                sopStatus: sop.status,
                                detailSopId: sop.detailSopId ?? undefined,
                              }}
                              title="Edit"
                            />
                          ) : (
                            <IconActionButton
                              icon={Eye}
                              to={ROUTES.PENYUSUN.DETAIL_SOP}
                              params={{ id: sop.detailSopId ?? sop.id }}
                              state={{
                                sopStatus: sop.status,
                                detailSopId: sop.detailSopId ?? undefined,
                              }}
                              title="Lihat"
                              variant="outline"
                            />
                          )}
                        </div>
                      </Table.Td>
                    </Table.BodyRow>
                  ))
                )}
              </tbody>
            </Table.Table>
          </Table.Root>
        )}
      </Table.Paginated>

      <FormDialog
        open={isRequestEvaluasiDialogOpen}
        onOpenChange={(open) => {
          setIsRequestEvaluasiDialogOpen(open);
          if (!open) setRequestEvaluasiSearchQuery("");
        }}
        title="Ajukan / Kirim Ulang Evaluasi SOP"
        description="Pilih SOP yang siap dikirim ke evaluasi. Setelah diajukan, SOP tidak dapat diubah hingga evaluator mengirim hasil."
        confirmLabel={`Kirim ke Evaluasi (${selectedSopIdsForAjukan.size} SOP)`}
        onConfirm={confirmAjukanEvaluasiBulk}
        confirmDisabled={selectedSopIdsForAjukan.size === 0}
        size="lg"
      >
        <div className="flex flex-col gap-2">
          <SearchInput
            id={requestEvaluasiSearchId}
            aria-label="Cari SOP untuk diajukan ke evaluasi"
            placeholder="Cari judul, nomor SOP, atau pembuat..."
            value={requestEvaluasiSearchQuery}
            onChange={(e) => setRequestEvaluasiSearchQuery(e.target.value)}
            className="w-full max-w-none"
            inputClassName="border border-gray-200 rounded-md bg-gray-50/50 text-xs h-8"
          />
          <div className="overflow-y-auto scrollbar-hide min-h-0 border border-gray-200 rounded-lg max-h-[50vh]">
            {eligibleSopsForEvaluasi.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-10 h-10" />}
                title="Tidak ada SOP yang siap diajukan"
                description="SOP harus berstatus Siap Dievaluasi (setelah Selesai Menyusun dari Draft atau Revisi). SOP yang sedang dalam evaluasi aktif tidak ditampilkan."
              />
            ) : eligibleSopsFilteredBySearch.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Tidak ada SOP yang cocok dengan pencarian.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {eligibleSopsFilteredBySearch.map((sop) => {
                  const isSelected = selectedSopIdsForAjukan.has(sop.id);
                  return (
                    <li key={sop.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <label
                          htmlFor={`ajukan-evaluasi-${sop.id}`}
                          className="flex items-center pt-0.5 cursor-pointer shrink-0"
                        >
                          <input
                            id={`ajukan-evaluasi-${sop.id}`}
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSopSelectionForAjukan(sop.id)}
                            aria-label={`Pilih SOP ${sop.judul} untuk diajukan ke evaluasi`}
                            title={`Pilih SOP ${sop.judul}`}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                        </label>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {sop.judul}
                          </p>
                          {sop.pembuat && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Pembuat: {sop.pembuat}
                            </p>
                          )}
                          <div className="mt-1.5">
                            <StatusBadge status={sop.status ?? "DRAFT"} />
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </FormDialog>

      <BuatSOPDialog
        open={isBuatSOPDialogOpen}
        onOpenChange={setIsBuatSOPDialogOpen}
        onCreate={async (data) => {
          await create({
            judul: data.judul,
            nomorSop: data.nomorSop,
          });
        }}
      />
    </ListPageLayout>
  );
}
