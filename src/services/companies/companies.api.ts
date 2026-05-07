import { apiClient } from "@/lib/apiClient";
import type { ApiSuccessEnvelope } from "@/types/api.types";
import type { CompanyRow } from "@/types/companies.types";

export async function getCompany(id: string): Promise<CompanyRow> {
  const res = await apiClient<ApiSuccessEnvelope<CompanyRow>>(`/companies/${id}`, {
    method: "GET"
  });
  return res.data;
}
