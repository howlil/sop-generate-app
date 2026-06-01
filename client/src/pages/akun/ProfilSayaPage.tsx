import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { SetPageHeader } from "@/components/layout/PageHeaderProvider";
import { useAuth } from "@/api/auth";
import { useOpd } from "@/api/opd";
import { useTTEProfil } from "@/api/tte";
import { useAppRole } from "@/hooks/useAppRole";
import { roleMendukungTte } from "@/utils/role-routing";
import { TteSetupSection } from "@/pages/akun/components/TteSetupSection";
import { Eye, EyeOff, Mail, Briefcase, Building2, Hash, BadgeCheck, Lock } from "lucide-react";
import { useState as useSt } from "react";

// ─── Atom: info row dalam kartu profil ────────────────────────────
function ProfileRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="mt-0.5 text-gray-300 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 leading-none mb-0.5">{label}</p>
        <p className="text-xs font-medium text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}

// ─── Password input with toggle ────────────────────────────────────
function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [show, setShow] = useSt(false);
  return (
    <FormField label={label}>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className="h-9 text-sm pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </FormField>
  );
}

// ─── Main page ──────────────────────────────────────────────────────
export function ProfilSayaPage() {
  const { user, role, getRoleLabel, getRoleNip, getRoleDisplayName } = useAppRole();
  const { changePassword, isChangingPassword } = useAuth();
  const tteEnabled = roleMendukungTte(role);
  const { data: profile, isLoading: isProfilLoading } = useTTEProfil({ enabled: tteEnabled });
  const { list: opdList } = useOpd();

  const [kataSandiLama, setKataSandiLama] = useState("");
  const [kataSandiBaru, setKataSandiBaru] = useState("");
  const [kataSandiKonfirmasi, setKataSandiKonfirmasi] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const displayName = getRoleDisplayName() || user?.nama || "—";
  const displayNip = getRoleNip() || user?.nip || "—";
  const peranLabel = role ? getRoleLabel(role) : "—";

  const opdNama = useMemo(() => {
    if (!user?.opdId) return "—";
    return opdList.find((o) => o.id === user.opdId)?.nama ?? user.opdId;
  }, [opdList, user?.opdId]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (kataSandiBaru.length < 8) {
      setPasswordError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (kataSandiBaru !== kataSandiKonfirmasi) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    try {
      await changePassword({ kataSandiLama, kataSandiBaru });
      setKataSandiLama("");
      setKataSandiBaru("");
      setKataSandiKonfirmasi("");
      setPasswordSuccess(true);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Gagal mengubah kata sandi");
    }
  };

  const pageDescription = tteEnabled
    ? "Kelola informasi akun, kata sandi, dan penandatanganan elektronik."
    : "Kelola informasi akun dan kata sandi.";

  return (
    <div className="space-y-6">
      <SetPageHeader
        breadcrumb={[{ label: "Profil Saya" }]}
        title="Profil Saya"
        description={pageDescription}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr] gap-6 items-start">

        {/* ── Kolom kiri: Info akun (Sidebar) ── */}
        <div className="space-y-4 lg:sticky lg:top-6">
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Avatar + nama */}
            <div className="px-5 pt-6 pb-5 flex items-center gap-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-blue-600">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{peranLabel}</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="px-5 py-2">
              <ProfileRow icon={<Hash className="w-3.5 h-3.5" />} label="NIP" value={displayNip} />
              <ProfileRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={user?.email} />
              <ProfileRow icon={<Briefcase className="w-3.5 h-3.5" />} label="Jabatan" value={user?.jabatan} />
              <ProfileRow icon={<BadgeCheck className="w-3.5 h-3.5" />} label="Pangkat" value={user?.pangkat?.trim() || undefined} />
              <ProfileRow icon={<Building2 className="w-3.5 h-3.5" />} label="OPD" value={opdNama} />
            </div>
          </section>
        </div>

        {/* ── Kolom kanan: Keamanan + TTE ── */}
        <div className="space-y-6">

          {/* Ubah kata sandi */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Kata Sandi</h2>
                <p className="text-xs text-gray-400 mt-0.5">Perbarui kata sandi login akun Anda.</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="px-5 py-5 space-y-3">
              <PasswordInput
                label="Kata sandi lama"
                value={kataSandiLama}
                onChange={setKataSandiLama}
                autoComplete="current-password"
                disabled={isChangingPassword}
              />
              <PasswordInput
                label="Kata sandi baru"
                value={kataSandiBaru}
                onChange={setKataSandiBaru}
                autoComplete="new-password"
                disabled={isChangingPassword}
              />
              <PasswordInput
                label="Konfirmasi kata sandi baru"
                value={kataSandiKonfirmasi}
                onChange={setKataSandiKonfirmasi}
                autoComplete="new-password"
                disabled={isChangingPassword}
              />
              {passwordError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                  Kata sandi berhasil diperbarui.
                </p>
              )}
              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs px-4 font-medium"
                  disabled={isChangingPassword || !kataSandiLama || !kataSandiBaru || !kataSandiKonfirmasi}
                >
                  {isChangingPassword ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Menyimpan...
                    </span>
                  ) : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </section>

          {/* TTE section */}
          {tteEnabled && (
            <TteSetupSection
              profile={profile}
              isLoading={isProfilLoading}
              displayName={displayName}
              displayNip={displayNip}
            />
          )}
        </div>
      </div>
    </div>
  );
}
