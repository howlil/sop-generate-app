import { createFileRoute, redirect } from "@tanstack/react-router";
import { ROUTES } from "@/utils/constants";

export const Route = createFileRoute("/pj-evaluator/tte/")({
  beforeLoad: () => {
    throw redirect({ to: ROUTES.PJ_EVALUATOR.ME });
  },
});
