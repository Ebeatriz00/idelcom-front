import type { ConceptsUpsertDto, OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import {
  useAccountPlanOptions,
  useConceptGroupsOptions,
} from "@/sharedKernel";
import { useEffect, useState } from "react";

export function ConceptsForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  conceptGroupsLabel,
  accountPlanLabel,
}: {
  defaultValues?: Partial<ConceptsUpsertDto>;
  onSubmit: (dto: ConceptsUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  conceptGroupsLabel?: string;
  accountPlanLabel?: string;
}) {
 
  const [conceptsId, setConceptsId] = useState<number | undefined>(
    defaultValues?.conceptsId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [conceptGroupsId, setConceptGroupsId] = useState<number | undefined>(
    defaultValues?.conceptGroupsId
  );
  const [accountPlanId, setAccountPlanId] = useState<number | undefined>(
    defaultValues?.accountPlanId
  );
    
  const [conceptGroupsOpt, setConceptGroupsOpt] = useState<OptionItem | null>(
    null
  );
  const [accountPlanOpt, setAccountPlanOpt] = useState<OptionItem | null>(null);


  const { data: conceptGroupsResp } = useConceptGroupsOptions();
  const conceptGroupsOptions: OptionItem[] = conceptGroupsResp?.items ?? [];

  const { data: accountPlanResp } = useAccountPlanOptions();
  const accountPlanOptions: OptionItem[] = accountPlanResp?.items ?? [];


  useEffect(() => {
    setConceptsId(defaultValues?.conceptsId);
    setDescription(defaultValues?.description ?? "");
    setConceptGroupsId(defaultValues?.conceptGroupsId);
    setAccountPlanId(defaultValues?.accountPlanId);
  }, [defaultValues?.conceptsId]);


  useEffect(() => {
    if (conceptGroupsId == null) return;
    if (conceptGroupsOpt?.value === conceptGroupsId) return;

    const found = conceptGroupsOptions.find(
      (o: OptionItem) => Number(o.value) === Number(conceptGroupsId)
    );

    if (found) {
      setConceptGroupsOpt(found);
      return;
    }
    if (conceptGroupsLabel) {
      setConceptGroupsOpt({
        value: Number(conceptGroupsId),
        label: conceptGroupsLabel,
      });
    }
  }, [conceptGroupsId, conceptGroupsLabel, conceptGroupsOptions]);


  useEffect(() => {
    if (accountPlanId == null) return;
    if (accountPlanOpt?.value === accountPlanId) return;
    
    const found = accountPlanOptions.find(
      (o: OptionItem) => Number(o.value) === Number(accountPlanId)
    );

    if (found) {
      setAccountPlanOpt(found);
      return;
    }
    if (accountPlanLabel) {
      setAccountPlanOpt({
        value: Number(accountPlanId),
        label: accountPlanLabel,
      });
    }
  }, [accountPlanId, accountPlanLabel, accountPlanOptions]);


  const valid = !!description && !!conceptGroupsId && !!accountPlanId;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            conceptsId: conceptsId,
            description,
            conceptGroupsId,
            accountPlanId,
          });
        }
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <UpperInput
            mode="upper"
            value={description}
            autoFocus={autofocus}
            onValueChange={setDescription}
            placeholder="EJ: VENTA DE MERCADERÍA NACIONAL"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>

        <div className="col-span-full md:col-span-1 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Grupo de Concepto
          </label>
          <SearchSelect
            useOptions={useConceptGroupsOptions}
            value={conceptGroupsOpt}
            onChange={(opt) => {
              setConceptGroupsOpt(opt);
              setConceptGroupsId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar grupo..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!conceptGroupsId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona un grupo de concepto.
            </p>
          )}
        </div>

        <div className="col-span-full md:col-span-1 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Cuenta Contable
          </label>
          <SearchSelect
            useOptions={useAccountPlanOptions}
            value={accountPlanOpt}
            onChange={(opt) => {
              setAccountPlanOpt(opt);
              setAccountPlanId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar cuenta contable..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountPlanId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona una cuenta contable.
            </p>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}