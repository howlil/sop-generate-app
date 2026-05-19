import { Eye, FileSignature } from "lucide-react";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { EmptyState } from "@/components/ui/empty-state";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { PengajuanStatusBadge } from "@/components/status/pengajuan-status-badge";
import { Table } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useKepalaOpdPengajuan } from "@/api/evaluasi";
import { useAuthStore } from "@/stores/authStore";
import { ROUTES } from "@/utils/constants";

function formatTanggal(value: string | null | undefined): string {
  if (value === null || value === undefined || value.trim() === "") return "—";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PengajuanSOPPage() {
  const opdId = useAuthStore((state) => state.user?.opdId ?? "");
  const {
    belumDitandatangani,
    sudahBerlaku,
    isLoading,
  } = useKepalaOpdPengajuan(opdId);

  const renderPengajuanTable = (
    data: typeof belumDitandatangani,
    emptyTitle: string,
    emptyDescription: string,
  ) => (
    <Table.Paginated data={data} label="pengajuan SOP">
      {(pageData) => (
        <Table.Root>
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Jenis</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Nomor BA</Table.Th>
                <Table.Th>Tanggal Verifikasi</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array.from({ length: 6 }).keys()].map((row) => (
                  <Table.BodyRow key={`sk-${row}`}>
                    {[...Array.from({ length: 5 }).keys()].map((col) => (
                      <Table.Td key={`sk-${row}-${col}`}>
                        <div className="h-3 animate-pulse rounded bg-gray-200" />
                      </Table.Td>
                    ))}
                  </Table.BodyRow>
                ))
              ) : pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={5}
                  icon={<FileSignature />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              ) : (
                pageData.map((item) => (
                  <Table.BodyRow key={item.id}>
                    <Table.Td className="text-gray-700">{item.jenis}</Table.Td>
                    <Table.Td>
                      <PengajuanStatusBadge
                        status={item.status}
                        label={item.statusLabel ?? item.status}
                        showDomain={false}
                      />
                    </Table.Td>
                    <Table.Td className="font-mono text-[11px] text-gray-700">
                      {item.nomorBA?.trim() || "—"}
                    </Table.Td>
                    <Table.Td className="whitespace-nowrap text-gray-700">
                      {formatTanggal(item.tanggalTTDBaPjPenyusun ?? item.updatedAt)}
                    </Table.Td>
                    <Table.Td align="center">
                      <IconActionButton
                        icon={Eye}
                        to={ROUTES.KEPALA_OPD.DETAIL_PENGAJUAN}
                        params={{ id: item.id }}
                        title="Lihat detail pengajuan"
                      />
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        </Table.Root>
      )}
    </Table.Paginated>
  );

  return (
    <ListPageLayout
      breadcrumb={[{ label: "Pengajuan SOP" }]}
      title="Pengajuan SOP"
      description="Pengajuan SOP OPD Anda, dipisahkan berdasarkan status tanda tangan Kepala OPD."
    >
      <Tabs defaultValue="belum" className="space-y-3">
        <TabsList className="h-9 w-full grid grid-cols-2">
          <TabsTrigger value="belum" className="text-xs w-full">
            Belum Ditandatangani ({belumDitandatangani.length})
          </TabsTrigger>
          <TabsTrigger value="sudah" className="text-xs w-full">
            Sudah Berlaku ({sudahBerlaku.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="belum" className="mt-0">
          {renderPengajuanTable(
            belumDitandatangani,
            "Belum ada pengajuan menunggu tanda tangan",
            "Pengajuan akan muncul setelah Berita Acara ditandatangani PJ Penyusun.",
          )}
        </TabsContent>
        <TabsContent value="sudah" className="mt-0">
          {renderPengajuanTable(
            sudahBerlaku,
            "Belum ada pengajuan selesai",
            "Pengajuan yang seluruh SOP-nya sudah ditandatangani Kepala OPD akan tampil di sini.",
          )}
        </TabsContent>
      </Tabs>
    </ListPageLayout>
  );
}
