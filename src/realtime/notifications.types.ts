export type NotificationType = "NEW_COMMENT" | "OPPOR_STATE_CHANGED" | string;

export interface NotificationPayload {
  type: NotificationType;
  opporId?: number;
  createdBy?: number;
  newState?: string;
  businessId?: number;
  title?: string;
  body?: string;
  at?: string;
  linkUrl?: string;
  [key: string]: unknown;
}
