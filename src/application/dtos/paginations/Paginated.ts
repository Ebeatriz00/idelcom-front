export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type OptionItem = { value: number; label: string; extraInfo?: string };

export type PagedSelect<T> = {
  items: T[];
  hasMore: boolean;
  page: number;
  pageSize: number;
};
