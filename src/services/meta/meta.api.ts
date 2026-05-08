import { apiClient } from "@/lib/apiClient";
import type {
  MetaExchangeCodeResult,
  MetaSignupPayload,
  MetaSubscribeResult
} from "@/types/meta.types";

export async function exchangeMetaCode(
  payload: MetaSignupPayload
): Promise<MetaExchangeCodeResult> {
  return apiClient<MetaExchangeCodeResult>("/companies/facebook/exchange-code", {
    method: "POST",
    body: payload
  });
}

export async function subscribeToWaba(): Promise<MetaSubscribeResult> {
  return apiClient<MetaSubscribeResult>("/companies/facebook/subscribe-to-waba", {
    method: "POST"
  });
}
