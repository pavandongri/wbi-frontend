"use client";

import { exchangeMetaCode, subscribeToWaba } from "@/services/meta/meta.api";
import type { FbLoginResponse, MetaExchangeCodeData } from "@/types/meta.types";
import { useCallback, useRef, useState } from "react";

export type MetaSignupStatus =
  | "idle"
  | "loading-sdk"
  | "pending"
  | "subscribing"
  | "success"
  | "error";

export type UseMetaEmbeddedSignupReturn = {
  status: MetaSignupStatus;
  result: MetaExchangeCodeData | null;
  error: string | null;
  startSignup: () => void;
  reset: () => void;
};

function loadFbSdk(appId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.FB !== "undefined") {
      resolve();
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        version: "v21.0",
        xfbml: false,
        cookie: true
      });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Failed to load Facebook SDK"));
    document.head.appendChild(script);
  });
}

export function useMetaEmbeddedSignup(): UseMetaEmbeddedSignupReturn {
  const [status, setStatus] = useState<MetaSignupStatus>("idle");
  const [result, setResult] = useState<MetaExchangeCodeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef(false);

  const startSignup = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    setError(null);
    setResult(null);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID ?? "";
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID ?? "";

    try {
      setStatus("loading-sdk");
      await loadFbSdk(appId);

      setStatus("pending");

      // Capture waba_id + phone_number_id from Meta's postMessage (sessionInfoVersion 3)
      let sessionWabaId: string | undefined;
      let sessionPhoneNumberId: string | undefined;

      function onMetaMessage(event: MessageEvent) {
        if (
          event.origin !== "https://www.facebook.com" &&
          event.origin !== "https://web.facebook.com"
        ) {
          return;
        }
        try {
          const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (msg?.type === "WA_EMBEDDED_SIGNUP" && msg?.event === "FINISH") {
            sessionWabaId = msg.data?.waba_id;
            sessionPhoneNumberId = msg.data?.phone_number_id;
          }
        } catch {
          // ignore non-JSON messages
        }
      }

      window.addEventListener("message", onMetaMessage);

      const loginResponse = await new Promise<FbLoginResponse>((resolve) => {
        window.FB.login(resolve, {
          config_id: configId,
          response_type: "code",
          override_default_response_type: true,
          scope: "whatsapp_business_management,whatsapp_business_messaging",
          extras: {
            sessionInfoVersion: "3"
          }
        });
      });

      window.removeEventListener("message", onMetaMessage);

      if (!loginResponse.authResponse?.code) {
        setStatus("idle");
        return;
      }

      // Step 1: exchange code → get WABA + phone number
      const exchangeRes = await exchangeMetaCode({
        code: loginResponse.authResponse.code,
        wabaId: sessionWabaId,
        phoneNumberId: sessionPhoneNumberId
      });

      // Step 2: subscribe WABA to receive webhook events
      setStatus("subscribing");
      await subscribeToWaba();

      setResult(exchangeRes.data);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    } finally {
      runningRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  return { status, result, error, startSignup, reset };
}
