import {
  useNotificationsStore,
  type NotificationItem,
  type NotificationKind,
} from "@/stores/notifications/notifications.store";
import { type UINotificationItem } from "@/stores/notifications/useNotificationListUI";
import { clsx } from "clsx";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

import { normalizeNotification } from "@/realtime/normalizeNotification";
import {
  useNotificationActions,
  useNotificationsList,
} from "@/sharedKernel/hooks/Notifications/useNotifications";

type Filter = "all" | "unread" | NotificationKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "No leídas" },
  { id: "alert", label: "Alertas" },
  { id: "system", label: "Sistema" },
];

type Grouped = Record<string, UINotificationItem[]>;

export default function NotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  // 🔎 search + debounce
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // 📄 paginación
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const { data, isLoading, isFetching } = useNotificationsList(
    page - 1,
    pageSize,
    debouncedSearch,
  );

  const uiList = useMemo(
    () =>
      (data?.items ?? []).map(
        normalizeNotification,
      ) as unknown as UINotificationItem[],
    [data],
  );

  const setListLocal = useNotificationsStore((s) => s.setList);

  useEffect(() => {
    const isBaseFeed = page === 1 && (debouncedSearch ?? "").trim() === "";
    if (!isBaseFeed) return;

    const mapped = (data?.items ?? [])
      .map(normalizeNotification)
      .filter((x): x is NotificationItem => x !== null);

    setListLocal(mapped);
  }, [data?.items, setListLocal, page, debouncedSearch]);

  const total = data?.total ?? 0;
  const loading = isLoading || isFetching;

  // store solo para markAll/markOne (para mantener sync con dropdown si quieres)
  const markAllLocal = useNotificationsStore((s) => s.markAllRead);
  const markOneLocal = useNotificationsStore((s) => s.markOneRead);
  const resetStore = useNotificationsStore((s) => s.reset);

  const unreadCount = useMemo(
    () => uiList.filter((n) => !n.read).length,
    [uiList],
  );

  const filtered = useMemo(() => {
    let base = uiList;

    // extra: filtro por tipo
    if (filter === "unread") {
      base = base.filter((n) => !n.read);
    } else if (filter !== "all") {
      base = base.filter((n) => n.kind === filter);
    }

    return base;
  }, [filter, uiList]);

  const grouped = useMemo(() => groupByDay(filtered), [filtered]);
  const groupLabels = Object.keys(grouped);

  const hasMore = page * pageSize < total;

  const { markAllRead, markOneRead, clearCache } = useNotificationActions({
    onLocalMarkAll: markAllLocal,
    onLocalMarkOne: markOneLocal,
    onLocalReset: resetStore,
  });

  async function handleMarkAll() {
    await markAllRead();
  }

  function handleClearLocal() {
    clearCache();
    setPage(1);
    setSearch("");
  }
  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6">
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
            <div>
              <h1 className="text-base font-semibold text-slate-900">
                Notificaciones
              </h1>
              <p className="text-xs text-slate-500">
                Tienes{" "}
                <span className="font-medium">{unreadCount} sin leer</span> de{" "}
                {total} en total.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {total > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="rounded-full border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Marcar todas como leídas
                </button>
              )}

              {total > 0 && (
                <button
                  onClick={handleClearLocal}
                  className="rounded-full border border-red-100 px-3 py-1.5 font-medium text-red-500 hover:bg-red-50"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* FILTROS + SEARCH */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
            <div className="flex flex-wrap gap-1 text-xs">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                const count =
                  f.id === "all"
                    ? total
                    : f.id === "unread"
                      ? unreadCount
                      : uiList.filter((n) => n.kind === f.id).length;

                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={clsx(
                      "flex items-center gap-1 rounded-full px-3 py-1.5 border text-[11px]",
                      active
                        ? "border-slate-900 text-slate-900 bg-slate-50"
                        : "border-transparent text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={clsx(
                        "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full text-[10px]",
                        active
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {count}
                    </span>
                    <span>{f.label}</span>
                  </button>
                );
              })}
            </div>

            {/* SEARCH */}
            <div className="hidden sm:block">
              <input
                type="search"
                placeholder="Buscar notificación…"
                value={search}
                onChange={(e) => {
                  setPage(1); // reset página
                  setSearch(e.target.value);
                }}
                className="h-8 rounded-full border border-slate-200 px-3 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-300"
              />
            </div>
          </div>

          {/* LISTA */}
          <div className="bg-white">
            {loading && uiList.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                Cargando notificaciones…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">
                {total === 0
                  ? "Aún no tienes notificaciones."
                  : "No hay notificaciones que coincidan con el filtro."}
              </div>
            ) : (
              groupLabels.map((label) => (
                <div key={label}>
                  {/* título de grupo */}
                  <div className="px-5 py-2 text-[11px] font-semibold uppercase text-slate-400 bg-slate-50">
                    {label}
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {grouped[label].map((n) => (
                      <li key={n.id}>
                        <NotificationRow
                          item={n}
                          onMarkOne={async () => {
                            if (!n.read) await markOneRead(n.id);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}

            {/* PAGINACIÓN SIMPLE */}
            {hasMore && (
              <div className="border-t border-slate-100 px-5 py-3 text-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="text-xs font-medium text-primary hover:text-primary-700 disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Cargar más notificaciones"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  item,
  onMarkOne,
}: {
  item: UINotificationItem;
  onMarkOne: () => void;
}) {
  const isUnread = !item.read;

  return (
    <div
      onClick={onMarkOne}
      className="px-4 py-3 flex items-start gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
    >
      {/* dot */}
      <div className="pt-2">
        <span
          className={clsx(
            "block h-2 w-2 rounded-full",
            isUnread ? "bg-primary" : "bg-slate-200",
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[13px] font-medium text-slate-800 leading-snug line-clamp-2">
            {item.title}
          </p>
          <span className="shrink-0 text-[11px] text-slate-400 whitespace-nowrap">
            {item.timeLabel}
          </span>
        </div>

        {item.message && (
          <p className="mt-1 text-[12px] text-slate-600 leading-snug line-clamp-2">
            {item.message}
          </p>
        )}
      </div>
    </div>
  );
}

function groupByDay(list: UINotificationItem[]): Grouped {
  const groups: Grouped = {};

  for (const n of list) {
    let label = "Sin fecha";

    if (n.createdAt) {
      const dt = parseISO(n.createdAt);
      if (!isNaN(dt.getTime())) {
        if (isToday(dt)) {
          label = "Hoy";
        } else if (isYesterday(dt)) {
          label = "Ayer";
        } else {
          label = format(dt, "d MMM yyyy", { locale: es }); // ej: 10 dic 2025
        }
      }
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  }

  return groups;
}

// 🔁 debounce helper
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
