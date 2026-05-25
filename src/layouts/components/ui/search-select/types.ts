import type { OptionItem, PagedSelect } from "@/application";
export type UseOptionsHook = (
  page: number,
  search: string,
  pageSize: number,
  opts?: { enabled?: boolean }
) => {
  data?: PagedSelect<OptionItem>;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};
