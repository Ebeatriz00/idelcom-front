export type GlobalResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};