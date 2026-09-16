import {
  getUserSubscriptionTier,
  type SubscriptionPlan,
  type User,
} from "@/services";

export interface PlanPermissions {
  tierName: string;
  hasQuizAccess: boolean;
  maxExamPaperYears: number;
  maxHomeworkSubjects: number;
  aiAccessLevel: string;
  supportLevel: string;
  rawFeatures: string[];
}

/**
 * Finds the user's active SubscriptionPlan object strictly from the backend API `/subscriptions/plans` list
 * by matching pricingId OR tier name.
 */
export function findUserPlan(
  user?: User | null,
  plans?: SubscriptionPlan[] | null,
): SubscriptionPlan | null {
  if (!user || !plans || plans.length === 0) return null;

  const userPricingId = user.subscription?.pricingId?.trim().toLowerCase();
  const userTierName = getUserSubscriptionTier(user).toLowerCase();

  // 1. Match exact pricingId from monthly/yearly INR/USD fields
  if (userPricingId) {
    const matchedByPricing = plans.find((p) => {
      const monthlyInr = p.id?.monthly?.inr?.toLowerCase();
      const monthlyUsd = p.id?.monthly?.usd?.toLowerCase();
      const yearlyInr = p.id?.yearly?.inr?.toLowerCase();
      const yearlyUsd = p.id?.yearly?.usd?.toLowerCase();

      return (
        monthlyInr === userPricingId ||
        monthlyUsd === userPricingId ||
        yearlyInr === userPricingId ||
        yearlyUsd === userPricingId
      );
    });

    if (matchedByPricing) return matchedByPricing;
  }

  // 2. Match by tier name (e.g. "Silver", "Gold", "Platinum", "Free Plan")
  return (
    plans.find((p) => {
      const planName = (p.name ?? "").toLowerCase();
      return planName.includes(userTierName) || userTierName.includes(planName);
    }) ?? null
  );
}

/**
 * Dynamically parses permissions directly from backend plan's `features` array.
 * Reads backend API feature strings dynamically.
 */
export function parsePermissionsFromPlan(
  plan: SubscriptionPlan,
): PlanPermissions {
  const features = plan.features ?? [];

  // Dynamic Quiz Access check from features list
  const hasQuizAccess = features.some(
    (f) => /quiz access/i.test(f) && !/no quiz access/i.test(f),
  );

  // Dynamic Exam Paper Years extraction (e.g. "Upload last 5 Year Exam Papers")
  let maxExamPaperYears = 0;
  const examPaperFeature = features.find((f) => /exam paper/i.test(f));
  if (examPaperFeature && !/no exam paper/i.test(examPaperFeature)) {
    const match = examPaperFeature.match(/(\d+)\s*year/i);
    if (match) {
      maxExamPaperYears = parseInt(match[1], 10);
    }
  }

  // Dynamic Subject Homework Help extraction (e.g. "10 Subject Homework Help" or "Unlimited...")
  let maxHomeworkSubjects = 0;
  const hwFeature = features.find((f) => /homework help/i.test(f));
  if (hwFeature) {
    if (/unlimited/i.test(hwFeature)) {
      maxHomeworkSubjects = Number.POSITIVE_INFINITY;
    } else {
      const match = hwFeature.match(/(\d+)\s*subject/i);
      if (match) {
        maxHomeworkSubjects = parseInt(match[1], 10);
      }
    }
  }

  // Dynamic AI Access Level extraction
  let aiAccessLevel = "Basic";
  const aiFeature = features.find((f) => /ai access/i.test(f));
  if (aiFeature) {
    if (/limited/i.test(aiFeature)) aiAccessLevel = "Limited";
    else if (/basic/i.test(aiFeature)) aiAccessLevel = "Basic";
    else if (/standard/i.test(aiFeature)) aiAccessLevel = "Standard";
    else if (/premium/i.test(aiFeature)) aiAccessLevel = "Premium";
  }

  // Dynamic Support Level extraction
  let supportLevel = "Basic";
  const supportFeature = features.find((f) => /support/i.test(f));
  if (supportFeature) {
    supportLevel = supportFeature;
  }

  return {
    tierName: plan.name,
    hasQuizAccess,
    maxExamPaperYears,
    maxHomeworkSubjects,
    aiAccessLevel,
    supportLevel,
    rawFeatures: features,
  };
}

/**
 * Gets Dynamic Plan Permissions for a user purely from backend `plans` payload.
 * No hardcoded tier fallbacks.
 */
export function getPlanPermissions(
  user?: User | null,
  plans?: SubscriptionPlan[] | null,
): PlanPermissions {
  if (plans && plans.length > 0) {
    const matchedPlan = findUserPlan(user, plans);
    if (matchedPlan) {
      return parsePermissionsFromPlan(matchedPlan);
    }
  }

  // Empty default state when plan is not found or plans list is loading
  const rawTierName = user ? getUserSubscriptionTier(user) : "FREE";

  return {
    tierName: rawTierName,
    hasQuizAccess: false,
    maxExamPaperYears: 0,
    maxHomeworkSubjects: 0,
    aiAccessLevel: "None",
    supportLevel: "None",
    rawFeatures: [],
  };
}

/**
 * Checks if user has Quiz Access purely based on backend plan features.
 */
export function hasQuizAccess(
  user?: User | null,
  plans?: SubscriptionPlan[] | null,
): boolean {
  return getPlanPermissions(user, plans).hasQuizAccess;
}

/**
 * Helper to get matching plan by pricingId
 */
export function getPlanByPricingId(
  pricingId: string | null | undefined,
  plans: SubscriptionPlan[],
): SubscriptionPlan | null {
  return findUserPlan({ subscription: { pricingId } } as User, plans);
}
