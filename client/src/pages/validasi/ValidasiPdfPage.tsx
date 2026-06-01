import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Home,
  Link2,
  Link2Off,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldX,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { tteApi, usePdfSigningStatus } from "@/api/tte";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoCard } from "@/components/ui/info-card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ApiError } from "@/lib/api/api-client";
import type { PdfSignatureVerificationEntry, VerifyPdfResponse } from "@/types/dto/tte.dto";
import { ROUTES } from "@/utils/constants";
import { formatDateIdLong } from "@/utils/format-date";

const MAX_PDF_BYTES = 20 * 1024 * 1024;

async function fileToBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function truncateHex(hex: string, head = 16, tail = 8): string {
  if (hex.length <= head + tail + 3) {
    return hex;
  }
  return `${hex.slice(0, head)}…${hex.slice(-tail)}`;
}

function formatDN(dn: string): string {
  const parts = dn.split(',').map(p => p.trim());
  const dict: Record<string, string> = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k && v) dict[k.toUpperCase()] = v;
  }
  if (dict['CN'] && dict['O']) {
    return `${dict['CN']} (${dict['O']})`;
  } else if (dict['CN']) {
    return dict['CN'];
  }
  return dn;
}

function parseDN(dn: string): { label: string; value: string }[] {
  const parts = dn.split(',').map(p => p.trim());
  return parts.map(part => {
    const [k, v] = part.split('=');
    if (!k || !v) return { label: part, value: '' };
    switch (k.toUpperCase()) {
      case 'CN': return { label: 'Nama', value: v };
      case 'O': return { label: 'Organisasi', value: v };
      case 'OU': return { label: 'Unit', value: v };
      case 'C': return { label: 'Negara', value: v };
      case 'L': return { label: 'Kota', value: v };
      case 'ST': return { label: 'Provinsi', value: v };
      case 'E': return { label: 'Email', value: v };
      default: return { label: k, value: v };
    }
  });
}

function DNDetails({ dn }: { dn: string }) {
  const parsed = parseDN(dn);
  return (
    <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {parsed.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1 border-l-2 border-slate-200 pl-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</span>
          <span className="text-sm font-medium text-slate-900">{item.value || "-"}</span>
        </div>
      ))}
    </div>
  );
}

function formatFingerprint(hex: string): string {
  return hex.toUpperCase().match(/.{1,2}/g)?.join(':') || hex;
}

function VerificationBadge({
  ok,
  okText,
  failText,
}: {
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <Badge variant={ok ? "success" : "warning"} className="h-6 gap-1.5 px-2 text-[11px]">
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" aria-hidden />
      )}
      {ok ? okText : failText}
    </Badge>
  );
}

function SummaryCheck({
  label,
  ok,
  okText,
  failText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4 text-rose-600" aria-hidden />
        )}
        <span
          className={
            ok ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-rose-700"
          }
        >
          {ok ? okText : failText}
        </span>
      </div>
    </div>
  );
}

function DetailField({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd
        className={
          mono
            ? "break-all font-mono text-sm text-slate-900"
            : "break-words text-sm text-slate-900"
        }
      >
        {children}
      </dd>
    </div>
  );
}

function BindingNotice({ signature }: { signature: PdfSignatureVerificationEntry }) {
  const ok = signature.tteMatch.matched;
  return (
    <div
      className={`flex items-start gap-3 rounded-md px-4 py-3 text-sm ${
        ok ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
      }`}
    >
      {ok ? (
        <Link2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <Link2Off className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      )}
      <div>
        <p className="font-semibold">
          {ok ? "Cocok dengan riwayat TTE aplikasi" : "Belum cocok dengan riwayat TTE aplikasi"}
        </p>
        <p className="mt-0.5 text-xs opacity-90">{signature.tteMatch.reason}</p>
        {!ok && (
          <p className="mt-1.5 text-xs opacity-80 leading-5">
            Artinya tanda tangan PDF bisa saja valid secara kriptografis, tetapi belum dapat
            dipasangkan ke data pengesahan di aplikasi.
          </p>
        )}
      </div>
    </div>
  );
}

