import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";

export const Route = createFileRoute("/kepala-opd/tte/")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.KEPALA_OPD.ME });
  },
});
