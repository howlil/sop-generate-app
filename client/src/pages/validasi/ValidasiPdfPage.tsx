import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileUp,
  Home,
  Loader2,
  Shield,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCallback, useState } from "react";
import { tteApi, usePdfSigningStatus } from "@/api/tte";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoCard } from "@/components/ui/info-card";
import { InfoField } from "@/components/ui/info-field";
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

function formatDN(dn: string): string {
  const parts = dn.split(",").map((part) => part.trim());
  const dict: Record<string, string> = {};
  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key && value) {
      dict[key.toUpperCase()] = value;
    }
  }
  if (dict.CN && dict.O) {
    return `${dict.CN} (${dict.O})`;
  }
  return dict.CN ?? dn;
}

function SignatureResultCard({ signature }: { signature: PdfSignatureVerificationEntry }) {
  const tteMatched = signature.valid && signature.tteMatch.matched;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className={
                tteMatched
                  ? "rounded-lg border border-green-200 bg-green-50 p-2 text-green-700"
                  : "rounded-lg border border-amber-200 bg-amber-50 p-2 text-amber-700"
              }
            >
              {tteMatched ? (
                <CheckCircle2 className="h-5 w-5" aria-hidden />
              ) : (
                <AlertCircle className="h-5 w-5" aria-hidden />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {tteMatched
                  ? "TTE ini sudah cocok dengan signature PDF"
                  : "TTE belum cocok dengan signature PDF"}
              </h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {tteMatched
                  ? "Signature PDF valid dan sesuai dengan riwayat TTE yang tersimpan di aplikasi."
                  : signature.tteMatch.reason || signature.reason}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={signature.valid ? "success" : "warning"} className="h-6 px-2">
              {signature.valid ? "PDF valid" : "PDF bermasalah"}
            </Badge>
            <Badge variant={tteMatched ? "success" : "warning"} className="h-6 px-2">
              {tteMatched ? "TTE cocok" : "TTE belum cocok"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {!signature.valid ? (
          <InfoCard variant="warning" title="Alasan tidak valid" icon={<AlertCircle />}>
            <p className="text-slate-800">{signature.reason}</p>
          </InfoCard>
        ) : null}

        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <InfoField label="Penandatangan" icon={<UserRound />} direction="vertical">
            {formatDN(signature.signerSubject)}
          </InfoField>
          <InfoField label="Diterbitkan oleh" icon={<Building2 />} direction="vertical">
            {formatDN(signature.signerIssuer)}
          </InfoField>
          <InfoField label="Waktu penandatanganan" icon={<CalendarClock />} direction="vertical">
            {signature.signedAt ? formatDateIdLong(signature.signedAt) : "Tidak tersedia di PDF"}
          </InfoField>
          {signature.tteMatch.ditandatanganiPada ? (
            <InfoField label="Waktu TTE aplikasi" icon={<CheckCircle2 />} direction="vertical">
              {formatDateIdLong(signature.tteMatch.ditandatanganiPada)}
            </InfoField>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ResultNotice({ result }: { result: VerifyPdfResponse }) {
  const hasValidTteMatch = result.allValid;

  return (
    <InfoCard
      variant={hasValidTteMatch ? "success" : "warning"}
      title={
        hasValidTteMatch
          ? "TTE ini sudah cocok dengan signature PDF"
          : result.hasSignatures
            ? "TTE belum cocok dengan signature PDF"
            : "Tidak ada tanda tangan digital"
      }
      icon={
        hasValidTteMatch ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : result.hasSignatures ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )
      }
      className="text-sm"
    >
      <p className="text-slate-800">
        {result.hasSignatures
          ? `Ditemukan ${result.signatures.length} signature PDF.`
          : "PDF belum memuat signature digital yang bisa diverifikasi."}
      </p>
    </InfoCard>
  );
}

export function ValidasiPdfPage() {
  const statusQuery = usePdfSigningStatus();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyPdfResponse | null>(null);

  useDocumentTitle("Verifikasi tanda tangan PDF - Sistem Informasi SOP");

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
    <div className="min-h-screen bg-[var(--color-bg-body)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <Shield className="h-8 w-8 text-blue-600" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Verifikasi tanda tangan PDF
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Unggah PDF untuk memastikan TTE aplikasi sudah cocok dengan signature PDF.
            </p>
          </div>
        </div>

        {statusQuery.isLoading ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex items-center justify-center gap-2 py-10 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              <span>Memuat status penandatanganan PDF...</span>
            </CardContent>
          </Card>
        ) : null}

        {statusQuery.isSuccess ? (
          <InfoCard
            variant={statusQuery.data.enabled ? "success" : "warning"}
            title={
              statusQuery.data.enabled
                ? "Penandatanganan PDF aktif"
                : "Penandatanganan PDF nonaktif"
            }
            icon={statusQuery.data.enabled ? <CheckCircle2 /> : <AlertCircle />}
            className="text-sm"
          >
            {statusQuery.data.enabled ? (
              <p className="text-slate-800">
                PDF yang sudah disahkan dapat diverifikasi di halaman ini.
              </p>
            ) : (
              <p className="text-slate-800">
                {statusQuery.data.configError ??
                  "Aktifkan konfigurasi PDF signing di server agar dokumen dapat memuat signature PDF."}
              </p>
            )}
          </InfoCard>
        ) : null}

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900">Unggah berkas PDF</h2>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-4 py-8 text-center transition hover:border-blue-300 hover:bg-blue-50/50">
              {selectedFile ? (
                <FileCheck2 className="h-8 w-8 text-blue-600" aria-hidden />
              ) : (
                <FileUp className="h-8 w-8 text-slate-500" aria-hidden />
              )}
              <span className="max-w-full break-words text-sm font-medium text-slate-800">
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
          <InfoCard
            variant="warning"
            title="Verifikasi gagal"
            icon={<AlertCircle className="h-4 w-4" />}
            className="text-sm"
          >
            <p className="text-slate-800">{verifyError}</p>
          </InfoCard>
        ) : null}

        {result ? (
          <>
            <ResultNotice result={result} />

            {result.signatures.map((signature) => (
              <SignatureResultCard key={signature.index} signature={signature} />
            ))}
          </>
        ) : (
          <Card className="border-slate-200 shadow-sm">
            <EmptyState
              icon={<FileCheck2 />}
              title="Hasil verifikasi akan tampil di sini"
              description="Informasi yang ditampilkan dibatasi ke status kecocokan TTE, penandatangan, penerbit, dan waktu tanda tangan."
              className="py-10"
            />
          </Card>
        )}

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
