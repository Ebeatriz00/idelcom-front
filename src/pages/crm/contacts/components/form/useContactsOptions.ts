import type { OptionItem } from "@/application";
import {
  useClientsOptions,
  useContactTypeOptions,
  useLeadsSourcesOptions,
} from "@/sharedKernel";
import { useSalesWorkerOptions } from "@/sharedKernel/hooks/rrhh/useWorkerList";
import { makeLocalUseOptions } from "@/sharedKernel/hooks/SelectOptions/makeLocalUseOptions";
import { useMemo } from "react";

export function useContactsOptions() {
  const { data: clientResp } = useClientsOptions(1, "", 1000);
  const clientOptions: OptionItem[] = clientResp?.items ?? [];

  const { data: workerResp } = useSalesWorkerOptions();
  const workerOptions: OptionItem[] = workerResp?.items ?? [];

  const { data: leadsSourcesResp } = useLeadsSourcesOptions();
  const leadsSourcesOptions: OptionItem[] = leadsSourcesResp?.items ?? [];

  const { data: contactTypeResp } = useContactTypeOptions(1, "", 1000);
  const contactTypeOptions: OptionItem[] = contactTypeResp?.items ?? [];

  // locales (filtran por search)
  const useClientLocal = useMemo(
    () => makeLocalUseOptions(clientOptions),
    [clientOptions]
  );
  const useWorkerLocal = useMemo(
    () => makeLocalUseOptions(workerOptions),
    [workerOptions]
  );
  const useLeadSourcesLocal = useMemo(
    () => makeLocalUseOptions(leadsSourcesOptions),
    [leadsSourcesOptions]
  );
  const useContactTypeLocal = useMemo(
    () => makeLocalUseOptions(contactTypeOptions),
    [contactTypeOptions]
  );

  return {
    clientOptions,
    workerOptions,
    leadsSourcesOptions,
    contactTypeOptions,
    useClientLocal,
    useWorkerLocal,
    useLeadSourcesLocal,
    useContactTypeLocal,
  };
}
