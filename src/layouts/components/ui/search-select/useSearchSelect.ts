// search-select/useSearchSelect.ts
import { useEffect, useId, useRef, useState } from "react";
import type { UseOptionsHook } from "./types";
import type { OptionItem } from "@/application";

export function useSearchSelect({
  useOptions,
  value, // solo para enabled de la query
  pageSize = 10,
  minSearchChars = 0,
  autofocus = false,
}: {
  useOptions: UseOptionsHook;
  value: OptionItem | null;
  pageSize?: number;
  minSearchChars?: number;
  autofocus?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeIndex, setActiveIndex] = useState(-1);

  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    if (autofocus) inputRef.current?.focus();
  }, [autofocus]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popoverRef.current?.contains(t) && !inputRef.current?.contains(t)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const canQuery = search.trim().length >= minSearchChars;

  const { data, isLoading, isFetching, refetch } = useOptions(
    page,
    search,
    pageSize,
    { enabled: canQuery || !!value }
  );

  const items = data?.items ?? [];
  const currentPage = data?.page ?? page;
  const hasMore = data?.hasMore ?? false;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (
      !open &&
      (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter")
    ) {
      setOpen(true);
      setActiveIndex(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      if (hasMore && !isFetching) setPage((p) => p + 1);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      setPage((p) => Math.max(1, p - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPage(1);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  useEffect(() => {
    if (!listRef.current || activeIndex < 0) return;
    (
      listRef.current.children[activeIndex] as HTMLElement | undefined
    )?.scrollIntoView({
      block: "nearest",
    });
  }, [activeIndex]);

  return {
    open,
    setOpen,
    search,
    setSearch,
    page: currentPage,
    setPage,
    activeIndex,
    setActiveIndex,
    inputRef,
    popoverRef,
    listRef,
    listboxId,
    items,
    hasMore,
    isLoading,
    isFetching,
    refetch,
    onKeyDown,
  };
}
