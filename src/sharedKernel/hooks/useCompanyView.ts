
import { useEffect, useState } from "react";
import { fetchCompanyView } from "@/infrastructure";
import type { BusinessViewDto } from "@dtos/company/company.dto";
import { getBusinessIdFromStorage } from "@/stores/auth/storage";

export function useCompanyView(businessId?: number) {
  const [company, setCompany] = useState<BusinessViewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    const bid = businessId ?? getBusinessIdFromStorage();

    if (!bid) {
      setError("No hay BusinessId en storage.");
      setLoading(false);
      return;
    }

    fetchCompanyView(bid)
      .then((d) => { if (!cancel) setCompany(d); })
      .catch((e) => { if (!cancel) setError(e?.message ?? "Error"); })
      .finally(()  => { if (!cancel) setLoading(false); });

    return () => { cancel = true; };
  }, [businessId]);

  return { company, loading, error };
}