function SignatureResultCard({ signature }: { signature: PdfSignatureVerificationEntry }) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div
        className={`flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
          signature.valid ? "bg-white border-slate-200" : "bg-rose-50 border-rose-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {signature.valid ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
          ) : (
            <ShieldX className="h-5 w-5 text-rose-600" aria-hidden />
          )}
          <h3 className="text-sm font-semibold text-slate-900">Tanda tangan #{signature.index}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadge ok={signature.valid} okText="PDF valid" failText="PDF bermasalah" />
          <VerificationBadge
            ok={signature.tteMatch.matched}
            okText="Riwayat cocok"
            failText="Riwayat belum cocok"
          />
        </div>
      </div>
      <CardContent className="space-y-6 pt-5 pb-6">
        <BindingNotice signature={signature} />

        {!signature.valid && (
          <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800 border border-rose-100">
            <span className="font-semibold">Alasan tidak valid:</span> {signature.reason}
          </div>
        )}

        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailField label="Penandatangan">
            {formatDN(signature.signerSubject)}
          </DetailField>
          <DetailField label="Diterbitkan oleh">
            {formatDN(signature.signerIssuer)}
          </DetailField>
          <DetailField label="Waktu penandatanganan">
            {signature.signedAt ? formatDateIdLong(signature.signedAt) : "Tidak tersedia di PDF"}
          </DetailField>
          <DetailField label="Kode keamanan" mono>
            <span title={signature.certificate.fingerprint}>
              {truncateHex(signature.certificate.fingerprint, 24, 12)}
            </span>
          </DetailField>
        </div>

        {signature.tteMatch.nomorDokumen || signature.tteMatch.peran ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Data Dokumen Aplikasi
            </h4>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {signature.tteMatch.nomorDokumen && (
                <DetailField label="Nomor dokumen">{signature.tteMatch.nomorDokumen}</DetailField>
              )}
              {signature.tteMatch.peran && (
                <DetailField label="Peran TTE">{signature.tteMatch.peran}</DetailField>
              )}
              {signature.tteMatch.jenisDokumen && (
                <DetailField label="Jenis dokumen">{signature.tteMatch.jenisDokumen}</DetailField>
              )}
              {signature.tteMatch.ditandatanganiPada && (
                <DetailField label="Waktu di aplikasi">
                  {formatDateIdLong(signature.tteMatch.ditandatanganiPada)}
                </DetailField>
              )}
            </div>
          </div>
        ) : null}

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hasil Pemeriksaan
          </h4>
          <div className="rounded-lg border border-slate-200 bg-white px-4">
            <SummaryCheck
              label="Integritas dokumen"
              ok={signature.checks.digestMatch}
              okText="Tidak berubah"
              failText="Sudah berubah"
            />
            <SummaryCheck
              label="CA penerbit"
              ok={signature.checks.chainTrusted}
              okText="Diakui sistem"
              failText="Tidak dikenali"
            />
            <SummaryCheck
              label="Sertifikat"
              ok={signature.checks.certificatePeriodValid}
              okText="Masih aktif"
              failText="Kedaluwarsa"
            />
          </div>
        </div>

        <details className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded px-1">
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            Tampilkan informasi teknis sertifikat
          </summary>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-5 shadow-sm">
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Masa Berlaku Sertifikat</p>
                <div className="flex flex-wrap items-center gap-2.5 text-sm font-medium">
                  <div className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-slate-700 shadow-sm">
                    {formatDateIdLong(signature.certificate.validFrom)}
                  </div>
                  <span className="text-slate-400">→</span>
                  <div className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-slate-700 shadow-sm">
                    {formatDateIdLong(signature.certificate.validTo)}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Informasi Pemilik Sertifikat</p>
                <DNDetails dn={signature.signerSubject} />
              </div>
              
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Informasi Otoritas Penerbit</p>
                <DNDetails dn={signature.signerIssuer} />
              </div>
              
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Kode Keamanan (Fingerprint SHA-256)</p>
                <div className="break-all rounded-md border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs leading-relaxed text-emerald-400 shadow-inner">
                  {formatFingerprint(signature.certificate.fingerprint)}
                </div>
              </div>
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}

export function ValidasiPdfPage() {
  const statusQuery = usePdfSigningStatus();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyPdfResponse | null>(null);

  useDocumentTitle("Verifikasi tanda tangan PDF — Sistem Informasi SOP");

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setVerifyError(null);
    setResult(null);
  }, []);

  const handleVerify = useCallback(async () => {
    if (!selectedFile) {
      setVerifyError("Pilih berkas PDF terlebih dahulu.");
      return;
    }
    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setVerifyError("Berkas harus berformat PDF.");
      return;
    }
    if (selectedFile.size > MAX_PDF_BYTES) {
      setVerifyError("Ukuran PDF melebihi batas 20 MB.");
      return;
    }
    setVerifyLoading(true);
    setVerifyError(null);
    setResult(null);
    try {
      const pdfBase64 = await fileToBase64(selectedFile);
      const response = await tteApi.verifyPdf(pdfBase64);
      setResult(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setVerifyError(
          "Endpoint verifikasi PDF tidak ditemukan. Pastikan server Nest sudah di-restart dan client dev mem-proxy ke port yang benar (cek log [vite] Proxy API).",
        );
        return;
      }
      if (error instanceof ApiError && error.status === 503) {
        setVerifyError(
          `${error.message} Setelah memperbaiki server/.env, restart server Nest lalu unduh ulang PDF (PDF lama mungkin belum ditandatangani dengan sertifikat yang sama).`,
        );
        return;
      }
      setVerifyError(
        error instanceof ApiError ? error.message : "Gagal memverifikasi PDF. Coba lagi.",
      );
    } finally {
      setVerifyLoading(false);
    }
  }, [selectedFile]);

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <Shield className="h-8 w-8 text-emerald-700" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Verifikasi tanda tangan PDF
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Unggah PDF yang telah ditandatangani oleh server (PKCS#7, CA internal). Halaman ini
              melengkapi verifikasi pengesahan TTE di aplikasi, bukan pengganti portal Komdigi.
            </p>
          </div>
        </div>

        {statusQuery.isLoading ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center gap-2 py-8 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Memuat status penandatanganan PDF…
            </CardContent>
          </Card>
        ) : null}

        {statusQuery.isSuccess ? (
          <InfoCard
            variant={statusQuery.data.enabled ? "success" : "warning"}
            title={
              statusQuery.data.enabled
                ? "Penandatanganan PDF server aktif"
                : "Penandatanganan PDF server nonaktif"
            }
            icon={statusQuery.data.enabled ? <CheckCircle2 /> : <AlertCircle />}
          >
            {statusQuery.data.enabled ? (
              <p className="text-slate-800">
                CA internal: <span className="font-medium">{statusQuery.data.trustedCaSubject}</span>
                . PDF yang diunduh setelah pengesahan dapat diverifikasi di halaman ini.
              </p>
            ) : (
              <div className="space-y-2 text-slate-800">
                {statusQuery.data.configError ? (
                  <p>{statusQuery.data.configError}</p>
                ) : (
                  <p>
                    Aktifkan <code className="text-xs">PDF_SIGNING_ENABLED=true</code> dan
                    sertifikat P12 di server agar unduhan PDF menyertakan tanda tangan PKCS#7.
                  </p>
                )}
                <p className="text-sm text-slate-600">
                  Setelah mengubah <code className="text-xs">server/.env</code>, restart server
                  Nest (<code className="text-xs">pnpm start:dev</code>) — perubahan env tidak
                  terbaca otomatis saat hot-reload kode saja.
                </p>
              </div>
            )}
          </InfoCard>
        ) : null}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Unggah berkas PDF</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center transition hover:border-emerald-600 hover:bg-emerald-50/40">
              <FileUp className="h-8 w-8 text-slate-500" aria-hidden />
              <span className="text-sm font-medium text-slate-800">
                {selectedFile ? selectedFile.name : "Klik untuk memilih PDF"}
              </span>
              <span className="text-xs text-slate-500">Maks. 20 MB</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>
            <Button
              type="button"
              className="w-full gap-2"
              disabled={verifyLoading || !selectedFile}
              onClick={() => void handleVerify()}
            >
              {verifyLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Shield className="h-4 w-4" aria-hidden />
              )}
              Verifikasi tanda tangan
            </Button>
          </CardContent>
        </Card>

        {verifyError ? (
          <InfoCard variant="warning" title="Verifikasi gagal" icon={<AlertCircle className="h-4 w-4" />}>
            <p className="text-slate-800">{verifyError}</p>
          </InfoCard>
        ) : null}

        {result ? (
          <>
            <InfoCard
              variant={result.allValid ? "success" : result.hasSignatures ? "warning" : "warning"}
              title={
                result.allValid
                  ? "Tanda tangan PDF valid dan cocok dengan TTE aplikasi"
                  : result.hasSignatures
                    ? "Tanda tangan PDF belum valid/cocok penuh"
                    : "Tidak ada tanda tangan digital"
              }
              icon={
                result.allValid ? (
                  <CheckCircle2 />
                ) : result.hasSignatures ? (
                  <XCircle />
                ) : (
                  <AlertCircle />
                )
              }
            >
              <p className="text-slate-800">{result.disclaimer}</p>
            </InfoCard>

            {result.signatures.map((signature) => (
              <SignatureResultCard key={signature.index} signature={signature} />
            ))}
          </>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to={ROUTES.HOME}>
              <Home className="h-4 w-4" aria-hidden />
              Kembali ke beranda
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
