import {
  AlertTriangle,
  BadgeCheck,
  Globe2,
  Receipt,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useEffect } from "react";
import { type Control, type UseFormSetValue, useWatch } from "react-hook-form";

import type { SuppliersFormValues } from "./from/suppliers.schema";

type TaxConditionName =
  | "detractionAgent"
  | "foreignAgent"
  | "retainerAgent"
  | "perceptionAgent";

type TaxConditionOption = {
  name: TaxConditionName;
  title: string;
  subtitle: string;
  icon: typeof ShieldCheck;
};

const retentionMessage =
  "Un proveedor no puede configurarse simultaneamente como agente de retencion y agente de percepcion.";

const perceptionMessage =
  "Un proveedor no puede configurarse simultaneamente como agente de percepcion y agente de retencion.";

const foreignMessage =
  "Un proveedor no domiciliado no debe mezclarse con condiciones tributarias nacionales.";

const detractionWarning =
  "Revisar si esta combinacion aplica segun la operacion tributaria.";

const taxConditionOptions: TaxConditionOption[] = [
  {
    name: "detractionAgent",
    title: "Sujeto a detraccion",
    subtitle: "Aplica obligaciones de detraccion en compras.",
    icon: Receipt,
  },
  {
    name: "foreignAgent",
    title: "Proveedor no domiciliado",
    subtitle: "Para proveedores extranjeros.",
    icon: Globe2,
  },
  {
    name: "retainerAgent",
    title: "Agente de retencion",
    subtitle: "Habilita tratamiento de retenciones.",
    icon: ShieldCheck,
  },
  {
    name: "perceptionAgent",
    title: "Agente de percepcion",
    subtitle: "Habilita tratamiento de percepciones.",
    icon: WalletCards,
  },
];

