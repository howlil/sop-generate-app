import { useMemo, useState } from "react";
import { Eye, Ban, FileText } from "lucide-react";
import { ActiveFilterChips } from "@/components/data/active-filter-chips";
import { DataSurface } from "@/components/data/data-surface";
import { Table } from "@/components/ui/data-table";
import { SearchInput } from "@/components/ui/search-input";
import { SOPStatusFilterSelect } from "@/components/sop/sop-status-filter-select";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { CabutSopDialog } from "@/components/sop/CabutSopDialog";
import { RowActions } from "@/components/data/row-actions";
import {
  SopDateCell,
  SopNumberCell,
  SopPrimaryCell,
  SopStatusCell,
} from "@/components/sop/sop-table-cells";
import { SOP_STATUS_FILTER_OPTIONS } from "@/lib/status/sop-status.config";
import { ROUTES } from "@/utils/constants";
import { useCabutSop, useSop } from "@/api/sop";
import type { SopDaftarRow } from "@/types/dto/sop.dto";
import { canShowCabutSopAction, getCabutSopBlockingReason } from "@/lib/sop/cabut-sop.util";

export function PantauSOP() {
  const [filterStatus, setFilterStatus] = useState("all");
  const { list: mergedList } = useSop();
  const { cabutSopAsync, isCabutPending } = useCabutSop();
  const [cabutTarget, setCabutTarget] = useState<SopDaftarRow | null>(null);

  const listByStatus = useMemo(
    () =>
      filterStatus === "all"
        ? mergedList
        : mergedList.filter((s) => s.status === filterStatus),
    [mergedList, filterStatus],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listByStatus;
    return listByStatus.filter((s) =>
      [s.judul, s.nomorSop ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [listByStatus, searchQuery]);

  const statusLabel = SOP_STATUS_FILTER_OPTIONS.find(
    (option) => option.value === filterStatus,
  )?.label;
  const hasStatusFilter = filterStatus !== "all";
  const hasSearch = searchQuery.trim().length > 0;

  async function handleConfirmCabutFromList() {
    if (cabutTarget == null) return;
    await cabutSopAsync(cabutTarget.id);
    setCabutTarget(null);
  }

  return (
    <>
      <ListPageLayout
        breadcrumb={[{ label: "SOP" }]}
        title="SOP"
      >
        <DataSurface.Root>
          <DataSurface.Header>
            <DataSurface.Toolbar>
              <SearchInput
                placeholder="Cari judul atau nomor SOP..."
                aria-label="Cari judul atau nomor SOP..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <SOPStatusFilterSelect
                value={filterStatus}
                onValueChange={setFilterStatus}
                className="h-9 w-full sm:w-[200px]"
              />
            </DataSurface.Toolbar>
            {hasStatusFilter ? (
              <DataSurface.FilterRow>
                <ActiveFilterChips
                  items={[
                    {
                      id: "status",
                      label: `Status: ${statusLabel ?? filterStatus}`,
                      onRemove: () => setFilterStatus("all"),
                    },
                  ]}
                  onClearAll={() => setFilterStatus("all")}
                />
              </DataSurface.FilterRow>
            ) : null}
          </DataSurface.Header>

          <Table.Paginated data={filteredList} label="SOP" surfaceMode="embedded">
            {(pageData) => (
              <Table.Root>
                <Table.Table>
                  <thead>
                    <Table.HeadRow>
                      <Table.Th>Judul SOP</Table.Th>
                      <Table.Th>Nomor SOP</Table.Th>
                      <Table.Th>Terakhir diperbarui</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.ActionTh>Aksi</Table.ActionTh>
                    </Table.HeadRow>
                  </thead>
                  <tbody>
                    {pageData.length === 0 ? (
                      <EmptyState
                        asTableRow
                        colSpan={5}
                        icon={<FileText />}
                        title={
                          hasSearch
                            ? `Tidak ada SOP yang cocok dengan “${searchQuery.trim()}”`
                            : hasStatusFilter
                              ? "Tidak ada SOP dengan status yang dipilih"
                              : "Belum ada SOP"
                        }
                        description={
                          hasSearch
                            ? "Ubah atau hapus kata kunci pencarian."
                            : hasStatusFilter
                              ? "Hapus atau ubah filter status untuk memperluas hasil."
                              : "Belum ada SOP yang tercatat untuk OPD Anda."
                        }
                      />
                    ) : (
                      pageData.map((sop) => {
                        const showCabut = canShowCabutSopAction(sop) && sop.versiBerlaku?.status !== "DICABUT";
                        const cabutBlockReason = getCabutSopBlockingReason(sop);
                        return (
                          <Table.BodyRow key={sop.id}>
                            <Table.Td>
                              <SopPrimaryCell title={sop.judul} />
                            </Table.Td>
                            <Table.Td>
                              <SopNumberCell value={sop.nomorSop} />
                            </Table.Td>
                            <Table.Td>
                              <SopDateCell date={sop.terakhirDiperbarui} />
                            </Table.Td>
                            <Table.Td>
                              <SopStatusCell
                                status={sop.status}
                                label={sop.statusLabel}
                              />
                            </Table.Td>
                            <Table.ActionTd>
                              <RowActions
                                align="start"
                                actions={[
                                  {
                                    icon: Eye,
                                    to: ROUTES.KEPALA_OPD.DETAIL_SOP,
                                    params: { id: sop.id },
                                    title: "Lihat detail",
                                  },
                                  ...(showCabut
                                    ? [
                                        {
                                          icon: Ban,
                                          title: cabutBlockReason ?? "Cabut SOP",
                                          disabled: isCabutPending || cabutBlockReason != null,
                                          onClick: () => setCabutTarget(sop),
                                          className:
                                            "text-rose-700 hover:text-rose-800 hover:bg-rose-50",
                                        },
                                      ]
                                    : []),
                                ]}
                              />
                            </Table.ActionTd>
                          </Table.BodyRow>
                        );
                      })
                    )}
                  </tbody>
                </Table.Table>
              </Table.Root>
            )}
          </Table.Paginated>
        </DataSurface.Root>
      </ListPageLayout>
      <CabutSopDialog
        open={cabutTarget != null}
        onOpenChange={(open) => {
          if (!open) setCabutTarget(null);
        }}
        sopJudul={cabutTarget?.judul ?? ""}
        nomorSop={cabutTarget?.versiBerlaku?.nomorSop ?? cabutTarget?.nomorSop ?? ""}
        onConfirm={() => void handleConfirmCabutFromList()}
        isPending={isCabutPending}
      />
    </>
  );
}
