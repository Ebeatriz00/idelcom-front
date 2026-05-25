import type { AccountUpsertDto, OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import {
  useCurrencyOptions,
  useBankOptions,
  useAccountPlanOptions,
} from "@/sharedKernel";
import { useEffect, useState } from "react";

export function AccountForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  currencyLabel,
  bankLabel,
  accountPlanLabel,
}: {
  defaultValues?: Partial<AccountUpsertDto>;
  onSubmit: (dto: AccountUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  currencyLabel?: string;
  bankLabel?: string;
  accountPlanLabel?: string;
}) {
  const [accountId, setAccountId] = useState<number | undefined>(
    defaultValues?.accountId
  );
  const [description, setDescription] = useState(
    defaultValues?.description ?? ""
  );
  const [currencyId, setCurrencyId] = useState<number | undefined>(
    defaultValues?.currencyId
  );
  const [bankId, setBankId] = useState<number | undefined>(
    defaultValues?.bankId
  );
  const [accountPlanId, setAccountPlanId] = useState<number | undefined>(
    defaultValues?.accountPlanId
  );

  const [currencyOpt, setCurrencyOpt] = useState<OptionItem | null>(null);
  const [bankOpt, setBankOpt] = useState<OptionItem | null>(null);
  const [accountPlanOpt, setAccountPlanOpt] = useState<OptionItem | null>(null);

  const { data: currencyResp } = useCurrencyOptions();
  const currencyOptions: OptionItem[] = currencyResp?.items ?? [];

  const { data: bankResp } = useBankOptions();
  const bankOptions: OptionItem[] = bankResp?.items ?? [];

  const { data: accountPlanResp } = useAccountPlanOptions();
  const accountPlanOptions: OptionItem[] = accountPlanResp?.items ?? [];

  useEffect(() => {
    setAccountId(defaultValues?.accountId);
    setDescription(defaultValues?.description ?? "");
    setCurrencyId(defaultValues?.currencyId);
    setBankId(defaultValues?.bankId);
    setAccountPlanId(defaultValues?.accountPlanId);
  }, [defaultValues?.accountId]);

  useEffect(() => {
    if (currencyId == null) return;
    if (currencyOpt?.value === currencyId) return;

    const found = currencyOptions.find(
      (o: OptionItem) => Number(o.value) === Number(currencyId)
    );

    if (found) {
      setCurrencyOpt(found);
      return;
    }
    if (currencyLabel) {
      setCurrencyOpt({
        value: Number(currencyId),
        label: currencyLabel,
      });
    }
  }, [currencyId, currencyLabel, currencyOptions]);

  useEffect(() => {
    if (bankId == null) return;
    if (bankOpt?.value === bankId) return;

    const found = bankOptions.find(
      (o: OptionItem) => Number(o.value) === Number(bankId)
    );

    if (found) {
      setBankOpt(found);
      return;
    }
    if (bankLabel) {
      setBankOpt({
        value: Number(bankId),
        label: bankLabel,
      });
    }
  }, [bankId, bankLabel, bankOptions]);

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

  const valid = !!description && !!currencyId && !!bankId && !!accountPlanId;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            accountId: accountId,
            description,
            currencyId,
            bankId,
            accountPlanId,
          });
        }
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="col-span-full">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <UpperInput
            mode="upper"
            value={description}
            autoFocus={autofocus}
            onValueChange={setDescription}
            placeholder="EJ: CTA. CORRIENTE SOLES BCP"
            maxLength={50}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>

        <div className="col-span-full min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Banco
          </label>
          <SearchSelect
            useOptions={useBankOptions}
            value={bankOpt}
            onChange={(opt) => {
              setBankOpt(opt);
              setBankId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar banco..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!bankId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona un banco.
            </p>
          )}
        </div>

        <div className="col-span-full min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Moneda
          </label>
          <SearchSelect
            useOptions={useCurrencyOptions}
            value={currencyOpt}
            onChange={(opt) => {
              setCurrencyOpt(opt);
              setCurrencyId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar moneda..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!currencyId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona una moneda.
            </p>
          )}
        </div>

        <div className="col-span-full min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Plan Contable
          </label>
          <SearchSelect
            useOptions={useAccountPlanOptions}
            value={accountPlanOpt}
            onChange={(opt) => {
              setAccountPlanOpt(opt);
              setAccountPlanId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar plan contable..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountPlanId && (
            <p className="mt-1 text-xs text-amber-600">
              Selecciona un plan contable.
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