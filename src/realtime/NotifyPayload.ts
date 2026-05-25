export type DbNotificationPayload = {
  notificationId: number;
  businessId: number;
  usersId: number;
  title: string;
  message: string;
  module: string;
  entity: string;
  entityId: string;
  linkUrl?: string | null;
  type: string;
  createdAt: string;
  readAt?: string | null;
  createdBy?: number;
  createdByName?: string;
  avatar?: string | null;
  [k: string]: any;
};
export type RealtimePayload =
  | {
      code: "EMAIL_SENT" | "EMAIL_FAILED";
      message: string;
      outboxId: number;
      targetUserId?: number;
      createdAt?: string;
    }
  | {
      code?: "COMMENT_ADDED";
      type?: "NEW_COMMENT";
      OpporId: number;
      createdByName: string;
      avatar?: string | null;
      message?: string;
      createdAt?: string;
      [k: string]: any;
    }
  | {
      code: "CLIENT_REASSIGNED";
      clientId: number;
      sellerId: number;
      createdByName: string;
      sellerName: string;
      clientName: string;
      assignerName: string;
      createdAt?: string;
      [k: string]: any;
    }
  | {
      code: "OPPOR_UPDATED";
      OpporId: number;
      updatedFields?: string[];
      createdByName?: string;
      createdAt?: string;
      [k: string]: any;
    }
  | {
      code: "SYSTEM_EVENT";
      message: string;
      createdAt?: string;
      [k: string]: any;
    }
  | {
      code?: string;
      message?: string;
      createdByName?: string;
      createdAt?: string;
      [k: string]: any;
    };

export type NotifyPayload = DbNotificationPayload | RealtimePayload;

export function isDbNotification(p: NotifyPayload): p is DbNotificationPayload {
  return "type" in p && typeof (p as any).type === "string";
}

export function getEventKey(p: any) {
  const obj = p?.payload ?? p?.notification ?? p;

  return (
    obj?.type ??
    obj?.Type ??
    obj?.code ??
    obj?.Code ??
    obj?.eventCode ??
    obj?.EventCode ??
    "GENERIC"
  );
}

export function getEventKeyNormalized(p: any) {
  return String(getEventKey(p)).trim().toUpperCase();
}
