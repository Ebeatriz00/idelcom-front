import { qkHiring } from "@/sharedKernel/hooks/crm/hiring/useHiring";
import { qkOpportunities } from "@/sharedKernel/hooks/crm/opportunity/opportunities.qk";
import { qkTasks } from "@/sharedKernel/hooks/crm/tasks/tasks.qk";
import { qkNotifications } from "@/sharedKernel/hooks/Notifications/useNotifications";
import { qkPreSaleProyects } from "@/sharedKernel/hooks/presale/usePreSaleProyects";

export const CacheDomains = {
  opportunities: qkOpportunities.lists(),
  notifications: qkNotifications.all,
  preSales: qkPreSaleProyects.all,
  hirings: qkHiring.lists(),
  task: qkTasks.all,
} as const;

export type CacheDomain = keyof typeof CacheDomains;
