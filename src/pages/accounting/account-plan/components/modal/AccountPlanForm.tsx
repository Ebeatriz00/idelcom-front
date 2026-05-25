import type { AccountPlanUpsertDto, OptionItem } from "@/application";
import { SearchSelect, UpperInput } from "@/layouts";
import {
  useAccountLevelOptions,
  useAccountPlanOptions,
  useAccountTypeOptions,
  useAuxiliaryTypeOptions,
  useTypeAnalysisOptions,
} from "@/sharedKernel";
import { useCurrencyOptions } from "@/sharedKernel/hooks/general/useCurrency";
import { useEffect, useState } from "react";

export function AccountPlanForm({
  defaultValues,
  onSubmit,
  saving,
  formId,
  showActions = true,
  autofocus = true,
  accountTypeLabel,
  accountLevelLabel,
  typeAnalysisLabel,
  auxiliaryTypeLabel,
  currencyLabel,
  accountAmarreDebitLabel,
  accountAmarreCreditLabel,
}: {
  defaultValues: AccountPlanUpsertDto;
  onSubmit: (dto: AccountPlanUpsertDto) => void;
  saving?: boolean;
  formId?: string;
  showActions?: boolean;
  autofocus?: boolean;
  accountTypeLabel?: string;
  accountLevelLabel?: string;
  typeAnalysisLabel?: string;
  auxiliaryTypeLabel?: string;
  currencyLabel?: string;
  accountAmarreDebitLabel?: string;
  accountAmarreCreditLabel?: string;
}) {
  const [accountPlanId, setAccountPlanId] = useState<number | undefined>(
    defaultValues?.accountPlanId
  );
  const [accountCode, setAccountCode] = useState(defaultValues?.accountCode);
  const [accountName, setAccountName] = useState(defaultValues?.accountName);

  const [accountTypeId, setAccountTypeId] = useState<number | undefined>(
    defaultValues?.accountTypeId
  );
  const [accountLevelId, setAccountLevelId] = useState<number | undefined>(
    defaultValues?.accountLevelId
  );
  const [typeAnalysisId, setTypeAnalysisId] = useState<number | undefined>(
    defaultValues?.typeAnalysisId
  );
  const [currencyId, setCurrencyId] = useState<number | undefined>(
    defaultValues?.currencyId
  );
  const [auxiliaryTypeId, setAuxiliaryTypeId] = useState<number | undefined>(
    defaultValues?.auxiliaryTypeId
  );

  const [difereceChange, setDifereceChange] = useState(
    defaultValues?.difereceChange ?? ""
  );
  const [docControl, setDocControl] = useState(defaultValues?.docControl ?? "");

  const [accountAmarreDebit, setAccountAmarreDebit] = useState<
    number | undefined
  >(defaultValues?.accountAmarreDebit);
  
  const [accountAmarreCredit, setAccountAmarreCredit] = useState<
    number | undefined
  >(defaultValues?.accountAmarreCredit);

  //options
  const [accountTypeOpt, setAccountTypeOpt] = useState<OptionItem | null>(null);
  const [accountLevelOpt, setAccountLevelOpt] = useState<OptionItem | null>(
    null
  );
  const [typeAnalysisOpt, setTypeAnalysisOpt] = useState<OptionItem | null>(
    null
  );
  const [currencyOpt, setCurrencyOpt] = useState<OptionItem | null>(null);
  const [auxiliaryTypeOpt, setAuxiliaryTypeOpt] = useState<OptionItem | null>(
    null
  );
  const [accountAmarreDebitOpt, setAccountAmarreDebitOpt] =
    useState<OptionItem | null>(null);

  const [accountAmarreCreditOpt, setAccountAmarreCreditOpt] =
    useState<OptionItem | null>(null);

  const { data: accountTypeResp } = useAccountTypeOptions();
  const accountTypeOptions: OptionItem[] = accountTypeResp?.items ?? [];

  const { data: accountLevelResp } = useAccountLevelOptions();
  const accountLevelOptions: OptionItem[] = accountLevelResp?.items ?? [];

  const { data: typeAnalysisResp } = useTypeAnalysisOptions();
  const typeAnalysisOptions: OptionItem[] = typeAnalysisResp?.items ?? [];

  const { data: currencyResp } = useCurrencyOptions();
  const currencyOptions: OptionItem[] = currencyResp?.items ?? [];

  const { data: auxiliaryTypeResp } = useAuxiliaryTypeOptions();
  const auxiliaryTypeOptions: OptionItem[] = auxiliaryTypeResp?.items ?? [];

  const { data: accountAmarreDebitResp } = useAccountPlanOptions();
  const accountAmarreDebitOptions: OptionItem[] =
    accountAmarreDebitResp?.items ?? [];

  const { data: accountAmarreCreditResp } = useAccountPlanOptions();
  const accountAmarreCreditOptions: OptionItem[] =
    accountAmarreCreditResp?.items ?? [];

  useEffect(() => {
    setAccountPlanId(defaultValues?.accountPlanId);
    setAccountCode(defaultValues?.accountCode);
    setAccountName(defaultValues?.accountName);
    setAccountTypeId(defaultValues?.accountTypeId);
    setAccountLevelId(defaultValues?.accountLevelId);
    setTypeAnalysisId(defaultValues?.typeAnalysisId);
    setCurrencyId(defaultValues?.currencyId);
    setAuxiliaryTypeId(defaultValues?.auxiliaryTypeId);
    setDifereceChange(defaultValues?.difereceChange ?? "");
    setDocControl(defaultValues?.docControl ?? "");
    setAccountAmarreDebit(defaultValues?.accountAmarreDebit);
    setAccountAmarreCredit(defaultValues?.accountAmarreCredit);
  }, [defaultValues?.accountPlanId]);

  useEffect(() => {
    if (accountTypeId == null) return;
    if (accountTypeOpt?.value === accountTypeId) return;
    const found = accountTypeOptions.find(
      (o: OptionItem) => Number(o.value) === Number(accountTypeId)
    );

    if (found) {
      setAccountTypeOpt(found);
      return;
    }
    if (accountTypeLabel) {
      setAccountTypeOpt({
        value: Number(accountTypeId),
        label: accountTypeLabel,
      });
    }
  }, [accountTypeId, accountTypeLabel, accountTypeOptions]);

  useEffect(() => {
    if (accountLevelId == null) return;
    if (accountLevelOpt?.value === accountLevelId) return;
    const found = accountLevelOptions.find(
      (o: OptionItem) => Number(o.value) === Number(accountLevelId)
    );

    if (found) {
      setAccountLevelOpt(found);
      return;
    }
    if (accountLevelLabel) {
      setAccountLevelOpt({
        value: Number(accountLevelId),
        label: accountLevelLabel,
      });
    }
  }, [accountLevelId, accountLevelLabel, accountLevelOptions]);

  useEffect(() => {
    if (typeAnalysisId == null) return;
    if (typeAnalysisOpt?.value === typeAnalysisId) return;
    const found = typeAnalysisOptions.find(
      (o: OptionItem) => Number(o.value) === Number(typeAnalysisId)
    );

    if (found) {
      setTypeAnalysisOpt(found);
      return;
    }
    if (typeAnalysisLabel) {
      setTypeAnalysisOpt({
        value: Number(typeAnalysisId),
        label: typeAnalysisLabel,
      });
    }
  }, [typeAnalysisId, typeAnalysisLabel, typeAnalysisOptions]);

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
    if (auxiliaryTypeId == null) return;
    if (auxiliaryTypeOpt?.value === auxiliaryTypeId) return;
    const found = auxiliaryTypeOptions.find(
      (o: OptionItem) => Number(o.value) === Number(auxiliaryTypeId)
    );

    if (found) {
      setAuxiliaryTypeOpt(found);
      return;
    }
    if (auxiliaryTypeLabel) {
      setAuxiliaryTypeOpt({
        value: Number(auxiliaryTypeId),
        label: auxiliaryTypeLabel,
      });
    }
  }, [auxiliaryTypeId, auxiliaryTypeLabel, auxiliaryTypeOptions]);

  useEffect(() => {
    if (accountAmarreDebit == null) return;
    if (accountAmarreDebitOpt?.value === accountAmarreDebit) return;
    const found = accountAmarreDebitOptions.find(
      (o: OptionItem) => Number(o.value) === Number(accountAmarreDebit)
    );

    if (found) {
      setAccountAmarreDebitOpt(found);
      return;
    }
    if (accountAmarreDebitLabel) {
      setAccountAmarreDebitOpt({
        value: Number(accountAmarreDebit),
        label: accountAmarreDebitLabel,
      });
    }
  }, [accountAmarreDebit, accountAmarreDebitLabel, accountAmarreDebitOptions]);

  useEffect(() => {
    if (accountAmarreCredit == null) return;
    if (accountAmarreCreditOpt?.value === accountAmarreCredit) return;
    const found = accountAmarreCreditOptions.find(
      (o: OptionItem) => Number(o.value) === Number(accountAmarreCredit)
    );

    if (found) {
      setAccountAmarreCreditOpt(found);
      return;
    }
    if (accountAmarreCreditLabel) {
      setAccountAmarreCreditOpt({
        value: Number(accountAmarreCredit),
        label: accountAmarreCreditLabel,
      });
    }
  }, [
    accountAmarreCredit,
    accountAmarreCreditLabel,
    accountAmarreCreditOptions,
  ]);

  const valid = !!accountCode && !!accountName;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSubmit({
            accountPlanId: accountPlanId!,
            accountCode,
            accountName,
            accountTypeId: accountTypeId!,
            accountLevelId: accountLevelId!,
            typeAnalysisId: typeAnalysisId!,
            currencyId: currencyId!,
            auxiliaryTypeId: auxiliaryTypeId!,
            difereceChange: difereceChange!,
            docControl: docControl!,
            accountAmarreDebit: accountAmarreDebit!,
            accountAmarreCredit: accountAmarreCredit!,
          });
        }
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Codigo
          </label>
          <input
            value={accountCode}
            autoFocus={autofocus}
            onChange={(e) => setAccountCode(e.target.value)}
            placeholder="11111"
            type="number"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>
        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Descripción
          </label>
          <UpperInput
            mode="first"
            value={accountName}
            onValueChange={(e) => {
              setAccountName(e);
            }}
            placeholder="Pérez"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          />
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo cuenta
          </label>
          <SearchSelect
            useOptions={useAccountTypeOptions}
            value={accountTypeOpt}
            onChange={(opt) => {
              setAccountTypeOpt(opt);
              setAccountTypeId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar tipo de cuenta..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountTypeId && (
            <p className="text-xs text-amber-600">
              Selecciona un tipo de cuenta.
            </p>
          )}
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Nivel de cuenta
          </label>
          <SearchSelect
            useOptions={useAccountLevelOptions}
            value={accountLevelOpt}
            onChange={(opt) => {
              setAccountLevelOpt(opt);
              setAccountLevelId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar tipo de cuenta..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountLevelId && (
            <p className="text-xs text-amber-600">
              Selecciona un nivel de cuenta.
            </p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Analaisis
          </label>
          <SearchSelect
            useOptions={useTypeAnalysisOptions}
            value={typeAnalysisOpt}
            onChange={(opt) => {
              setTypeAnalysisOpt(opt);
              setTypeAnalysisId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar tipo de cuenta..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!typeAnalysisId && (
            <p className="text-xs text-amber-600">
              Selecciona un tipo de analisis.
            </p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
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
            <p className="text-xs text-amber-600">Selecciona una moneda.</p>
          )}
        </div>

        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Auxiliar
          </label>
          <SearchSelect
            useOptions={useAuxiliaryTypeOptions}
            value={auxiliaryTypeOpt}
            onChange={(opt) => {
              setAuxiliaryTypeOpt(opt);
              setAuxiliaryTypeId(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar auxiliar..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!auxiliaryTypeId && (
            <p className="text-xs text-amber-600">Selecciona una Auxiliar.</p>
          )}
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Dif. Cambio
          </label>
          <select
            value={difereceChange}
            onChange={(e) => setDifereceChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            <option value="">Seleccionar</option>
            <option value="C">Compra</option>
            <option value="V">Venta</option>
          </select>
        </div>
        <div className="col-span-full lg:col-span-6 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Doc. Control
          </label>
          <select
            value={docControl}
            onChange={(e) => setDocControl(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-gray-300 focus:outline-none"
          >
            <option value="">Seleccionar</option>
            <option value="0">No</option>
            <option value="1">Si</option>
          </select>
        </div>

        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Cuenta Cargo
          </label>
          <SearchSelect
            useOptions={useAccountPlanOptions}
            value={accountAmarreDebitOpt}
            onChange={(opt) => {
              setAccountAmarreDebitOpt(opt);
              setAccountAmarreDebit(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar auxiliar..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountAmarreDebit && (
            <p className="text-xs text-amber-600">
              Selecciona una cuenta a cargo.
            </p>
          )}
        </div>
        <div className="col-span-full lg:col-span-12 min-w-0">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Cuenta Cargo
          </label>
          <SearchSelect
            useOptions={useAccountPlanOptions}
            value={accountAmarreCreditOpt}
            onChange={(opt) => {
              setAccountAmarreCreditOpt(opt);
              setAccountAmarreCredit(opt ? Number(opt.value) : undefined);
            }}
            placeholder="Buscar auxiliar..."
            pageSize={10}
            minSearchChars={0}
            className="w-full min-w-0"
          />
          {!accountAmarreCredit && (
            <p className="text-xs text-amber-600">
              Selecciona una cuenta a cargo.
            </p>
          )}
        </div>
      </div>
      {showActions && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="submit"
            disabled={!valid || saving}
            className="rounded-md bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      )}
    </form>
  );
}