function TaxSwitch({
  active,
  disabled,
}: {
  active: boolean;
  disabled: boolean;
}) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition ${
        disabled
          ? "border-secondary/10 bg-muted"
          : active
            ? "border-accent bg-accent"
            : "border-secondary/20 bg-white"
      }`}
      aria-hidden="true"
    >
      <span
        className={`inline-block size-4 rounded-full bg-white shadow-sm transition ${
          active ? "translate-x-4" : "translate-x-0.5"
        } ${disabled ? "bg-muted-foreground/30" : ""}`}
      />
    </span>
  );
}

function setFlag(
  setValue: UseFormSetValue<SuppliersFormValues>,
  name: TaxConditionName,
  value: boolean,
) {
  setValue(name, value, {
    shouldDirty: true,
    shouldTouch: true,
    shouldValidate: true,
  });
}

function getDisabledReason(
  name: TaxConditionName,
  values: Record<TaxConditionName, boolean>,
) {
  if (values.foreignAgent && name !== "foreignAgent") {
    return foreignMessage;
  }

  if (name === "foreignAgent") {
    if (values.detractionAgent) {
      return "No se puede marcar proveedor no domiciliado cuando esta sujeto a detraccion.";
    }
    if (values.retainerAgent || values.perceptionAgent) {
      return "No se puede marcar proveedor no domiciliado si ya es agente nacional.";
    }
    return undefined;
  }

  if (name === "retainerAgent" && values.perceptionAgent) {
    return retentionMessage;
  }

  if (name === "perceptionAgent" && values.retainerAgent) {
    return perceptionMessage;
  }

  return undefined;
}

export function AgentsSection({
  control,
  setValue,
}: {
  control: Control<SuppliersFormValues>;
  setValue: UseFormSetValue<SuppliersFormValues>;
}) {
  const values = useWatch({
    control,
    name: [
      "detractionAgent",
      "foreignAgent",
      "retainerAgent",
      "perceptionAgent",
    ],
  });

  const flags: Record<TaxConditionName, boolean> = {
    detractionAgent: Boolean(values?.[0]),
    foreignAgent: Boolean(values?.[1]),
    retainerAgent: Boolean(values?.[2]),
    perceptionAgent: Boolean(values?.[3]),
  };

  useEffect(() => {
    if (!flags.foreignAgent) return;

    ([
      "detractionAgent",
      "retainerAgent",
      "perceptionAgent",
    ] as TaxConditionName[]).forEach((name) => {
      if (flags[name]) setFlag(setValue, name, false);
    });
  }, [
    flags.detractionAgent,
    flags.foreignAgent,
    flags.perceptionAgent,
    flags.retainerAgent,
    setValue,
  ]);

  useEffect(() => {
    if (flags.retainerAgent && flags.perceptionAgent) {
      setFlag(setValue, "perceptionAgent", false);
    }
  }, [flags.perceptionAgent, flags.retainerAgent, setValue]);

  const hasForeignHelp = flags.foreignAgent;
  const hasDetractionWarning =
    flags.detractionAgent && (flags.retainerAgent || flags.perceptionAgent);
  const hasAnyFlag = Object.values(flags).some(Boolean);
  const blockedReasons = taxConditionOptions
    .map((option) => getDisabledReason(option.name, flags))
    .filter(Boolean);
  const uniqueBlockedReason = Array.from(new Set(blockedReasons))[0];

  function handleToggle(name: TaxConditionName, checked: boolean) {
    if (!checked) {
      setFlag(setValue, name, false);
      return;
    }

    if (name === "foreignAgent") {
      setFlag(setValue, "foreignAgent", true);
      setFlag(setValue, "detractionAgent", false);
      setFlag(setValue, "retainerAgent", false);
      setFlag(setValue, "perceptionAgent", false);
      return;
    }

    if (name === "retainerAgent") {
      setFlag(setValue, "retainerAgent", true);
      setFlag(setValue, "perceptionAgent", false);
      setFlag(setValue, "foreignAgent", false);
      return;
    }

    if (name === "perceptionAgent") {
      setFlag(setValue, "perceptionAgent", true);
      setFlag(setValue, "retainerAgent", false);
      setFlag(setValue, "foreignAgent", false);
      return;
    }

    if (name === "detractionAgent") {
      setFlag(setValue, "detractionAgent", true);
      setFlag(setValue, "foreignAgent", false);
      return;
    }

    setFlag(setValue, name, true);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {taxConditionOptions.map((option) => {
          const active = flags[option.name];
          const disabledReason = getDisabledReason(option.name, flags);
          const disabled = Boolean(disabledReason);
          const Icon = option.icon;

          return (
            <button
              type="button"
              key={option.name}
              title={disabledReason}
              disabled={disabled}
              onClick={() => handleToggle(option.name, !active)}
              className={`group flex h-[112px] flex-col rounded-lg border p-3 transition ${
                disabled
                  ? "cursor-not-allowed border-secondary/10 bg-muted/60 opacity-70"
                  : active
                    ? "cursor-pointer border-accent/30 bg-primary-degrad/60 ring-1 ring-accent/20"
                    : "cursor-pointer border-secondary/10 bg-white hover:border-primary/30 hover:bg-primary-degrad/30"
              }`}
            >
              <span className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-lg p-2 ${
                    active
                      ? "bg-accent/10 text-accent"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex items-center gap-2">
                  {active ? (
                    <BadgeCheck className="size-4 shrink-0 text-accent" />
                  ) : null}
                  <TaxSwitch active={active} disabled={disabled} />
                </span>
              </span>

              <span className="mt-2 block min-w-0">
                <span
                  className={`block text-left text-sm font-semibold ${
                    disabled ? "text-muted-foreground" : "text-secondary"
                  }`}
                >
                  {option.title}
                </span>
                <span className="mt-1 block text-left text-xs leading-4 text-muted-foreground">
                  {option.subtitle}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {hasAnyFlag || uniqueBlockedReason ? (
        <div className="min-h-[44px]">
          {hasForeignHelp ? (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-degrad/60 p-3 text-sm text-secondary">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{foreignMessage}</span>
            </div>
          ) : uniqueBlockedReason ? (
            <div className="flex items-start gap-2 rounded-lg border border-secondary/10 bg-muted/60 p-3 text-sm text-secondary">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{uniqueBlockedReason}</span>
            </div>
          ) : hasDetractionWarning ? (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-degrad/50 p-3 text-sm text-secondary">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{detractionWarning}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
