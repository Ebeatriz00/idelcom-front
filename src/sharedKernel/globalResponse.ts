export interface GlobalResponse {
  status: number;
  message: string;
  id?: number;
  opporNum?: string;
}

export interface GlobalResponseOf<T> extends GlobalResponse {
  data: T;
}

export function unwrap<T>(r: GlobalResponseOf<T>): T {
  if (r.status !== 1) {
    throw new Error(r.message || "Operación no válida");
  }
  return r.data;
}
