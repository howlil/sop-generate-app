import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";

export const Route = createFileRoute("/penyusun/koordinator/tte/")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.PENYUSUN.ME });
  },
});
