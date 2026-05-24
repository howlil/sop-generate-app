import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  FileUp,
  Home,
  Loader2,
  Shield,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { tteApi, usePdfSigningStatus } from "@/api/tte";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoCard } from "@/components/ui/info-card";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { ApiError } from "@/lib/api/api-client";
import type { VerifyPdfResponse } from "@/types/dto/tte.dto";
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 px-4 py-10 sm:px-6">
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
                  ? "Tanda tangan PDF valid (CA internal)"
                  : result.hasSignatures
                    ? "Tanda tangan PDF tidak valid"
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
              <Card key={signature.index} className="border-slate-200 shadow-sm">
                <CardHeader className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-semibold text-slate-900">
                    Tanda tangan #{signature.index}
                    {signature.valid ? (
                      <span className="ml-2 text-sm font-normal text-emerald-700">Valid</span>
                    ) : (
                      <span className="ml-2 text-sm font-normal text-amber-800">Tidak valid</span>
                    )}
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3 pt-4 text-sm">
                  <p className="text-slate-800">{signature.reason}</p>
                  <div className="grid gap-1 sm:grid-cols-[9rem_1fr] sm:gap-x-3">
                    <span className="text-slate-500">Penandatangan</span>
                    <span className="text-slate-900">{signature.signerSubject}</span>
                    <span className="text-slate-500">Penerbit</span>
                    <span className="text-slate-900">{signature.signerIssuer}</span>
                    <span className="text-slate-500">Waktu (PKCS#7)</span>
                    <span className="text-slate-900">
                      {signature.signedAt ? formatDateIdLong(signature.signedAt) : "—"}
                    </span>
                    <span className="text-slate-500">Masa berlaku sertifikat</span>
                    <span className="text-slate-900">
                      {formatDateIdLong(signature.certificate.validFrom)} —{" "}
                      {formatDateIdLong(signature.certificate.validTo)}
                    </span>
                    <span className="text-slate-500">Sidik jari</span>
                    <span
                      className="break-all font-mono text-xs text-slate-800"
                      title={signature.certificate.fingerprint}
                    >
                      {truncateHex(signature.certificate.fingerprint)}
                    </span>
                  </div>
                  <ul className="list-inside list-disc text-xs text-slate-600">
                    <li>Integritas dokumen: {signature.checks.digestMatch ? "cocok" : "tidak cocok"}</li>
                    <li>Rantai CA internal: {signature.checks.chainTrusted ? "dipercaya" : "tidak dipercaya"}</li>
                    <li>
                      Masa berlaku sertifikat:{" "}
                      {signature.checks.certificatePeriodValid ? "aktif" : "kedaluwarsa"}
                    </li>
                  </ul>
                </CardContent>
              </Card>
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
