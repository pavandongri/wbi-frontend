"use client";

import { APP_CONSTANTS } from "@/constants/app.consants";
import { createPaymentOrder, updatePayment, verifyPayment } from "@/services/payments/payments.api";
import { createSubscription } from "@/services/subscriptions/subscriptions.api";
import type { SubscriptionPlanRow } from "@/types/subscription-plans.types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && typeof window.Razorpay !== "undefined") {
      resolve();
      return;
    }
    const existing = document.getElementById("razorpay-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay SDK")));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = APP_CONSTANTS.RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export type UseRazorpayCheckoutOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
  onDismiss?: () => void;
};

export function useRazorpayCheckout({
  onSuccess,
  onError,
  onDismiss
}: UseRazorpayCheckoutOptions = {}) {
  const qc = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const openSubscriptionCheckout = useCallback(
    async (plan: SubscriptionPlanRow) => {
      setIsPending(true);
      try {
        await loadRazorpayScript();

        // Step 1: Create payment order with subscriptionPlanId
        const { payment, order } = await createPaymentOrder({
          type: "subscription",
          amount: plan.amount,
          currency: plan.currency,
          subscriptionPlanId: plan.id
        });

        // Step 2: Open Razorpay checkout
        await new Promise<void>((resolve, reject) => {
          const rzp = new window.Razorpay({
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
            amount: order.amount,
            currency: order.currency,
            name: "WBI",
            description: `${plan.name} – ${plan.interval} subscription`,
            order_id: order.id,
            handler: async (response) => {
              try {
                await verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });

                // Step 3: Create subscription after successful payment
                const subscription = await createSubscription({
                  planId: plan.id,
                  status: "active"
                });

                // Step 4: Link subscription to the payment record
                await updatePayment(payment.id, { subscriptionId: subscription.id });

                // Step 5:
                // TODO Create invoice

                await Promise.all([
                  qc.invalidateQueries({ queryKey: ["subscriptions"] }),
                  qc.invalidateQueries({ queryKey: ["payments"] })
                ]);

                onSuccess?.();
                resolve();
              } catch (err) {
                const msg = err instanceof Error ? err.message : "Payment verification failed";
                onError?.(msg);
                reject(new Error(msg));
              }
            },
            modal: {
              ondismiss: () => {
                onDismiss?.();
                resolve();
              }
            },
            theme: { color: "#075E54" }
          });

          rzp.open();
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Payment failed. Please try again.";
        onError?.(msg);
      } finally {
        setIsPending(false);
      }
    },
    [qc, onSuccess, onError, onDismiss]
  );

  return { openSubscriptionCheckout, isPending };
}
