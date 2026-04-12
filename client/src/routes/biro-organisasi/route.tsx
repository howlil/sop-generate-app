import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRoles } from "@/stores/authStore";

export const Route = createFileRoute("/biro-organisasi")({
  beforeLoad: requireRoles(["BIRO_ORGANISASI"]),
  component: DashboardLayout,
});
