import type { NotifyPayload } from "./NotifyPayload";

export function isEmailToast(payload: NotifyPayload) {
  return payload.code === "EMAIL_SENT" || payload.code === "EMAIL_FAILED";
}
