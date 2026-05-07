import { getCompany } from "@/services/companies/companies.api";
import { readAuthClientSession } from "@/services/auth/authSession.client";
import type { CompanyRow } from "@/types/companies.types";

const CACHE_KEY = "wbi.company_details.v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type CompanyCache = {
  companyId: string;
  details: CompanyRow;
  cachedAt: number;
};

function readCache(companyId: string): CompanyRow | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: CompanyCache = JSON.parse(raw);
    if (cache.companyId !== companyId) return null;
    if (Date.now() - cache.cachedAt > CACHE_TTL_MS) return null;
    return cache.details;
  } catch {
    return null;
  }
}

function writeCache(companyId: string, details: CompanyRow): void {
  try {
    const cache: CompanyCache = { companyId, details, cachedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage unavailable — ignore
  }
}

export async function getCompanyDetails(): Promise<CompanyRow> {
  const session = readAuthClientSession();
  const companyId = session?.user.companyId;
  if (!companyId) throw new Error("No company ID in session");

  const cached = readCache(companyId);
  if (cached) return cached;

  const company = await getCompany(companyId);
  writeCache(companyId, company);
  return company;
}
