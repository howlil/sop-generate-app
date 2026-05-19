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
import type { RegisterTteDto, TteProfil, UpdateTtePinDto } from "@/types/dto/tte.dto";
import { showErrorMessages } from "@/hooks/useToast";

export type TtePinDialogMode = "create" | "update";

export interface TtePinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: TtePinDialogMode;
  namaRingkas: string;
  nipRingkas: string;
  profile?: TteProfil | null;
  onRegisterTTE: (payload: RegisterTteDto) => Promise<unknown>;
  onUpdateTTEPin: (payload: UpdateTtePinDto) => Promise<unknown>;
}

export function TtePinDialog({
  open,
  onOpenChange,
  mode,
  namaRingkas,
  nipRingkas,
  profile,
  onRegisterTTE,
  onUpdateTTEPin,
}: TtePinDialogProps) {
  const [pinLama, setPinLama] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setPinLama("");
      setPin("");
      setPinConfirm("");
      setError(null);
    }
  }, [open, mode]);

  const displayNama = profile?.user?.nama ?? namaRingkas;
  const displayNip = profile?.user?.nip ?? nipRingkas;
  const title = mode === "create" ? "Atur PIN TTE" : "Ubah PIN TTE";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === "update" && pinLama.length < 4) {
      setError("PIN lama minimal 4 karakter.");
      return;
    }
    if (pin.length < 4) {
      setError("PIN minimal 4 karakter.");
      return;
    }
    if (pin !== pinConfirm) {
      setError("PIN dan konfirmasi PIN tidak sama.");
      return;
    }
    try {
      if (mode === "create") {
        await onRegisterTTE({ pin });
      } else {
        await onUpdateTTEPin({ pinLama, pinBaru: pin });
      }
      onOpenChange(false);
    } catch (err: unknown) {
      showErrorMessages(err, mode === "create" ? "Gagal mengatur PIN TTE" : "Gagal mengubah PIN TTE");
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onOpenChange(false)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">{title}</DialogTitle>
        </DialogHeader>

        <UserSummary
          displayNama={displayNama}
          displayNip={displayNip}
          email={profile?.user?.email}
        />

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {mode === "update" ? (
            <FormField label="PIN lama">
              <Input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                className="h-9 text-xs"
                value={pinLama}
                onChange={(e) => setPinLama(e.target.value)}
                placeholder="PIN saat ini"
                maxLength={32}
              />
            </FormField>
          ) : null}
          <FormField label={mode === "create" ? "PIN TTE" : "PIN baru"}>
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
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="h-8 text-xs">
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserSummary({
  displayNama,
  displayNip,
  email,
}: {
  displayNama: string;
  displayNip: string;
  email?: string;
}) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-xs space-y-0.5">
      <p className="font-medium text-gray-900">{displayNama || "—"}</p>
      <p className="text-gray-600">NIP. {displayNip || "—"}</p>
      {email ? <p className="text-gray-500">{email}</p> : null}
    </div>
  );
}
