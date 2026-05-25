import type { ClientsUpdateChangeSalesDto } from "@/application";
import { useClientsById, useClientsMutations } from "@/sharedKernel";
import { useMemo, useState } from "react";

export function useSalesChangeFormModal() {
  const [openSales, setOpenSales] = useState(false);
  const [editingSalesId, seteditingSalesId] = useState<number | null>(null);

  const { data: detail, isFetching, isSuccess } = useClientsById(editingSalesId);
  const { updateSalesMut } = useClientsMutations();

  const defaultValuesSales = useMemo(() => {
    if (!editingSalesId) {
      const base: Partial<ClientsUpdateChangeSalesDto> = {
        workerId: undefined,
      };
      return base;
    }

    const d = detail ?? ({} as any);
    return {
      clientsId: d.clientsId ?? editingSalesId,
      workerId: d.workerId,
      workerLabel: d.workerName,
    } as Partial<ClientsUpdateChangeSalesDto> & {
      workerLabel?: string;
    };
  }, [editingSalesId, detail]);

  function openChangeVendor(id: number) {
    seteditingSalesId(id);
    setOpenSales(true);
  }

  function closeSales() {
    setOpenSales(false);
    seteditingSalesId(null);
  }

  async function submitChange(dto: ClientsUpdateChangeSalesDto) {
    await updateSalesMut.mutateAsync(dto);
    closeSales();
  }

  const savingSales = updateSalesMut.isPending;

  return {
    openSales,
    isFetching,
    isSuccess,
    defaultValuesSales,
    openChangeVendor,
    closeSales,
    savingSales,
    submitChange,
    seteditingSalesId,
    editingSalesId,
  };
}
