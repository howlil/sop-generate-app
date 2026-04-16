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
import type { TTERole } from "@/features/tte";
import {
  useTTEProfil,
  useRegisterTTE,
  useMintTokenVerifikasi,
  getTTEVerificationSuccessUrl,
} from "@/features/tte/hooks/useTte";
import type { RegisterTteDto } from "@/features/tte/types/tte";
import { showErrorMessages } from "@/utils/toast"

type WizardStep = "data-diri" | "pin" | "cek-email";

export interface TTEBuatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: TTERole;
  defaultNip: string;
  defaultNama: string;
}

export function TTEBuatDialog({
  open,
  onOpenChange,
  role: _role,
  defaultNip,
  defaultNama,
}: TTEBuatDialogProps) {
  const { data: profile } = useTTEProfil();
  const registerTTE = useRegisterTTE();
  const mintToken = useMintTokenVerifikasi();
  const [step, setStep] = useState<WizardStep>("data-diri");
  const [nip, setNip] = useState(profile?.user?.nip ?? defaultNip);
  const [namaLengkap, setNamaLengkap] = useState(
    profile?.user?.nama ?? defaultNama,
  );
  const [email, setEmail] = useState(profile?.user?.email ?? "");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (open) {
      setStep("data-diri");
      setNip(profile?.user?.nip ?? defaultNip);
      setNamaLengkap(profile?.user?.nama ?? defaultNama);
      setEmail(profile?.user?.email ?? "");
      setPin("");
      setPinConfirm("");
      setError(null);
      setVerificationToken(null);
    }
  }, [
    open,
    profile?.user?.nip,
    profile?.user?.nama,
    profile?.user?.email,
    defaultNip,
    defaultNama,
  ]);

  const handleNextFromDataDiri = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nip.trim() || !namaLengkap.trim()) {
      setError("NIP dan Nama wajib diisi.");
      return;
    }
    if (!email.trim()) {
      setError("Email dinas wajib diisi.");
      return;
    }
    setStep("pin");
  };

  const handleNextFromPin = async (e: React.FormEvent) => {
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
      const payload: RegisterTteDto = {
        pin,
      };
      await registerTTE.mutateAsync(payload);

      const tokenResult = await mintToken.mutateAsync(undefined);
      setVerificationToken(tokenResult.token);
      setPin("");
      setPinConfirm("");
      setStep("cek-email");
    } catch (error: unknown) {
      showErrorMessages(error, "Gagal mendaftarkan TTE");
      setError(
        error instanceof Error ? error.message : "Gagal mendaftarkan TTE",
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("data-diri");
    setVerificationToken(null);
  };

  const verificationUrl = verificationToken
    ? getTTEVerificationSuccessUrl(verificationToken)
    : "";

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">
            {step === "data-diri" && "Data Diri"}
            {step === "pin" && "Buat PIN TTE"}
            {step === "cek-email" && "Verifikasi lewat Email"}
          </DialogTitle>
        </DialogHeader>

        {step === "data-diri" && (
          <>
            <p className="text-xs text-gray-600 -mt-2">
              Isi data diri yang akan terhubung dengan TTD elektronik Anda.
            </p>
            <form onSubmit={handleNextFromDataDiri} className="space-y-3 mt-2">
              <FormField label="NIP">
                <Input
                  className="h-9 text-xs"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai"
                />
              </FormField>
              <FormField label="Nama Lengkap">
                <Input
                  className="h-9 text-xs"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </FormField>
              <FormField label="Email dinas">
                <Input
                  type="email"
                  className="h-9 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@instansi.go.id"
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
                  Lanjut
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === "pin" && (
          <>
            <p className="text-xs text-gray-600 -mt-2">
              Buat PIN untuk verifikasi saat menandatangani dokumen (min. 4
              karakter).
            </p>
            <form onSubmit={handleNextFromPin} className="space-y-3 mt-2">
              <FormField label="PIN TTE">
                <Input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  className="h-9 text-xs"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="PIN untuk verifikasi"
                  maxLength={8}
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
                  maxLength={8}
                />
              </FormField>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setStep("data-diri")}
                >
                  Kembali
                </Button>
                <Button type="submit" size="sm" className="h-8 text-xs">
                  Buat & kirim kode verifikasi
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === "cek-email" && (
          <>
            <p className="text-xs text-gray-600 -mt-2">
              Kode verifikasi telah dikirim ke <strong>{email}</strong>. Buka
              email Anda dan klik link untuk menyelesaikan aktivasi TTD.
            </p>
            <p className="text-xs text-amber-700 bg-amber-50 rounded p-2 mt-2">
              Simulasi: klik link di bawah untuk verifikasi (tanpa benar-benar
              mengirim email).
            </p>
            <div className="mt-3">
              <a
                href={verificationUrl}
                className="text-xs text-blue-600 hover:underline break-all"
                onClick={handleClose}
                target="_blank"
                rel="noopener noreferrer"
              >
                {verificationUrl}
              </a>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleClose}
              >
                Tutup
              </Button>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="button"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleClose}
                >
                  Buka halaman verifikasi
                </Button>
              </a>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
