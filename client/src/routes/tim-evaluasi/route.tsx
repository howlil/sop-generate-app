import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRoles } from "@/stores/authStore";

export const Route = createFileRoute("/tim-evaluasi")({
  beforeLoad: requireRoles(["TIM_EVALUASI"]),
  component: DashboardLayout,
});
