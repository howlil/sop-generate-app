import { apiClient, buildQueryString } from "@/utils/api-client";
import type { LogEditSOP, BagianSOP, AuditQueryParams } from "../types/audit";

export const auditApi = {
  findBySopDetail: (
    sopDetailId: string,
    params?: { bagian?: BagianSOP; skip?: number; take?: number },
  ) => apiClient.get<LogEditSOP[]>(`/audit/detail-sop/${sopDetailId}${buildQueryString(params)}`),

  findAll: (params?: AuditQueryParams) =>
    apiClient.get<LogEditSOP[]>(`/audit${buildQueryString(params)}`),
};
