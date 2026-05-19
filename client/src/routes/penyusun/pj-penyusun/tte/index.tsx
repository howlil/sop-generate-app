import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";

export const Route = createFileRoute("/penyusun/pj-penyusun/tte/")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.PENYUSUN.ME });
  },
});
