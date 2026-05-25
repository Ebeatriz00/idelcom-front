import type { OpportunitiesUploadNewVerDto } from "@/application";
import {
  closeAlert,
  showApiError,
  useOpportunitiesMutations,
} from "@/sharedKernel";
import { useState } from "react";

export function useUploadQuoNewVer() {
  const [open, setOpen] = useState(false);
  const [defaults, setDefaults] = useState<
    Partial<OpportunitiesUploadNewVerDto>
  >({});
  const [uploadPct, setUploadPct] = useState(0);
  const { uploadQuptationNewVerMut } = useOpportunitiesMutations();

  function openFor(row: Partial<OpportunitiesUploadNewVerDto>) {
    setDefaults(row);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setTimeout(() => setDefaults({}), 300);
  }

  async function submit(dto: OpportunitiesUploadNewVerDto) {
    try {
      setUploadPct(0);
      await uploadQuptationNewVerMut.mutateAsync({
        dto,
        onProgress: (p) => setUploadPct(p),
      });
      close();
    } catch (err) {
      showApiError(err);
    } finally {
      closeAlert();
      setUploadPct(0);
    }
  }

  return {
    open,
    defaultValues: defaults,
    openFor,
    close,
    submit,
    uploadPct,
    saving: uploadQuptationNewVerMut.isPending,
  };
}
