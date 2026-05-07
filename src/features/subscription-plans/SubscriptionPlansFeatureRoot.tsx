"use client";

import SubscriptionPlansCrudShell from "@/features/subscription-plans/SubscriptionPlansCrudShell";
import SubscriptionPlansPricingView from "@/features/subscription-plans/SubscriptionPlansPricingView";
import { normalizeRole } from "@/lib/rbac";
import { readAuthClientSession } from "@/services/auth/authSession.client";

export default function SubscriptionPlansFeatureRoot() {
  const role = normalizeRole(readAuthClientSession()?.user);

  if (role === "super_admin") {
    return <SubscriptionPlansCrudShell />;
  }

  return <SubscriptionPlansPricingView />;
}
