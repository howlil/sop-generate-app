/**
 * Kepala OPD: memantau semua SOP yang ada di OPD-nya sendiri.
 * Data difilter menurut opdId Kepala OPD (getKepalaOPDOpdId).
 */
import { useMemo, useState } from "react";
import { Eye, FileText, Ban } from "lucide-react";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { SOPStatusFilterSelect } from "@/features/sop/components/SOPStatusFilterSelect";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateIdLong } from "@/utils/format-date";
import { ROUTES } from "@/utils/constants";
import { useAuthStore } from "@/stores/authStore";
import { useSop } from "@/features/sop";
import { useSopStatus } from "@/features/sop/hooks/useSopStatus";
import type { SopItem } from "@/types/common";
import { useToast } from "@/utils/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useOpd } from "@/features/organisasi/hooks/useOpd";

export function PantauSOP() {
  const opdId = useAuthStore((state) => state.user?.opdId ?? "");
  const { list: allOpds } = useOpd();
  const opd = allOpds.find((o) => o.id === opdId);
  const opdName = opd?.nama ?? "OPD";

  const [filterStatus, setFilterStatus] = useState("all");
  const [cabutSopId, setCabutSopId] = useState<string | null>(null);
  const { setSopStatusOverride } = useSopStatus();
  const { showToast } = useToast();
  const { list: sopListRaw } = useSop();
  const mergedList = sopListRaw as unknown as SopItem[];

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
      [s.judul, s.nomorSOP].join(" ").toLowerCase().includes(q),
    );
  }, [listByStatus, searchQuery]);

  return (
    <ListPageLayout
      breadcrumb={[{ label: "SOP" }]}
      title="SOP"
      description={`Daftar semua SOP di ${opdName}. Hanya menampilkan SOP yang tercatat untuk OPD Anda.`}
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari judul atau nomor SOP..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <SOPStatusFilterSelect
            value={filterStatus}
            onValueChange={setFilterStatus}
            className="h-9 w-[200px]"
          />
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
                  <Table.Th>Terakhir diperbarui</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Aksi</Table.Th>
                </Table.HeadRow>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <EmptyState
                    asTableRow
                    colSpan={5}
                    icon={<FileText />}
                    title="Tidak ada SOP ditemukan"
                    description="Tidak ada SOP untuk OPD Anda atau tidak cocok dengan pencarian."
                  />
                ) : (
                  pageData.map((sop) => (
                    <Table.BodyRow key={sop.id}>
                      <Table.Td>
                        <p className="font-medium text-gray-900">{sop.judul}</p>
                      </Table.Td>
                      <Table.Td>
                        <p className="font-mono text-gray-700 text-[11px]">
                          {sop.nomorSOP}
                        </p>
                      </Table.Td>
                      <Table.Td>
                        <p className="text-gray-700">
                          {formatDateIdLong(sop.terakhirDiperbarui)}
                        </p>
                      </Table.Td>
                      <Table.Td>
                        <StatusBadge status={sop.status} />
                      </Table.Td>
                      <Table.Td>
                        <div className="flex items-center gap-1">
                          <IconActionButton
                            icon={Eye}
                            to={ROUTES.KEPALA_OPD.DETAIL_SOP}
                            params={{ id: sop.id }}
                            title="Lihat detail"
                          />
                          {sop.status === "Berlaku" && (
                            <IconActionButton
                              icon={Ban}
                              title="Cabut SOP"
                              onClick={() => setCabutSopId(sop.id)}
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
      <ConfirmDialog
        open={cabutSopId != null}
        onOpenChange={(open) => !open && setCabutSopId(null)}
        title="Cabut SOP?"
        description="SOP akan berstatus Dicabut dan tidak lagi berlaku."
        confirmLabel="Cabut SOP"
        cancelLabel="Batal"
        destructive
        onConfirm={async () => {
          if (cabutSopId) {
            setSopStatusOverride(cabutSopId, "DICABUT");
            showToast("SOP berhasil dicabut.");
            setCabutSopId(null);
          }
        }}
      />
    </ListPageLayout>
  );
}
