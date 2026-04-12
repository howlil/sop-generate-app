/**
 * Dialog Buat SOP Baru — form judul, nomor, deskripsi + opsional salin dari template.
 * Dipakai di Manajemen SOP sebagai entry pembuatan SOP yang aktif.
 */
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/utils/toast";

export interface BuatSOPSuccessData {
  judul: string;
  nomorSOP: string;
  deskripsi: string;
}

export interface BuatSOPDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Calls sopApi.create() via parent mutation. Returns new SOP ID. */
  onCreate: (data: { judul: string; nomorSOP: string; deskripsi: string; opdId?: string }) => Promise<string>;
  /** Dipanggil setelah SOP berhasil dibuat; data baru untuk ditambah ke daftar & navigasi ke detail. */
  onSuccess?: (data: BuatSOPSuccessData & { id: string }) => void;
}

export function BuatSOPDialog({
  open,
  onOpenChange,
  onCreate,
  onSuccess,
}: BuatSOPDialogProps) {
  const [formData, setFormData] = useState({
    judulSOP: "",
    nomorSOP: "",
    deskripsi: "",
  });

  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (
      !formData.judulSOP?.trim() ||
      !formData.nomorSOP?.trim() ||
      !formData.deskripsi?.trim()
    ) {
      showToast("Mohon lengkapi Judul SOP, Nomor SOP, dan Deskripsi", "error");
      return;
    }

    const data = {
      judul: formData.judulSOP.trim(),
      nomorSOP: formData.nomorSOP.trim(),
      deskripsi: formData.deskripsi.trim(),
    };

    try {
      const newId = await onCreate(data);
      onSuccess?.({ ...data, id: newId });
      onOpenChange(false);
      setFormData({ judulSOP: "", nomorSOP: "", deskripsi: "" });
    } catch {
      // Error toast already handled by useMutationWithToast in parent
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setFormData({ judulSOP: "", nomorSOP: "", deskripsi: "" });
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Buat SOP Baru</DialogTitle>
          <DialogDescription className="text-xs">
            Isi judul, nomor, dan deskripsi. SOP baru akan dibuat dengan
            status Draft.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <FormField label="Judul SOP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: SOP Pelayanan Penerimaan Siswa Baru"
              value={formData.judulSOP}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, judulSOP: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Nomor SOP" required>
            <Input
              className="h-9 text-xs"
              placeholder="Contoh: T.001/UN15/KP.01.00/2024"
              value={formData.nomorSOP}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nomorSOP: e.target.value }))
              }
            />
          </FormField>
          <FormField label="Deskripsi" required>
            <Textarea
              className="text-xs min-h-[80px]"
              placeholder="Deskripsi singkat atau ruang lingkup SOP"
              value={formData.deskripsi}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deskripsi: e.target.value,
                }))
              }
            />
          </FormField>
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => handleOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleSubmit}
          >
            <FileText className="w-3.5 h-3.5" />
            Buat SOP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
