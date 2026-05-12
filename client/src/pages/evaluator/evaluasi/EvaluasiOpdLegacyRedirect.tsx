import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";
import { usePengajuanEvaluasiRingkas } from "@/api/evaluasi";
import { DetailPageLayout } from "@/components/layout/DetailPageLayout";

const ACTIVE_STATUS_IN = ["SEDANG_DIEVALUASI"] as const;

/**
 * Redirect dari bookmark `/evaluator/evaluasi/:opdId` → workspace pengajuan aktif atau daftar terfilter OPD.
 */
export function EvaluasiOpdLegacyRedirect() {
  const { id: opdId } = useParams({ from: "/evaluator/evaluasi/$id" });
  const navigate = useNavigate();
  const { data, isFetched, isError } = usePengajuanEvaluasiRingkas({
    opdId,
    page: 1,
    limit: 1,
    statusIn: ACTIVE_STATUS_IN,
    enabled: Boolean(opdId),
  });

  useEffect(() => {
    if (!opdId || !isFetched) return;
    const row = data?.items[0];
    if (row) {
      void navigate({
        to: "/evaluator/evaluasi/pengajuan/$id",
        params: { id: row.pengajuanEvaluasiId },
        replace: true,
      });
      return;
    }
    void navigate({
      to: ROUTES.EVALUATOR.EVALUASI,
      search: { opdId },
      replace: true,
    });
  }, [opdId, isFetched, data, navigate]);

  if (isError) {
    return (
      <DetailPageLayout
        breadcrumb={[{ label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI }]}
        title="Evaluasi SOP"
        description=""
        backTo={ROUTES.EVALUATOR.EVALUASI}
        main={
          <p className="p-4 text-sm text-red-600">
            Gagal memuat data untuk pengalihan.
          </p>
        }
      />
    );
  }

  return (
    <DetailPageLayout
      breadcrumb={[{ label: "Evaluasi SOP", to: ROUTES.EVALUATOR.EVALUASI }]}
      title="Evaluasi SOP"
      description=""
      backTo={ROUTES.EVALUATOR.EVALUASI}
      main={<p className="p-4 text-sm text-gray-600">Mengalihkan…</p>}
    />
  );
}
