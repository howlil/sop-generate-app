import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { requireRoles } from "@/stores/authStore";

export const Route = createFileRoute("/kepala-opd")({
  beforeLoad: requireRoles(["KEPALA_OPD"]),
  component: DashboardLayout,
});
