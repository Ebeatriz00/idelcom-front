import { useEffect, useState } from "react";

export function useQuotationModuleState(selectedVerId: string, versionNo?: string) {
  const [tab, setTab] = useState("detail");
  const [subTab, setSubTab] = useState("detail_presales");
  const [importOpen, setImportOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    setSelectedMonth(null);
    setPage(1);
  }, [selectedVerId, versionNo]);

  const toggleExpandedMonth = (m: number) =>
    setExpandedMonth((prev) => (prev === m ? null : m));

  const onSelectMonth = (m: number) =>
    setSelectedMonth((prev) => (prev === m ? null : m));

  return {
    tab, setTab,
    subTab, setSubTab,
    importOpen, setImportOpen,
    selectedMonth, setSelectedMonth,
    expandedMonth, toggleExpandedMonth,
    page, setPage,
    onSelectMonth,
  };
}
