import { useMemo } from "react";

type ItemsResponse<T> = {
  items?: T[];
};
export function useSelectOptions<T>(hookResult: { data?: ItemsResponse<T> }) {
  return useMemo(() => hookResult.data?.items ?? [], [hookResult.data]);
}
