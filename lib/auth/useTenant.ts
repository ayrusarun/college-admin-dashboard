"use client";

import { useAuth } from "./AuthContext";

/**
 * Hook to access current tenant (college) information
 * This ensures all data operations are scoped to the user's college
 */
export function useTenant() {
  const { user } = useAuth();

  return {
    collegeId: user?.college_id,
    collegeName: user?.college_name,
    isMultiTenant: true,
    tenantScope: `college_${user?.college_id}`,
  };
}
