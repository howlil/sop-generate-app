import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { KredensialTTE, RegisterTteDto } from "@/types/dto/tte.dto";
import { showErrorMessages } from "@/hooks/useToast";

export interface TTEBuatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Nama/NIP dari sesi login atau profil API — hanya tampilan, tidak dikirim ke server. */
  namaRingkas: string;
  nipRingkas: string;
  profile?: KredensialTTE | null;
  onRegisterTTE: (payload: RegisterTteDto) => Promise<unknown>;
}

export function TTEBuatDialog({
  open,
  onOpenChange,
  namaRingkas,
  nipRingkas,
  profile,
  onRegisterTTE,
}: TTEBuatDialogProps) {
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPin("");
      setPinConfirm("");
      setError(null);
    }
  }, [open]);

  const displayNama = profile?.user?.nama ?? namaRingkas;
  const displayNip = profile?.user?.nip ?? nipRingkas;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin.length < 4) {
      setError("PIN minimal 4 karakter.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("PIN dan Konfirmasi PIN tidak sama.");
      return;
    }

    try {
      const payload: RegisterTteDto = { pin };
      await onRegisterTTE(payload);
      setPin("");
      setPinConfirm("");
      onOpenChange(false);
    } catch (error: unknown) {
      showErrorMessages(error, "Gagal mendaftarkan TTE");
      setError(error instanceof Error ? error.message : "Gagal mendaftarkan TTE");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Buat PIN TTE</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-gray-600 -mt-2">
          Data pegawai diambil dari akun Anda (sesi login). Masukkan PIN untuk verifikasi saat
          menandatangani dokumen (simulasi format BSRE, tanpa gateway BSSN).
        </p>

        <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs space-y-0.5">
          <p className="font-medium text-gray-900">{displayNama || "—"}</p>
          <p className="text-gray-600">NIP. {displayNip || "—"}</p>
          {profile?.user?.email ? (
            <p className="text-gray-500">{profile.user.email}</p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <FormField label="PIN TTE">
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="h-9 text-xs"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN untuk verifikasi"
              maxLength={32}
            />
          </FormField>
          <FormField label="Konfirmasi PIN">
            <Input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              className="h-9 text-xs"
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value)}
              placeholder="Ulangi PIN"
              maxLength={32}
            />
          </FormField>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs">
              Simpan PIN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
