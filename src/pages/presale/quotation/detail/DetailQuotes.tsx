import { useState } from "react";
import { useParams } from "react-router-dom";
import { QuotationVersionsAside } from "./pages/AsideQuotationVer";
import { QuotationModule } from "./pages/QuotationModule";

type SelectedVersion = {
  quotationVerId: string;
  versionNo: string;
};

export default function DetailQuotes() {
  const { quotationId } = useParams<{ quotationId: string }>();
  if (!quotationId) return null;

  const [selected, setSelected] = useState<SelectedVersion | null>(null);

  return (
    <div className="mx-auto grid max-w-12xl grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-12">
      <div className="lg:col-span-4 space-y-4">
        <QuotationVersionsAside
          quotationId={quotationId}
          selectedVerId={selected?.quotationVerId ?? ""}
          onSelect={(v) =>
            setSelected({
              quotationVerId: v.quotationVerId,
              versionNo: v.versionNo,
            })
          }
        />
      </div>
      <div className="lg:col-span-8">
        <QuotationModule
          selectedVerId={selected?.quotationVerId ?? ""}
          versionNo={selected?.versionNo ?? ""}
        />
      </div>
    </div>
  );
}
