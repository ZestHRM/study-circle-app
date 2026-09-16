import { useSubscriptionPlansQuery } from "@/hooks/queries/use-subscriptions";
import { useAuth } from "@/lib/auth";
import {
  findUserPlan,
  getPlanPermissions,
  type PlanPermissions,
} from "@/lib/permissions";
import type { SubscriptionPlan } from "@/services";
import * as React from "react";

export interface UsePlanPermissionsResult {
  permissions: PlanPermissions;
  userPlan: SubscriptionPlan | null;
  hasQuizAccess: boolean;
  maxExamPaperYears: number;
  maxHomeworkSubjects: number;
  aiAccessLevel: string;
  supportLevel: string;
  isLoadingPlans: boolean;
}

/**
 * Custom hook providing memoized, reactive plan permissions.
 * Prevents unnecessary re-renders across components by memoizing
 * permission evaluation against current user state and cached plans list.
 */
export function usePlanPermissions(): UsePlanPermissionsResult {
  const { user } = useAuth();
  const { plans, isLoading } = useSubscriptionPlansQuery();

  const userPlan = React.useMemo(() => {
    return findUserPlan(user, plans);
  }, [user, plans]);

  const permissions = React.useMemo(() => {
    return getPlanPermissions(user, plans);
  }, [user, plans]);

  return React.useMemo(
    () => ({
      permissions,
      userPlan,
      hasQuizAccess: permissions.hasQuizAccess,
      maxExamPaperYears: permissions.maxExamPaperYears,
      maxHomeworkSubjects: permissions.maxHomeworkSubjects,
      aiAccessLevel: permissions.aiAccessLevel,
      supportLevel: permissions.supportLevel,
      isLoadingPlans: isLoading,
    }),
    [permissions, userPlan, isLoading],
  );
}
