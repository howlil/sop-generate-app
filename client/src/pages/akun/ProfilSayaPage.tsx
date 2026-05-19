import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Badge } from "@/components/ui/badge";
import { SetPageHeader } from "@/components/layout/PageHeaderProvider";
import { InfoCard } from "@/components/ui/info-card";
import { InfoField } from "@/components/ui/info-field";
import { useAuth } from "@/api/auth";
import { useOpd } from "@/api/opd";
import { useRegisterTTE, useTTEProfil, useUpdateTTEPin } from "@/api/tte";
import { useAppRole } from "@/hooks/useAppRole";
import { formatDateIdLong } from "@/utils/format-date";
import { roleMendukungTte } from "@/utils/role-routing";
import { TtePinDialog, type TtePinDialogMode } from "@/pages/akun/components/TtePinDialog";

export function ProfilSayaPage() {
  const { user, role, getRoleLabel, getRoleNip, getRoleDisplayName } = useAppRole();
  const { changePassword, isChangingPassword } = useAuth();
  const tteEnabled = roleMendukungTte(role);
  const { data: profile, isLoading: isProfilLoading } = useTTEProfil({
    enabled: tteEnabled,
  });
  const registerTTE = useRegisterTTE();
  const updateTTEPin = useUpdateTTEPin();
  const { list: opdList } = useOpd();

  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinDialogMode, setPinDialogMode] = useState<TtePinDialogMode>("create");
  const [kataSandiLama, setKataSandiLama] = useState("");
  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [kataSandiKonfirmasi, setKataSandiKonfirmasi] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const hasPin = tteEnabled && profile != null;
  const pinSetAt = profile?.createdAt ?? user?.tte?.pinSetAt;
  const displayName = getRoleDisplayName() || user?.nama || "—";
  const displayNip = getRoleNip() || user?.nip || "—";
  const displayPangkat = user?.pangkat?.trim() ? user.pangkat : undefined;
  const peranLabel = role ? getRoleLabel(role) : "—";

  const pageDescription = tteEnabled
    ? "Kelola informasi akun, kata sandi, dan PIN penandatanganan elektronik."
    : "Kelola informasi akun dan kata sandi.";

  const opdNama = useMemo(() => {
    if (!user?.opdId) return "—";
    return opdList.find((o) => o.id === user.opdId)?.nama ?? user.opdId;
  }, [opdList, user?.opdId]);

  const openPinDialog = (mode: TtePinDialogMode) => {
    setPinDialogMode(mode);
    setPinDialogOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (kataSandiBaru.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (kataSandiBaru !== kataSandiKonfirmasi) {
      setPasswordError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    try {
      await changePassword({ kataSandiLama, kataSandiBaru });
      setKataSandiLama("");
      setKataSandiBaru("");
      setKataSandiKonfirmasi("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah kata sandi");
    }
  };

  return (
    <div className="space-y-4">
      <SetPageHeader
        breadcrumb={[{ label: "Profil Saya" }]}
        title="Profil Saya"
        description={pageDescription}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Informasi akun</h2>
          </div>
          <div className="px-4 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <InfoField label="Nama" direction="vertical">
                {displayName}
              </InfoField>
              <InfoField label="NIP" direction="vertical">
                <span className="font-mono">{displayNip}</span>
              </InfoField>
              <InfoField label="Peran" direction="vertical">
                {peranLabel}
              </InfoField>
              <InfoField label="Jabatan" direction="vertical">
                {user?.jabatan ?? "—"}
              </InfoField>
              {displayPangkat ? (
                <InfoField label="Pangkat" direction="vertical">
                  {displayPangkat}
                </InfoField>
              ) : null}
              <InfoField label="Email" direction="vertical">
                {user?.email ?? "—"}
              </InfoField>
              <InfoField label="OPD" direction="vertical" className="sm:col-span-2">
                {opdNama}
              </InfoField>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Keamanan akun</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Perbarui kata sandi login Anda.
              </p>
            </div>
            <form onSubmit={handleChangePassword} className="px-4 py-4 space-y-3">
              <FormField label="Kata sandi lama">
                <Input
                  type="password"
                  autoComplete="current-password"
                  className="h-9 text-xs"
                  value={kataSandiLama}
                  onChange={(e) => setKataSandiLama(e.target.value)}
                />
              </FormField>
              <FormField label="Kata sandi baru">
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-9 text-xs"
                  value={kataSandiBaru}
                  onChange={(e) => setKataSandiBaru(e.target.value)}
                />
              </FormField>
              <FormField label="Konfirmasi kata sandi baru">
                <Input
                  type="password"
                  autoComplete="new-password"
                  className="h-9 text-xs"
                  value={kataSandiKonfirmasi}
                  onChange={(e) => setKataSandiKonfirmasi(e.target.value)}
                />
              </FormField>
              {passwordError ? <p className="text-xs text-red-600">{passwordError}</p> : null}
              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" className="h-8 text-xs" disabled={isChangingPassword}>
                  {isChangingPassword ? "Menyimpan..." : "Ubah kata sandi"}
                </Button>
              </div>
            </form>
          </section>

          {tteEnabled ? (
            <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">PIN TTE</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Penandatanganan elektronik</p>
                </div>
                {hasPin ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs shrink-0"
                    onClick={() => openPinDialog("update")}
                  >
                    Ubah PIN
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs shrink-0"
                    onClick={() => openPinDialog("create")}
                  >
                    Atur PIN
                  </Button>
                )}
              </div>
              <div className="px-4 py-4 space-y-3">
                <InfoCard variant="neutral">
                  Satu PIN per akun untuk verifikasi saat menandatangani Berita Acara atau SOP.
                  Simulasi BSRE tanpa integrasi BSSN.
                </InfoCard>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-gray-500">Status PIN:</span>
                  {isProfilLoading ? (
                    <span className="text-gray-400">Memuat...</span>
                  ) : hasPin ? (
                    <>
                      <Badge variant="default" className="text-xs">
                        Aktif
                      </Badge>
                      {pinSetAt ? (
                        <span className="text-gray-500">
                          Diatur {formatDateIdLong(pinSetAt)}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      Belum diatur
                    </Badge>
                  )}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>

      {tteEnabled ? (
        <TtePinDialog
          open={pinDialogOpen}
          onOpenChange={setPinDialogOpen}
          mode={pinDialogMode}
          namaRingkas={displayName}
          nipRingkas={displayNip}
          profile={profile ?? undefined}
          onRegisterTTE={(payload) => registerTTE.mutateAsync(payload)}
          onUpdateTTEPin={(payload) => updateTTEPin.mutateAsync(payload)}
        />
      ) : null}
    </div>
  );
}
