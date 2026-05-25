export interface GlobalError{
    Code: string
    Message: string
    errors?: { Code: string; Message: string }[]
    details?: string
}

export interface ApiErrorItem {
  code: string
  message: string
  field?: string
}

export type ParsedApiError = {
  httpStatus?: number;
  topCode?: string;
  message?: string;
  errors: ApiErrorItem[];
  fieldErrors?: Record<string,string>;
  details?: string;
  retryAfterMs?: number;   
  retryUntil?: number;     
};