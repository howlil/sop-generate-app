import { useMemo, useState } from "react";
import { UserCog, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/data-table";
import { IconActionButton } from "@/components/ui/icon-action-button";
import { Input } from "@/components/ui/input";
import { SearchToolbar } from "@/components/ui/search-toolbar";
import { FormDialog } from "@/components/ui/form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { ListPageLayout } from "@/components/layout/ListPageLayout";
import { EmptyState } from "@/components/ui/empty-state";
import type { Pelaksana } from "@/features/sop/types/sop";
import { usePelaksana } from "@/features/sop/hooks/usePelaksana";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/utils/toast";

export function PelaksanaSOP() {
  const { showToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const { list, addPelaksana, updatePelaksana, removePelaksana } =
    usePelaksana();

  // Validate user has OPD assigned
  const userOpdId = user?.opdId;

  if (!userOpdId) {
    return (
      <ListPageLayout
        breadcrumb={[{ label: "Kelola Pelaksana SOP" }]}
        title="Kelola Pelaksana SOP"
        description="Master data pelaksana/aktor yang dipakai di kolom pelaksana saat menyusun prosedur SOP"
      >
        <EmptyState
          icon={<UserCog className="w-8 h-8" />}
          title="OPD tidak ditemukan"
          description="Anda belum ditetapkan ke OPD tertentu. Silakan hubungi administrator untuk ditetapkan ke OPD."
        />
      </ListPageLayout>
    );
  }

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Pelaksana | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    namaPelaksana: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      String(item.namaPelaksana ?? "")
        .toLowerCase()
        .includes(q),
    );
  }, [list, searchQuery]);

  const openEdit = (p: Pelaksana) => {
    setEditing(p);
    setFormData({
      namaPelaksana: p.namaPelaksana ?? "",
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      namaPelaksana: "",
    });
    setEditing(null);
  };

  const handleCreate = () => {
    if (!formData.namaPelaksana.trim()) {
      showToast("Nama pelaksana wajib diisi", "error");
      return;
    }
    addPelaksana({
      namaPelaksana: formData.namaPelaksana.trim(),
      opdId: userOpdId,
    });
    showToast("Pelaksana SOP berhasil ditambahkan");
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editing) return;
    if (!formData.namaPelaksana.trim()) {
      showToast("Nama pelaksana wajib diisi", "error");
      return;
    }
    updatePelaksana({
      id: editing.id,
      namaPelaksana: formData.namaPelaksana.trim(),
    });
    showToast("Pelaksana SOP berhasil diperbarui");
    setIsEditDialogOpen(false);
    resetForm();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await removePelaksana(deleteId);
      showToast("Pelaksana SOP berhasil dihapus");
      setDeleteId(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal menghapus pelaksana";
      if (message.includes("dipakai") || message.includes("digunakan") || message.includes("in use")) {
        showToast(
          "Pelaksana ini sedang dipakai di prosedur SOP. Hapus atau ubah pelaksana di prosedur terlebih dahulu.",
          "error"
        );
      } else {
        showToast(message, "error");
      }
    }
  };

  return (
    <ListPageLayout
      breadcrumb={[{ label: "Kelola Pelaksana SOP" }]}
      title="Kelola Pelaksana SOP"
      description="Master data pelaksana/aktor yang dipakai di kolom pelaksana saat menyusun prosedur SOP"
      toolbar={
        <SearchToolbar
          searchPlaceholder="Cari nama pelaksana..."
          searchValue={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
        >
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              resetForm();
              setIsCreateDialogOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Pelaksana
          </Button>
        </SearchToolbar>
      }
    >
      <Table.Paginated data={filteredList} label="pelaksana">
        {(pageData) => (
          <Table.Table>
            <thead>
              <Table.HeadRow>
                <Table.Th>Nama Pelaksana</Table.Th>
                <Table.Th align="center">Aksi</Table.Th>
              </Table.HeadRow>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <EmptyState
                  asTableRow
                  colSpan={2}
                  icon={<UserCog className="w-8 h-8" />}
                  title="Belum ada pelaksana"
                  description="Tambah pelaksana agar bisa dipilih di edit SOP (prosedur)"
                />
              ) : (
                pageData.map((p) => (
                  <Table.BodyRow key={p.id}>
                    <Table.Td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-amber-100 rounded-md flex items-center justify-center">
                          <UserCog className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <p className="font-medium text-gray-900">
                          {p.namaPelaksana}
                        </p>
                      </div>
                    </Table.Td>
                    <Table.Td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <IconActionButton
                          icon={Edit}
                          title="Edit"
                          onClick={() => openEdit(p)}
                        />
                        <IconActionButton
                          icon={Trash2}
                          title="Hapus"
                          destructive
                          onClick={() => setDeleteId(p.id)}
                        />
                      </div>
                    </Table.Td>
                  </Table.BodyRow>
                ))
              )}
            </tbody>
          </Table.Table>
        )}
      </Table.Paginated>

      <FormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tambah Pelaksana SOP"
        description="Pelaksana ini akan muncul di dropdown kolom pelaksana saat menyusun prosedur SOP"
        confirmLabel="Simpan"
        cancelLabel="Batal"
        onConfirm={handleCreate}
        confirmDisabled={!formData.namaPelaksana.trim()}
        size="lg"
      >
        <FormField label="Nama Pelaksana" required>
          <Input
            className="h-9 text-xs"
            placeholder="Contoh: Staf Administrasi"
            value={formData.namaPelaksana}
            onChange={(e) =>
              setFormData({ ...formData, namaPelaksana: e.target.value })
            }
          />
        </FormField>
      </FormDialog>

      <FormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Edit Pelaksana SOP"
        description="Perbarui data pelaksana"
        confirmLabel="Simpan Perubahan"
        cancelLabel="Batal"
        onConfirm={handleEdit}
        confirmDisabled={!formData.namaPelaksana.trim()}
        size="lg"
      >
        <FormField label="Nama Pelaksana" required>
          <Input
            className="h-9 text-xs"
            value={formData.namaPelaksana}
            onChange={(e) =>
              setFormData({ ...formData, namaPelaksana: e.target.value })
            }
          />
        </FormField>
      </FormDialog>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Hapus pelaksana SOP?"
        description="Pelaksana yang sudah dipakai di prosedur tidak dapat dihapus. Lanjutkan?"
        onConfirm={handleDeleteConfirm}
      />
    </ListPageLayout>
  );
}
