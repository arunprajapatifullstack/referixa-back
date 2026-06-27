export const PLAN_LIMITS: Record<string, { customers: number; campaigns: number }> = {
  free: { customers: 50, campaigns: 1 },
  pro: { customers: 500, campaigns: 9999 },
  enterprise: { customers: 999999, campaigns: 999999 },
};
